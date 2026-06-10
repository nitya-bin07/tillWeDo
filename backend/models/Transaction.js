const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['contribution', 'interest_credit', 'payout', 'forfeiture', 'refund', 'fee'] },
    amount: { type: Number, required: true }, // INR
    currency: { type: String, default: 'INR' },
    razorpayPaymentId: { type: String },
    razorpayOrderId: { type: String },
    status: { type: String, enum: ['pending', 'success', 'failed', 'refunded'] },
    note: { type: String },
  },
  { collection: 'transactions', timestamps: { createdAt: true, updatedAt: false } }
);

transactionSchema.index({ vaultId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);