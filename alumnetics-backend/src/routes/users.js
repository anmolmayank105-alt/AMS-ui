const express = require('express');
const {
  authenticate,
  authorize,
  authorizeResourceAccess,
  requireEmailVerification,
  optionalAuth
} = require('../middleware/auth');

// Import user controllers
const {
  getUsers,
  getUser,
  updateProfile,
  deleteUser,
  searchUsers,
  updatePrivacySettings,
  getProfileStats,
  uploadAvatar,
  changePassword,
  deleteOwnAccount
} = require('../controllers/userController');

const router = express.Router();

// Public routes
router.get('/search', optionalAuth, searchUsers);

// DEBUG: Test endpoint to find specific user
router.get('/debug/find/:name', async (req, res) => {
  try {
    const User = require('../models/User');
    const name = req.params.name;
    const users = await User.find({
      $or: [
        { fullName: { $regex: name, $options: 'i' } },
        { firstName: { $regex: name, $options: 'i' } },
        { lastName: { $regex: name, $options: 'i' } }
      ]
    }).select('fullName firstName lastName email institution privacy isActive role').lean();
    
    res.json({
      success: true,
      query: name,
      found: users.length,
      users: users
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// User browsing (allow viewing profiles without auth)
router.get('/', optionalAuth, getUsers);
router.get('/:userId', optionalAuth, getUser);

// Protected routes (all routes after this require authentication)
router.use(authenticate);

// User profile management
router.get('/profile/stats', getProfileStats);
router.put('/profile', updateProfile); // Removed email verification requirement
router.put('/profile/privacy', updatePrivacySettings); // Privacy settings don't need verification
router.post('/profile/avatar', uploadAvatar);
router.put('/profile/password', changePassword);
router.delete('/profile', deleteOwnAccount); // Self-delete account

// Admin routes
router.delete('/:userId/delete', authorize('admin'), deleteUser);

module.exports = router;