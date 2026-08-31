const { pool, isDatabaseConnected } = require('../config/database');
const logger = require('../utils/logger');

// In-memory fallback map for environments where Postgres is still booting
const memoryFavorites = new Map();

class FavoriteRepository {
  async getFavoritesByUser(userId) {
    if (isDatabaseConnected() && pool) {
      try {
        const result = await pool.query(
          'SELECT movie_id, movie_data, created_at FROM favorites WHERE user_id = $1 ORDER BY created_at DESC',
          [userId]
        );
        return result.rows.map((row) => ({
          ...row.movie_data,
          id: row.movie_id,
          savedAt: row.created_at,
        }));
      } catch (error) {
        logger.error('Database query error in getFavoritesByUser, falling back to memory:', { error: error.message });
      }
    }

    // Memory fallback
    const userFavs = memoryFavorites.get(userId) || [];
    return userFavs;
  }

  async addFavorite(userId, movie) {
    const movieId = movie.id;
    if (isDatabaseConnected() && pool) {
      try {
        await pool.query(
          `INSERT INTO favorites (user_id, movie_id, movie_data) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (user_id, movie_id) 
           DO UPDATE SET movie_data = $3, created_at = CURRENT_TIMESTAMP`,
          [userId, movieId, JSON.stringify(movie)]
        );
        return { success: true, movie };
      } catch (error) {
        logger.error('Database query error in addFavorite, using memory fallback:', { error: error.message });
      }
    }

    // Memory fallback
    const userFavs = memoryFavorites.get(userId) || [];
    const exists = userFavs.find((m) => m.id === movieId);
    if (!exists) {
      userFavs.unshift(movie);
      memoryFavorites.set(userId, userFavs);
    }
    return { success: true, movie };
  }

  async removeFavorite(userId, movieId) {
    const numMovieId = parseInt(movieId, 10);
    if (isDatabaseConnected() && pool) {
      try {
        await pool.query('DELETE FROM favorites WHERE user_id = $1 AND movie_id = $2', [userId, numMovieId]);
        return { success: true, movieId: numMovieId };
      } catch (error) {
        logger.error('Database query error in removeFavorite, using memory fallback:', { error: error.message });
      }
    }

    // Memory fallback
    const userFavs = memoryFavorites.get(userId) || [];
    const filtered = userFavs.filter((m) => m.id !== numMovieId);
    memoryFavorites.set(userId, filtered);
    return { success: true, movieId: numMovieId };
  }
}

module.exports = new FavoriteRepository();
