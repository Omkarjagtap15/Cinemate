const { ClerkExpressWithAuth } = require('@clerk/clerk-sdk-node');
const config = require('../config/env');
const logger = require('../utils/logger');

// Optional Clerk verification if secret is provided, with fallback for development & guest sessions
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const guestHeader = req.headers['x-user-id'];

  if (authHeader && authHeader.startsWith('Bearer ') && config.CLERK_SECRET_KEY) {
    // If Clerk secret is active, verify through Clerk
    return ClerkExpressWithAuth()(req, res, (err) => {
      if (err) {
        logger.warn('Clerk auth verification failed:', { error: err.message });
        return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
      }
      req.userId = req.auth?.userId || guestHeader || 'guest_user';
      next();
    });
  }

  // Fallback / Development token or guest user id
  if (guestHeader) {
    req.userId = guestHeader;
    return next();
  }

  // Generate or assign default user
  req.userId = 'guest_default_user';
  next();
};

module.exports = { requireAuth };
