// src/pages/AddClientPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AddClientPage.module.css';
import BackButton from '../components/BackButton';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for error handling

// --- REMOVED Dummy Data ---

function AddClientPage() {
  const navigate = useNavigate();
  const auth = useAuth(); // For potential logout

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // State for UI feedback
  const [isSaving, setIsSaving] = useState(false); // Renamed from isLoading
  const [error, setError] = useState('');

  // handleCancel removed - BackButton handles it

  const handleSubmit = async (event) => { // <-- Make async
    event.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('Client Name is required.');
      return;
    }
    setIsSaving(true); // Indicate saving

    const newClient = {
      name: name.trim(),
      email: email.trim() || null, // Send null if empty
      phone: phone.trim() || null, // Send null if empty
    };

    console.log('AddClientPage: Submitting New Client:', newClient);

    try {
        // --- Call Backend API to Save Client ---
        const savedClient = await apiClient('/clients', 'POST', newClient);
        console.log('AddClientPage: Client saved successfully via API', savedClient);
        // No need for setIsSaving(false) - navigating away

        // Navigate back to client list with success message
        navigate('/', { state: { message: `Client ${savedClient.name} added successfully.` } });

    } catch (apiError) {
        // --- Handle API Error ---
        console.error('AddClientPage: Failed to save client:', apiError);
        // Use specific message from API if available (like duplicate email)
        setError(apiError.message || 'Failed to save client. Please try again.');
        setIsSaving(false); // Stop saving indicator on error

        // Handle token errors specifically
        if (apiError.status === 401 || apiError.status === 403) {
             console.log("AddClientPage: Auth error during save, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
        // API returns 409 for duplicate email, message is already set above
    }
  };

  return (
    <div className={styles.addClientPage}>

        {/* Use BackButton Component for Cancel */}
        <BackButton to="/" label="Cancel" />

      <h2>Add New Client</h2>

      <form onSubmit={handleSubmit} className={styles.clientForm}>
        {/* Client Name Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientName">Client Name:</label>
          <input
            type="text"
            id="clientName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isSaving} // Disable while saving
            placeholder="e.g., John Doe"
          />
        </div>

        {/* Client Email Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientEmail">Email:</label>
          <input
            type="email"
            id="clientEmail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSaving} // Disable while saving
            placeholder="e.g., john.doe@example.com"
          />
        </div>

        {/* Client Phone Input */}
        <div className={styles.formGroup}>
          <label htmlFor="clientPhone">Phone:</label>
          <input
            type="tel"
            id="clientPhone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={isSaving} // Disable while saving
            placeholder="e.g., 555-123-4567"
          />
        </div>

        {/* Error Display */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={isSaving} // Disable while saving
          >
            {isSaving ? 'Saving...' : 'Save Client'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default AddClientPage;