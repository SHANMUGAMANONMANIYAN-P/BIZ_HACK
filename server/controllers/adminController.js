const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const HelpCircle = require('../models/HelpCircle');
const HelpOffer = require('../models/HelpOffer');
const Report = require('../models/Report');

// @desc    Get Admin Live Statistics
// @route   GET /api/admin/stats
// @access  Private (Admin)
exports.getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRequests = await HelpRequest.countDocuments();
    const openRequests = await HelpRequest.countDocuments({ status: 'OPEN' });
    const inProgressRequests = await HelpRequest.countDocuments({
      status: { $in: ['ACCEPTED', 'IN PROGRESS'] },
    });
    const completedRequests = await HelpRequest.countDocuments({
      status: { $in: ['ASSISTED', 'CLOSED'] },
    });
    const totalCircles = await HelpCircle.countDocuments();
    const totalOffers = await HelpOffer.countDocuments();
    const pendingReports = await Report.countDocuments({ status: 'pending' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalRequests,
        openRequests,
        inProgressRequests,
        completedRequests,
        totalCircles,
        totalOffers,
        pendingReports,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch admin stats.',
    });
  }
};

// @desc    Get all users for admin management
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAdminUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('circleIds', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users.',
    });
  }
};

// @desc    Toggle user suspension status
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private (Admin)
exports.toggleUserSuspension = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot suspend an administrative account.',
      });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.json({
      success: true,
      message: `User ${user.name} is now ${user.isSuspended ? 'SUSPENDED' : 'ACTIVE'}.`,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user suspension.',
    });
  }
};

// @desc    Get all requests for admin
// @route   GET /api/admin/requests
// @access  Private (Admin)
exports.getAdminRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find()
      .populate('requesterId', 'name email department')
      .populate('circleId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests.',
    });
  }
};

// @desc    Get all reports for admin
// @route   GET /api/admin/reports
// @access  Private (Admin)
exports.getAdminReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reportedBy', 'name email department')
      .populate('requestId', 'title requesterId status')
      .populate('reportedUserId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch reports.',
    });
  }
};

// @desc    Resolve or dismiss a report
// @route   PATCH /api/admin/reports/:id/resolve
// @access  Private (Admin)
exports.resolveReport = async (req, res) => {
  try {
    const { status } = req.body; // 'resolved' or 'dismissed'
    const report = await Report.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found.' });
    }

    report.status = status || 'resolved';
    await report.save();

    res.json({
      success: true,
      message: `Report marked as ${report.status}.`,
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update report status.',
    });
  }
};
