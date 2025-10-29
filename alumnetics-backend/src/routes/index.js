const express = require('express');

const router = express.Router();

// Import route modules
const authRoutes = require('./auth');
const userRoutes = require('./users');
const profileRoutes = require('./profile');
const eventRoutes = require('./events');
const jobRoutes = require('./jobs');
const messageRoutes = require('./messages');
const fundraisingRoutes = require('./fundraising');
const mentorshipRoutes = require('./mentorship');

// Mount routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/events', eventRoutes);
router.use('/jobs', jobRoutes);
router.use('/messages', messageRoutes);
router.use('/fundraising', fundraisingRoutes);
router.use('/mentorship', mentorshipRoutes);

// API health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'AlumNetics API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API documentation endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AlumNetics API',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        routes: [
          'POST /register - Register new user',
          'POST /login - User login',
          'POST /logout - User logout',
          'GET /verify-email/:token - Verify email',
          'POST /resend-verification - Resend verification email',
          'POST /refresh-token - Refresh access token',
          'GET /profile - Get current user profile'
        ]
      },
      users: {
        base: '/api/users',
        routes: [
          'GET / - Get all users',
          'GET /search - Search users',
          'GET /profile/stats - Get profile statistics',
          'PUT /profile - Update user profile',
          'PUT /profile/privacy - Update privacy settings',
          'POST /profile/avatar - Upload avatar',
          'PUT /profile/password - Change password',
          'GET /:userId - Get user by ID',
          'DELETE /:userId - Delete user (admin only)'
        ]
      },
      events: {
        base: '/api/events',
        routes: [
          'GET / - Get all events',
          'GET /:eventId - Get event details',
          'POST / - Create new event',
          'PUT /:eventId - Update event',
          'DELETE /:eventId - Delete event',
          'GET /my/events - Get user\'s events',
          'POST /:eventId/register - Register for event',
          'DELETE /:eventId/register - Unregister from event',
          'GET /:eventId/attendees - Get event attendees',
          'PUT /:eventId/attendees/:userId - Update attendee status',
          'GET /:eventId/analytics - Get event analytics',
          'PUT /:eventId/approve - Approve event (admin only)'
        ]
      },
      jobs: {
        base: '/api/jobs',
        routes: [
          'GET / - Get all jobs',
          'GET /search - Search jobs',
          'GET /featured - Get featured jobs',
          'GET /:jobId - Get job details',
          'POST / - Create job posting',
          'PUT /:jobId - Update job',
          'DELETE /:jobId - Delete job',
          'GET /my/postings - Get user\'s job postings',
          'GET /my/applications - Get user\'s applications',
          'POST /:jobId/apply - Apply to job',
          'DELETE /:jobId/apply - Withdraw application',
          'GET /:jobId/applications - Get job applications',
          'PUT /:jobId/applications/:applicationId - Update application status',
          'GET /:jobId/analytics - Get job analytics',
          'PUT /:jobId/approve - Approve job (admin only)'
        ]
      },
      messages: {
        base: '/api/messages',
        routes: [
          'GET /conversations - Get user conversations',
          'POST /conversations - Create new conversation',
          'GET /conversations/:conversationId - Get conversation details',
          'DELETE /conversations/:conversationId - Archive conversation',
          'GET /unread-count - Get unread message count',
          'POST /conversations/:conversationId/participants - Add participant',
          'DELETE /conversations/:conversationId/participants/:userId - Remove participant',
          'GET /conversations/:conversationId/messages - Get messages',
          'POST /conversations/:conversationId/messages - Send message',
          'PUT /conversations/:conversationId/messages/read - Mark messages as read',
          'GET /search - Search messages',
          'PUT /messages/:messageId - Edit message',
          'DELETE /messages/:messageId - Delete message',
          'POST /messages/:messageId/reactions - Add reaction',
          'DELETE /messages/:messageId/reactions - Remove reaction',
          'POST /upload-attachment - Upload file attachment'
        ]
      },
      fundraising: {
        base: '/api/fundraising',
        routes: [
          'GET / - Get all campaigns',
          'GET /search - Search campaigns',
          'GET /featured - Get featured campaigns',
          'GET /:campaignId - Get campaign details',
          'POST / - Create campaign',
          'PUT /:campaignId - Update campaign',
          'DELETE /:campaignId - Delete campaign',
          'GET /my/campaigns - Get user\'s campaigns',
          'GET /my/donations - Get user\'s donations',
          'POST /:campaignId/donate - Make donation',
          'POST /:campaignId/process-donation - Process payment',
          'POST /:campaignId/updates - Add campaign update',
          'GET /:campaignId/donations - Get campaign donations',
          'GET /:campaignId/donors - Get campaign donors',
          'GET /:campaignId/analytics - Get campaign analytics',
          'GET /:campaignId/export-donations - Export donations',
          'PUT /:campaignId/donations/:donationId - Update donation status',
          'PUT /:campaignId/approve - Approve campaign (admin only)'
        ]
      },
      mentorship: {
        base: '/api/mentorship',
        routes: [
          'GET /search-mentors - Search available mentors',
          'GET / - Get all mentorships',
          'GET /my/all - Get user\'s mentorships',
          'GET /requests - Get mentorship requests',
          'GET /matches - Get mentor matches',
          'GET /stats - Get mentorship statistics',
          'POST /request - Create mentorship request',
          'GET /:mentorshipId - Get mentorship details',
          'POST /:mentorshipId/accept - Accept mentorship',
          'POST /:mentorshipId/decline - Decline mentorship',
          'POST /:mentorshipId/start - Start mentorship',
          'POST /:mentorshipId/complete - Complete mentorship',
          'POST /:mentorshipId/pause - Pause mentorship',
          'POST /:mentorshipId/cancel - Cancel mentorship',
          'GET /:mentorshipId/sessions - Get sessions',
          'POST /:mentorshipId/sessions - Schedule session',
          'PUT /:mentorshipId/sessions/:sessionId/complete - Complete session',
          'PUT /:mentorshipId/sessions/:sessionId/cancel - Cancel session',
          'POST /:mentorshipId/milestones - Add milestone',
          'PUT /:mentorshipId/milestones/:milestoneId - Complete milestone',
          'GET /:mentorshipId/feedback - Get feedback',
          'POST /:mentorshipId/feedback - Add feedback',
          'PUT /:mentorshipId/approve - Approve mentorship (admin only)'
        ]
      }
    },
    documentation: 'Visit /api/docs for detailed API documentation',
    support: 'Contact support@alumnetics.com for assistance'
  });
});

module.exports = router;