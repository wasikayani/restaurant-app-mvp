// server/middleware/auth.js
// Q5: middleware = a function that runs BEFORE the controller.
// It can let the request continue (next()) or stop it with an error.
//
//   protect      -> is there a valid token?  If not: 401 Unauthorized
//   managerOnly  -> is this user a manager?  If not: 403 Forbidden
//
// Use them in a route like:  router.post('/', protect, managerOnly, createMenuItem)

const jwt = require('jsonwebtoken');
const User = require('../models/User');

async function protect(req, res, next) {
  try {
    // The app sends:  Authorization: Bearer eyJhbGciOi...
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }
    const token = header.split(' ')[1];

    // verify() checks the signature (made with JWT_SECRET) and the expiry date.
    // If the token was changed or is older than 1 day, it throws an error.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Load the user from the database (without the password) and attach it to the request,
    // so the next functions can use req.user._id and req.user.role
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user no longer exists' });
    }

    req.user = user;
    next(); // token is fine – continue to the next function
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token is invalid or expired' });
  }
}

// Must be used AFTER protect (it needs req.user)
function managerOnly(req, res, next) {
  if (req.user && req.user.role === 'manager') return next();
  res.status(403).json({ message: 'Access denied: managers only' }); // logged in, but not allowed
}

module.exports = { protect, managerOnly };
