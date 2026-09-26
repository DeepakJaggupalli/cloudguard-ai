import { useState, useEffect, useCallback } from 'react';
import { fetchIncidents, fetchIncidentById } from '../api/incidents';
import { Incident } from '../types';

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadIncidents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidents();
      setIncidents(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadIncidents();
  }, [loadIncidents]);

  return { incidents, loading, error, refresh: loadIncidents };
};

export const useIncidentDetails = (id: string | undefined) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDetails = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchIncidentById(id);
      setIncident(data || null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load incident details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDetails();
  }, [loadDetails]);

  return { incident, loading, error, refresh: loadDetails };
};
