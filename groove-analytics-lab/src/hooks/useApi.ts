import { useState, useEffect, useCallback } from 'react';

export function useApi<T>(fetchFn: () => Promise<T>, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const executeFetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    executeFetch();
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: executeFetch };
}
