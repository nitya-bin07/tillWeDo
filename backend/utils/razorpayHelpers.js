const crypto = require('crypto');

/**
 * Razorpay signature helpers (blueprint §8.9).
 *
 * Razorpay signs things with HMAC-SHA256. We recompute the expected signature
 * and compare in constant time (timingSafeEqual) to avoid timing attacks.
 */

const timingSafeEqual = (a, b) => {
  if (!a || !b) return false;
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
};

/**
 * Verify a checkout payment signature.
 * Razorpay signs `order_id|payment_id` with your KEY_SECRET.
 */
const verifyPaymentSignature = ({ orderId, paymentId, signature }) => {
  if (!orderId || !paymentId || !signature) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
  return timingSafeEqual(expected, signature);
};

/**
 * Verify a webhook signature.
 * Razorpay signs the EXACT raw request body with your WEBHOOK_SECRET — which is
 * why the webhook route must receive the raw (unparsed) body.
 * `rawBody` may be a Buffer or string.
 */
const verifyWebhookSignature = (rawBody, signature) => {
  if (!rawBody || !signature) return false;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET || '')
    .update(rawBody)
    .digest('hex');
  return timingSafeEqual(expected, signature);
};

module.exports = { verifyPaymentSignature, verifyWebhookSignature, timingSafeEqual };