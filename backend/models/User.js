const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    profilePhoto: { type: String }, // Cloudinary URL
    dob: { type: Date, required: true },
    location: { type: String, trim: true },
    coupleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Couple', default: null },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    resetPasswordToken: { type: String },
    resetPasswordExpiry: { type: Date },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { collection: 'users', timestamps: true }
);

userSchema.index({ coupleId: 1 });

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.passwordHash;
    delete ret.verificationToken;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpiry;
    delete ret.__v;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);