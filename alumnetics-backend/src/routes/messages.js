const express = require('express');
const {
  authenticate,
  authorize,
  authorizeResourceAccess,
  requireEmailVerification
} = require('../middleware/auth');
const messageController = require('../controllers/messageController');

const router = express.Router();

// All message routes require authentication
router.use(authenticate);

// Polling endpoint for Vercel fallback (lightweight auth check)
router.get('/poll', messageController.pollNewMessages || ((req, res) => {
  res.json({ success: true, data: { messages: [] } });
}));

// Public endpoints (no email verification required)
router.get('/conversations', messageController.getConversations);
router.get('/unread-count', messageController.getUnreadCount);

// Email verification temporarily disabled for testing
// TODO: Re-enable email verification after implementing proper verification system
// router.use(requireEmailVerification);

// Search route MUST come before /:userId to prevent Express from treating 'search' as a userId
router.get('/search', messageController.searchMessages);

// Direct messaging (simplified - no conversations)
router.get('/:userId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.put('/:userId/read', messageController.markConversationAsRead);
router.delete('/:messageId', messageController.deleteMessage);

// Block/unblock users
router.post('/:userId/block', messageController.blockUser);
router.delete('/:userId/block', messageController.unblockUser);
router.get('/blocked/list', messageController.getBlockedUsers);

// Admin analytics
router.get('/analytics/stats', authorize(['admin']), messageController.getMessageAnalytics);

module.exports = router;