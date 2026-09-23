const HelpCircle = require('../models/HelpCircle');
const HelpRequest = require('../models/HelpRequest');
const User = require('../models/User');

// @desc    Get all Help Circles with stats
// @route   GET /api/circles
// @access  Public
exports.getAllCircles = async (req, res) => {
  try {
    const circles = await HelpCircle.find().populate('createdBy', 'name email');

    const circleIds = circles.map((c) => c._id);
    const activeRequests = await HelpRequest.find({
      circleId: { $in: circleIds },
      status: { $in: ['OPEN', 'ACCEPTED', 'IN PROGRESS'] },
    });

    const requestCountMap = {};
    activeRequests.forEach((r) => {
      const cId = r.circleId.toString();
      requestCountMap[cId] = (requestCountMap[cId] || 0) + 1;
    });

    const enriched = circles.map((circle) => {
      const isMember =
        req.user && circle.members.some((m) => m.toString() === req.user._id.toString());
      return {
        ...circle.toObject(),
        membersCount: circle.members.length,
        activeRequestsCount: requestCountMap[circle._id.toString()] || 0,
        isMember: !!isMember,
      };
    });

    res.json({
      success: true,
      count: enriched.length,
      data: enriched,
    });
  } catch (error) {
    console.error('Error fetching circles:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve Help Circles.',
    });
  }
};

// @desc    Get single Help Circle details with requests
// @route   GET /api/circles/:id
// @access  Public
exports.getCircleById = async (req, res) => {
  try {
    const circle = await HelpCircle.findById(req.params.id)
      .populate('createdBy', 'name email department')
      .populate('members', 'name email department location profileImage skills');

    if (!circle) {
      return res.status(404).json({ success: false, message: 'Help Circle not found.' });
    }

    const requests = await HelpRequest.find({ circleId: circle._id })
      .populate('requesterId', 'name email department location')
      .sort({ createdAt: -1 });

    const isMember =
      req.user && circle.members.some((m) => m._id.toString() === req.user._id.toString());

    res.json({
      success: true,
      data: {
        ...circle.toObject(),
        membersCount: circle.members.length,
        activeRequestsCount: requests.filter((r) =>
          ['OPEN', 'ACCEPTED', 'IN PROGRESS'].includes(r.status)
        ).length,
        isMember: !!isMember,
        requests,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve circle details.',
    });
  }
};

// @desc    Create a new Help Circle
// @route   POST /api/circles
// @access  Private
exports.createCircle = async (req, res) => {
  try {
    const { name, description, category, icon } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required for a Help Circle.',
      });
    }

    const existing = await HelpCircle.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A Help Circle with this name already exists.',
      });
    }

    const circle = await HelpCircle.create({
      name: name.trim(),
      description: description.trim(),
      category: category || 'Community',
      icon: icon || 'Users',
      createdBy: req.user._id,
      members: [req.user._id],
    });

    // Add circle to user's circleIds
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { circleIds: circle._id },
    });

    res.status(201).json({
      success: true,
      message: 'Help Circle created successfully!',
      data: circle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create Help Circle.',
      error: error.message,
    });
  }
};

// @desc    Join a Help Circle
// @route   POST /api/circles/:id/join
// @access  Private
exports.joinCircle = async (req, res) => {
  try {
    const circle = await HelpCircle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ success: false, message: 'Circle not found.' });
    }

    const isMember = circle.members.some(
      (m) => m.toString() === req.user._id.toString()
    );

    if (isMember) {
      return res.status(400).json({
        success: false,
        message: 'You are already a member of this Help Circle.',
      });
    }

    circle.members.push(req.user._id);
    await circle.save();

    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { circleIds: circle._id },
    });

    res.json({
      success: true,
      message: `Successfully joined ${circle.name}!`,
      data: circle,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to join Help Circle.',
    });
  }
};

// @desc    Leave a Help Circle
// @route   DELETE /api/circles/:id/leave
// @access  Private
exports.leaveCircle = async (req, res) => {
  try {
    const circle = await HelpCircle.findById(req.params.id);
    if (!circle) {
      return res.status(404).json({ success: false, message: 'Circle not found.' });
    }

    circle.members = circle.members.filter(
      (m) => m.toString() !== req.user._id.toString()
    );
    await circle.save();

    await User.findByIdAndUpdate(req.user._id, {
      $pull: { circleIds: circle._id },
    });

    res.json({
      success: true,
      message: `Left ${circle.name}.`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to leave Help Circle.',
    });
  }
};
