const User = require('../models/User');
const Couple = require('../models/Couple');
const Vault = require('../models/Vault');
const { ApiError } = require('../middleware/errorHandler');
const { sendSuccess } = require('../utils/responseFormatter');
const { uploadBuffer } = require('../config/cloudinary');

/**
 * GET /users/profile — own profile.
 * (req.user is already the full document, attached by the auth middleware.)
 */
const getProfile = async (req, res, next) => {
  try {
    return sendSuccess(res, { data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /users/profile — update name, photo, DOB, location (§8.2).
 * Only these four fields are writable here; everything else (email, phone,
 * role, coupleId, isVerified, passwordHash) is intentionally NOT updatable
 * through this endpoint to prevent mass-assignment.
 */
const updateProfile = async (req, res, next) => {
  try {
    const ALLOWED = ['name', 'profilePhoto', 'dob', 'location'];
    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) req.user[field] = req.body[field];
    });

    await req.user.save();
    return sendSuccess(res, { message: 'Profile updated', data: { user: req.user } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /users/upload-photo — multipart upload, field name "photo".
 * Multer (memory storage) puts the file on req.file; we stream the buffer to
 * Cloudinary and store the returned secure URL on the user.
 */
const uploadPhoto = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded (the form field must be named "photo")', 'NO_FILE');
    }

    const result = await uploadBuffer(req.file.buffer, {
      folder: 'tillwedo/profile-photos',
      resourceType: 'image',
    });

    req.user.profilePhoto = result.secure_url;
    await req.user.save();

    return sendSuccess(res, {
      message: 'Profile photo uploaded',
      data: { profilePhoto: result.secure_url, user: req.user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /users/account — only if no active vault (§8.2).
 *
 * Rules:
 *   - Blocked (422) if the couple's vault is 'active' or 'paused' (locked funds).
 *   - Blocked (422) if still linked to a partner — they must unlink first via
 *     /couples/unlink (or resolve via breakup/marriage), which keeps partner
 *     dissolution in one place rather than duplicating it here.
 *   - Otherwise (solo, or a pending couple with no partner yet) the user is
 *     deleted and any leftover pending couple/vault is cleaned up so nothing
 *     is orphaned.
 */
const deleteAccount = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.coupleId) {
      const couple = await Couple.findById(user.coupleId);
      if (couple) {
        if (couple.vaultId) {
          const vault = await Vault.findById(couple.vaultId);
          if (vault && ['active', 'paused'].includes(vault.status)) {
            throw new ApiError(
              422,
              'You cannot delete your account while your vault is active. Resolve it via marriage payout or breakup first.',
              'ACTIVE_VAULT_EXISTS'
            );
          }
        }

        if (couple.partnerB) {
          throw new ApiError(
            422,
            'Unlink from your partner before deleting your account.',
            'LINKED_TO_PARTNER'
          );
        }

        // Solo / pending couple — remove its (setup-stage) vault and itself.
        if (couple.vaultId) await Vault.deleteOne({ _id: couple.vaultId });
        await Couple.deleteOne({ _id: couple._id });
      }
    }

    await User.deleteOne({ _id: user._id });
    return sendSuccess(res, { message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile, updateProfile, uploadPhoto, deleteAccount };