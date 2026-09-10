const authService = require('../services/authService');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    const result = await authService.registerUser({
      name,
      email,
      password,
      confirmPassword
    });

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser({ email, password });

    res.json({
      success: true,
      message: 'Logged in successfully',
      token: result.token,
      user: result.user
    });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    res.json({
      success: true,
      user: req.user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

exports.updateProfile = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { name } = req.body;
    if (name && name.trim()) {
      user.name = name.trim();
      user.avatar = name.trim().charAt(0).toUpperCase();
      await user.save();
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toSafeObject()
    });
  } catch (err) {
    next(err);
  }
};

exports.changePassword = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (err) {
    next(err);
  }
};
