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

  const handleSubmit = (event) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    console.log('Attempting login with:');
    console.log('Email:', email);
    console.log('Password:', password); // Still don't log in real app

    setTimeout(() => {
      // **--- Fake Auth Check ---**
      // Replace with actual API call
      if (email === 'advisor@example.com' && password === 'password') {
        console.log('Login Successful (Placeholder)');
        // Call the login function from AuthContext
        // Pass necessary data (e.g., from API response)
        // --- Add this log ---
        console.log('[LoginPage] Calling auth.login...');
        auth.login({ email: email }); // Pass dummy data for now
        setIsLoading(false);
        // Navigation is now handled by the Route definitions in App.js
        // navigate('/'); // Alternative: programmatic navigation
      } else {
        console.log('Login Failed (Placeholder)');
        setError('Invalid email or password.');
        setIsLoading(false);
      }
      // **--- End Fake Auth Check ---**
    }, 1000);
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