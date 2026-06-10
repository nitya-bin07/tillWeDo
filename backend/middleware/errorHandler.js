class ApiError extends Error {
  constructor(statusCode, message, errorCode = 'ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let errorCode = err.errorCode || 'INTERNAL_ERROR';

  if (err.name === 'CastError') { statusCode = 400; message = `Invalid value for "${err.path}"`; errorCode = 'INVALID_ID'; }
  if (err.name === 'ValidationError') { statusCode = 400; message = Object.values(err.errors).map(e => e.message).join('; '); errorCode = 'VALIDATION_ERROR'; }
  if (err.code === 11000) { statusCode = 409; const field = Object.keys(err.keyValue || {})[0] || 'field'; message = `A record with that ${field} already exists`; errorCode = 'DUPLICATE_KEY'; }
  if (err.name === 'JsonWebTokenError') { statusCode = 401; message = 'Invalid authentication token'; errorCode = 'INVALID_TOKEN'; }
  if (err.name === 'TokenExpiredError') { statusCode = 401; message = 'Authentication token expired'; errorCode = 'TOKEN_EXPIRED'; }
  if (err.code === 'LIMIT_FILE_SIZE') { statusCode = 400; message = 'File too large (max 10MB)'; errorCode = 'FILE_TOO_LARGE'; }

  if (statusCode >= 500) console.error('💥 Server error:', err);

  const body = { success: false, message, errorCode };
  if ((process.env.NODE_ENV || 'development') === 'development') body.stack = err.stack;
  res.status(statusCode).json(body);
};

module.exports = { ApiError, notFound, errorHandler };