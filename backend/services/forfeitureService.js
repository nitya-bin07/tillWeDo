// services/forfeitureService.js
const Vault = require('../models/Vault');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const notificationService = require('./notificationService');

const FORFEITURE_MODE = (process.env.FORFEITURE_MODE || 'platform').toLowerCase();

const forfeitVault = async (couple) => {
  const vault = couple.vaultId ? await Vault.findById(couple.vaultId) : await Vault.findOne({ coupleId: couple._id });
  let amount = 0;
  if (vault && ['active', 'paused', 'setup'].includes(vault.status)) {
    amount = vault.balance;
    vault.status = 'forfeited';
    vault.balance = 0;
    await vault.save();
    if (amount > 0) {
      await Transaction.create({ vaultId: vault._id, userId: couple.breakupInitiatedBy || couple.partnerA, type: 'forfeiture', amount, status: 'success', note: `Forfeited on breakup -> ${FORFEITURE_MODE}` });
    }
  }
  couple.status = 'broken_up';
  couple.breakupConfirmedAt = new Date();
  await couple.save();
  const ids = [couple.partnerA, couple.partnerB].filter(Boolean);
  await User.updateMany({ _id: { $in: ids } }, { $set: { coupleId: null } });
  await notificationService.notifyBreakupFinalized(couple);
  return { vault, amount };
};

module.exports = { forfeitVault, FORFEITURE_MODE };