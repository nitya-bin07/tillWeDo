const { razorpay } = require('../config/razorpay');
const { verifyPaymentSignature, verifyWebhookSignature } = require('../utils/razorpayHelpers');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');

const Couple = require('../models/Couple');
const Vault = require('../models/Vault');
const Contribution = require('../models/Contribution');
const Transaction = require('../models/Transaction');

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

/* ------------------------------------------------------------------ *
 * Shared helpers
 * ------------------------------------------------------------------ */

/** Resolve the caller's couple + vault + which partner (A/B) they are. */
const resolveContext = async (user, allowedStatuses = null) => {
  if (!user.coupleId) throw new ApiError(404, 'No vault found for your account', 'VAULT_NOT_FOUND');

  const couple = await Couple.findById(user.coupleId);
  if (!couple) throw new ApiError(404, 'No vault found for your account', 'VAULT_NOT_FOUND');

  const vault = await Vault.findOne({ coupleId: couple._id });
  if (!vault) throw new ApiError(404, 'No vault found for your account', 'VAULT_NOT_FOUND');

  if (allowedStatuses && !allowedStatuses.includes(vault.status)) {
    throw new ApiError(422, `Vault is '${vault.status}' — this action isn't allowed right now`, 'VAULT_STATE_INVALID');
  }

  const role = couple.partnerA.equals(user._id) ? 'A' : 'B';
  return { couple, vault, role };
};

const fieldsFor = (role) => ({
  status: role === 'A' ? 'statusA' : 'statusB',
  amount: role === 'A' ? 'amountA' : 'amountB',
  paidAt: role === 'A' ? 'paidAtA' : 'paidAtB',
  txn: role === 'A' ? 'transactionIdA' : 'transactionIdB',
  grace: role === 'A' ? 'graceDeadlineA' : 'graceDeadlineB',
});

/**
 * Record a verified payment: write a Transaction, settle the matching
 * Contribution cycle, and credit the vault. Idempotent on razorpayPaymentId so
 * the verify route and the webhook can both call it without double-crediting.
 */
const settleContributionPayment = async ({ vault, role, userId, amount, paymentId, orderId, contributionId }) => {
  if (paymentId) {
    const dup = await Transaction.findOne({ razorpayPaymentId: paymentId });
    if (dup) return { alreadyProcessed: true, transaction: dup };
  }

  const txn = await Transaction.create({
    vaultId: vault._id,
    userId,
    type: 'contribution',
    amount,
    currency: 'INR',
    razorpayPaymentId: paymentId,
    razorpayOrderId: orderId,
    status: 'success',
    note: 'Razorpay contribution',
  });

  const f = fieldsFor(role);
  let contribution;
  if (contributionId) {
    contribution = await Contribution.findOne({ _id: contributionId, vaultId: vault._id });
  } else {
    contribution = await Contribution.findOne({
      vaultId: vault._id,
      [f.status]: { $in: ['pending', 'failed', 'grace'] },
    }).sort({ cycleDate: -1 });
  }
  if (contribution) {
    contribution[f.status] = 'paid';
    contribution[f.paidAt] = new Date();
    contribution[f.txn] = txn._id;
    contribution[f.grace] = undefined;
    await contribution.save();
  }

  vault.balance = round2(vault.balance + amount);
  vault.totalContributed = round2(vault.totalContributed + amount);
  vault.lastContributionDate = new Date();
  if (vault.status === 'setup') vault.status = 'active';
  await vault.save();

  return { alreadyProcessed: false, transaction: txn, contribution };
};

/* ------------------------------------------------------------------ *
 * POST /payments/create-mandate
 * ------------------------------------------------------------------ */
const createMandate = async (req, res, next) => {
  try {
    if (!razorpay) throw new ApiError(503, 'Payments are not configured (missing Razorpay keys)', 'PAYMENTS_NOT_CONFIGURED');

    const { vault, role } = await resolveContext(req.user, ['setup', 'active']);
    const amount = role === 'A' ? vault.monthlyAmountA : vault.monthlyAmountB;

    // A Razorpay customer is required to register a recurring mandate/token.
    let customer;
    try {
      customer = await razorpay.customers.create({
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone,
        fail_existing: 0, // return the existing customer instead of erroring
      });
    } catch (e) {
      throw new ApiError(502, `Razorpay error: ${(e.error && e.error.description) || e.message}`, 'RAZORPAY_ERROR');
    }

    return sendSuccess(res, {
      message: 'Mandate setup initiated. Complete the eMandate via Razorpay Checkout (recurring).',
      data: {
        customerId: customer.id,
        keyId: process.env.RAZORPAY_KEY_ID,
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        role,
        // The mandate/token id is saved to the vault on the 'token.confirmed' webhook.
        note: 'Live recurring charges require the Recurring Payments feature enabled on your Razorpay account.',
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ *
 * POST /payments/create-order
 * ------------------------------------------------------------------ */
const createOrder = async (req, res, next) => {
  try {
    if (!razorpay) throw new ApiError(503, 'Payments are not configured (missing Razorpay keys)', 'PAYMENTS_NOT_CONFIGURED');

    const { vault, role } = await resolveContext(req.user, ['setup', 'active', 'paused']);

    // Amount is decided server-side (the partner's monthly share); never trust
    // a client-supplied figure for how much to credit.
    const amount = role === 'A' ? vault.monthlyAmountA : vault.monthlyAmountB;
    if (!amount || amount <= 0) throw new ApiError(400, 'No contribution amount configured', 'INVALID_AMOUNT');

    let order;
    try {
      order = await razorpay.orders.create({
        amount: Math.round(amount * 100), // paise
        currency: 'INR',
        receipt: `vault_${vault._id}_${Date.now()}`,
        notes: {
          vaultId: String(vault._id),
          userId: String(req.user._id),
          role,
          contributionId: req.body.contributionId ? String(req.body.contributionId) : '',
          purpose: 'contribution',
        },
      });
    } catch (e) {
      throw new ApiError(502, `Razorpay error: ${(e.error && e.error.description) || e.message}`, 'RAZORPAY_ERROR');
    }

    return sendSuccess(res, {
      message: 'Order created',
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ *
 * POST /payments/verify
 * ------------------------------------------------------------------ */
const verifyPayment = async (req, res, next) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, contributionId } = req.body;

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!valid) throw new ApiError(400, 'Payment signature verification failed', 'INVALID_SIGNATURE');

    const { vault, role } = await resolveContext(req.user);
    const amount = role === 'A' ? vault.monthlyAmountA : vault.monthlyAmountB;

    const result = await settleContributionPayment({
      vault,
      role,
      userId: req.user._id,
      amount,
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      contributionId,
    });

    return sendSuccess(res, {
      message: result.alreadyProcessed ? 'Payment already recorded' : 'Payment verified and recorded',
      data: { balance: vault.balance, transactionId: result.transaction._id },
    });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ *
 * POST /payments/payout-bank
 * ------------------------------------------------------------------ */
const payoutBank = async (req, res, next) => {
  try {
    const { vault, role } = await resolveContext(req.user, ['setup', 'active', 'paused']);

    const details = {
      accountNo: req.body.accountNumber,
      ifsc: String(req.body.ifsc).toUpperCase(),
      holderName: req.body.holderName,
    };

    if (role === 'A') {
      vault.payoutBankDetailsA = details;
      vault.markModified('payoutBankDetailsA');
    } else {
      vault.payoutBankDetailsB = details;
      vault.markModified('payoutBankDetailsB');
    }
    await vault.save();

    return sendSuccess(res, { message: 'Bank details saved for payout', data: { role } });
  } catch (err) {
    next(err);
  }
};

/* ------------------------------------------------------------------ *
 * POST /webhooks/razorpay   (no auth — verified by HMAC, raw body)
 * ------------------------------------------------------------------ */
const webhook = async (req, res) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const valid = verifyWebhookSignature(req.body, signature); // req.body is a Buffer (express.raw)
    if (!valid) return res.status(400).json({ success: false, message: 'Invalid webhook signature' });

    const raw = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : String(req.body);
    const event = JSON.parse(raw);

    if (event.event === 'payment.captured') {
      const payment = (event.payload && event.payload.payment && event.payload.payment.entity) || {};
      const notes = payment.notes || {};
      if (notes.vaultId && notes.role && notes.userId) {
        const vault = await Vault.findById(notes.vaultId);
        if (vault) {
          await settleContributionPayment({
            vault,
            role: notes.role,
            userId: notes.userId,
            amount: round2((payment.amount || 0) / 100),
            paymentId: payment.id,
            orderId: payment.order_id,
            contributionId: notes.contributionId || undefined,
          });
        }
      }
    } else if (event.event === 'token.confirmed' || event.event === 'subscription.authenticated') {
      const entity =
        (event.payload && event.payload.token && event.payload.token.entity) ||
        (event.payload && event.payload.subscription && event.payload.subscription.entity) ||
        {};
      const notes = entity.notes || {};
      if (notes.vaultId && notes.role) {
        const vault = await Vault.findById(notes.vaultId);
        if (vault) {
          if (notes.role === 'A') vault.razorpayMandateIdA = entity.id;
          else vault.razorpayMandateIdB = entity.id;
          await vault.save();
        }
      }
    }

    // Always ack 2xx quickly so Razorpay doesn't retry a handled event.
    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('[webhook] error:', err.message);
    // Ack anyway — we've logged it; a 5xx would trigger Razorpay retries.
    return res.status(200).json({ received: true, note: 'processed with errors' });
  }
};

module.exports = {
  createMandate,
  createOrder,
  verifyPayment,
  payoutBank,
  webhook,
  // exported for tests
  settleContributionPayment,
  resolveContext,
};