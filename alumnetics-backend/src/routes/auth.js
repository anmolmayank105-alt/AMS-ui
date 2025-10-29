const express = require('express');
const { 
  register, 
  login, 
  logout, 
  refreshToken, 
  verifyEmail, 
  resendVerification,
  getProfile 
} = require('../controllers/authController');
const { 
  authenticate, 
  optionalAuth,
  requireEmailVerification 
} = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerification);
router.post('/refresh-token', refreshToken);

// Protected routes
router.post('/logout', authenticate, logout);
router.get('/profile', authenticate, getProfile);

module.exports = router;