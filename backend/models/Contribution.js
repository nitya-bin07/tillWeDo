const mongoose = require('mongoose');

const contributionSchema = new mongoose.Schema(
  {
    vaultId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vault', required: true },
    cycleDate: { type: Date, required: true },
    amountA: { type: Number },
    amountB: { type: Number },
    statusA: { type: String, enum: ['pending', 'paid', 'failed', 'grace'], default: 'pending' },
    statusB: { type: String, enum: ['pending', 'paid', 'failed', 'grace'], default: 'pending' },
    transactionIdA: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    transactionIdB: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    paidAtA: { type: Date },
    paidAtB: { type: Date },
    graceDeadlineA: { type: Date },
    graceDeadlineB: { type: Date },
  },
  { collection: 'contributions', timestamps: { createdAt: true, updatedAt: false } }
);

contributionSchema.index({ vaultId: 1, cycleDate: -1 });
contributionSchema.index({ cycleDate: 1 }); // reminderCron

module.exports = mongoose.model('Contribution', contributionSchema);