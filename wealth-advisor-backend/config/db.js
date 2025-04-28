// config/db.js
const { Pool } = require('pg');
require('dotenv').config();

// Use the POOLER connection string from Supabase via Render env var
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: connectionString,
  // Typically NO explicit SSL needed when using Supabase pooler URI
  // ssl: { rejectUnauthorized: false } // REMOVE this if you added it
});

// Test the connection (should connect to the pooler)
pool.connect((err, client, release) => {
  if (err) { return console.error('Error acquiring client for DB pooler test:', err.stack); }
  client.query('SELECT NOW()', (err, result) => {
    release();
    if (err) { return console.error('Error executing DB pooler test query:', err.stack); }
    console.log('Database Pooler connected successfully:', result.rows[0].now);
  });
});

module.exports = { query: (text, params) => pool.query(text, params), pool: pool };