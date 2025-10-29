const express = require('express');
const {
  authenticate,
  authorize,
  authorizeResourceAccess,
  requireEmailVerification,
  optionalAuth
} = require('../middleware/auth');

const router = express.Router();

// Placeholder controllers - will be implemented
const fundraisingController = {
  getCampaigns: (req, res) => res.json({ message: 'Get campaigns - to be implemented' }),
  getCampaign: (req, res) => res.json({ message: 'Get campaign - to be implemented' }),
  createCampaign: (req, res) => res.json({ message: 'Create campaign - to be implemented' }),
  updateCampaign: (req, res) => res.json({ message: 'Update campaign - to be implemented' }),
  deleteCampaign: (req, res) => res.json({ message: 'Delete campaign - to be implemented' }),
  donate: (req, res) => res.json({ message: 'Make donation - to be implemented' }),
  getDonations: (req, res) => res.json({ message: 'Get donations - to be implemented' }),
  getMyCampaigns: (req, res) => res.json({ message: 'Get my campaigns - to be implemented' }),
  getMyDonations: (req, res) => res.json({ message: 'Get my donations - to be implemented' }),
  addUpdate: (req, res) => res.json({ message: 'Add campaign update - to be implemented' }),
  getFeaturedCampaigns: (req, res) => res.json({ message: 'Get featured campaigns - to be implemented' }),
  searchCampaigns: (req, res) => res.json({ message: 'Search campaigns - to be implemented' }),
  approveCampaign: (req, res) => res.json({ message: 'Approve campaign - to be implemented' }),
  getCampaignAnalytics: (req, res) => res.json({ message: 'Get campaign analytics - to be implemented' }),
  processDonation: (req, res) => res.json({ message: 'Process donation payment - to be implemented' }),
  updateDonationStatus: (req, res) => res.json({ message: 'Update donation status - to be implemented' }),
  getDonors: (req, res) => res.json({ message: 'Get campaign donors - to be implemented' }),
  exportDonations: (req, res) => res.json({ message: 'Export donations - to be implemented' })
};

// Public routes (with optional authentication)
router.get('/', optionalAuth, fundraisingController.getCampaigns);
router.get('/search', optionalAuth, fundraisingController.searchCampaigns);
router.get('/featured', optionalAuth, fundraisingController.getFeaturedCampaigns);
router.get('/:campaignId', optionalAuth, fundraisingController.getCampaign);

// Protected routes
router.use(authenticate);

// Campaign management
router.post('/', requireEmailVerification, fundraisingController.createCampaign);
router.get('/my/campaigns', fundraisingController.getMyCampaigns);
router.get('/my/donations', fundraisingController.getMyDonations);

// Donations
router.post('/:campaignId/donate', requireEmailVerification, fundraisingController.donate);
router.post('/:campaignId/process-donation', fundraisingController.processDonation);

// Campaign organizer routes (resource ownership or admin)
router.put('/:campaignId', authorizeResourceAccess('organizer'), fundraisingController.updateCampaign);
router.delete('/:campaignId', authorizeResourceAccess('organizer'), fundraisingController.deleteCampaign);
router.post('/:campaignId/updates', authorizeResourceAccess('organizer'), fundraisingController.addUpdate);
router.get('/:campaignId/donations', authorizeResourceAccess('organizer'), fundraisingController.getDonations);
router.get('/:campaignId/donors', authorizeResourceAccess('organizer'), fundraisingController.getDonors);
router.get('/:campaignId/analytics', authorizeResourceAccess('organizer'), fundraisingController.getCampaignAnalytics);
router.get('/:campaignId/export-donations', authorizeResourceAccess('organizer'), fundraisingController.exportDonations);
router.put('/:campaignId/donations/:donationId', authorizeResourceAccess('organizer'), fundraisingController.updateDonationStatus);

// Admin routes
router.put('/:campaignId/approve', authorize('admin'), fundraisingController.approveCampaign);

module.exports = router;