import { apiClient } from './client';
import { config } from '../config/environment';
import { mockDashboardSummary } from '../mock/summary';
import { DashboardSummary } from '../types';

export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
  if (config.useMockData) {
    await apiClient.mockDelay(60);
    return { ...mockDashboardSummary, lastUpdated: new Date().toISOString() };
  }
  return apiClient.get<DashboardSummary>('/dashboard/summary');
};

export const fetchSystemHealth = async () => {
  if (config.useMockData) {
    await apiClient.mockDelay(40);
    return {
      status: 'healthy',
      healthPercent: 98.7,
      uptimeSeconds: 849200,
    };
  }
  return apiClient.get<{ status: string; healthPercent: number; uptimeSeconds: number }>('/health');
};
