const { embeddingQueue } = require('../queue');
const embeddingService = require('../../services/embedding.service');
const movieRepository = require('../../repositories/movie.repository');
const { pool, isDatabaseConnected } = require('../../config/database');
const logger = require('../../utils/logger');

/**
 * Worker logic for processing embedding generation jobs (Phase 12)
 */
const processEmbeddingJob = async (job) => {
  const { movie } = job.data;
  if (!movie || !movie.id) {
    throw new Error('Invalid movie payload for embedding generation');
  }

  const searchableText =
    movie.searchable_text ||
    `Title: ${movie.title}. Genres: ${(movie.genres || []).map((g) => (typeof g === 'object' ? g.name : g)).join(', ')}. Overview: ${movie.overview || ''} Tagline: ${movie.tagline || ''}`;

  logger.info(`[Worker: embedding] Generating vector embedding for "${movie.title}" (ID: ${movie.id})...`);

  // Generate 1536-dim embedding vector
  const embedding = await embeddingService.generateEmbedding(searchableText);

  // Update repository / database
  movie.embedding = embedding;
  movie.embedding_status = 'COMPLETED';

  if (isDatabaseConnected() && pool) {
    try {
      await pool.query(
        'UPDATE movies SET embedding = $1, embedding_status = $2, updated_at = CURRENT_TIMESTAMP WHERE tmdb_id = $3',
        [`[${embedding.join(',')}]`, 'COMPLETED', movie.id]
      );
    } catch (err) {
      logger.warn(`Could not update embedding in database for movie ${movie.id}:`, { error: err.message });
    }
  }

  await movieRepository.upsertMovie(movie);
  logger.info(`[Worker: embedding] Vector successfully stored for "${movie.title}" (${embedding.length} dimensions).`);

  return { movieId: movie.id, status: 'COMPLETED', dimensions: embedding.length };
};

// Register handler on queue
if (embeddingQueue && typeof embeddingQueue.process === 'function') {
  embeddingQueue.process(processEmbeddingJob);
}

module.exports = { processEmbeddingJob };
