import { DashboardSummary } from '../types';

export const mockDashboardSummary: DashboardSummary = {
  activeIncidents: 12,
  criticalIncidents: 2,
  anomaliesDetected: 47,
  affectedVMs: 8,
  remediationsToday: 19,
  systemHealthPercent: 98.7,
  cpuUsage: 62,
  memoryUsage: 71,
  diskUsage: 58,
  networkTrafficInMB: 1240,
  networkTrafficOutMB: 1890,
  latencyMs: 184,
  errorRatePercent: 1.8,
  lastUpdated: new Date().toISOString()
};
