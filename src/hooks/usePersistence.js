// src/hooks/usePersistence.js
// Question 10 – custom hook that keeps a piece of state saved in AsyncStorage.
//
//   const isHydrated = usePersistence(STORAGE_KEYS.orders, orders, restoreOrders);
//
// 1. On mount it READS the saved value once and gives it to `restore`
//    ("hydration" = filling the in-memory state with the saved data).
// 2. After that, every time `value` changes it WRITES the new value.
// 3. It returns `isHydrated`, so the app can show a loading screen until
//    the saved data is back.
//
// `restore` must be a stable function (a state setter or a useCallback),
// otherwise the load effect would run again on every render.

import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from '../utils/storage';

export default function usePersistence(key, value, restore) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Load once
  useEffect(() => {
    let isActive = true; // guards against setting state after unmount
    loadJSON(key).then((saved) => {
      if (!isActive) return;
      if (saved !== null) restore(saved);
      setIsHydrated(true);
    });
    return () => {
      isActive = false; // cleanup
    };
  }, [key, restore]);

  // Save on every change – but only after loading, so the mock data can
  // never overwrite what the user saved last time.
  useEffect(() => {
    if (isHydrated) saveJSON(key, value);
  }, [key, value, isHydrated]);

  return isHydrated;
}
