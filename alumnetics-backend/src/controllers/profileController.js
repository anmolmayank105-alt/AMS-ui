const User = require('../models/User');

// Get current user's profile
exports.getMyProfile = async (req, res) => {
  try {
    console.log('getMyProfile called, user ID:', req.user?._id);
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      console.log('User not found for ID:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Ensure new fields exist (for backwards compatibility)
    const userObject = user.toObject();
    if (!userObject.projects) userObject.projects = [];
    if (!userObject.education) userObject.education = [];
    if (!userObject.achievements) userObject.achievements = [];
    if (!userObject.skills) userObject.skills = [];
    if (!userObject.interests) userObject.interests = [];

    console.log('Profile fetched successfully for:', userObject.fullName);
    
    res.status(200).json({
      success: true,
      data: userObject
    });
  } catch (error) {
    console.error('Error in getMyProfile:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

// Get any user's public profile by ID
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Return public profile based on privacy settings
    const publicProfile = user.getPublicProfile();

    res.status(200).json({
      success: true,
      data: publicProfile
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile',
      error: error.message
    });
  }
};

// Update current user's profile
exports.updateProfile = async (req, res) => {
  try {
    console.log('updateProfile called for user:', req.user?._id);
    console.log('Update data received:', Object.keys(req.body));
    
    if (!req.user || !req.user._id) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const {
      fullName,
      profilePicture,
      bio,
      phone,
      address,
      dateOfBirth,
      department,
      degree,
      gpa,
      currentPosition,
      currentCompany,
      industry,
      experience,
      skills,
      socialLinks,
      interests,
      achievements,
      projects,
      education,
      privacy,
      notifications
    } = req.body;

    // Find user
    const user = await User.findById(req.user._id);
    
    if (!user) {
      console.log('User not found for ID:', req.user._id);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Updating profile for:', user.fullName);

    // Update allowed fields
    if (fullName !== undefined) user.fullName = fullName;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    if (bio !== undefined) user.bio = bio;
    if (phone !== undefined) user.phone = phone;
    if (address !== undefined) user.address = { ...user.address, ...address };
    if (dateOfBirth !== undefined) user.dateOfBirth = dateOfBirth;
    if (department !== undefined) user.department = department;
    if (degree !== undefined) user.degree = degree;
    if (gpa !== undefined) user.gpa = gpa;
    if (currentPosition !== undefined) user.currentPosition = currentPosition;
    if (currentCompany !== undefined) user.currentCompany = currentCompany;
    if (industry !== undefined) user.industry = industry;
    if (experience !== undefined) user.experience = experience;
    if (skills !== undefined) user.skills = skills;
    if (socialLinks !== undefined) user.socialLinks = { ...user.socialLinks, ...socialLinks };
    if (interests !== undefined) user.interests = interests;
    if (achievements !== undefined) user.achievements = achievements;
    if (projects !== undefined) user.projects = projects;
    if (education !== undefined) user.education = education;
    if (privacy !== undefined) user.privacy = { ...user.privacy, ...privacy };
    if (notifications !== undefined) user.notifications = { ...user.notifications, ...notifications };

    await user.save();

    // Return updated profile without password
    const updatedUser = await User.findById(user._id).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Add achievement
exports.addAchievement = async (req, res) => {
  try {
    const { title, description, date, organization } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Achievement title is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.achievements.push({
      title,
      description,
      date: date || new Date(),
      organization
    });

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Achievement added successfully',
      data: user.achievements
    });
  } catch (error) {
    console.error('Error adding achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add achievement',
      error: error.message
    });
  }
};

// Delete achievement
exports.deleteAchievement = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.achievements = user.achievements.filter(
      achievement => achievement._id.toString() !== req.params.achievementId
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Achievement deleted successfully',
      data: user.achievements
    });
  } catch (error) {
    console.error('Error deleting achievement:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete achievement',
      error: error.message
    });
  }
};

// Update profile picture
exports.updateProfilePicture = async (req, res) => {
  try {
    const { url, publicId } = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        message: 'Profile picture URL is required'
      });
    }

    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.profilePicture = { url, publicId };
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: user.profilePicture
    });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile picture',
      error: error.message
    });
  }
};
