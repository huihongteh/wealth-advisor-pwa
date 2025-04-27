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
import BackButton from '../components/BackButton';
import MoreOptionsButton from '../components/MoreOptionsButton';
import AvatarPlaceholder from '../components/AvatarPlaceholder'; // Make sure this is imported

// --- Dummy Data Section (Replace with API calls) ---
const DUMMY_CLIENT_DETAILS = {
  c1: { name: 'Aaron Smith', email: 'aaron.smith@example.com', phone: '555-1111' },
  c2: { name: 'Betty Jones', email: 'betty.j@example.com', phone: '555-2222' },
  c3: { name: 'Charles Williams', email: 'cwilliams@mail.com', phone: '555-3333' },
  c4: { name: 'Diana Brown', email: 'diana.b@sample.net', phone: '555-4444' },
  c5: { name: 'Edward Davis', email: 'ed.davis@domain.org', phone: '555-5555' },
};

// Add more notes to test scrolling
const DUMMY_MEETING_NOTES = {
  c1: [
    { noteId: 'n101', date: '2023-10-26', summary: 'Portfolio Review, Risk Adjustment discussion.', nextSteps: 'Send updated risk profile form.' },
    { noteId: 'n102', date: '2023-07-11', summary: 'Initial planning call. Discussed goals.', nextSteps: 'Gather financial documents.' },
    { noteId: 'n103', date: '2023-05-01', summary: 'Market update call.', nextSteps: 'Monitor specific index.' },
    { noteId: 'n104', date: '2023-02-15', summary: 'Tax planning session.', nextSteps: 'Client to provide accountant details.' },
    { noteId: 'n105', date: '2022-12-01', summary: 'End of year review.', nextSteps: 'Prepare for next year.' },
    { noteId: 'n106', date: '2022-10-05', summary: 'Check-in regarding previous action item.', nextSteps: 'Action completed.' },
    { noteId: 'n107', date: '2022-08-20', summary: 'Discussion on alternative investments.', nextSteps: 'Provide research materials.' },
  ],
  c2: [
    { noteId: 'n201', date: '2023-09-15', summary: 'Planning Call, Next Steps Defined.', nextSteps: 'Draft initial financial plan. Schedule follow-up.' },
  ],
  c3: [
    { noteId: 'n301', date: '2023-11-01', summary: 'Quick check-in call.', nextSteps: 'None immediately.' },
  ],
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
    setIsLoading(true); setError(''); setSuccessMessage('');
    console.log("Fetching data for client ID:", clientId);
    // Simulate API Fetch
    setTimeout(() => {
      const clientDetails = DUMMY_CLIENT_DETAILS[clientId];
      const clientNotes = DUMMY_MEETING_NOTES[clientId] || [];
      if (clientDetails) {
        setClient(clientDetails); setNotes(clientNotes); setIsLoading(false);
      } else {
        setError(`Client with ID ${clientId} not found.`); setIsLoading(false); console.error("Client not found:", clientId);
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
  const handleAddNote = () => navigate(`/client/${clientId}/add-note`);

  const handleDeleteClient = () => {
    if (!client || !window.confirm(`Are you sure you want to delete client ${client.name}? This will also delete all associated meeting notes and cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeletingClient(true); setError(''); console.log(`Attempting to delete client ID: ${clientId}`);
    // Simulate API Delete
    setTimeout(() => {
      try {
        console.log('Client deleted successfully (Simulated)');
        // TODO: Delete from dummy data
        setIsDeletingClient(false);
        navigate('/', { state: { message: `Client ${client.name} deleted successfully.` } });
      } catch (apiError) {
        console.error('Failed to delete client (Simulated):', apiError);
        setError('Failed to delete client. Please try again.'); setIsDeletingClient(false); handleCloseActionSheet();
      }
    }, 1000);
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  const handleEditClient = () => {
      console.log("Navigating to edit client page:", `/client/${clientId}/edit`);
      navigate(`/client/${clientId}/edit`);
  };

  const sheetActions = [
    { label: 'Edit Client', onClick: () => { handleCloseActionSheet(); handleEditClient(); }, disabled: isDeletingClient },
    { label: 'Delete Client', onClick: handleDeleteClient, destructive: true, disabled: isDeletingClient },
  ];

  // --- Render Logic ---
  if (isLoading) {
    return ( // Wrap spinner for consistent layout
        <div className={styles.clientDetailPageContainer}>
            <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
            <div className={styles.scrollContentCentered}> <Spinner /> </div>
        </div>
    );
  }
  if (error && !isDeletingClient) {
     return ( // Wrap error for consistent layout
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
          <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
          <div className={styles.scrollContentCentered}>
              <div className={styles.error}> <strong>Error Loading Client Data</strong> <p>{error}</p> </div>
          </div>
       </div>
     );
  }
  if (!client && !isLoading) {
    return ( // Wrap fallback error
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
           <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
            <div className={styles.scrollContentCentered}>
                <div className={styles.error}> <p>Client data could not be loaded.</p> </div>
            </div>
       </div>
    );
  }

  // --- Main Page Content ---
  return (
    <div className={styles.clientDetailPageContainer}>

        {/* Fixed Content Wrapper */}
        <div className={styles.fixedContent}>
            {/* Back Button */}
            <BackButton to="/" label="Clients" />

            {/* Flash Success Message */}
            {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}
            {/* Delete Error Message */}
            {error && isDeletingClient && (<div className={styles.inlineError}>{error}</div>)}

            {/* Client Header */}
            <div className={styles.clientHeader}>
                {client && (
                <>
                    <div className={styles.avatarContainer}>
                        <AvatarPlaceholder name={client.name} size={60} />
                    </div>
                    <div className={styles.headerContent}>
                        <h2>{client.name}</h2>
                        <div className={styles.contactInfo}>
                            {client.email && <span>Email: {client.email}</span>}
                            {client.phone && <span>Phone: {client.phone}</span>}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <MoreOptionsButton
                            onClick={handleOpenActionSheet}
                            disabled={!client || isDeletingClient}
                            ariaLabel="More client options"
                        />
                    </div>
                </>
                )}
            </div>

            {/* Add Note Button */}
            {client && (
                <div className={styles.actions}>
                    <button onClick={handleAddNote} className={styles.addNoteButton}>
                        + Add New Meeting Note for {client.name}
                    </button>
                </div>
            )}
             {/* Notes List Header (Fixed) */}
              <div className={styles.notesSectionHeader}>
                 <h3>Recent Meetings</h3>
              </div>
        </div>
        {/* End Fixed Content Wrapper */}


        {/* Scrollable Notes Area */}
        <div className={styles.notesScrollArea}>
            {/* Removed notesSection div wrapper, header moved to fixed */}
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
            ) : ( <p className={styles.noResults}>No meeting notes recorded yet.</p> )}
        </div>
        {/* End Scrollable Notes Area */}


      {/* Action Sheet (Positioned Fixed) */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={handleCloseActionSheet}
        actions={sheetActions}
      />

    </div> // End clientDetailPageContainer
  );
}
export default ClientDetailPage;