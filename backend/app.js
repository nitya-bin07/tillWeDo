const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { generalLimiter } = require('./middleware/rateLimiter');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

/* ------------------------------- Proxy trust ------------------------------ */
// Behind a single proxy (Railway / Vercel), so express-rate-limit and req.ip
// read the real client IP from X-Forwarded-For. A specific hop count (1) is
// used rather than `true` to avoid IP-spoofing of the rate limiter.
app.set('trust proxy', 1);

/* ----------------------------- Core middleware ---------------------------- */
app.use(helmet()); // security headers

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// General rate limit across the whole API. The /auth router adds the tighter
// authLimiter (100/15min) on top of this in Step 4.
app.use('/api/v1', generalLimiter);

// Razorpay webhook — needs the RAW body for HMAC signature verification, so it
// is mounted BEFORE the JSON parser (and before the rate limiter above it,
// so Razorpay's retries are never throttled).
app.post(
  '/api/v1/webhooks/razorpay',
  express.raw({ type: '*/*' }),
  require('./controllers/paymentController').webhook
);

// Body parsers (everything after this point gets parsed JSON / urlencoded).
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if ((process.env.NODE_ENV || 'development') === 'development') {
  app.use(morgan('dev'));
}

/* ------------------------------- Healthcheck ------------------------------- */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'TillWeDo API is alive ❤',
    version: 'v1',
  });
});

app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/* --------------------------------- Routes ---------------------------------- */
// Feature routers are mounted here as we build them (Step 4 onward), all under
// the /api/v1 base path (blueprint §8):
//
  app.use('/api/v1/auth', require('./routes/auth'));
  app.use('/api/v1/users', require('./routes/users'));
  app.use('/api/v1/couples', require('./routes/couples'));
  app.use('/api/v1/vault', require('./routes/vault'));
  app.use('/api/v1/contributions', require('./routes/contributions'));
  app.use('/api/v1/breakup', require('./routes/breakup'));
  app.use('/api/v1/marriage', require('./routes/marriage'));
  app.use('/api/v1/payments', require('./routes/payments'));
  app.use('/api/v1/admin', require('./routes/admin'));

/* --------------------------- 404 + error handling -------------------------- */
app.use(notFound); // any unmatched route -> 404 ApiError
app.use(errorHandler); // standard { success:false, message, errorCode } shape

module.exports = app;