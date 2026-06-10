const { ApiError } = require('./errorHandler');

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return next(new ApiError(403, 'Admin access required', 'FORBIDDEN'));
  }
  next();
};

module.exports = adminOnly;