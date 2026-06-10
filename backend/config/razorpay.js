const Razorpay = require('razorpay');

/**
 * Razorpay client (blueprint §6, §8.9).
 *
 * If the keys aren't set we export `razorpay = null` so the rest of the app
 * still boots; the payment controllers throw a clear 503 if a route that needs
 * Razorpay is hit without keys. This is the same "seam" pattern used for the
 * email / Cloudinary integrations.
 */
const hasKeys = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

const razorpay = hasKeys
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  : null;

if (!hasKeys) {
  console.warn('⚠️  Razorpay keys not set — payment routes will return 503 until configured.');
}

module.exports = { razorpay, hasKeys };