const { redisClient, isRedisConnected } = require('../config/redis');
const logger = require('../utils/logger');

// In-memory sliding window fallback store
const memoryRateStore = new Map();

/**
 * Creates a sliding-window rate limiter middleware
 * @param {Object} options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Max allowed requests per window
 * @param {string} options.keyPrefix - Prefix for rate limit keys
 * @param {string} options.message - Error message when rate limit is exceeded
 */
const createRateLimiter = ({
  windowMs = 60000, // 1 minute
  max = 60,
  keyPrefix = 'rl',
  message = 'Too many requests, please try again later.',
} = {}) => {
  return async (req, res, next) => {
    // Identify user by auth ID or client IP
    const identifier = req.userId || req.headers['x-user-id'] || req.ip || 'anonymous';
    const rateKey = `${keyPrefix}:${identifier}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    if (isRedisConnected() && redisClient) {
      try {
        const multi = redisClient.multi();
        // Remove timestamps outside current window
        multi.zremrangebyscore(rateKey, 0, windowStart);
        // Add current timestamp
        multi.zadd(rateKey, now, `${now}-${Math.random()}`);
        // Count entries in current window
        multi.zcard(rateKey);
        // Set key TTL
        multi.expire(rateKey, Math.ceil(windowMs / 1000));

        const results = await multi.exec();
        const requestCount = results[2][1];

        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, max - requestCount));
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

        if (requestCount > max) {
          const retryAfter = Math.ceil(windowMs / 1000);
          res.setHeader('Retry-After', retryAfter);
          logger.warn(`[RateLimit 429] Exceeded for ${rateKey}: ${requestCount}/${max}`);
          return res.status(429).json({
            success: false,
            error: message,
            retryAfter,
          });
        }
        return next();
      } catch (err) {
        logger.warn('Redis rate limiter error, falling back to memory:', { error: err.message });
      }
    }

    // Memory sliding window fallback
    let userRequests = memoryRateStore.get(rateKey) || [];
    userRequests = userRequests.filter((timestamp) => timestamp > windowStart);
    userRequests.push(now);
    memoryRateStore.set(rateKey, userRequests);

    const count = userRequests.length;
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    if (count > max) {
      const retryAfter = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', retryAfter);
      logger.warn(`[RateLimit 429 Memory] Exceeded for ${rateKey}: ${count}/${max}`);
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter,
      });
    }

    next();
  };
};

// Specialized Rate Limiters
const searchLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  keyPrefix: 'rl:search',
  message: 'Search rate limit exceeded (60 requests per minute). Please slow down.',
});

const aiLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 20,
  keyPrefix: 'rl:ai',
  message: 'AI recommendations rate limit exceeded (20 requests per minute).',
});

const generalLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  keyPrefix: 'rl:general',
  message: 'Too many requests. Please try again later.',
});

module.exports = {
  createRateLimiter,
  searchLimiter,
  aiLimiter,
  generalLimiter,
};
