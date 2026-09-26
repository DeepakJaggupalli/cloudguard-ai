import { Incident } from '../types';

export const mockIncidents: Incident[] = [
  {
    id: 'INC-2026-00124',
    title: 'Payment service degradation and response timeout',
    priority: 'P1',
    severity: 'critical',
    status: 'active',
    vmId: 'VM-204',
    vmName: 'vm-payments-prod-04.us-east-1',
    application: 'Payments API',
    environment: 'production',
    anomalyScore: 0.91,
    detectedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    detectionConfidence: 0.96,
    modelVersion: 'IsolationForest-v1.3',
    rootCauseSignals: [
      { metric: 'CPU Utilization', value: '94%', baseline: '45%', change: '+108%', isAnomaly: true, unit: '%' },
      { metric: 'Memory Usage', value: '91%', baseline: '60%', change: '+51%', isAnomaly: true, unit: '%' },
      { metric: 'Request Latency (p99)', value: '820ms', baseline: '120ms', change: '+583%', isAnomaly: true, unit: 'ms' },
      { metric: 'HTTP 5xx Error Rate', value: '14.2%', baseline: '0.2%', change: '+7000%', isAnomaly: true, unit: '%' },
      { metric: 'Disk IOPS', value: '4200', baseline: '1200', change: '+250%', isAnomaly: false, unit: 'iops' }
    ],
    crossLayerCorrelation: {
      vmLayer: {
        metrics: ['CPU 94%', 'Memory 91%', 'Network Out 480 MB/s'],
        description: 'Resource exhaustion and thread pool saturation on VM host'
      },
      appLayer: {
        metrics: ['Latency 820ms', '5xx Errors 14.2%', 'Connection Timeouts 182/s'],
        description: 'Payments processing queue backpressure and API gateway failures'
      },
      summary: 'Correlated Infrastructure-to-Application degradation: High compute load on VM-204 causing upstream payment transaction dropouts.'
    },
    recommendedAction: 'Scale Out VM Instance',
    remediationReason: 'CPU utilization (94%) and p99 latency (820ms) crossed multi-dimensional anomaly baseline threshold (0.85). Model predicts node scale-out will restore latency to <150ms within 3 minutes.',
    riskLevel: 'medium',
    requiresApproval: true,
    expectedOutcome: 'Provisions +2 auto-scaling instances and shifts 40% ingress traffic, reducing node CPU to ~42%.'
  },
  {
    id: 'INC-2026-00121',
    title: 'Database connection pool exhaustion',
    priority: 'P1',
    severity: 'critical',
    status: 'investigating',
    vmId: 'VM-108',
    vmName: 'vm-auth-prod-01.us-east-1',
    application: 'Auth Service',
    environment: 'production',
    anomalyScore: 0.88,
    detectedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    detectionConfidence: 0.94,
    modelVersion: 'IsolationForest-v1.3',
    rootCauseSignals: [
      { metric: 'Active DB Connections', value: '498/500', baseline: '120', change: '+315%', isAnomaly: true, unit: 'conns' },
      { metric: 'CPU Utilization', value: '88%', baseline: '35%', change: '+151%', isAnomaly: true, unit: '%' },
      { metric: 'Authentication Latency', value: '640ms', baseline: '45ms', change: '+1322%', isAnomaly: true, unit: 'ms' }
    ],
    crossLayerCorrelation: {
      vmLayer: {
        metrics: ['Network In 620 MB/s', 'Memory 85%'],
        description: 'Spike in socket handles and inbound TCP sessions'
      },
      appLayer: {
        metrics: ['Auth Token Delay', 'DB Pool Wait Time >5s'],
        description: 'Stale connection leak following token validation surge'
      },
      summary: 'DB pool bottleneck causing cascading authentication delays.'
    },
    recommendedAction: 'Recycle Connection Pool & Increase Max Limit',
    remediationReason: 'Connection pool saturation. Flushing stale idle handles will release 60% of blocked threads immediately.',
    riskLevel: 'low',
    requiresApproval: false,
    expectedOutcome: 'Frees ~320 dead DB connections, lowering auth latency to baseline (45ms).'
  },
  {
    id: 'INC-2026-00118',
    title: 'Memory leak in catalog indexing worker',
    priority: 'P2',
    severity: 'high',
    status: 'active',
    vmId: 'VM-312',
    vmName: 'vm-catalog-prod-02.us-west-2',
    application: 'Catalog Engine',
    environment: 'production',
    anomalyScore: 0.79,
    detectedAt: new Date(Date.now() - 110 * 60 * 1000).toISOString(),
    detectionConfidence: 0.91,
    modelVersion: 'IsolationForest-v1.3',
    rootCauseSignals: [
      { metric: 'Heap Memory Allocation', value: '96%', baseline: '62%', change: '+54%', isAnomaly: true, unit: '%' },
      { metric: 'GC Pause Duration', value: '1420ms', baseline: '40ms', change: '+3450%', isAnomaly: true, unit: 'ms' }
    ],
    crossLayerCorrelation: {
      vmLayer: {
        metrics: ['RAM 96%', 'Swap Usage 18%'],
        description: 'Continuous memory consumption growth without release'
      },
      appLayer: {
        metrics: ['Index Job Delay', 'GC Stop-The-World Spikes'],
        description: 'Unbounded heap allocation in cache indexing module'
      },
      summary: 'Heap pressure leading to frequent GC pauses on VM-312.'
    },
    recommendedAction: 'Restart Service Container',
    remediationReason: 'Linear memory growth over 6 hours indicates heap leak. Rolling restart of worker will reset heap.',
    riskLevel: 'medium',
    requiresApproval: true,
    expectedOutcome: 'Resets JVM memory to 25% allocation.'
  },
  {
    id: 'INC-2026-00112',
    title: 'Storage throughput throttling on search cluster',
    priority: 'P3',
    severity: 'medium',
    status: 'remediating',
    vmId: 'VM-401',
    vmName: 'vm-search-prod-01.eu-central-1',
    application: 'Search Indexer',
    environment: 'production',
    anomalyScore: 0.68,
    detectedAt: new Date(Date.now() - 240 * 60 * 1000).toISOString(),
    detectionConfidence: 0.87,
    modelVersion: 'IsolationForest-v1.3',
    rootCauseSignals: [
      { metric: 'Disk Read Latency', value: '38ms', baseline: '4ms', change: '+850%', isAnomaly: true, unit: 'ms' },
      { metric: 'EBS Burst Balance', value: '12%', baseline: '100%', change: '-88%', isAnomaly: true, unit: '%' }
    ],
    crossLayerCorrelation: {
      vmLayer: {
        metrics: ['IOPS 5000 (Max)', 'I/O Wait 24%'],
        description: 'EBS volume burst balance depleted'
      },
      appLayer: {
        metrics: ['Search Query Timeout', 'Index Write Backlog'],
        description: 'Read operations queueing up waiting for disk I/O'
      },
      summary: 'Storage IOPS limit hit on search node.'
    },
    recommendedAction: 'Modify Storage Volume Provisioned IOPS',
    remediationReason: 'EBS burst depletion. Increasing IOPS allowance will remove read bottleneck.',
    riskLevel: 'low',
    requiresApproval: true,
    expectedOutcome: 'Restores volume burst credits and lowers read latency to 4ms.'
  },
  {
    id: 'INC-2026-00104',
    title: 'Staging API latency bump after canary deploy',
    priority: 'P4',
    severity: 'low',
    status: 'resolved',
    vmId: 'VM-902',
    vmName: 'vm-orders-stg-01.us-east-1',
    application: 'Order Processing',
    environment: 'staging',
    anomalyScore: 0.54,
    detectedAt: new Date(Date.now() - 600 * 60 * 1000).toISOString(),
    detectionConfidence: 0.82,
    modelVersion: 'IsolationForest-v1.3',
    rootCauseSignals: [
      { metric: 'CPU Utilization', value: '58%', baseline: '30%', change: '+93%', isAnomaly: true, unit: '%' }
    ],
    crossLayerCorrelation: {
      vmLayer: { metrics: ['CPU 58%'], description: 'Increased processing load' },
      appLayer: { metrics: ['Latency 190ms'], description: 'Canary test payload processing' },
      summary: 'Normal load variation associated with canary verification run.'
    },
    recommendedAction: 'Rollback Deployment',
    remediationReason: 'Minor performance delta after deployment.',
    riskLevel: 'low',
    requiresApproval: false,
    expectedOutcome: 'Reverts staging service build to previous commit.'
  }
];
