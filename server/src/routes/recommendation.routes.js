const { Router } = require('express');
const recommendationController = require('../controllers/recommendation.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { aiLimiter } = require('../middleware/rateLimiter.middleware');

const router = Router();

router.use(requireAuth);
router.use(aiLimiter);

router.get('/', (req, res, next) => recommendationController.getPersonalizedRecommendations(req, res, next));
router.get('/weights', (req, res) => recommendationController.getWeights(req, res));

module.exports = router;
