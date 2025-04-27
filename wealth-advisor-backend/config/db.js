// config/db.js
const { Pool } = require('pg');
require('dotenv').config(); // Ensure env vars are loaded

// Option 1: Using DATABASE_URL (Recommended for Render compatibility)
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  // Render requires SSL for external connections, but might not for internal.
  // For local dev, you might not need SSL. Render handles SSL automatically.
  // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  // Let's omit ssl config for now, Render adds it via DATABASE_URL if needed.
});

// Test the connection (optional, run once on server start maybe)
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client for DB connection test:', err.stack);
  }
  client.query('SELECT NOW()', (err, result) => {
    release(); // Release the client back to the pool
    if (err) {
      return console.error('Error executing DB connection test query:', err.stack);
    }
    console.log('Database connected successfully:', result.rows[0].now);
  });
});

// Export a query function to use the pool easily
module.exports = {
  query: (text, params) => pool.query(text, params),
  pool: pool // Export pool directly if needed for transactions etc.
};