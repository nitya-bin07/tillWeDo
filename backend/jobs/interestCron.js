const cron = require('node-cron');
const interestService = require('../services/interestService');
const TZ = process.env.CRON_TIMEZONE || 'Asia/Kolkata';

const run = async () => {
  try {
    console.log('🕒 [interestCron] crediting monthly interest...');
    const result = await interestService.creditInterestToAllActiveVaults();
    console.log(`🕒 [interestCron] done — ${result.vaultsCredited} vault(s), ₹${result.totalCredited} credited`);
    return result;
  } catch (err) { console.error('[interestCron] error:', err.message); return null; }
};

const schedule = () => cron.schedule('1 0 1 * *', run, { timezone: TZ });
module.exports = { run, schedule };