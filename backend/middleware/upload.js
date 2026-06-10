const multer = require('multer');
const { ApiError } = require('./errorHandler');

const ALLOWED_MIME = ['application/pdf', 'image/jpeg', 'image/png'];
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME.includes(file.mimetype)) cb(null, true);
  else cb(new ApiError(400, 'Only PDF, JPG, and PNG files are allowed', 'INVALID_FILE_TYPE'), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
module.exports = upload;