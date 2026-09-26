import { AuditLog } from '../types';

export const mockAuditLogs: AuditLog[] = [
  {
    id: 'AUD-9012',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    actor: 'Alex Chen (SRE)',
    action: 'Remediation Approved & Triggered',
    resource: 'INC-2026-00121 (VM-108)',
    resourceType: 'Remediation',
    status: 'success',
    details: 'Initiated connection pool recycling on Auth Service node VM-108.',
    ipAddress: '192.168.1.104'
  },
  {
    id: 'AUD-9011',
    timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    actor: 'CloudGuard ML Engine',
    action: 'P1 Incident Created',
    resource: 'INC-2026-00124 (VM-204)',
    resourceType: 'Incident',
    status: 'warning',
    details: 'Isolation Forest flagged anomaly score 0.91 on Payments API.',
    ipAddress: '10.0.0.1 (System)'
  },
  {
    id: 'AUD-9008',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    actor: 'Elena Rostova (Lead Ops)',
    action: 'Operator Feedback Submitted',
    resource: 'INC-2026-00115',
    resourceType: 'Feedback',
    status: 'info',
    details: 'Marked incident as False Positive with comment regarding scheduled ETL batch.',
    ipAddress: '192.168.1.112'
  },
  {
    id: 'AUD-9004',
    timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(),
    actor: 'David Miller (DevOps)',
    action: 'Model Retraining Requested',
    resource: 'Isolation Forest v1.3.2',
    resourceType: 'Model',
    status: 'success',
    details: 'Triggered retraining pipeline using 84,500 sample feedback corpus.',
    ipAddress: '192.168.1.108'
  },
  {
    id: 'AUD-8998',
    timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    actor: 'System Admin',
    action: 'Alert Threshold Updated',
    resource: 'Payments API Rule Set',
    resourceType: 'System',
    status: 'success',
    details: 'Updated anomaly baseline threshold sensitivity from 0.70 to 0.75.',
    ipAddress: '192.168.1.100'
  }
];
