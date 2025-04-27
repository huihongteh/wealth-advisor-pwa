// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuth(); // Get user too, might be useful

  // --- Add this console log ---
  console.log('[ProtectedRoute] Check:', {
      pathname: window.location.pathname, // See which path triggered the check
      isAuthenticated: isAuthenticated,
      user: user // Log the user object as well
  });
  // --- End log ---

  if (!isAuthenticated) {
    console.log('[ProtectedRoute] Not authenticated, redirecting to /login'); // Log redirect reason
    return <Navigate to="/login" replace />;
  }

  // If authenticated, render the child route component
  return <Outlet />;
}

export default ProtectedRoute;