const { Router } = require('express');
const movieController = require('../controllers/movie.controller');
const { searchLimiter, generalLimiter } = require('../middleware/rateLimiter.middleware');

const router = Router();

// Apply general rate limiter
router.use(generalLimiter);

// Category endpoints
router.get('/now-playing', (req, res, next) => movieController.getNowPlaying(req, res, next));
router.get('/popular', (req, res, next) => movieController.getPopular(req, res, next));
router.get('/top-rated', (req, res, next) => movieController.getTopRated(req, res, next));
router.get('/trending', (req, res, next) => movieController.getTrending(req, res, next));
router.get('/upcoming', (req, res, next) => movieController.getUpcoming(req, res, next));

// Search endpoint with specific search rate limiter (60 req/min)
router.get('/search', searchLimiter, (req, res, next) => movieController.search(req, res, next));

// Movie detail sub-resources
router.get('/:id', (req, res, next) => movieController.getDetails(req, res, next));
router.get('/:id/credits', (req, res, next) => movieController.getCredits(req, res, next));
router.get('/:id/videos', (req, res, next) => movieController.getVideos(req, res, next));
router.get('/:id/recommendations', (req, res, next) => movieController.getRecommendations(req, res, next));

module.exports = router;
