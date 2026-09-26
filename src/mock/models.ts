import { ModelDetails } from '../types';

export const mockModels: ModelDetails[] = [
  {
    id: 'MOD-IF-01',
    name: 'Isolation Forest Anomaly Detector',
    type: 'Isolation Forest',
    category: 'Anomaly Detection',
    version: 'v1.3.2',
    status: 'Active',
    lastTrained: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    trainingSamplesCount: 84500,
    features: [
      'cpu_utilization_pct',
      'memory_utilization_pct',
      'disk_iops_read_write',
      'network_ingress_egress_ratio',
      'http_p99_latency_ms',
      'http_5xx_error_rate',
      'db_connection_pool_wait_ms',
      'jvm_gc_pause_duration_ms'
    ],
    threshold: 0.75,
    healthPercent: 98.4,
    lastEvaluationScore: 0.92,
    precision: 0.894,
    recall: 0.912,
    f1Score: 0.903
  },
  {
    id: 'MOD-RC-02',
    name: 'Remediation Action Classifier',
    type: 'Gradient Boosting',
    category: 'Remediation Classifier',
    version: 'v2.1.0',
    status: 'Active',
    lastTrained: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
    trainingSamplesCount: 14200,
    features: [
      'anomaly_score_continuous',
      'signal_primary_vector',
      'vm_instance_family',
      'application_criticality_tier',
      'historical_remediation_success_rate',
      'operator_approval_history_weight'
    ],
    threshold: 0.82,
    healthPercent: 97.8,
    lastEvaluationScore: 0.94,
    precision: 0.928,
    recall: 0.905,
    f1Score: 0.916
  }
];
