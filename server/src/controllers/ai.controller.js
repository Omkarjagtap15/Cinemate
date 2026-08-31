const embeddingService = require('../services/embedding.service');
const movieRepository = require('../repositories/movie.repository');
const ingestionService = require('../services/ingestion.service');

class AIController {
  /**
   * Natural Language Semantic Vector Search (Phase 8)
   * Example: "dark psychological thriller with unexpected mind bending plot twists"
   */
  async semanticSearch(req, res, next) {
    try {
      const query = req.query.q || req.query.query;
      const limit = parseInt(req.query.limit || '15', 10);

      if (!query || query.trim() === '') {
        return res.json({
          success: true,
          query: '',
          results: [],
        });
      }

      // Generate query embedding
      const queryEmbedding = await embeddingService.generateEmbedding(query);

      // Perform Cosine Vector Search
      const rankedResults = await movieRepository.searchByVector(queryEmbedding, limit);

      res.json({
        success: true,
        query,
        count: rankedResults.length,
        results: rankedResults.map((movie) => ({
          id: movie.id || movie.tmdb_id,
          title: movie.title,
          overview: movie.overview,
          poster_path: movie.poster_path,
          backdrop_path: movie.backdrop_path,
          release_date: movie.release_date,
          vote_average: movie.vote_average,
          genres: movie.genres,
          similarityScore: movie.similarityScore,
          matchPercentage: Math.round(movie.similarityScore * 100),
        })),
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Trigger on-demand movie ingestion and indexing
   */
  async triggerIngestion(req, res, next) {
    try {
      const pages = parseInt(req.query.pages || '2', 10);
      const result = await ingestionService.ingestAll(pages);
      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  getIngestionStatus(req, res) {
    res.json({
      success: true,
      data: ingestionService.getStatus(),
    });
  }
}

module.exports = new AIController();
