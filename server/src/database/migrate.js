const fs = require('fs');
const path = require('path');
const { pool, checkDatabaseConnection } = require('../config/database');
const logger = require('../utils/logger');

const runMigrations = async () => {
  const isConnected = await checkDatabaseConnection();
  if (!isConnected) {
    logger.warn('Skipping migration runner: PostgreSQL connection unavailable.');
    return;
  }

  try {
    const schemaPath = path.join(__dirname, 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    logger.info('Running database migrations...');
    await pool.query(sql);
    logger.info('✅ Database migrations executed successfully.');
  } catch (error) {
    logger.error('❌ Migration failed:', { error: error.message });
  }
};

if (require.main === module) {
  runMigrations().then(() => process.exit(0));
}

module.exports = { runMigrations };
