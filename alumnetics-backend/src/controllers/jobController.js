const Job = require('../models/Job');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get jobs with optimized filtering and pagination
const getJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 15, 50);
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = { 
      status: 'active',
      isApproved: true,
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null },
        { applicationDeadline: { $gte: new Date() } }
      ]
    };
    
    // Employment type filter
    if (req.query.type) {
      filter.employmentType = req.query.type;
    }
    
    // Experience level filter
    if (req.query.experience) {
      filter.experienceLevel = req.query.experience;
    }
    
    // Work location filter
    if (req.query.workLocation) {
      filter.workLocation = req.query.workLocation;
    }
    
    // Location filter
    if (req.query.location) {
      filter['location.city'] = { $regex: req.query.location, $options: 'i' };
    }
    
    // Category filter
    if (req.query.category) {
      filter.category = req.query.category;
    }
    
    // Company filter
    if (req.query.company) {
      filter['company.name'] = { $regex: req.query.company, $options: 'i' };
    }
    
    // Salary range filter
    if (req.query.minSalary || req.query.maxSalary) {
      filter['salary.min'] = {};
      if (req.query.minSalary) filter['salary.min'].$gte = parseInt(req.query.minSalary);
      if (req.query.maxSalary) filter['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
    }
    
    const jobs = await Job.find(filter)
      .select('title company.name employmentType workLocation experienceLevel location salary category applicationDeadline createdAt isFeatured')
      .populate('postedBy', 'firstName lastName profilePicture')
      .sort({ 
        isFeatured: -1,  // Featured jobs first
        priority: -1,    // High priority jobs
        createdAt: -1    // Recent jobs
      })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalJobs = await Job.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalJobs / limit),
          totalJobs,
          hasNextPage: page < Math.ceil(totalJobs / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve jobs'
    });
  }
};

// Get single job with detailed information
const getJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findById(jobId)
      .populate('postedBy', 'firstName lastName email profilePicture')
      .populate('applications.applicant', 'firstName lastName profilePicture');
    
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    // Increment view count
    await Job.findByIdAndUpdate(jobId, { $inc: { views: 1 } });
    
    // Check if user can apply
    const canApply = req.user ? job.canUserApply(req.user._id) : false;
    const hasApplied = req.user ? job.applications.some(app => 
      app.applicant._id.toString() === req.user._id.toString()
    ) : false;
    
    // Get public job data
    const jobData = job.toPublicObject();
    
    res.json({
      success: true,
      data: {
        job: jobData,
        canApply,
        hasApplied,
        daysRemaining: job.daysRemaining
      }
    });
    
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job'
    });
  }
};

// Create new job posting
const createJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const jobData = {
      ...req.body,
      postedBy: req.user._id,
      institution: req.user.academic?.institution || 'Independent'
    };
    
    const job = new Job(jobData);
    await job.save();
    
    // Populate poster info
    await job.populate('postedBy', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });
    
  } catch (error) {
    console.error('Create job error:', error);
    
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
      message: 'Failed to create job posting'
    });
  }
};

// Update job posting
const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.postedBy;
    delete updateData.applications;
    delete updateData.views;
    
    const job = await Job.findOneAndUpdate(
      { _id: jobId, postedBy: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName email');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to update it'
      });
    }
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job }
    });
    
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job'
    });
  }
};

// Delete job posting
const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOneAndUpdate(
      { _id: jobId, postedBy: req.user._id },
      { status: 'closed' },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      success: true,
      message: 'Job posting closed successfully'
    });
    
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete job'
    });
  }
};

// Apply to job
const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { resumeUrl, coverLetter } = req.body;
    const userId = req.user._id;
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    if (!job.canUserApply(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot apply to this job'
      });
    }
    
    await job.applyForJob(userId, { resumeUrl, coverLetter });
    
    res.json({
      success: true,
      message: 'Application submitted successfully'
    });
    
  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application'
    });
  }
};

// Get job applications (job poster only)
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({
      _id: jobId,
      postedBy: req.user._id
    }).populate('applications.applicant', 'firstName lastName email profilePicture academic professional');
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission to view applications'
      });
    }
    
    res.json({
      success: true,
      data: {
        applications: job.applications,
        totalApplications: job.applicationCount
      }
    });
    
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job applications'
    });
  }
};

// Update application status
const updateApplicationStatus = async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { status, notes } = req.body;
    
    if (!['applied', 'reviewing', 'interviewed', 'offered', 'rejected', 'withdrawn'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application status'
      });
    }
    
    const job = await Job.findOne({
      _id: jobId,
      postedBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission'
      });
    }
    
    await job.updateApplicationStatus(applicationId, status, notes);
    
    res.json({
      success: true,
      message: 'Application status updated successfully'
    });
    
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status'
    });
  }
};

// Get user's job postings
const getMyJobs = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const jobs = await Job.find({ postedBy: userId })
      .select('title company.name status applicationCount createdAt expiresAt')
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({
      success: true,
      data: { jobs }
    });
    
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your job postings'
    });
  }
};

// Get user's job applications
const getMyApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const jobs = await Job.find(
      { 'applications.applicant': userId },
      { 
        title: 1, 
        'company.name': 1, 
        applications: { $elemMatch: { applicant: userId } },
        status: 1,
        createdAt: 1
      }
    ).populate('postedBy', 'firstName lastName')
    .sort({ 'applications.appliedAt': -1 })
    .lean();
    
    // Format the response
    const applications = jobs.map(job => ({
      jobId: job._id,
      jobTitle: job.title,
      company: job.company.name,
      postedBy: job.postedBy,
      application: job.applications[0],
      jobStatus: job.status
    }));
    
    res.json({
      success: true,
      data: { applications }
    });
    
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your applications'
    });
  }
};

// Search jobs with advanced filtering
const searchJobs = async (req, res) => {
  try {
    const { q, page = 1, limit = 15 } = req.query;
    
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
            { expiresAt: { $gte: new Date() } },
            { expiresAt: null },
            { applicationDeadline: { $gte: new Date() } }
          ]
        },
        {
          $or: [
            { title: { $regex: q.trim(), $options: 'i' } },
            { description: { $regex: q.trim(), $options: 'i' } },
            { 'company.name': { $regex: q.trim(), $options: 'i' } },
            { 'requirements.skills.name': { $regex: q.trim(), $options: 'i' } },
            { tags: { $regex: q.trim(), $options: 'i' } },
            { category: { $regex: q.trim(), $options: 'i' } }
          ]
        }
      ]
    };
    
    const jobs = await Job.find(searchQuery)
      .select('title company.name employmentType workLocation location salary createdAt isFeatured')
      .populate('postedBy', 'firstName lastName')
      .sort({ 
        isFeatured: -1,
        createdAt: -1 
      })
      .skip(skip)
      .limit(limitNum)
      .lean();
    
    const totalResults = await Job.countDocuments(searchQuery);
    
    res.json({
      success: true,
      data: {
        jobs,
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
    console.error('Search jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Job search failed'
    });
  }
};

// Get featured jobs
const getFeaturedJobs = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 20);
    
    const jobs = await Job.find({
      status: 'active',
      isApproved: true,
      isFeatured: true,
      $or: [
        { expiresAt: { $gte: new Date() } },
        { expiresAt: null }
      ]
    })
    .select('title company.name employmentType workLocation location salary createdAt')
    .populate('postedBy', 'firstName lastName')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
    .lean();
    
    res.json({
      success: true,
      data: { jobs }
    });
    
  } catch (error) {
    console.error('Get featured jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve featured jobs'
    });
  }
};

// Withdraw application
const withdrawApplication = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;
    
    const job = await Job.findById(jobId);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    const application = job.applications.find(app => 
      app.applicant.toString() === userId.toString()
    );
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    application.status = 'withdrawn';
    await job.save();
    
    res.json({
      success: true,
      message: 'Application withdrawn successfully'
    });
    
  } catch (error) {
    console.error('Withdraw application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to withdraw application'
    });
  }
};

// Approve job (admin only)
const approveJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findByIdAndUpdate(
      jobId,
      {
        isApproved: true,
        approvedBy: req.user._id
      },
      { new: true }
    );
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Job approved successfully',
      data: { job }
    });
    
  } catch (error) {
    console.error('Approve job error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve job'
    });
  }
};

// Get job analytics (job poster only)
const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({
      _id: jobId,
      postedBy: req.user._id
    });
    
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or you do not have permission'
      });
    }
    
    const analytics = {
      totalViews: job.views,
      totalApplications: job.applicationCount,
      applicationsByStatus: {
        applied: job.applications.filter(a => a.status === 'applied').length,
        reviewing: job.applications.filter(a => a.status === 'reviewing').length,
        interviewed: job.applications.filter(a => a.status === 'interviewed').length,
        offered: job.applications.filter(a => a.status === 'offered').length,
        rejected: job.applications.filter(a => a.status === 'rejected').length
      },
      daysActive: Math.ceil((new Date() - job.createdAt) / (1000 * 60 * 60 * 24)),
      daysRemaining: job.daysRemaining,
      isExpired: job.isExpired
    };
    
    res.json({
      success: true,
      data: { analytics }
    });
    
  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve job analytics'
    });
  }
};

module.exports = {
  getJobs,
  getJob,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getJobApplications,
  updateApplicationStatus,
  getMyJobs,
  getMyApplications,
  searchJobs,
  getFeaturedJobs,
  withdrawApplication,
  approveJob,
  getJobAnalytics
};