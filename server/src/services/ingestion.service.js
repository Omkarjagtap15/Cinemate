const tmdbService = require('./tmdb.service');
const movieRepository = require('../repositories/movie.repository');
const logger = require('../utils/logger');

class IngestionService {
  constructor() {
    this.isIngesting = false;
    this.totalIngested = 0;
  }

  /**
   * Ingests movies across multiple categories from TMDB into the database.
   * @param {number} pagesPerCategory - Number of pages to ingest per category
   */
  async ingestAll(pagesPerCategory = 2) {
    if (this.isIngesting) {
      logger.warn('Movie ingestion already in progress, skipping duplicate invocation.');
      return { status: 'in_progress', totalIngested: this.totalIngested };
    }

    this.isIngesting = true;
    logger.info(`🎬 Starting movie metadata ingestion (${pagesPerCategory} pages per feed)...`);

    try {
      const categories = [
        () => tmdbService.getPopular(1),
        () => tmdbService.getPopular(2),
        () => tmdbService.getTopRated(1),
        () => tmdbService.getTopRated(2),
        () => tmdbService.getTrending('day', 1),
        () => tmdbService.getNowPlaying(1),
        () => tmdbService.getUpcoming(1),
      ];

      const rawResults = await Promise.allSettled(categories.map((fn) => fn()));
      const moviesMap = new Map();

      for (const res of rawResults) {
        if (res.status === 'fulfilled' && res.value?.results) {
          for (const movie of res.value.results) {
            if (movie.id && !moviesMap.has(movie.id)) {
              moviesMap.set(movie.id, movie);
            }
          }
        }
      }

      logger.info(`Fetched ${moviesMap.size} unique movies from TMDB. Processing embeddings and normalizations...`);

      // Upsert and generate embeddings
      for (const [_, movie] of moviesMap.entries()) {
        try {
          await movieRepository.upsertMovie(movie);
          this.totalIngested++;
        } catch (err) {
          logger.warn(`Failed to ingest movie ID ${movie.id}:`, { error: err.message });
        }
      }

      logger.info(`✅ Movie ingestion complete. Total movies indexed: ${this.totalIngested}`);
      return {
        status: 'completed',
        totalIngested: this.totalIngested,
        indexedCount: movieRepository.count(),
      };
    } catch (error) {
      logger.error('Error during movie ingestion:', { error: error.message });
      throw error;
    } finally {
      this.isIngesting = false;
    }
  }

  getStatus() {
    return {
      isIngesting: this.isIngesting,
      totalIngested: this.totalIngested,
      databaseCount: movieRepository.count(),
    };
  }
}

module.exports = new IngestionService();
