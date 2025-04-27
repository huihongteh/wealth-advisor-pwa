// src/pages/ViewNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ViewNotePage.module.css';
import Spinner from '../components/Spinner';
import ActionSheet from '../components/ActionSheet';
import BackButton from '../components/BackButton';
import MoreOptionsButton from '../components/MoreOptionsButton';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for error handling

// --- REMOVED Dummy Data ---

function ViewNotePage() {
  // --- State ---
  const [note, setNote] = useState(null); // State to hold the fetched note
  const [clientName, setClientName] = useState(''); // Keep client name for context (can fetch separately or pass)

  // UI/Action States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // General page fetch error
  const [actionError, setActionError] = useState(''); // Specific delete error
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(''); // For messages from Edit page

  // --- Hooks ---
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation(); // To receive success message
  const auth = useAuth(); // For potential logout

  console.log("ViewNotePage Params:", { clientId, noteId });

  // --- Effect to Fetch Specific Note Details ---
  useEffect(() => {
    const fetchNote = async () => {
        setIsLoading(true);
        setError('');
        setActionError('');
        setSuccessMessage(''); // Clear messages on load
        console.log(`ViewNotePage: Fetching note ID: ${noteId} for client ID: ${clientId}`);

        try {
            // Fetch the specific note
            const noteData = await apiClient(`/clients/${clientId}/notes/${noteId}`); // GET /api/clients/:clientId/notes/:noteId
            setNote(noteData);
            console.log("ViewNotePage: Note fetched successfully", noteData);

            // Optional: Fetch client name if not passed via state (less efficient but simple)
            // Alternatively, pass clientName via route state when navigating from ClientDetailPage
            try {
                const clientDetails = await apiClient(`/clients/${clientId}`); // Fetch client details too
                setClientName(clientDetails?.name || `Client ${clientId}`);
            } catch (clientError) {
                 console.warn("ViewNotePage: Could not fetch client name for context", clientError);
                 setClientName(`Client ${clientId}`); // Fallback name
            }

        } catch (err) {
            console.error("ViewNotePage: Failed to fetch note:", err);
            setError(err.message || 'Failed to load note details.'); // Set general fetch error

            // Handle token errors
            if (err.status === 401 || err.status === 403) {
                 console.log("ViewNotePage: Auth error detected, logging out.");
                 setTimeout(() => auth.logout(), 1500);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Ensure IDs are valid before fetching
    if (clientId && noteId) {
        fetchNote();
    } else {
        setError("Invalid Client or Note ID in URL.");
        setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, noteId]); // Re-run if IDs change

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
    navigate(`/client/${clientId}/note/${noteId}/edit`);
  };

  const handleDeleteNote = async () => { // <-- Make async
    if (!note || !window.confirm(`Are you sure you want to delete this note from ${note.date}? This action cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeleting(true);
    setActionError(''); // Clear previous action error
    console.log(`ViewNotePage: Attempting to delete note ID: ${noteId} for client ID: ${clientId}`);

    try {
        // Call API DELETE /api/clients/:clientId/notes/:noteId
        await apiClient(`/clients/${clientId}/notes/${noteId}`, 'DELETE');
        console.log('ViewNotePage: Note deleted successfully via API');
        // No need for setIsDeleting(false), navigating away
        navigate(
            `/client/${clientId}`, // Navigate back to client detail
            { replace: true, state: { message: 'Note deleted successfully.' } }
        );
    } catch (err) {
        console.error('ViewNotePage: Failed to delete note:', err);
        setActionError(err.message || 'Failed to delete note. Please try again.'); // Set action-specific error
        setIsDeleting(false); // Stop loading on error
        handleCloseActionSheet(); // Close sheet on error
        // Handle token errors specifically
        if (err.status === 401 || err.status === 403) {
             console.log("ViewNotePage: Auth error during delete, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
    }
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  // Define actions for the ActionSheet
  const sheetActions = [
      { label: 'Edit Note', onClick: () => { handleCloseActionSheet(); handleEdit(); }, disabled: isDeleting },
      { label: 'Delete Note', onClick: handleDeleteNote, destructive: true, disabled: isDeleting },
    ];

  // --- Render Logic ---
  if (isLoading) {
    return ( // Wrap spinner for consistent layout
        <div className={styles.viewNotePageContainer}> {/* Use container class */}
            <div className={styles.fixedContent}> {/* Consistent wrapper */}
                <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Client Details" />
            </div>
            <div className={styles.scrollContentCentered}> <Spinner /> </div>
        </div>
    );
  }
  // Show general fetch error (if not deleting)
  if (error && !isDeleting) {
    return (
      <div className={`${styles.viewNotePageContainer} ${styles.errorContainer}`}>
        <div className={styles.fixedContent}>
            <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Client Details" />
        </div>
        <div className={styles.scrollContentCentered}>
            <div className={styles.error}> <strong>Error Loading Note</strong> <p>{error}</p> </div>
        </div>
      </div>
    );
  }
  // Fallback if loading done but note still null
  if (!note && !isLoading) {
    return (
      <div className={`${styles.viewNotePageContainer} ${styles.errorContainer}`}>
         <div className={styles.fixedContent}>
             <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Client Details" />
         </div>
         <div className={styles.scrollContentCentered}>
             <div className={styles.error}> <p>Note data could not be found.</p> </div>
         </div>
      </div>
    );
  }

  // --- Main Page Content ---
  return (
    // Use container for potential future layout adjustments if needed
    <div className={styles.viewNotePage}>

      {/* Use BackButton Component */}
      <BackButton to={`/client/${clientId}`} label="Client Details" />

      {/* Display Flash Success Message */}
      {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}

      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerInfo}>
            <h2>Meeting Note: {note ? note.date : '...'}</h2> {/* Use API date format */}
            <div className={styles.clientContext}>Client: {clientName || '...'}</div>
        </div>
        <div className={styles.headerActions}>
             <MoreOptionsButton
                onClick={handleOpenActionSheet}
                disabled={!note || isDeleting} // Disable if no note or deleting
                ariaLabel="More note options"
             />
        </div>
      </div>

      {/* Display action error specifically if it occurred */}
       {actionError && (<div className={styles.inlineError}>{actionError}</div>)}

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
      ) : (
         // Should be handled by loading/error states, but added spinner as fallback
         <div style={{padding: '40px', textAlign: 'center'}}><Spinner /></div>
      )}


      {/* Action Sheet Component */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={handleCloseActionSheet}
        actions={sheetActions}
      />
    </div> // End .viewNotePage div
  );
}
export default ViewNotePage;