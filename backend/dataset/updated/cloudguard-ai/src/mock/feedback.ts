import { FeedbackSummary, OperatorFeedback } from '../types';

export const mockRecentFeedback: OperatorFeedback[] = [
  {
    id: 'FB-401',
    incidentId: 'INC-2026-00121',
    incidentTitle: 'Database connection pool exhaustion',
    type: 'true_positive',
    comment: 'Accurate detection. DB connections were indeed locked up due to thread starvation.',
    submittedBy: 'Alex Chen (SRE)',
    submittedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    vmId: 'VM-108',
    application: 'Auth Service'
  },
  {
    id: 'FB-398',
    incidentId: 'INC-2026-00115',
    incidentTitle: 'Batch ETL memory usage spike',
    type: 'false_positive',
    comment: 'Scheduled nightly ETL job triggers high RAM usage naturally every Sunday 02:00 UTC.',
    submittedBy: 'Elena Rostova (Lead Ops)',
    submittedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    vmId: 'VM-604',
    application: 'Data Warehouse'
  },
  {
    id: 'FB-395',
    incidentId: 'INC-2026-00110',
    incidentTitle: 'Kafka consumer lag accumulation',
    type: 'true_positive',
    comment: 'Correct recommendation to scale out nodes. Prevented queue dropping messages.',
    submittedBy: 'David Miller (DevOps)',
    submittedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    vmId: 'VM-302',
    application: 'Order Queue'
  },
  {
    id: 'FB-390',
    incidentId: 'INC-2026-00104',
    incidentTitle: 'Staging API latency bump after canary deploy',
    type: 'true_positive',
    comment: 'Canary degradation correctly identified before impacting production.',
    submittedBy: 'Sarah Jenkins (Platform Eng)',
    submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    vmId: 'VM-902',
    application: 'Order Processing'
  }
];

export const mockFeedbackSummary: FeedbackSummary = {
  totalFeedback: 148,
  truePositives: 124,
  falsePositives: 24,
  feedbackRatePercent: 83.8,
  modelPrecisionBeforePercent: 82.1,
  modelPrecisionAfterPercent: 89.4,
  recentFeedback: mockRecentFeedback
};
