// src/hooks/useDebounce.js
// Question 9 – returns `value`, but only after it has stopped changing for `delay` ms.
// It replaces the manual useRef + setTimeout debounce from Question 5.
//
//   const debouncedSearch = useDebounce(searchText, 400);
//
// How it works: every time `value` changes, the effect starts a new timer and the
// cleanup function cancels the previous one. Only the last timer survives, so the
// debounced value updates once the user pauses typing. The cleanup also runs on
// unmount, so no state update happens after the screen is closed.

import { useState, useEffect } from 'react';

export default function useDebounce(value, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer); // cancel if value changes again (or on unmount)
  }, [value, delay]);

  return debouncedValue;
}
