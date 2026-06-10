const cron = require('node-cron');
const Couple = require('../models/Couple');
const { forfeitVault } = require('../services/forfeitureService');

const TZ = process.env.CRON_TIMEZONE || 'Asia/Kolkata';
const COOLING_HOURS = Number(process.env.BREAKUP_COOLING_HOURS) || 48;

const run = async () => {
  try {
    const cutoff = new Date(Date.now() - COOLING_HOURS * 60 * 60 * 1000);
    const couples = await Couple.find({ status: 'active', breakupInitiatedAt: { $lte: cutoff } });

    let forfeited = 0;
    for (const couple of couples) { await forfeitVault(couple); forfeited += 1; }
    if (forfeited > 0) console.log(`🕒 [breakupCron] auto-forfeited ${forfeited} vault(s)`);
    return { couplesForfeited: forfeited };
  } catch (err) { console.error('[breakupCron] error:', err.message); return null; }
};

const schedule = () => cron.schedule('0 * * * *', run, { timezone: TZ });
module.exports = { run, schedule };