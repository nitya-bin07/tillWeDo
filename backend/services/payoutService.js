// services/payoutService.js
const Vault = require('../models/Vault');
const Transaction = require('../models/Transaction');
const { ApiError } = require('../middleware/errorHandler');
const notificationService = require('./notificationService');

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const payoutVault = async (couple) => {
  const vault = couple.vaultId ? await Vault.findById(couple.vaultId) : await Vault.findOne({ coupleId: couple._id });
  if (!vault) throw new ApiError(404, 'Vault not found for payout', 'VAULT_NOT_FOUND');
  if (vault.status === 'paid_out') return { vault, payoutA: 0, payoutB: 0 };

  const total = vault.balance;
  const mA = vault.monthlyAmountA || 1, mB = vault.monthlyAmountB || 1;
  const payoutA = round2((total * mA) / (mA + mB));
  const payoutB = round2(total - payoutA);

  vault.status = 'paid_out';
  vault.balance = 0;
  await vault.save();

  if (total > 0) {
    await Transaction.create([
      { vaultId: vault._id, userId: couple.partnerA, type: 'payout', amount: payoutA, status: 'success', note: 'Marriage payout (Partner A)' },
      { vaultId: vault._id, userId: couple.partnerB, type: 'payout', amount: payoutB, status: 'success', note: 'Marriage payout (Partner B)' },
    ]);
  }

  couple.status = 'married';
  couple.marriageVerifiedAt = new Date();
  await couple.save();
  await notificationService.notifyMarriagePayout(couple, vault, { payoutA, payoutB });
  return { vault, payoutA, payoutB };
};

module.exports = { payoutVault };