const User = require('../models/User');
const Couple = require('../models/Couple');
const Vault = require('../models/Vault');
const Transaction = require('../models/Transaction');
const MarriageProof = require('../models/MarriageProof');
const AdminLog = require('../models/AdminLog');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const { payoutVault } = require('../services/payoutService');

const paginate = (req, def = 20) => ({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || def });
const countsByStatus = (agg) => agg.reduce((acc, r) => ({ ...acc, [r._id]: r.count }), {});

const getDashboard = async (req, res, next) => {
  try {
    const [users, couplesAgg, vaultsAgg, forfeitAgg, payoutAgg, pendingProofs] = await Promise.all([
      User.countDocuments(),
      Couple.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Vault.aggregate([{ $group: { _id: '$status', count: { $sum: 1 }, balance: { $sum: '$balance' } } }]),
      Transaction.aggregate([{ $match: { type: 'forfeiture', status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Transaction.aggregate([{ $match: { type: 'payout', status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      MarriageProof.countDocuments({ status: { $in: ['pending', 'under_review'] } }),
    ]);
    const activeBalance = (vaultsAgg.find((v) => v._id === 'active') || {}).balance || 0;
    return sendSuccess(res, { data: {
      users, couples: countsByStatus(couplesAgg), vaults: countsByStatus(vaultsAgg), totalActiveBalance: activeBalance,
      forfeited: { total: forfeitAgg[0] ? forfeitAgg[0].total : 0, count: forfeitAgg[0] ? forfeitAgg[0].count : 0 },
      paidOut: { total: payoutAgg[0] ? payoutAgg[0].total : 0, count: payoutAgg[0] ? payoutAgg[0].count : 0 },
      pendingMarriageProofs: pendingProofs,
    } });
  } catch (err) { next(err); }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req);
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.isVerified !== undefined) filter.isVerified = req.query.isVerified === 'true';
    if (req.query.search) filter.$or = [{ name: new RegExp(req.query.search, 'i') }, { email: new RegExp(req.query.search, 'i') }];
    const [items, total] = await Promise.all([
      User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      User.countDocuments(filter),
    ]);
    return sendSuccess(res, { data: { users: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

const getVaults = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req);
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    const [items, total] = await Promise.all([
      Vault.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('coupleId'),
      Vault.countDocuments(filter),
    ]);
    return sendSuccess(res, { data: { vaults: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

const getForfeitureLog = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req);
    const filter = { type: 'forfeiture' };
    const [items, total, sumAgg] = await Promise.all([
      Transaction.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('vaultId').populate('userId', 'name email'),
      Transaction.countDocuments(filter),
      Transaction.aggregate([{ $match: { type: 'forfeiture', status: 'success' } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    ]);
    return sendSuccess(res, { data: { forfeitures: items, totalForfeited: sumAgg[0] ? sumAgg[0].total : 0, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

const triggerPayout = async (req, res, next) => {
  try {
    const vault = await Vault.findById(req.params.vaultId);
    if (!vault) throw new ApiError(404, 'Vault not found', 'VAULT_NOT_FOUND');
    const couple = await Couple.findById(vault.coupleId);
    if (!couple) throw new ApiError(404, 'Couple not found', 'COUPLE_NOT_FOUND');
    const result = await payoutVault(couple);
    await AdminLog.create({ adminId: req.user._id, action: 'manual_payout', targetType: 'vault', targetId: vault._id, details: { payoutA: result.payoutA, payoutB: result.payoutB } });
    return sendSuccess(res, { message: 'Payout triggered', data: { payout: { payoutA: result.payoutA, payoutB: result.payoutB } } });
  } catch (err) { next(err); }
};

const getLogs = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req, 50);
    const [logs, total] = await Promise.all([
      AdminLog.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('adminId', 'name email'),
      AdminLog.countDocuments(),
    ]);
    return sendSuccess(res, { data: { logs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

module.exports = { getDashboard, getUsers, getVaults, getForfeitureLog, triggerPayout, getLogs };