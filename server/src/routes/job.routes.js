const { Router } = require('express');
const { ingestionQueue, recommendationQueue, getQueueMetrics } = require('../jobs/queue');
const { requireAuth } = require('../middleware/auth.middleware');

const router = Router();

router.get('/metrics', async (req, res, next) => {
  try {
    const metrics = await getQueueMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/ingest', async (req, res, next) => {
  try {
    const category = req.body.category || 'popular';
    const page = parseInt(req.body.page || '1', 10);
    const job = await ingestionQueue.add('ingest-category', { category, page });
    res.status(202).json({
      success: true,
      message: `Background ingestion job enqueued for ${category} (page ${page})`,
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
});

router.post('/refresh-recommendations', requireAuth, async (req, res, next) => {
  try {
    const userId = req.userId;
    const job = await recommendationQueue.add('refresh-user-recs', { userId });
    res.status(202).json({
      success: true,
      message: `Background recommendation refresh enqueued for user ${userId}`,
      jobId: job.id,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
