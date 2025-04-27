// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css';

// Page Components
import LoginPage from './pages/LoginPage';
import ClientListPage from './pages/ClientListPage';
import AddClientPage from './pages/AddClientPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AddNotePage from './pages/AddNotePage';
import ViewNotePage from './pages/ViewNotePage';
import EditNotePage from './pages/EditNotePage'; // Existing Edit Note Page
import EditClientPage from './pages/EditClientPage'; // <-- Import New Edit Client Page

// Components
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const auth = useAuth();

  return (
    <Router>
      <div className="App">
        {/* --- Nav Bar --- */}
        <nav style={{ /* ... styles ... */ }}>
           {/* ... nav links ... */}
            <div>
                {auth.isAuthenticated && (
                <>
                    <Link to="/" style={{ marginRight: '15px', textDecoration: 'none', color: '#007bff' }}>Clients</Link>
                </>
                )}
            </div>
            <div>
                {!auth.isAuthenticated ? (
                <Link to="/login" style={{ textDecoration: 'none', color: '#007bff' }}>Login</Link>
                ) : (
                <>
                    <button onClick={auth.logout} style={{ cursor: 'pointer' }}>Logout</button>
                </>
                )}
            </div>
        </nav>

        <h1>Wealth Advisor Notes PWA</h1>

        {/* --- Updated Routes --- */}
        <Routes>
          {/* --- Public Route --- */}
          <Route
            path="/login"
            element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
          />

          {/* --- Protected Routes --- */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<ClientListPage />} />
            <Route path="/clients" element={<ClientListPage />} />
            <Route path="/add-client" element={<AddClientPage />} />
            <Route path="/client/:clientId" element={<ClientDetailPage />} />

            {/* --- ADD EDIT CLIENT ROUTE --- */}
            <Route
              path="/client/:clientId/edit" // New Path
              element={<EditClientPage />}   // New Component
            />
            {/* --- END EDIT CLIENT ROUTE --- */}

            <Route path="/client/:clientId/add-note" element={<AddNotePage />} />
            <Route path="/client/:clientId/note/:noteId" element={<ViewNotePage />} />
            <Route path="/client/:clientId/note/:noteId/edit" element={<EditNotePage />} />
          </Route>

          {/* --- Catch-all Route --- */}
           <Route
             path="*"
             element={
                auth.isAuthenticated
                ? <div style={{ textAlign: 'center', marginTop: '50px' }}><h2>404 - Page Not Found</h2><Link to="/">Go Home</Link></div>
                : <Navigate to="/login" replace />
             }
           />

        </Routes>
      </div>
    </Router>
  );
}

export default App;