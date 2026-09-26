import { apiClient } from './client';
import { config } from '../config/environment';
import { mockApplications } from '../mock/applications';
import { ApplicationItem } from '../types';

export const fetchApplications = async (): Promise<ApplicationItem[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(70);
    return [...mockApplications];
  }
  return apiClient.get<ApplicationItem[]>('/applications');
};
