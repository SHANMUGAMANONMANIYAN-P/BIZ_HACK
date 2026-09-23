const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  getUserPassport,
  updateProfile,
} = require('../controllers/authController');
const { protect, optionalAuth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/passport/:id?', optionalAuth, getUserPassport);

module.exports = router;
