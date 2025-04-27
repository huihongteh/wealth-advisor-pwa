// src/pages/ClientDetailPage.js
import React, { useState, useEffect } from 'react';
import {
    useParams,
    useNavigate,
    Link,
    useLocation
} from 'react-router-dom';
import styles from './ClientDetailPage.module.css';
import Spinner from '../components/Spinner';
import ActionSheet from '../components/ActionSheet';
import BackButton from '../components/BackButton'; // <-- Import BackButton
import MoreOptionsButton from '../components/MoreOptionsButton'; // <-- Import MoreOptionsButton

// --- Dummy Data Section (Replace with API calls) ---
const DUMMY_CLIENT_DETAILS = {
  c1: { name: 'Aaron Smith', email: 'aaron.smith@example.com', phone: '555-1111' },
  c2: { name: 'Betty Jones', email: 'betty.j@example.com', phone: '555-2222' },
  c3: { name: 'Charles Williams', email: 'cwilliams@mail.com', phone: '555-3333' },
  c4: { name: 'Diana Brown', email: 'diana.b@sample.net', phone: '555-4444' },
  c5: { name: 'Edward Davis', email: 'ed.davis@domain.org', phone: '555-5555' },
};

const DUMMY_MEETING_NOTES = {
  c1: [ { noteId: 'n101', date: '2023-10-26', summary: 'Portfolio Review, Risk Adjustment discussion.', nextSteps: 'Send updated risk profile form.' }, { noteId: 'n102', date: '2023-07-11', summary: 'Initial planning call. Discussed goals.', nextSteps: 'Gather financial documents.' }, ],
  c2: [ { noteId: 'n201', date: '2023-09-15', summary: 'Planning Call, Next Steps Defined.', nextSteps: 'Draft initial financial plan. Schedule follow-up.' }, ],
  c3: [ { noteId: 'n301', date: '2023-11-01', summary: 'Quick check-in call.', nextSteps: 'None immediately.' }, ],
};
// --- End Dummy Data ---


function ClientDetailPage() {
  // State for data
  const [client, setClient] = useState(null);
  const [notes, setNotes] = useState([]);

  // State for UI feedback & actions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // Hooks
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // --- Effect to Fetch Client Details and Notes ---
  useEffect(() => {
    setIsLoading(true);
    setError('');
    setSuccessMessage(''); // Clear message on load
    console.log("Fetching data for client ID:", clientId);

    // Simulate API Fetch
    setTimeout(() => {
      const clientDetails = DUMMY_CLIENT_DETAILS[clientId];
      const clientNotes = DUMMY_MEETING_NOTES[clientId] || [];

      if (clientDetails) {
        setClient(clientDetails);
        setNotes(clientNotes);
        setIsLoading(false);
      } else {
        setError(`Client with ID ${clientId} not found.`);
        setIsLoading(false);
        console.error("Client not found:", clientId);
      }
    }, 500);

  }, [clientId]);

  // --- Effect to Handle Incoming Success Messages ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  // --- Handlers ---
  const handleAddNote = () => {
    navigate(`/client/${clientId}/add-note`);
  };

  const handleDeleteClient = () => {
    if (!client || !window.confirm(`Are you sure you want to delete client ${client.name}? This will also delete all associated meeting notes and cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeletingClient(true); setError('');
    console.log(`Attempting to delete client ID: ${clientId}`);
    setTimeout(() => { // Simulate API Delete Call
      try {
        console.log('Client deleted successfully (Simulated)');
        // TODO: Delete actual dummy data if needed for better simulation
        // delete DUMMY_CLIENT_DETAILS[clientId];
        // delete DUMMY_MEETING_NOTES[clientId];
        setIsDeletingClient(false);
        navigate('/', { state: { message: `Client ${client.name} deleted successfully.` } });
      } catch (apiError) {
        console.error('Failed to delete client (Simulated):', apiError);
        setError('Failed to delete client. Please try again.');
        setIsDeletingClient(false); handleCloseActionSheet();
      }
    }, 1000);
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  const handleEditClient = () => {
      console.log("Navigating to edit client page:", `/client/${clientId}/edit`);
      navigate(`/client/${clientId}/edit`); // Navigate to the edit route
  };

  // Define actions for the ActionSheet component
  const sheetActions = [
    { label: 'Edit Client', onClick: () => { handleCloseActionSheet(); handleEditClient(); }, disabled: isDeletingClient },
    { label: 'Delete Client', onClick: handleDeleteClient, destructive: true, disabled: isDeletingClient },
  ];


  // --- Render Logic ---
  if (isLoading) { return <Spinner />; }

  if (error && !isDeletingClient) {
     return (
       <div className={`${styles.clientDetailPage} ${styles.errorContainer}`}>
          <BackButton to="/" label="Clients" /> {/* Use BackButton */}
          <div className={styles.error}>
              <strong>Error Loading Client Data</strong> <p>{error}</p>
          </div>
       </div>
     );
  }
  if (!client && !isLoading) {
    return (
       <div className={`${styles.clientDetailPage} ${styles.errorContainer}`}>
            <BackButton to="/" label="Clients" /> {/* Use BackButton */}
            <div className={styles.error}> <p>Client data could not be loaded.</p> </div>
       </div>
    );
  }

  // --- Main Page Content ---
  return (
    <div className={styles.clientDetailPage}>

      {/* --- Use BackButton Component --- */}
      <BackButton to="/" label="Clients" />

      {/* Display Flash Success Message */}
      {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}
      {/* Display delete error specifically */}
       {error && isDeletingClient && (<div className={styles.inlineError}>{error}</div>)}

      {/* Client Header Section */}
      <div className={styles.clientHeader}>
        {client && (
          <>
            <div className={styles.headerContent}>
              <h2>{client.name}</h2>
              <div className={styles.contactInfo}>
                {client.email && <span>Email: {client.email}</span>}
                {client.phone && <span>Phone: {client.phone}</span>}
              </div>
            </div>
            <div className={styles.headerActions}>
                 {/* --- Use MoreOptionsButton Component --- */}
                 <MoreOptionsButton
                    onClick={handleOpenActionSheet}
                    disabled={!client || isDeletingClient}
                    ariaLabel="More client options"
                 />
            </div>
          </>
        )}
      </div>

      {/* Add Note Action Button */}
      {client && (
        <div className={styles.actions}>
          <button onClick={handleAddNote} className={styles.addNoteButton}>
            + Add New Meeting Note for {client.name}
          </button>
        </div>
      )}

      {/* Meeting Notes Section */}
      <div className={styles.notesSection}>
        <h3>Recent Meetings</h3>
        {notes.length > 0 ? (
          <ul className={styles.notesList}>
            {notes.map((note) => (
              <li key={note.noteId} className={styles.noteItem}>
                 <Link to={`/client/${clientId}/note/${note.noteId}`} className={styles.noteLink}>
                    <div className={styles.noteDate}>{note.date}</div>
                    <div className={styles.noteSummary}>{note.summary}</div>
                 </Link>
              </li>
            ))}
          </ul>
        ) : ( <p>No meeting notes recorded for this client yet.</p> )}
      </div>

      {/* --- Action Sheet Component --- */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={handleCloseActionSheet}
        actions={sheetActions}
      />

    </div>
  );
}
export default ClientDetailPage;