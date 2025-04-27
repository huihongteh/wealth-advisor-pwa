// src/pages/ClientListPage.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import styles from './ClientListPage.module.css'; // Import CSS module
import Spinner from '../components/Spinner'; // Import Spinner component
import AvatarPlaceholder from '../components/AvatarPlaceholder';

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
    // Main container needs layout adjustments via CSS
    <div className={styles.clientListPageContainer}>

        {/* --- Fixed Header Area --- */}
        <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Clients</h1>
            <button onClick={handleAddClient} className={styles.addButtonTopRight} aria-label="Add New Client">
                +
            </button>
        </div>
        {/* --- End Header Area --- */}

        {/* --- Fixed Search Bar Area --- */}
        <div className={styles.searchContainer}>
             <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
        </div>
         {/* --- End Search Bar Area --- */}

      {/* Display Flash Success Message if present (Stays fixed if above scroll area) */}
      {successMessage && (
          <div className={styles.successMessage}>
              {successMessage}
          </div>
      )}

      {/* --- NEW Scrollable List Area --- */}
      <div className={styles.listScrollArea}>
          {isLoading ? (
            // Spinner needs to be inside scroll area or positioned absolutely
             <div style={{padding: '40px', textAlign: 'center'}}><Spinner /></div>
          ) : (
            <> {/* Use Fragment */}
                {filteredClients.length > 0 ? (
                    <ul className={styles.clientList}>
                        {filteredClients.map((client) => (
                        <li key={client.id} className={styles.clientListItem}>
                            <Link to={`/client/${client.id}`} className={styles.clientLink}>
                            <AvatarPlaceholder name={client.name} size={50} />
                            <div className={styles.clientInfo}>
                                <span className={styles.clientName}>{client.name}</span>
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
                        {searchTerm ? 'No clients match your search.' : 'No clients found.'}
                    </p>
                )}
             </>
          )}
      </div>
      {/* --- End Scrollable List Area --- */}

    </div> // Close .clientListPageContainer div
  );
}

export default ClientListPage;