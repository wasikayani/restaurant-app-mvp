// server/server.js
// Green Fork API – the Express server for the Restaurant App (Assignment 2).
// Q2: basic setup – environment variables, middleware, health check,
//     404 handler for unknown routes and a JSON error handler.
// Q3: connects to MongoDB before the server starts listening.
// Q4: menu API routes (/api/menu).

require('dotenv').config({ quiet: true }); // loads PORT, MONGO_URI ... from the .env file into process.env

const os = require('os');
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// ---------- Middleware (runs before every route) ----------
app.use(cors()); // allow the Expo app (other origin) to call this API
app.use(express.json()); // read JSON request bodies into req.body

// ---------- Routes ----------
// Health check: quick way to see if the server is running and reachable
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Q4: every URL starting with /api/menu is handled by the menu routes file
app.use('/api/menu', require('./routes/menuRoutes'));

// ---------- 404: any URL that did not match a route above ----------
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ---------- Error handler (must be last, has 4 parameters) ----------
// Any error thrown in a route ends up here and is sent back as JSON.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ message: 'Server error', error: err.message });
});

// Laptop's Wi-Fi IP address – the phone must use this instead of "localhost"
function getLocalIp() {
  for (const addresses of Object.values(os.networkInterfaces())) {
    for (const a of addresses || []) {
      if (a.family === 'IPv4' && !a.internal) return a.address;
    }
  }
  return 'localhost';
}

// Connect to the database first, then start listening for requests.
// '0.0.0.0' = accept requests from other devices on the same Wi-Fi, not only this laptop
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`From your phone open: http://${getLocalIp()}:${PORT}/api/health`);
  });
});
