// src/components/BackButton.js
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './BackButton.module.css';

// Simple SVG Chevron Icon
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="20" viewBox="0 0 12 21" fill="currentColor">
    <path d="M11.67 1.17061L9.92333 0L0 9.30434L9.92333 18.6087L11.67 17.4381L3.52 9.30434L11.67 1.17061Z"/>
  </svg>
);


function BackButton({ to, label = 'Back' }) { // Default label is 'Back'
  return (
    <Link to={to} className={styles.backButton}>
      <span className={styles.icon}><ChevronLeftIcon /></span>
      <span className={styles.label}>{label}</span>
    </Link>
  );
}

export default BackButton;