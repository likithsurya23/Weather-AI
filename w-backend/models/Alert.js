const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    severity: {
      type: String,
      enum: ['danger', 'warning', 'info'],
      default: 'info'
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    timestamp: {
      type: String,
      default: 'Live Alert'
    },
    active: {
      type: Boolean,
      default: true
    },
    dismissedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: true
  }
);

const Alert = mongoose.model('Alert', alertSchema);

module.exports = Alert;
