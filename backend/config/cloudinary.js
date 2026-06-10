const cloudinary = require('cloudinary').v2;

/**
 * Cloudinary (blueprint §10.1 — config/cloudinary.js)
 *
 * Real uploads run as soon as VALID credentials are present. Placeholder values
 * (e.g. "your_cloud_name", "xxxx") are treated as absent, so the dev mock seam
 * kicks in instead of throwing "Unknown API key". In development, a failed real
 * upload also falls back to a mock URL so the feature stays usable.
 */

// A value only counts if it's set AND doesn't look like a placeholder.
const realValue = (v) => {
  if (!v) return false;
  const s = String(v).trim();
  if (!s) return false;
  if (/^x+$/i.test(s)) return false; // "xxxxxxxx"
  if (/^(your[_-]|<|placeholder|changeme|cloud_name|api_key|api_secret|secret)/i.test(s)) return false;
  return true;
};

const hasCredentials =
  realValue(process.env.CLOUDINARY_CLOUD_NAME) &&
  realValue(process.env.CLOUDINARY_API_KEY) &&
  realValue(process.env.CLOUDINARY_API_SECRET);

const isProd = process.env.NODE_ENV === 'production';

if (hasCredentials) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
} else {
  console.warn('⚠️  Cloudinary not configured (or placeholder keys) — uploads return mock URLs.');
}

const mockResult = (folder) => {
  const stamp = Date.now();
  return {
    secure_url: `https://res.cloudinary.com/demo/${folder}/mock-${stamp}`,
    public_id: `${folder}/mock-${stamp}`,
    mocked: true,
  };
};

/**
 * Upload an in-memory file buffer (Multer memoryStorage) to Cloudinary.
 * Resolves with { secure_url, public_id, ... }.
 */
const uploadBuffer = (buffer, { folder = 'tillwedo', resourceType = 'auto' } = {}) =>
  new Promise((resolve, reject) => {
    if (!hasCredentials) {
      return resolve(mockResult(folder));
    }

    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: resourceType },
      (err, result) => {
        if (err) {
          // In dev, don't break the flow on a bad/expired key — mock it.
          if (!isProd) {
            console.warn(`⚠️  Cloudinary upload failed (${err.message}); using mock URL in dev.`);
            return resolve(mockResult(folder));
          }
          return reject(err);
        }
        return resolve(result);
      }
    );
    stream.end(buffer);
  });

module.exports = { cloudinary, uploadBuffer, hasCredentials };