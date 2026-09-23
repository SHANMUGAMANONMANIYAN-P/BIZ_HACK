const HelpOffer = require('../models/HelpOffer');
const HelpRequest = require('../models/HelpRequest');
const { createNotification } = require('../services/notificationService');
const { recordHistory } = require('../services/historyService');

// @desc    Submit an offer to help
// @route   POST /api/requests/:id/offers
// @access  Private
exports.createOffer = async (req, res) => {
  try {
    const requestId = req.params.id;
    const { message, availableDate, availableTime } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a brief message describing how/when you can help.',
      });
    }

    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Help request not found.' });
    }

    if (['ASSISTED', 'CLOSED'].includes(request.status)) {
      return res.status(400).json({
        success: false,
        message: 'This request is already completed or closed and cannot accept new offers.',
      });
    }

    // Requester cannot offer help on own request
    if (request.requesterId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot offer assistance on your own help request.',
      });
    }

    // Check duplicate offer
    const existingOffer = await HelpOffer.findOne({
      requestId,
      helperId: req.user._id,
    });

    if (existingOffer) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted an active offer for this request.',
      });
    }

    const offer = await HelpOffer.create({
      requestId,
      helperId: req.user._id,
      message,
      availableDate: availableDate || request.requiredDate,
      availableTime: availableTime || request.requiredTime,
      status: 'Pending',
    });

    // Record timeline history
    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: request.status,
      newStatus: request.status,
      action: 'Helper Offer Received',
      notes: `${req.user.name} offered assistance: "${message.substring(0, 60)}..."`,
    });

    // Notify requester
    await createNotification({
      userId: request.requesterId,
      type: 'OFFER_RECEIVED',
      message: `${req.user.name} offered to help with "${request.title}".`,
      requestId: request._id,
    });

    const populatedOffer = await HelpOffer.findById(offer._id).populate(
      'helperId',
      'name email department location profileImage skills'
    );

    res.status(201).json({
      success: true,
      message: 'Help offer submitted successfully!',
      data: populatedOffer,
    });
  } catch (error) {
    console.error('Error creating offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit help offer.',
      error: error.message,
    });
  }
};

// @desc    Get all offers for a request
// @route   GET /api/requests/:id/offers
// @access  Private (Requester, Admin, or participating helpers)
exports.getOffersByRequest = async (req, res) => {
  try {
    const requestId = req.params.id;
    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    const offers = await HelpOffer.find({ requestId })
      .populate('helperId', 'name email department location skills profileImage')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: offers.length,
      data: offers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch offers.',
    });
  }
};

// @desc    Accept a helper's offer (Enforcing multi-helper slot capacity)
// @route   PATCH /api/offers/:id/accept
// @access  Private (Requester or Admin)
exports.acceptOffer = async (req, res) => {
  try {
    const offer = await HelpOffer.findById(req.params.id).populate('helperId', 'name email');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const request = await HelpRequest.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Associated request not found.' });
    }

    // Ownership check
    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the requester can accept offers.',
      });
    }

    if (offer.status === 'Accepted') {
      return res.status(400).json({
        success: false,
        message: 'This offer is already accepted.',
      });
    }

    // Check capacity
    const acceptedCount = await HelpOffer.countDocuments({
      requestId: request._id,
      status: { $in: ['Accepted', 'In Progress', 'Completed'] },
    });

    if (acceptedCount >= request.helpersRequired) {
      return res.status(400).json({
        success: false,
        message: `Helper capacity full (${acceptedCount}/${request.helpersRequired} slots filled). Increase capacity to accept more helpers.`,
      });
    }

    offer.status = 'Accepted';
    await offer.save();

    const newAcceptedCount = acceptedCount + 1;

    // Transition request status to ACCEPTED or IN PROGRESS if needed
    let updatedRequestStatus = request.status;
    if (request.status === 'OPEN') {
      request.status = 'ACCEPTED';
      updatedRequestStatus = 'ACCEPTED';
      await request.save();
    }

    // Record in history timeline
    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: request.status,
      newStatus: request.status,
      action: 'Helper Accepted',
      notes: `Requester accepted ${offer.helperId.name} (${newAcceptedCount}/${request.helpersRequired} helpers confirmed).`,
    });

    // Notify helper
    await createNotification({
      userId: offer.helperId._id,
      type: 'OFFER_ACCEPTED',
      message: `Your offer to help with "${request.title}" has been ACCEPTED!`,
      requestId: request._id,
    });

    res.json({
      success: true,
      message: `Accepted ${offer.helperId.name} as a confirmed helper.`,
      data: {
        offer,
        confirmedHelpersCount: newAcceptedCount,
        helpersRequired: request.helpersRequired,
        requestStatus: updatedRequestStatus,
      },
    });
  } catch (error) {
    console.error('Error accepting offer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept offer.',
      error: error.message,
    });
  }
};

// @desc    Reject a helper's offer
// @route   PATCH /api/offers/:id/reject
// @access  Private (Requester or Admin)
exports.rejectOffer = async (req, res) => {
  try {
    const offer = await HelpOffer.findById(req.params.id).populate('helperId', 'name');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const request = await HelpRequest.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the requester can reject offers.',
      });
    }

    offer.status = 'Rejected';
    await offer.save();

    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: request.status,
      newStatus: request.status,
      action: 'Offer Rejected',
      notes: `Offer from ${offer.helperId.name} was declined.`,
    });

    await createNotification({
      userId: offer.helperId._id,
      type: 'OFFER_REJECTED',
      message: `Your offer for "${request.title}" was not accepted. Thank you for volunteering!`,
      requestId: request._id,
    });

    res.json({
      success: true,
      message: 'Offer declined.',
      data: offer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to reject offer.',
    });
  }
};

// @desc    Helper marks assistance completed (Side 1 of verification)
// @route   PATCH /api/offers/:id/complete
// @access  Private (Helper)
exports.helperMarkComplete = async (req, res) => {
  try {
    const offer = await HelpOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.helperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the assigned helper can mark assistance completed.',
      });
    }

    if (!['Accepted', 'In Progress'].includes(offer.status)) {
      return res.status(400).json({
        success: false,
        message: 'Offer must be Accepted or In Progress to mark as completed.',
      });
    }

    const request = await HelpRequest.findById(offer.requestId);

    offer.completedByHelper = true;
    offer.status = 'In Progress'; // awaiting requester confirmation
    await offer.save();

    // If request was ACCEPTED, transition to IN PROGRESS
    if (request && request.status === 'ACCEPTED') {
      request.status = 'IN PROGRESS';
      await request.save();
    }

    // Record in history timeline
    await recordHistory({
      requestId: offer.requestId,
      changedBy: req.user._id,
      previousStatus: request ? request.status : 'IN PROGRESS',
      newStatus: request ? request.status : 'IN PROGRESS',
      action: 'Assistance Completed by Helper',
      notes: `${req.user.name} reported completion of assistance. Awaiting requester verification.`,
    });

    // Notify requester for verification
    if (request) {
      await createNotification({
        userId: request.requesterId,
        type: 'HELPER_COMPLETED',
        message: `${req.user.name} marked their assistance completed for "${request.title}". Please verify and confirm.`,
        requestId: request._id,
      });
    }

    res.json({
      success: true,
      message: 'Assistance marked completed! Awaiting requester verification.',
      data: offer,
    });
  } catch (error) {
    console.error('Error marking completed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark assistance completed.',
    });
  }
};

// @desc    Requester confirms completion (Side 2 of verification -> Verified Assistance)
// @route   PATCH /api/offers/:id/confirm
// @access  Private (Requester)
exports.requesterConfirmComplete = async (req, res) => {
  try {
    const offer = await HelpOffer.findById(req.params.id).populate('helperId', 'name');
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    const request = await HelpRequest.findById(offer.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found.' });
    }

    if (
      request.requesterId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized. Only the requester can confirm completion.',
      });
    }

    offer.confirmedByRequester = true;
    offer.status = 'Completed';
    offer.completedAt = new Date();
    await offer.save();

    // Check overall request status: if all accepted helpers are verified completed
    const allAcceptedOffers = await HelpOffer.find({
      requestId: request._id,
      status: { $in: ['Accepted', 'In Progress', 'Completed'] },
    });

    const allCompleted =
      allAcceptedOffers.length > 0 &&
      allAcceptedOffers.every((o) => o.status === 'Completed' || o.confirmedByRequester);

    let updatedRequestStatus = request.status;
    if (allCompleted) {
      request.status = 'ASSISTED';
      updatedRequestStatus = 'ASSISTED';
      await request.save();
    }

    // Record in history timeline
    await recordHistory({
      requestId: request._id,
      changedBy: req.user._id,
      previousStatus: request.status,
      newStatus: updatedRequestStatus,
      action: 'Requester Confirmed Completion',
      notes: `Requester verified and confirmed assistance provided by ${offer.helperId.name}.${
        allCompleted ? ' All assistance completed -> Request status is now ASSISTED.' : ''
      }`,
    });

    // Notify helper of verified contribution
    await createNotification({
      userId: offer.helperId._id,
      type: 'REQUESTER_CONFIRMED',
      message: `Your assistance on "${request.title}" was verified and confirmed by the requester! Added to your Contribution Passport.`,
      requestId: request._id,
    });

    res.json({
      success: true,
      message: `Verified and confirmed assistance from ${offer.helperId.name}!`,
      data: {
        offer,
        requestStatus: updatedRequestStatus,
        allCompleted,
      },
    });
  } catch (error) {
    console.error('Error confirming complete:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm completion.',
    });
  }
};

// @desc    Helper cancels own pending offer
// @route   DELETE /api/offers/:id
// @access  Private (Helper)
exports.cancelOffer = async (req, res) => {
  try {
    const offer = await HelpOffer.findById(req.params.id);
    if (!offer) {
      return res.status(404).json({ success: false, message: 'Offer not found.' });
    }

    if (offer.helperId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized.' });
    }

    if (offer.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel an already completed offer.',
      });
    }

    await HelpOffer.findByIdAndDelete(offer._id);

    res.json({
      success: true,
      message: 'Offer withdrawn successfully.',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to cancel offer.',
    });
  }
};
