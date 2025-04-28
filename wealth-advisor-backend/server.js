// wealth-advisor-backend/server.js
require('dotenv').config(); // Load .env file first
const express = require('express');
const cors = require('cors');
const path = require('path'); // Keep path for potential future use, but not needed for static serving now
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
// Define allowed origins. Get the production frontend URL from env vars.
// Allow multiple origins by splitting a comma-separated string.
const frontendProdUrl = process.env.FRONTEND_PROD_URL; // e.g., https://wealth-advisor-notes.onrender.com
const frontendDevUrl = process.env.FRONTEND_DEV_URL || 'http://localhost:3000'; // Default for local dev

const allowedOrigins = [];
if (frontendProdUrl) {
    // Support multiple production URLs if needed (e.g., custom domain) separated by comma
    frontendProdUrl.split(',').forEach(url => allowedOrigins.push(url.trim()));
}
// Always add local development URL unless explicitly in production only mode
if (process.env.NODE_ENV !== 'production') {
    allowedOrigins.push(frontendDevUrl);
} else if (!frontendProdUrl) {
    console.warn("WARN: No FRONTEND_PROD_URL environment variable set for CORS in production!");
}


console.log("Allowed CORS Origins:", allowedOrigins); // Log allowed origins on start

const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin OR if origin is in the allowed list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            // console.log(`CORS: Allowing origin: ${origin || 'server-to-server/no-origin'}`); // Verbose log
            callback(null, true);
        } else {
            console.warn(`CORS: Blocking origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // Important for sending/receiving cookies or auth headers
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions)); // Use configured CORS options
// --- End CORS Configuration ---


// Standard Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies


// --- API Routes ---
// Public route(s) first
app.use('/api/auth', authRoutes);

// Apply authentication middleware TO PROTECTED ROUTES ONLY
app.use('/api/clients', authenticateToken); // Protect all /api/clients... routes

// Mount protected routes
app.use('/api/clients', clientRoutes);
// Notes router inherits protection because its parent path '/api/clients' uses the middleware
app.use('/api/clients/:clientId/notes', noteRoutes);


// --- Catch-all for API Not Found ---
// Handles requests starting with /api/ that didn't match any defined API route
app.use('/api/*', (req, res, next) => {
    res.status(404).json({ error: 'API endpoint not found' });
});


// --- Basic Root Route (Optional - Good for health checks) ---
// Placed after API routes, before any potential static serving/catch-all
app.get('/', (req, res) => {
    res.send('Wealth Advisor Backend API is running!');
  });


// --- REMOVED Static File Serving & Frontend Catch-all ---
// (These are only needed if serving frontend from this same service)
// const frontendBuildPath = path.join(__dirname, 'public');
// app.use(express.static(frontendBuildPath));
// app.get('*', (req, res) => {
//   res.sendFile(path.join(frontendBuildPath, 'index.html'));
// });


// --- Error Handling Middleware (Keep at the end) ---
app.use((err, req, res, next) => {
    console.error("Unhandled Error:", err.stack);
    if (err.message === 'Not allowed by CORS') {
        return res.status(403).json({ error: 'Not allowed by CORS' });
    }
    // Default to 500 if no status code is set on the error
    const statusCode = err.status || 500;
    res.status(statusCode).json({
         error: err.message || 'Internal Server Error',
         // Optionally include details only in development
         details: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});