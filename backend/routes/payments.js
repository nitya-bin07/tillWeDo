const express = require('express');
const Joi = require('joi');

const c = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const validateRequest = require('../middleware/validateRequest');

const router = express.Router();

// Every payment route requires a logged-in user.
// (The webhook is NOT here — it's mounted in app.js with a raw body parser.)
router.use(auth);

const objectId = Joi.string()
  .pattern(/^[0-9a-fA-F]{24}$/)
  .messages({ 'string.pattern.base': 'Invalid id format' });

const createOrderSchema = Joi.object({
  contributionId: objectId.optional(),
});

const verifySchema = Joi.object({
  razorpay_order_id: Joi.string().required(),
  razorpay_payment_id: Joi.string().required(),
  razorpay_signature: Joi.string().required(),
  contributionId: objectId.optional(),
});

const payoutBankSchema = Joi.object({
  accountNumber: Joi.string()
    .trim()
    .pattern(/^[0-9]{6,20}$/)
    .required()
    .messages({ 'string.pattern.base': 'Account number must be 6–20 digits' }),
  ifsc: Joi.string()
    .trim()
    .uppercase()
    .pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/)
    .required()
    .messages({ 'string.pattern.base': 'Invalid IFSC code' }),
  holderName: Joi.string().trim().min(2).max(100).required(),
});

router.post('/create-mandate', c.createMandate);
router.post('/create-order', validateRequest(createOrderSchema), c.createOrder);
router.post('/verify', validateRequest(verifySchema), c.verifyPayment);
router.post('/payout-bank', validateRequest(payoutBankSchema), c.payoutBank);

module.exports = router;