// src/pages/EditNotePage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditNotePage.module.css';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton'; // <-- Import BackButton

// --- Dummy Data (Moved OUTSIDE) ---
const DUMMY_CLIENT_DETAILS = { c1: { name: 'Aaron Smith' }, c2: { name: 'Betty Jones' }, c3: { name: 'Charles Williams' }, c4: { name: 'Diana Brown' }, c5: { name: 'Edward Davis' }, };
const DUMMY_MEETING_NOTES = { c1: [ { noteId: 'n101', date: '2023-10-26', summary: 'Portfolio Review, Risk Adjustment discussion.', nextSteps: 'Send updated risk profile form.' }, { noteId: 'n102', date: '2023-07-11', summary: 'Initial planning call. Discussed goals.', nextSteps: 'Gather financial documents.' }, ], c2: [ { noteId: 'n201', date: '2023-09-15', summary: 'Planning Call, Next Steps Defined.', nextSteps: 'Draft initial financial plan. Schedule follow-up.' }, ], c3: [ { noteId: 'n301', date: '2023-11-01', summary: 'Quick check-in call.', nextSteps: 'None immediately.' }, ], };
// --- End Dummy Data ---

function EditNotePage() {
  const { clientId, noteId } = useParams();
  const navigate = useNavigate();

  // State
  const [meetingDate, setMeetingDate] = useState('');
  const [summary, setSummary] = useState('');
  const [nextSteps, setNextSteps] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [clientName, setClientName] = useState('');

  // Fetch existing data
  useEffect(() => {
    setIsLoading(true); setError('');
    setTimeout(() => { // Simulate fetch
      const client = DUMMY_CLIENT_DETAILS[clientId];
      const clientNotes = DUMMY_MEETING_NOTES[clientId] || [];
      const foundNote = clientNotes.find(n => n.noteId === noteId);
      if (client && foundNote) {
        setMeetingDate(foundNote.date); setSummary(foundNote.summary); setNextSteps(foundNote.nextSteps); setClientName(client.name); setIsLoading(false);
      } else {
        setError(`Could not load note (ID: ${noteId}) or client (ID: ${clientId}) for editing.`); setIsLoading(false);
      }
    }, 500);
  }, [clientId, noteId]);

  const handleSubmit = (event) => {
    event.preventDefault(); setError('');
    if (!summary.trim() && !nextSteps.trim()) { setError('Please enter either a summary or next steps.'); return; }
    setIsSaving(true);

    const updatedNoteData = { date: meetingDate, summary: summary, nextSteps: nextSteps, };
    console.log('Submitting Updated Note Data:', updatedNoteData);

    // Simulate API Update
    setTimeout(() => {
      try {
        // --- Update Dummy Data (Optional, for better simulation) ---
        const clientNotes = DUMMY_MEETING_NOTES[clientId];
        if(clientNotes) { const noteIndex = clientNotes.findIndex(n => n.noteId === noteId); if(noteIndex !== -1) { DUMMY_MEETING_NOTES[clientId][noteIndex] = { ...clientNotes[noteIndex], ...updatedNoteData }; console.log('Dummy data updated:', DUMMY_MEETING_NOTES[clientId][noteIndex]); } }
        // --- End Update ---
        console.log('Note update successful (Simulated)'); setIsSaving(false);
        navigate( `/client/${clientId}/note/${noteId}`, { state: { message: 'Note updated successfully.' } } );
      } catch (simulatedError) {
        console.error('Failed to update note (Simulated):', simulatedError); setError('Failed to update note. Please try again.'); setIsSaving(false);
      }
    }, 1000);
  };

  // Render logic
  if (isLoading) { return <Spinner />; }

  if (error && !isSaving) {
     return (
        <div className={styles.editNotePage}>
            {/* Use BackButton for Cancel */}
            <BackButton to={`/client/${clientId}/note/${noteId}`} label="Cancel" />
            <div className={styles.errorMessage}> <p>{error}</p> </div>
        </div>
     );
  }

  return (
    <div className={styles.editNotePage}>

        {/* --- Use BackButton Component for Cancel --- */}
        <BackButton to={`/client/${clientId}/note/${noteId}`} label="Cancel" />

      <h2>Edit Meeting Note</h2>
      <div className={styles.clientContext}> For Client: <strong>{clientName}</strong> (Note Date: {meetingDate}) </div>

      <form onSubmit={handleSubmit} className={styles.noteForm}>
        {/* Date Input */}
        <div className={styles.formGroup}>
          <label htmlFor="meetingDate">Meeting Date:</label>
          <input type="date" id="meetingDate" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required disabled={isSaving}/>
        </div>
        {/* Summary */}
        <div className={styles.formGroup}>
          <label htmlFor="summary">Topics Discussed / Summary:</label>
          <textarea id="summary" rows="6" value={summary} onChange={(e) => setSummary(e.target.value)} placeholder="Enter key discussion points..." disabled={isSaving}/>
        </div>
        {/* Next Steps */}
        <div className={styles.formGroup}>
          <label htmlFor="nextSteps">Action Items / Next Steps:</label>
          <textarea id="nextSteps" rows="4" value={nextSteps} onChange={(e) => setNextSteps(e.target.value)} placeholder="Enter action items..." disabled={isSaving}/>
        </div>
        {/* Error Display */}
        {error && isSaving && <p className={styles.errorMessage}>{error}</p>}
        {/* Actions */}
        <div className={styles.formActions}>
          <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default EditNotePage;