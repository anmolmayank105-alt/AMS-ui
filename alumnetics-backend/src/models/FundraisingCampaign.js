const mongoose = require('mongoose');

const fundraisingCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Campaign title is required'],
    trim: true,
    maxLength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Campaign description is required'],
    maxLength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  // Campaign Details
  campaignType: {
    type: String,
    enum: ['scholarship', 'infrastructure', 'research', 'emergency', 'sports', 'cultural', 'general'],
    required: true
  },
  category: String,
  
  // Financial Goals
  goalAmount: {
    type: Number,
    required: [true, 'Goal amount is required'],
    min: [1, 'Goal amount must be positive']
  },
  currency: {
    type: String,
    default: 'USD'
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Timeline
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  
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
  department: String,
  beneficiary: String, // Who/what benefits from this campaign
  
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
  
  // Campaign Content
  story: String, // Detailed story/narrative
  impactStatement: String, // What impact will donations have
  updates: [{
    title: String,
    content: String,
    image: {
      url: String,
      publicId: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  
  // Donation Tiers/Rewards
  donationTiers: [{
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    title: String,
    description: String,
    benefits: [String],
    maxBackers: Number, // Optional limit
    currentBackers: {
      type: Number,
      default: 0
    }
  }],
  
  // Donations
  donations: [{
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 1
    },
    isAnonymous: {
      type: Boolean,
      default: false
    },
    message: String,
    paymentMethod: String,
    transactionId: String,
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    tier: String, // Reference to donation tier if applicable
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
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
  
  // Settings
  allowAnonymousDonations: {
    type: Boolean,
    default: true
  },
  showDonorList: {
    type: Boolean,
    default: true
  },
  sendThankYouEmails: {
    type: Boolean,
    default: true
  },
  
  // Analytics
  views: {
    type: Number,
    default: 0
  },
  shareCount: {
    type: Number,
    default: 0
  },
  
  // Tags and Categories
  tags: [String],
  
  // Tax Information
  taxDeductible: {
    type: Boolean,
    default: true
  },
  taxId: String,
  
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
fundraisingCampaignSchema.index({ status: 1, endDate: 1 });
fundraisingCampaignSchema.index({ institution: 1, campaignType: 1 });
fundraisingCampaignSchema.index({ organizer: 1 });
fundraisingCampaignSchema.index({ title: 'text', description: 'text', tags: 'text' });
fundraisingCampaignSchema.index({ createdAt: -1 });

// Virtual for donation count
fundraisingCampaignSchema.virtual('donationCount').get(function() {
  return this.donations ? this.donations.filter(d => d.status === 'completed').length : 0;
});

// Virtual for progress percentage
fundraisingCampaignSchema.virtual('progressPercentage').get(function() {
  if (!this.goalAmount || this.goalAmount === 0) return 0;
  return Math.round((this.currentAmount / this.goalAmount) * 100);
});

// Virtual for days remaining
fundraisingCampaignSchema.virtual('daysRemaining').get(function() {
  if (!this.endDate) return null;
  
  const now = new Date();
  const diffTime = this.endDate - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
});

// Virtual for campaign status
fundraisingCampaignSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' && 
         this.startDate <= now && 
         this.endDate >= now;
});

// Virtual for goal reached
fundraisingCampaignSchema.virtual('isGoalReached').get(function() {
  return this.currentAmount >= this.goalAmount;
});

// Method to add donation
fundraisingCampaignSchema.methods.addDonation = function(donationData) {
  this.donations.push({
    ...donationData,
    createdAt: new Date()
  });
  
  // Update current amount if donation is completed
  if (donationData.status === 'completed') {
    this.currentAmount += donationData.amount;
    
    // Update tier backer count if tier specified
    if (donationData.tier) {
      const tier = this.donationTiers.find(t => t._id.toString() === donationData.tier);
      if (tier) {
        tier.currentBackers += 1;
      }
    }
  }
  
  return this.save();
};

// Method to update donation status
fundraisingCampaignSchema.methods.updateDonationStatus = function(donationId, status) {
  const donation = this.donations.id(donationId);
  if (!donation) {
    throw new Error('Donation not found');
  }
  
  const oldStatus = donation.status;
  donation.status = status;
  
  // Update current amount based on status change
  if (oldStatus !== 'completed' && status === 'completed') {
    this.currentAmount += donation.amount;
  } else if (oldStatus === 'completed' && status !== 'completed') {
    this.currentAmount -= donation.amount;
  }
  
  return this.save();
};

// Method to add campaign update
fundraisingCampaignSchema.methods.addUpdate = function(updateData, authorId) {
  this.updates.push({
    ...updateData,
    author: authorId,
    createdAt: new Date()
  });
  
  return this.save();
};

// Method to get top donors (non-anonymous)
fundraisingCampaignSchema.methods.getTopDonors = function(limit = 10) {
  return this.donations
    .filter(d => d.status === 'completed' && !d.isAnonymous)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, limit);
};

// Method to get recent donations
fundraisingCampaignSchema.methods.getRecentDonations = function(limit = 5) {
  return this.donations
    .filter(d => d.status === 'completed')
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, limit);
};

// Method to get donation statistics
fundraisingCampaignSchema.methods.getDonationStats = function() {
  const completedDonations = this.donations.filter(d => d.status === 'completed');
  
  if (completedDonations.length === 0) {
    return {
      totalDonations: 0,
      averageDonation: 0,
      largestDonation: 0,
      smallestDonation: 0
    };
  }
  
  const amounts = completedDonations.map(d => d.amount);
  
  return {
    totalDonations: completedDonations.length,
    averageDonation: this.currentAmount / completedDonations.length,
    largestDonation: Math.max(...amounts),
    smallestDonation: Math.min(...amounts)
  };
};

// Pre-save middleware to update campaign status
fundraisingCampaignSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-complete campaign if goal reached and past end date
  if (this.isGoalReached && now > this.endDate && this.status === 'active') {
    this.status = 'completed';
  }
  
  // Auto-pause campaign if past end date but goal not reached
  if (!this.isGoalReached && now > this.endDate && this.status === 'active') {
    this.status = 'paused';
  }
  
  next();
});

// Method to get filtered public data
fundraisingCampaignSchema.methods.toPublicObject = function() {
  const obj = this.toObject();
  
  // Filter out sensitive donation information
  obj.donations = obj.donations
    .filter(d => d.status === 'completed')
    .map(d => ({
      amount: d.isAnonymous ? null : d.amount,
      donor: d.isAnonymous ? null : d.donor,
      message: d.message,
      createdAt: d.createdAt,
      isAnonymous: d.isAnonymous
    }));
  
  return obj;
};

module.exports = mongoose.model('FundraisingCampaign', fundraisingCampaignSchema);