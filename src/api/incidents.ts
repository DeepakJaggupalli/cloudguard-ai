import { apiClient } from './client';
import { config } from '../config/environment';
import { mockIncidents } from '../mock/incidents';
import { Incident } from '../types';

let stateIncidents: Incident[] = [...mockIncidents];

export const fetchIncidents = async (): Promise<Incident[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(80);
    return [...stateIncidents];
  }
  return apiClient.get<Incident[]>('/incidents');
};

export const fetchIncidentById = async (id: string): Promise<Incident | undefined> => {
  if (config.useMockData) {
    await apiClient.mockDelay(50);
    return stateIncidents.find((inc) => inc.id === id);
  }
  return apiClient.get<Incident>(`/incidents/${id}`);
};

export const addSyntheticIncident = (incident: Incident) => {
  stateIncidents = [incident, ...stateIncidents];
};

export const updateIncidentState = (id: string, updates: Partial<Incident>) => {
  stateIncidents = stateIncidents.map((inc) => (inc.id === id ? { ...inc, ...updates } : inc));
};
