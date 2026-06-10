const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError } = require('./errorHandler');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required', 'NO_TOKEN');

    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // { id, iat, exp }

    const user = await User.findById(decoded.id);
    if (!user) throw new ApiError(401, 'User account no longer exists', 'USER_NOT_FOUND');

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = auth;