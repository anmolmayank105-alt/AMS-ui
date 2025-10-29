const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxLength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  // Event Details
  eventType: {
    type: String,
    enum: ['reunion', 'networking', 'workshop', 'seminar', 'career-fair', 'fundraising', 'social', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['academic', 'professional', 'social', 'sports', 'cultural', 'charity']
  },
  
  // Timing
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Location
  venue: {
    name: String,
    address: String,
    city: String,
    state: String,
    country: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  isVirtual: {
    type: Boolean,
    default: false
  },
  virtualLink: String,
  
  // Organization
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  
  // Registration
  registrationRequired: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    min: 1
  },
  registrationDeadline: Date,
  registrationFee: {
    amount: {
      type: Number,
      min: 0,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  
  // Content
  agenda: [{
    time: String,
    title: String,
    description: String,
    speaker: String
  }],
  speakers: [{
    name: String,
    title: String,
    organization: String,
    bio: String,
    profilePicture: String
  }],
  
  // Media
  coverImage: {
    url: String,
    publicId: String
  },
  gallery: [{
    url: String,
    publicId: String,
    caption: String
  }],
  
  // Attendees
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['registered', 'confirmed', 'attended', 'cancelled'],
      default: 'registered'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'cancelled', 'completed'],
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
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  
  // Tags and filters
  tags: [String],
  targetAudience: [{
    type: String,
    enum: ['students', 'alumni', 'faculty', 'all']
  }],
  graduationYears: [Number], // specific years if targeted
  departments: [String], // specific departments if targeted
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
eventSchema.index({ startDate: 1, status: 1 });
eventSchema.index({ institution: 1, eventType: 1 });
eventSchema.index({ organizer: 1 });
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for attendee count
eventSchema.virtual('attendeeCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

// Virtual for available spots
eventSchema.virtual('availableSpots').get(function() {
  if (!this.maxAttendees) return null;
  return this.maxAttendees - this.attendeeCount;
});

// Virtual for event duration in hours
eventSchema.virtual('durationHours').get(function() {
  if (!this.startDate || !this.endDate) return null;
  return Math.round((this.endDate - this.startDate) / (1000 * 60 * 60));
});

// Virtual for registration status
eventSchema.virtual('isRegistrationOpen').get(function() {
  const now = new Date();
  const deadline = this.registrationDeadline || this.startDate;
  return this.status === 'published' && now < deadline;
});

// Method to check if user can register
eventSchema.methods.canUserRegister = function(userId) {
  if (!this.isRegistrationOpen) return false;
  if (this.maxAttendees && this.attendeeCount >= this.maxAttendees) return false;
  
  const isAlreadyRegistered = this.attendees.some(
    attendee => attendee.user.toString() === userId.toString()
  );
  return !isAlreadyRegistered;
};

// Method to register user for event
eventSchema.methods.registerUser = function(userId) {
  if (!this.canUserRegister(userId)) {
    throw new Error('Cannot register for this event');
  }
  
  this.attendees.push({
    user: userId,
    registeredAt: new Date(),
    status: 'registered'
  });
  
  return this.save();
};

module.exports = mongoose.model('Event', eventSchema);