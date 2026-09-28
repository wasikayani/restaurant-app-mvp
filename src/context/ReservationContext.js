// src/context/ReservationContext.js
// Shared list of ALL reservations (customers' and other guests').
// Lives at app level so the manager can see and accept/decline bookings (Q10).

import { createContext, useContext, useState } from 'react';
import { mockReservations } from '../data/reservations';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState(mockReservations);

  const addReservation = (reservation) => setReservations((prev) => [reservation, ...prev]);

  const updateReservationStatus = (id, status) =>
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));

  return (
    <ReservationContext.Provider value={{ reservations, addReservation, updateReservationStatus }}>
      {children}
    </ReservationContext.Provider>
  );
}

export function useReservationContext() {
  const context = useContext(ReservationContext);
  if (context === null) {
    throw new Error('useReservationContext() must be used inside <ReservationProvider>.');
  }
  return context;
}
