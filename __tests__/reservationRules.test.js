// __tests__/reservationRules.test.js
// Question 9 – availability and validation rules used by the useReservation hook.

import { mockTables, TIME_SLOTS } from '../src/data/tables';
import {
  getFreeTables,
  getSlotStatuses,
  validateReservation,
  formatPhone,
  PHONE_REGEX,
} from '../src/utils/reservationRules';

// Fixed "now" so the tests never depend on the real clock: 30 Sep 2026, 15:30
const NOW = new Date(2026, 8, 30, 15, 30);
const TODAY = '2026-09-30';
const TOMORROW = '2026-10-01';

const booking = (tableId, date, time, status = 'Confirmed') => ({ tableId, date, time, status });

const valid = {
  date: TOMORROW,
  time: '19:00',
  partySize: 4,
  tableId: 't3',
  name: 'Ali Raza',
  phone: '0300-1234567',
  note: '',
};

describe('time slots', () => {
  test('hourly slots from 12:00 to 22:00', () => {
    expect(TIME_SLOTS[0]).toBe('12:00');
    expect(TIME_SLOTS[TIME_SLOTS.length - 1]).toBe('22:00');
    expect(TIME_SLOTS).toHaveLength(11);
  });

  test('a slot is "full" when every table big enough is booked', () => {
    const reservations = ['t6', 't7', 't8'].map((id) => booking(id, TOMORROW, '19:00'));
    const slots = getSlotStatuses(mockTables, reservations, TOMORROW, 6, TIME_SLOTS, NOW);
    expect(slots.find((s) => s.time === '19:00').status).toBe('full');
    expect(slots.find((s) => s.time === '18:00').status).toBe('available');
  });

  test('the same slot is still available for a small party', () => {
    const reservations = ['t6', 't7', 't8'].map((id) => booking(id, TOMORROW, '19:00'));
    const slots = getSlotStatuses(mockTables, reservations, TOMORROW, 2, TIME_SLOTS, NOW);
    expect(slots.find((s) => s.time === '19:00').status).toBe('available');
  });

  test('slots less than 1 hour away (or past) are "tooSoon"', () => {
    const slots = getSlotStatuses(mockTables, [], TODAY, 2, TIME_SLOTS, NOW);
    expect(slots.find((s) => s.time === '15:00').status).toBe('tooSoon'); // past
    expect(slots.find((s) => s.time === '16:00').status).toBe('tooSoon'); // only 30 min ahead
    expect(slots.find((s) => s.time === '17:00').status).toBe('available');
  });

  test('cancelled bookings free the table again', () => {
    const free = getFreeTables(
      mockTables,
      [booking('t8', TOMORROW, '19:00', 'Cancelled')],
      TOMORROW,
      '19:00',
      12,
    );
    expect(free.map((t) => t.id)).toEqual(['t8']);
  });
});

describe('validateReservation', () => {
  test('a correct booking has no errors', () => {
    expect(validateReservation(valid, NOW)).toEqual({});
  });

  test('date in the past is rejected', () => {
    expect(validateReservation({ ...valid, date: '2026-09-29' }, NOW).date).toBeDefined();
  });

  test('party size must be between 1 and 12', () => {
    expect(validateReservation({ ...valid, partySize: 0 }, NOW).partySize).toBeDefined();
    expect(validateReservation({ ...valid, partySize: 13 }, NOW).partySize).toBeDefined();
    expect(validateReservation({ ...valid, partySize: 12 }, NOW).partySize).toBeUndefined();
  });

  test('booking must be at least 1 hour ahead', () => {
    expect(validateReservation({ ...valid, date: TODAY, time: '16:00' }, NOW).time).toBeDefined();
    expect(validateReservation({ ...valid, date: TODAY, time: '17:00' }, NOW).time).toBeUndefined();
  });

  test('phone must match 03XX-XXXXXXX', () => {
    expect(PHONE_REGEX.test('0300-1234567')).toBe(true);
    expect(PHONE_REGEX.test('03001234567')).toBe(false);
    expect(PHONE_REGEX.test('0400-1234567')).toBe(false);
    expect(validateReservation({ ...valid, phone: '12345' }, NOW).phone).toBeDefined();
  });

  test('formatPhone inserts the dash automatically', () => {
    expect(formatPhone('03001234567')).toBe('0300-1234567');
    expect(formatPhone('0300')).toBe('0300');
    expect(formatPhone('0300-123456789')).toBe('0300-1234567');
  });
});
