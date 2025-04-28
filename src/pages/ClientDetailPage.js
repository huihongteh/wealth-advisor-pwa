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
import AvatarPlaceholder from '../components/AvatarPlaceholder'; // Make sure this is imported
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

function ClientDetailPage() {
  // State for data
  const [clientData, setClientData] = useState(null); // Holds { ...clientDetails, notes: [...] }

  // State for UI feedback & actions
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // General page errors (fetch)
  const [actionError, setActionError] = useState(''); // Errors specific to actions (delete)
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeletingClient, setIsDeletingClient] = useState(false);
  const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // State to trigger refresh

  // Hooks
  const { clientId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // --- Effect to Fetch Client Details and Notes ---
  useEffect(() => {
    let isMounted = true;
    const fetchClientData = async () => {
        // Only set loading true if not already loading
        if(isMounted && !isLoading) setIsLoading(true);
        // Clear messages/errors on new fetch/refresh
        setError(''); setActionError(''); setSuccessMessage('');
        console.log(`ClientDetailPage: Fetching data for client ID: ${clientId} (Refresh Key: ${refreshKey})`);

        try {
            const data = await apiClient(`/clients/${clientId}`);
            if (isMounted) {
                setClientData(data);
                console.log("ClientDetailPage: Data fetched successfully", data);
            }
        } catch (err) {
            console.error("ClientDetailPage: Failed to fetch client data:", err);
             if (isMounted) {
                setError(err.message || 'Failed to load client details.');
                if (err.status === 401 || err.status === 403) { setTimeout(() => auth.logout(), 1500); }
             }
        } finally {
             if (isMounted) setIsLoading(false);
        }
    };

    if (clientId) { fetchClientData(); }
    else { setError("Invalid Client ID."); setIsLoading(false); }

    return () => { isMounted = false; }; // Cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, refreshKey, auth]); // Run on clientId change OR refreshKey change

  // --- Effect to Handle Incoming Success Messages & Trigger Refresh ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.refresh) {
          console.log("ClientDetailPage: Refresh triggered by location state.");
          setRefreshKey(prevKey => prevKey + 1);
      }
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title); // Clear state from history
      return () => clearTimeout(timer);
    }
  }, [location.state]); // Depends only on location.state


  // --- Handlers ---
  const handleAddNote = () => navigate(`/client/${clientId}/add-note`);

  const handleDeleteClient = async () => {
    if (!clientData || !window.confirm(`Are you sure you want to delete client ${clientData.name}? This will also delete all associated meeting notes and cannot be undone.`)) {
      handleCloseActionSheet(); return;
    }
    setIsDeletingClient(true); setActionError('');
    console.log(`ClientDetailPage: Attempting to delete client ID: ${clientId}`);
    try {
        await apiClient(`/clients/${clientId}`, 'DELETE');
        console.log('ClientDetailPage: Client deleted successfully via API');
        navigate( '/', { state: { refresh: true, message: `Client ${clientData.name} deleted successfully.` } } );
    } catch (err) {
        console.error('ClientDetailPage: Failed to delete client:', err);
        setActionError(err.message || 'Failed to delete client. Please try again.');
        setIsDeletingClient(false); handleCloseActionSheet();
        if (err.status === 401 || err.status === 403) { setTimeout(() => auth.logout(), 1500); }
    }
  };

  const handleOpenActionSheet = () => setIsActionSheetOpen(true);
  const handleCloseActionSheet = () => setIsActionSheetOpen(false);

  const handleEditClient = () => {
      console.log("ClientDetailPage: Navigating to edit client page:", `/client/${clientId}/edit`);
      navigate(`/client/${clientId}/edit`);
  };

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
  if (error && !isDeletingClient) { // Show general fetch error
     return (
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
          <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
          <div className={styles.scrollContentCentered}>
              <div className={styles.error}> <strong>Error Loading Client Data</strong> <p>{error}</p> </div>
          </div>
       </div>
     );
  }
  // Use clientData check AFTER loading/error checks
  if (!clientData) {
    // This case handles when loading is finished but data is still null (e.g., 404 not caught as specific error)
    return (
       <div className={`${styles.clientDetailPageContainer} ${styles.errorContainer}`}>
           <div className={styles.fixedContent}> <BackButton to="/" label="Clients" /> </div>
            <div className={styles.scrollContentCentered}>
                <div className={styles.error}> <p>Client data could not be found or loaded.</p> </div>
            </div>
       </div>
    );
  }

  // --- Main Page Content ---
  return (
    <div className={styles.clientDetailPageContainer}>

        {/* Fixed Content Wrapper */}
        <div className={styles.fixedContent}>
            <BackButton to="/" label="Clients" />
            {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}
            {actionError && (<div className={styles.inlineError}>{actionError}</div>)}

            {/* Client Header */}
            <div className={styles.clientHeader}>
                <div className={styles.avatarContainer}>
                    <AvatarPlaceholder name={clientData.name} size={60} />
                </div>
                <div className={styles.headerContent}>
                    <h2>{clientData.name}</h2>
                    <div className={styles.contactInfo}>
                        {clientData.email && <span>Email: {clientData.email}</span>}
                        {clientData.phone && <span>Phone: {clientData.phone}</span>}
                        {clientData.lastContact ? (
                            <span className={styles.lastContactHeader}>
                                Last Contact: {clientData.lastContact}
                            </span>
                        ) : (
                            <span className={styles.lastContactHeaderMuted}>
                                No contact recorded
                            </span>
                        )}
                    </div>
                </div>
                <div className={styles.headerActions}>
                    <MoreOptionsButton
                        onClick={handleOpenActionSheet}
                        disabled={isDeletingClient} // Disable only if deleting
                        ariaLabel="More client options"
                    />
                </div>
            </div>

            {/* Add Note Button */}
            <div className={styles.actions}>
                <button onClick={handleAddNote} className={styles.addNoteButton}>
                    + Add New Meeting Note for {clientData.name}
                </button>
            </div>
             {/* Notes List Header (Fixed) */}
              <div className={styles.notesSectionHeader}>
                 <h3>Recent Meetings</h3>
              </div>
        </div>
        {/* End Fixed Content Wrapper */}


        {/* Scrollable Notes Area - Use clientData.notes */}
        <div className={styles.notesScrollArea}>
            {clientData.notes && clientData.notes.length > 0 ? (
            <ul className={styles.notesList}>
                {clientData.notes.map((note) => (
                <li key={note.noteId} className={styles.noteItem}>
                    <Link to={`/client/${clientId}/note/${note.noteId}`} className={styles.noteLink}>
                        <div className={styles.noteDate}>{note.date}</div>
                        <div className={styles.noteSummary}>{note.summary}</div>
                    </Link>
                </li>
                ))}
            </ul>
            ) : (
                 // Updated Empty State for notes
                 <div className={styles.emptyStateContainerNotes}>
                     <span className={styles.emptyIcon}>📝</span>
                     <p>No meeting notes recorded yet for {clientData?.name || 'this client'}.</p>
                     {/* Optional Button Here: */}
                     {/* <button onClick={handleAddNote} className={styles.emptyStateButton}>Add First Note</button> */}
                 </div>
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