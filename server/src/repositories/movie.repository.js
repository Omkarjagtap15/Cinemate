const { pool, isDatabaseConnected } = require('../config/database');
const embeddingService = require('../services/embedding.service');
const logger = require('../utils/logger');

// Resilient in-memory normalized movie database
const memoryMovies = new Map();

class MovieRepository {
  /**
   * Upsert a normalized movie into PostgreSQL (or memory store)
   */
  async upsertMovie(movie) {
    const tmdbId = movie.id || movie.tmdb_id;
    const title = movie.title || 'Untitled';
    const overview = movie.overview || '';
    const tagline = movie.tagline || '';
    const releaseDate = movie.release_date || null;
    const posterPath = movie.poster_path || null;
    const backdropPath = movie.backdrop_path || null;
    const genres = JSON.stringify(movie.genres || []);
    const castMembers = JSON.stringify(movie.cast_members || movie.cast || []);
    const director = movie.director || '';
    const runtime = movie.runtime || 0;
    const budget = movie.budget || 0;
    const revenue = movie.revenue || 0;
    const voteAverage = movie.vote_average || 0.0;
    const voteCount = movie.vote_count || 0;
    const popularity = movie.popularity || 0.0;

    // Normalized searchable text
    const searchableText = `Title: ${title}. Genres: ${(movie.genres || []).map((g) => (typeof g === 'object' ? g.name : g)).join(', ')}. Director: ${director}. Overview: ${overview} Tagline: ${tagline}`;
    const embedding = movie.embedding || (await embeddingService.generateEmbedding(searchableText));

    const normalizedMovie = {
      id: tmdbId,
      tmdb_id: tmdbId,
      title,
      overview,
      tagline,
      release_date: releaseDate,
      poster_path: posterPath,
      backdrop_path: backdropPath,
      genres: movie.genres || [],
      cast_members: movie.cast_members || movie.cast || [],
      director,
      runtime,
      budget,
      revenue,
      vote_average: voteAverage,
      vote_count: voteCount,
      popularity,
      searchable_text: searchableText,
      embedding,
    };

    if (isDatabaseConnected() && pool) {
      try {
        const query = `
          INSERT INTO movies (
            tmdb_id, title, overview, tagline, release_date, poster_path, backdrop_path,
            genres, cast_members, director, runtime, budget, revenue, vote_average,
            vote_count, popularity
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
          ON CONFLICT (tmdb_id) DO UPDATE SET
            title = EXCLUDED.title,
            overview = EXCLUDED.overview,
            poster_path = EXCLUDED.poster_path,
            backdrop_path = EXCLUDED.backdrop_path,
            genres = EXCLUDED.genres,
            vote_average = EXCLUDED.vote_average,
            popularity = EXCLUDED.popularity,
            updated_at = CURRENT_TIMESTAMP
          RETURNING *;
        `;
        const values = [
          tmdbId, title, overview, tagline, releaseDate, posterPath, backdropPath,
          genres, castMembers, director, runtime, budget, revenue, voteAverage,
          voteCount, popularity,
        ];
        const res = await pool.query(query, values);
        normalizedMovie.dbId = res.rows[0]?.id;
      } catch (err) {
        logger.warn('Database error in upsertMovie, stored in memory fallback:', { error: err.message });
      }
    }

    memoryMovies.set(tmdbId, normalizedMovie);
    return normalizedMovie;
  }

  async getMovieByTmdbId(tmdbId) {
    if (isDatabaseConnected() && pool) {
      try {
        const res = await pool.query('SELECT * FROM movies WHERE tmdb_id = $1', [tmdbId]);
        if (res.rows.length > 0) return res.rows[0];
      } catch (err) {
        logger.warn('Database error in getMovieByTmdbId:', { error: err.message });
      }
    }
    return memoryMovies.get(parseInt(tmdbId, 10)) || null;
  }

  async getAllMovies() {
    if (isDatabaseConnected() && pool) {
      try {
        const res = await pool.query('SELECT * FROM movies ORDER BY popularity DESC LIMIT 200');
        if (res.rows.length > 0) return res.rows;
      } catch (err) {
        logger.warn('Database error in getAllMovies:', { error: err.message });
      }
    }
    return Array.from(memoryMovies.values());
  }

  /**
   * Retrieve all indexed movies with guaranteed embeddings
   */
  async getAllIndexedMovies() {
    // If in-memory store has indexed movies with embeddings, use them
    const memoryList = Array.from(memoryMovies.values());
    if (memoryList.length > 0 && memoryList.some((m) => m.embedding && m.embedding.length > 0)) {
      return memoryList;
    }

    // Otherwise load from database and populate embeddings
    if (isDatabaseConnected() && pool) {
      try {
        const res = await pool.query('SELECT * FROM movies ORDER BY popularity DESC LIMIT 200');
        if (res.rows.length > 0) {
          for (const row of res.rows) {
            const genres = typeof row.genres === 'string' ? JSON.parse(row.genres) : (row.genres || []);
            const castMembers = typeof row.cast_members === 'string' ? JSON.parse(row.cast_members) : (row.cast_members || []);

            let embedding = null;
            if (row.embedding) {
              if (Array.isArray(row.embedding)) {
                embedding = row.embedding;
              } else if (typeof row.embedding === 'string') {
                embedding = row.embedding.replace(/[\[\]]/g, '').split(',').map(Number);
              }
            }

            if (!embedding || embedding.length === 0) {
              const searchableText = `Title: ${row.title}. Genres: ${genres.map((g) => (typeof g === 'object' ? g.name : g)).join(', ')}. Director: ${row.director || ''}. Overview: ${row.overview || ''} Tagline: ${row.tagline || ''}`;
              embedding = await embeddingService.generateEmbedding(searchableText);
            }

            const movieObj = {
              id: row.tmdb_id,
              tmdb_id: row.tmdb_id,
              title: row.title,
              overview: row.overview,
              tagline: row.tagline,
              release_date: row.release_date,
              poster_path: row.poster_path,
              backdrop_path: row.backdrop_path,
              genres,
              cast_members: castMembers,
              director: row.director,
              runtime: row.runtime,
              budget: row.budget,
              revenue: row.revenue,
              vote_average: parseFloat(row.vote_average) || 0,
              vote_count: row.vote_count,
              popularity: parseFloat(row.popularity) || 0,
              embedding,
            };
            memoryMovies.set(row.tmdb_id, movieObj);
          }
          return Array.from(memoryMovies.values());
        }
      } catch (err) {
        logger.warn('Database error in getAllIndexedMovies:', { error: err.message });
      }
    }

    // Seed fallback movies so vector search always works instantly
    try {
      const { SEED_MOVIES } = require('../database/seed');
      if (SEED_MOVIES && SEED_MOVIES.length > 0) {
        for (const seedMovie of SEED_MOVIES) {
          await this.upsertMovie(seedMovie);
        }
      }
    } catch (e) {
      logger.warn('Could not load seed movies fallback:', { error: e.message });
    }

    return Array.from(memoryMovies.values());
  }

  /**
   * Vector similarity search using cosine distance
   */
  async searchByVector(queryEmbedding, limit = 20) {
    const all = await this.getAllIndexedMovies();
    if (all.length === 0) return [];

    const scored = all.map((movie) => {
      const similarity = movie.embedding
        ? embeddingService.cosineSimilarity(queryEmbedding, movie.embedding)
        : 0;
      return {
        ...movie,
        similarityScore: parseFloat(similarity.toFixed(4)),
      };
    });

    // Rank by descending similarity
    return scored
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, limit);
  }

  count() {
    return memoryMovies.size;
  }
}

module.exports = new MovieRepository();
