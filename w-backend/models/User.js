const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 60
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: function () {
        return this.authProvider === 'local';
      },
      minlength: [6, 'Password must be at least 6 characters']
    },
    avatar: {
      type: String,
      default: ''
    },
    authProvider: {
      type: String,
      enum: ['local', 'google'],
      default: 'local'
    },
    googleId: {
      type: String,
      sparse: true
    },
    preferences: {
      temperatureUnit: {
        type: String,
        enum: ['celsius', 'fahrenheit'],
        default: 'celsius'
      },
      windSpeedUnit: {
        type: String,
        default: 'km/h'
      },
      pressureUnit: {
        type: String,
        default: 'hPa'
      },
      dateFormat: {
        type: String,
        default: 'DD MMM YYYY'
      },
      timeFormat: {
        type: String,
        default: '12-hour (AM/PM)'
      },
      language: {
        type: String,
        default: 'English'
      },
      theme: {
        type: String,
        enum: ['light', 'dark', 'system'],
        default: 'light'
      },
      accentColor: {
        type: String,
        default: '#2563EB'
      },
      weatherAlerts: {
        type: Boolean,
        default: true
      },
      weeklySummary: {
        type: Boolean,
        default: true
      },
      marketingUpdates: {
        type: Boolean,
        default: false
      },
      autoDetectLocation: {
        type: Boolean,
        default: true
      },
      defaultLocation: {
        type: String,
        default: 'Bengaluru, Karnataka'
      }
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving if modified
userSchema.pre('save', async function () {
  if (!this.isModified('password') || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.avatar && this.name) {
    this.avatar = this.name.charAt(0).toUpperCase();
  }
});

// Compare password instance method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Safe JSON representation removing sensitive data
userSchema.methods.toSafeObject = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
