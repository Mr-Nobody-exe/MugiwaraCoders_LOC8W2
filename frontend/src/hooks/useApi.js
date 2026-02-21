import { useState, useEffect, useCallback, useRef } from "react";

/**
 * useApi(fetchFn, deps)
 * Generic data-fetching hook.
 *
 * Usage:
 *   const { data, loading, error, refetch } = useApi(() => teamService.getAll());
 */
export function useApi(fetchFn, deps = []) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const mounted = useRef(true);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchFn();
      if (mounted.current) setData(res.data);
    } catch (err) {
      if (mounted.current)
        setError(err?.response?.data?.message || err.message || "Request failed");
    } finally {
      if (mounted.current) setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mounted.current = true;
    execute();
    return () => { mounted.current = false; };
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
