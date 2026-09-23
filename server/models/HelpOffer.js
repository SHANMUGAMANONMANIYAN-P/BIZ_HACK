const mongoose = require('mongoose');

const helpOfferSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpRequest',
      required: true,
    },
    helperId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
    },
    availableDate: {
      type: String,
      default: '',
    },
    availableTime: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending',
    },
    completedByHelper: {
      type: Boolean,
      default: false,
    },
    confirmedByRequester: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active offers from the same helper for the same request
helpOfferSchema.index({ requestId: 1, helperId: 1 }, { unique: true });

module.exports = mongoose.model('HelpOffer', helpOfferSchema);
