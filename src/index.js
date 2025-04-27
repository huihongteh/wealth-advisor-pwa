// src/index.js
import React from 'react';
import { createRoot } from 'react-dom/client'; // Import createRoot
import './index.css';
import App from './App';

// Find the root DOM element
const container = document.getElementById('root');

// Create a root
const root = createRoot(container); // Use createRoot

// Initial render
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);