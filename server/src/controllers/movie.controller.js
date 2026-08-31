const tmdbService = require('../services/tmdb.service');
const logger = require('../utils/logger');

class MovieController {
  async getNowPlaying(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const data = await tmdbService.getNowPlaying(page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getPopular(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const data = await tmdbService.getPopular(page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTopRated(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const data = await tmdbService.getTopRated(page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getTrending(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const timeWindow = req.query.timeWindow || 'day';
      const data = await tmdbService.getTrending(timeWindow, page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUpcoming(req, res, next) {
    try {
      const page = parseInt(req.query.page || '1', 10);
      const data = await tmdbService.getUpcoming(page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async search(req, res, next) {
    try {
      const { query, page, year, rating, genre } = req.query;
      if (!query || query.trim() === '') {
        return res.json({ success: true, page: 1, results: [], total_pages: 0, total_results: 0 });
      }

      const filters = { year, rating, genre };
      const data = await tmdbService.searchMovies(query, parseInt(page || '1', 10), filters);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }

  async getDetails(req, res, next) {
    try {
      const movieId = req.params.id;
      const data = await tmdbService.getMovieDetails(movieId);
      res.json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  async getCredits(req, res, next) {
    try {
      const movieId = req.params.id;
      const data = await tmdbService.getMovieCredits(movieId);
      res.json({ success: true, cast: data.cast, crew: data.crew });
    } catch (error) {
      next(error);
    }
  }

  async getVideos(req, res, next) {
    try {
      const movieId = req.params.id;
      const data = await tmdbService.getMovieVideos(movieId);
      res.json({ success: true, results: data.results });
    } catch (error) {
      next(error);
    }
  }

  async getRecommendations(req, res, next) {
    try {
      const movieId = req.params.id;
      const page = parseInt(req.query.page || '1', 10);
      const data = await tmdbService.getMovieRecommendations(movieId, page);
      res.json({
        success: true,
        page: data.page,
        results: data.results,
        total_pages: data.total_pages,
        total_results: data.total_results,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MovieController();
