const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'OFFER_RECEIVED',
        'OFFER_ACCEPTED',
        'OFFER_REJECTED',
        'REQUEST_IN_PROGRESS',
        'HELPER_COMPLETED',
        'REQUESTER_CONFIRMED',
        'REQUEST_CLOSED',
        'CIRCLE_JOINED',
        'REPORT_SUBMITTED',
      ],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      default: null,
    },
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpCircle',
      default: null,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', notificationSchema);
