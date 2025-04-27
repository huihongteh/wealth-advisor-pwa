// src/pages/ViewNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ViewNotePage.module.css';
import Spinner from '../components/Spinner';
import ActionSheet from '../components/ActionSheet';
import BackButton from '../components/BackButton'; // <-- Import BackButton
import MoreOptionsButton from '../components/MoreOptionsButton'; // <-- Import MoreOptionsButton

// --- Dummy Data Section ---
const DUMMY_CLIENT_DETAILS = {
  c1: { name: 'Aaron Smith' }, c2: { name: 'Betty Jones' }, c3: { name: 'Charles Williams' },
  c4: { name: 'Diana Brown' }, c5: { name: 'Edward Davis' },
};
const DUMMY_MEETING_NOTES = {
  c1: [ { noteId: 'n101', date: '2023-10-26', summary: 'Portfolio Review, Risk Adjustment discussion.', nextSteps: 'Send updated risk profile form.' }, { noteId: 'n102', date: '2023-07-11', summary: 'Initial planning call. Discussed goals.', nextSteps: 'Gather financial documents.' }, ],
  c2: [ { noteId: 'n201', date: '2023-09-15', summary: 'Planning Call, Next Steps Defined.', nextSteps: 'Draft initial financial plan. Schedule follow-up.' }, ],
  c3: [ { noteId: 'n301', date: '2023-11-01', summary: 'Quick check-in call.', nextSteps: 'None immediately.' }, ],
};
// --- End Dummy Data ---

function ViewNotePage() {
  // State
  const [note, setNote] = useState(null);
  const [clientName, setClientName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // For update message

  // Hooks
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To receive update message

  // --- Effect to Fetch Note Details ---
  useEffect(() => {
    setIsLoading(true); setError(''); setSuccessMessage('');
    console.log(`Fetching note ID: ${noteId} for client ID: ${clientId}`);
    // Simulate API Fetch
    setTimeout(() => {
      const client = DUMMY_CLIENT_DETAILS[clientId];
      const clientNotes = DUMMY_MEETING_NOTES[clientId] || [];
      const foundNote = clientNotes.find(n => n.noteId === noteId);
      if (client && foundNote) {
        setNote(foundNote); setClientName(client.name); setIsLoading(false);
      } else {
        setError(`Meeting note with ID ${noteId} for client ${clientId} not found.`); setIsLoading(false); console.error("Note or client not found:", clientId, noteId);
      }
    }, 500);
  }, [clientId, noteId]);

  // --- Effect to Handle Incoming Success Messages (from editing) ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // --- Handlers ---
  const handleEdit = () => {
    console.log("Navigating to edit page:", `/client/${clientId}/note/${noteId}/edit`);
    navigate(`/client/${clientId}/note/${noteId}/edit`);
  };

  const handleDeleteNote = () => {
    if (!note || !window.confirm(`Are you sure you want to delete this note from ${note.date}? This action cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeleting(true); setError('');
    console.log(`Attempting to delete note ID: ${noteId} for client ID: ${clientId}`);
    // Simulate API Delete
    setTimeout(() => {
      try {
        console.log('Note deleted successfully (Simulated)');
        // TODO: Delete from dummy data if needed
        // const noteIndex = DUMMY_MEETING_NOTES[clientId]?.findIndex(n => n.noteId === noteId);
        // if (noteIndex > -1) DUMMY_MEETING_NOTES[clientId].splice(noteIndex, 1);
        setIsDeleting(false);
        navigate(`/client/${clientId}`, { replace: true, state: { message: 'Note deleted successfully.' } });
      } catch (apiError) {
        console.error('Failed to delete note (Simulated):', apiError);
        setError('Failed to delete note. Please try again.'); setIsDeleting(false); handleCloseActionSheet();
      }
    }, 1000);
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  // Define actions for the ActionSheet
  const sheetActions = [
      { label: 'Edit Note', onClick: () => { handleCloseActionSheet(); handleEdit(); }, disabled: isDeleting },
      { label: 'Delete Note', onClick: handleDeleteNote, destructive: true, disabled: isDeleting },
    ];

  // --- Render Logic ---
  if (isLoading) { return <Spinner />; }

  if (error && !isDeleting) {
    return (
      <div className={`${styles.viewNotePage} ${styles.errorContainer}`}>
        <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Back" /> {/* Use BackButton */}
        <div className={styles.error}> <strong>Error Loading Note</strong> <p>{error}</p> </div>
      </div>
    );
  }
  if (!note && !isLoading) {
    return (
      <div className={`${styles.viewNotePage} ${styles.errorContainer}`}>
         <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Back" /> {/* Use BackButton */}
         <div className={styles.error}> <p>Note data could not be found.</p> </div>
      </div>
    );
  }

  // --- Main Page Content ---
  return (
    <div className={styles.viewNotePage}>

      {/* --- Use BackButton Component --- */}
      <BackButton to={`/client/${clientId}`} label="Client Details" />

      {/* Display Flash Success Message */}
      {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}

      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
            <h2>Meeting Note: {note ? note.date : '...'}</h2>
            <div className={styles.clientContext}>Client: {clientName || '...'}</div>
        </div>
        <div className={styles.headerActions}>
             {/* --- Use MoreOptionsButton Component --- */}
             <MoreOptionsButton
                onClick={handleOpenActionSheet}
                disabled={!note || isDeleting}
                ariaLabel="More note options"
             />
        </div>
      </div>

      {/* Display delete error specifically */}
       {error && isDeleting && (<div className={styles.inlineError}>{error}</div>)}

      {/* Note Content */}
      {note ? (
        <div className={styles.noteContent}>
          <div className={styles.contentSection}>
            <h3>Topics Discussed / Summary</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}> {note.summary || <em>No summary provided.</em>} </p>
          </div>
          <div className={styles.contentSection}>
            <h3>Action Items / Next Steps</h3>
            <p style={{ whiteSpace: 'pre-wrap' }}> {note.nextSteps || <em>No next steps recorded.</em>} </p>
          </div>
        </div>
      ) : ( <Spinner/> ) }

      {/* --- Action Sheet Component --- */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={handleCloseActionSheet}
        actions={sheetActions}
      />
    </div>
  );
}
export default ViewNotePage;