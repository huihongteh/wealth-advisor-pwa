// src/pages/ViewNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import styles from './ViewNotePage.module.css';
import Spinner from '../components/Spinner';
import ActionSheet from '../components/ActionSheet';
import BackButton from '../components/BackButton';
import MoreOptionsButton from '../components/MoreOptionsButton';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

// --- REMOVED Dummy Data ---

function ViewNotePage() {
  // State
  const [note, setNote] = useState(null);
  const [clientName, setClientName] = useState(''); // Keep for context display
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState(''); // Specific delete error
  const [isDeleting, setIsDeleting] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // <-- State to trigger refresh

  // Hooks
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // --- Effect to Fetch Specific Note Details ---
  useEffect(() => {
    let isMounted = true;
    const fetchNote = async () => {
        // Only start loading if not already loading (prevents flicker on refreshKey change)
        if(isMounted) setIsLoading(true);
        setError(''); setActionError(''); setSuccessMessage(''); // Clear messages on load/refresh
        console.log(`ViewNotePage: Fetching note ID: ${noteId} for client ID: ${clientId} (Refresh Key: ${refreshKey})`);

        try {
            const noteData = await apiClient(`/clients/${clientId}/notes/${noteId}`);
            if (isMounted) {
                setNote(noteData);
                console.log("ViewNotePage: Note fetched successfully", noteData);
                // Optionally fetch client name again if needed, or rely on initial fetch
                if (!clientName) { // Fetch client name only if not already set
                     try {
                         const clientDetails = await apiClient(`/clients/${clientId}`);
                         if (isMounted) setClientName(clientDetails?.name || `Client ${clientId}`);
                     } catch (clientError) {
                          console.warn("ViewNotePage: Could not fetch client name", clientError);
                          if (isMounted) setClientName(`Client ${clientId}`);
                     }
                }
            }
        } catch (err) {
            console.error("ViewNotePage: Failed to fetch note:", err);
            if (isMounted) setError(err.message || 'Failed to load note details.');
            if (err.status === 401 || err.status === 403) {
                 if (isMounted) setTimeout(() => auth.logout(), 1500);
            }
        } finally {
             if (isMounted) setIsLoading(false);
        }
    };

    if (clientId && noteId) { fetchNote(); }
    else { setError("Invalid Client or Note ID."); setIsLoading(false); }

    return () => { isMounted = false; }; // Cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, noteId, refreshKey, auth]); // <-- Add refreshKey dependency

  // --- Effect to Handle Incoming Success Messages & Trigger Refresh ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
       // If a message indicates a successful update/add, trigger refresh
      if (location.state?.refresh) {
          console.log("ViewNotePage: Refresh triggered by location state.");
          setRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch
      }
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title); // Clear state
      return () => clearTimeout(timer);
    }
  }, [location.state]); // Depends on location.state


  // --- Handlers ---
  const handleEdit = () => {
    navigate(`/client/${clientId}/note/${noteId}/edit`);
  };

  const handleDeleteNote = async () => {
    if (!note || !window.confirm(`Are you sure you want to delete this note from ${note.date}? This action cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeleting(true); setActionError('');
    console.log(`ViewNotePage: Attempting to delete note ID: ${noteId} for client ID: ${clientId}`);
    try {
        await apiClient(`/clients/${clientId}/notes/${noteId}`, 'DELETE');
        console.log('ViewNotePage: Note deleted successfully via API');
        // Navigate back to client detail WITH refresh flag
        navigate( `/client/${clientId}`, { replace: true, state: { refresh: true, message: 'Note deleted successfully.' } } );
    } catch (err) {
        console.error('ViewNotePage: Failed to delete note:', err);
        setActionError(err.message || 'Failed to delete note.'); setIsDeleting(false); handleCloseActionSheet();
        if (err.status === 401 || err.status === 403) { setTimeout(() => auth.logout(), 1500); }
    }
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  const sheetActions = [
      { label: 'Edit Note', onClick: () => { handleCloseActionSheet(); handleEdit(); }, disabled: isDeleting },
      { label: 'Delete Note', onClick: handleDeleteNote, destructive: true, disabled: isDeleting },
    ];

  // --- Render Logic ---
  if (isLoading) {
    return (
        <div className={styles.viewNotePageContainer}>
            <div className={styles.fixedContent}>
                 <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Client Details" />
             </div>
            <div className={styles.scrollContentCentered}> <Spinner /> </div>
        </div>
    );
  }
  // Show general fetch error only if not deleting
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
    // Using viewNotePage class directly, no extra container needed here usually
    <div className={styles.viewNotePage}>

      {/* Use BackButton Component */}
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
             <MoreOptionsButton
                onClick={handleOpenActionSheet}
                disabled={!note || isDeleting}
                ariaLabel="More note options"
             />
        </div>
      </div>

      {/* Display action error specifically */}
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
         // Show spinner if note somehow becomes null after initial load
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