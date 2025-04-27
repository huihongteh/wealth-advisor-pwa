// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

// Import our page components
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ClientListPage from './pages/ClientListPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AddNotePage from './pages/AddNotePage';
import ViewNotePage from './pages/ViewNotePage';
import AddClientPage from './pages/AddClientPage';

function App() {
  // Basic check for authentication (VERY simplified - replace later!)
  const isAuthenticated = false; // Hardcoded for now!

  return (
    <Router>
      <div className="App">
        {/* Optional: Basic Nav Links for testing - remove later */}
        <nav style={{ marginBottom: '20px', borderBottom: '1px solid #ccc', paddingBottom: '10px' }}>
          {!isAuthenticated && <Link to="/login" style={{ marginRight: '10px' }}>Login</Link>}
          {isAuthenticated && (
            <>
              <Link to="/" style={{ marginRight: '10px' }}>Dashboard</Link>
              <Link to="/clients" style={{ marginRight: '10px' }}>Clients</Link>
              {/* Add other links as needed */}
              <button onClick={() => alert('Logout logic needed!')}>Logout</button>
            </>
          )}
        </nav>

        <h1>Wealth Advisor Notes PWA</h1>

        {/* Define the routes */}
        <Routes>
          {/* If authenticated, show dashboard, otherwise redirect to login (logic needs refinement) */}
          {isAuthenticated ? (
            <>
              <Route path="/" element={<DashboardPage />} />
              <Route path="/clients" element={<ClientListPage />} />
              {/* Route for adding a client */}
              <Route path="/add-client" element={<AddClientPage />} />
              {/* Route for specific client detail - :clientId is a URL parameter */}
              <Route path="/client/:clientId" element={<ClientDetailPage />} />
              {/* Route for adding a note FOR a specific client */}
              <Route path="/client/:clientId/add-note" element={<AddNotePage />} />
              {/* Route for viewing a specific note - needs client and note IDs */}
              <Route path="/client/:clientId/note/:noteId" element={<ViewNotePage />} />
              {/* Add other authenticated routes here */}

               {/* Redirect to dashboard if authenticated and trying to access login */}
              <Route path="/login" element={<DashboardPage />} /> {/* Or redirect component */}

            </>
          ) : (
             <>
                {/* Only allow access to login page if not authenticated */}
                <Route path="/login" element={<LoginPage />} />
                {/* Any other route redirects to login if not authenticated */}
                <Route path="*" element={<LoginPage />} /> {/* Or a dedicated Redirect component */}
             </>
          )}
            {/* Fallback for unmatched routes if needed, though the above covers most cases */}
             {/* <Route path="*" element={<div>404 Not Found</div>} /> */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;