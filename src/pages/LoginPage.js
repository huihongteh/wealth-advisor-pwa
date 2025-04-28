// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react'; // <-- Add useEffect
import { useAuth } from '../context/AuthContext';
import apiClient from '../utils/apiClient';
import styles from './LoginPage.module.css';
import { Link, useLocation } from 'react-router-dom'; // <-- Add Link, useLocation

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(''); 
  const auth = useAuth();
  const location = useLocation();

  // --- Effect to handle incoming messages ---
  useEffect(() => {
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Clear message after showing it
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      // Clear the state from history so message doesn't reappear
      window.history.replaceState({}, document.title);
      return () => clearTimeout(timer);
    }
  }, [location.state]); // Depend on location.state

  const handleSubmit = async (event) => { // Keep async
      event.preventDefault();
      setError('');
      setIsLoading(true);
      console.log('LoginPage: Attempting login via API Client...'); // New log

      try {
          // --- !!! USE apiClient HERE !!! ---
          const data = await apiClient('/auth/login', 'POST', { email, password });
          // --- !!! End Use apiClient !!! ---

          // Success path (apiClient throws on non-ok status)
          console.log('API Login Successful:', data);
          // Ensure data has user and token properties before calling login
          if (data && data.user && data.token) {
             auth.login(data.user, data.token);
          } else {
              console.error("API response missing user or token:", data);
              throw new Error("Login response from server was incomplete.");
          }
          // No explicit navigation needed

      } catch (err) {
          // apiClient throws errors with message/status
          console.error('API Login Failed:', err);
          setError(err.message || 'Login failed. Please try again.');
          setIsLoading(false); // Stop loading on error
      }
      // No need for setIsLoading(false) on success if navigating immediately
  };

  // --- Render Logic (remains the same) ---
  return (
      <div className={styles.loginContainer}>
          <h2>Login</h2>

          {/* --- Display Success Message --- */}
          {successMessage && (
            <p className={styles.successMessage}>{successMessage}</p> // <-- Add success style
          )}

          <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                  <label htmlFor="email">Email:</label>
                  <input type="email" id="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={isLoading} />
              </div>
              <div className={styles.formGroup}>
                  <label htmlFor="password">Password:</label>
                  <input type="password" id="password" name="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={isLoading} />
              </div>
              {error && <p className={styles.errorMessage}>{error}</p>}
              <button type="submit" className={styles.loginButton} disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
              </button>
          </form>

          {/* --- ADD Sign Up Link --- */}
          <p className={styles.registerLink}>
            Don't have an account? <Link to="/register">Sign Up</Link>
          </p>
          {/* --- END Sign Up Link --- */}
      </div>
  );
}
export default LoginPage;
