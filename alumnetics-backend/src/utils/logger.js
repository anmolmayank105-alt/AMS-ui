/**
 * Production-Safe Logger
 * Automatically disables debug logs in production
 * Keeps error logs for monitoring
 */

const isProduction = process.env.NODE_ENV === 'production';
const isDevelopment = process.env.NODE_ENV === 'development';

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

const currentLogLevel = isProduction ? LOG_LEVELS.ERROR : LOG_LEVELS.DEBUG;

class Logger {
  // Always log errors - critical for monitoring
  error(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.ERROR) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  }

  // Warnings in all environments
  warn(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.WARN) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }

  // Info logs only in development
  info(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.INFO && isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  // Debug logs only in development
  debug(message, ...args) {
    if (currentLogLevel >= LOG_LEVELS.DEBUG && isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // API request logger
  request(method, path, userId) {
    if (isDevelopment) {
      console.log(`[API] ${method} ${path} - User: ${userId || 'anonymous'}`);
    }
  }

  // Database query logger
  query(operation, collection, duration) {
    if (isDevelopment) {
      console.log(`[DB] ${operation} on ${collection} - ${duration}ms`);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Override console methods in production
if (isProduction) {
  // Disable console.log in production
  console.log = () => {};
  console.debug = () => {};
  
  // Keep console.error and console.warn for monitoring
}

module.exports = logger;
