const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema(
  {
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    action: { type: String, required: true }, // e.g. 'approve_marriage_proof'
    targetType: { type: String }, // 'couple' | 'vault' | 'user' | 'marriageproof'
    targetId: { type: mongoose.Schema.Types.ObjectId },
    details: { type: Object }, // flexible metadata (Mixed)
  },
  { collection: 'adminlogs', timestamps: { createdAt: true, updatedAt: false } }
);

adminLogSchema.index({ createdAt: -1 });
adminLogSchema.index({ adminId: 1, createdAt: -1 });

module.exports = mongoose.model('AdminLog', adminLogSchema);