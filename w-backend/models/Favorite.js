const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    city: {
      type: String,
      required: [true, 'City name is required'],
      trim: true
    },
    country: {
      type: String,
      default: 'Global',
      trim: true
    },
    lat: {
      type: Number,
      default: 0
    },
    lon: {
      type: Number,
      default: 0
    },
    temp: {
      type: Number,
      default: 24
    },
    condition: {
      type: String,
      default: 'Sunny'
    },
    iconUrl: {
      type: String,
      default: ''
    },
    isFavorite: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Prevent duplicate city favorites for the same user
favoriteSchema.index({ userId: 1, city: 1 }, { unique: true });

const Favorite = mongoose.model('Favorite', favoriteSchema);

module.exports = Favorite;
