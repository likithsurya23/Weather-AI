const { users, favorites, chatHistories } = require('../models/store');

exports.getPreferences = (req, res) => {
  const user = req.user || users[0];
  res.json({
    success: true,
    data: user.preferences
  });
};

exports.updatePreferences = (req, res) => {
  const user = req.user || users[0];
  const { temperatureUnit, language, theme, weatherAlerts, weeklySummary, marketingUpdates } = req.body;

  if (temperatureUnit) user.preferences.temperatureUnit = temperatureUnit;
  if (language) user.preferences.language = language;
  if (theme) user.preferences.theme = theme;
  if (weatherAlerts !== undefined) user.preferences.weatherAlerts = weatherAlerts;
  if (weeklySummary !== undefined) user.preferences.weeklySummary = weeklySummary;
  if (marketingUpdates !== undefined) user.preferences.marketingUpdates = marketingUpdates;

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: user.preferences
  });
};

exports.deleteAccount = (req, res) => {
  const user = req.user || users[0];
  const uIdx = users.findIndex(u => u.id === user.id);
  if (uIdx !== -1 && users.length > 1) {
    users.splice(uIdx, 1);
  }
  
  // Cleanup user favorites & chats
  for (let i = favorites.length - 1; i >= 0; i--) {
    if (favorites[i].userId === user.id) favorites.splice(i, 1);
  }
  for (let i = chatHistories.length - 1; i >= 0; i--) {
    if (chatHistories[i].userId === user.id) chatHistories.splice(i, 1);
  }

  res.json({
    success: true,
    message: 'Account deleted successfully'
  });
};
