const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const emailService = require('../services/emailService');

const BCRYPT_ROUNDS = 10;

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

// POST /auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, phone, password, dob, location } = req.body;

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      throw new ApiError(409, 'An account with that email or phone already exists', 'DUPLICATE_USER');
    }

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const otp = generateOtp();

    const user = await User.create({
      name, email, phone, passwordHash, dob, location,
      verificationToken: otp,
      isVerified: false,
    });

    await emailService.sendVerificationEmail(user, otp);

    const token = signToken(user._id);
    return sendSuccess(res, {
      statusCode: 201,
      message: 'Registration successful. Check your email for the verification code.',
      data: { token, user },
    });
  } catch (err) {
    next(err);
  }
};

// POST /auth/login — email OR phone + password
const login = async (req, res, next) => {
  try {
    const { emailOrPhone, password } = req.body;

    const user = await User.findOne({
      $or: [{ email: String(emailOrPhone).toLowerCase() }, { phone: emailOrPhone }],
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Invalid credentials', 'INVALID_CREDENTIALS');
    }

    const token = signToken(user._id);
    return sendSuccess(res, { message: 'Logged in', data: { token, user } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/verify-email — { email, otp }
const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    if (user.isVerified) return sendSuccess(res, { message: 'Account already verified' });

    if (!user.verificationToken || user.verificationToken !== otp) {
      throw new ApiError(400, 'Invalid verification code', 'INVALID_OTP');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Email verified', data: { user } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/verify-phone — { phone, otp }
const verifyPhone = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;
    const user = await User.findOne({ phone });
    if (!user) throw new ApiError(404, 'User not found', 'USER_NOT_FOUND');
    if (user.isVerified) return sendSuccess(res, { message: 'Account already verified' });

    if (!user.verificationToken || user.verificationToken !== otp) {
      throw new ApiError(400, 'Invalid verification code', 'INVALID_OTP');
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Phone verified', data: { user } });
  } catch (err) {
    next(err);
  }
};

// POST /auth/forgot-password — { email } (always 200, no enumeration)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email).toLowerCase() });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpiry = new Date(Date.now() + 60 * 60 * 1000);
      await user.save();
      await emailService.sendPasswordResetEmail(user, token);
    }

    return sendSuccess(res, { message: 'If that email is registered, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

// POST /auth/reset-password — { token, newPassword }
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpiry: { $gt: new Date() },
    });
    if (!user) throw new ApiError(400, 'Invalid or expired reset token', 'INVALID_RESET_TOKEN');

    user.passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    await user.save();

    return sendSuccess(res, { message: 'Password reset successful. Please log in.' });
  } catch (err) {
    next(err);
  }
};

// POST /auth/logout (auth) — stateless JWT, client discards token
const logout = async (req, res, next) => {
  try {
    return sendSuccess(res, { message: 'Logged out. Please discard your token on the client.' });
  } catch (err) {
    next(err);
  }
};

// GET /auth/me (auth)
const getMe = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, verifyEmail, verifyPhone, forgotPassword, resetPassword, logout, getMe };