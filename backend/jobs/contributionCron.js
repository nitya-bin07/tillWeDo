const cron = require('node-cron');
const Vault = require('../models/Vault');
const Contribution = require('../models/Contribution');
const { computeNextContributionDate } = require('../controllers/vaultController');

const TZ = process.env.CRON_TIMEZONE || 'Asia/Kolkata';
const GRACE_DAYS = Number(process.env.CONTRIBUTION_GRACE_DAYS) || 3;

const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
const endOfDay = (d) => { const x = new Date(d); x.setHours(23,59,59,999); return x; };

const advanceContributionDate = (cycleDate, vault) => {
  if (vault.contributionInterval === 'custom') {
    const next = new Date(cycleDate);
    next.setDate(next.getDate() + (vault.customIntervalDays || 30));
    next.setHours(0, 0, 0, 0);
    return next;
  }
  const dayAfter = new Date(cycleDate);
  dayAfter.setDate(dayAfter.getDate() + 1);
  return computeNextContributionDate(dayAfter, 'monthly', vault.contributionDay, vault.customIntervalDays);
};

const run = async () => {
  try {
    const today = endOfDay(new Date());
    const vaults = await Vault.find({ status: { $in: ['active', 'setup'] }, nextContributionDate: { $lte: today } });

    let cyclesCreated = 0, activated = 0;
    for (const vault of vaults) {
      if (vault.status === 'setup') { vault.status = 'active'; activated += 1; }

      const cycleDate = startOfDay(vault.nextContributionDate);
      const exists = await Contribution.findOne({ vaultId: vault._id, cycleDate });
      if (!exists) {
        const graceMs = GRACE_DAYS * 24 * 60 * 60 * 1000;
        await Contribution.create({
          vaultId: vault._id, cycleDate,
          amountA: vault.monthlyAmountA, amountB: vault.monthlyAmountB,
          statusA: 'pending', statusB: 'pending',
          graceDeadlineA: new Date(cycleDate.getTime() + graceMs),
          graceDeadlineB: new Date(cycleDate.getTime() + graceMs),
        });
        // STEP 6: trigger Razorpay auto-debit for both partners here.
        cyclesCreated += 1;
      }

      vault.nextContributionDate = advanceContributionDate(cycleDate, vault);
      await vault.save();
    }
    console.log(`🕒 [contributionCron] ${cyclesCreated} cycle(s) created, ${activated} vault(s) activated`);
    return { cyclesCreated, activated };
  } catch (err) { console.error('[contributionCron] error:', err.message); return null; }
};

const schedule = () => cron.schedule('0 9 * * *', run, { timezone: TZ });
module.exports = { run, schedule, advanceContributionDate };