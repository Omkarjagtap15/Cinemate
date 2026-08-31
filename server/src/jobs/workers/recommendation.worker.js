const { recommendationQueue } = require('../queue');
const recommendationService = require('../../services/recommendation.service');
const { cacheService } = require('../../services/cache.service');
const logger = require('../../utils/logger');

/**
 * Worker logic for refreshing and pre-caching user recommendations in background
 */
const processRecommendationJob = async (job) => {
  const { userId } = job.data;
  if (!userId) {
    throw new Error('UserId is required for recommendation refresh');
  }

  logger.info(`[Worker: recommendation] Pre-computing personalized recommendations for user: ${userId}...`);
  const recs = await recommendationService.getRecommendationsForUser(userId, 18);

  // Pre-warm cache
  const cacheKey = `user:recs:${userId}`;
  await cacheService.set(cacheKey, recs, 600); // 10 minutes cache

  logger.info(`[Worker: recommendation] Successfully pre-cached ${recs.length} recommendations for user: ${userId}`);
  return { userId, count: recs.length };
};

if (recommendationQueue && typeof recommendationQueue.process === 'function') {
  recommendationQueue.process(processRecommendationJob);
}

module.exports = { processRecommendationJob };
