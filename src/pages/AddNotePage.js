// src/pages/AddNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AddNotePage.module.css';
import BackButton from '../components/BackButton';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for error handling

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = () => {
  const today = new Date();
  // Adjust for timezone offset to prevent potential date shifts
  const offset = today.getTimezoneOffset();
  const adjustedToday = new Date(today.getTime() - (offset*60*1000));
  return adjustedToday.toISOString().split('T')[0]; // Correctly gets local date in YYYY-MM-DD
};

// --- REMOVED Dummy Client Name Data ---

function AddNotePage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth(); // For potential logout

  // State for form fields
  const [meetingDate, setMeetingDate] = useState(getTodayDate());
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');

  // State for UI feedback
  const [isSaving, setIsSaving] = useState(false); // Changed from isLoading
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState(''); // Display client name

  // --- Effect to Fetch Client Name (Optional but good for context) ---
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchClientName = async () => {
        console.log(`AddNotePage: Fetching name for client ID: ${clientId}`);
        try {
            // Fetch minimal client detail just for the name
            const clientDetails = await apiClient(`/clients/${clientId}`); // Assumes endpoint returns name
            if (isMounted) {
                setClientName(clientDetails?.name || `Client ${clientId}`);
            }
        } catch (err) {
             console.warn("AddNotePage: Could not fetch client name for context", err);
             if (isMounted) {
                setClientName(`Client ${clientId}`); // Fallback name
                // Optionally set a page-level error if client fetch fails critically
                 if (err.status === 404) {
                    setError(`Client with ID ${clientId} not found. Cannot add note.`);
                 } else if (err.status === 401 || err.status === 403) {
                    setError("Authentication error fetching client details.");
                    setTimeout(() => auth.logout(), 1500);
                 }
             }
        }
    };
    if (clientId) {
        fetchClientName();
    }
    return () => { isMounted = false }; // Cleanup function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);


  const handleSubmit = async (event) => { // <-- Make async
    event.preventDefault();
    setError('');
    if (!summary.trim() && !nextSteps.trim()) {
        setError('Please enter either a summary or next steps.');
        return;
    }
    // Prevent submission if client fetch failed earlier
    if (!clientName.startsWith('Client ID:') && error.includes('not found')) {
        setError(`Client with ID ${clientId} not found. Cannot add note.`);
        return;
    }

    setIsSaving(true); // Indicate saving process

    const newNote = {
      meetingDate: meetingDate,
      summary: summary.trim(),
      nextSteps: nextSteps.trim(),
    };

    console.log('AddNotePage: Submitting New Note:', newNote);

    try {
        // --- Call Backend API to Save Note ---
        const savedNote = await apiClient(`/clients/${clientId}/notes`, 'POST', newNote);
        console.log('AddNotePage: Note saved successfully via API', savedNote);
        // No need for setIsSaving(false) - navigating away
        // Navigate back to the client detail page after successful save
        // Pass success message? Optional, maybe just seeing the note is enough.
        navigate(`/client/${clientId}`);

    } catch (apiError) {
        // --- Handle API Error ---
        console.error('AddNotePage: Failed to save note:', apiError);
        setError(apiError.message || 'Failed to save note. Please try again.');
        setIsSaving(false); // Stop saving indicator on error

        // Handle token errors specifically
        if (apiError.status === 401 || apiError.status === 403) {
             console.log("AddNotePage: Auth error during save, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
        // Handle case where client ID became invalid between page load and submit?
        if (apiError.status === 404 && apiError.message.includes('Client not found')) {
             setError(`Client with ID ${clientId} not found. Cannot add note.`);
        }
    }
     // Removed finally block as success navigates away
  };

  return (
    <div className={styles.addNotePage}>

        {/* Use BackButton for Cancel */}
        <BackButton to={`/client/${clientId}`} label="Cancel" />

      <h2>Add New Meeting Note</h2>
      {/* Show Loading indicator for client name? */}
      <div className={styles.clientContext}>
         For Client: <strong>{clientName || 'Loading...'}</strong>
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

        {/* Error Display */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={isSaving || !!error.includes('not found')} // Disable if saving or client fetch failed
          >
            {isSaving ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddNotePage;