const config = require('../config/env');

const SENSITIVE_KEYS = ['api_key', 'apikey', 'authorization', 'secret', 'password', 'token', 'jwt', 'clerk'];

/**
 * Sanitize metadata objects to remove any accidental secret leakage
 */
const sanitizeMeta = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  const sanitized = Array.isArray(obj) ? [] : {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((k) => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeMeta(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

const formatStructuredLog = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const sanitized = sanitizeMeta(meta);

  // In production / json log mode: output pure structured JSON
  if (process.env.LOG_FORMAT === 'json') {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...sanitized,
    });
  }

  // In development / standard mode: readable structured tag format
  const reqIdTag = sanitized.request_id ? ` [req_id=${sanitized.request_id}]` : '';
  const metaString = Object.keys(sanitized).length > 0 ? ` ${JSON.stringify(sanitized)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}]${reqIdTag} ${message}${metaString}`;
};

const logger = {
  info: (msg, meta) => console.log(formatStructuredLog('info', msg, meta)),
  error: (msg, meta) => console.error(formatStructuredLog('error', msg, meta)),
  warn: (msg, meta) => console.warn(formatStructuredLog('warn', msg, meta)),
  http: (msg, meta) => console.log(formatStructuredLog('http', msg, meta)),
  debug: (msg, meta) => {
    if (config.NODE_ENV === 'development') {
      console.log(formatStructuredLog('debug', msg, meta));
    }
  },
};

module.exports = logger;
