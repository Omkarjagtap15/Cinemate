const recommendationService = require('../services/recommendation.service');

class RecommendationController {
  async getPersonalizedRecommendations(req, res, next) {
    try {
      const userId = req.userId;
      const limit = parseInt(req.query.limit || '12', 10);
      const recommendations = await recommendationService.getRecommendationsForUser(userId, limit);

      res.json({
        success: true,
        count: recommendations.length,
        data: recommendations,
        weights: recommendationService.getWeights(),
      });
    } catch (error) {
      next(error);
    }
  }

  getWeights(req, res) {
    res.json({
      success: true,
      weights: recommendationService.getWeights(),
    });
  }
}

module.exports = new RecommendationController();
