import os
import glob
import pandas as pd
from datetime import datetime

class StateDatabase:
  def __init__(self, dataset_dir: str):
    self.dataset_dir = dataset_dir
    self.incidents = []
    self.vms = []
    self.applications = []
    self.remediations = []
    self.feedback = []
    self.audit_logs = []
    self.initialized = False

  def _find_csv(self, pattern: str) -> str:
    matches = glob.glob(os.path.join(self.dataset_dir, "**", pattern), recursive=True)
    if matches:
      return matches[0]
    raise FileNotFoundError(f"Could not locate dataset CSV matching pattern '{pattern}' in {self.dataset_dir}")

  def initialize(self, ml_engine):
    mon_path = self._find_csv("vm_monitoring_10000.csv")
    evt_path = self._find_csv("vm_events_remedies_10000.csv")

    df_mon = pd.read_csv(mon_path)
    df_evt = pd.read_csv(evt_path)

    # 1. Populate VMs from monitoring dataset unique entries
    unique_vms = df_mon.drop_duplicates(subset=['vm_id']).head(12)
    self.vms = []
    for idx, row in unique_vms.iterrows():
      vm_id = str(row['vm_id']).upper()
      cpu = float(row.get('cpu_utilization_pct', 45.0))
      health = 'healthy'
      if cpu > 85 or float(row.get('memory_utilization_pct', 50.0)) > 85:
        health = 'critical'
      elif cpu > 70 or float(row.get('memory_utilization_pct', 50.0)) > 70:
        health = 'warning'

      self.vms.append({
        "id": vm_id,
        "name": f"{vm_id.lower()}-{row.get('application', 'app')}-prod-01.{row.get('region', 'us-east-1')}",
        "application": str(row.get('application', 'Payments API')).title(),
        "region": str(row.get('region', 'us-east-1')),
        "environment": str(row.get('environment', 'production')),
        "instanceType": str(row.get('instance_type', 'c5.xlarge')),
        "cpuPercent": round(cpu, 1),
        "memoryPercent": round(float(row.get('memory_utilization_pct', 60.0)), 1),
        "diskPercent": round(float(row.get('disk_utilization_pct', 50.0)), 1),
        "latencyMs": round(float(row.get('latency_ms', 45.0)), 1),
        "health": health,
        "lastUpdated": "10 sec ago",
        "activeIncidentsCount": 1 if health == 'critical' else 0,
        "ipAddress": f"10.0.{idx+10}.{idx+100}",
        "os": str(row.get('os', 'Ubuntu 22.04 LTS'))
      })

    # 2. Populate Applications
    unique_apps = df_mon['application'].unique()
    self.applications = []
    app_owners = {
      'payments': 'Checkout & Payments SRE',
      'authentication': 'Identity & Security',
      'catalog': 'Inventory & Catalog Tech',
      'search': 'Search & Relevance',
      'gateway': 'Edge Platform Ops',
      'orders': 'Order Fulfillment'
    }

    for app in unique_apps:
      app_str = str(app).title()
      app_vms = [v for v in self.vms if v['application'].lower() == app_str.lower()]
      health = 'healthy'
      if any(v['health'] == 'critical' for v in app_vms):
        health = 'critical'
      elif any(v['health'] == 'warning' for v in app_vms):
        health = 'warning'

      self.applications.append({
        "id": f"APP-{len(self.applications)+1:02d}",
        "name": f"{app_str} Service",
        "environment": "production",
        "health": health,
        "latencyMs": 820 if health == 'critical' else 45,
        "errorRatePercent": 14.2 if health == 'critical' else 0.2,
        "requestsPerSec": 1450,
        "affectedVMsCount": sum(1 for v in app_vms if v['health'] != 'healthy'),
        "totalVMsCount": max(2, len(app_vms)),
        "activeIncidentsCount": 1 if health == 'critical' else 0,
        "description": f"Core enterprise {app_str} microservice endpoint.",
        "ownerTeam": app_owners.get(str(app).lower(), 'Cloud Operations'),
        "version": "v2.18.4"
      })

    # 3. Populate Incidents from events dataset
    top_events = df_evt.head(5)
    self.incidents = []
    priorities = ['P1', 'P1', 'P2', 'P3', 'P4']
    severities = ['critical', 'critical', 'high', 'medium', 'low']

    for idx, row in top_events.iterrows():
      vm_id = str(row['vm_id']).upper()
      event_type = str(row['event_type'])
      prio = priorities[idx % len(priorities)]
      sev = severities[idx % len(severities)]
      status = 'active' if prio == 'P1' else ('investigating' if prio == 'P2' else 'resolved')

      feats = {
        'cpu_utilization_pct': 94.0 if prio == 'P1' else 55.0,
        'memory_utilization_pct': 91.0 if prio == 'P1' else 65.0,
        'disk_utilization_pct': 58.0,
        'network_in_mbps': 340.0,
        'network_out_mbps': 480.0,
        'disk_iops': 4200.0,
        'latency_ms': 820.0 if prio == 'P1' else 120.0,
        'packet_loss_pct': 1.4 if prio == 'P1' else 0.05,
        'temperature_c': 68.0
      }

      anomaly_score = ml_engine.predict_anomaly_score(feats)
      rec_remedy = ml_engine.predict_remediation(feats)

      self.incidents.append({
        "id": f"INC-2026-{124-idx:05d}",
        "title": f"{event_type} on host {vm_id}",
        "priority": prio,
        "severity": sev,
        "status": status,
        "vmId": vm_id,
        "vmName": f"{vm_id.lower()}-prod-01.us-east-1",
        "application": "Payments Service" if idx == 0 else "Auth Service",
        "environment": "production",
        "anomalyScore": anomaly_score,
        "detectedAt": datetime.now().isoformat(),
        "detectionConfidence": 0.96,
        "modelVersion": "IsolationForest-v1.4",
        "rootCauseSignals": [
          {"metric": "CPU Utilization", "value": "94%", "baseline": "45%", "change": "+108%", "isAnomaly": True, "unit": "%"},
          {"metric": "Memory Usage", "value": "91%", "baseline": "60%", "change": "+51%", "isAnomaly": True, "unit": "%"},
          {"metric": "Request Latency (p99)", "value": "820ms", "baseline": "120ms", "change": "+583%", "isAnomaly": True, "unit": "ms"},
          {"metric": "HTTP 5xx Error Rate", "value": "14.2%", "baseline": "0.2%", "change": "+7000%", "isAnomaly": True, "unit": "%"}
        ],
        "crossLayerCorrelation": {
          "vmLayer": {
            "metrics": ["CPU 94%", "Memory 91%", "Network Out 480 MB/s"],
            "description": f"Resource exhaustion on host {vm_id}"
          },
          "appLayer": {
            "metrics": ["Latency 820ms", "5xx Errors 14.2%"],
            "description": "Backpressure in processing queue"
          },
          "summary": f"Correlated infrastructure degradation: Compute saturation on {vm_id} causing upstream transaction timeouts."
        },
        "recommendedAction": rec_remedy,
        "remediationReason": f"Telemetry vector crossed anomaly threshold (0.75). Model recommends {rec_remedy}.",
        "riskLevel": "medium" if prio == 'P1' else "low",
        "requiresApproval": True if prio == 'P1' else False,
        "expectedOutcome": f"Restores node metrics to baseline within 3 minutes."
      })

    # 4. Initial Audit Logs
    self.audit_logs = [
      {
        "id": "AUD-9012",
        "timestamp": datetime.now().isoformat(),
        "actor": "Operations Specialist",
        "action": "Isolation Forest Initialized",
        "resource": "Dataset Corpus (10,000 samples)",
        "resourceType": "System",
        "status": "success",
        "details": f"Loaded dataset files from {mon_path}",
        "ipAddress": "127.0.0.1"
      }
    ]

    # 5. Initial Remediations
    self.remediations = [
      {
        "id": "REM-8921",
        "timestamp": datetime.now().isoformat(),
        "incidentId": "INC-2026-00121",
        "incidentTitle": "Database connection pool exhaustion",
        "action": "Recycle Connection Pool",
        "target": "VM-108 (Auth Service)",
        "requestedBy": "Automated Rule Policy",
        "approvalStatus": "auto_approved",
        "status": "completed",
        "durationSeconds": 14,
        "result": "Flushed stale socket handles. Auth latency returned to 45ms.",
        "details": "Purged connection pool via orchestration agent."
      }
    ]

    # 6. Initial Feedback
    self.feedback = [
      {
        "id": "FB-401",
        "incidentId": "INC-2026-00121",
        "incidentTitle": "Database connection pool exhaustion",
        "type": "true_positive",
        "comment": "Accurate detection. DB connections were locked up due to thread starvation.",
        "submittedBy": "Operations Specialist",
        "submittedAt": datetime.now().isoformat(),
        "vmId": "VM-108",
        "application": "Auth Service"
      }
    ]

    self.initialized = True
    print("[State Database] Initialized with dataset records.")
