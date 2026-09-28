// src/data/reservations.js
// Mock existing reservations (made by other guests) so availability can be tested.
// Dates are generated RELATIVE to today, so the demo always has full slots:
//   - Tomorrow 20:00 -> EVERY table is booked (slot shows "Full" for any party size)
//   - Tomorrow 19:00 -> all tables for 5+ people are booked (Full when party size > 4)
//   - Today 21:00    -> the two 2-seat tables are booked
//   - Two PENDING requests for the manager to accept or decline (Q10)

import { toDateKey, addDays } from '../utils/reservationRules';
import { mockTables } from './tables';

const today = toDateKey(new Date());
const tomorrow = toDateKey(addDays(new Date(), 1));
const inTwoDays = toDateKey(addDays(new Date(), 2));

const guest = (id, date, time, tableId, partySize, name, status = 'Confirmed', phone = '0300-0000000') => ({
  id,
  userId: 'guest',
  name,
  phone,
  date,
  time,
  partySize,
  tableId,
  tableNumber: mockTables.find((t) => t.id === tableId).number,
  note: '',
  status,
  createdAt: new Date().toISOString(),
});

export const mockReservations = [
  // Tomorrow 20:00 – whole restaurant booked (private event)
  ...mockTables.map((t, i) =>
    guest(`r-event-${i}`, tomorrow, '20:00', t.id, Math.min(t.seats, 4), 'Private event'),
  ),
  // Tomorrow 19:00 – big tables taken
  guest('r1', tomorrow, '19:00', 't6', 6, 'Hamza'),
  guest('r2', tomorrow, '19:00', 't7', 8, 'Ayesha'),
  guest('r3', tomorrow, '19:00', 't8', 10, 'Bilal'),
  // Today 21:00 – small tables taken
  guest('r4', today, '21:00', 't1', 2, 'Zara'),
  guest('r5', today, '21:00', 't2', 2, 'Usman'),
  // Waiting for the manager (Q10 Dashboard → Reservations)
  guest('r6', tomorrow, '13:00', 't5', 3, 'Omar Farooq', 'Pending', '0321-5550123'),
  guest('r7', inTwoDays, '19:00', 't3', 4, 'Fatima Noor', 'Pending', '0333-7771234'),
];
