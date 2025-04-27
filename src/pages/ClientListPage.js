// src/pages/ClientListPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ClientListPage.module.css'; // Import CSS module
import Spinner from '../components/Spinner'; // Import Spinner component

// --- Dummy Data ---
const DUMMY_CLIENTS = [
  { id: 'c1', name: 'Aaron Smith', lastContact: '2023-10-26' },
  { id: 'c2', name: 'Betty Jones', lastContact: '2023-09-15' },
  { id: 'c3', name: 'Charles Williams', lastContact: '2023-11-01' },
  { id: 'c4', name: 'Diana Brown', lastContact: '2023-08-10' },
  { id: 'c5', name: 'Edward Davis', lastContact: '2023-11-05' },
  { id: 'c6', name: 'Fiona Garcia', lastContact: null },
];
// --- End Dummy Data ---

function ClientListPage() {
  // State for data & loading
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hooks
  const navigate = useNavigate();
  const location = useLocation();

  // State for UI feedback
  const [successMessage, setSuccessMessage] = useState('');

  // --- Filter States (Keep state, hide UI elements) ---
  const [searchTerm, setSearchTerm] = useState('');
  // const [filterStartDate, setFilterStartDate] = useState(''); // Keep state if needed later
  // const [filterEndDate, setFilterEndDate] = useState('');     // Keep state if needed later
  // const [isAdvancedFilterVisible, setIsAdvancedFilterVisible] = useState(false); // Keep state if needed later
  // --- End Filter States ---

  // Effect for loading initial client data
  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setClients(DUMMY_CLIENTS);
      setIsLoading(false);
    }, 500);
  }, []);

  // Effect for handling success messages
   useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  // --- Filtering Logic (Simplified back to just name search for now) ---
  const filteredClients = clients.filter(client => {
    const nameMatch = client.name.toLowerCase().includes(searchTerm.toLowerCase());
    // Add date filter logic back here if UI is re-introduced
    return nameMatch;
  });
  // --- End Filtering Logic ---

  // --- Handlers ---
  const handleAddClient = () => navigate('/add-client');

  // --- Render Logic ---
  return (
    // Use a container div that doesn't have excessive padding if header/search are full-width
    <div className={styles.clientListPageContainer}>

        {/* --- NEW Header Area --- */}
        <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Clients</h1> {/* Changed h2 to h1 for semantic correctness */}
            <button
                onClick={handleAddClient}
                className={styles.addButtonTopRight}
                aria-label="Add New Client"
            >
                +
            </button>
        </div>
        {/* --- End Header Area --- */}

        {/* --- NEW Search Bar Area --- */}
        <div className={styles.searchContainer}>
             {/* Optional: Add icon inside or as background */}
             <input
                type="text"
                placeholder="Search" // Simplified placeholder
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
        </div>
         {/* --- End Search Bar Area --- */}


      {/* Display Flash Success Message if present - Position adjusted */}
      {successMessage && (
          <div className={styles.successMessage}>
              {successMessage}
          </div>
      )}

      {/* Loading State or Client List */}
      {isLoading ? (
        // Add padding if spinner needs it, or style spinner container
        <div style={{padding: '20px'}}><Spinner /></div>
      ) : (
        // Add padding/margin to the list container itself now
        <ul className={styles.clientList}>
          {filteredClients.length > 0 ? (
            filteredClients.map((client) => (
              <li key={client.id} className={styles.clientListItem}>
                <Link to={`/client/${client.id}`} className={styles.clientLink}>
                   {/* TODO: Add Avatar/Placeholder Here */}
                   <div className={styles.avatarPlaceholder}></div>
                   <div className={styles.clientInfo}>
                      <span className={styles.clientName}>{client.name}</span>
                      {/* Simplified display for demo */}
                      {client.lastContact &&
                        <span className={styles.lastContact}>Last Contact: {client.lastContact}</span>
                      }
                   </div>
                   {/* TODO: Add indicator like pin/unread count here */}
                   {/* <span className={styles.listItemAccessory}> > </span> */}
                </Link>
              </li>
            ))
          ) : (
            <p className={styles.noResults}>
                {searchTerm ? 'No clients match your search.' : 'No clients found.'}
            </p>
          )}
        </ul>
      )}
    </div> // Close .clientListPageContainer div
  );
}

export default ClientListPage;