// middleware/authenticateToken.js
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    // Get token from the Authorization header (Bearer <token>)
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token after 'Bearer '

    if (token == null) {
        console.log('Auth Middleware: No token provided');
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.log('Auth Middleware: Token verification failed', err.message);
            // Token might be expired or invalid
            if (err.name === 'TokenExpiredError') {
               return res.status(401).json({ error: 'Token expired' });
            }
            return res.sendStatus(403); // Invalid token, forbidden
        }

        // Token is valid, attach payload to request object
        // We added { userId: advisor.id, ... } to the payload during login
        req.user = user; // req.user will contain { userId, email, name }
        console.log('Auth Middleware: Token verified for user ID:', req.user.userId);
        next(); // Proceed to the next middleware or route handler
    });
}

module.exports = authenticateToken;