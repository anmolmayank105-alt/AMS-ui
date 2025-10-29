const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Basic Information
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    maxLength: [100, 'Full name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minLength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  
  // Role and Status
  role: {
    type: String,
    enum: ['student', 'alumni', 'faculty', 'employer', 'institute', 'admin'],
    default: 'student'
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'suspended'],
    default: 'pending'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Personal Information
  dateOfBirth: {
    type: Date
  },
  phone: {
    type: String,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Academic Information
  institution: {
    name: { type: String },
    type: { type: String }, // university, college, institute
    location: { type: String }
  },
  graduationYear: {
    type: Number,
    min: 1950,
    max: new Date().getFullYear() + 10
  },
  department: String,
  degree: String,
  gpa: {
    type: Number,
    min: 0,
    max: 10
  },
  
  // Professional Information
  currentPosition: String,
  currentCompany: String,
  industry: String,
  experience: {
    type: Number, // years of experience
    min: 0
  },
  skills: [String],
  
  // Social Links
  socialLinks: {
    linkedin: String,
    github: String,
    twitter: String,
    portfolio: String
  },
  
  // Profile Information
  bio: {
    type: String,
    maxLength: [500, 'Bio cannot exceed 500 characters']
  },
  profilePicture: {
    url: String,
    publicId: String // Cloudinary public ID
  },
  interests: [String],
  achievements: [{
    title: String,
    description: String,
    date: Date,
    organization: String
  }],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    category: String,
    link: String,
    date: Date
  }],
  education: [{
    degree: String,
    institution: String,
    field: String,
    startYear: Number,
    endYear: Number,
    gpa: String,
    coursework: [String],
    activities: [String]
  }],
  
  // Privacy Settings
  privacy: {
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    showAddress: { type: Boolean, default: false },
    allowMessages: { type: Boolean, default: true },
    showProfile: { type: Boolean, default: true }
  },
  
  // Notification Settings
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    events: { type: Boolean, default: true },
    jobs: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  },
  
  // Activity Tracking
  lastLogin: Date,
  loginCount: {
    type: Number,
    default: 0
  },
  
  // Verification
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Admin fields
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ institution: 1, graduationYear: 1 });
userSchema.index({ 'institution.name': 'text', fullName: 'text', skills: 'text' });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
  if (!this.address) return '';
  const { street, city, state, country, zipCode } = this.address;
  return [street, city, state, country, zipCode].filter(Boolean).join(', ');
});

// Virtual for years since graduation
userSchema.virtual('yearsSinceGraduation').get(function() {
  if (!this.graduationYear) return null;
  return new Date().getFullYear() - this.graduationYear;
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  
  // Remove sensitive information
  delete user.password;
  delete user.emailVerificationToken;
  delete user.emailVerificationExpires;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  
  // Apply privacy settings
  if (!user.privacy.showEmail) delete user.email;
  if (!user.privacy.showPhone) delete user.phone;
  if (!user.privacy.showAddress) delete user.address;
  
  return user;
};

// Static method to find alumni by criteria
userSchema.statics.findAlumni = function(criteria = {}) {
  return this.find({
    role: 'alumni',
    status: 'approved',
    isVerified: true,
    'privacy.showProfile': true,
    ...criteria
  }).select('-password -emailVerificationToken -passwordResetToken');
};

module.exports = mongoose.model('User', userSchema);