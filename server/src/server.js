const app = require('./app');
const config = require('./config/env');
const { checkDatabaseConnection } = require('./config/database');
const { runMigrations } = require('./database/migrate');
const ingestionService = require('./services/ingestion.service');
const logger = require('./utils/logger');

const startServer = async () => {
  try {
    // 1. Attempt database connection & migration
    const dbConnected = await checkDatabaseConnection();
    if (dbConnected) {
      await runMigrations();
    }

    // 2. Start HTTP server
    const server = app.listen(config.PORT, () => {
      logger.info(`🚀 Cinemate Server running on port ${config.PORT} [${config.NODE_ENV}]`);
      logger.info(`🔗 API Healthcheck available at http://localhost:${config.PORT}/api/health`);
    });

    // 3. Trigger initial movie metadata ingestion & vector indexing in background
    setTimeout(() => {
      ingestionService.ingestAll(2).catch((err) => {
        logger.warn('Initial movie ingestion encountered error:', { error: err.message });
      });
    }, 1000);

    // Graceful Shutdown
    const gracefulShutdown = (signal) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });

      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    logger.error('Fatal error during server startup:', { error: error.message });
    process.exit(1);
  }
};

startServer();
