const Vault = require('../models/Vault');
const Couple = require('../models/Couple');
const Transaction = require('../models/Transaction');

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

const creditMonthlyInterest = async (vault) => {
  if (!vault || vault.status !== 'active' || vault.balance <= 0) return 0;

  const interest = round2((vault.interestRate / 100 / 12) * vault.balance);
  if (interest <= 0) return 0;

  vault.balance = round2(vault.balance + interest);
  vault.totalInterestEarned = round2((vault.totalInterestEarned || 0) + interest);
  await vault.save();

  const couple = await Couple.findById(vault.coupleId);
  if (couple && couple.partnerA) {
    await Transaction.create({
      vaultId: vault._id, userId: couple.partnerA, type: 'interest_credit',
      amount: interest, status: 'success', note: `Monthly interest @ ${vault.interestRate}% p.a.`,
    });
  }
  return interest;
};

const creditInterestToAllActiveVaults = async () => {
  const vaults = await Vault.find({ status: 'active', balance: { $gt: 0 } });
  let vaultsCredited = 0, totalCredited = 0;
  for (const vault of vaults) {
    const credited = await creditMonthlyInterest(vault);
    if (credited > 0) { vaultsCredited += 1; totalCredited = round2(totalCredited + credited); }
  }
  return { vaultsCredited, totalCredited };
};

module.exports = { creditMonthlyInterest, creditInterestToAllActiveVaults };