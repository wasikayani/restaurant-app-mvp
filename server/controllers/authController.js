// server/controllers/authController.js
// Q5: register and login.
//
// How login works (JWT = JSON Web Token):
//   1. The user sends email + password.
//   2. We check the password against the bcrypt hash in the database.
//   3. If it matches, we create a TOKEN signed with JWT_SECRET (from .env).
//      The token contains the user's id and role and expires after 1 day.
//   4. The app saves the token and sends it with every protected request:
//         Authorization: Bearer <token>
//   5. middleware/auth.js checks the token on the server.

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Same rule as the app (A1): at least 8 characters and at least 1 number
const PASSWORD_REGEX = /^(?=.*\d).{8,}$/;

// Create a token that is valid for 1 day
function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

// What we send back after register / login – never the password
function userResponse(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token: createToken(user),
  };
}

// POST /api/auth/register   body: { name, email, password }
async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }
    if (!PASSWORD_REGEX.test(password)) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters and contain a number' });
    }

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) {
      return res.status(409).json({ message: 'An account with this email already exists' }); // 409 = Conflict
    }

    // role is NOT taken from the request body: anyone who signs up is a customer.
    // Otherwise a user could send "role": "manager" and give themselves manager rights.
    // Managers are created by the seed script (or by the database admin).
    const user = await User.create({ name, email, password, role: 'customer' }); // password is hashed in the model

    res.status(201).json(userResponse(user));
  } catch (error) {
    if (error.name === 'ValidationError') {
      const message = Object.values(error.errors).map((e) => e.message).join(', ');
      return res.status(400).json({ message });
    }
    if (error.code === 11000) {
      // unique index on email (in case two signups arrive at the same moment)
      return res.status(409).json({ message: 'An account with this email already exists' });
    }
    res.status(500).json({ message: 'Could not register', error: error.message });
  }
}

// POST /api/auth/login   body: { email, password }
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // password has select:false in the model, so we must ask for it here
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');

    // Same message for "no such email" and "wrong password", so attackers
    // cannot find out which emails are registered.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: 'Could not log in', error: error.message });
  }
}

module.exports = { register, login };
