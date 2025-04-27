// src/pages/ClientDetailPage.js
import React, { useState, useEffect } from 'react';
import {
    useParams,
    useNavigate,
    Link,
    useLocation
} from 'react-router-dom';
import styles from './ClientDetailPage.module.css';
import Spinner from '../components/Spinner';
import ActionSheet from '../components/ActionSheet';
import BackButton from '../components/BackButton';
import MoreOptionsButton from '../components/MoreOptionsButton';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import apiClient from '../utils/apiClient'; // <-- Import API client
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for logout on error

// --- REMOVED Dummy Data ---

function ClientDetailPage() {
  // --- State ---
  // Combined state for client details and their notes
  const [clientData, setClientData] = useState(null);

  // UI/Action States
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // General page errors (fetch)
  const [actionError, setActionError] = useState(''); // Errors specific to actions (delete)
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);

  // --- Hooks ---
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth(); // For potential logout on auth errors

  // --- Effect to Fetch Client Details and Notes ---
  useEffect(() => {
    const fetchClientData = async () => {
        setIsLoading(true);
        setError(''); // Clear general error
        setActionError(''); // Clear action error
        setSuccessMessage(''); // Clear success message
        console.log(`ClientDetailPage: Fetching data for client ID: ${clientId}`);

        try {
            // Use apiClient to fetch combined client and notes data
            const data = await apiClient(`/clients/${clientId}`); // GET /api/clients/:id
            setClientData(data); // Includes client details and notes array
            console.log("ClientDetailPage: Data fetched successfully", data);
        } catch (err) {
            console.error("ClientDetailPage: Failed to fetch client data:", err);
            setError(err.message || 'Failed to load client details.'); // Set general error

            // Handle token errors
            if (err.status === 401 || err.status === 403) {
                 console.log("ClientDetailPage: Auth error detected, logging out.");
                 setTimeout(() => auth.logout(), 1500);
            }
            // If client specifically not found by API (404), setError handles it
        } finally {
            setIsLoading(false);
        }
    };

    fetchClientData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]); // Re-run if clientId changes

  // --- Effect to Handle Incoming Success Messages ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);


  // --- Handlers ---
  const handleAddNote = () => navigate(`/client/${clientId}/add-note`);

  const handleDeleteClient = async () => { // <-- Make async
    // Use clientData from state
    if (!clientData || !window.confirm(`Are you sure you want to delete client ${clientData.name}? This will also delete all associated meeting notes and cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeletingClient(true);
    setActionError(''); // Clear previous action errors
    console.log(`ClientDetailPage: Attempting to delete client ID: ${clientId}`);

    try {
        // Call API DELETE /api/clients/:id
        await apiClient(`/clients/${clientId}`, 'DELETE');
        console.log('ClientDetailPage: Client deleted successfully via API');
        // No need for setIsDeletingClient(false) here, navigating away
        // Navigate back to main client list with success message
        navigate('/', { state: { message: `Client ${clientData.name} deleted successfully.` } });
    } catch (err) {
        console.error('ClientDetailPage: Failed to delete client:', err);
        setActionError(err.message || 'Failed to delete client. Please try again.'); // Set action-specific error
        setIsDeletingClient(false); // Stop loading on error
        handleCloseActionSheet(); // Close sheet on error
         // Handle token errors specifically
        if (err.status === 401 || err.status === 403) {
             console.log("ClientDetailPage: Auth error during delete, logging out.");
             setTimeout(() => auth.logout(), 1500);
        }
    }
     // No finally block needed for setIsDeletingClient as success navigates away
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  const handleEditClient = () => {
      console.log("ClientDetailPage: Navigating to edit client page:", `/client/${clientId}/edit`);
      navigate(`/client/${clientId}/edit`);
  };

  // Define actions for the ActionSheet component
  const sheetActions = [
    { label: 'Edit Client', onClick: () => { handleCloseActionSheet(); handleEditClient(); }, disabled: isDeletingClient },
    { label: 'Delete Client', onClick: handleDeleteClient, destructive: true, disabled: isDeletingClient },
  ];


  // --- Render Logic ---
  if (isLoading) {
    return ( // Wrap spinner for consistent layout
        <div className={styles.clientDetailPageContainer}>
            <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
            <div className={styles.scrollContentCentered}> <Spinner /> </div>
        </div>
    );
  }
  // Show general fetch error (if not actively trying to delete)
  if (error && !isDeletingClient) {
     return (
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
          <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
          <div className={styles.scrollContentCentered}>
              <div className={styles.error}> <strong>Error Loading Client Data</strong> <p>{error}</p> </div>
          </div>
       </div>
     );
  }
  // Fallback if loading finished but data is still null (should be caught by error usually)
  if (!clientData && !isLoading) {
    return (
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
           <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
            <div className={styles.scrollContentCentered}>
                <div className={styles.error}> <p>Client data could not be loaded.</p> </div>
            </div>
       </div>
    );
  }


  // --- Main Page Content (Requires clientData to exist) ---
  return (
    <div className={styles.clientDetailPageContainer}>

        {/* Fixed Content Wrapper */}
        <div className={styles.fixedContent}>
            {/* Back Button */}
            <BackButton to="/" label="Clients" />

            {/* Flash Success Message */}
            {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}
            {/* Action-specific Error Message (e.g., delete failure) */}
            {actionError && (<div className={styles.inlineError}>{actionError}</div>)}

            {/* Client Header */}
            <div className={styles.clientHeader}>
                 {/* Check clientData before rendering */}
                {clientData && (
                <>
                    <div className={styles.avatarContainer}>
                        <AvatarPlaceholder name={clientData.name} size={60} />
                    </div>
                    <div className={styles.headerContent}>
                        <h2>{clientData.name}</h2>
                        <div className={styles.contactInfo}>
                            {clientData.email && <span>Email: {clientData.email}</span>}
                            {clientData.phone && <span>Phone: {clientData.phone}</span>}
                        </div>
                    </div>
                    <div className={styles.headerActions}>
                        <MoreOptionsButton
                            onClick={handleOpenActionSheet}
                            disabled={!clientData || isDeletingClient}
                            ariaLabel="More client options"
                        />
                    </div>
                </>
                )}
            </div>

            {/* Add Note Button */}
            {clientData && (
                <div className={styles.actions}>
                    <button onClick={handleAddNote} className={styles.addNoteButton}>
                        + Add New Meeting Note for {clientData.name}
                    </button>
                </div>
            )}
             {/* Notes List Header (Fixed) */}
              <div className={styles.notesSectionHeader}>
                 <h3>Recent Meetings</h3>
              </div>
        </div>
        {/* End Fixed Content Wrapper */}


        {/* Scrollable Notes Area */}
        <div className={styles.notesScrollArea}>
            {/* Check clientData and clientData.notes before rendering */}
            {clientData && clientData.notes && clientData.notes.length > 0 ? (
    <ul className={styles.notesList}>
        {clientData.notes.map((note) => {
            // --- ADD THIS LOG ---
            console.log("ClientDetailPage - Mapping Note:", note);
            // --- END LOG ---
            return (
                <li key={note.noteId} className={styles.noteItem}>
                    {/* Check the value of note.noteId used below */}
                    <Link to={`/client/${clientId}/note/${note.noteId}`} className={styles.noteLink}>
                        <div className={styles.noteDate}>{note.date}</div>
                        <div className={styles.noteSummary}>{note.summary}</div>
                    </Link>
                </li>
            );
        })}
    </ul>
) : (
                 // Show message only if not loading and no error occurred
                 !isLoading && !error && <p className={styles.noResults}>No meeting notes recorded yet.</p>
            )}
        </div>
        {/* End Scrollable Notes Area */}


      {/* Action Sheet */}
      <ActionSheet
        isOpen={isActionSheetOpen}
        onClose={handleCloseActionSheet}
        actions={sheetActions}
      />

    </div> // End clientDetailPageContainer
  );
}
export default ClientDetailPage;