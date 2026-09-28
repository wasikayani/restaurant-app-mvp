// src/utils/reservationRules.js
// Question 9 – pure booking rules (no React), used by the useReservation hook
// and covered by Jest tests.

export const MIN_PARTY = 1;
export const MAX_PARTY = 12;
export const MIN_HOURS_AHEAD = 1;
export const PHONE_REGEX = /^03\d{2}-\d{7}$/; // Pakistani mobile: 03XX-XXXXXXX

// Statuses that free the table again
const INACTIVE = ['Cancelled', 'Declined'];

// ---------- Dates ----------
// "YYYY-MM-DD" in LOCAL time (avoids time-zone surprises of toISOString)
export const toDateKey = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

export const addDays = (date, days) => {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
};

// Date object for a booking ("2026-09-30", "19:00")
export const slotDateTime = (dateKey, time) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm, 0, 0);
};

// True if the slot starts at least MIN_HOURS_AHEAD from now
export const isFarEnoughAhead = (dateKey, time, now = new Date()) =>
  slotDateTime(dateKey, time).getTime() - now.getTime() >= MIN_HOURS_AHEAD * 60 * 60 * 1000;

// ---------- Availability ----------
// Tables that fit the party and are NOT booked at that date + time
export function getFreeTables(tables, reservations, dateKey, time, partySize) {
  const bookedIds = reservations
    .filter((r) => r.date === dateKey && r.time === time && !INACTIVE.includes(r.status))
    .map((r) => r.tableId);
  return tables
    .filter((t) => t.seats >= partySize && !bookedIds.includes(t.id))
    .sort((a, b) => a.seats - b.seats); // smallest suitable table first
}

// Status of every slot for the chosen date and party size
//   'available' | 'full' (no table big enough is free) | 'tooSoon' (past / < 1 hour)
export function getSlotStatuses(tables, reservations, dateKey, partySize, slots, now = new Date()) {
  return slots.map((time) => {
    if (!isFarEnoughAhead(dateKey, time, now)) return { time, status: 'tooSoon', freeCount: 0 };
    const free = getFreeTables(tables, reservations, dateKey, time, partySize);
    return { time, status: free.length > 0 ? 'available' : 'full', freeCount: free.length };
  });
}

// ---------- Phone formatting ----------
// Keeps digits only and inserts the dash: "03001234567" -> "0300-1234567"
export const formatPhone = (text) => {
  const digits = text.replace(/\D/g, '').slice(0, 11);
  return digits.length > 4 ? `${digits.slice(0, 4)}-${digits.slice(4)}` : digits;
};

// ---------- Validation ----------
// Returns an errors object (empty = valid). Used by useForm inside useReservation.
export function validateReservation(values, now = new Date()) {
  const e = {};
  const todayKey = toDateKey(now);

  if (!values.date) e.date = 'Please choose a date.';
  else if (values.date < todayKey) e.date = 'The date cannot be in the past.';

  const size = Number(values.partySize);
  if (!Number.isInteger(size) || size < MIN_PARTY || size > MAX_PARTY) {
    e.partySize = `Party size must be between ${MIN_PARTY} and ${MAX_PARTY}.`;
  }

  if (!values.time) e.time = 'Please choose a time slot.';
  else if (values.date && !isFarEnoughAhead(values.date, values.time, now)) {
    e.time = 'Bookings must be made at least 1 hour in advance.';
  }

  if (values.time && !values.tableId) e.tableId = 'No table is available for this time.';

  if (!values.name || values.name.trim().length < 3) e.name = 'Please enter your name.';

  if (!PHONE_REGEX.test(values.phone || '')) {
    e.phone = 'Enter a Pakistani mobile number like 0300-1234567.';
  }
  return e;
}
