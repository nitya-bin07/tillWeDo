const Couple = require('../models/Couple');
const Vault = require('../models/Vault');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const generateCode = require('../utils/generateCode');

const PARTNER_FIELDS = 'name email profilePhoto location dob isVerified';

const generateUniqueInviteCode = async () => {
  for (let i = 0; i < 6; i += 1) {
    const code = generateCode(6);
    // eslint-disable-next-line no-await-in-loop
    const exists = await Couple.exists({ inviteCode: code });
    if (!exists) return code;
  }
  throw new ApiError(500, 'Could not generate a unique invite code, please retry', 'CODE_GENERATION_FAILED');
};

// POST /couples/create-invite — Partner A
const createInvite = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.coupleId) {
      const existing = await Couple.findById(user.coupleId);
      if (existing && existing.inviteStatus === 'pending' && !existing.partnerB && existing.partnerA.equals(user._id)) {
        return sendSuccess(res, { message: 'You already have a pending invite', data: { couple: existing } });
      }
      throw new ApiError(409, 'You are already linked to a partner', 'ALREADY_IN_COUPLE');
    }

    const inviteCode = await generateUniqueInviteCode();

    const couple = await Couple.create({
      partnerA: user._id,
      inviteCode,
      inviteStatus: 'pending',
      status: 'pending',
      relationshipStartDate: req.body.relationshipStartDate,
    });

    user.coupleId = couple._id;
    await user.save();

    return sendSuccess(res, {
      statusCode: 201,
      message: 'Invite created. Share your code with your partner.',
      data: { couple },
    });
  } catch (err) {
    next(err);
  }
};

// POST /couples/accept-invite — Partner B
const acceptInvite = async (req, res, next) => {
  try {
    const user = req.user;
    if (user.coupleId) throw new ApiError(409, 'You are already linked to a partner', 'ALREADY_IN_COUPLE');

    const inviteCode = String(req.body.inviteCode).trim().toUpperCase();
    const couple = await Couple.findOne({ inviteCode });

    if (!couple) throw new ApiError(404, 'Invalid invite code', 'INVALID_INVITE_CODE');
    if (couple.partnerA.equals(user._id)) throw new ApiError(422, 'You cannot accept your own invite', 'CANNOT_INVITE_SELF');
    if (couple.inviteStatus === 'accepted' || couple.partnerB) throw new ApiError(409, 'This invite has already been used', 'INVITE_ALREADY_USED');

    couple.partnerB = user._id;
    couple.inviteStatus = 'accepted';
    couple.status = 'active';
    await couple.save();

    user.coupleId = couple._id;
    await user.save();

    const populated = await Couple.findById(couple._id)
      .populate('partnerA', PARTNER_FIELDS)
      .populate('partnerB', PARTNER_FIELDS);

    return sendSuccess(res, { message: 'Linked! You and your partner are now connected.', data: { couple: populated } });
  } catch (err) {
    next(err);
  }
};

// GET /couples/me — returns couple:null (not 404) when unlinked
const getMyCouple = async (req, res, next) => {
  try {
    if (!req.user.coupleId) return sendSuccess(res, { message: 'No couple linked yet', data: { couple: null } });

    const couple = await Couple.findById(req.user.coupleId)
      .populate('partnerA', PARTNER_FIELDS)
      .populate('partnerB', PARTNER_FIELDS)
      .populate('vaultId');

    if (!couple) {
      req.user.coupleId = null;
      await req.user.save();
      return sendSuccess(res, { message: 'No couple linked yet', data: { couple: null } });
    }

    return sendSuccess(res, { data: { couple } });
  } catch (err) {
    next(err);
  }
};

// GET /couples/:id — admin
const getCoupleById = async (req, res, next) => {
  try {
    const couple = await Couple.findById(req.params.id)
      .populate('partnerA', PARTNER_FIELDS)
      .populate('partnerB', PARTNER_FIELDS)
      .populate('vaultId');
    if (!couple) throw new ApiError(404, 'Couple not found', 'COUPLE_NOT_FOUND');
    return sendSuccess(res, { data: { couple } });
  } catch (err) {
    next(err);
  }
};

// DELETE /couples/unlink — only before vault active
const unlink = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user.coupleId) throw new ApiError(404, 'You are not linked to anyone', 'NO_COUPLE');

    const couple = await Couple.findById(user.coupleId);
    if (!couple) {
      user.coupleId = null;
      await user.save();
      throw new ApiError(404, 'You are not linked to anyone', 'NO_COUPLE');
    }

    if (couple.vaultId) {
      const vault = await Vault.findById(couple.vaultId);
      if (vault && vault.status !== 'setup') {
        throw new ApiError(422, 'You can only unlink before the vault is active', 'VAULT_ALREADY_ACTIVE');
      }
      if (vault) await Vault.deleteOne({ _id: vault._id });
    }

    const partnerIds = [couple.partnerA, couple.partnerB].filter(Boolean);
    await User.updateMany({ _id: { $in: partnerIds } }, { $set: { coupleId: null } });
    await Couple.deleteOne({ _id: couple._id });

    return sendSuccess(res, { message: 'Unlinked successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { createInvite, acceptInvite, getMyCouple, getCoupleById, unlink };