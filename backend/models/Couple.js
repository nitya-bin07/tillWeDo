const mongoose = require('mongoose');

const coupleSchema = new mongoose.Schema(
  {
    partnerA: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    partnerB: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    inviteCode: { type: String, required: true, unique: true, uppercase: true, trim: true },
    inviteStatus: { type: String, enum: ['pending', 'accepted'], default: 'pending' },
    relationshipStartDate: { type: Date },
    status: { type: String, enum: ['pending', 'active', 'broken_up', 'married'], default: 'pending' },
    breakupInitiatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    breakupInitiatedAt: { type: Date },
    breakupConfirmedAt: { type: Date },
    marriageVerifiedAt: { type: Date },
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', default: null },
  },
  { collection: 'couples', timestamps: true }
);

coupleSchema.index({ partnerA: 1 });
coupleSchema.index({ partnerB: 1 });
coupleSchema.index({ status: 1, breakupInitiatedAt: 1 }); // breakupCron

module.exports = mongoose.model('Couple', coupleSchema);