const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAdminUsers,
  toggleUserSuspension,
  getAdminRequests,
  getAdminReports,
  resolveReport,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { authorizeAdmin } = require('../middleware/admin');

router.use(protect, authorizeAdmin);

router.get('/stats', getAdminStats);
router.get('/users', getAdminUsers);
router.patch('/users/:id/suspend', toggleUserSuspension);
router.get('/requests', getAdminRequests);
router.get('/reports', getAdminReports);
router.patch('/reports/:id/resolve', resolveReport);

module.exports = router;
