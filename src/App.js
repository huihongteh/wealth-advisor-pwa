// src/App.js
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link, // Link might not be needed here anymore
  Navigate,
  useLocation
} from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import './App.css'; // Keep App.css for potential global layout styles

// Page Components
import LoginPage from './pages/LoginPage';
import ClientListPage from './pages/ClientListPage';
import AddClientPage from './pages/AddClientPage';
import ClientDetailPage from './pages/ClientDetailPage';
import AddNotePage from './pages/AddNotePage';
import ViewNotePage from './pages/ViewNotePage';
import EditNotePage from './pages/EditNotePage';
import EditClientPage from './pages/EditClientPage';
import SettingsPage from './pages/SettingsPage'; // <-- Import SettingsPage
import RegisterPage from './pages/RegisterPage';

// Components
import ProtectedRoute from './components/ProtectedRoute';
import BottomNav from './components/BottomNav'; // <-- Import BottomNav

// Define paths where BottomNav should be visible
const bottomNavVisiblePaths = ['/', '/clients', '/settings']; // Add root aliases if needed

function AppContent() {
  const auth = useAuth(); // Auth context needed for conditional rendering of BottomNav
  const location = useLocation(); // <-- Get location

  // Determine if the current path matches one where the nav should be visible
  // Exact match needed for '/', otherwise '/clients' would match '/' too soon.
  // For '/clients', allow partial match if needed, but exact is safer here.
  const showBottomNav = auth.isAuthenticated &&
  bottomNavVisiblePaths.some(path => {
      if (path === '/') return location.pathname === '/';
      // Basic check - adjust if you have nested routes under settings/clients later
      return location.pathname.startsWith(path);
  });

  return (
      /* App container - may need padding-bottom for fixed nav */
      <div className="appContainer">

        <main className="mainContent"> {/* Wrap routes in main */}
          <Routes>
            {/* --- Public Route --- */}
            <Route
              path="/login"
              element={!auth.isAuthenticated ? <LoginPage /> : <Navigate to="/" replace />}
            />
            {/* --- ADD REGISTER ROUTE --- */}
            <Route
                path="/register"
                element={!auth.isAuthenticated ? <RegisterPage /> : <Navigate to="/" replace />} // Also redirect if logged in
            />
            {/* --- END REGISTER ROUTE --- */}

            {/* --- Protected Routes --- */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<ClientListPage />} />
              <Route path="/clients" element={<ClientListPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/add-client" element={<AddClientPage />} />
              <Route path="/client/:clientId" element={<ClientDetailPage />} />
              <Route path="/client/:clientId/edit" element={<EditClientPage />} />
              <Route path="/client/:clientId/add-note" element={<AddNotePage />} />
              <Route path="/client/:clientId/note/:noteId" element={<ViewNotePage />} />
              <Route path="/client/:clientId/note/:noteId/edit" element={<EditNotePage />} />
            </Route>

            {/* --- Catch-all Route --- */}
             <Route
               path="*"
               element={
                  auth.isAuthenticated
                  ? <div style={{ textAlign: 'center', marginTop: '50px', padding: '20px' }}><h2>404 - Page Not Found</h2><Link to="/">Go Home</Link></div> // Added Link back
                  : <Navigate to="/login" replace />
               }
             />
          </Routes>
        </main>

        {/* --- Render BottomNav only if authenticated --- */}
        {/* --- Conditionally render BottomNav --- */}
        {auth.isAuthenticated && showBottomNav && <BottomNav />}

      </div>
  );
}

function App() {
  // AuthProvider should wrap Router if context is needed globally,
  // but here we only need it inside AppContent
return (
  <Router>
    {/* AuthProvider could potentially wrap AppContent directly if needed */}
     <AppContent /> {/* Render the component that uses the hook */}
  </Router>
);
}

export default App;