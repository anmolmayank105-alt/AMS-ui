/**
 * Production-Safe Logger for React
 * Automatically disables debug logs in production builds
 */

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

class Logger {
  // Always log errors - critical for user experience
  error(message, ...args) {
    console.error(`[ERROR] ${message}`, ...args);
  }

  // Warnings in all environments
  warn(message, ...args) {
    console.warn(`[WARN] ${message}`, ...args);
  }

  // Info logs only in development
  info(message, ...args) {
    if (isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }

  // Debug logs only in development
  debug(message, ...args) {
    if (isDevelopment) {
      console.log(`[DEBUG] ${message}`, ...args);
    }
  }

  // API call logger
  api(method, endpoint, status) {
    if (isDevelopment) {
      console.log(`[API] ${method} ${endpoint} - ${status}`);
    }
  }

  // Component lifecycle logger
  lifecycle(component, action) {
    if (isDevelopment) {
      console.log(`[LIFECYCLE] ${component} - ${action}`);
    }
  }
}

// Create singleton instance
const logger = new Logger();

// Override console in production
if (isProduction) {
  // Disable debug console methods in production
  window.console.log = () => {};
  window.console.debug = () => {};
  window.console.info = () => {};
  
  // Keep error and warn for debugging production issues
}

export default logger;
