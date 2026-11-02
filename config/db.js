const mongoose = require('mongoose');

async function connectDB(uri = process.env.MONGODB_URI) {
  if (!uri || /<[^>]+>/.test(uri)) {
    throw new Error('Set MONGODB_URI in .env to your own MongoDB connection string.');
  }
  // Prefer IPv4 on networks where Atlas TLS connections over IPv6 fail.
  await mongoose.connect(uri, { family: 4, serverSelectionTimeoutMS: 10000 });
}

module.exports = connectDB;
