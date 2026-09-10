const User = require('../models/User');
const Favorite = require('../models/Favorite');
const ChatHistory = require('../models/ChatHistory');

exports.getPreferences = async (req, res, next) => {
  try {
    const user = req.user;
    res.json({
      success: true,
      data: user.preferences
    });
  } catch (err) {
    next(err);
  }
};

exports.updatePreferences = async (req, res, next) => {
  try {
    const user = req.user;
    const {
      temperatureUnit,
      windSpeedUnit,
      pressureUnit,
      dateFormat,
      timeFormat,
      language,
      theme,
      accentColor,
      weatherAlerts,
      weeklySummary,
      marketingUpdates,
      autoDetectLocation,
      defaultLocation
    } = req.body;

    if (!user.preferences) {
      user.preferences = {};
    }

    if (temperatureUnit) user.preferences.temperatureUnit = temperatureUnit;
    if (windSpeedUnit) user.preferences.windSpeedUnit = windSpeedUnit;
    if (pressureUnit) user.preferences.pressureUnit = pressureUnit;
    if (dateFormat) user.preferences.dateFormat = dateFormat;
    if (timeFormat) user.preferences.timeFormat = timeFormat;
    if (language) user.preferences.language = language;
    if (theme) user.preferences.theme = theme;
    if (accentColor) user.preferences.accentColor = accentColor;
    if (weatherAlerts !== undefined) user.preferences.weatherAlerts = weatherAlerts;
    if (weeklySummary !== undefined) user.preferences.weeklySummary = weeklySummary;
    if (marketingUpdates !== undefined) user.preferences.marketingUpdates = marketingUpdates;
    if (autoDetectLocation !== undefined) user.preferences.autoDetectLocation = autoDetectLocation;
    if (defaultLocation !== undefined) user.preferences.defaultLocation = defaultLocation;

    await user.save();

    res.json({
      success: true,
      message: 'Preferences updated successfully',
      data: user.preferences
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Delete related user data
    await Promise.all([
      Favorite.deleteMany({ userId }),
      ChatHistory.deleteMany({ userId }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
