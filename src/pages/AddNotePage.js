// src/pages/AddNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './AddNotePage.module.css';
import BackButton from '../components/BackButton'; // <-- Import BackButton

// Helper
const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// --- Dummy Data ---
const DUMMY_CLIENT_NAMES = { c1: 'Aaron Smith', c2: 'Betty Jones', c3: 'Charles Williams', c4: 'Diana Brown', c5: 'Edward Davis', };
// --- End Dummy Data ---

function AddNotePage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  // State
  const [meetingDate, setMeetingDate] = useState(getTodayDate());
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Renamed from isSaving for consistency
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');

  // Fetch client name
  useEffect(() => {
      const name = DUMMY_CLIENT_NAMES[clientId] || `Client ID: ${clientId}`;
      setClientName(name);
  }, [clientId]);

  // handleCancel removed

  const handleSubmit = (event) => {
    event.preventDefault(); setError('');
    if (!summary.trim() && !nextSteps.trim()) { setError('Please enter either a summary or next steps.'); return; }
    setIsLoading(true); // Use isLoading

    const newNote = { clientId: clientId, date: meetingDate, summary: summary, nextSteps: nextSteps, };
    console.log('Submitting New Note:', newNote);

    // Simulate API Call
    setTimeout(() => {
      try {
        console.log('Note saved successfully (Simulated)');
        // TODO: Add note to dummy data if needed for simulation
        setIsLoading(false);
        navigate(`/client/${clientId}`); // Navigate back on success
      } catch (apiError) {
        console.error('Failed to save note (Simulated):', apiError);
        setError('Failed to save note. Please try again.'); setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className={styles.addNotePage}>

        {/* --- Use BackButton Component for Cancel --- */}
        <BackButton to={`/client/${clientId}`} label="Cancel" />

      <h2>Add New Meeting Note</h2>
      <div className={styles.clientContext}> For Client: <strong>{clientName}</strong> </div>

      <form onSubmit={handleSubmit} className={styles.noteForm}>
        {/* Date Input */}
        <div className={styles.formGroup}>
          <label htmlFor="meetingDate">Meeting Date:</label>
          <input type="date" id="meetingDate" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required disabled={isLoading}/>
        </div>
        {/* Summary Text Area */}
        <div className={styles.formGroup}>
          <label htmlFor="summary">Topics Discussed / Summary:</label>
          <textarea id="summary" rows="6" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Enter key discussion points..." disabled={isLoading}/>
        </div>
        {/* Next Steps Text Area */}
        <div className={styles.formGroup}>
          <label htmlFor="nextSteps">Action Items / Next Steps:</label>
          <textarea id="nextSteps" rows="4" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="Enter action items..." disabled={isLoading}/>
        </div>
        {/* Error Display */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Note'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddNotePage;