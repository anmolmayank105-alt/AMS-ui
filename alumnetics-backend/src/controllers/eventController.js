const Event = require('../models/Event');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get events with optimized pagination and filtering
const getEvents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const skip = (page - 1) * limit;
    
    // Build filter
    // Admin users can see all events, regular users only see published & approved events from their institution
    const filter = {};
    
    console.log('🔍 Full User Object:', JSON.stringify(req.user, null, 2));
    console.log('🔍 User Info:', {
      email: req.user?.email,
      role: req.user?.role,
      institution: req.user?.institution?.name,
      hasUser: !!req.user,
      hasInstitution: !!req.user?.institution
    });
    
    if (req.user && req.user.role === 'admin') {
      // Admin sees all events regardless of status
      console.log('👑 Admin user - No filter applied');
      // No filter applied
    } else if (req.user) {
      // Regular users only see published and approved events from their institution
      filter.status = 'published';
      filter.isApproved = true;
      
      // Filter by user's institution
      if (req.user.institution && req.user.institution.name) {
        filter.institution = req.user.institution.name;
        console.log('🎓 Student/Alumni filter:', filter);
      } else {
        console.log('⚠️ No institution found for user:', req.user.email);
        console.log('⚠️ User academic object:', req.user.academic);
      }
    } else {
      console.log('⚠️ No user authentication - showing all published events');
      filter.status = 'published';
      filter.isApproved = true;
    }
    
    // Date filtering
    const now = new Date();
    if (req.query.timeframe === 'upcoming') {
      filter.startDate = { $gte: now };
    } else if (req.query.timeframe === 'past') {
      filter.endDate = { $lt: now };
    }
    
    // Type filtering
    if (req.query.type) {
      filter.eventType = req.query.type;
    }
    
    // Institution filtering
    if (req.query.institution) {
      filter.institution = { $regex: req.query.institution, $options: 'i' };
    }
    
    // Location filtering
    if (req.query.location) {
      filter['venue.city'] = { $regex: req.query.location, $options: 'i' };
    }
    
    // Virtual/physical filtering
    if (req.query.format === 'virtual') {
      filter.isVirtual = true;
    } else if (req.query.format === 'physical') {
      filter.isVirtual = false;
    }
    
    console.log('🔎 Final filter being applied:', JSON.stringify(filter, null, 2));
    
    const events = await Event.find(filter)
      .select('title description eventType startDate endDate venue isVirtual coverImage imageUrl attendeeCount maxAttendees organizer institution status isApproved attendees')
      .populate('organizer', 'firstName lastName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
    
    const totalEvents = await Event.countDocuments(filter);
    
    console.log(`📊 Found ${events.length} events out of ${totalEvents} total`);
    if (events.length > 0) {
      console.log('📝 Event institutions:', events.map(e => ({ title: e.title, institution: e.institution, status: e.status, approved: e.isApproved })));
    }
    
    res.json({
      success: true,
      data: {
        events,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalEvents / limit),
          totalEvents,
          hasNextPage: page < Math.ceil(totalEvents / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve events'
    });
  }
};

// Get single event with detailed information
const getEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findById(eventId)
      .populate('organizer', 'firstName lastName email profilePicture')
      .populate('attendees.user', 'firstName lastName profilePicture');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Increment view count
    await Event.findByIdAndUpdate(eventId, { $inc: { views: 1 } });
    
    // Check if user can register
    const canRegister = req.user ? event.canUserRegister(req.user._id) : false;
    
    res.json({
      success: true,
      data: {
        event,
        canRegister,
        isRegistered: req.user ? event.attendees.some(a => a.user._id.toString() === req.user._id.toString()) : false
      }
    });
    
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event'
    });
  }
};

// Create new event
const createEvent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    const eventData = {
      ...req.body,
      organizer: req.user._id,
      institution: req.user.institution?.name || 'Independent',
      // Auto-approve events created by admin
      isApproved: req.user.role === 'admin' ? true : req.body.isApproved
    };
    
    const event = new Event(eventData);
    await event.save();
    
    console.log(`✅ Event created by ${req.user.role}: "${event.title}" - Auto-approved: ${event.isApproved}`);
    
    // Populate organizer info
    await event.populate('organizer', 'firstName lastName email');
    
    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: { event }
    });
    
  } catch (error) {
    console.error('Create event error:', error);
    
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
      message: 'Failed to create event'
    });
  }
};

// Update event
const updateEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const updateData = req.body;
    
    // Remove fields that shouldn't be updated
    delete updateData.organizer;
    delete updateData.attendees;
    delete updateData.views;
    
    const event = await Event.findOneAndUpdate(
      { _id: eventId, organizer: req.user._id },
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to update it'
      });
    }
    
    res.json({
      success: true,
      message: 'Event updated successfully',
      data: { event }
    });
    
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update event'
    });
  }
};

// Delete event
const deleteEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    // Allow deletion if user is the organizer OR an admin
    const query = { _id: eventId };
    if (req.user.role !== 'admin') {
      query.organizer = req.user._id;
    }
    
    const event = await Event.findOneAndDelete(query);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to delete it'
      });
    }
    
    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete event'
    });
  }
};

// Register for event
const registerForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    if (!event.canUserRegister(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot register for this event'
      });
    }
    
    await event.registerUser(userId);
    
    res.json({
      success: true,
      message: 'Successfully registered for event'
    });
    
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register for event'
    });
  }
};

// Unregister from event
const unregisterFromEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user._id;
    
    const event = await Event.findById(eventId);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    // Remove user from attendees
    event.attendees = event.attendees.filter(
      attendee => attendee.user.toString() !== userId.toString()
    );
    
    await event.save();
    
    res.json({
      success: true,
      message: 'Successfully unregistered from event'
    });
    
  } catch (error) {
    console.error('Unregister from event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unregister from event'
    });
  }
};

// Get event attendees (organizer only)
const getEventAttendees = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user._id
    }).populate('attendees.user', 'firstName lastName email profilePicture');
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission to view attendees'
      });
    }
    
    res.json({
      success: true,
      data: {
        attendees: event.attendees,
        totalAttendees: event.attendeeCount
      }
    });
    
  } catch (error) {
    console.error('Get event attendees error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event attendees'
    });
  }
};

// Update attendee status
const updateAttendeeStatus = async (req, res) => {
  try {
    const { eventId, userId } = req.params;
    const { status } = req.body;
    
    if (!['registered', 'confirmed', 'attended', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }
    
    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user._id
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission'
      });
    }
    
    const attendee = event.attendees.find(a => a.user.toString() === userId);
    
    if (!attendee) {
      return res.status(404).json({
        success: false,
        message: 'Attendee not found'
      });
    }
    
    attendee.status = status;
    await event.save();
    
    res.json({
      success: true,
      message: 'Attendee status updated successfully'
    });
    
  } catch (error) {
    console.error('Update attendee status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update attendee status'
    });
  }
};

// Get user's events
const getMyEvents = async (req, res) => {
  try {
    const userId = req.user._id;
    const { type = 'all' } = req.query;
    
    let query = {};
    
    if (type === 'organized') {
      query.organizer = userId;
    } else if (type === 'attending') {
      query['attendees.user'] = userId;
    } else {
      // All events
      query = {
        $or: [
          { organizer: userId },
          { 'attendees.user': userId }
        ]
      };
    }
    
    const events = await Event.find(query)
      .populate('organizer', 'firstName lastName')
      .sort({ startDate: 1 })
      .lean();
    
    res.json({
      success: true,
      data: { events }
    });
    
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve your events'
    });
  }
};

// Approve event (admin only)
const approveEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findByIdAndUpdate(
      eventId,
      {
        isApproved: true,
        approvedBy: req.user._id,
        status: 'published'
      },
      { new: true }
    );
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Event approved successfully',
      data: { event }
    });
    
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve event'
    });
  }
};

// Get event analytics (organizer only)
const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    
    const event = await Event.findOne({
      _id: eventId,
      organizer: req.user._id
    });
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found or you do not have permission'
      });
    }
    
    // Calculate analytics
    const analytics = {
      totalViews: event.views,
      totalRegistrations: event.attendeeCount,
      registrationRate: event.maxAttendees ? 
        Math.round((event.attendeeCount / event.maxAttendees) * 100) : null,
      statusBreakdown: {
        registered: event.attendees.filter(a => a.status === 'registered').length,
        confirmed: event.attendees.filter(a => a.status === 'confirmed').length,
        attended: event.attendees.filter(a => a.status === 'attended').length,
        cancelled: event.attendees.filter(a => a.status === 'cancelled').length
      },
      daysUntilEvent: event.daysRemaining,
      availableSpots: event.availableSpots
    };
    
    res.json({
      success: true,
      data: { analytics }
    });
    
  } catch (error) {
    console.error('Get event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve event analytics'
    });
  }
};

module.exports = {
  getEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  getEventAttendees,
  updateAttendeeStatus,
  getMyEvents,
  approveEvent,
  getEventAnalytics
};