const { Router } = require('express');
const favoriteController = require('../controllers/favorite.controller');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.use(requireAuth);

router.get('/', (req, res, next) => favoriteController.getFavorites(req, res, next));
router.post('/', (req, res, next) => favoriteController.addFavorite(req, res, next));
router.delete('/:movieId', (req, res, next) => favoriteController.removeFavorite(req, res, next));

module.exports = router;
