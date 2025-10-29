const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Mentorship title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Participants
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Mentorship Details
  type: {
    type: String,
    enum: ['career', 'academic', 'entrepreneurship', 'personal-development', 'technical-skills', 'leadership'],
    required: true
  },
  category: String,
  
  // Areas of Focus
  focusAreas: [{
    type: String,
    required: true
  }],
  skills: [String],
  goals: [String],
  
  // Duration and Frequency
  duration: {
    months: {
      type: Number,
      min: 1,
      max: 24,
      default: 6
    }
  },
  frequency: {
    type: String,
    enum: ['weekly', 'bi-weekly', 'monthly', 'as-needed'],
    default: 'bi-weekly'
  },
  
  // Meeting Preferences
  meetingFormat: {
    type: String,
    enum: ['in-person', 'virtual', 'both'],
    default: 'both'
  },
  timezone: String,
  preferredTimes: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startTime: String, // Format: "HH:MM"
    endTime: String    // Format: "HH:MM"
  }],
  
  // Status and Progress
  status: {
    type: String,
    enum: ['requested', 'accepted', 'active', 'paused', 'completed', 'cancelled'],
    default: 'requested'
  },
  
  // Matching Information (if through system matching)
  isMatched: {
    type: Boolean,
    default: false
  },
  matchScore: Number, // Algorithm-generated compatibility score
  matchedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User' // Admin who made the match
  },
  
  // Dates
  requestedAt: {
    type: Date,
    default: Date.now
  },
  acceptedAt: Date,
  startedAt: Date,
  endDate: Date,
  completedAt: Date,
  
  // Sessions/Meetings
  sessions: [{
    title: String,
    description: String,
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number, // in minutes
      default: 60
    },
    format: {
      type: String,
      enum: ['in-person', 'virtual'],
      required: true
    },
    location: String, // Physical location or meeting link
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
      default: 'scheduled'
    },
    notes: String,
    actionItems: [{
      description: String,
      assignedTo: {
        type: String,
        enum: ['mentor', 'mentee', 'both']
      },
      dueDate: Date,
      completed: {
        type: Boolean,
        default: false
      }
    }],
    completedAt: Date,
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Progress Tracking
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetDate: Date,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    notes: String
  }],
  
  // Feedback and Evaluation
  feedback: [{
    fromRole: {
      type: String,
      enum: ['mentor', 'mentee'],
      required: true
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    isPublic: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Final Assessment
  finalAssessment: {
    mentorRating: {
      type: Number,
      min: 1,
      max: 5
    },
    menteeRating: {
      type: Number,
      min: 1,
      max: 5
    },
    goalsAchieved: {
      type: Number,
      min: 0,
      max: 100 // percentage
    },
    overallSatisfaction: {
      mentor: {
        type: Number,
        min: 1,
        max: 5
      },
      mentee: {
        type: Number,
        min: 1,
        max: 5
      }
    },
    testimonial: {
      mentor: String,
      mentee: String
    },
    wouldRecommend: {
      mentor: Boolean,
      mentee: Boolean
    }
  },
  
  // Communication
  lastContactDate: Date,
  totalSessions: {
    type: Number,
    default: 0
  },
  
  // Privacy and Visibility
  isPublic: {
    type: Boolean,
    default: false
  },
  
  // Tags and Categories
  tags: [String],
  
  // Institution
  institution: String
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });
mentorshipSchema.index({ status: 1, type: 1 });
mentorshipSchema.index({ institution: 1, isPublic: 1 });

// Virtual for total duration in days
mentorshipSchema.virtual('totalDurationDays').get(function() {
  if (!this.startedAt || !this.endDate) return null;
  const diffTime = this.endDate - this.startedAt;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for progress percentage
mentorshipSchema.virtual('progressPercentage').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completedMilestones = this.milestones.filter(m => m.completed).length;
  return Math.round((completedMilestones / this.milestones.length) * 100);
});

// Virtual for upcoming session
mentorshipSchema.virtual('nextSession').get(function() {
  if (!this.sessions || this.sessions.length === 0) return null;
  
  const now = new Date();
  const upcomingSessions = this.sessions
    .filter(s => s.status === 'scheduled' && s.scheduledAt > now)
    .sort((a, b) => a.scheduledAt - b.scheduledAt);
  
  return upcomingSessions[0] || null;
});

// Virtual for completed sessions count
mentorshipSchema.virtual('completedSessionsCount').get(function() {
  if (!this.sessions) return 0;
  return this.sessions.filter(s => s.status === 'completed').length;
});

// Method to accept mentorship request
mentorshipSchema.methods.accept = function() {
  if (this.status !== 'requested') {
    throw new Error('Can only accept requested mentorships');
  }
  
  this.status = 'accepted';
  this.acceptedAt = new Date();
  return this.save();
};

// Method to start mentorship
mentorshipSchema.methods.start = function() {
  if (this.status !== 'accepted') {
    throw new Error('Mentorship must be accepted before starting');
  }
  
  this.status = 'active';
  this.startedAt = new Date();
  
  // Set end date based on duration if not already set
  if (!this.endDate && this.duration && this.duration.months) {
    this.endDate = new Date();
    this.endDate.setMonth(this.endDate.getMonth() + this.duration.months);
  }
  
  return this.save();
};

// Method to complete mentorship
mentorshipSchema.methods.complete = function() {
  if (this.status !== 'active') {
    throw new Error('Can only complete active mentorships');
  }
  
  this.status = 'completed';
  this.completedAt = new Date();
  return this.save();
};

// Method to schedule a session
mentorshipSchema.methods.scheduleSession = function(sessionData) {
  this.sessions.push({
    ...sessionData,
    createdBy: sessionData.createdBy || this.mentor
  });
  
  this.lastContactDate = new Date();
  return this.save();
};

// Method to complete a session
mentorshipSchema.methods.completeSession = function(sessionId, notes, actionItems) {
  const session = this.sessions.id(sessionId);
  if (!session) {
    throw new Error('Session not found');
  }
  
  session.status = 'completed';
  session.completedAt = new Date();
  if (notes) session.notes = notes;
  if (actionItems) session.actionItems = actionItems;
  
  this.totalSessions = this.completedSessionsCount + 1;
  this.lastContactDate = new Date();
  
  return this.save();
};

// Method to add milestone
mentorshipSchema.methods.addMilestone = function(milestoneData) {
  this.milestones.push(milestoneData);
  return this.save();
};

// Method to complete milestone
mentorshipSchema.methods.completeMilestone = function(milestoneId, notes) {
  const milestone = this.milestones.id(milestoneId);
  if (!milestone) {
    throw new Error('Milestone not found');
  }
  
  milestone.completed = true;
  milestone.completedAt = new Date();
  if (notes) milestone.notes = notes;
  
  return this.save();
};

// Method to add feedback
mentorshipSchema.methods.addFeedback = function(fromRole, feedbackData) {
  this.feedback.push({
    fromRole,
    ...feedbackData,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to check if user can provide feedback
mentorshipSchema.methods.canProvideFeedback = function(userId, role) {
  const userRole = (userId.toString() === this.mentor.toString()) ? 'mentor' : 
                   (userId.toString() === this.mentee.toString()) ? 'mentee' : null;
  
  return userRole === role && ['active', 'completed'].includes(this.status);
};

// Method to get mentorship statistics
mentorshipSchema.methods.getStatistics = function() {
  const completedSessions = this.sessions.filter(s => s.status === 'completed');
  const completedMilestones = this.milestones.filter(m => m.completed);
  
  return {
    totalSessions: completedSessions.length,
    completedMilestones: completedMilestones.length,
    totalMilestones: this.milestones.length,
    progressPercentage: this.progressPercentage,
    averageRating: this.feedback.length > 0 ? 
      this.feedback.reduce((acc, f) => acc + (f.rating || 0), 0) / this.feedback.length : 0,
    duration: this.totalDurationDays
  };
};

// Pre-save middleware to update session counts
mentorshipSchema.pre('save', function(next) {
  if (this.sessions) {
    this.totalSessions = this.sessions.filter(s => s.status === 'completed').length;
  }
  next();
});

module.exports = mongoose.model('Mentorship', mentorshipSchema);