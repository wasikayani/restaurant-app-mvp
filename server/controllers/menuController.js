// server/controllers/menuController.js
// Q4: all the database code for the menu lives here.
// Each function: (1) reads the request, (2) talks to MongoDB through the
// MenuItem model, (3) sends back JSON with the right HTTP status code.
//
// Status codes used:
//   200 OK          – read / update / delete worked
//   201 Created     – a new item was saved
//   400 Bad Request – the client sent something wrong (bad id, failed validation)
//   404 Not Found   – the id is valid but no item has it
//   500 Server Error– something unexpected went wrong on our side

const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');

// Helper: is this text a valid MongoDB ObjectId (24 hex characters)?
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// Helper: turn a Mongoose validation error into one readable message
function validationMessage(error) {
  return Object.values(error.errors).map((e) => e.message).join(', ');
}

// Helper: escape characters like ( ) . * so user text is treated as plain text in a RegExp
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/menu            -> all items
// GET /api/menu?category=Mains
// GET /api/menu?search=chicken   (case-insensitive, matches part of the name)
// Both can be combined: ?category=Mains&search=karahi
async function getMenu(req, res) {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (search) filter.name = { $regex: escapeRegex(search), $options: 'i' }; // 'i' = ignore case

    const items = await MenuItem.find(filter).sort({ category: 1, name: 1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: 'Could not load the menu', error: error.message });
  }
}

// GET /api/menu/:id  -> one item
async function getMenuItem(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid menu item id' });

    const item = await MenuItem.findById(id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Could not load the menu item', error: error.message });
  }
}

// POST /api/menu  -> create a new item (body = JSON of the item)
async function createMenuItem(req, res) {
  try {
    const item = await MenuItem.create(req.body); // schema rules (required, min, enum) run here
    res.status(201).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: validationMessage(error) });
    }
    res.status(500).json({ message: 'Could not create the menu item', error: error.message });
  }
}

// PUT /api/menu/:id  -> update an item (only the fields sent in the body change)
async function updateMenuItem(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid menu item id' });

    const item = await MenuItem.findByIdAndUpdate(id, req.body, {
      returnDocument: 'after', // send back the item AFTER the update
      runValidators: true, // apply the schema rules on update too (e.g. price >= 0)
    });
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.status(200).json(item);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: validationMessage(error) });
    }
    res.status(500).json({ message: 'Could not update the menu item', error: error.message });
  }
}

// DELETE /api/menu/:id  -> remove an item
async function deleteMenuItem(req, res) {
  try {
    const { id } = req.params;
    if (!isValidId(id)) return res.status(400).json({ message: 'Invalid menu item id' });

    const item = await MenuItem.findByIdAndDelete(id);
    if (!item) return res.status(404).json({ message: 'Menu item not found' });

    res.status(200).json({ message: 'Menu item deleted', id: item._id });
  } catch (error) {
    res.status(500).json({ message: 'Could not delete the menu item', error: error.message });
  }
}

module.exports = { getMenu, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem };
