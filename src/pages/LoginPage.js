// src/pages/LoginPage.js
import React, { useState } from 'react';
// Remove useNavigate if only relying on App.js Navigate component
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import styles from './LoginPage.module.css';
import apiClient from '../utils/apiClient';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth();

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
      </div>
  );
}
export default LoginPage;
