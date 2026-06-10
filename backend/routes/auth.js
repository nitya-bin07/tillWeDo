const express = require('express');
const Joi = require('joi');

const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Tighter rate limit across the whole auth surface: 100 req / 15 min / IP
// (layers on top of the general 500/15min applied in app.js).
router.use(authLimiter);

/* ------------------------------- Validators ------------------------------- */
// Joi schemas live with their routes (the §10.1 structure has no validators/
// folder, so we co-locate them here).
const phonePattern = /^[+]?[0-9]{10,15}$/;

const otp = Joi.string()
  .length(6)
  .pattern(/^[0-9]+$/)
  .required()
  .messages({
    'string.length': 'OTP must be 6 digits',
    'string.pattern.base': 'OTP must be numeric',
  });

const registerSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().pattern(phonePattern).required().messages({
    'string.pattern.base': 'Enter a valid phone number',
  }),
  password: Joi.string().min(8).max(128).required(),
  dob: Joi.date().iso().less('now').required().messages({
    'date.less': 'Date of birth must be in the past',
  }),
  location: Joi.string().trim().max(120).allow('', null),
});

const loginSchema = Joi.object({
  emailOrPhone: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const verifyEmailSchema = Joi.object({
  email: Joi.string().email().required(),
  otp,
});

const verifyPhoneSchema = Joi.object({
  phone: Joi.string().pattern(phonePattern).required(),
  otp,
});

const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  newPassword: Joi.string().min(8).max(128).required(),
});

/* --------------------------------- Routes --------------------------------- */
// Public
router.post('/register', validateRequest(registerSchema), authController.register);
router.post('/login', validateRequest(loginSchema), authController.login);
router.post('/verify-email', validateRequest(verifyEmailSchema), authController.verifyEmail);
router.post('/verify-phone', validateRequest(verifyPhoneSchema), authController.verifyPhone);
router.post('/forgot-password', validateRequest(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validateRequest(resetPasswordSchema), authController.resetPassword);

// Protected
router.post('/logout', auth, authController.logout);
router.get('/me', auth, authController.getMe);

module.exports = router;