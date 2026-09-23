const express = require('express');
const router = express.Router();
const {
  acceptOffer,
  rejectOffer,
  helperMarkComplete,
  requesterConfirmComplete,
  cancelOffer,
} = require('../controllers/offerController');
const { protect } = require('../middleware/auth');

router.patch('/:id/accept', protect, acceptOffer);
router.patch('/:id/reject', protect, rejectOffer);
router.patch('/:id/complete', protect, helperMarkComplete);
router.patch('/:id/confirm', protect, requesterConfirmComplete);
router.delete('/:id', protect, cancelOffer);

module.exports = router;
