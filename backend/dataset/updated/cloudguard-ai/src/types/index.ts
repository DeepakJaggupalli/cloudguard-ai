export type Environment = 'production' | 'staging' | 'development';

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown' | 'offline';

export type Priority = 'P1' | 'P2' | 'P3' | 'P4';

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export type IncidentStatus = 'active' | 'investigating' | 'remediating' | 'resolved' | 'closed';

export type RemediationStatus = 'queued' | 'running' | 'completed' | 'failed' | 'rejected';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type TimeRange = '1m' | '5m' | '15m' | '1h' | '24h';

export interface DashboardSummary {
  activeIncidents: number;
  criticalIncidents: number;
  anomaliesDetected: number;
  affectedVMs: number;
  remediationsToday: number;
  systemHealthPercent: number;
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkTrafficInMB: number;
  networkTrafficOutMB: number;
  latencyMs: number;
  errorRatePercent: number;
  lastUpdated: string;
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface TelemetryPoint {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  networkIn: number;
  networkOut: number;
  iops: number;
  latency: number;
  packetLoss: number;
  temperature: number;
}

export interface Anomaly {
  id: string;
  timestamp: string;
  vmId: string;
  vmName: string;
  application: string;
  anomalyScore: number;
  affectedMetrics: string[];
  status: 'new' | 'investigating' | 'correlated' | 'resolved';
  confidence: number;
  detectionModel: string;
}

export interface RootCauseSignal {
  metric: string;
  value: string | number;
  baseline: string | number;
  change: string;
  isAnomaly: boolean;
  unit: string;
}

export interface CrossLayerCorrelation {
  vmLayer: {
    metrics: string[];
    description: string;
  };
  appLayer: {
    metrics: string[];
    description: string;
  };
  summary: string;
}

export interface Incident {
  id: string;
  title: string;
  priority: Priority;
  severity: Severity;
  status: IncidentStatus;
  vmId: string;
  vmName: string;
  application: string;
  environment: Environment;
  anomalyScore: number;
  detectedAt: string;
  rootCauseSignals: RootCauseSignal[];
  crossLayerCorrelation: CrossLayerCorrelation;
  recommendedAction: string;
  remediationReason: string;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  expectedOutcome: string;
  detectionConfidence: number;
  modelVersion: string;
  feedbackSubmitted?: 'true_positive' | 'false_positive';
  feedbackComment?: string;
}

export interface RemediationRecord {
  id: string;
  timestamp: string;
  incidentId: string;
  incidentTitle: string;
  action: string;
  target: string;
  requestedBy: string;
  approvalStatus: 'approved' | 'auto_approved' | 'rejected' | 'pending';
  status: RemediationStatus;
  durationSeconds: number;
  result: string;
  details?: string;
}

export interface OperatorFeedback {
  id: string;
  incidentId: string;
  incidentTitle: string;
  type: 'true_positive' | 'false_positive';
  comment: string;
  submittedBy: string;
  submittedAt: string;
  vmId: string;
  application: string;
}

export interface FeedbackSummary {
  totalFeedback: number;
  truePositives: number;
  falsePositives: number;
  feedbackRatePercent: number;
  modelPrecisionBeforePercent: number;
  modelPrecisionAfterPercent: number;
  recentFeedback: OperatorFeedback[];
}

export interface ModelDetails {
  id: string;
  name: string;
  type: 'Isolation Forest' | 'Random Forest' | 'Gradient Boosting';
  category: 'Anomaly Detection' | 'Remediation Classifier';
  version: string;
  status: 'Active' | 'Training' | 'Inactive';
  lastTrained: string;
  trainingSamplesCount: number;
  features: string[];
  threshold: number;
  healthPercent: number;
  lastEvaluationScore: number;
  precision: number;
  recall: number;
  f1Score: number;
}

export interface VMItem {
  id: string;
  name: string;
  application: string;
  region: string;
  environment: Environment;
  instanceType: string;
  cpuPercent: number;
  memoryPercent: number;
  diskPercent: number;
  latencyMs: number;
  health: HealthStatus;
  lastUpdated: string;
  activeIncidentsCount: number;
  ipAddress: string;
  os: string;
}

export interface ApplicationItem {
  id: string;
  name: string;
  environment: Environment;
  health: HealthStatus;
  latencyMs: number;
  errorRatePercent: number;
  requestsPerSec: number;
  affectedVMsCount: number;
  totalVMsCount: number;
  activeIncidentsCount: number;
  description: string;
  ownerTeam: string;
  version: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  resource: string;
  resourceType: 'Incident' | 'Remediation' | 'Model' | 'Feedback' | 'System';
  status: 'success' | 'failed' | 'warning' | 'info';
  details: string;
  ipAddress: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'p1_incident' | 'remediation_complete' | 'retrain_complete' | 'health_alert';
  read: boolean;
  incidentId?: string;
}

export interface GlobalSearchResult {
  incidents: Incident[];
  vms: VMItem[];
  applications: ApplicationItem[];
  remediations: RemediationRecord[];
}
