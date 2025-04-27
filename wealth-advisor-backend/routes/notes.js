// routes/notes.js
const express = require('express');
// IMPORTANT: Enable mergeParams to access :clientId from the parent router (in server.js)
const router = express.Router({ mergeParams: true });
const db = require('../config/db'); // Import the db query function

// --- GET /api/clients/:clientId/notes - Get all notes for a specific client ---
router.get('/', async (req, res) => {
  const { clientId } = req.params; // Get clientId from the merged parameters
  try {
    // Validate if clientId is a valid number before querying
    if (isNaN(parseInt(clientId))) {
       return res.status(400).json({ error: 'Invalid Client ID format' });
    }

    // Select notes for the specific client, ordered by meeting date (most recent first)
    const result = await db.query(
      `SELECT
         id as "noteId",               -- Alias id to noteId
         to_char(meeting_date, 'YYYY-MM-DD') as date, -- Format date as YYYY-MM-DD string
         summary,
         next_steps as "nextSteps"     -- Alias next_steps to nextSteps
       FROM meeting_notes
       WHERE client_id = $1
       ORDER BY meeting_date DESC, created_at DESC`,
      [clientId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(`Error fetching notes for client ${clientId}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- GET /api/clients/:clientId/notes/:noteId - Get a single note ---
router.get('/:noteId', async (req, res) => {
  const { clientId, noteId } = req.params;
  try {
     // Validate IDs
    if (isNaN(parseInt(clientId)) || isNaN(parseInt(noteId))) {
       return res.status(400).json({ error: 'Invalid Client or Note ID format' });
    }

    const result = await db.query(
      `SELECT
         id as "noteId",
         to_char(meeting_date, 'YYYY-MM-DD') as date,
         summary,
         next_steps as "nextSteps",
         client_id as "clientId",
         created_at as "createdAt",
         updated_at as "updatedAt"
       FROM meeting_notes
       WHERE id = $1 AND client_id = $2`, // Ensure note belongs to the client
      [noteId, clientId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Note not found for this client' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(`Error fetching note ${noteId} for client ${clientId}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


// --- POST /api/clients/:clientId/notes - Create a new note for a specific client ---
router.post('/', async (req, res) => {
  const { clientId } = req.params;
  const advisorId = req.user.userId; // <-- Get advisor ID
  const { meetingDate, summary, nextSteps } = req.body;

  // Basic Validation
  if (!meetingDate) {
    return res.status(400).json({ error: 'Meeting Date is required' });
  }
  if (!summary && !nextSteps) {
     return res.status(400).json({ error: 'Either Summary or Next Steps must be provided' });
  }
   if (isNaN(parseInt(clientId))) {
       return res.status(400).json({ error: 'Invalid Client ID format' });
   }

  try {
    // --- Check if client belongs to advisor BEFORE inserting note ---
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1 AND advisor_id = $2', [clientId, advisorId]);
    if (clientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden: Client does not belong to this advisor.' }); // Or 404
    }
    // --- End Check ---

    // Optional: Check if client exists first? FK constraint will catch it otherwise.
    const result = await db.query(
      `INSERT INTO meeting_notes (client_id, meeting_date, summary, next_steps, advisor_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id as "noteId", to_char(meeting_date, 'YYYY-MM-DD') as date, summary, next_steps as "nextSteps", client_id as "clientId"`, // <-- CORRECTED RETURNING
      [clientId, meetingDate, summary || null, nextSteps || null, advisorId]
    );
      res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(`Error creating note for client ${clientId}:`, err.stack);
    // Check for foreign key violation (client doesn't exist)
    if (err.code === '23503') { // FK violation code
        return res.status(404).json({ error: 'Client not found. Cannot add note.' });
    }
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- PUT /api/clients/:clientId/notes/:noteId - Update a specific note ---
router.put('/:noteId', async (req, res) => {
  const { clientId, noteId } = req.params;
  const advisorId = req.user.userId; // <-- Get advisor ID
  const { meetingDate, summary, nextSteps } = req.body;

  // Basic Validation
  if (!meetingDate) { return res.status(400).json({ error: 'Meeting Date is required' }); }
  if (!summary && !nextSteps) { return res.status(400).json({ error: 'Either Summary or Next Steps must be provided' }); }
  if (isNaN(parseInt(clientId)) || isNaN(parseInt(noteId))) { return res.status(400).json({ error: 'Invalid Client or Note ID format' }); }


  try {
    // --- Check if client belongs to advisor --- (can combine with update later)
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1 AND advisor_id = $2', [clientId, advisorId]);
    if (clientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden: Client does not belong to this advisor.' });
    }
   // --- End Check ---
   
    // Trigger will update updated_at
    const result = await db.query(
      `UPDATE meeting_notes SET meeting_date = $1, summary = $2, next_steps = $3
           WHERE id = $4 AND client_id = $5 -- Check client_id
           -- Optionally add: AND advisor_id = $6 (if advisor_id added to notes table)
           RETURNING id as "noteId", to_char(meeting_date, 'YYYY-MM-DD') as date, summary, next_steps as "nextSteps", client_id as "clientId", updated_at as "updatedAt"`,
      [meetingDate, summary || null, nextSteps || null, noteId, clientId]
    );

    if (result.rows.length === 0) {
      // Could be note doesn't exist OR it belongs to another client
      return res.status(404).json({ error: 'Note not found for this client' });
    }
    res.json(result.rows[0]); // Return updated note data
  } catch (err) {
    console.error(`Error updating note ${noteId} for client ${clientId}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});

// --- DELETE /api/clients/:clientId/notes/:noteId - Delete a specific note ---
router.delete('/:noteId', async (req, res) => {
  const { clientId, noteId } = req.params;
  const advisorId = req.user.userId; // <-- Get advisor ID

   if (isNaN(parseInt(clientId)) || isNaN(parseInt(noteId))) {
       return res.status(400).json({ error: 'Invalid Client or Note ID format' });
   }

  try {
    // --- Check if client belongs to advisor ---
    const clientCheck = await db.query('SELECT id FROM clients WHERE id = $1 AND advisor_id = $2', [clientId, advisorId]);
    if (clientCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Forbidden: Client does not belong to this advisor.' });
    }
    // --- End Check ---
    
    const result = await db.query(
      'DELETE FROM meeting_notes WHERE id = $1 AND client_id = $2 RETURNING id', // Ensure delete only happens for correct client/note combo
      [noteId, clientId]
    );

    if (result.rowCount === 0) {
      // Could be note doesn't exist OR it belongs to another client
      return res.status(404).json({ error: 'Note not found for this client' });
    }
    res.status(204).send(); // Success, no content to return
  } catch (err) {
    console.error(`Error deleting note ${noteId} for client ${clientId}:`, err.stack);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
});


module.exports = router;