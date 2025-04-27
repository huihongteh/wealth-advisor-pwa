// src/pages/AddClientPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddClientPage.module.css';
import BackButton from '../components/BackButton'; // <-- Import BackButton

function AddClientPage() {
  const navigate = useNavigate();

  // State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // handleCancel removed

  const handleSubmit = (event) => {
    event.preventDefault(); setError('');
    if (!name.trim()) { setError('Client Name is required.'); return; }
    setIsLoading(true);

    const newClient = { name: name.trim(), email: email.trim(), phone: phone.trim(), };
    console.log('Submitting New Client:', newClient);

    // Simulate API Call
    setTimeout(() => {
      try {
        console.log('Client saved successfully (Simulated)', newClient);
        // TODO: Add to dummy data if needed
        setIsLoading(false);
        // Pass message back to list page
        navigate('/', { state: { message: `Client ${newClient.name} added successfully.` } });
      } catch (apiError) {
        console.error('Failed to save client (Simulated):', apiError);
        setError('Failed to save client. Please try again.'); setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className={styles.addClientPage}>

        {/* --- Use BackButton Component for Cancel --- */}
        <BackButton to="/" label="Cancel" />

      <h2>Add New Client</h2>

      <form onSubmit={handleSubmit} className={styles.clientForm}>
        {/* Client Name Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientName">Client Name:</label>
          <input type="text" id="clientName" value={name} onChange={(e) => setName(e.target.value)} required disabled={isLoading} placeholder="e.g., John Doe"/>
        </div>
        {/* Client Email Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientEmail">Email:</label>
          <input type="email" id="clientEmail" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} placeholder="e.g., john.doe@example.com"/>
        </div>
        {/* Client Phone Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientPhone">Phone:</label>
          <input type="tel" id="clientPhone" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isLoading} placeholder="e.g., 555-123-4567"/>
        </div>
        {/* Error Display */}
        {error && <p className={styles.errorMessage}>{error}</p>}
        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button type="submit" className={`${styles.button} ${styles.saveButton}`} disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddClientPage;