const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxLength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true
    },
    website: String,
    logo: {
      url: String,
      publicId: String
    },
    description: String,
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    }
  },
  
  // Job Details
  employmentType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'temporary', 'freelance'],
    required: true
  },
  workLocation: {
    type: String,
    enum: ['remote', 'on-site', 'hybrid'],
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry-level', 'mid-level', 'senior-level', 'executive', 'internship'],
    required: true
  },
  
  // Location
  location: {
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Compensation
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  benefits: [String],
  
  // Requirements
  requirements: {
    education: {
      degree: {
        type: String,
        enum: ['high-school', 'associate', 'bachelor', 'master', 'phd', 'other']
      },
      field: String,
      required: {
        type: Boolean,
        default: false
      }
    },
    experience: {
      years: {
        min: Number,
        max: Number
      },
      description: String
    },
    skills: [{
      name: String,
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert']
      },
      required: {
        type: Boolean,
        default: false
      }
    }],
    languages: [{
      name: String,
      level: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native']
      }
    }],
    certifications: [String]
  },
  
  // Application Details
  applicationDeadline: Date,
  applicationInstructions: String,
  applicationMethod: {
    type: String,
    enum: ['internal', 'external', 'email'],
    default: 'internal'
  },
  externalApplicationUrl: String,
  contactEmail: String,
  
  // Posting Information
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: String,
  department: String,
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired'],
    default: 'draft'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Applications
  applications: [{
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['applied', 'reviewing', 'interviewed', 'offered', 'rejected', 'withdrawn'],
      default: 'applied'
    },
    resumeUrl: String,
    coverLetter: String,
    notes: String
  }],
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  // Categories and Tags
  category: {
    type: String,
    enum: ['technology', 'finance', 'healthcare', 'education', 'marketing', 'sales', 'operations', 'design', 'other']
  },
  subcategory: String,
  tags: [String],
  
  // Featured and Priority
  isFeatured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  
  // Expiry
  expiresAt: Date,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
jobSchema.index({ status: 1, expiresAt: 1 });
jobSchema.index({ 'company.name': 1, title: 1 });
jobSchema.index({ postedBy: 1 });
jobSchema.index({ category: 1, employmentType: 1 });
jobSchema.index({ title: 'text', description: 'text', 'company.name': 'text', tags: 'text' });
jobSchema.index({ 'location.city': 1, 'location.country': 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applications ? this.applications.length : 0;
});

// Virtual to check if job is expired
jobSchema.virtual('isExpired').get(function() {
  if (!this.expiresAt && !this.applicationDeadline) return false;
  
  const now = new Date();
  const expiry = this.applicationDeadline || this.expiresAt;
  return expiry && now > expiry;
});

// Virtual for days remaining
jobSchema.virtual('daysRemaining').get(function() {
  if (this.isExpired) return 0;
  
  const deadline = this.applicationDeadline || this.expiresAt;
  if (!deadline) return null;
  
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Method to check if user can apply
jobSchema.methods.canUserApply = function(userId) {
  if (this.status !== 'active') return false;
  if (this.isExpired) return false;
  
  const hasApplied = this.applications.some(
    app => app.applicant.toString() === userId.toString()
  );
  return !hasApplied;
};

// Method to apply for job
jobSchema.methods.applyForJob = function(userId, applicationData) {
  if (!this.canUserApply(userId)) {
    throw new Error('Cannot apply for this job');
  }
  
  this.applications.push({
    applicant: userId,
    appliedAt: new Date(),
    resumeUrl: applicationData.resumeUrl,
    coverLetter: applicationData.coverLetter,
    status: 'applied'
  });
  
  return this.save();
};

// Method to update application status
jobSchema.methods.updateApplicationStatus = function(applicationId, status, notes) {
  const application = this.applications.id(applicationId);
  if (!application) {
    throw new Error('Application not found');
  }
  
  application.status = status;
  if (notes) application.notes = notes;
  
  return this.save();
};

// Pre-save middleware to set expiry date if not set
jobSchema.pre('save', function(next) {
  if (this.isNew && !this.expiresAt && !this.applicationDeadline) {
    // Default expiry: 60 days from creation
    this.expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);
  }
  next();
});

// Method to get filtered public data
jobSchema.methods.toPublicObject = function() {
  const obj = this.toObject();
  
  // Remove sensitive information
  delete obj.applications;
  
  return obj;
};

module.exports = mongoose.model('Job', jobSchema);