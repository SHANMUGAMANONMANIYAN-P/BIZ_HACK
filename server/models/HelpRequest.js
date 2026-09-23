const mongoose = require('mongoose');

const helpRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Education',
        'Technology',
        'Events',
        'Transportation',
        'Household',
        'Moving',
        'Community',
        'Other',
      ],
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    requiredDate: {
      type: String,
      required: [true, 'Required date is required'],
    },
    requiredTime: {
      type: String,
      required: [true, 'Required time is required'],
    },
    urgency: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    helpersRequired: {
      type: Number,
      default: 1,
      min: [1, 'At least 1 helper required'],
    },
    circleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'HelpCircle',
      default: null,
    },
    status: {
      type: String,
      enum: ['OPEN', 'ACCEPTED', 'IN PROGRESS', 'ASSISTED', 'CLOSED'],
      default: 'OPEN',
    },
    image: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('HelpRequest', helpRequestSchema);
