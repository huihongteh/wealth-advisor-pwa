// routes/clients.js
const express = require('express');
const router = express.Router();
const db = require('../config/db'); // Import the db query function

// --- GET /api/clients - Get all clients ---
router.get('/', async (req, res) => {
    const advisorId = req.user.userId; // <-- Get advisor ID from middleware
  // TODO: Add filtering/searching later based on query params (e.g., req.query.search)
  try {
    // Filter by advisor_id
    const result = await db.query(
        'SELECT id, name, email, phone FROM clients WHERE advisor_id = $1 ORDER BY name ASC',
        [advisorId] // <-- Use advisorId in query
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching clients:', err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- GET /api/clients/:id - Get a single client ---
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const advisorId = req.user.userId; // <-- Get advisor ID
  try {
   // Check if client exists AND belongs to the logged-in advisor
   const clientResult = await db.query(
    'SELECT id, name, email, phone, created_at, updated_at FROM clients WHERE id = $1 AND advisor_id = $2',
    [id, advisorId] // <-- Use both IDs
);

    if (clientResult.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }

    // Fetch associated notes (example - combine if performance needed)
    const notesResult = await db.query(
      `SELECT
       id AS "noteId",                  -- Use AS "noteId" (Double Quotes)
       to_char(meeting_date, 'YYYY-MM-DD') as date, -- 'as date' is fine (lowercase)
       summary,
       next_steps AS "nextSteps"        -- Use AS "nextSteps" (Double Quotes)
     FROM meeting_notes
     WHERE client_id = $1
     ORDER BY meeting_date DESC, created_at DESC`,
    [id]
);

    const clientData = {
        ...clientResult.rows[0],
        notes: notesResult.rows
    }

    res.json(clientData);
  } catch (err) {
    console.error(`Error fetching client ${id}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- POST /api/clients - Create a new client ---
router.post('/', async (req, res) => {
  // Simple validation - could use a library like express-validator later
  const { name, email, phone } = req.body;
  const advisorId = req.user.userId; // <-- Get advisor ID

  if (!name || !phone) { // Name and Phone are now required
    return res.status(400).json({ message: 'Client Name and Phone Number are required' });
}

  try {
    const result = await db.query(
      'INSERT INTO clients (name, email, phone, advisor_id) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone',
      [
          name.trim(),
          email ? email.trim() : null, // Email is still optional
          phone.trim(), // Phone is required, pass trimmed value
          advisorId
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating client:', err.stack);
    // Handle potential unique constraint violation for email
    if (err.code === '23505' && err.constraint === 'clients_phone_key') {
      return res.status(409).json({ message: 'Phone number already exists for another client.' });
 }
    // Check for NOT NULL violation specifically on phone (less likely if validation works)
    if (err.code === '23502' && err.column === 'phone') {
          return res.status(400).json({ message: 'Phone number cannot be empty.' });
    }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- PUT /api/clients/:id - Update an existing client ---
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, phone } = req.body;
  const advisorId = req.user.userId; // <-- Get advisor ID

  if (!name || !phone) { // Name and Phone are required
    return res.status(400).json({ message: 'Client Name and Phone Number are required' });
}

  try {
    // The trigger will automatically update 'updated_at'
    const result = await db.query(
      'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4 AND advisor_id = $5 RETURNING id, name, email, phone, updated_at',
      [
          name.trim(),
          email ? email.trim() : null, // Email still optional
          phone.trim(), // Phone required
          id,
          advisorId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(result.rows[0]); // Return updated client data
  } catch (err) {
    console.error(`Error updating client ${id}:`, err.stack);
     // Handle potential unique constraint violation for email
     if (err.code === '23505' && err.constraint === 'clients_phone_key') {
      return res.status(409).json({ message: 'Phone number already exists for another client.' });
 }
  // Check for NOT NULL violation specifically on phone (less likely if validation works)
 if (err.code === '23502' && err.column === 'phone') {
      return res.status(400).json({ message: 'Phone number cannot be empty.' });
 }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- DELETE /api/clients/:id - Delete a client ---
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const advisorId = req.user.userId; // <-- Get advisor ID
  try {
    // The ON DELETE CASCADE on the notes table handles note deletion automatically
// Add advisor_id check to WHERE clause
const result = await db.query(
    'DELETE FROM clients WHERE id = $1 AND advisor_id = $2 RETURNING id',
    [id, advisorId] // <-- Check advisorId
);
    if (result.rowCount === 0) { // Check rowCount for DELETE
      return res.status(404).json({ error: 'Client not found' });
    }
    // Send back minimal confirmation or just status 204
    // res.json({ message: `Client '${result.rows[0].name}' deleted successfully` });
    res.status(204).send(); // 204 No Content is standard for successful DELETE

  } catch (err) {
    console.error(`Error deleting client ${id}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// Export the router
module.exports = router;