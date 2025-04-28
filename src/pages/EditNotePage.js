// src/pages/EditNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditNotePage.module.css';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for error handling

// --- REMOVED Dummy Data ---

function EditNotePage() {
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth(); // For potential logout

  // State for form fields
  const [meetingDate, setMeetingDate] = useState('');
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  // State for UI feedback & context
  const [isLoading, setIsLoading] = useState(true); // Loading initial data
  const [isSaving, setIsSaving] = useState(false);  // Saving changes
  const [error, setError] = useState('');           // General fetch/save errors
  const [clientName, setClientName] = useState(''); // Store client name for context

  // --- Effect to Fetch Existing Note Data ---
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchNoteAndClient = async () => {
        setIsLoading(true);
        setError('');
        console.log(`EditNotePage: Fetching note ID: ${noteId} for client ID: ${clientId}`);

        try {
            // Fetch the specific note
            const noteData = await apiClient(`/clients/${clientId}/notes/${noteId}`);
            if (isMounted) {
                 // Populate form state with fetched data
                setMeetingDate(noteData.date || ''); // Use fetched date
                setSummary(noteData.summary || '');
                setNextSteps(noteData.nextSteps || '');
                console.log("EditNotePage: Note data fetched", noteData);
            }

            // Fetch client name for context (can be optimized by passing state)
            try {
                const clientDetails = await apiClient(`/clients/${clientId}`);
                if (isMounted) {
                     setClientName(clientDetails?.name || `Client ${clientId}`);
                }
            } catch (clientError) {
                 console.warn("EditNotePage: Could not fetch client name", clientError);
                 if (isMounted) setClientName(`Client ${clientId}`);
            }

        } catch (err) {
            console.error("EditNotePage: Failed to fetch note:", err);
             if (isMounted) {
                setError(err.message || 'Failed to load note details for editing.');
                // Handle auth errors
                if (err.status === 401 || err.status === 403) {
                    setTimeout(() => auth.logout(), 1500);
                }
            }
        } finally {
            // Only stop loading if the component is still mounted
             if (isMounted) {
                setIsLoading(false);
             }
        }
    };

    if (clientId && noteId) {
        fetchNoteAndClient();
    } else {
        setError("Invalid Client or Note ID in URL.");
        setIsLoading(false);
    }

    // Cleanup function
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, noteId]); // Re-run if IDs change


  const handleSubmit = async (event) => { // <-- Make async
    event.preventDefault();
    setError(''); // Clear previous errors before saving
    if (!summary.trim() && !nextSteps.trim()) {
        setError('Please enter either a summary or next steps.');
        return;
    }
    setIsSaving(true); // Indicate saving process

    const updatedNoteData = {
      meetingDate: meetingDate,
      summary: summary.trim(),
      nextSteps: nextSteps.trim(),
    };

    console.log('EditNotePage: Submitting Updated Note:', updatedNoteData);

    try {
        // --- Call Backend API to UPDATE Note ---
        const savedNote = await apiClient(`/clients/${clientId}/notes/${noteId}`, 'PUT', updatedNoteData);
        console.log('EditNotePage: Note updated successfully via API', savedNote);
        // No need for setIsSaving(false), navigating away

        // Navigate back to the View Note page after successful save
        navigate(
          `/client/${clientId}/note/${noteId}`, // Navigate back to VIEW note first
          {
              replace: true, // Optional
              // Pass message to View page, View page needs refresh handling too
              state: { refresh: true, message: 'Note updated successfully.' }
          }
      );

    } catch (apiError) {
        // --- Handle API Error ---
        console.error('EditNotePage: Failed to update note:', apiError);
        setError(apiError.message || 'Failed to update note. Please try again.');
        setIsSaving(false); // Stop saving indicator on error

        // Handle token errors specifically
        if (apiError.status === 401 || apiError.status === 403) {
             console.log("EditNotePage: Auth error during save, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
         // Handle case where note/client became invalid
        if (apiError.status === 404) {
             setError(`Note or Client not found. Cannot update.`);
        }
        if (apiError.status === 403) {
             setError(`Forbidden: You may not have permission to edit this note.`);
        }
    }
  };


  // --- Render Logic ---
  if (isLoading) {
    return ( // Wrap spinner
        <div className={styles.editNotePage}>
             <div className={styles.fixedContent}> {/* Use a consistent wrapper if needed */}
                 <BackButton to={clientId && noteId ? `/client/${clientId}/note/${noteId}` : (clientId ? `/client/${clientId}`: '/')} label="Cancel" />
             </div>
            <div style={{textAlign: 'center', padding: '40px'}}><Spinner /></div>
        </div>
    );
  }

  // Show error if initial fetch failed
  if (error && !isSaving) { // Only show fetch error if not currently trying to save
     return (
        <div className={styles.editNotePage}>
            <BackButton to={clientId && noteId ? `/client/${clientId}/note/${noteId}` : (clientId ? `/client/${clientId}`: '/')} label="Cancel" />
            {/* Use general error style block */}
            <div className={styles.error}>
                 <strong>Error Loading Note Data</strong>
                 <p>{error}</p>
            </div>
        </div>
     );
  }

  return (
    <div className={styles.editNotePage}>

        {/* Use BackButton Component for Cancel */}
        <BackButton to={`/client/${clientId}/note/${noteId}`} label="Cancel" />

      <h2>Edit Meeting Note</h2>
      <div className={styles.clientContext}>
         For Client: <strong>{clientName || '...'}</strong> (Note Date: {meetingDate})
      </div>

      <form onSubmit={handleSubmit} className={styles.noteForm}>
        {/* Date Input */}
        <div className={styles.formGroup}>
          <label htmlFor="meetingDate">Meeting Date:</label>
          <input
            type="date"
            id="meetingDate"
            value={meetingDate}
            onChange={(e) => setMeetingDate(e.target.value)}
            required
            disabled={isSaving} // Disable while saving
          />
        </div>

        {/* Summary Text Area */}
        <div className={styles.formGroup}>
          <label htmlFor="summary">Topics Discussed / Summary:</label>
          <textarea
            id="summary"
            rows="6"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter key discussion points, decisions made, etc."
            disabled={isSaving} // Disable while saving
          />
        </div>

        {/* Next Steps Text Area */}
        <div className={styles.formGroup}>
          <label htmlFor="nextSteps">Action Items / Next Steps:</label>
          <textarea
            id="nextSteps"
            rows="4"
            value={nextSteps}
            onChange={(e) => setNextSteps(e.target.value)}
            placeholder="Enter action items for you or the client."
            disabled={isSaving} // Disable while saving
          />
        </div>

        {/* Error Display (Show save errors here) */}
        {error && isSaving && <p className={styles.errorMessage}>{error}</p>}

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={isSaving || isLoading} // Disable if saving or initial load ongoing
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default EditNotePage;