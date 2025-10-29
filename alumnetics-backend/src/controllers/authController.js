const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../middleware/auth');

// Register new user
const register = async (req, res) => {
  try {
    console.log('=== Registration Request ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      phoneNumber,
      dateOfBirth,
      institution,
      graduationYear,
      department,
      degree,
      agreeToTerms
    } = req.body;

    // Validation
    if (!firstName || !email || !password) {
      console.log('Validation failed: Missing required fields');
      console.log('firstName:', firstName, 'lastName:', lastName, 'email:', email, 'password:', password ? '***' : undefined);
      return res.status(400).json({
        success: false,
        message: 'First name, email, and password are required'
      });
    }

    // Check if user already exists
    const queryConditions = [{ email: email.toLowerCase() }];
    if (phoneNumber) {
      queryConditions.push({ phone: phoneNumber });
    }
    const existingUser = await User.findOne({ $or: queryConditions });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email or phone number'
      });
    }

    // Validate role
    const validRoles = ['student', 'alumni', 'faculty', 'employer', 'institute', 'admin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified. Allowed roles: ' + validRoles.join(', ')
      });
    }

    // Create user data
    const userData = {
      fullName: lastName ? `${firstName.trim()} ${lastName.trim()}`.trim() : firstName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'student',
      phone: phoneNumber,
      dateOfBirth,
      registrationDate: new Date()
    };

    // Add academic information if provided
    if (institution) {
      userData.institution = {
        name: institution,
        type: 'university'
      };
    }
    if (graduationYear) {
      userData.graduationYear = graduationYear;
    }
    if (department) {
      userData.department = department;
    }
    if (degree) {
      userData.degree = degree;
    }

    // Create new user
    console.log('Creating user with data:', JSON.stringify(userData, null, 2));
    const user = new User(userData);
    
    try {
      await user.save();
      console.log('User saved successfully');
    } catch (saveError) {
      console.error('Error saving user:', saveError.message);
      if (saveError.errors) {
        console.error('Validation errors:', JSON.stringify(saveError.errors, null, 2));
      }
      throw saveError;
    }

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    
    await user.save();

    // Generate JWT tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });
    await user.save();

    // Set secure HTTP-only cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    // Get user data without sensitive information
    const userResponse = user.getPublicProfile();

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userResponse,
        token,
        emailVerificationRequired: true,
        verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    console.error('Error stack:', error.stack);
    
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
      message: process.env.NODE_ENV === 'development' ? error.message : 'Registration failed. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.toString() : undefined
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, rememberMe = false } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() })
      .select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if account is active (check status instead of isActive)
    if (user.status === 'suspended' || user.status === 'rejected') {
      return res.status(401).json({
        success: false,
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Log failed login attempt
      user.loginAttempts = user.loginAttempts || [];
      user.loginAttempts.push({
        success: false,
        timestamp: new Date(),
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
      await user.save();

      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT tokens
    const tokenExpiry = rememberMe ? '30d' : '7d';
    const token = generateToken(user._id, tokenExpiry);
    const refreshToken = generateRefreshToken(user._id);

    // Save refresh token to user
    user.refreshTokens = user.refreshTokens || [];
    user.refreshTokens.push({
      token: refreshToken,
      createdAt: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    // Update last login and log successful attempt
    user.lastLogin = new Date();
    user.loginAttempts = user.loginAttempts || [];
    user.loginAttempts.push({
      success: true,
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    await user.save();

    // Set secure HTTP-only cookie for refresh token
    const cookieMaxAge = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: cookieMaxAge
    });

    // Get user data without sensitive information
    const userResponse = user.getPublicProfile();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        token,
        emailVerified: user.emailVerified,
        profileComplete: user.isProfileComplete
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.'
    });
  }
};

// Logout user
const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    
    if (req.user && refreshToken) {
      // Remove refresh token from user's tokens array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: {
          refreshTokens: { token: refreshToken }
        }
      });
    }

    // Clear the refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logout successful'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
};

// Refresh access token
const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not provided'
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    // Find user and check if refresh token exists
    const user = await User.findOne({
      _id: decoded.userId,
      'refreshTokens.token': refreshToken
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    // Remove old refresh token and add new one
    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      createdAt: new Date(),
      userAgent: req.get('User-Agent'),
      ip: req.ip
    });

    await user.save();

    // Set new refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.json({
      success: true,
      data: {
        token: newToken
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Hash the token to compare with stored hash
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token'
      });
    }

    // Mark email as verified and remove verification token
    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    user.emailVerifiedAt = new Date();

    await user.save();

    res.json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Email verification failed'
    });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified'
      });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = crypto
      .createHash('sha256')
      .update(verificationToken)
      .digest('hex');
    user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    await user.save();

    res.json({
      success: true,
      message: 'Verification email sent successfully',
      verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });

  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to resend verification email'
    });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    console.log('=== Get Profile Request ===');
    console.log('User ID from token:', req.user?._id);
    
    const user = await User.findById(req.user._id);

    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('User found:', user.email);
    const profile = user.getPublicProfile();
    console.log('Profile data:', JSON.stringify(profile, null, 2));

    res.json({
      success: true,
      data: profile // Return profile directly, not nested in user object
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerification,
  getProfile
};