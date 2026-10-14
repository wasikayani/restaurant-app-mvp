// server/models/User.js
// A person who can log in: a customer or a manager.

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true, // two users can never have the same email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: { type: String, required: [true, 'Password is required'], minlength: 8 },
    role: { type: String, enum: ['customer', 'manager'], default: 'customer' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
