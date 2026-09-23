const Report = require('../models/Report');
const HelpRequest = require('../models/HelpRequest');

// @desc    Submit a report for a request or user
// @route   POST /api/reports
// @access  Private
exports.createReport = async (req, res) => {
  try {
    const { requestId, reportedUserId, reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required.',
      });
    }

    const report = await Report.create({
      reportedBy: req.user._id,
      requestId: requestId || null,
      reportedUserId: reportedUserId || null,
      reason,
      description: description || '',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted for review. Thank you for keeping our community safe.',
      data: report,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to submit report.',
    });
  }
};
