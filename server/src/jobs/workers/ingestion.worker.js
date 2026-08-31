const { ingestionQueue, embeddingQueue } = require('../queue');
const tmdbService = require('../../services/tmdb.service');
const movieRepository = require('../../repositories/movie.repository');
const logger = require('../../utils/logger');

/**
 * Worker logic for processing TMDB movie ingestion jobs (Phase 11)
 */
const processIngestionJob = async (job) => {
  const { category = 'popular', page = 1 } = job.data;
  logger.info(`[Worker: ingestion] Processing ingestion job for category: ${category}, page: ${page}...`);

  let data;
  switch (category) {
    case 'popular':
      data = await tmdbService.getPopular(page);
      break;
    case 'top_rated':
      data = await tmdbService.getTopRated(page);
      break;
    case 'trending':
      data = await tmdbService.getTrending('day', page);
      break;
    case 'now_playing':
      data = await tmdbService.getNowPlaying(page);
      break;
    default:
      data = await tmdbService.getPopular(page);
  }

  const movies = data.results || [];
  logger.info(`[Worker: ingestion] Ingested ${movies.length} movies for ${category}. Enqueuing embedding jobs...`);

  const enqueuedJobs = [];
  for (const movie of movies) {
    await movieRepository.upsertMovie(movie);
    // Queue background embedding generation
    const embJob = await embeddingQueue.add('generate-embedding', { movie });
    enqueuedJobs.push(embJob.id);
  }

  return {
    category,
    page,
    moviesIngested: movies.length,
    embeddingJobsEnqueued: enqueuedJobs.length,
  };
};

if (ingestionQueue && typeof ingestionQueue.process === 'function') {
  ingestionQueue.process(processIngestionJob);
}

module.exports = { processIngestionJob };
