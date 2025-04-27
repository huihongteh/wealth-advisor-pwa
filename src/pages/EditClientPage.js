// src/pages/EditClientPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditClientPage.module.css';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton'; // <-- Import BackButton

// --- Dummy Data (Moved OUTSIDE) ---
const DUMMY_CLIENT_DETAILS = { c1: { name: 'Aaron Smith', email: 'aaron.smith@example.com', phone: '555-1111' }, c2: { name: 'Betty Jones', email: 'betty.j@example.com', phone: '555-2222' }, c3: { name: 'Charles Williams', email: 'cwilliams@mail.com', phone: '555-3333' }, c4: { name: 'Diana Brown', email: 'diana.b@sample.net', phone: '555-4444' }, c5: { name: 'Edward Davis', email: 'ed.davis@domain.org', phone: '555-5555' }, };
// --- End Dummy Data ---

function EditClientPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();

  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [originalName, setOriginalName] = useState('');

  // Fetch existing data
  useEffect(() => {
    setIsLoading(true); setError('');
    setTimeout(() => { // Simulate fetch
      const clientDetails = DUMMY_CLIENT_DETAILS[clientId];
      if (clientDetails) {
        setName(clientDetails.name); setEmail(clientDetails.email); setPhone(clientDetails.phone); setOriginalName(clientDetails.name); setIsLoading(false);
      } else {
        setError(`Could not load client (ID: ${clientId}) for editing.`); setIsLoading(false);
      }
    }, 500);
  }, [clientId]);

  const handleSubmit = (event) => {
    event.preventDefault(); setError('');
    if (!name.trim()) { setError('Client Name is required.'); return; }
    setIsSaving(true);

    const updatedClientData = { name: name.trim(), email: email.trim(), phone: phone.trim(), };
    console.log('Submitting Updated Client:', updatedClientData);

    // Simulate API Update
    setTimeout(() => {
      try {
        // --- Update Dummy Data (Optional) ---
        if (DUMMY_CLIENT_DETAILS[clientId]) { DUMMY_CLIENT_DETAILS[clientId] = { ...DUMMY_CLIENT_DETAILS[clientId], ...updatedClientData }; console.log('Dummy client data updated:', DUMMY_CLIENT_DETAILS[clientId]); }
        // --- End Update ---
        console.log('Client update successful (Simulated)'); setIsSaving(false);
        navigate( `/client/${clientId}`, { state: { message: 'Client details updated successfully.' } } );
      } catch (apiError) {
        console.error('Failed to update client (Simulated):', apiError); setError('Failed to update client. Please try again.'); setIsSaving(false);
      }
    }, 1000);
  };

  // Render Logic
  if (isLoading) { return <Spinner />; }

  if (error && !isSaving) {
     return (
        <div className={styles.editClientPage}>
            {/* Use BackButton for Cancel */}
            <BackButton to={`/client/${clientId}`} label="Cancel" />
            <div className={styles.errorMessage}> <p>{error}</p> </div>
        </div>
     );
  }

  return (
    <div className={styles.editClientPage}>

        {/* --- Use BackButton Component for Cancel --- */}
        <BackButton to={`/client/${clientId}`} label="Cancel" />

      <h2>Edit Client: {originalName || '...'}</h2>

      <form onSubmit={handleSubmit} className={styles.clientForm}>
        {/* Name Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientName">Client Name:</label>
          <input type="text" id="clientName" value={name} onChange={(e) => setName(e.target.value)} required disabled={isSaving} />
        </div>
        {/* Email Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientEmail">Email:</label>
          <input type="email" id="clientEmail" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSaving} />
        </div>
        {/* Phone Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientPhone">Phone:</label>
          <input type="tel" id="clientPhone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving} />
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
export default EditClientPage;