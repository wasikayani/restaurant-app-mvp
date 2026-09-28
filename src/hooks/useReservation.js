// src/hooks/useReservation.js
// Question 9 – ALL table-booking logic lives in this custom hook, so
// ReservationScreen and MyReservationsScreen contain only UI code.
//
// It manages: selected date, time slot, party size, table and contact details,
// checks availability against mockTables + existing reservations, and exposes
// createReservation() and cancelReservation().
//
// It is built from other hooks (hook composition):
//   useForm               -> values, errors, validation (Q9)
//   useReservationContext -> shared list of all reservations
//   useAuth               -> who is booking
//   useMemo               -> slot statuses / free tables recalculated only when inputs change
//
// Hook rules: name starts with "use", hooks called only at the top level, no JSX returned.

import { useMemo } from 'react';
import useForm from './useForm';
import { useAuth } from '../context/AuthContext';
import { useReservationContext } from '../context/ReservationContext';
import { mockTables, TIME_SLOTS } from '../data/tables';
import {
  MIN_PARTY,
  MAX_PARTY,
  addDays,
  toDateKey,
  formatPhone,
  getFreeTables,
  getSlotStatuses,
  validateReservation,
} from '../utils/reservationRules';

const DAYS_AHEAD = 14; // how many dates to offer
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Readable label for a date key: "Tue, 30 Sep"
export const formatDateLabel = (dateKey) => {
  const [y, m, d] = dateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return `${WEEKDAYS[date.getDay()]}, ${d} ${MONTHS[m - 1]}`;
};

export default function useReservation() {
  const { user } = useAuth();
  const { reservations, addReservation, updateReservationStatus } = useReservationContext();

  // Next 14 days for the date chips
  const dateOptions = useMemo(
    () =>
      Array.from({ length: DAYS_AHEAD }, (_, i) => {
        const d = addDays(new Date(), i);
        return {
          key: toDateKey(d),
          label: i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : WEEKDAYS[d.getDay()],
          day: d.getDate(),
          month: MONTHS[d.getMonth()],
        };
      }),
    [],
  );

  const { values, errors, handleChange, handleSubmit, reset, isValid } = useForm(
    {
      date: dateOptions[0].key,
      time: null,
      partySize: 2,
      tableId: null,
      name: user?.fullName ?? '',
      phone: '',
      note: '',
    },
    validateReservation,
  );

  // ---------- Availability (derived data -> useMemo) ----------
  const slots = useMemo(
    () => getSlotStatuses(mockTables, reservations, values.date, values.partySize, TIME_SLOTS),
    [reservations, values.date, values.partySize],
  );

  const freeTables = useMemo(
    () =>
      values.time
        ? getFreeTables(mockTables, reservations, values.date, values.time, values.partySize)
        : [],
    [reservations, values.date, values.time, values.partySize],
  );

  const selectedTable = mockTables.find((t) => t.id === values.tableId) ?? null;

  // ---------- Keep time + table valid whenever date / party / time changes ----------
  // If the chosen slot is no longer free, clear it; otherwise keep the chosen table
  // if it still fits, or pick the smallest free table automatically.
  const syncSelection = (date, partySize, time, preferredTableId) => {
    if (!time) {
      handleChange('tableId', null);
      return;
    }
    const free = getFreeTables(mockTables, reservations, date, time, partySize);
    if (free.length === 0) {
      handleChange('time', null);
      handleChange('tableId', null);
      return;
    }
    const keep = free.find((t) => t.id === preferredTableId);
    handleChange('tableId', keep ? keep.id : free[0].id);
  };

  const selectDate = (dateKey) => {
    handleChange('date', dateKey);
    syncSelection(dateKey, values.partySize, values.time, values.tableId);
  };

  const setPartySize = (size) => {
    const clamped = Math.min(MAX_PARTY, Math.max(MIN_PARTY, size));
    handleChange('partySize', clamped);
    syncSelection(values.date, clamped, values.time, values.tableId);
  };

  const selectTime = (time) => {
    const slot = slots.find((s) => s.time === time);
    if (!slot || slot.status !== 'available') return; // disabled slots cannot be chosen
    handleChange('time', time);
    syncSelection(values.date, values.partySize, time, values.tableId);
  };

  const selectTable = (tableId) => handleChange('tableId', tableId);
  const setName = (text) => handleChange('name', text);
  const setPhone = (text) => handleChange('phone', formatPhone(text)); // auto "0300-1234567"
  const setNote = (text) => handleChange('note', text);

  // ---------- Actions ----------
  // Validate first; the screen shows the confirmation modal in onValid
  const reviewBooking = (onValid, onInvalid) => handleSubmit(onValid, onInvalid);

  // Save the booking (called after the user confirms in the modal)
  const createReservation = () => {
    // Re-check: the table might have been taken since it was selected
    const stillFree = getFreeTables(
      mockTables,
      reservations,
      values.date,
      values.time,
      values.partySize,
    ).some((t) => t.id === values.tableId);
    if (!stillFree) return { ok: false, message: 'Sorry, this table was just booked.' };

    const reservation = {
      id: `r${Date.now()}`,
      userId: user?.id,
      name: values.name.trim(),
      phone: values.phone,
      date: values.date,
      time: values.time,
      partySize: values.partySize,
      tableId: values.tableId,
      tableNumber: selectedTable?.number,
      note: values.note.trim(),
      status: 'Pending', // manager accepts or declines in the dashboard (Q10)
      createdAt: new Date().toISOString(),
    };
    addReservation(reservation);
    // Start a fresh form but keep the contact details for next time
    reset({ ...values, time: null, tableId: null, note: '' });
    return { ok: true, reservation };
  };

  const cancelReservation = (id) => updateReservationStatus(id, 'Cancelled');

  // The logged-in customer's bookings, soonest first
  const myReservations = useMemo(
    () =>
      reservations
        .filter((r) => r.userId === user?.id)
        .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)),
    [reservations, user?.id],
  );

  return {
    // form state
    values,
    errors,
    isValid,
    // options + derived data
    dateOptions,
    slots,
    freeTables,
    selectedTable,
    myReservations,
    minParty: MIN_PARTY,
    maxParty: MAX_PARTY,
    // setters
    selectDate,
    setPartySize,
    selectTime,
    selectTable,
    setName,
    setPhone,
    setNote,
    // actions
    reviewBooking,
    createReservation,
    cancelReservation,
  };
}
