const favoriteRepository = require('../repositories/favorite.repository');

class FavoriteController {
  async getFavorites(req, res, next) {
    try {
      const userId = req.userId;
      const favorites = await favoriteRepository.getFavoritesByUser(userId);
      res.json({
        success: true,
        count: favorites.length,
        data: favorites,
      });
    } catch (error) {
      next(error);
    }
  }

  async addFavorite(req, res, next) {
    try {
      const userId = req.userId;
      const movie = req.body;

      if (!movie || !movie.id) {
        return res.status(400).json({ success: false, error: 'Valid movie object with id is required' });
      }

      const result = await favoriteRepository.addFavorite(userId, movie);
      res.status(201).json({
        success: true,
        message: 'Movie added to favorites',
        data: result.movie,
      });
    } catch (error) {
      next(error);
    }
  }

  async removeFavorite(req, res, next) {
    try {
      const userId = req.userId;
      const movieId = req.params.movieId;

      if (!movieId) {
        return res.status(400).json({ success: false, error: 'movieId is required' });
      }

      await favoriteRepository.removeFavorite(userId, movieId);
      res.json({
        success: true,
        message: 'Movie removed from favorites',
        movieId: parseInt(movieId, 10),
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new FavoriteController();
