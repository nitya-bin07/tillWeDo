// controllers/marriageController.js
const MarriageProof = require('../models/MarriageProof');
const Couple = require('../models/Couple');
const Vault = require('../models/Vault');
const AdminLog = require('../models/AdminLog');
const User = require('../models/User');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const { uploadBuffer } = require('../config/cloudinary');
const { payoutVault } = require('../services/payoutService');
const emailService = require('../services/emailService');

const paginate = (req, def = 20) => ({ page: Number(req.query.page) || 1, limit: Number(req.query.limit) || def });

const submitProof = async (req, res, next) => {
  try {
    if (!req.user.coupleId) throw new ApiError(422, 'You must be in a couple to submit marriage proof', 'NO_COUPLE');
    const couple = await Couple.findById(req.user.coupleId);
    if (!couple) throw new ApiError(422, 'You must be in a couple to submit marriage proof', 'NO_COUPLE');
    if (couple.status === 'married') throw new ApiError(409, 'This couple is already verified as married', 'ALREADY_MARRIED');
    if (couple.status === 'broken_up') throw new ApiError(422, 'This relationship has ended', 'COUPLE_RESOLVED');

    const vault = await Vault.findOne({ coupleId: couple._id });
    if (!vault || !['active', 'paused'].includes(vault.status)) throw new ApiError(422, 'Your vault must be active before submitting marriage proof', 'VAULT_NOT_ACTIVE');

    const existing = await MarriageProof.findOne({ coupleId: couple._id, status: { $in: ['pending', 'under_review', 'approved'] } });
    if (existing) throw new ApiError(409, 'A marriage proof is already submitted or approved', 'PROOF_EXISTS');

    const certFile = req.files && req.files.certificate && req.files.certificate[0];
    if (!certFile) throw new ApiError(400, 'Marriage certificate file is required (field "certificate")', 'NO_CERTIFICATE');
    const certUpload = await uploadBuffer(certFile.buffer, { folder: 'tillwedo/marriage-proofs', resourceType: 'auto' });

    const photoFiles = (req.files && req.files.photos) || [];
    const weddingPhotoUrls = [];
    for (const photo of photoFiles) {
      // eslint-disable-next-line no-await-in-loop
      const up = await uploadBuffer(photo.buffer, { folder: 'tillwedo/wedding-photos', resourceType: 'image' });
      weddingPhotoUrls.push(up.secure_url);
    }

    const proof = await MarriageProof.create({
      coupleId: couple._id, submittedBy: req.user._id,
      marriageCertificateUrl: certUpload.secure_url, weddingPhotoUrls,
      marriageDate: req.body.marriageDate, registrationNumber: req.body.registrationNumber, status: 'pending',
    });
    return sendSuccess(res, { statusCode: 201, message: 'Marriage proof submitted for review', data: { proof } });
  } catch (err) { next(err); }
};

const getStatus = async (req, res, next) => {
  try {
    if (!req.user.coupleId) return sendSuccess(res, { message: 'No proof submitted', data: { proof: null } });
    const proof = await MarriageProof.findOne({ coupleId: req.user.coupleId }).sort({ submittedAt: -1 });
    return sendSuccess(res, { data: { proof: proof || null } });
  } catch (err) { next(err); }
};

const getAll = async (req, res, next) => {
  try {
    const { page, limit } = paginate(req);
    const filter = { status: req.query.status || { $in: ['pending', 'under_review'] } };
    const [proofs, total] = await Promise.all([
      MarriageProof.find(filter).sort({ submittedAt: -1 }).skip((page - 1) * limit).limit(limit).populate('coupleId').populate('submittedBy', 'name email'),
      MarriageProof.countDocuments(filter),
    ]);
    return sendSuccess(res, { data: { proofs, pagination: { page, limit, total, pages: Math.ceil(total / limit) } } });
  } catch (err) { next(err); }
};

const approve = async (req, res, next) => {
  try {
    const proof = await MarriageProof.findById(req.params.id);
    if (!proof) throw new ApiError(404, 'Proof not found', 'PROOF_NOT_FOUND');
    if (proof.status === 'approved') throw new ApiError(409, 'Already approved', 'ALREADY_APPROVED');
    const couple = await Couple.findById(proof.coupleId);
    if (!couple) throw new ApiError(404, 'Couple not found', 'COUPLE_NOT_FOUND');

    proof.status = 'approved'; proof.reviewedBy = req.user._id; proof.reviewedAt = new Date();
    await proof.save();
    const result = await payoutVault(couple);
    await AdminLog.create({ adminId: req.user._id, action: 'approve_marriage_proof', targetType: 'marriageproof', targetId: proof._id, details: { coupleId: couple._id, payoutA: result.payoutA, payoutB: result.payoutB } });
    return sendSuccess(res, { message: 'Proof approved and payout initiated', data: { proof, payout: { payoutA: result.payoutA, payoutB: result.payoutB } } });
  } catch (err) { next(err); }
};

const reject = async (req, res, next) => {
  try {
    const proof = await MarriageProof.findById(req.params.id);
    if (!proof) throw new ApiError(404, 'Proof not found', 'PROOF_NOT_FOUND');
    if (proof.status === 'approved') throw new ApiError(409, 'Cannot reject an approved proof', 'ALREADY_APPROVED');
    proof.status = 'rejected'; proof.reviewedBy = req.user._id; proof.reviewedAt = new Date(); proof.rejectionReason = req.body.rejectionReason;
    await proof.save();
    await AdminLog.create({ adminId: req.user._id, action: 'reject_marriage_proof', targetType: 'marriageproof', targetId: proof._id, details: { reason: req.body.rejectionReason } });
    const submitter = await User.findById(proof.submittedBy);
    if (submitter) await emailService.send({ to: submitter.email, subject: 'TillWeDo marriage proof update', text: `Your marriage proof was not approved. Reason: ${req.body.rejectionReason}. You may correct and resubmit.` });
    return sendSuccess(res, { message: 'Proof rejected', data: { proof } });
  } catch (err) { next(err); }
};

module.exports = { submitProof, getStatus, getAll, approve, reject };