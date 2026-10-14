// server/config/db.js
// Q3: connects the server to MongoDB using the address in MONGO_URI (.env).
// If the connection fails, the server cannot work, so we print the error and stop.

const mongoose = require('mongoose');

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // 1 = stopped because of an error
  }
}

module.exports = connectDB;
