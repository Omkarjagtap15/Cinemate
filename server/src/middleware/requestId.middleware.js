const crypto = require('crypto');

/**
 * Request ID Middleware
 * Assigns a unique correlation ID to each incoming request.
 * Exposes it on `req.id` and sets the `X-Request-Id` response header.
 */
const requestIdMiddleware = (req, res, next) => {
  // Use existing header if provided (e.g. from upstream gateway/load balancer), otherwise generate a new one
  const reqId = req.headers['x-request-id'] || `req_${crypto.randomBytes(8).toString('hex')}`;
  req.id = reqId;
  req.startTime = Date.now();
  req.startHrTime = process.hrtime();

  res.setHeader('X-Request-Id', reqId);
  next();
};

module.exports = {
  requestIdMiddleware,
};
