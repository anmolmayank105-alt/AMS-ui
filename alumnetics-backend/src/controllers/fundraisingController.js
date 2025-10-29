const FundraisingCampaign = require('../models/FundraisingCampaign');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get all active campaigns with filtering and pagination
const getCampaigns = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { 
      status: 'active',
      isApproved: true
    };
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Institution filter
    if (req.query.institution) {
      filter.institution = { $regex: req.query.institution, $options: 'i' };
    }
    
    // Urgency filter
    if (req.query.urgency) {
      filter.urgency = req.query.urgency;
    }
    
    // Goal range filter
    if (req.query.minGoal || req.query.maxGoal) {
      filter.goalAmount = {};
      if (req.query.minGoal) filter.goalAmount.$gte = parseInt(req.query.minGoal);
      if (req.query.maxGoal) filter.goalAmount.$lte = parseInt(req.query.maxGoal);
    }
    
    // Active campaigns only (not expired)
    filter.$or = [
      { endDate: { $gte: new Date() } },
      { endDate: null }
    ];
    
    const campaigns = await FundraisingCampaign.find(filter)
      .select('title description goalAmount currentAmount category institution urgency endDate images isFeatured createdAt')
      .populate('createdBy', 'firstName lastName profilePicture')
      .sort({ 
        isFeatured: -1,    // Featured campaigns first
        urgency: -1,       // High urgency first
        createdAt: -1      // Recent campaigns
      })
      .skip(skip)
      .limit(limit)
      .lean();
    
    // Calculate progress percentage for each campaign
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
      daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null
    }));
    
    const totalCampaigns = await FundraisingCampaign.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        campaigns: campaignsWithProgress,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCampaigns / limit),
          totalCampaigns,
          hasNextPage: page < Math.ceil(totalCampaigns / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaigns'
    });
  }
};

// Get single campaign with detailed information
const getCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await FundraisingCampaign.findById(campaignId)
      .populate('createdBy', 'firstName lastName email profilePicture')
      .populate('donations.donor', 'firstName lastName profilePicture');
    
    if (!campaign || campaign.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    // Increment view count
    await FundraisingCampaign.findByIdAndUpdate(campaignId, { $inc: { views: 1 } });
    
    // Calculate additional metrics
    const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
    const daysRemaining = campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null;
    const averageDonation = campaign.donationCount > 0 ? Math.round(campaign.currentAmount / campaign.donationCount) : 0;
    
    // Get recent donations (last 10)
    const recentDonations = campaign.donations
      .filter(d => !d.isAnonymous)
      .sort((a, b) => b.donatedAt - a.donatedAt)
      .slice(0, 10);
    
    // Get top donors (if they're not anonymous)
    const topDonors = campaign.donations
      .filter(d => !d.isAnonymous)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
    
    const campaignData = {
      ...campaign.toObject(),
      progressPercentage,
      daysRemaining,
      averageDonation,
      recentDonations,
      topDonors
    };
    
    res.json({
      success: true,
      data: { campaign: campaignData }
    });
    
  } catch (error) {
    console.error('Get campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign'
    });
  }
};

// Create new fundraising campaign
const createCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const campaignData = {
      ...req.body,
      createdBy: req.user._id,
      institution: req.user.academic?.institution || 'Independent'
    };
    
    const campaign = new FundraisingCampaign(campaignData);
    await campaign.save();
    
    // Populate creator info
    await campaign.populate('createdBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: { campaign }
    });
    
  } catch (error) {
    console.error('Create campaign error:', error);
    
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
      message: 'Failed to create campaign'
    });
  }
};

// Update campaign
const updateCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.createdBy;
    delete updateData.donations;
    delete updateData.currentAmount;
    delete updateData.donationCount;
    delete updateData.views;
    
    const campaign = await FundraisingCampaign.findOneAndUpdate(
      { _id: campaignId, createdBy: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName email');
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to update it'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign updated successfully',
      data: { campaign }
    });
    
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update campaign'
    });
  }
};

// Delete campaign
const deleteCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await FundraisingCampaign.findOneAndUpdate(
      { _id: campaignId, createdBy: req.user._id },
      { status: 'cancelled' },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign cancelled successfully'
    });
    
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete campaign'
    });
  }
};

// Donate to campaign
const donateToCampaign = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const { campaignId } = req.params;
    const { amount, isAnonymous = false, message, paymentMethod } = req.body;
    const donorId = req.user._id;
    
    const campaign = await FundraisingCampaign.findById(campaignId);
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    if (campaign.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Campaign is not active'
      });
    }
    
    if (campaign.endDate && campaign.endDate < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Campaign has ended'
      });
    }
    
    // In a real application, you would integrate with payment processors here
    // For now, we'll simulate a successful payment
    const donationId = await campaign.addDonation({
      donor: donorId,
      amount: parseFloat(amount),
      isAnonymous,
      message,
      paymentMethod,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    });
    
    // Populate the new donation
    await campaign.populate('donations.donor', 'firstName lastName profilePicture');
    const donation = campaign.donations.id(donationId);
    
    // Check if campaign goal is reached
    const progressPercentage = Math.round((campaign.currentAmount / campaign.goalAmount) * 100);
    
    res.json({
      success: true,
      message: 'Donation successful! Thank you for your contribution.',
      data: {
        donation,
        campaignProgress: {
          currentAmount: campaign.currentAmount,
          goalAmount: campaign.goalAmount,
          progressPercentage,
          donationCount: campaign.donationCount
        }
      }
    });
    
  } catch (error) {
    console.error('Donate to campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process donation'
    });
  }
};

// Get user's donations
const getMyDonations = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 20, 50);
    const skip = (page - 1) * limit;
    
    const campaigns = await FundraisingCampaign.find(
      { 'donations.donor': userId },
      {
        title: 1,
        goalAmount: 1,
        currentAmount: 1,
        category: 1,
        institution: 1,
        status: 1,
        donations: { $elemMatch: { donor: userId } }
      }
    )
    .populate('createdBy', 'firstName lastName')
    .sort({ 'donations.donatedAt': -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
    // Format the response
    const donations = campaigns.flatMap(campaign => 
      campaign.donations.map(donation => ({
        donationId: donation._id,
        amount: donation.amount,
        donatedAt: donation.donatedAt,
        message: donation.message,
        campaign: {
          id: campaign._id,
          title: campaign.title,
          category: campaign.category,
          institution: campaign.institution,
          createdBy: campaign.createdBy,
          status: campaign.status,
          progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100)
        }
      }))
    );
    
    // Calculate total donated amount
    const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
    
    res.json({
      success: true,
      data: {
        donations,
        totalDonated,
        totalDonations: donations.length,
        pagination: {
          currentPage: page,
          hasNextPage: campaigns.length === limit
        }
      }
    });
    
  } catch (error) {
    console.error('Get my donations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your donations'
    });
  }
};

// Get user's campaigns
const getMyCampaigns = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const campaigns = await FundraisingCampaign.find({ createdBy: userId })
      .select('title goalAmount currentAmount donationCount status category urgency createdAt endDate')
      .sort({ createdAt: -1 })
      .lean();
    
    // Add progress percentage to each campaign
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
      daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null
    }));
    
    // Calculate totals
    const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.currentAmount, 0);
    const totalDonations = campaigns.reduce((sum, campaign) => sum + campaign.donationCount, 0);
    
    res.json({
      success: true,
      data: {
        campaigns: campaignsWithProgress,
        summary: {
          totalCampaigns: campaigns.length,
          totalRaised,
          totalDonations,
          activeCampaigns: campaigns.filter(c => c.status === 'active').length
        }
      }
    });
    
  } catch (error) {
    console.error('Get my campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your campaigns'
    });
  }
};

// Search campaigns
const searchCampaigns = async (req, res) => {
  try {
    const { q, page = 1, limit = 12 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters long'
      });
    }
    
    const pageNum = parseInt(page);
    const limitNum = Math.min(parseInt(limit), 50);
    const skip = (pageNum - 1) * limitNum;
    
    // Build search query
    const searchQuery = {
      $and: [
        { status: 'active' },
        { isApproved: true },
        {
          $or: [
            { endDate: { $gte: new Date() } },
            { endDate: null }
          ]
        },
        {
          $or: [
            { title: { $regex: q.trim(), $options: 'i' } },
            { description: { $regex: q.trim(), $options: 'i' } },
            { category: { $regex: q.trim(), $options: 'i' } },
            { institution: { $regex: q.trim(), $options: 'i' } },
            { tags: { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    };
    
    const campaigns = await FundraisingCampaign.find(searchQuery)
      .select('title description goalAmount currentAmount category institution urgency endDate images isFeatured createdAt')
      .populate('createdBy', 'firstName lastName')
      .sort({ 
        isFeatured: -1,
        createdAt: -1 
      })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    // Add progress percentage
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
      daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null
    }));
    
    const totalResults = await FundraisingCampaign.countDocuments(searchQuery);
    
    res.json({
      success: true,
      data: {
        campaigns: campaignsWithProgress,
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
    console.error('Search campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Campaign search failed'
    });
  }
};

// Get featured campaigns
const getFeaturedCampaigns = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    
    const campaigns = await FundraisingCampaign.find({
      status: 'active',
      isApproved: true,
      isFeatured: true,
      $or: [
        { endDate: { $gte: new Date() } },
        { endDate: null }
      ]
    })
    .select('title description goalAmount currentAmount category institution urgency endDate images createdAt')
    .populate('createdBy', 'firstName lastName')
    .sort({ urgency: -1, createdAt: -1 })
    .limit(limit)
    .lean();
    
    // Add progress percentage
    const campaignsWithProgress = campaigns.map(campaign => ({
      ...campaign,
      progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
      daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null
    }));
    
    res.json({
      success: true,
      data: { campaigns: campaignsWithProgress }
    });
    
  } catch (error) {
    console.error('Get featured campaigns error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured campaigns'
    });
  }
};

// Approve campaign (admin only)
const approveCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await FundraisingCampaign.findByIdAndUpdate(
      campaignId,
      {
        isApproved: true,
        approvedBy: req.user._id
      },
      { new: true }
    );
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Campaign approved successfully',
      data: { campaign }
    });
    
  } catch (error) {
    console.error('Approve campaign error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve campaign'
    });
  }
};

// Get campaign analytics
const getCampaignAnalytics = async (req, res) => {
  try {
    const { campaignId } = req.params;
    
    const campaign = await FundraisingCampaign.findOne({
      _id: campaignId,
      createdBy: req.user._id
    });
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or you do not have permission'
      });
    }
    
    // Daily donation data for the last 30 days
    const last30Days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayDonations = campaign.donations.filter(d => 
        d.donatedAt >= date && d.donatedAt < nextDate
      );
      
      last30Days.push({
        date: date.toISOString().split('T')[0],
        donations: dayDonations.length,
        amount: dayDonations.reduce((sum, d) => sum + d.amount, 0)
      });
    }
    
    const analytics = {
      totalViews: campaign.views,
      totalDonations: campaign.donationCount,
      totalAmount: campaign.currentAmount,
      goalAmount: campaign.goalAmount,
      progressPercentage: Math.round((campaign.currentAmount / campaign.goalAmount) * 100),
      averageDonation: campaign.donationCount > 0 ? Math.round(campaign.currentAmount / campaign.donationCount) : 0,
      daysActive: Math.ceil((new Date() - campaign.createdAt) / (1000 * 60 * 60 * 24)),
      daysRemaining: campaign.endDate ? Math.max(0, Math.ceil((campaign.endDate - new Date()) / (1000 * 60 * 60 * 24))) : null,
      conversionRate: campaign.views > 0 ? ((campaign.donationCount / campaign.views) * 100).toFixed(2) : 0,
      donationTrend: last30Days
    };
    
    res.json({
      success: true,
      data: { analytics }
    });
    
  } catch (error) {
    console.error('Get campaign analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve campaign analytics'
    });
  }
};

// Get fundraising statistics (admin)
const getFundraisingStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfYear = new Date(today.getFullYear(), 0, 1);
    
    const stats = await Promise.all([
      // Total campaigns
      FundraisingCampaign.countDocuments({}),
      
      // Active campaigns
      FundraisingCampaign.countDocuments({ status: 'active' }),
      
      // Total amount raised
      FundraisingCampaign.aggregate([
        { $group: { _id: null, total: { $sum: '$currentAmount' } } }
      ]),
      
      // This month's fundraising
      FundraisingCampaign.aggregate([
        {
          $match: {
            'donations.donatedAt': { $gte: startOfMonth }
          }
        },
        {
          $unwind: '$donations'
        },
        {
          $match: {
            'donations.donatedAt': { $gte: startOfMonth }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$donations.amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      
      // This year's fundraising
      FundraisingCampaign.aggregate([
        {
          $match: {
            'donations.donatedAt': { $gte: startOfYear }
          }
        },
        {
          $unwind: '$donations'
        },
        {
          $match: {
            'donations.donatedAt': { $gte: startOfYear }
          }
        },
        {
          $group: {
            _id: null,
            amount: { $sum: '$donations.amount' },
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    const [
      totalCampaigns,
      activeCampaigns,
      totalRaisedResult,
      monthlyStatsResult,
      yearlyStatsResult
    ] = stats;
    
    const totalRaised = totalRaisedResult[0]?.total || 0;
    const monthlyStats = monthlyStatsResult[0] || { amount: 0, count: 0 };
    const yearlyStats = yearlyStatsResult[0] || { amount: 0, count: 0 };
    
    res.json({
      success: true,
      data: {
        totalCampaigns,
        activeCampaigns,
        totalRaised,
        monthlyAmount: monthlyStats.amount,
        monthlyDonations: monthlyStats.count,
        yearlyAmount: yearlyStats.amount,
        yearlyDonations: yearlyStats.count
      }
    });
    
  } catch (error) {
    console.error('Get fundraising stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve fundraising statistics'
    });
  }
};

module.exports = {
  getCampaigns,
  getCampaign,
  createCampaign,
  updateCampaign,
  deleteCampaign,
  donateToCampaign,
  getMyDonations,
  getMyCampaigns,
  searchCampaigns,
  getFeaturedCampaigns,
  approveCampaign,
  getCampaignAnalytics,
  getFundraisingStats
};