// src/pages/LoginPage.js
import React, { useState } from 'react';
// Remove useNavigate if only relying on App.js Navigate component
// import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import styles from './LoginPage.module.css';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const auth = useAuth(); // Get auth object from context
  // const navigate = useNavigate(); // If using programmatic navigation

  const handleSubmit = async (event) => { 
    event.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Attempting login with:');
    console.log('Email:', email);
    try {
      // --- Call Backend API ---
      const response = await fetch('/api/auth/login', { // <-- Use relative path or full backend URL
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
      });

      const data = await response.json(); // Always parse JSON response

      if (!response.ok) {
          // Handle API errors (401, 400, 500 etc.)
          throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // --- Success ---
      console.log('API Login Successful:', data);
      // Call context login with user data from API response
      auth.login(data.user, data.token); // Pass both user and token
      // No explicit navigation needed, App.js handles redirect on auth state change

    } catch (err) {
        // --- Error ---
        console.error('API Login Failed:', err);
        // Use error message from API if available, otherwise generic
        setError(err.message || 'Login failed. Please try again.');
        setIsLoading(false); // Stop loading on error
    }
    // No need for setIsLoading(false) on success if navigating immediately
  };

  // ... (rest of the component remains the same: form, inputs, button, etc.)
  // Make sure the return statement is still there!
  return (
    <div className={styles.loginContainer}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} className={styles.loginForm}>
         {/* ... form elements ... */}
         <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <button type="submit" className={styles.loginButton} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
         {/* ... forgot password link ... */}
      </form>
    </div>
  );
}

export default LoginPage;