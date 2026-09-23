const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const HelpRequest = require('../models/HelpRequest');
const HelpOffer = require('../models/HelpOffer');
const RequestHistory = require('../models/RequestHistory');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'supersecret_neon_nexus_jwt_key_2026_community_help_hub',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, department, location, skills } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user with this email already exists.',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Parse skills if string
    let parsedSkills = [];
    if (Array.isArray(skills)) {
      parsedSkills = skills.map((s) => s.trim()).filter(Boolean);
    } else if (typeof skills === 'string') {
      parsedSkills = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      department: department || 'General',
      location: location || 'Campus / Local',
      skills: parsedSkills,
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        location: user.location,
        skills: user.skills,
        circleIds: user.circleIds,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration.',
      error: error.message,
    });
  }
};

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account is suspended. Contact administration.',
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        location: user.location,
        skills: user.skills,
        circleIds: user.circleIds,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login.',
    });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('circleIds', 'name description icon category');
    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error fetching user profile.',
    });
  }
};

// @desc    Get User Contribution Passport (NO AI, NO credits, pure activity record)
// @route   GET /api/auth/passport/:id
// @access  Public / Authenticated
exports.getUserPassport = async (req, res) => {
  try {
    const userId = req.params.id || req.user?._id;
    const user = await User.findById(userId).populate('circleIds', 'name icon category');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    // Compute verified metrics
    // 1. Help Provided: Total offers completed and confirmed
    const completedOffers = await HelpOffer.find({
      helperId: user._id,
      status: 'Completed',
    }).populate('requestId', 'title category requiredDate helpersRequired');

    const helpProvidedCount = completedOffers.length;

    // 2. Help Received: Total requests owned by user that reached ASSISTED or CLOSED
    const receivedRequests = await HelpRequest.find({
      requesterId: user._id,
      status: { $in: ['ASSISTED', 'CLOSED'] },
    });
    const helpReceivedCount = receivedRequests.length;

    // 3. Requests Completed: All user-created requests that reached CLOSED or ASSISTED
    const requestsCompletedCount = receivedRequests.length;

    // 4. Group Activities: Completed multi-helper requests (helpersRequired > 1) where user participated or hosted
    const groupAssists = completedOffers.filter(
      (o) => o.requestId && o.requestId.helpersRequired > 1
    ).length;
    const groupHosted = receivedRequests.filter(
      (r) => r.helpersRequired > 1
    ).length;
    const groupActivitiesCount = groupAssists + groupHosted;

    // 5. Successful Assists: All accepted & completed offers
    const successfulAssistsCount = completedOffers.length;

    // 6. Recent Contributions stream (combining completed offers and requests)
    const recentHistory = await RequestHistory.find({
      changedBy: user._id,
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('requestId', 'title category status');

    const recentContributions = [];

    // Add completed assists
    for (const offer of completedOffers.slice(0, 8)) {
      if (offer.requestId) {
        recentContributions.push({
          id: offer._id,
          type: 'ASSIST_PROVIDED',
          title: `Assisted with "${offer.requestId.title}"`,
          category: offer.requestId.category,
          date: offer.completedAt || offer.updatedAt,
          verified: true,
          status: 'COMPLETED',
        });
      }
    }

    // Add received assists
    for (const reqItem of receivedRequests.slice(0, 5)) {
      recentContributions.push({
        id: reqItem._id,
        type: 'REQUEST_FULFILLED',
        title: `Received community assistance for "${reqItem.title}"`,
        category: reqItem.category,
        date: reqItem.updatedAt,
        verified: true,
        status: reqItem.status,
      });
    }

    // Sort by date descending
    recentContributions.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      passport: {
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          department: user.department,
          location: user.location,
          skills: user.skills,
          circles: user.circleIds,
          memberSince: user.createdAt,
        },
        stats: {
          helpProvided: helpProvidedCount,
          helpReceived: helpReceivedCount,
          requestsCompleted: requestsCompletedCount,
          groupActivities: groupActivitiesCount,
          successfulAssists: successfulAssistsCount,
        },
        skills: user.skills,
        recentContributions: recentContributions.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Error fetching passport:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving contribution passport.',
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { department, location, skills } = req.body;
    const user = await User.findById(req.user._id);

    if (department) user.department = department;
    if (location) user.location = location;
    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills.map((s) => s.trim()).filter(Boolean)
        : skills.split(',').map((s) => s.trim()).filter(Boolean);
    }

    await user.save();

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update profile.',
    });
  }
};
