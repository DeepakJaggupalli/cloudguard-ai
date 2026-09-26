import { apiClient } from './client';
import { config } from '../config/environment';
import { mockRemediations } from '../mock/remediation';
import { RemediationRecord } from '../types';

let stateRemediations: RemediationRecord[] = [...mockRemediations];

export const fetchRemediationHistory = async (): Promise<RemediationRecord[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(80);
    return [...stateRemediations];
  }
  return apiClient.get<RemediationRecord[]>('/remediations');
};

export const executeRemediationAction = async (payload: {
  incidentId: string;
  incidentTitle: string;
  action: string;
  target: string;
  requestedBy: string;
}): Promise<RemediationRecord> => {
  if (config.useMockData) {
    await apiClient.mockDelay(1500); // Simulate backend orchestration workflow
    const newRecord: RemediationRecord = {
      id: `REM-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toISOString(),
      incidentId: payload.incidentId,
      incidentTitle: payload.incidentTitle,
      action: payload.action,
      target: payload.target,
      requestedBy: payload.requestedBy || 'Operator (Manual Approval)',
      approvalStatus: 'approved',
      status: 'completed',
      durationSeconds: 18,
      result: `Remediation executed successfully for ${payload.target}. Baseline performance re-established.`,
      details: `Dispatched automated self-healing script via Ansible runner.`
    };
    stateRemediations = [newRecord, ...stateRemediations];
    return newRecord;
  }

  return apiClient.post<RemediationRecord>(`/incidents/${payload.incidentId}/remediate`, payload);
};
