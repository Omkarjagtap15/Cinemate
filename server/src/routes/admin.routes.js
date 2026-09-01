const { Router } = require('express');
const metricsService = require('../services/metrics.service');
const { cacheService } = require('../services/cache.service');
const singleFlight = require('../services/singleFlight.service');
const { isDatabaseConnected, pool } = require('../config/database');
const { isRedisConnected, redisClient } = require('../config/redis');
const { getQueueMetrics, queues, ingestionQueue } = require('../jobs/queue');
const embeddingService = require('../services/embedding.service');
const movieRepository = require('../repositories/movie.repository');
const tmdbService = require('../services/tmdb.service');
const { requireAdminAuth } = require('../middleware/adminAuth.middleware');
const axios = require('axios');
const config = require('../config/env');

const router = Router();

// Protect all admin endpoints with admin authentication
router.use(requireAdminAuth);

/**
 * 1. GET /api/admin/metrics — Consolidated Overview
 */
router.get('/metrics', (req, res) => {
  const data = metricsService.getConsolidatedMetrics();
  res.json({
    success: true,
    data,
  });
});

/**
 * 2. GET /api/admin/metrics/api — API Latency & Endpoints Breakdown
 */
router.get('/metrics/api', (req, res) => {
  const data = metricsService.getConsolidatedMetrics().api;
  res.json({
    success: true,
    data,
  });
});

/**
 * 3. GET /api/admin/metrics/redis — Cache Hits, Misses & Operations
 */
router.get('/metrics/redis', (req, res) => {
  const caching = metricsService.getConsolidatedMetrics().caching;
  const tmdb = metricsService.getConsolidatedMetrics().tmdb;
  res.json({
    success: true,
    data: {
      ...caching,
      tmdbRequestsPrevented: tmdb.requestsPreventedByCache,
      bandwidthSavingEstimate: tmdb.bandwidthSavingEstimate,
    },
  });
});

/**
 * 4. GET /api/admin/metrics/queue — BullMQ Queue Telemetry
 */
router.get('/metrics/queue', async (req, res) => {
  const queueMetrics = await getQueueMetrics();
  res.json({
    success: true,
    data: queueMetrics,
  });
});

/**
 * 5. GET /api/admin/metrics/ai — AI Vector Search & Embedding Telemetry
 */
router.get('/metrics/ai', (req, res) => {
  const ai = metricsService.getConsolidatedMetrics().ai;
  res.json({
    success: true,
    data: ai,
  });
});

/**
 * 6. GET /api/admin/health/detailed — Deep dependency diagnostics with measured ping latencies
 */
router.get('/health/detailed', async (req, res) => {
  const diagnostics = {};

  // 1. PostgreSQL (Neon Cloud)
  const dbStart = Date.now();
  try {
    if (pool) {
      await pool.query('SELECT 1');
      diagnostics.postgres = {
        status: 'HEALTHY',
        latencyMs: Date.now() - dbStart,
        provider: config.DATABASE_URL.includes('neon.tech') ? 'Neon Serverless Postgres' : 'PostgreSQL',
      };
    } else {
      diagnostics.postgres = { status: 'DISCONNECTED', latencyMs: 0, reason: 'Pool uninitialized' };
    }
  } catch (err) {
    diagnostics.postgres = { status: 'DEGRADED', latencyMs: Date.now() - dbStart, error: err.message };
  }

  // 2. Redis
  const redisStart = Date.now();
  if (isRedisConnected() && redisClient) {
    try {
      await redisClient.ping();
      diagnostics.redis = { status: 'HEALTHY', latencyMs: Date.now() - redisStart, storage: 'Redis Server' };
    } catch (err) {
      diagnostics.redis = { status: 'FALLBACK', latencyMs: Date.now() - redisStart, storage: 'In-Memory Store' };
    }
  } else {
    diagnostics.redis = { status: 'FALLBACK', latencyMs: 0, storage: 'In-Memory Store (Resilient)' };
  }

  // 3. TMDB API
  const tmdbStart = Date.now();
  try {
    await axios.get(`${config.TMDB_BASE_URL}/configuration`, {
      params: { api_key: config.TMDB_API_KEY },
      timeout: 3000,
    });
    diagnostics.tmdb = { status: 'HEALTHY', latencyMs: Date.now() - tmdbStart };
  } catch (err) {
    diagnostics.tmdb = { status: 'DEGRADED', latencyMs: Date.now() - tmdbStart, error: err.message };
  }

  // 4. OpenAI / Embedding Model
  diagnostics.ai = {
    status: config.OPENAI_API_KEY ? 'HEALTHY' : 'FALLBACK_READY',
    provider: config.OPENAI_API_KEY ? 'OpenAI text-embedding-3-small' : 'L2 Deterministic Semantic Embeddings',
    dimensions: 1536,
  };

  // 5. BullMQ Queues
  const queueStats = await getQueueMetrics();
  diagnostics.queues = {
    status: 'HEALTHY',
    activeQueues: Object.keys(queueStats).length,
    queues: queueStats,
  };

  const isHealthy = diagnostics.postgres.status === 'HEALTHY' && diagnostics.tmdb.status === 'HEALTHY';

  res.json({
    success: true,
    overallStatus: isHealthy ? 'HEALTHY' : 'OPERATIONAL_WITH_FALLBACKS',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    services: diagnostics,
  });
});

/**
 * 7. GET /api/admin/ai/inspect-query — Semantic Vector Search Debugger (Phase 17)
 */
router.get('/ai/inspect-query', async (req, res, next) => {
  try {
    const query = req.query.q || 'space exploration';
    const start = Date.now();

    const queryEmbedding = await embeddingService.generateEmbedding(query);
    const embeddingLatency = Date.now() - start;

    const allMovies = await movieRepository.getAllIndexedMovies();
    const scored = allMovies.map((m) => {
      const sim = m.embedding ? embeddingService.cosineSimilarity(queryEmbedding, m.embedding) : 0;
      return {
        id: m.id,
        title: m.title,
        genres: m.genres,
        vote_average: m.vote_average,
        similarityScore: Math.round(sim * 10000) / 10000,
        matchPercentage: Math.round(sim * 100),
      };
    });

    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    const topResults = scored.slice(0, 10);

    metricsService.recordSemanticSearch(Date.now() - start);

    res.json({
      success: true,
      query,
      embeddingModel: config.OPENAI_API_KEY ? 'OpenAI text-embedding-3-small' : 'L2-Normalized Deterministic Vectorizer',
      dimensions: queryEmbedding.length,
      embeddingLatencyMs: embeddingLatency,
      totalMoviesScanned: allMovies.length,
      topMatches: topResults,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * 8. POST /api/admin/demo/clear-cache — Reset cache to demonstrate Cold -> Warm speedup (Phase 9)
 */
router.post('/demo/clear-cache', async (req, res) => {
  await cacheService.clear();
  singleFlight.inFlight.clear();
  res.json({
    success: true,
    message: 'Cache successfully purged. Next API request will trigger a cold TMDB fetch (CACHE MISS).',
  });
});

/**
 * 9. POST /api/admin/demo/test-job — Trigger a test background queue job (Phase 19)
 */
router.post('/demo/test-job', async (req, res) => {
  try {
    const q = ingestionQueue || queues?.ingestionQueue;
    if (!q || typeof q.add !== 'function') {
      return res.status(503).json({
        success: false,
        message: 'Queue service currently unavailable',
      });
    }

    const job = await q.add('test-demo-job', {
      type: 'benchmark-probe',
      timestamp: new Date().toISOString(),
    });

    res.json({
      success: true,
      message: 'Test background job enqueued successfully',
      jobId: job?.id || 'job_' + Date.now(),
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: `Failed to enqueue test job: ${err.message}`,
    });
  }
});

module.exports = router;
