// wealth-advisor-backend/server.js
require('dotenv').config(); // Load .env file first
const express = require('express');
const cors = require('cors');
// const path = require('path'); // Not needed if not serving static files
const db = require('./config/db'); // Require db to trigger connection test on start

// --- Route and Middleware Imports ---
const authRoutes = require('./routes/auth');
const clientRoutes = require('./routes/clients');
const noteRoutes = require('./routes/notes');
const authenticateToken = require('./middleware/authenticateToken');

const app = express();
const PORT = process.env.PORT || 3001; // Render provides PORT

// --- Middleware ---

// --- CORS Configuration using Environment Variables ---
const frontendProdUrl = process.env.FRONTEND_PROD_URL;
const frontendDevUrl = process.env.FRONTEND_DEV_URL || 'http://localhost:3000';

const allowedOrigins = [];
if (frontendProdUrl) {
    frontendProdUrl.split(',').forEach(url => allowedOrigins.push(url.trim()));
}
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(frontendDevUrl);
} else if (!frontendProdUrl) {
    console.warn("WARN: No FRONTEND_PROD_URL environment variable set for CORS in production!");
}

console.log("Allowed CORS Origins:", allowedOrigins); // Log allowed origins on start

const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.warn(`CORS: Blocking origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Use configured CORS options
// --- End CORS Configuration ---


// Standard Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// --- API Routes ---
// Public auth route
app.use('/api/auth', authRoutes); // Path '/api/auth' looks correct

// Apply authentication middleware TO PROTECTED ROUTES ONLY
// Apply it once before all protected client/note routes
app.use('/api/clients', authenticateToken); // Path '/api/clients' looks correct

// Mount protected client routes
app.use('/api/clients', clientRoutes); // Path '/api/clients' looks correct

// Mount protected notes router nested under clients
app.use('/api/clients/:clientId/notes', noteRoutes); // Path '/api/clients/:clientId/notes' looks correct

// --- Catch-all for API Not Found ---
// Handles requests starting with /api/ that didn't match any defined API route
app.use('/api/\\*', (req, res, next) => { // Path '/api/*' looks correct
    res.status(404).json({ error: 'API endpoint not found' });
});


// --- Basic Root Route (Optional - Good for health checks) ---
app.get('/', (req, res) => { // Path '/' looks correct
    res.send('Wealth Advisor Backend API is running!');
  });


// --- Error Handling Middleware (Keep at the end) ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack); // Log the full error stack
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Not allowed by CORS' });
    }
    // Default to 500 if no status code is set on the error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
         error: err.message || 'Internal Server Error',
         // Only include stack details in development for security
         details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});