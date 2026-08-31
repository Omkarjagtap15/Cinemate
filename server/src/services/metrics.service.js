const { isDatabaseConnected } = require('../config/database');
const { isRedisConnected } = require('../config/redis');

class MetricsService {
  constructor() {
    this.startTime = Date.now();

    // API Traffic & Latency Metrics
    this.totalRequests = 0;
    this.successfulRequests = 0; // 2xx, 3xx
    this.failedRequests = 0; // 4xx, 5xx
    this.statusCodeDistribution = {
      '2xx': 0,
      '3xx': 0,
      '4xx': 0,
      '5xx': 0,
    };

    // Rolling latency history for percentile calculation (capped at last 5000 requests)
    this.latencyHistory = [];
    this.maxLatencyHistory = 5000;

    // Per-endpoint metrics: path -> { count, totalLatency, latencies: [], errors: 0, hits: 0, misses: 0 }
    this.endpointMetrics = new Map();

    // Redis & Caching metrics
    this.cacheStats = {
      hits: 0,
      misses: 0,
      sets: 0,
      deletes: 0,
      endpointBreakdown: {}, // endpointCategory -> { hits, misses }
    };

    // External TMDB calls
    this.tmdbStats = {
      requests: 0,
      failures: 0,
      totalResponseTimeMs: 0,
      requestsPreventedByCache: 0,
    };

    // AI & Recommendations metrics
    this.aiStats = {
      embeddingRequests: 0,
      embeddingFailures: 0,
      totalEmbeddingLatencyMs: 0,
      semanticSearchRequests: 0,
      totalSemanticSearchLatencyMs: 0,
      recommendationRequests: 0,
      totalRecommendationLatencyMs: 0,
    };

    // Rate Limiting metrics
    this.rateLimitStats = {
      totalBlocked429: 0,
      blockedByEndpoint: {},
    };

    // Recent Request Stream (last 60 requests for live admin dashboard inspection)
    this.recentRequests = [];
    this.maxRecentRequests = 60;
  }

  /**
   * Record completed HTTP request
   */
  recordRequest(req, res, latencyMs, cacheStatus = 'NONE') {
    this.totalRequests++;

    const status = res.statusCode || 200;
    if (status >= 200 && status < 400) {
      this.successfulRequests++;
    } else {
      this.failedRequests++;
    }

    // Status code group
    if (status >= 200 && status < 300) this.statusCodeDistribution['2xx']++;
    else if (status >= 300 && status < 400) this.statusCodeDistribution['3xx']++;
    else if (status >= 400 && status < 500) this.statusCodeDistribution['4xx']++;
    else if (status >= 500) this.statusCodeDistribution['5xx']++;

    // Track 429 rate limit events
    if (status === 429) {
      this.rateLimitStats.totalBlocked429++;
      const normRoute = this.normalizeRoute(req.originalUrl || req.url);
      this.rateLimitStats.blockedByEndpoint[normRoute] =
        (this.rateLimitStats.blockedByEndpoint[normRoute] || 0) + 1;
    }

    // Latency tracking
    this.latencyHistory.push(latencyMs);
    if (this.latencyHistory.length > this.maxLatencyHistory) {
      this.latencyHistory.shift();
    }

    // Per-endpoint grouping
    const route = this.normalizeRoute(req.originalUrl || req.url);
    if (!this.endpointMetrics.has(route)) {
      this.endpointMetrics.set(route, {
        requests: 0,
        totalLatencyMs: 0,
        latencies: [],
        errors: 0,
        hits: 0,
        misses: 0,
      });
    }

    const ep = this.endpointMetrics.get(route);
    ep.requests++;
    ep.totalLatencyMs += latencyMs;
    ep.latencies.push(latencyMs);
    if (ep.latencies.length > 500) ep.latencies.shift();
    if (status >= 400) ep.errors++;

    if (cacheStatus === 'HIT') ep.hits++;
    if (cacheStatus === 'MISS') ep.misses++;

    // Add to recent request stream
    this.recentRequests.unshift({
      id: req.id || `req_${Date.now()}`,
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl || req.url,
      route,
      status,
      latencyMs: Math.round(latencyMs * 100) / 100,
      cacheStatus,
      ip: req.ip || req.connection?.remoteAddress || '127.0.0.1',
    });

    if (this.recentRequests.length > this.maxRecentRequests) {
      this.recentRequests.pop();
    }
  }

  /**
   * Record cache operations
   */
  recordCacheHit(endpointCategory = 'general') {
    this.cacheStats.hits++;
    this.tmdbStats.requestsPreventedByCache++;
    this.initCategoryBreakdown(endpointCategory);
    this.cacheStats.endpointBreakdown[endpointCategory].hits++;
  }

  recordCacheMiss(endpointCategory = 'general') {
    this.cacheStats.misses++;
    this.initCategoryBreakdown(endpointCategory);
    this.cacheStats.endpointBreakdown[endpointCategory].misses++;
  }

  recordCacheSet() {
    this.cacheStats.sets++;
  }

  recordCacheDel() {
    this.cacheStats.deletes++;
  }

  initCategoryBreakdown(category) {
    if (!this.cacheStats.endpointBreakdown[category]) {
      this.cacheStats.endpointBreakdown[category] = { hits: 0, misses: 0 };
    }
  }

  /**
   * Record TMDB external call
   */
  recordTMDBRequest(latencyMs, success = true) {
    this.tmdbStats.requests++;
    this.tmdbStats.totalResponseTimeMs += latencyMs;
    if (!success) {
      this.tmdbStats.failures++;
    }
  }

  /**
   * Record AI Vector search & Embedding operations
   */
  recordEmbeddingRequest(latencyMs, success = true) {
    this.aiStats.embeddingRequests++;
    this.aiStats.totalEmbeddingLatencyMs += latencyMs;
    if (!success) this.aiStats.embeddingFailures++;
  }

  recordSemanticSearch(latencyMs) {
    this.aiStats.semanticSearchRequests++;
    this.aiStats.totalSemanticSearchLatencyMs += latencyMs;
  }

  recordRecommendationRequest(latencyMs) {
    this.aiStats.recommendationRequests++;
    this.aiStats.totalRecommendationLatencyMs += latencyMs;
  }

  /**
   * Normalize URLs for aggregate grouping (e.g. `/api/movies/157336` -> `/api/movies/:id`)
   */
  normalizeRoute(url) {
    if (!url) return '/';
    let clean = url.split('?')[0];
    clean = clean.replace(/\/movies\/\d+/, '/movies/:id');
    clean = clean.replace(/\/favorites\/\d+/, '/favorites/:id');
    return clean;
  }

  /**
   * Calculate exact percentiles from latency array
   */
  calculatePercentiles(samples) {
    if (!samples || samples.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, avg: 0, min: 0, max: 0 };
    }

    const sorted = [...samples].sort((a, b) => a - b);
    const getPercentile = (p) => {
      const idx = Math.ceil((p / 100) * sorted.length) - 1;
      return Math.round((sorted[Math.max(0, idx)] || 0) * 100) / 100;
    };

    const sum = sorted.reduce((acc, v) => acc + v, 0);
    const avg = Math.round((sum / sorted.length) * 100) / 100;

    return {
      p50: getPercentile(50),
      p90: getPercentile(90),
      p95: getPercentile(95),
      p99: getPercentile(99),
      avg,
      min: Math.round(sorted[0] * 100) / 100,
      max: Math.round(sorted[sorted.length - 1] * 100) / 100,
    };
  }

  /**
   * Full consolidated metrics payload for Admin Overview & Telemetry
   */
  getConsolidatedMetrics() {
    const uptimeSec = Math.round(process.uptime());
    const totalCacheOps = this.cacheStats.hits + this.cacheStats.misses;
    const hitRateNum = totalCacheOps > 0 ? (this.cacheStats.hits / totalCacheOps) * 100 : 0;
    const missRateNum = totalCacheOps > 0 ? (this.cacheStats.misses / totalCacheOps) * 100 : 0;

    const globalPercentiles = this.calculatePercentiles(this.latencyHistory);

    // Endpoints array
    const endpoints = [];
    for (const [route, data] of this.endpointMetrics.entries()) {
      const p = this.calculatePercentiles(data.latencies);
      const totalEpCache = data.hits + data.misses;
      const epHitRate = totalEpCache > 0 ? ((data.hits / totalEpCache) * 100).toFixed(1) + '%' : 'N/A';
      const errorRate = data.requests > 0 ? ((data.errors / data.requests) * 100).toFixed(1) + '%' : '0.0%';

      endpoints.push({
        route,
        requests: data.requests,
        avgLatencyMs: p.avg,
        p50LatencyMs: p.p50,
        p95LatencyMs: p.p95,
        p99LatencyMs: p.p99,
        errors: data.errors,
        errorRate,
        cacheHits: data.hits,
        cacheMisses: data.misses,
        cacheHitRate: epHitRate,
      });
    }

    endpoints.sort((a, b) => b.requests - a.requests);

    // Category cache table
    const cacheCategories = Object.entries(this.cacheStats.endpointBreakdown).map(([category, stats]) => {
      const total = stats.hits + stats.misses;
      const hitRate = total > 0 ? ((stats.hits / total) * 100).toFixed(1) + '%' : '0.0%';
      return {
        category,
        hits: stats.hits,
        misses: stats.misses,
        total,
        hitRate,
      };
    });

    const avgTmdbLatency =
      this.tmdbStats.requests > 0
        ? Math.round(this.tmdbStats.totalResponseTimeMs / this.tmdbStats.requests)
        : 0;

    const avgSemanticLatency =
      this.aiStats.semanticSearchRequests > 0
        ? Math.round((this.aiStats.totalSemanticSearchLatencyMs / this.aiStats.semanticSearchRequests) * 100) / 100
        : 0;

    const avgRecsLatency =
      this.aiStats.recommendationRequests > 0
        ? Math.round((this.aiStats.totalRecommendationLatencyMs / this.aiStats.recommendationRequests) * 100) / 100
        : 0;

    return {
      timestamp: new Date().toISOString(),
      uptimeSeconds: uptimeSec,
      overview: {
        totalRequests: this.totalRequests,
        successfulRequests: this.successfulRequests,
        failedRequests: this.failedRequests,
        errorRate:
          this.totalRequests > 0
            ? ((this.failedRequests / this.totalRequests) * 100).toFixed(2) + '%'
            : '0.00%',
        p95LatencyMs: globalPercentiles.p95,
        avgLatencyMs: globalPercentiles.avg,
        redisHitRate: hitRateNum.toFixed(1) + '%',
        tmdbRequests: this.tmdbStats.requests,
        tmdbRequestsPrevented: this.tmdbStats.requestsPreventedByCache,
        aiSemanticSearches: this.aiStats.semanticSearchRequests,
        rateLimit429s: this.rateLimitStats.totalBlocked429,
        databaseConnected: isDatabaseConnected(),
        redisConnected: isRedisConnected(),
      },
      api: {
        totalRequests: this.totalRequests,
        successfulRequests: this.successfulRequests,
        failedRequests: this.failedRequests,
        statusCodes: this.statusCodeDistribution,
        percentiles: globalPercentiles,
        endpoints,
      },
      caching: {
        hits: this.cacheStats.hits,
        misses: this.cacheStats.misses,
        sets: this.cacheStats.sets,
        deletes: this.cacheStats.deletes,
        totalOperations: totalCacheOps,
        hitRate: hitRateNum.toFixed(2) + '%',
        missRate: missRateNum.toFixed(2) + '%',
        storage: isRedisConnected() ? 'Redis Server' : 'High-Speed In-Memory Store',
        categories: cacheCategories,
      },
      tmdb: {
        requests: this.tmdbStats.requests,
        failures: this.tmdbStats.failures,
        averageLatencyMs: avgTmdbLatency,
        requestsPreventedByCache: this.tmdbStats.requestsPreventedByCache,
        bandwidthSavingEstimate:
          this.tmdbStats.requests + this.tmdbStats.requestsPreventedByCache > 0
            ? (
                (this.tmdbStats.requestsPreventedByCache /
                  (this.tmdbStats.requests + this.tmdbStats.requestsPreventedByCache)) *
                100
              ).toFixed(1) + '%'
            : '0.0%',
      },
      ai: {
        embeddingRequests: this.aiStats.embeddingRequests,
        embeddingFailures: this.aiStats.embeddingFailures,
        semanticSearchRequests: this.aiStats.semanticSearchRequests,
        avgSemanticSearchLatencyMs: avgSemanticLatency,
        recommendationRequests: this.aiStats.recommendationRequests,
        avgRecommendationLatencyMs: avgRecsLatency,
      },
      rateLimiting: this.rateLimitStats,
      recentRequests: this.recentRequests,
    };
  }
}

const metricsService = new MetricsService();
module.exports = metricsService;
