const cron = require('node-cron');
const Vault = require('../models/Vault');
const Couple = require('../models/Couple');
const User = require('../models/User');
const notificationService = require('../services/notificationService');

const TZ = process.env.CRON_TIMEZONE || 'Asia/Kolkata';
const REMIND_DAYS_AHEAD = 3;

const startOfDay = (d) => { const x = new Date(d); x.setHours(0, 0, 0, 0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23, 59, 59, 999); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

const run = async () => {
  try {
    const target = addDays(new Date(), REMIND_DAYS_AHEAD);

    const vaults = await Vault.find({
      status: 'active',
      nextContributionDate: { $gte: startOfDay(target), $lte: endOfDay(target) },
    });

    let remindersSent = 0;
    for (const vault of vaults) {
      const couple = await Couple.findById(vault.coupleId);
      if (!couple) continue;

      const ids = [couple.partnerA, couple.partnerB].filter(Boolean);
      const users = await User.find({ _id: { $in: ids } });

      for (const u of users) {
        await notificationService.notifyContributionReminder(u, vault, vault.nextContributionDate);
        remindersSent += 1;
      }
    }

    if (remindersSent > 0) console.log(`🕒 [reminderCron] sent ${remindersSent} reminder(s)`);
    return { remindersSent };
  } catch (err) {
    console.error('[reminderCron] error:', err.message);
    return null;
  }
};

const schedule = () => cron.schedule('0 10 * * *', run, { timezone: TZ });

module.exports = { run, schedule };