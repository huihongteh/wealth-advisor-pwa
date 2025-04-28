// routes/auth.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// --- POST /api/auth/register ---
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;

    // --- Basic Input Validation ---
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
    }
    // Add more validation: email format, password strength (e.g., min length)
    if (password.length < 6) { // Example: Minimum password length
         return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    // Add simple email format check (more robust needed for production)
    if (!/\S+@\S+\.\S+/.test(email)) {
         return res.status(400).json({ error: 'Invalid email format' });
    }
    // --- End Validation ---

    try {
        // 1. Check if email already exists
        const existingUser = await db.query('SELECT id FROM advisors WHERE email = $1', [email.toLowerCase()]); // Check lowercase email
        if (existingUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email address is already registered' }); // 409 Conflict
        }

        // 2. Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // 3. Insert the new advisor
        // Use lowercased email for storage consistency
        const result = await db.query(
            'INSERT INTO advisors (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id, email, name',
            [name.trim(), email.toLowerCase().trim(), passwordHash]
        );

        const newUser = result.rows[0];
        console.log('New advisor registered:', newUser);

        // 4. Send Success Response (Option A: Message only)
        res.status(201).json({ message: 'Registration successful. Please log in.' });

    } catch (err) {
        console.error('Registration error:', err.stack);
        res.status(500).json({ error: 'Internal Server Error during registration', details: err.message });
    }
});

// --- POST /api/auth/login ---
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        // 1. Find advisor by email
        const result = await db.query('SELECT id, email, password_hash, name FROM advisors WHERE email = $1', [email]);
        const advisor = result.rows[0];

        if (!advisor) {
            // User not found - send generic error for security
            console.log(`Login attempt failed: Email not found - ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' }); // Unauthorized
        }

        // 2. Compare provided password with stored hash
        const isMatch = await bcrypt.compare(password, advisor.password_hash);

        if (!isMatch) {
            // Password doesn't match - send generic error
            console.log(`Login attempt failed: Password mismatch for email - ${email}`);
            return res.status(401).json({ error: 'Invalid email or password' }); // Unauthorized
        }

        // --- Generate JWT Token ---
        const payload = {
            userId: advisor.id, // Use generic 'userId' or specific 'advisorId'
            email: advisor.email,
            name: advisor.name // Include other non-sensitive info if needed
        };
        const secret = process.env.JWT_SECRET;
        const options = { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }; // Default 1h

        const token = jwt.sign(payload, secret, options);
        // --- End Generate JWT ---

        // 3. Login successful!
        console.log(`Login successful for email: ${email}`);

        // --- IMPORTANT: Session/Token Management ---
        // This is where you would establish the user's session.
        // Option A: Simple Session (using express-session middleware - needs setup)
        // req.session.userId = advisor.id; // Example
        // Option B: JWT Token (More common for APIs)
        // const payload = { userId: advisor.id, email: advisor.email };
        // const secret = process.env.JWT_SECRET; // Needs JWT_SECRET in .env
        // const token = jwt.sign(payload, secret, { expiresIn: '1h' }); // Example: 1 hour expiry
        // Send token back to client

        // For now, just send back advisor info (excluding hash)
        const advisorInfo = {
            id: advisor.id,
            email: advisor.email,
            name: advisor.name
            // token: token // If using JWT
        };

        // Send token and user info back
        res.json({
            message: 'Login successful',
            token: token, // The client needs to store this
            user: { // Send back user info for display/context
                id: advisor.id,
                email: advisor.email,
                name: advisor.name
            }
        });

    } catch (err) {
        console.error('Login error:', err.stack);
        res.status(500).json({ error: 'Internal Server Error', details: err.message });
    }
});

// --- TODO: Add Logout Route (if using sessions/tokens) ---
// router.post('/logout', (req, res) => { ... });

module.exports = router;