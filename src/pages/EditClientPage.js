// src/pages/EditClientPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './EditClientPage.module.css';
import Spinner from '../components/Spinner';
import BackButton from '../components/BackButton';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth

// --- REMOVED Dummy Data ---

function EditClientPage() {
  const { clientId } = useParams();
  const navigate = useNavigate();
  const auth = useAuth(); // For potential logout

  // State for form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  // State for UI feedback
  const [isLoading, setIsLoading] = useState(true); // Loading initial data
  const [isSaving, setIsSaving] = useState(false);  // Saving changes
  const [error, setError] = useState('');           // General fetch/save errors
  const [originalName, setOriginalName] = useState(''); // Store original name for title

  // --- Effect to Fetch Existing Client Data ---
  useEffect(() => {
    let isMounted = true;
    const fetchClient = async () => {
        setIsLoading(true);
        setError('');
        console.log(`EditClientPage: Fetching client ID: ${clientId} for editing`);

        try {
            // --- Fetch data from API ---
            const clientDetails = await apiClient(`/clients/${clientId}`);
            if (isMounted) {
                // Populate form state
                setName(clientDetails.name || '');
                setEmail(clientDetails.email || '');
                setPhone(clientDetails.phone || '');
                setOriginalName(clientDetails.name || ''); // Store original name
                console.log("EditClientPage: Client data fetched", clientDetails);
            }
        } catch (err) {
            console.error("EditClientPage: Failed to fetch client:", err);
             if (isMounted) {
                setError(err.message || 'Failed to load client details for editing.');
                 // Handle auth errors
                if (err.status === 401 || err.status === 403) {
                    setTimeout(() => auth.logout(), 1500);
                }
            }
        } finally {
             if (isMounted) { setIsLoading(false); }
        }
    };

     if (clientId) {
        fetchClient();
     } else {
        setError("Invalid Client ID.");
        setIsLoading(false);
     }

     return () => { isMounted = false }; // Cleanup
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]); // Re-run if clientId changes

  const handleSubmit = async (event) => { // <-- Make async
    event.preventDefault();
    setError(''); // Clear previous errors
    if (!name.trim()) {
      setError('Client Name is required.');
      return;
    }
    setIsSaving(true); // Indicate saving

    const updatedClientData = {
      name: name.trim(),
      email: email.trim() || null, // Send null if empty
      phone: phone.trim() || null, // Send null if empty
    };

    console.log('EditClientPage: Submitting Updated Client:', updatedClientData);

    try {
        // --- Call Backend API to UPDATE Client ---
        const savedClient = await apiClient(`/clients/${clientId}`, 'PUT', updatedClientData);
        console.log('EditClientPage: Client updated successfully via API', savedClient);
        // No need for setIsSaving(false) - navigating away

        // Navigate back to the Client Detail page after save
        navigate(
            `/client/${clientId}`, // Back to detail page
            { state: { message: 'Client details updated successfully.' } } // Pass success message
        );

    } catch (apiError) {
        // --- Handle API Error ---
        console.error('EditClientPage: Failed to update client:', apiError);
        setError(apiError.message || 'Failed to update client. Please try again.');
        setIsSaving(false); // Stop saving indicator on error

        // Handle token errors specifically
        if (apiError.status === 401 || apiError.status === 403) {
             console.log("EditClientPage: Auth error during save, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
         // API handles 404 (client not found) and 409 (duplicate email)
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return ( // Wrap spinner
        <div className={styles.editClientPage}>
            <div className={styles.fixedContent}> {/* Consistent wrapper */}
                <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Cancel" />
            </div>
            <div style={{textAlign: 'center', padding: '40px'}}><Spinner /></div>
        </div>
    );
  }

  // Show error if initial fetch failed
  if (error && !isSaving) {
     return (
        <div className={styles.editClientPage}>
            <BackButton to={clientId ? `/client/${clientId}` : '/'} label="Cancel" />
            <div className={styles.error}> {/* Use error block style */}
                 <strong>Error Loading Client Data</strong>
                 <p>{error}</p>
            </div>
        </div>
     );
  }

  return (
    <div className={styles.editClientPage}>

        {/* Use BackButton Component for Cancel */}
        <BackButton to={`/client/${clientId}`} label="Cancel" />

      <h2>Edit Client: {originalName || '...'}</h2>

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
          />
        </div>

        {/* Error Display (Show save errors here) */}
        {error && isSaving && <p className={styles.errorMessage}>{error}</p>}

        {/* Action Buttons */}
        <div className={styles.formActions}>
          <button
            type="submit"
            className={`${styles.button} ${styles.saveButton}`}
            disabled={isSaving || isLoading} // Disable if saving or still initial loading
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default EditClientPage;