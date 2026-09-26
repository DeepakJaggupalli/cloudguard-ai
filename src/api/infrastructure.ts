import { apiClient } from './client';
import { config } from '../config/environment';
import { mockVMs } from '../mock/infrastructure';
import { VMItem } from '../types';

export const fetchInfrastructureVMs = async (): Promise<VMItem[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(75);
    return [...mockVMs];
  }
  return apiClient.get<VMItem[]>('/vms');
};

export const fetchVMDetails = async (id: string): Promise<VMItem | undefined> => {
  if (config.useMockData) {
    await apiClient.mockDelay(50);
    return mockVMs.find((vm) => vm.id === id);
  }
  return apiClient.get<VMItem>(`/vms/${id}`);
};
