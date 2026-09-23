const HelpRequest = require('../models/HelpRequest');
const HelpOffer = require('../models/HelpOffer');
const RequestHistory = require('../models/RequestHistory');
const HelpCircle = require('../models/HelpCircle');
const { createNotification } = require('../services/notificationService');
const { recordHistory } = require('../services/historyService');

// Helper to attach helper counts to requests
const attachHelperStats = async (requests) => {
  const requestIds = requests.map((r) => r._id);
  const acceptedOffers = await HelpOffer.find({
    requestId: { $in: requestIds },
    status: { $in: ['Accepted', 'In Progress', 'Completed'] },
  });

  const offerCountMap = {};
  acceptedOffers.forEach((offer) => {
    const rId = offer.requestId.toString();
    offerCountMap[rId] = (offerCountMap[rId] || 0) + 1;
  });

  return requests.map((req) => {
    const reqObj = req.toObject ? req.toObject() : req;
    const acceptedCount = offerCountMap[req._id.toString()] || 0;
    return {
      ...reqObj,
      confirmedHelpersCount: acceptedCount,
      remainingSlots: Math.max(0, req.helpersRequired - acceptedCount),
      isCapacityFull: acceptedCount >= req.helpersRequired,
    };
  });
};

// @desc    Get all requests with filtering, search and sorting
// @route   GET /api/requests
// @access  Public
exports.getAllRequests = async (req, res) => {
  try {
    const {
      search,
      category,
      urgency,
      circleId,
      status,
      location,
      sortBy,
      availableSlotsOnly,
    } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (urgency && urgency !== 'All') {
      query.urgency = urgency;
    }

    if (circleId && circleId !== 'All') {
      if (circleId === 'global') {
        query.circleId = null;
      } else {
        query.circleId = circleId;
      }
    }

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { createdAt: -1 }; // default newest
    if (sortBy === 'urgent') {
      // High first, then Medium, then Low
      sortOption = { urgency: -1, createdAt: -1 };
    } else if (sortBy === 'oldest') {
      sortOption = { createdAt: 1 };
    }

    let requests = await HelpRequest.find(query)
      .populate('requesterId', 'name email department location profileImage')
      .populate('circleId', 'name icon category')
      .sort(sortOption);

    let enrichedRequests = await attachHelperStats(requests);

    if (availableSlotsOnly === 'true') {
      enrichedRequests = enrichedRequests.filter(
        (r) => r.remainingSlots > 0 && r.status === 'OPEN'
      );
    }

    res.json({
      success: true,
      count: enrichedRequests.length,
      data: enrichedRequests,
    });
  } catch (error) {
    console.error('Error in getAllRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch requests.',
      error: error.message,
    });
  }
};

// @desc    Get Rule-Based Relevant Requests for Logged-in User (NO AI, 100% Explainable)
// @route   GET /api/requests/relevant
// @access  Private
exports.getRelevantRequests = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required for relevant requests.',
      });
    }

    // Fetch open requests not created by the user
    const openRequests = await HelpRequest.find({
      requesterId: { $ne: user._id },
      status: { $in: ['OPEN', 'ACCEPTED'] },
    })
      .populate('requesterId', 'name department location')
      .populate('circleId', 'name icon category')
      .sort({ createdAt: -1 });

    const enriched = await attachHelperStats(openRequests);

    // Filter and score based on transparent explicit rules
    const relevantWithReasons = [];

    for (const item of enriched) {
      const reasons = [];
      let score = 0;

      // Rule 1: Circle Membership Match
      if (item.circleId && user.circleIds && user.circleIds.some((cId) => cId.toString() === item.circleId._id.toString())) {
        reasons.push(`You belong to the "${item.circleId.name}" Help Circle`);
        score += 50;
      }

      // Rule 2: Department Match
      if (user.department && item.requesterId && item.requesterId.department && item.requesterId.department.toLowerCase() === user.department.toLowerCase()) {
        reasons.push(`Requester is in your department (${user.department})`);
        score += 30;
      }

      // Rule 3: Skills Match in title or description
      if (user.skills && user.skills.length > 0) {
        const textToSearch = `${item.title} ${item.description}`.toLowerCase();
        const matchedSkills = user.skills.filter((skill) =>
          textToSearch.includes(skill.toLowerCase())
        );
        if (matchedSkills.length > 0) {
          reasons.push(`Matches your skills: ${matchedSkills.join(', ')}`);
          score += 40;
        }
      }

      // Rule 4: Location Match
      if (user.location && item.location && item.location.toLowerCase().includes(user.location.toLowerCase())) {
        reasons.push(`Located in your area (${item.location})`);
        score += 20;
      }

      // Rule 5: Urgency bump
      if (item.urgency === 'High') {
        reasons.push('High Urgency community request');
        score += 15;
      }

      // If at least one matching rule fired, include it
      if (reasons.length > 0 && item.remainingSlots > 0) {
        relevantWithReasons.push({
          ...item,
          matchScore: score,
          relevanceReasons: reasons,
        });
      }
    }

    // Sort by explainable rule score descending
    relevantWithReasons.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      success: true,
      count: relevantWithReasons.length,
      data: relevantWithReasons,
    });
  } catch (error) {
    console.error('Error in getRelevantRequests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate relevant requests.',
      error: error.message,
    });
  }
};

// @desc    Get single request by ID with timeline and offers
// @route   GET /api/requests/:id
// @access  Public / Optional Auth
exports.getRequestById = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id)
      .populate('requesterId', 'name email department location profileImage')
      .populate('circleId', 'name icon category description members');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'Request not found.',
      });
    }

    // Fetch offers
    const allOffers = await HelpOffer.find({ requestId: request._id })
      .populate('helperId', 'name email department location profileImage skills')
      .sort({ createdAt: -1 });

    const acceptedOffers = allOffers.filter((o) =>
      ['Accepted', 'In Progress', 'Completed'].includes(o.status)
    );

    const confirmedCount = acceptedOffers.length;
    const remainingSlots = Math.max(0, request.helpersRequired - confirmedCount);

    // Fetch immutable Request History Timeline
    const timeline = await RequestHistory.find({ requestId: request._id })
      .populate('changedBy', 'name role')
      .sort({ createdAt: 1 });

    // Determine what offers the requester or visitor sees
    const isOwner = req.user && req.user._id.toString() === request.requesterId._id.toString();
    const isAdmin = req.user && req.user.role === 'admin';

    let visibleOffers = [];
    if (isOwner || isAdmin) {
      visibleOffers = allOffers;
    } else if (req.user) {
      // Helper sees their own offer + accepted helpers list
      visibleOffers = allOffers.filter(
        (o) =>
          o.helperId._id.toString() === req.user._id.toString() ||
          ['Accepted', 'In Progress', 'Completed'].includes(o.status)
      );
    } else {
      // Public sees accepted helper summary only
      visibleOffers = acceptedOffers.map((o) => ({
        _id: o._id,
        helperId: {
          _id: o.helperId._id,
          name: o.helperId.name,
          department: o.helperId.department,
        },
        status: o.status,
        completedByHelper: o.completedByHelper,
        confirmedByRequester: o.confirmedByRequester,
      }));
    }

    // Check if current user has an active offer
    let userOffer = null;
    if (req.user) {
      userOffer = allOffers.find(
        (o) => o.helperId._id.toString() === req.user._id.toString()
      );
    }

    res.json({
      success: true,
      data: {
        ...request.toObject(),
        confirmedHelpersCount: confirmedCount,
        remainingSlots,
        isCapacityFull: confirmedCount >= request.helpersRequired,
        offers: visibleOffers,
        userOffer,
        timeline,
        isOwner,
      },
    });
  } catch (error) {
    console.error('Error in getRequestById:', error);
    res.status(500).json({
      success: false,
      message: 'Server error retrieving request details.',
    });
  }
};

// @desc    Create a new help request
// @route   POST /api/requests
// @access  Private
exports.createRequest = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      location,
      requiredDate,
      requiredTime,
      urgency,
      helpersRequired,
      circleId,
      image,
    } = req.body;

    if (!title || !description || !category || !location || !requiredDate || !requiredTime) {
      return res.status(400).json({
        success: false,
        message: 'Please fill all required fields.',
      });
    }

    // Validate circle existence if provided
    let circle = null;
    if (circleId) {
      circle = await HelpCircle.findById(circleId);
      if (!circle) {
        return res.status(400).json({
          success: false,
          message: 'Selected Help Circle not found.',
        });
      }
    }

    const request = await HelpRequest.create({
      requesterId: req.user._id,
      title,
      description,
      category,
      location,
      requiredDate,
      requiredTime,
      urgency: urgency || 'Medium',
      helpersRequired: helpersRequired ? parseInt(helpersRequired, 10) : 1,
      circleId: circleId || null,
      status: 'OPEN',
      image: image || '',
    });

    // Record in immutable history timeline
    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: '',
      newStatus: 'OPEN',
      action: 'Request Created',
      notes: `Help request opened for ${request.helpersRequired} helper(s). Scoped to: ${
        circle ? circle.name : 'Global Community'
      }.`,
    });

    // If in a circle, notify members (up to 20 for perf)
    if (circle && circle.members && circle.members.length > 0) {
      const otherMembers = circle.members.filter(
        (mId) => mId.toString() !== req.user._id.toString()
      );
      for (const memberId of otherMembers.slice(0, 15)) {
        await createNotification({
          userId: memberId,
          type: 'CIRCLE_JOINED',
          message: `New help request "${request.title}" was posted in ${circle.name}.`,
          requestId: request._id,
          circleId: circle._id,
        });
      }
    }

    const populatedRequest = await HelpRequest.findById(request._id)
      .populate('requesterId', 'name email department location')
      .populate('circleId', 'name icon');

    res.status(201).json({
      success: true,
      message: 'Help request posted successfully!',
      data: populatedRequest,
    });
  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create help request.',
      error: error.message,
    });
  }
};

// @desc    Update request details
// @route   PUT /api/requests/:id
// @access  Private (Requester or Admin)
exports.updateRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the creator or admin can update this request.',
      });
    }

    const {
      title,
      description,
      category,
      location,
      requiredDate,
      requiredTime,
      urgency,
      helpersRequired,
      circleId,
    } = req.body;

    if (title) request.title = title;
    if (description) request.description = description;
    if (category) request.category = category;
    if (location) request.location = location;
    if (requiredDate) request.requiredDate = requiredDate;
    if (requiredTime) request.requiredTime = requiredTime;
    if (urgency) request.urgency = urgency;
    if (helpersRequired) request.helpersRequired = parseInt(helpersRequired, 10);
    if (circleId !== undefined) request.circleId = circleId || null;

    await request.save();

    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: request.status,
      newStatus: request.status,
      action: 'Request Details Updated',
      notes: 'Requester modified request details.',
    });

    res.json({
      success: true,
      message: 'Request updated successfully.',
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update request.',
    });
  }
};

// @desc    Delete request
// @route   DELETE /api/requests/:id
// @access  Private (Requester or Admin)
exports.deleteRequest = async (req, res) => {
  try {
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to delete this request.',
      });
    }

    await HelpOffer.deleteMany({ requestId: request._id });
    await RequestHistory.deleteMany({ requestId: request._id });
    await HelpRequest.findByIdAndDelete(request._id);

    res.json({
      success: true,
      message: 'Request and related records removed.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete request.',
    });
  }
};

// @desc    Update Request Status (Strict State Machine)
// @route   PATCH /api/requests/:id/status
// @access  Private (Requester or Admin)
exports.updateRequestStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;
    const request = await HelpRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the requester or admin can update status.',
      });
    }

    const validTransitions = {
      OPEN: ['ACCEPTED', 'IN PROGRESS', 'CLOSED'],
      ACCEPTED: ['IN PROGRESS', 'OPEN', 'CLOSED'],
      'IN PROGRESS': ['ASSISTED', 'CLOSED'],
      ASSISTED: ['CLOSED'],
      CLOSED: [], // terminal state
    };

    if (
      !validTransitions[request.status] ||
      !validTransitions[request.status].includes(status)
    ) {
      return res.status(400).json({
        success: false,
        message: `Invalid state transition from ${request.status} to ${status}.`,
      });
    }

    const previousStatus = request.status;
    request.status = status;
    await request.save();

    // Record in history timeline
    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus,
      newStatus: status,
      action: `Status changed to ${status}`,
      notes: notes || `Request transitioned to ${status} by requester.`,
    });

    // Notify all accepted helpers
    const acceptedOffers = await HelpOffer.find({
      requestId: request._id,
      status: { $in: ['Accepted', 'In Progress', 'Completed'] },
    });

    for (const offer of acceptedOffers) {
      await createNotification({
        userId: offer.helperId,
        type:
          status === 'IN PROGRESS'
            ? 'REQUEST_IN_PROGRESS'
            : status === 'CLOSED'
            ? 'REQUEST_CLOSED'
            : 'OFFER_ACCEPTED',
        message: `Request "${request.title}" is now marked as ${status}.`,
        requestId: request._id,
      });
    }

    res.json({
      success: true,
      message: `Request status updated to ${status}.`,
      data: request,
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update request status.',
    });
  }
};
