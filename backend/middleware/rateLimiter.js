const rateLimit = require('express-rate-limit');
const WINDOW_MS = 15 * 60 * 1000;

const base = {
  windowMs: WINDOW_MS,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.', errorCode: 'RATE_LIMITED' },
};

const authLimiter = rateLimit({ ...base, limit: 100 });
const generalLimiter = rateLimit({ ...base, limit: 500 });

module.exports = { authLimiter, generalLimiter };