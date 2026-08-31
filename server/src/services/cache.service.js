const { redisClient, memoryStore, isRedisConnected } = require('../config/redis');
const logger = require('../utils/logger');
const metricsService = require('./metrics.service');

// Cache TTLs in seconds (configurable with environment variable overrides)
const TTL_CONFIG = {
  SEARCH: parseInt(process.env.CACHE_TTL_SEARCH || '300', 10), // 5 minutes
  DETAILS: parseInt(process.env.CACHE_TTL_DETAILS || '1800', 10), // 30 minutes
  CREDITS: parseInt(process.env.CACHE_TTL_CREDITS || '1800', 10), // 30 minutes
  VIDEOS: parseInt(process.env.CACHE_TTL_VIDEOS || '1800', 10), // 30 minutes
  RECOMMENDATIONS: parseInt(process.env.CACHE_TTL_RECS || '900', 10), // 15 minutes
  TRENDING: parseInt(process.env.CACHE_TTL_TRENDING || '600', 10), // 10 minutes
  POPULAR: parseInt(process.env.CACHE_TTL_POPULAR || '1800', 10), // 30 minutes
  CATEGORY: parseInt(process.env.CACHE_TTL_CATEGORY || '900', 10), // 15 minutes
  DEFAULT: parseInt(process.env.CACHE_TTL_DEFAULT || '900', 10), // 15 minutes
};

class CacheService {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.sets = 0;
  }

  // Key Generators
  generateSearchKey(query, page = 1, filters = {}) {
    const filterKey = Object.entries(filters)
      .filter(([_, v]) => v)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    return `movie:search:${query.toLowerCase().trim()}:${page}${filterKey ? `:${filterKey}` : ''}`;
  }

  generateDetailKey(movieId) {
    return `movie:details:${movieId}`;
  }

  generateCreditsKey(movieId) {
    return `movie:credits:${movieId}`;
  }

  generateVideosKey(movieId) {
    return `movie:videos:${movieId}`;
  }

  generateRecsKey(movieId, page = 1) {
    return `movie:recommendations:${movieId}:${page}`;
  }

  generateCategoryKey(category, page = 1, extra = '') {
    return `movie:${category}:${page}${extra ? `:${extra}` : ''}`;
  }

  getCategoryFromKey(key) {
    if (!key) return 'general';
    const parts = key.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}`;
    }
    return 'general';
  }

  // Cache Operations
  async get(key) {
    const category = this.getCategoryFromKey(key);

    if (isRedisConnected() && redisClient) {
      try {
        const raw = await redisClient.get(key);
        if (raw) {
          this.hits++;
          metricsService.recordCacheHit(category);
          logger.debug(`Cache HIT (Redis): ${key}`);
          return JSON.parse(raw);
        }
      } catch (err) {
        logger.warn(`Redis get error for key ${key}:`, { error: err.message });
      }
    }

    // Memory cache fallback
    const memData = memoryStore.get(key);
    if (memData) {
      this.hits++;
      metricsService.recordCacheHit(category);
      logger.debug(`Cache HIT (Memory): ${key}`);
      return memData;
    }

    this.misses++;
    metricsService.recordCacheMiss(category);
    logger.debug(`Cache MISS: ${key}`);
    return null;
  }

  async set(key, value, ttlSeconds = TTL_CONFIG.DEFAULT) {
    this.sets++;
    metricsService.recordCacheSet();
    const serialized = JSON.stringify(value);

    if (isRedisConnected() && redisClient) {
      try {
        await redisClient.set(key, serialized, 'EX', ttlSeconds);
        logger.debug(`Cache SET (Redis): ${key} (TTL: ${ttlSeconds}s)`);
        return;
      } catch (err) {
        logger.warn(`Redis set error for key ${key}:`, { error: err.message });
      }
    }

    // Memory cache fallback
    memoryStore.set(key, value, ttlSeconds);
    logger.debug(`Cache SET (Memory): ${key} (TTL: ${ttlSeconds}s)`);
  }

  async del(key) {
    metricsService.recordCacheDel();
    if (isRedisConnected() && redisClient) {
      try {
        await redisClient.del(key);
      } catch (err) {
        logger.warn(`Redis del error for key ${key}:`, { error: err.message });
      }
    }
    memoryStore.del(key);
  }

  async clear() {
    if (isRedisConnected() && redisClient) {
      try {
        await redisClient.flushdb();
      } catch (err) {
        logger.warn('Redis flushdb error:', { error: err.message });
      }
    }
    memoryStore.clear();
  }

  getMetrics() {
    return metricsService.getConsolidatedMetrics().caching;
  }
}

const cacheService = new CacheService();
module.exports = {
  cacheService,
  TTL_CONFIG,
};
