const express = require('express');
const {
  authenticate,
  authorize,
  authorizeResourceAccess,
  requireEmailVerification,
  optionalAuth
} = require('../middleware/auth');

// Import event controllers
const {
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
} = require('../controllers/eventController');

const router = express.Router();

// Public routes (with optional authentication)
router.get('/', optionalAuth, getEvents);
router.get('/:eventId', optionalAuth, getEvent);

// Protected routes
router.use(authenticate);

// Event management
router.post('/', requireEmailVerification, createEvent);
router.get('/my/events', getMyEvents);

// Event participation
router.post('/:eventId/register', requireEmailVerification, registerForEvent);
router.delete('/:eventId/register', unregisterFromEvent);

// Event organizer routes (resource ownership or admin)
router.put('/:eventId', authorizeResourceAccess('organizer'), updateEvent);
router.delete('/:eventId', authorizeResourceAccess('organizer'), deleteEvent);
router.get('/:eventId/attendees', authorizeResourceAccess('organizer'), getEventAttendees);
router.put('/:eventId/attendees/:userId', authorizeResourceAccess('organizer'), updateAttendeeStatus);
router.get('/:eventId/analytics', authorizeResourceAccess('organizer'), getEventAnalytics);

// Admin routes
router.put('/:eventId/approve', authorize('admin'), approveEvent);

module.exports = router;