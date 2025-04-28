// src/pages/ClientListPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ClientListPage.module.css';
import Spinner from '../components/Spinner';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import apiClient from '../utils/apiClient';
import { useAuth } from '../context/AuthContext';

function ClientListPage() {
  // State for data & loading
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // State for UI feedback
  const [successMessage, setSuccessMessage] = useState('');
  const [refreshKey, setRefreshKey] = useState(0); // <-- State to trigger refresh

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  // Keep date filter states commented out if UI isn't present
  // const [filterStartDate, setFilterStartDate] = useState('');
  // const [filterEndDate, setFilterEndDate] = useState('');
  // const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);
  // --- End Filter States ---

  // --- Effect for loading client data from API ---
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const fetchClients = async () => {
      // Only set loading true if not already loading (prevents flicker on refreshKey change)
       if(isMounted) setIsLoading(true);
      setError(''); // Clear previous errors on new fetch
      // Don't clear success message here, let the other useEffect handle it
      try {
        console.log(`ClientListPage: Fetching clients (Refresh Key: ${refreshKey})`);
        const data = await apiClient('/clients'); // Call API GET /api/clients
         if (isMounted) {
            setClients(data || []);
            console.log("ClientListPage: Clients fetched successfully", data?.length);
         }
      } catch (err) {
        console.error("ClientListPage: Failed to fetch clients:", err);
         if (isMounted) {
            setError(err.message || 'Failed to load clients.');
            // Handle token errors
            if (err.status === 401 || err.status === 403) {
                 console.log("ClientListPage: Auth error detected, logging out.");
                 setTimeout(() => auth.logout(), 1500);
            }
         }
      } finally {
         if (isMounted) setIsLoading(false); // Stop loading in success or error case
      }
    };

    fetchClients();

    return () => { isMounted = false; } // Cleanup function
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey, auth]); // <-- Include refreshKey and auth in dependency array

  // --- Effect for handling success messages & triggering refresh ---
   useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
       // Trigger re-fetch if refresh flag is set
      if (location.state?.refresh) {
          console.log("ClientListPage: Refresh triggered by location state.");
          setRefreshKey(prevKey => prevKey + 1); // Increment key to trigger fetch effect
      }
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title); // Clear state from history
      return () => clearTimeout(timer);
    }
  }, [location.state]); // Run if location state changes

  // --- Filtering Logic (only by name currently) ---
  const filteredClients = clients.filter(client => {
    // Ensure client and client.name exist before calling toLowerCase
    return client && client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase());
  });
  // --- End Filtering Logic ---

  // --- Handlers ---
  const handleAddClient = () => navigate('/add-client');

  // // Clear search term (and potentially other filters if re-added)
  // const handleClearFilters = () => {
  //     setSearchTerm('');
  //     // setFilterStartDate('');
  //     // setFilterEndDate('');
  //     // setIsAdvancedFilterVisible(false);
  // };

  // Keep toggle handler if advanced filter UI might return
  // const toggleAdvancedFilters = () => { setIsAdvancedFilterVisible(prevState => !prevState); };
  // --- End Handlers ---


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
             {/* Optional: Add Clear Filters Button Here if desired */}
             {/* searchTerm && <button onClick={handleClearFilters} className={styles.clearSearchButton}>X</button> */}
        </div>

      {/* Display Flash Success Message */}
      {successMessage && (
          <div className={styles.successMessage}>
              {successMessage}
          </div>
      )}

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
                            {/* Use Optional Chaining for name passed to Avatar */}
                            <AvatarPlaceholder name={client?.name || '?'} size={50} />
                            <div className={styles.clientInfo}>
                                <span className={styles.clientName}>{client.name || 'Unnamed Client'}</span>
                                {/* Check if lastContact exists */}
                                {client.lastContact &&
                                    <span className={styles.lastContact}>Last Contact: {client.lastContact}</span>
                                }
                            </div>
                        </Link>
                    </li>
                    ))}
                </ul>
                ) : (
                <p className={styles.noResults}>
                    {error ? 'Could not load clients.' : (searchTerm ? 'No clients match your search.' : 'No clients added yet.')}
                </p>
                )}
            </>
            )}
        </div>
        {/* End List Area */}

    </div> // Close .clientListPageContainer div
  );
}

export default ClientListPage;