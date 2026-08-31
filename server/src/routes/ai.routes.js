const { Router } = require('express');
const aiController = require('../controllers/ai.controller');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');

const router = Router();

// Semantic Vector Search endpoint
router.get('/semantic-search', aiLimiter, (req, res, next) => aiController.semanticSearch(req, res, next));
router.get('/ingest', (req, res, next) => aiController.triggerIngestion(req, res, next));
router.get('/ingest/status', (req, res) => aiController.getIngestionStatus(req, res));

module.exports = router;
