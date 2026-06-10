const mongoose = require('mongoose');

const vaultSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true, unique: true },
    vaultName: { type: String, default: 'Our Vault', trim: true },
    status: { type: String, enum: ['setup', 'active', 'paused', 'forfeited', 'paid_out'], default: 'setup' },
    monthlyAmountA: { type: Number, required: true }, // INR
    monthlyAmountB: { type: Number, required: true }, // INR
    contributionDay: { type: Number, min: 1, max: 28 }, // 28 = exists in every month
    contributionInterval: { type: String, enum: ['monthly', 'custom'], default: 'monthly' },
    customIntervalDays: { type: Number },
    balance: { type: Number, default: 0 },
    totalContributed: { type: Number, default: 0 },
    totalInterestEarned: { type: Number, default: 0 },
    interestRate: { type: Number, default: 5.0 }, // % per annum
    startDate: { type: Date },
    lastContributionDate: { type: Date },
    nextContributionDate: { type: Date },
    razorpayMandateIdA: { type: String },
    razorpayMandateIdB: { type: String },
    payoutBankDetailsA: { type: Object }, // { accountNo, ifsc, holderName } — Mixed
    payoutBankDetailsB: { type: Object },
  },
  { collection: 'vaults', timestamps: true }
);

vaultSchema.index({ status: 1 }); // interestCron
vaultSchema.index({ status: 1, nextContributionDate: 1 }); // contributionCron

module.exports = mongoose.model('Vault', vaultSchema);