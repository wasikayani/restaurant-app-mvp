// server/models/MenuItem.js
// One dish on the menu. The manager can add, edit or switch dishes on/off.

const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    description: { type: String, default: '', trim: true },
    price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Starters', 'Mains', 'Desserts', 'Drinks'],
    },
    image: { type: String, default: '' },
    isSpecial: { type: Boolean, default: false },
    isAvailable: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4.5 },
    prepTime: { type: Number, min: 1, default: 15 }, // minutes
  },
  { timestamps: true },
);

module.exports = mongoose.model('MenuItem', menuItemSchema);
