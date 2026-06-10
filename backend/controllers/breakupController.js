// controllers/breakupController.js
const Couple = require('../models/Couple');
const AdminLog = require('../models/AdminLog');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const { forfeitVault } = require('../services/forfeitureService');
const notificationService = require('../services/notificationService');

const COOLING_HOURS = Number(process.env.BREAKUP_COOLING_HOURS) || 48;
const coolingEnd = (initiatedAt) => new Date(new Date(initiatedAt).getTime() + COOLING_HOURS * 60 * 60 * 1000);

const getMyCouple = async (user) => {
  if (!user.coupleId) throw new ApiError(404, 'You are not in a relationship', 'NO_COUPLE');
  const couple = await Couple.findById(user.coupleId);
  if (!couple) throw new ApiError(404, 'You are not in a relationship', 'NO_COUPLE');
  return couple;
};

const initiate = async (req, res, next) => {
  try {
    const couple = await getMyCouple(req.user);
    if (couple.status !== 'active') throw new ApiError(422, 'Breakup can only be initiated for an active relationship', 'NOT_ACTIVE');
    if (couple.breakupInitiatedAt) throw new ApiError(409, 'A breakup is already in progress', 'BREAKUP_IN_PROGRESS');
    couple.breakupInitiatedBy = req.user._id;
    couple.breakupInitiatedAt = new Date();
    await couple.save();
    await notificationService.notifyBreakupInitiated(couple, req.user._id);
    return sendSuccess(res, { message: 'Breakup initiated. A cooling-off period has started — it can still be cancelled.', data: { coolingOffEndsAt: coolingEnd(couple.breakupInitiatedAt), coolingHours: COOLING_HOURS } });
  } catch (err) { next(err); }
};

const cancel = async (req, res, next) => {
  try {
    const couple = await getMyCouple(req.user);
    if (!couple.breakupInitiatedAt) throw new ApiError(422, 'There is no breakup to cancel', 'NO_BREAKUP');
    if (couple.status === 'broken_up') throw new ApiError(422, 'Breakup already finalized', 'ALREADY_FINALIZED');
    couple.breakupInitiatedBy = undefined;
    couple.breakupInitiatedAt = undefined;
    await couple.save();
    return sendSuccess(res, { message: 'Breakup cancelled. Your vault continues as normal.' });
  } catch (err) { next(err); }
};

// ADMIN force-confirm / after-timeout
const confirm = async (req, res, next) => {
  try {
    const couple = await Couple.findById(req.body.coupleId);
    if (!couple) throw new ApiError(404, 'Couple not found', 'COUPLE_NOT_FOUND');
    if (couple.status === 'broken_up') throw new ApiError(409, 'Already broken up', 'ALREADY_FINALIZED');
    if (!couple.breakupInitiatedAt) throw new ApiError(422, 'No breakup has been initiated for this couple', 'NO_BREAKUP');
    const result = await forfeitVault(couple);
    await AdminLog.create({ adminId: req.user._id, action: 'force_confirm_breakup', targetType: 'couple', targetId: couple._id, details: { forfeitedAmount: result.amount } });
    return sendSuccess(res, { message: 'Breakup confirmed and vault forfeited', data: { forfeitedAmount: result.amount } });
  } catch (err) { next(err); }
};

const status = async (req, res, next) => {
  try {
    const couple = await getMyCouple(req.user);
    const initiated = Boolean(couple.breakupInitiatedAt);
    const endsAt = initiated ? coolingEnd(couple.breakupInitiatedAt) : null;
    return sendSuccess(res, { data: { status: couple.status, initiated, initiatedBy: couple.breakupInitiatedBy, initiatedAt: couple.breakupInitiatedAt, coolingOffEndsAt: endsAt, isCoolingOff: initiated && endsAt > new Date(), canCancel: initiated && couple.status === 'active' } });
  } catch (err) { next(err); }
};

module.exports = { initiate, cancel, confirm, status };