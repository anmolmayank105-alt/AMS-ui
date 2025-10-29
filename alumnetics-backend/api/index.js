const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const apiRoutes = require('../src/routes');

// Import middleware
const cookieParser = require('cookie-parser');

const app = express();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration - Allow all origins in development
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // In production, allow specific origins
    const allowedOrigins = [
      process.env.CLIENT_URL,
      process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    return callback(null, true); // Allow all for now
  },
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection with connection pooling for serverless
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('=> Using cached database connection');
    return cachedDb;
  }

  console.log('=> Creating new database connection');
  
  const connection = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics', {
    // Optimize for serverless
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  });

  cachedDb = connection;
  console.log('📦 MongoDB connected successfully');
  return cachedDb;
}

// Connect to database before handling requests
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AlumNetics API',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        description: 'Authentication endpoints'
      },
      users: {
        base: '/api/users', 
        description: 'User management endpoints'
      },
      events: {
        base: '/api/events',
        description: 'Event management endpoints'
      },
      jobs: {
        base: '/api/jobs',
        description: 'Job posting endpoints'
      },
      messages: {
        base: '/api/messages',
        description: 'Messaging endpoints'
      },
      fundraising: {
        base: '/api/fundraising',
        description: 'Fundraising campaign endpoints'
      },
      mentorship: {
        base: '/api/mentorship',
        description: 'Mentorship program endpoints'
      }
    },
    documentation: 'Visit individual endpoints for detailed information'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AlumNetics API is running',
    version: '1.0.0',
    docs: '/api'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// For local development
if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  connectToDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 AlumNetics Backend Server running on port ${PORT}`);
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
        console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
      });
    })
    .catch((error) => {
      console.error('Failed to start server:', error);
      process.exit(1);
    });
}

// Export for Vercel serverless
module.exports = app;
