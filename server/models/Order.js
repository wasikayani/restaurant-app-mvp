// server/models/Order.js
// A customer's order. It stores the id of the user who placed it, a copy of each
// item (name and price at the time of ordering) and the bill totals.

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema(
  {
    menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    note: { type: String, default: '' },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: {
      type: [orderItemSchema],
      validate: [(items) => items.length > 0, 'An order needs at least one item'],
    },
    subtotal: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    serviceCharge: { type: Number, default: 0, min: 0 },
    salesTax: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    promoCode: { type: String, default: null },
    type: { type: String, enum: ['Dine-in', 'Takeaway'], required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null }, // Dine-in only
    pickupTime: { type: String, default: null }, // Takeaway only, e.g. "19:30"
    status: {
      type: String,
      enum: ['Pending', 'Preparing', 'Ready', 'Served', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Order', orderSchema);
