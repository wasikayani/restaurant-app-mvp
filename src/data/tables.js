// src/data/tables.js
// Mock restaurant tables (no backend). `seats` = maximum party size for that table.

export const mockTables = [
  { id: 't1', number: 1, seats: 2, area: 'Window' },
  { id: 't2', number: 2, seats: 2, area: 'Window' },
  { id: 't3', number: 3, seats: 4, area: 'Main hall' },
  { id: 't4', number: 4, seats: 4, area: 'Main hall' },
  { id: 't5', number: 5, seats: 4, area: 'Terrace' },
  { id: 't6', number: 6, seats: 6, area: 'Terrace' },
  { id: 't7', number: 7, seats: 8, area: 'Private booth' },
  { id: 't8', number: 8, seats: 12, area: 'Family hall' },
];

// Hourly time slots from 12:00 to 22:00 (inclusive)
export const TIME_SLOTS = Array.from(
  { length: 11 },
  (_, i) => `${String(12 + i).padStart(2, '0')}:00`,
);
