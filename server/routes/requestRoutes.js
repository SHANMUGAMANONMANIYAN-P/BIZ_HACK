const express = require('express');
const router = express.Router();
const {
  getAllRequests,
  getRelevantRequests,
  getRequestById,
  createRequest,
  updateRequest,
  deleteRequest,
  updateRequestStatus,
} = require('../controllers/requestController');
const { createOffer, getOffersByRequest } = require('../controllers/offerController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', getAllRequests);
router.get('/relevant', protect, getRelevantRequests);
router.get('/:id', optionalAuth, getRequestById);
router.post('/', protect, createRequest);
router.put('/:id', protect, updateRequest);
router.delete('/:id', protect, deleteRequest);
router.patch('/:id/status', protect, updateRequestStatus);

// Nested offer routes
router.post('/:id/offers', protect, createOffer);
router.get('/:id/offers', protect, getOffersByRequest);

module.exports = router;
