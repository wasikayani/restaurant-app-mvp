// server/models/Table.js
// A restaurant table that customers can reserve.

const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  number: { type: Number, required: true, unique: true, min: 1 }, // table number shown to guests
  seats: { type: Number, required: true, min: 1 }, // maximum party size
  area: { type: String, default: 'Main hall', trim: true },
});

module.exports = mongoose.model('Table', tableSchema);
