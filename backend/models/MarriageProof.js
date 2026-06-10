const mongoose = require('mongoose');

const marriageProofSchema = new mongoose.Schema(
  {
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', required: true },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    marriageCertificateUrl: { type: String, required: true }, // Cloudinary URL
    weddingPhotoUrls: [{ type: String }],
    marriageDate: { type: Date, required: true },
    registrationNumber: { type: String },
    status: { type: String, enum: ['pending', 'under_review', 'approved', 'rejected'], default: 'pending' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
  },
  // §7.6 names the creation field `submittedAt` (no updatedAt)
  { collection: 'marriageproofs', timestamps: { createdAt: 'submittedAt', updatedAt: false } }
);

marriageProofSchema.index({ status: 1, submittedAt: -1 }); // admin review queue
marriageProofSchema.index({ coupleId: 1 });

module.exports = mongoose.model('MarriageProof', marriageProofSchema);