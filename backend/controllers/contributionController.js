const Contribution = require('../models/Contribution');
const Transaction = require('../models/Transaction');
const Vault = require('../models/Vault');
const Couple = require('../models/Couple');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');

const resolveContext = async (user) => {
  if (!user.coupleId) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
  const couple = await Couple.findById(user.coupleId);
  if (!couple) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
  const vault = await Vault.findOne({ coupleId: couple._id });
  if (!vault) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
  const role = couple.partnerA.equals(user._id) ? 'A' : 'B';
  return { couple, vault, role };
};

const paginate = (req, def = 20) => ({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || def });

const getHistory = async (req, res, next) => {
  try {
    const { vault } = await resolveContext(req.user);
    const { page, limit } = paginate(req);
    const [contributions, total] = await Promise.all([
      Contribution.find({ vaultId: vault._id }).sort({ cycleDate: -1 }).skip((page - 1) * limit).limit(limit),
      Contribution.countDocuments({ vaultId: vault._id }),
    ]);
    return sendSuccess(res, { data: { contributions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

const getUpcoming = async (req, res, next) => {
  try {
    const { vault } = await resolveContext(req.user);
    const currentCycle = await Contribution.findOne({ vaultId: vault._id }).sort({ cycleDate: -1 });
    return sendSuccess(res, { data: {
      nextContributionDate: vault.nextContributionDate, monthlyAmountA: vault.monthlyAmountA, monthlyAmountB: vault.monthlyAmountB,
      contributionInterval: vault.contributionInterval, contributionDay: vault.contributionDay, status: vault.status, currentCycle: currentCycle || null,
    } });
  } catch (err) { next(err); }
};

// POST /contributions/manual-pay — grace-period catch-up (Razorpay charge added in Step 6)
const manualPay = async (req, res, next) => {
  try {
    const { vault, role } = await resolveContext(req.user);
    if (!['active', 'paused'].includes(vault.status)) throw new ApiError(422, 'Vault is not active', 'VAULT_NOT_ACTIVE');

    const f = {
      status: role === 'A' ? 'statusA' : 'statusB', amount: role === 'A' ? 'amountA' : 'amountB',
      paidAt: role === 'A' ? 'paidAtA' : 'paidAtB', txn: role === 'A' ? 'transactionIdA' : 'transactionIdB',
      grace: role === 'A' ? 'graceDeadlineA' : 'graceDeadlineB',
    };

    let contribution;
    if (req.body.contributionId) {
      contribution = await Contribution.findOne({ _id: req.body.contributionId, vaultId: vault._id });
    } else {
      contribution = await Contribution.findOne({ vaultId: vault._id, [f.status]: { $in: ['pending', 'failed', 'grace'] } }).sort({ cycleDate: -1 });
    }
    if (!contribution) throw new ApiError(422, 'No pending contribution to pay', 'NO_PENDING_CONTRIBUTION');
    if (contribution[f.status] === 'paid') throw new ApiError(409, 'This contribution is already paid', 'ALREADY_PAID');

    const amount = contribution[f.amount] || (role === 'A' ? vault.monthlyAmountA : vault.monthlyAmountB);

    const txn = await Transaction.create({ vaultId: vault._id, userId: req.user._id, type: 'contribution', amount, status: 'success', note: 'Manual catch-up payment (grace period)' });

    contribution[f.status] = 'paid';
    contribution[f.paidAt] = new Date();
    contribution[f.txn] = txn._id;
    contribution[f.grace] = undefined;
    await contribution.save();

    vault.balance += amount; vault.totalContributed += amount; vault.lastContributionDate = new Date();
    await vault.save();

    return sendSuccess(res, { message: 'Contribution paid', data: { contribution, transaction: txn, balance: vault.balance } });
  } catch (err) { next(err); }
};

const getByVaultId = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req);
    const [contributions, total] = await Promise.all([
      Contribution.find({ vaultId: req.params.vaultId }).sort({ cycleDate: -1 }).skip((page - 1) * limit).limit(limit),
      Contribution.countDocuments({ vaultId: req.params.vaultId }),
    ]);
    return sendSuccess(res, { data: { contributions, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

module.exports = { getHistory, getUpcoming, manualPay, getByVaultId };