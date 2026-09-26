import { apiClient } from './client';
import { config } from '../config/environment';
import { generateMockTelemetry } from '../mock/telemetry';
import { TelemetryPoint, TimeRange } from '../types';

export const fetchTelemetryData = async (range: TimeRange = '15m'): Promise<TelemetryPoint[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(70);
    return generateMockTelemetry(range);
  }
  return apiClient.get<TelemetryPoint[]>(`/telemetry?range=${range}`);
};
