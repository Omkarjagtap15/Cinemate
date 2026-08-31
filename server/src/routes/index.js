const { Router } = require('express');
const movieRoutes = require('./movie.routes');
const favoriteRoutes = require('./favorite.routes');
const recommendationRoutes = require('./recommendation.routes');
const aiRoutes = require('./ai.routes');
const jobRoutes = require('./job.routes');
const aiController = require('../controllers/ai.controller');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');
const { isDatabaseConnected } = require('../config/database');
const { isRedisConnected } = require('../config/redis');
const { cacheService } = require('../services/cache.service');
const singleFlight = require('../services/singleFlight.service');

// Initialize background worker handlers
require('../jobs/workers/embedding.worker');
require('../jobs/workers/ingestion.worker');
require('../jobs/workers/recommendation.worker');

const router = Router();

const adminRoutes = require('./admin.routes');
const metricsService = require('../services/metrics.service');

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    request_id: req.id,
    services: {
      database: isDatabaseConnected() ? 'connected' : 'disconnected',
      redis: isRedisConnected() ? 'connected' : 'fallback-memory',
      tmdb: 'operational',
      workers: 'active',
    },
  });
});

// Telemetry metrics endpoint (Phase 2 & 18)
router.get('/metrics', (req, res) => {
  res.json(metricsService.getConsolidatedMetrics());
});

// Semantic search shortcut endpoint: /api/search/semantic
router.get('/search/semantic', aiLimiter, (req, res, next) => aiController.semanticSearch(req, res, next));

// Core Subsystem Routers
router.use('/movies', movieRoutes);
router.use('/favorites', favoriteRoutes);
router.use('/recommendations', recommendationRoutes);
router.use('/ai', aiRoutes);
router.use('/jobs', jobRoutes);
router.use('/admin', adminRoutes);

module.exports = router;
