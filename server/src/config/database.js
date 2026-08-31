const { Pool } = require('pg');
const config = require('./env');
const logger = require('../utils/logger');

let pool = null;
let isConnected = false;

const isSslRequired = config.DATABASE_URL.includes('sslmode=require') || config.DATABASE_URL.includes('neon.tech') || config.DATABASE_URL.includes('supabase');

try {
  pool = new Pool({
    connectionString: config.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    ...(isSslRequired && {
      ssl: {
        rejectUnauthorized: false,
      },
    }),
  });

  pool.on('error', (err) => {
    logger.error('Unexpected error on idle PostgreSQL client', { error: err.message });
  });
} catch (error) {
  logger.warn('PostgreSQL Pool initialization deferred:', { error: error.message });
}

const checkDatabaseConnection = async () => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    isConnected = true;
    logger.info('🐘 PostgreSQL (Neon Cloud) connected successfully');
    return true;
  } catch (error) {
    isConnected = false;
    logger.warn('⚠️ PostgreSQL connection unestablished (running in hybrid/memory fallback mode if needed):', {
      error: error.message,
    });
    return false;
  }
};

module.exports = {
  pool,
  query: async (text, params) => {
    if (!pool) throw new Error('Database pool not initialized');
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: res.rowCount });
    return res;
  },
  checkDatabaseConnection,
  isDatabaseConnected: () => isConnected,
};
