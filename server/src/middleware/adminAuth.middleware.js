const config = require('../config/env');
const logger = require('../utils/logger');

const ADMIN_SECRET = process.env.ADMIN_SECRET_KEY || 'cinemate-admin-secret';

/**
 * Admin Authorization Middleware (Phase 27)
 * Ensures only authorized requests can access internal telemetry and admin capabilities.
 */
const requireAdminAuth = (req, res, next) => {
  const authHeader = req.headers['x-admin-key'];
  const queryKey = req.query.adminKey;
  const bearerToken = req.headers.authorization?.replace(/^Bearer\s+/i, '');

  const providedKey = authHeader || queryKey || bearerToken;

  if (!providedKey || providedKey !== ADMIN_SECRET) {
    logger.warn('Unauthorized admin access attempt', {
      request_id: req.id,
      ip: req.ip,
      path: req.originalUrl,
    });

    return res.status(403).json({
      success: false,
      error: 'Forbidden: Admin authorization required. Provide valid x-admin-key header.',
      request_id: req.id,
    });
  }

  req.isAdmin = true;
  next();
};

module.exports = {
  requireAdminAuth,
  ADMIN_SECRET,
};
