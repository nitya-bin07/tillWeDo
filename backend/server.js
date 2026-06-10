require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

/* ----------------- Crash safety: synchronous bugs ----------------- */
process.on('uncaughtException', (err) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error(err.name, err.message);
  process.exit(1);
});

/* ------------------------------ Bootstrap ------------------------------ */
const start = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(
        `🚀 TillWeDo API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );

      // Scheduled jobs (Step 5, §10.3). Set DISABLE_CRONS=true to turn them
      // off (e.g. in tests, or on a secondary instance to avoid double-runs).
      if (process.env.DISABLE_CRONS !== 'true') {
        require('./jobs/interestCron').schedule();
        require('./jobs/contributionCron').schedule();
        require('./jobs/breakupCron').schedule();
        require('./jobs/reminderCron').schedule();
        console.log('🕒 Cron jobs scheduled (interest · contribution · breakup · reminder)');
      }
    });

    // Async errors we forgot to handle
    process.on('unhandledRejection', (err) => {
      console.error('💥 UNHANDLED REJECTION! Shutting down...');
      console.error(err.name, err.message);
      server.close(() => process.exit(1));
    });

    // Graceful shutdown (Railway / containers send SIGTERM)
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Closing server gracefully...');
      server.close(() => {
        console.log('Process terminated.');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();