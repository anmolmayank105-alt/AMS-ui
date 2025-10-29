const User = require('../models/User');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');

// Get all users with optimized pagination and filtering
const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    // Role filter
    if (req.query.role && ['student', 'alumni', 'faculty', 'employer', 'admin'].includes(req.query.role)) {
      filter.role = req.query.role;
    }
    
    // Institution filter
    if (req.query.institution) {
      filter['academic.institution'] = { $regex: req.query.institution, $options: 'i' };
    }
    
    // Graduation year filter
    if (req.query.graduationYear) {
      filter['academic.graduationYear'] = parseInt(req.query.graduationYear);
    }
    
    // Department filter
    if (req.query.department) {
      filter['academic.department'] = { $regex: req.query.department, $options: 'i' };
    }
    
    // Active users only
    filter.isActive = true;
    
    // Privacy filter - only show users who allow being discovered
    filter['privacy.allowDiscovery'] = true;
    
    // Optimized query with select only necessary fields
    const users = await User.find(filter)
      .select('firstName lastName email role academic.institution academic.graduationYear academic.department location profilePicture isVerified')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance
    
    // Get total count for pagination (with same filter)
    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);
    
    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve users'
    });
  }
};

// Get single user with privacy controls
const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const viewingUser = req.user;
    
    // Don't populate - just fetch the user data as is
    const user = await User.findById(userId);
    
    // Check if user exists and is active (or isActive field doesn't exist - default to active)
    if (!user || (user.isActive === false)) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Apply privacy filters based on viewing user's relationship
    let userData;
    
    // Build basic user data that's always visible
    userData = {
      _id: user._id,
      fullName: user.fullName,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      department: user.department,
      degree: user.degree,
      graduationYear: user.graduationYear,
      institution: user.institution,
      location: user.location,
      profilePicture: user.profilePicture,
      bio: user.bio,
      privacy: user.privacy || {}
    };
    
    if (!viewingUser) {
      // Public view - add email if privacy allows
      if (user.privacy?.showEmail === true) {
        userData.email = user.email;
      }
      if (user.privacy?.showPhone === true && user.phone) {
        userData.phone = user.phone;
      }
    } else if (viewingUser._id.toString() === userId) {
      // Own profile - full data
      const fullData = user.toObject();
      delete fullData.password;
      delete fullData.refreshTokens;
      userData = fullData;
    } else {
      // Other authenticated user - filtered data based on privacy settings
      if (user.privacy?.showEmail === true) {
        userData.email = user.email;
      }
      if (user.privacy?.showPhone === true && user.phone) {
        userData.phone = user.phone;
      }
      
      // Add more details if privacy allows or if admin
      if (user.privacy?.profileVisibility === 'public' || viewingUser.role === 'admin') {
        userData.academic = user.academic;
        userData.professional = user.professional;
        userData.social = user.social;
      }
    }
    
    res.json({
      success: true,
      data: { user: userData }
    });
    
  } catch (error) {
    console.error('Get user error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      userId: req.params.userId
    });
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Update user profile with validation
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const userId = req.user._id;
    const updateData = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updateData.password;
    delete updateData.email; // Email changes should go through separate verification
    delete updateData.role; // Only admin can change roles
    delete updateData.isActive;
    delete updateData.emailVerified;
    delete updateData.refreshTokens;
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Get user data without sensitive fields
    const userData = updatedUser.toObject();
    delete userData.password;
    delete userData.refreshTokens;
    delete userData.emailVerificationToken;
    delete userData.resetPasswordToken;
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: userData
      }
    });  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
};

// Search users with optimized indexing
const searchUsers = async (req, res) => {
  try {
    const { q, role, institution, graduationYear, department, page = 1, limit = 10 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50); // Max 50 results
    const skip = (pageNum - 1) * limitNum;
    
    // Get current user's institution for same-institution filtering
    let userInstitution = null;
    if (req.user) {
      const currentUser = await User.findById(req.user._id).select('institution');
      userInstitution = currentUser?.institution?.name;
    }
    
    // Build search query
    const searchQuery = {
      $and: [
        // Allow users where isActive is true or doesn't exist (default to true)
        { 
          $or: [
            { isActive: true },
            { isActive: { $exists: false } }
          ]
        },
        {
          $or: [
            { fullName: { $regex: q.trim(), $options: 'i' } },
            { firstName: { $regex: q.trim(), $options: 'i' } },
            { lastName: { $regex: q.trim(), $options: 'i' } },
            { department: { $regex: q.trim(), $options: 'i' } },
            { 'institution.name': { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    };
    
    // ENFORCE SAME INSTITUTION: Only show users from the same university
    if (userInstitution) {
      searchQuery.$and.push({ 'institution.name': userInstitution });
    }
    
    // Log search query for debugging
    console.log('Search Query:', JSON.stringify(searchQuery, null, 2));
    console.log('User Institution:', userInstitution);
    
    // Add additional filters
    if (role) searchQuery.$and.push({ role });
    if (graduationYear) searchQuery.$and.push({ graduationYear: parseInt(graduationYear) });
    if (department) searchQuery.$and.push({ department: { $regex: department, $options: 'i' } });
    
    // Execute search with optimized fields
    const users = await User.find(searchQuery)
      .select('_id fullName firstName lastName email role institution graduationYear department degree location profilePicture privacy isActive')
      .sort({ 
        // Prioritize verified users and recent activity
        isEmailVerified: -1,
        createdAt: -1 
      })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalResults = await User.countDocuments(searchQuery);
    
    // Log search results for debugging
    console.log(`Search for "${q.trim()}" found ${totalResults} total results`);
    console.log('First 3 results:', users.slice(0, 3).map(u => ({
      _id: u._id,
      name: u.fullName,
      institution: u.institution?.name,
      privacy: u.privacy,
      isActive: u.isActive
    })));
    console.log('Full first user object:', users[0]);
    
    res.json({
      success: true,
      data: {
        users,
        searchQuery: q.trim(),
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalResults / limitNum),
          totalResults,
          hasNextPage: pageNum < Math.ceil(totalResults / limitNum)
        }
      }
    });
    
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Search failed'
    });
  }
};

// Update privacy settings
const updatePrivacySettings = async (req, res) => {
  try {
    const userId = req.user._id;
    const { privacy } = req.body;
    
    if (!privacy || typeof privacy !== 'object') {
      return res.status(400).json({
        success: false,
        message: 'Privacy settings object is required'
      });
    }
    
    // Validate privacy settings
    const allowedSettings = {
      profileVisibility: ['public', 'alumni-only', 'private'],
      showContactInfo: [true, false],
      showAcademicInfo: [true, false],
      showProfessionalInfo: [true, false],
      allowMessaging: ['everyone', 'alumni-only', 'connections-only', 'none'],
      allowDiscovery: [true, false],
      showOnlineStatus: [true, false]
    };
    
    const privacyUpdate = {};
    
    for (const [key, value] of Object.entries(privacy)) {
      if (allowedSettings[key] && allowedSettings[key].includes(value)) {
        privacyUpdate[`privacy.${key}`] = value;
      }
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: privacyUpdate },
      { new: true }
    );
    
    res.json({
      success: true,
      message: 'Privacy settings updated successfully',
      data: {
        privacy: updatedUser.privacy
      }
    });
    
  } catch (error) {
    console.error('Update privacy settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update privacy settings'
    });
  }
};

// Get profile statistics
const getProfileStats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Use aggregation for efficient stats calculation
    const stats = await User.aggregate([
      { $match: { _id: userId } },
      {
        $lookup: {
          from: 'events',
          localField: '_id',
          foreignField: 'attendees.user',
          as: 'events'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'postedBy',
          as: 'jobsPosted'
        }
      },
      {
        $lookup: {
          from: 'jobs',
          localField: '_id',
          foreignField: 'applications.applicant',
          as: 'jobApplications'
        }
      },
      {
        $lookup: {
          from: 'mentorships',
          localField: '_id',
          foreignField: 'mentor',
          as: 'mentoringRelationships'
        }
      },
      {
        $lookup: {
          from: 'mentorships',
          localField: '_id',
          foreignField: 'mentee',
          as: 'menteeRelationships'
        }
      },
      {
        $project: {
          eventsAttended: { $size: '$events' },
          jobsPosted: { $size: '$jobsPosted' },
          jobApplications: { $size: '$jobApplications' },
          mentoringRelationships: { $size: '$mentoringRelationships' },
          menteeRelationships: { $size: '$menteeRelationships' },
          profileCompleteness: {
            $multiply: [
              {
                $divide: [
                  {
                    $add: [
                      { $cond: [{ $ne: ['$firstName', null] }, 1, 0] },
                      { $cond: [{ $ne: ['$lastName', null] }, 1, 0] },
                      { $cond: [{ $ne: ['$bio', null] }, 1, 0] },
                      { $cond: [{ $ne: ['$profilePicture', null] }, 1, 0] },
                      { $cond: [{ $ne: ['$location', null] }, 1, 0] },
                      { $cond: [{ $gt: [{ $size: { $ifNull: ['$skills', []] } }, 0] }, 1, 0] },
                      { $cond: [{ $ne: ['$academic.institution', null] }, 1, 0] },
                      { $cond: [{ $ne: ['$academic.degree', null] }, 1, 0] }
                    ]
                  },
                  8
                ]
              },
              100
            ]
          }
        }
      }
    ]);
    
    if (!stats.length) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: {
        stats: stats[0]
      }
    });
    
  } catch (error) {
    console.error('Get profile stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve profile statistics'
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }
    
    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();
    
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
    
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to change password'
    });
  }
};

// Upload avatar (placeholder - would integrate with Cloudinary)
const uploadAvatar = async (req, res) => {
  try {
    // This would typically handle file upload to Cloudinary
    // For now, returning a placeholder response
    
    res.json({
      success: true,
      message: 'Avatar upload functionality to be implemented with Cloudinary integration',
      data: {
        profilePicture: 'https://via.placeholder.com/150x150?text=Avatar'
      }
    });
    
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload avatar'
    });
  }
};

// Delete own account (self-delete)
const deleteOwnAccount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Permanently delete the user account
    await User.findByIdAndDelete(userId);
    
    // Clear authentication cookies
    res.clearCookie('refreshToken');
    
    res.json({
      success: true,
      message: 'Your account has been permanently deleted'
    });
    
  } catch (error) {
    console.error('Delete own account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (userId === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account through this endpoint'
      });
    }
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Soft delete by marking as inactive
    user.isActive = false;
    user.deactivatedAt = new Date();
    user.deactivatedBy = req.user._id;
    await user.save();
    
    res.json({
      success: true,
      message: 'User account deactivated successfully'
    });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete user'
    });
  }
};

module.exports = {
  getUsers,
  getUser,
  updateProfile,
  searchUsers,
  updatePrivacySettings,
  getProfileStats,
  changePassword,
  uploadAvatar,
  deleteUser,
  deleteOwnAccount
};