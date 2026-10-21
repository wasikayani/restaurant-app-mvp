// server/routes/menuRoutes.js
// Q4: this file ONLY maps URLs to controller functions.
// No database code here – that is all in controllers/menuController.js.
// The paths are relative to '/api/menu' (set in server.js).
// Q5: adding, editing and deleting dishes needs a manager token.
//     protect checks the token (401), managerOnly checks the role (403).

const express = require('express');
const {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');
const { protect, managerOnly } = require('../middleware/auth');

const router = express.Router();

// Public – anyone can read the menu
router.get('/', getMenu); //                                   GET    /api/menu
router.get('/:id', getMenuItem); //                            GET    /api/menu/:id

// Manager only
router.post('/', protect, managerOnly, createMenuItem); //     POST   /api/menu
router.put('/:id', protect, managerOnly, updateMenuItem); //   PUT    /api/menu/:id
router.delete('/:id', protect, managerOnly, deleteMenuItem); // DELETE /api/menu/:id

module.exports = router;
