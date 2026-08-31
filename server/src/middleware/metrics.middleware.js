const metricsService = require('../services/metrics.service');
const logger = require('../utils/logger');

/**
 * Response Timing & Metrics Middleware
 * Intercepts the end of every HTTP response to measure exact latency and register metrics.
 */
const metricsMiddleware = (req, res, next) => {
  const startHr = process.hrtime();
  const startTime = Date.now();

  // Capture response finish
  res.on('finish', () => {
    const diff = process.hrtime(startHr);
    const latencyMs = diff[0] * 1000 + diff[1] / 1e6;

    // Detect if this request was served via cache (set on res.locals.cacheStatus or header)
    const cacheStatus = res.locals.cacheStatus || (res.statusCode === 304 ? 'HIT' : 'NONE');

    metricsService.recordRequest(req, res, latencyMs, cacheStatus);

    // Structured trace log
    logger.http(`${req.method} ${req.originalUrl || req.url} ${res.statusCode} - ${latencyMs.toFixed(2)}ms`, {
      request_id: req.id,
      route: req.baseUrl + req.path,
      method: req.method,
      status: res.statusCode,
      latency_ms: Math.round(latencyMs * 100) / 100,
      cache: cacheStatus,
    });
  });

  next();
};

module.exports = {
  metricsMiddleware,
};
