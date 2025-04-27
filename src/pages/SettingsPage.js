// src/pages/SettingsPage.js
import React from 'react';
import { useAuth } from '../context/AuthContext';
import styles from './SettingsPage.module.css'; // Create CSS file

function SettingsPage() {
  const auth = useAuth();

  const handleLogout = () => {
    // Optional: Add confirmation?
    // if (window.confirm('Are you sure you want to log out?')) {
         auth.logout();
         // No need to navigate, ProtectedRoute/App will handle redirect
    // }
  };

  return (
    <div className={styles.settingsPage}>
      <h1 className={styles.pageTitle}>Settings</h1>

      <div className={styles.settingsContent}>
        {/* Placeholder for future settings */}
         <p>App Version: 1.0.0 (Example)</p>

         {/* Logout Button Section */}
         <div className={styles.logoutSection}>
            <button onClick={handleLogout} className={styles.logoutButton}>
                Log Out
            </button>
         </div>

      </div>
    </div>
  );
}

export default SettingsPage;