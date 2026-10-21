// server/models/User.js
// A person who can log in: a customer or a manager.
// Q5: the password is HASHED with bcrypt before it is saved, and it is never
//     sent back in any response.

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // NOT included when we read users from the database (unless we ask for it)
    },
    role: { type: String, enum: ['customer', 'manager'], default: 'customer' },
  },
  { timestamps: true },
);

// Runs automatically before every save (also for User.create in seed.js).
// It replaces the plain password with a bcrypt hash, e.g. "$2b$10$Xk3...".
// A hash cannot be turned back into the password, so even if someone reads
// the database they do not learn the real passwords.
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return; // already hashed – do not hash twice
  this.password = await bcrypt.hash(this.password, 10); // 10 = "salt rounds" (how slow/strong)
});

// Used by login: compare the typed password with the saved hash
userSchema.methods.matchPassword = function matchPassword(plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

// Safety net: whenever a user is turned into JSON, remove the password field
userSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
