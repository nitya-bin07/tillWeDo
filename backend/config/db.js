const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas.
 * Reads MONGO_URI from the environment. Throws if it is missing so the
 * server fails fast at startup instead of limping along without a DB.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment variables');
  }

  // Mongoose 7+ defaults are sensible; we set strictQuery explicitly to
  // silence the deprecation warning and lock in predictable filtering.
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000, // fail fast if Atlas is unreachable
  });

  console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);

  // Runtime connection diagnostics
  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err.message);
  });
  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️  MongoDB disconnected.');
  });

  return conn;
};

module.exports = connectDB;