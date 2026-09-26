import { RemediationRecord } from '../types';

export const mockRemediations: RemediationRecord[] = [
  {
    id: 'REM-8921',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    incidentId: 'INC-2026-00121',
    incidentTitle: 'Database connection pool exhaustion',
    action: 'Recycle Connection Pool',
    target: 'VM-108 (Auth Service)',
    requestedBy: 'System Auto-Rule (P1 Low-Risk)',
    approvalStatus: 'auto_approved',
    status: 'completed',
    durationSeconds: 14,
    result: 'Flushed 320 stale connections. Pool latency returned to 45ms.',
    details: 'Triggered pool purge via JMX endpoint. Node health restored.'
  },
  {
    id: 'REM-8919',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    incidentId: 'INC-2026-00114',
    incidentTitle: 'Nginx buffer overflow in web tier',
    action: 'Restart Service',
    target: 'VM-101 (API Gateway)',
    requestedBy: 'Alex Chen (Senior SRE)',
    approvalStatus: 'approved',
    status: 'completed',
    durationSeconds: 28,
    result: 'Nginx process restarted smoothly. Buffer dropped to 4%.',
    details: 'Graceful worker reload executed with zero dropped TCP connections.'
  },
  {
    id: 'REM-8912',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    incidentId: 'INC-2026-00110',
    incidentTitle: 'Kafka consumer lag accumulation',
    action: 'Scale Out Worker Nodes',
    target: 'VM-302, VM-303 (Order Queue)',
    requestedBy: 'Elena Rostova (Lead Ops)',
    approvalStatus: 'approved',
    status: 'completed',
    durationSeconds: 84,
    result: 'Added 2 consumer instances. Lag decreased from 42k to 120 msgs.',
    details: 'Kubernetes deployment replica count bumped from 4 to 6.'
  },
  {
    id: 'REM-8905',
    timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
    incidentId: 'INC-2026-00104',
    incidentTitle: 'Staging API latency bump after canary deploy',
    action: 'Rollback Deployment',
    target: 'VM-902 (Order Processing)',
    requestedBy: 'CI/CD Pipeline Bot',
    approvalStatus: 'auto_approved',
    status: 'completed',
    durationSeconds: 42,
    result: 'Reverted artifact to commit #e4f9b1. Latency stabilized.',
    details: 'Automated canary failure hook invoked rollback.'
  },
  {
    id: 'REM-8898',
    timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000).toISOString(),
    incidentId: 'INC-2026-00098',
    incidentTitle: 'High memory usage on secondary redis replica',
    action: 'Flush Cache & Warm',
    target: 'VM-501 (Session Store)',
    requestedBy: 'David Miller (DevOps)',
    approvalStatus: 'rejected',
    status: 'rejected',
    durationSeconds: 0,
    result: 'Operator rejected remediation due to ongoing promotion campaign.',
    details: 'Alternative failover initiated manually.'
  }
];
