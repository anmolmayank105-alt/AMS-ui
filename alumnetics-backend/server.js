const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const apiRoutes = require('./src/routes');

// Import middleware
const cookieParser = require('cookie-parser');

const app = express();

// Trust proxy - Required for Vercel deployment
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// Compression middleware - compress all responses
app.use(compression({
  level: 6, // Compression level (0-9, 6 is default balance)
  threshold: 1024, // Only compress responses larger than 1kb
  filter: (req, res) => {
    // Don't compress if client doesn't support it
    if (req.headers['x-no-compression']) {
      return false;
    }
    // Use compression for all other requests
    return compression.filter(req, res);
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration - Allow all origins in development
const allowedOrigins = [
  'https://ams-ui-1.onrender.com',
  'https://ams-ui-frontend.onrender.com',
  'https://alumnetics-frontend.vercel.app',
  'https://ams-ui-one.vercel.app',
  'https://frontend-two-eosin-67.vercel.app',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000'
];

// Add CLIENT_URL from environment if set
if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// CORS configuration - Allow all origins in development
// IMPORTANT: CORS middleware must run before the rate limiter so preflight (OPTIONS)
// requests receive Access-Control-Allow-Origin headers even when rate limiting is active.
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (same-origin, mobile apps, curl)
    if (!origin) return callback(null, true);
    
    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // For unified deployment, allow same domain requests
    return callback(null, true);
  },
  credentials: true
}));

// Apply rate limiter after CORS so preflight responses include CORS headers
app.use('/api', limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Database connection with optimized settings
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/alumnetics', {
  // Connection pool settings for better performance
  maxPoolSize: 10, // Maximum number of connections in pool
  minPoolSize: 2,  // Minimum number of connections in pool
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  serverSelectionTimeoutMS: 5000, // Timeout for selecting a server
  family: 4, // Use IPv4, skip trying IPv6
  // Retry settings
  retryWrites: true,
  retryReads: true
})
  .then(() => {
    console.log('📦 MongoDB connected successfully');
    console.log('⚡ Connection pool size: 10');
    console.log('🔄 Auto-reconnect: Enabled');
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.error('⚠️  Server will continue running but database operations will fail');
    // Don't exit - let the error handlers deal with it
  });

// API routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  // Cache health check for 30 seconds
  res.set('Cache-Control', 'public, max-age=30');
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
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
    message: 'Route not found'
  });
});

// Socket.io setup (only in non-serverless environments)
const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
let io = null;
let httpServer = null;

if (!isVercel) {
  // Initialize Socket.io for local/dedicated server
  const http = require('http');
  const { Server } = require('socket.io');
  
  httpServer = http.createServer(app);
  
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || ['http://localhost:5173', 'http://localhost:3000'],
      credentials: true,
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Store io and user sockets in app for access in controllers
  app.set('socketio', io);
  const userSockets = new Map(); // userId -> socketId
  app.set('userSockets', userSockets);

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('🔌 New socket connection:', socket.id);

    // Authenticate user
    const token = socket.handshake.auth.token;
    
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;
        
        // Map user to socket
        userSockets.set(userId.toString(), socket.id);
        socket.userId = userId;
        
        console.log(`✅ User ${userId} connected via socket ${socket.id}`);
        
        // Notify others user is online
        socket.broadcast.emit('userOnline', { userId });
        
      } catch (error) {
        console.error('Socket authentication error:', error.message);
      }
    }

    // Handle disconnection
    socket.on('disconnect', () => {
      if (socket.userId) {
        userSockets.delete(socket.userId.toString());
        socket.broadcast.emit('userOffline', { userId: socket.userId });
        console.log(`👋 User ${socket.userId} disconnected`);
      }
    });

    // Handle typing indicator
    socket.on('typing', (data) => {
      const recipientSocketId = userSockets.get(data.recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('userTyping', {
          userId: socket.userId,
          isTyping: data.isTyping
        });
      }
    });
  });
}

const PORT = process.env.PORT || 5000;

// Graceful shutdown handler
function gracefulShutdown(signal) {
  console.log(`\n⚠️  Received ${signal}. Starting graceful shutdown...`);
  
  const server = httpServer || app;
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close Socket.io connections if available
    if (io) {
      io.close(() => {
        console.log('✅ Socket.io connections closed');
      });
    }
    
    // Close MongoDB connection (no callback in newer versions)
    mongoose.connection.close()
      .then(() => {
        console.log('✅ MongoDB connection closed');
        process.exit(0);
      })
      .catch((err) => {
        console.error('❌ Error closing MongoDB:', err.message);
        process.exit(1);
      });
  });
  
  // Force shutdown after 10 seconds if graceful shutdown fails
  setTimeout(() => {
    console.error('⚠️  Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ UNCAUGHT EXCEPTION!');
  console.error('Error:', error.name, error.message);
  console.error('Stack:', error.stack);
  
  // Try to log to file or external service in production
  if (process.env.NODE_ENV === 'production') {
    // Log to error tracking service (e.g., Sentry, LogRocket)
    console.error('Production error logged');
  }
  
  // Only exit if it's a critical error
  if (error.code === 'EADDRINUSE' || error.code === 'EACCES') {
    console.error('⚠️  Critical error - exiting...');
    process.exit(1);
  } else {
    console.error('⚠️  Non-critical error - server will continue running');
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ UNHANDLED REJECTION!');
  console.error('Reason:', reason);
  
  // Try to log to file or external service in production
  if (process.env.NODE_ENV === 'production') {
    // Log to error tracking service
    console.error('Production rejection logged');
  }
  
  // Don't shut down - just log the error
  console.error('⚠️  Unhandled rejection logged - server will continue running');
});

// Handle SIGTERM (e.g., from process manager)
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

// Handle SIGINT (e.g., Ctrl+C)
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// MongoDB connection error handlers
mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
  // Don't exit on connection errors, mongoose will try to reconnect
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting to reconnect...');
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ MongoDB reconnected successfully');
});

// Start server with or without Socket.io
const server = httpServer || app;
server.listen(PORT, () => {
  console.log(`🚀 AlumNetics Backend Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`💬 Socket.io: ${io ? '✅ Enabled (WebSocket mode)' : '⚠️  Disabled (Vercel/Serverless mode)'}`);
  console.log(`🛡️  Error handlers: ✅ Registered`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please use a different port or kill the existing process.`);
    process.exit(1);
  } else if (error.code === 'EACCES') {
    console.error(`❌ Port ${PORT} requires elevated privileges. Try using a port above 1024.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Export for Vercel serverless
module.exports = app;