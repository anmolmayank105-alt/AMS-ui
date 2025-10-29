const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d'
  });
};

// Middleware to protect routes
const authenticate = async (req, res, next) => {
  try {
    let token;

    // Check for token in header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database (removed populate for non-existent fields)
    const user = await User.findById(decoded.userId)
      .select('-password -refreshTokens');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token invalid - user not found'
      });
    }

    // Check if user is active (status should be 'approved' for active users)
    if (user.status === 'suspended') {
      return res.status(401).json({
        success: false,
        message: 'Account has been suspended'
      });
    }

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('Authentication error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Middleware to check if user has specific role
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Middleware to check if user can access resource (owner or admin)
const authorizeResourceAccess = (resourceUserField = 'user') => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate.'
      });
    }

    // Admin can access any resource
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resource = req.resource || req.body;
    if (resource && resource[resourceUserField]) {
      if (resource[resourceUserField].toString() === req.user._id.toString()) {
        return next();
      }
    }

    // Check URL parameters
    if (req.params.userId && req.params.userId === req.user._id.toString()) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. Insufficient permissions.'
    });
  };
};

// Middleware to set user privacy filter
const applyPrivacyFilter = (req, res, next) => {
  if (!req.user) {
    return next();
  }

  // Add privacy filter to request
  req.privacyFilter = {
    viewingUserId: req.user._id,
    viewingUserRole: req.user.role
  };

  next();
};

// Middleware to rate limit by user
const rateLimitByUser = (maxRequests = 100, windowMs = 15 * 60 * 1000) => {
  const userRequests = new Map();

  return (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const userId = req.user._id.toString();
    const now = Date.now();

    if (!userRequests.has(userId)) {
      userRequests.set(userId, []);
    }

    const userRequestTimes = userRequests.get(userId);
    
    // Remove old requests outside the window
    const validRequests = userRequestTimes.filter(time => now - time < windowMs);
    userRequests.set(userId, validRequests);

    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Rate limit exceeded. Try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }

    // Add current request
    validRequests.push(now);
    next();
  };
};

// Middleware to log user activity
const logActivity = (action) => {
  return (req, res, next) => {
    if (req.user) {
      // Add activity to user's activity log
      req.userActivity = {
        userId: req.user._id,
        action,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        timestamp: new Date()
      };
    }
    next();
  };
};

// Middleware to check email verification
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please authenticate.'
    });
  }

  // Skip email verification for admin users
  if (req.user.role === 'admin') {
    return next();
  }

  if (!req.user.emailVerified) {
    return res.status(403).json({
      success: false,
      message: 'Email verification required. Please verify your email address.',
      requiresEmailVerification: true
    });
  }

  next();
};

// Middleware to check profile completion
const requireProfileCompletion = (requiredFields = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Please authenticate.'
      });
    }

    const missingFields = requiredFields.filter(field => {
      return !req.user[field] || 
             (Array.isArray(req.user[field]) && req.user[field].length === 0);
    });

    if (missingFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: 'Profile completion required.',
        missingFields,
        requiresProfileCompletion: true
      });
    }

    next();
  };
};

// Optional authentication (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId)
        .select('-password -refreshTokens');

      // Allow if user exists and is active (or isActive field doesn't exist)
      if (user && (user.isActive !== false)) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Silently continue without authentication
    next();
  }
};

module.exports = {
  generateToken,
  generateRefreshToken,
  authenticate,
  authorize,
  authorizeResourceAccess,
  applyPrivacyFilter,
  rateLimitByUser,
  logActivity,
  requireEmailVerification,
  requireProfileCompletion,
  optionalAuth
};