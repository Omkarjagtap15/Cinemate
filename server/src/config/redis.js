const Redis = require('ioredis');
const config = require('./env');
const logger = require('../utils/logger');

let redisClient = null;
let isRedisConnected = false;

// In-memory fallback LRU cache store with TTL
class MemoryCacheStore {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = 900) {
    const expireAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expireAt });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expireAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  del(key) {
    this.store.delete(key);
  }

  flush() {
    this.store.clear();
  }

  clear() {
    this.store.clear();
  }

  size() {
    return this.store.size;
  }
}

const memoryStore = new MemoryCacheStore();

try {
  if (process.env.NODE_ENV !== 'test') {
    redisClient = new Redis(config.REDIS_URL, {
      maxRetriesPerRequest: 1,
      connectTimeout: 3000,
      retryStrategy(times) {
        if (times > 3) {
          logger.warn('⚠️ Redis unreachable, using resilient in-memory cache store.');
          return null; // Stop retrying
        }
        return Math.min(times * 1000, 3000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      isRedisConnected = true;
      logger.info('⚡ Redis connected successfully');
    });

    redisClient.on('error', (err) => {
      isRedisConnected = false;
      logger.warn('⚠️ Redis error/unavailable (fallback active):', { error: err.message });
    });

    // Attempt non-blocking connection
    redisClient.connect().catch((err) => {
      isRedisConnected = false;
      logger.warn('⚠️ Redis connection failed on startup, in-memory cache active:', { error: err.message });
    });
  }
} catch (error) {
  logger.warn('Redis initialization deferred:', { error: error.message });
}

module.exports = {
  redisClient,
  memoryStore,
  isRedisConnected: () => isRedisConnected,
};
