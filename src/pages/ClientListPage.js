// src/pages/ClientListPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ClientListPage.module.css';
import Spinner from '../components/Spinner';
import AvatarPlaceholder from '../components/AvatarPlaceholder';
import apiClient from '../utils/apiClient'; // <-- Import the API client helper
import { useAuth } from '../context/AuthContext'; // <-- Import useAuth for potential error handling

function ClientListPage() {
  // State for data & loading
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(''); // <-- State for fetch errors

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth(); // <-- Get auth context

  // State for UI feedback
  const [successMessage, setSuccessMessage] = useState('');

  // --- Filter States ---
  const [searchTerm, setSearchTerm] = useState('');
  // Keep date filter states if you plan to re-add the UI later
  // const [filterStartDate, setFilterStartDate] = useState('');
  // const [filterEndDate, setFilterEndDate] = useState('');
  // const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false);
  // --- End Filter States ---

  // --- Effect for loading initial client data from API ---
  useEffect(() => {
    const fetchClients = async () => {
      setIsLoading(true);
      setError(''); // Clear previous errors on new fetch
      try {
        console.log("ClientListPage: Fetching clients...");
        const data = await apiClient('/clients'); // Call API GET /api/clients
        setClients(data || []); // Set clients from response, default to empty array
        console.log("ClientListPage: Clients fetched successfully", data?.length);
      } catch (err) {
        console.error("ClientListPage: Failed to fetch clients:", err);
        setError(err.message || 'Failed to load clients.'); // Set error message

        // Handle token errors (e.g., 401 Unauthorized)
        if (err.status === 401 || err.status === 403) {
             console.log("ClientListPage: Auth error detected, logging out.");
             // Optionally show a specific message before logout
             // setError("Your session has expired. Please log in again.");
             // Use setTimeout to allow user to see message briefly?
             setTimeout(() => auth.logout(), 1500); // Logout on auth error
        }
      } finally {
        setIsLoading(false); // Stop loading in success or error case
      }
    };

    fetchClients();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount (Auth context dependency is stable)

  // --- Effect for handling success messages (from delete client, add client) ---
   useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title); // Clear state from history
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // --- Filtering Logic (only by name currently) ---
  const filteredClients = clients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Add date/other filter logic here if needed later
    return nameMatch;
  });
  // --- End Filtering Logic ---

  // --- Handlers ---
  const handleAddClient = () => navigate('/add-client');

  // Clear only search term for now
  // const handleClearFilters = () => {
  //     setSearchTerm('');
  //     // Clear date filters too if they were active
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
        </div>

        {/* --- REMOVED Toggle Button & Advanced Filter Section --- */}
        {/* Keep clear button if needed, maybe alongside search */}
        {/* <button onClick={handleClearFilters} className={styles.clearButton}> Clear </button> */}


      {/* Display Flash Success Message */}
      {successMessage && (
          <div className={styles.successMessage}>
              {successMessage}
          </div>
      )}

       {/* --- Display Fetch Error Message --- */}
       {error && !isLoading && <div className={styles.inlineError}>{error}</div>}


        {/* --- List Area (Handles Loading/Empty/Data states) --- */}
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
                        <AvatarPlaceholder name={client.name} size={50} />
                        <div className={styles.clientInfo}>
                            <span className={styles.clientName}>{client.name}</span>
                            {/* Use API data - check if field exists */}
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
        {/* --- End List Area --- */}

    </div> // Close .clientListPageContainer div
  );
}

export default ClientListPage;