const express = require('express');
const router = express.Router();
const {
  getAllCircles,
  getCircleById,
  createCircle,
  joinCircle,
  leaveCircle,
} = require('../controllers/circleController');
const { protect, optionalAuth } = require('../middleware/auth');

router.get('/', optionalAuth, getAllCircles);
router.post('/', protect, createCircle);
router.get('/:id', optionalAuth, getCircleById);
router.post('/:id/join', protect, joinCircle);
router.delete('/:id/leave', protect, leaveCircle);

module.exports = router;
