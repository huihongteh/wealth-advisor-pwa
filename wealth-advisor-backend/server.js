// server.js
require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const cors = require('cors');
const db = require('./config/db');

const authenticateToken = require('./middleware/authenticateToken'); // <-- Import middleware

const app = express();
const PORT = process.env.PORT || 3001; // Use port from env var or default

// --- Middleware ---
// Enable CORS for all origins (adjust for production later)
app.use(cors());
// Parse JSON request bodies
app.use(express.json());
// Parse URL-encoded request bodies (optional, but often useful)
app.use(express.urlencoded({ extended: true }));

// --- Basic Test Route ---
app.get('/', (req, res) => {
    res.send('Wealth Advisor Backend API is running!');
  });
  
// --- Mount API Routes ---
const clientRoutes = require('./routes/clients'); // <-- Require the router
const noteRoutes = require('./routes/notes');
const authRoutes = require('./routes/auth');

// Public auth route doesn't need the middleware
app.use('/api/auth', authRoutes);

// Apply authentication middleware to all client and note routes
app.use('/api/clients', authenticateToken); // <-- Apply middleware HERE
app.use('/api/clients', clientRoutes);
// Mount notes router nested under clients, passing clientId param
app.use('/api/clients/:clientId/notes', noteRoutes); // <-- Mount the notes router

// --- Basic Error Handler (Optional - Add More Robust Later) ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    res.status(500).send('Something broke!');
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});