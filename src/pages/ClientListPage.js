// src/pages/ClientListPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ClientListPage.module.css';
import Spinner from '../components/Spinner';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

function ClientListPage() {
  // State
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // Effect for loading client data
  useEffect(() => {
    let isMounted = true;
    const fetchClients = async () => {
       if(isMounted) setIsLoading(true);
      setError('');
      try {
        console.log(`ClientListPage: Fetching clients (Refresh Key: ${refreshKey})`);
        const data = await apiClient('/clients');
         if (isMounted) setClients(data || []);
      } catch (err) {
        console.error("ClientListPage: Failed to fetch clients:", err);
         if (isMounted) {
            setError(err.message || 'Failed to load clients.');
            if (err.status === 401 || err.status === 403) { setTimeout(() => auth.logout(), 1500); }
         }
      } finally {
         if (isMounted) setIsLoading(false);
      }
    };
    fetchClients();
    return () => { isMounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, auth]); // Removed location.state dependency here

  // Effect for handling success messages & triggering refresh
   useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      if (location.state?.refresh) {
          console.log("ClientListPage: Refresh triggered by location state.");
          setRefreshKey(prevKey => prevKey + 1);
      }
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]); // Depend only on location.state

  // Filtering Logic
  const filteredClients = clients.filter(client =>
    client && client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handlers
  const handleAddClient = () => navigate('/add-client');
  const handleClearSearch = () => setSearchTerm(''); // Simple clear for search

  // --- Render Logic ---
  return (
    <div className={styles.clientListPageContainer}>
        {/* Header Area */}
        <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Clients</h1>
            <button onClick={handleAddClient} className={styles.addButtonTopRight} aria-label="Add New Client">
                +
            </button>
        </div>

        {/* Search Bar Area */}
        <div className={styles.searchContainer}>
             <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
              {/* Show clear button only if there is search text */}
              {searchTerm && (
                  <button onClick={handleClearSearch} className={styles.clearSearchButton} aria-label="Clear search">
                     ✕
                  </button>
              )}
        </div>

      {/* Display Flash Success Message */}
      {successMessage && (<div className={styles.successMessage}>{successMessage}</div>)}
      {/* Display Fetch Error Message */}
      {error && !isLoading && <div className={styles.inlineError}>{error}</div>}

      {/* List Area */}
      <div className={styles.listScrollArea}>
            {isLoading ? (
                <div style={{padding: '40px', textAlign: 'center'}}><Spinner /></div>
            ) : (
            <>
                {filteredClients.length > 0 ? (
                <ul className={styles.clientList}>
                    {filteredClients.map((client) => (
                    <li key={client.id} className={styles.clientListItem}>
                        <Link to={`/client/${client.id}`} className={styles.clientLink}>
                            <AvatarPlaceholder name={client?.name || '?'} size={48} /> {/* Slightly smaller avatar */}
                            <div className={styles.clientInfo}>
                                <span className={styles.clientName}>{client.name || 'Unnamed Client'}</span>
                                {/* --- DISPLAY lastContact --- */}
                                {/* Check if client.lastContact exists and has a value */}
                                {client.lastContact ? (
                                    <span className={styles.lastContact}>Last Contact: {client.lastContact}</span>
                                ) : (
                                    <span className={styles.lastContactMuted}>No contact recorded</span> // Optional different style
                                )}
                                {/* --- END DISPLAY --- */}
                            </div>
                            {/* Chevron accessory */}
                            <span className={styles.listItemAccessory}>›</span>
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : (
                    // Updated Empty State Logic
                     <div className={styles.emptyStateContainer}>
                        {searchTerm ? ( // If user is searching
                            <>
                                <span className={styles.emptyIcon}>🤷</span>
                                <p>No clients match your search for "{searchTerm}".</p>
                                <button onClick={handleClearSearch} className={styles.emptyStateButton}>
                                    Clear Search
                                </button>
                            </>
                        ) : !error ? ( // If no search term AND no error loading
                            <>
                                <span className={styles.emptyIcon}>👥</span>
                                <p>You haven't added any clients yet.</p>
                                <button onClick={handleAddClient} className={styles.emptyStateButton}>
                                    Add Your First Client
                                </button>
                            </>
                        ) : null } {/* Don't show "no clients" message if there was an error */}
                    </div>
                )}
            </>
            )}
        </div>
        {/* End List Area */}
    </div>
  );
}
export default ClientListPage;