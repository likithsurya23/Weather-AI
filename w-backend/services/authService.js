const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'weatherai_secret_super_key_2026';
const JWT_EXPIRES_IN = '7d';

/**
 * Generate JWT token for an authenticated user
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Register a new user with password confirmation and store in MongoDB
 */
async function registerUser({ name, email, password, confirmPassword }) {
  if (!name || !email || !password) {
    const error = new Error('Name, email, and password are required');
    error.statusCode = 400;
    throw error;
  }

  if (confirmPassword !== undefined && password !== confirmPassword) {
    const error = new Error('Passwords do not match');
    error.statusCode = 400;
    throw error;
  }

  if (password.length < 6) {
    const error = new Error('Password must be at least 6 characters');
    error.statusCode = 400;
    throw error;
  }

  const existing = await User.findOne({ email: email.toLowerCase().trim() });
  if (existing) {
    const error = new Error('An account with this email already exists');
    error.statusCode = 409;
    throw error;
  }

  const user = new User({
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password,
    avatar: name.trim().charAt(0).toUpperCase()
  });

  await user.save();
  const token = generateToken(user);

  return {
    token,
    user: user.toSafeObject()
  };
}

/**
 * Authenticate existing user with email and password
 */
async function loginUser({ email, password }) {
  if (!email || !password) {
    const error = new Error('Email and password are required');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  return {
    token,
    user: user.toSafeObject()
  };
}

/**
 * Get user profile by MongoDB ObjectId
 */
async function getUserById(userId) {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }
  return user.toSafeObject();
}

/**
 * Google OAuth helper - ready for future Google OAuth integration
 */
async function handleGoogleOAuthUser({ googleId, email, name, avatar }) {
  let user = await User.findOne({
    $or: [{ googleId }, { email: email.toLowerCase().trim() }]
  });

  if (!user) {
    user = new User({
      name,
      email: email.toLowerCase().trim(),
      avatar: avatar || (name ? name.charAt(0).toUpperCase() : 'G'),
      authProvider: 'google',
      googleId
    });
    await user.save();
  } else if (!user.googleId) {
    user.googleId = googleId;
    user.authProvider = 'google';
    await user.save();
  }

  const token = generateToken(user);
  return {
    token,
    user: user.toSafeObject()
  };
}

module.exports = {
  generateToken,
  registerUser,
  loginUser,
  getUserById,
  handleGoogleOAuthUser
};
