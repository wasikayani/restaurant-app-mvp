// src/context/ReservationContext.js
// Shared list of ALL reservations (customers' and other guests').
// Lives at app level so the manager can see and accept/decline bookings (Q10).
// Q10: saved in AsyncStorage, so bookings survive app restarts.

import { createContext, useCallback, useContext, useState } from 'react';
import { mockReservations } from '../data/reservations';
import usePersistence from '../hooks/usePersistence';
import { STORAGE_KEYS } from '../utils/storage';

const ReservationContext = createContext(null);

export function ReservationProvider({ children }) {
  const [reservations, setReservations] = useState(mockReservations);
  const isHydrated = usePersistence(STORAGE_KEYS.reservations, reservations, setReservations);

  const addReservation = useCallback(
    (reservation) => setReservations((prev) => [reservation, ...prev]),
    [],
  );

  // Used by the customer (Cancelled) and by the manager (Confirmed / Declined)
  const updateReservationStatus = useCallback(
    (id, status) =>
      setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r))),
    [],
  );

  const resetReservations = useCallback(() => setReservations(mockReservations), []);

  return (
    <ReservationContext.Provider
      value={{
        reservations,
        isHydrated,
        addReservation,
        updateReservationStatus,
        resetReservations,
      }}
    >
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
