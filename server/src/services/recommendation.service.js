const movieRepository = require('../repositories/movie.repository');
const favoriteRepository = require('../repositories/favorite.repository');
const embeddingService = require('./embedding.service');
const logger = require('../utils/logger');

// Configurable hybrid recommendation weights
const DEFAULT_WEIGHTS = {
  semanticSimilarity: parseFloat(process.env.REC_WEIGHT_SEMANTIC || '0.35'),
  genreAffinity: parseFloat(process.env.REC_WEIGHT_GENRE || '0.25'),
  ratingQuality: parseFloat(process.env.REC_WEIGHT_RATING || '0.20'),
  popularity: parseFloat(process.env.REC_WEIGHT_POPULARITY || '0.10'),
  historyPenalty: parseFloat(process.env.REC_WEIGHT_HISTORY || '0.10'),
};

class RecommendationService {
  constructor(weights = DEFAULT_WEIGHTS) {
    this.weights = weights;
  }

  /**
   * Generates personalized hybrid recommendations for a user.
   * @param {string} userId - Authenticated or guest user ID
   * @param {number} limit - Maximum number of recommendations
   * @returns {Promise<Array<{ movie: Object, score: number, reason: string }>>}
   */
  async getRecommendationsForUser(userId, limit = 12) {
    // 1. Fetch user history and favorites
    const favorites = await favoriteRepository.getFavoritesByUser(userId);
    const allMovies = await movieRepository.getAllMovies();

    if (allMovies.length === 0) {
      return [];
    }

    // 2. Cold-start strategy if user has no saved favorites
    if (!favorites || favorites.length === 0) {
      return this.generateColdStartRecommendations(allMovies, limit);
    }

    // 3. Extract user genre affinity profile
    const genreCounts = {};
    const favoriteIds = new Set(favorites.map((f) => f.id));

    favorites.forEach((fav) => {
      const genres = fav.genres || [];
      genres.forEach((g) => {
        const name = typeof g === 'object' ? g.name : g;
        if (name) genreCounts[name] = (genreCounts[name] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([name]) => name);

    // 4. Synthesize user preference vector from favorited movies
    let userPreferenceVector = new Array(1536).fill(0);
    let vectorCount = 0;

    for (const fav of favorites) {
      if (fav.embedding && fav.embedding.length === 1536) {
        for (let i = 0; i < 1536; i++) {
          userPreferenceVector[i] += fav.embedding[i];
        }
        vectorCount++;
      }
    }

    if (vectorCount > 0) {
      for (let i = 0; i < 1536; i++) {
        userPreferenceVector[i] /= vectorCount;
      }
    }

    // 5. Score candidates with the Hybrid Recommendation Formula
    const scoredCandidates = allMovies.map((movie) => {
      const isAlreadyFavorited = favoriteIds.has(movie.id);

      // Semantic Vector Similarity
      let semanticScore = 0;
      if (vectorCount > 0 && movie.embedding) {
        semanticScore = Math.max(0, embeddingService.cosineSimilarity(userPreferenceVector, movie.embedding));
      }

      // Genre Affinity
      const movieGenres = (movie.genres || []).map((g) => (typeof g === 'object' ? g.name : g));
      let genreOverlapCount = 0;
      movieGenres.forEach((g) => {
        if (genreCounts[g]) genreOverlapCount += genreCounts[g];
      });
      const genreScore = Math.min(1.0, genreOverlapCount / (topGenres.length || 1));

      // Rating Quality
      const ratingScore = Math.min(1.0, (movie.vote_average || 0) / 10.0);

      // Popularity
      const popularityScore = Math.min(1.0, (movie.popularity || 0) / 200.0);

      // Penalty for already favorited/seen items
      const historyPenalty = isAlreadyFavorited ? this.weights.historyPenalty : 0;

      // Final Hybrid Score
      const finalScore =
        this.weights.semanticSimilarity * semanticScore +
        this.weights.genreAffinity * genreScore +
        this.weights.ratingQuality * ratingScore +
        this.weights.popularity * popularityScore -
        historyPenalty;

      // 6. Generate Explainable Reason (Phase 10)
      const reason = this.generateExplanation(movie, favorites, topGenres, genreScore, isAlreadyFavorited);

      return {
        ...movie,
        matchScore: parseFloat(Math.max(0, Math.min(1, finalScore)).toFixed(3)),
        matchPercentage: Math.round(Math.max(0, Math.min(1, finalScore)) * 100),
        recommendationReason: reason,
      };
    });

    // 7. Sort by score and return top candidates
    return scoredCandidates
      .filter((m) => !favoriteIds.has(m.id)) // Filter out already favorited items
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  /**
   * Deterministic Explainability Engine (Phase 10)
   */
  generateExplanation(movie, favorites, topGenres, genreScore, isAlreadyFavorited) {
    const movieGenres = (movie.genres || []).map((g) => (typeof g === 'object' ? g.name : g));
    const matchingGenres = movieGenres.filter((g) => topGenres.includes(g));

    // Find nearest neighbor among favorited movies
    let closestFavorite = null;
    let maxSim = -1;

    if (movie.embedding) {
      for (const fav of favorites) {
        if (fav.embedding) {
          const sim = embeddingService.cosineSimilarity(movie.embedding, fav.embedding);
          if (sim > maxSim && sim > 0.65) {
            maxSim = sim;
            closestFavorite = fav;
          }
        }
      }
    }

    if (closestFavorite) {
      return `Because you liked "${closestFavorite.title}"`;
    }

    if (matchingGenres.length > 0) {
      return `Recommended because you love ${matchingGenres.slice(0, 2).join(' & ')} movies`;
    }

    if (movie.vote_average >= 8.0) {
      return `Critically acclaimed with a ${movie.vote_average.toFixed(1)}/10 community rating`;
    }

    return `Trending highly in community discovery`;
  }

  /**
   * Cold start recommendations for new users
   */
  generateColdStartRecommendations(allMovies, limit = 12) {
    return allMovies
      .map((movie) => {
        const ratingNorm = (movie.vote_average || 0) / 10;
        const popNorm = Math.min(1, (movie.popularity || 0) / 200);
        const score = 0.6 * ratingNorm + 0.4 * popNorm;

        return {
          ...movie,
          matchScore: parseFloat(score.toFixed(3)),
          matchPercentage: Math.round(score * 100),
          recommendationReason:
            movie.vote_average >= 8.0
              ? 'Top Rated Masterpiece'
              : 'Popular recommendation for you',
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
  }

  getWeights() {
    return this.weights;
  }

  updateWeights(newWeights) {
    this.weights = { ...this.weights, ...newWeights };
    return this.weights;
  }
}

module.exports = new RecommendationService();
