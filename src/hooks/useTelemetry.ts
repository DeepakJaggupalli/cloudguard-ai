import { useState, useEffect, useCallback } from 'react';
import { fetchTelemetryData } from '../api/telemetry';
import { TelemetryPoint, TimeRange } from '../types';

export const useTelemetry = (range: TimeRange = '15m') => {
  const [data, setData] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const points = await fetchTelemetryData(range);
      setData(points);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch telemetry metrics');
    } finally {
      setLoading(false);
    }
  }, [range]);

  useEffect(() => {
    loadData();
    // Auto-refresh telemetry stream every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, [loadData]);

  return { data, loading, error, refresh: loadData };
};
