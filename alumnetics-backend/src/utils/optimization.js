// Performance optimization middleware and helpers
const compression = require('compression');

/**
 * HTTP caching middleware for static/rarely changing data
 * Use this for GET endpoints that return data that doesn't change often
 */
const cacheMiddleware = (duration = 300) => {
  return (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Set Cache-Control headers
    res.set('Cache-Control', `public, max-age=${duration}`);
    next();
  };
};

/**
 * Pagination helper to standardize pagination across controllers
 * @param {Object} req - Express request object
 * @param {Number} maxLimit - Maximum items per page (default: 50)
 * @returns {Object} - { page, limit, skip }
 */
const getPaginationParams = (req, maxLimit = 50) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, maxLimit);
  const skip = (page - 1) * limit;
  
  return { page, limit, skip };
};

/**
 * Build pagination response object
 * @param {Number} page - Current page
 * @param {Number} limit - Items per page
 * @param {Number} total - Total number of items
 * @returns {Object} - Pagination metadata
 */
const buildPaginationResponse = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    currentPage: page,
    totalPages,
    total,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    nextPage: page < totalPages ? page + 1 : null,
    prevPage: page > 1 ? page - 1 : null
  };
};

/**
 * Compression middleware configuration
 * Already applied globally, but can be used selectively
 */
const compressionMiddleware = compression({
  level: 6,
  threshold: 1024,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  }
});

/**
 * Query optimization helper - adds lean() and select() for common patterns
 * @param {Query} query - Mongoose query
 * @param {Array} fields - Fields to select (optional)
 * @returns {Query} - Modified query
 */
const optimizeQuery = (query, fields = null) => {
  if (fields && fields.length > 0) {
    query.select(fields.join(' '));
  }
  return query.lean(); // Convert to plain JS objects for better performance
};

/**
 * Debounce helper for rate-limiting expensive operations
 * @param {Function} func - Function to debounce
 * @param {Number} wait - Debounce delay in ms
 * @returns {Function} - Debounced function
 */
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Error response helper for consistent error formatting
 */
const sendError = (res, statusCode, message, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors && { errors })
  };
  
  return res.status(statusCode).json(response);
};

/**
 * Success response helper for consistent response formatting
 */
const sendSuccess = (res, data, message = null) => {
  const response = {
    success: true,
    ...(message && { message }),
    data
  };
  
  return res.json(response);
};

module.exports = {
  cacheMiddleware,
  getPaginationParams,
  buildPaginationResponse,
  compressionMiddleware,
  optimizeQuery,
  debounce,
  sendError,
  sendSuccess
};
