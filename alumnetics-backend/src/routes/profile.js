const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const {
  getMyProfile,
  getUserProfile,
  updateProfile,
  addAchievement,
  deleteAchievement,
  updateProfilePicture
} = require('../controllers/profileController');

// Get current user's profile
router.get('/me', authenticate, getMyProfile);

// Get any user's public profile by ID (allow without authentication)
router.get('/:userId', optionalAuth, getUserProfile);

// Update current user's profile
router.put('/me', authenticate, updateProfile);

// Add achievement
router.post('/me/achievements', authenticate, addAchievement);

// Delete achievement
router.delete('/me/achievements/:achievementId', authenticate, deleteAchievement);

// Update profile picture
router.put('/me/picture', authenticate, updateProfilePicture);

module.exports = router;
