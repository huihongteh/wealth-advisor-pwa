// src/pages/RegisterPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css'; // Create this CSS file next
import apiClient from '../utils/apiClient';

function RegisterPage() {
  const navigate = useNavigate();

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // For API or validation errors
  const [fieldErrors, setFieldErrors] = useState({}); // For specific field validation

  // --- Frontend Validation ---
  const validateForm = () => {
      const errors = {};
      if (!name.trim()) errors.name = 'Name is required.';
      if (!email.trim()) {
          errors.email = 'Email is required.';
      } else if (!/\S+@\S+\.\S+/.test(email)) {
          errors.email = 'Email address is invalid.';
      }
      if (!password) {
          errors.password = 'Password is required.';
      } else if (password.length < 6) {
          errors.password = 'Password must be at least 6 characters.';
      }
      if (!confirmPassword) {
          errors.confirmPassword = 'Please confirm your password.';
      } else if (password !== confirmPassword) {
          errors.confirmPassword = 'Passwords do not match.';
      }
      setFieldErrors(errors);
      // Return true if no errors, false otherwise
      return Object.keys(errors).length === 0;
  };

  // --- Handle Form Submission ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(''); // Clear general API error
    setFieldErrors({}); // Clear field errors

    // Perform frontend validation first
    if (!validateForm()) {
      return; // Stop submission if validation fails
    }

    setIsLoading(true); // Start loading indicator

    try {
        const registrationData = {
            name: name.trim(),
            email: email.toLowerCase().trim(), // Send lowercase email
            password: password // Send plain password (backend will hash)
        };
        console.log("RegisterPage: Submitting registration:", registrationData);

        // --- Call Backend API ---
        const data = await apiClient('/auth/register', 'POST', registrationData);
        console.log("RegisterPage: Registration successful:", data);

        // --- Success: Redirect to Login with message ---
        // No need for setIsLoading(false) - navigating away
        navigate('/login', {
            replace: true, // Replace /register in history
            state: { message: data.message || 'Registration successful. Please log in.' } // Pass success message
        });

    } catch (apiError) {
        // --- Handle API Error ---
        console.error('RegisterPage: Registration failed:', apiError);
        // Display API error message (e.g., "Email already registered", "Internal Server Error")
        setError(apiError.message || 'Registration failed. Please try again.');
        setIsLoading(false); // Stop loading on error
    }
  };

  return (
    <div className={styles.registerContainer}> {/* Reuse/adapt login styles */}
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit} className={styles.registerForm}>
        {/* Name */}
        <div className={styles.formGroup}>
          <label htmlFor="name">Name:</label>
          <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isLoading} required />
          {fieldErrors.name && <p className={styles.fieldError}>{fieldErrors.name}</p>}
        </div>
        {/* Email */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email:</label>
          <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isLoading} required />
          {fieldErrors.email && <p className={styles.fieldError}>{fieldErrors.email}</p>}
        </div>
        {/* Password */}
        <div className={styles.formGroup}>
          <label htmlFor="password">Password:</label>
          <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isLoading} required minLength="6"/>
          {fieldErrors.password && <p className={styles.fieldError}>{fieldErrors.password}</p>}
        </div>
        {/* Confirm Password */}
        <div className={styles.formGroup}>
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} disabled={isLoading} required />
          {fieldErrors.confirmPassword && <p className={styles.fieldError}>{fieldErrors.confirmPassword}</p>}
        </div>

        {/* Display general API Error */}
        {error && <p className={styles.errorMessage}>{error}</p>}

        {/* Submit Button */}
        <button type="submit" className={styles.registerButton} disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      {/* Link back to Login */}
      <p className={styles.loginLink}>
        Already have an account? <Link to="/login">Log In</Link>
      </p>
    </div>
  );
}
export default RegisterPage;