const emailService = require('./emailService');
const User = require('../models/User');

/**
 * Notification layer (blueprint §10.1 — services/notificationService.js).
 * For now this delegates to the email seam (which logs to console in dev).
 * In-app / push notifications can be layered in later behind these same calls.
 */

const notifyBreakupInitiated = async (couple, initiatorId) => {
  const otherId = couple.partnerA.equals(initiatorId) ? couple.partnerB : couple.partnerA;
  if (!otherId) return;
  const other = await User.findById(otherId);
  if (other) {
    await emailService.send({
      to: other.email,
      subject: 'A breakup has been initiated on TillWeDo',
      text: `Hi ${other.name}, your partner has initiated a breakup. There is a cooling-off period during which it can be cancelled before the vault is forfeited.`,
    });
  }
};

const notifyBreakupFinalized = async (couple) => {
  const ids = [couple.partnerA, couple.partnerB].filter(Boolean);
  const users = await User.find({ _id: { $in: ids } });
  await Promise.all(
    users.map((u) =>
      emailService.send({
        to: u.email,
        subject: 'Your TillWeDo vault has been closed',
        text: `Hi ${u.name}, following the breakup the cooling-off period has ended and your shared vault has been forfeited per the agreement.`,
      })
    )
  );
};

const notifyMarriagePayout = async (couple, vault, { payoutA, payoutB }) => {
  const ids = [couple.partnerA, couple.partnerB].filter(Boolean);
  const users = await User.find({ _id: { $in: ids } });
  await Promise.all(
    users.map((u) =>
      emailService.send({
        to: u.email,
        subject: 'Congratulations — your TillWeDo payout is on its way 🎉',
        text: `Hi ${u.name}, your marriage has been verified and your vault is being paid out. Congratulations from all of us at TillWeDo!`,
      })
    )
  );
};

const notifyContributionReminder = async (user, vault, dueDate) => {
  await emailService.send({
    to: user.email,
    subject: 'Upcoming TillWeDo contribution',
    text: `Hi ${user.name}, your next contribution to "${vault.vaultName}" is due on ${new Date(dueDate).toDateString()}.`,
  });
};

module.exports = {
  notifyBreakupInitiated,
  notifyBreakupFinalized,
  notifyMarriagePayout,
  notifyContributionReminder,
};