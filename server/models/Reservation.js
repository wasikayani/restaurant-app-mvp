// server/models/Reservation.js
// A table booking. It stores the id of the user who booked and the id of the table
// (references to the users and tables collections).

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', required: true },
    date: { type: String, required: true, match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'] },
    time: { type: String, required: true, match: [/^\d{2}:00$/, 'Time must be a full hour, e.g. 19:00'] },
    partySize: { type: Number, required: true, min: 1, max: 12 },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, match: [/^03\d{2}-\d{7}$/, 'Phone must look like 0300-1234567'] },
    note: { type: String, default: '', trim: true },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Declined', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true }, // adds createdAt and updatedAt automatically
);

module.exports = mongoose.model('Reservation', reservationSchema);
