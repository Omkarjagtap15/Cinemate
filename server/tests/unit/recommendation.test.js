const recommendationService = require('../../src/services/recommendation.service');
const embeddingService = require('../../src/services/embedding.service');

describe('Hybrid Recommendation Engine & Vector Similarity', () => {
  test('Cosine similarity of identical vectors should equal 1.0', () => {
    const vecA = [0.5, 0.5, 0.5, 0.5];
    const vecB = [0.5, 0.5, 0.5, 0.5];
    const similarity = embeddingService.cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(1.0, 4);
  });

  test('Cosine similarity of orthogonal vectors should equal 0.0', () => {
    const vecA = [1.0, 0.0, 0.0];
    const vecB = [0.0, 1.0, 0.0];
    const similarity = embeddingService.cosineSimilarity(vecA, vecB);
    expect(similarity).toBeCloseTo(0.0, 4);
  });

  test('Deterministic vector generator produces 1536-dimensional normalized vector', () => {
    const vector = embeddingService.generateDeterministicVector('sci-fi space thriller', 1536);
    expect(vector.length).toBe(1536);

    // Check L2 norm is 1
    let norm = 0;
    for (let val of vector) norm += val * val;
    expect(Math.sqrt(norm)).toBeCloseTo(1.0, 2);
  });

  test('Cold-start recommendation generator provides explainable reasons', () => {
    const sampleMovies = [
      { id: 1, title: 'Inception', vote_average: 8.8, popularity: 120 },
      { id: 2, title: 'B-Movie', vote_average: 4.2, popularity: 20 },
    ];
    const recs = recommendationService.generateColdStartRecommendations(sampleMovies, 2);
    expect(recs.length).toBe(2);
    expect(recs[0].title).toBe('Inception');
    expect(recs[0].recommendationReason).toBe('Top Rated Masterpiece');
  });

  test('Configurable scoring weights can be updated dynamically', () => {
    const original = recommendationService.getWeights();
    recommendationService.updateWeights({ semanticSimilarity: 0.50 });
    expect(recommendationService.getWeights().semanticSimilarity).toBe(0.50);
    // Restore
    recommendationService.updateWeights(original);
  });
});
