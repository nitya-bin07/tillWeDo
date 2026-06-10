const Vault = require('../models/Vault');
const Couple = require('../models/Couple');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');

const DEFAULT_INTEREST_RATE = Number(process.env.DEFAULT_INTEREST_RATE) || 5.0;

const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; };
const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

// Exported so contributionCron (Step 5) reuses the exact same rule.
const computeNextContributionDate = (startDate, interval, contributionDay, customIntervalDays) => {
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  if (interval === 'custom') return start;

  const day = contributionDay || Math.min(start.getDate(), 28);
  let next = new Date(start.getFullYear(), start.getMonth(), day);
  next.setHours(0, 0, 0, 0);
  if (next < start) {
    next = new Date(start.getFullYear(), start.getMonth() + 1, day);
    next.setHours(0, 0, 0, 0);
  }
  return next;
};

const getLinkedCouple = async (user) => {
  if (!user.coupleId) throw new ApiError(422, 'Link with a partner before setting up a vault', 'NOT_LINKED');
  const couple = await Couple.findById(user.coupleId);
  if (!couple) throw new ApiError(422, 'Link with a partner before setting up a vault', 'NOT_LINKED');
  if (!couple.partnerB || couple.inviteStatus !== 'accepted') {
    throw new ApiError(422, 'Your partner must accept the invite before vault setup', 'PARTNER_NOT_LINKED');
  }
  return couple;
};

// POST /vault/setup
const setupVault = async (req, res, next) => {
  try {
    const couple = await getLinkedCouple(req.user);
    if (['broken_up', 'married'].includes(couple.status)) {
      throw new ApiError(422, 'This relationship has already ended', 'COUPLE_RESOLVED');
    }

    const { vaultName, monthlyAmountA, monthlyAmountB, contributionInterval = 'monthly',
            contributionDay, customIntervalDays, startDate } = req.body;

    if (new Date(startDate) < startOfToday()) {
      throw new ApiError(400, 'Start date cannot be in the past', 'INVALID_START_DATE');
    }

    const nextContributionDate = computeNextContributionDate(startDate, contributionInterval, contributionDay, customIntervalDays);

    let vault = await Vault.findOne({ coupleId: couple._id });
    if (vault) {
      if (vault.status !== 'setup') throw new ApiError(409, 'Vault is already active and cannot be reconfigured', 'VAULT_ALREADY_ACTIVE');
      Object.assign(vault, {
        vaultName: vaultName || vault.vaultName,
        monthlyAmountA, monthlyAmountB, contributionInterval, contributionDay, customIntervalDays,
        startDate, nextContributionDate,
      });
      await vault.save();
    } else {
      vault = await Vault.create({
        coupleId: couple._id,
        vaultName: vaultName || 'Our Vault',
        status: 'setup',
        monthlyAmountA, monthlyAmountB, contributionInterval, contributionDay, customIntervalDays,
        interestRate: DEFAULT_INTEREST_RATE,
        startDate, nextContributionDate,
      });
      couple.vaultId = vault._id;
      await couple.save();
    }

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Vault configured. It activates on the start date once payment mandates are set.',
      data: { vault },
    });
  } catch (err) {
    next(err);
  }
};

// GET /vault/me
const getMyVault = async (req, res, next) => {
  try {
    if (!req.user.coupleId) return sendSuccess(res, { message: 'No vault yet', data: { vault: null } });
    const vault = await Vault.findOne({ coupleId: req.user.coupleId });
    return sendSuccess(res, { data: { vault: vault || null } });
  } catch (err) {
    next(err);
  }
};

// PUT /vault/settings — rename only, before active
const updateSettings = async (req, res, next) => {
  try {
    if (!req.user.coupleId) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
    const vault = await Vault.findOne({ coupleId: req.user.coupleId });
    if (!vault) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
    if (vault.status !== 'setup') throw new ApiError(422, 'The vault name can only be changed before the vault is active', 'VAULT_ALREADY_ACTIVE');

    vault.vaultName = req.body.vaultName;
    await vault.save();
    return sendSuccess(res, { message: 'Vault updated', data: { vault } });
  } catch (err) {
    next(err);
  }
};

// GET /vault/balance — balance + interest breakdown
const getBalance = async (req, res, next) => {
  try {
    if (!req.user.coupleId) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');
    const vault = await Vault.findOne({ coupleId: req.user.coupleId });
    if (!vault) throw new ApiError(404, 'No vault found', 'VAULT_NOT_FOUND');

    const projectedMonthlyInterest = round2((vault.interestRate / 100 / 12) * vault.balance);

    return sendSuccess(res, {
      data: {
        balance: vault.balance,
        totalContributed: vault.totalContributed,
        totalInterestEarned: vault.totalInterestEarned,
        interestRate: vault.interestRate,
        projectedMonthlyInterest,
        nextContributionDate: vault.nextContributionDate,
        status: vault.status,
        currency: 'INR',
      },
    });
  } catch (err) {
    next(err);
  }
};

// GET /vault/all — admin, paginated + status filter
const getAllVaults = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const filter = {};
    if (req.query.status) filter.status = req.query.status;

    const [vaults, total] = await Promise.all([
      Vault.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('coupleId'),
      Vault.countDocuments(filter),
    ]);

    return sendSuccess(res, {
      data: { vaults, pagination: { page, limit, total, pages: Math.ceil(total / limit) } },
    });
  } catch (err) {
    next(err);
  }
};

// GET /vault/:id — admin
const getVaultById = async (req, res, next) => {
  try {
    const vault = await Vault.findById(req.params.id).populate('coupleId');
    if (!vault) throw new ApiError(404, 'Vault not found', 'VAULT_NOT_FOUND');
    return sendSuccess(res, { data: { vault } });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  setupVault, getMyVault, updateSettings, getBalance, getAllVaults, getVaultById,
  computeNextContributionDate, // reused by contributionCron (Step 5)
};