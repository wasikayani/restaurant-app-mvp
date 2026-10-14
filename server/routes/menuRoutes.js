// server/routes/menuRoutes.js
// Q4: this file ONLY maps URLs to controller functions.
// No database code here – that is all in controllers/menuController.js.
// The paths are relative to '/api/menu' (set in server.js).

const express = require('express');
const {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

const router = express.Router();

router.get('/', getMenu); //            GET    /api/menu
router.get('/:id', getMenuItem); //     GET    /api/menu/:id
router.post('/', createMenuItem); //    POST   /api/menu
router.put('/:id', updateMenuItem); //  PUT    /api/menu/:id
router.delete('/:id', deleteMenuItem); // DELETE /api/menu/:id

module.exports = router;
