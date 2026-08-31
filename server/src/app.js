const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const config = require('./config/env');
const routes = require('./routes');
const { errorHandler } = require('./middleware/errorHandler.middleware');
const logger = require('./utils/logger');

const app = express();

// Security Headers (relaxed CSP for React assets, TMDB images & YouTube embed)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

// CORS Configuration
app.use(
  cors({
    origin: [config.CLIENT_URL, 'http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'x-user-id',
      'x-admin-key',
      'X-Admin-Key',
      'x-request-id',
      'X-Request-Id',
    ],
    exposedHeaders: [
      'X-Request-Id',
      'X-RateLimit-Limit',
      'X-RateLimit-Remaining',
      'X-RateLimit-Reset',
      'Retry-After',
    ],
  })
);

// Body Parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Request ID & Telemetry Middleware
const { requestIdMiddleware } = require('./middleware/requestId.middleware');
const { metricsMiddleware } = require('./middleware/metrics.middleware');

app.use(requestIdMiddleware);
app.use(metricsMiddleware);

// HTTP Request Logging
app.use(
  morgan(':method :url :status :res[content-length] - :response-time ms', {
    stream: {
      write: (message) => logger.http(message.trim()),
    },
  })
);

// Mount API routes
app.use('/api', routes);

// Serve Static React Frontend (Option 1: Unified Single-Service Deployment)
const clientBuildPath = path.join(__dirname, '../../Cinemate-main/cinema-main/build');
if (fs.existsSync(clientBuildPath)) {
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// 404 Handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `API endpoint not found: [${req.method}] ${req.originalUrl}`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
