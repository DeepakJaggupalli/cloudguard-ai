import { apiClient } from './client';
import { config } from '../config/environment';
import { mockAuditLogs } from '../mock/auditLogs';
import { AuditLog } from '../types';

let stateAuditLogs: AuditLog[] = [...mockAuditLogs];

export const fetchAuditLogs = async (): Promise<AuditLog[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(70);
    return [...stateAuditLogs];
  }
  return apiClient.get<AuditLog[]>('/audit-logs');
};

export const logAuditEvent = (event: Omit<AuditLog, 'id' | 'timestamp'>) => {
  const newLog: AuditLog = {
    ...event,
    id: `AUD-${Math.floor(9100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString()
  };
  stateAuditLogs = [newLog, ...stateAuditLogs];
};
