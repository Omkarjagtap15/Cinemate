const axios = require('axios');
const config = require('../config/env');
const logger = require('../utils/logger');
const { cacheService, TTL_CONFIG } = require('./cache.service');
const singleFlight = require('./singleFlight.service');
const metricsService = require('./metrics.service');
const movieRepository = require('../repositories/movie.repository');

const tmdbClient = axios.create({
  baseURL: config.TMDB_BASE_URL,
  timeout: 3500, // 3.5s timeout for fast response
  params: {
    api_key: config.TMDB_API_KEY,
  },
});

// Interceptor for logging & latency measurement
tmdbClient.interceptors.request.use((reqConfig) => {
  reqConfig.metadata = { startTime: Date.now() };
  return reqConfig;
});

tmdbClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    metricsService.recordTMDBRequest(duration, true);
    logger.debug(`TMDB API Success: ${response.config.url} (${duration}ms)`);
    return response;
  },
  (error) => {
    const duration = error.config?.metadata ? Date.now() - error.config.metadata.startTime : 0;
    metricsService.recordTMDBRequest(duration, false);
    logger.warn(`TMDB API Error: ${error.config?.url || 'unknown'} (${duration}ms)`, {
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

class TMDBService {
  /**
   * Automatic retry wrapper with fast exponential backoff
   */
  async fetchWithRetry(fn, retries = 1, delayMs = 100) {
    let lastError = null;
    for (let i = 0; i <= retries; i++) {
      try {
        return await fn();
      } catch (err) {
        lastError = err;
        if (err.response && err.response.status >= 400 && err.response.status < 500) {
          throw err;
        }
        if (i < retries) {
          await new Promise((res) => setTimeout(res, delayMs));
        }
      }
    }
    throw lastError;
  }

  /**
   * Helper executing Cached + SingleFlight coalesced fetches
   */
  async executeCached(cacheKey, ttl, fetcher, fallbackFn = null) {
    // 1. Check Cache (Sub-2ms)
    const cached = await cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Coalesce concurrent in-flight requests for the same cache key
    return singleFlight.do(cacheKey, async () => {
      const doubleCheck = await cacheService.get(cacheKey);
      if (doubleCheck) return doubleCheck;

      try {
        const data = await this.fetchWithRetry(fetcher);
        await cacheService.set(cacheKey, data, ttl);
        return data;
      } catch (error) {
        logger.warn(`Upstream TMDB unavailable for ${cacheKey}, using database fallback: ${error.message}`);
        
        let fallbackData = { page: 1, results: [], total_pages: 1, total_results: 0 };
        if (fallbackFn) {
          try {
            fallbackData = await fallbackFn();
          } catch (fbErr) {
            logger.warn(`Fallback execution error: ${fbErr.message}`);
          }
        }

        // Cache fallback data for 60s (Negative Caching Pattern) to prevent repeated upstream hammering
        await cacheService.set(cacheKey, fallbackData, 60);
        return fallbackData;
      }
    });
  }

  async getNowPlaying(page = 1) {
    const key = cacheService.generateCategoryKey('now_playing', page);
    return this.executeCached(
      key,
      TTL_CONFIG.CATEGORY,
      async () => {
        const response = await tmdbClient.get('/movie/now_playing', { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 20), total_pages: 1, total_results: local.length };
      }
    );
  }

  async getPopular(page = 1) {
    const key = cacheService.generateCategoryKey('popular', page);
    return this.executeCached(
      key,
      TTL_CONFIG.POPULAR,
      async () => {
        const response = await tmdbClient.get('/movie/popular', { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 20), total_pages: 1, total_results: local.length };
      }
    );
  }

  async getTopRated(page = 1) {
    const key = cacheService.generateCategoryKey('top_rated', page);
    return this.executeCached(
      key,
      TTL_CONFIG.CATEGORY,
      async () => {
        const response = await tmdbClient.get('/movie/top_rated', { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 20), total_pages: 1, total_results: local.length };
      }
    );
  }

  async getTrending(timeWindow = 'day', page = 1) {
    const key = cacheService.generateCategoryKey('trending', page, timeWindow);
    return this.executeCached(
      key,
      TTL_CONFIG.TRENDING,
      async () => {
        const response = await tmdbClient.get(`/trending/movie/${timeWindow}`, { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 20), total_pages: 1, total_results: local.length };
      }
    );
  }

  async getUpcoming(page = 1) {
    const key = cacheService.generateCategoryKey('upcoming', page);
    return this.executeCached(
      key,
      TTL_CONFIG.CATEGORY,
      async () => {
        const response = await tmdbClient.get('/movie/upcoming', { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 20), total_pages: 1, total_results: local.length };
      }
    );
  }

  async searchMovies(query, page = 1, filters = {}) {
    const key = cacheService.generateSearchKey(query, page, filters);
    return this.executeCached(
      key,
      TTL_CONFIG.SEARCH,
      async () => {
        const params = {
          query,
          page,
          ...(filters.year && { year: filters.year }),
          ...(filters.rating && { 'vote_average.gte': filters.rating }),
          ...(filters.genre && { with_genres: filters.genre }),
        };
        const response = await tmdbClient.get('/search/movie', { params });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        const tokens = query.toLowerCase().split(/\s+/);
        const matches = local.filter((m) => {
          const text = `${m.title} ${m.overview || ''}`.toLowerCase();
          return tokens.some((t) => text.includes(t));
        });
        return { page, results: matches, total_pages: 1, total_results: matches.length };
      }
    );
  }

  async getMovieDetails(movieId) {
    const key = cacheService.generateDetailKey(movieId);
    return this.executeCached(
      key,
      TTL_CONFIG.DETAILS,
      async () => {
        const response = await tmdbClient.get(`/movie/${movieId}`);
        return response.data;
      },
      async () => {
        const m = await movieRepository.getMovieByTmdbId(movieId);
        return m || { id: movieId, title: 'Movie Details', overview: 'Overview currently offline' };
      }
    );
  }

  async getMovieCredits(movieId) {
    const key = cacheService.generateCreditsKey(movieId);
    return this.executeCached(
      key,
      TTL_CONFIG.CREDITS,
      async () => {
        const response = await tmdbClient.get(`/movie/${movieId}/credits`);
        return response.data;
      },
      async () => ({ cast: [], crew: [] })
    );
  }

  async getMovieVideos(movieId) {
    const key = cacheService.generateVideosKey(movieId);
    return this.executeCached(
      key,
      TTL_CONFIG.VIDEOS,
      async () => {
        const response = await tmdbClient.get(`/movie/${movieId}/videos`);
        return response.data;
      },
      async () => ({ results: [] })
    );
  }

  async getMovieRecommendations(movieId, page = 1) {
    const key = cacheService.generateRecsKey(movieId, page);
    return this.executeCached(
      key,
      TTL_CONFIG.RECOMMENDATIONS,
      async () => {
        const response = await tmdbClient.get(`/movie/${movieId}/recommendations`, { params: { page } });
        return response.data;
      },
      async () => {
        const local = await movieRepository.getAllMovies();
        return { page, results: local.slice(0, 10), total_pages: 1, total_results: local.length };
      }
    );
  }
}

module.exports = new TMDBService();
