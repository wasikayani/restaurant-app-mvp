// src/hooks/useApi.js
// Assignment 2 – Q6: custom hook for loading data from the server.
//
//   const { data, loading, error, refetch } = useApi('/api/menu');
//
// 1. useEffect calls GET <path> when the screen opens (and again if the path changes).
// 2. While waiting: loading = true.  On failure: error = the server's message.
// 3. refetch() loads the data again – used by Retry, pull-to-refresh, and after
//    the manager changes something.  refetch({ silent: true }) keeps the old
//    data on screen (no loading spinner) and returns true / false.
//
// Used in MenuScreen and DashboardScreen (Q6) and in the order screens (Q7).

import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../api/client';

export default function useApi(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Stops "set state on an unmounted screen" if the user leaves before the answer arrives
  const isMounted = useRef(true);

  const refetch = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setLoading(true);
        setError(null);
      }
      try {
        const result = await request(path);
        if (isMounted.current) {
          setData(result);
          setError(null);
        }
        return true;
      } catch (err) {
        if (isMounted.current && !silent) setError(err.message);
        return false;
      } finally {
        if (isMounted.current && !silent) setLoading(false);
      }
    },
    [path],
  );

  // Load once when the screen mounts (refetch only changes if the path changes)
  useEffect(() => {
    isMounted.current = true;
    refetch();
    return () => {
      isMounted.current = false; // cleanup
    };
  }, [refetch]);

  return { data, loading, error, refetch };
}
