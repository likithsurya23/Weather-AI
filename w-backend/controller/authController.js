const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { users } = require('../models/store');

const JWT_SECRET = process.env.JWT_SECRET || 'weatherai_secret_super_key_2026';

exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists' });
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      name,
      email,
      passwordHash: bcrypt.hashSync(password, 8),
      avatar: name.charAt(0).toUpperCase(),
      preferences: {
        temperatureUnit: 'celsius',
        language: 'English',
        theme: 'system',
        weatherAlerts: true,
        weeklySummary: true,
        marketingUpdates: false,
        autoDetectLocation: true
      },
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    const token = jwt.sign({ id: newUser.id, email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...safeUser } = newUser;

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isValid = bcrypt.compareSync(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    const { passwordHash, ...safeUser } = user;

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = (req, res) => {
  const user = req.user || users[0];
  const { passwordHash, ...safeUser } = user;
  res.json({
    success: true,
    user: safeUser
  });
};

exports.updateProfile = (req, res, next) => {
  try {
    const user = req.user || users[0];
    const { name, email } = req.body;
    if (name) user.name = name;
    if (email) user.email = email;
    if (name) user.avatar = name.charAt(0).toUpperCase();

    const { passwordHash, ...safeUser } = user;
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = (req, res, next) => {
  try {
    const user = req.user || users[0];
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }

    if (currentPassword && !bcrypt.compareSync(currentPassword, user.passwordHash)) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.passwordHash = bcrypt.hashSync(newPassword, 8);
    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};
