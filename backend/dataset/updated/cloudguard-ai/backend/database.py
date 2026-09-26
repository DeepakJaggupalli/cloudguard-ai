import os
import glob
import random
from datetime import datetime, timezone
import pandas as pd

from correlation import correlate, INFRA_METRICS, APP_METRICS


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
        self._incident_seq = 200

    def _find_csv(self, pattern: str) -> str:
        matches = glob.glob(os.path.join(self.dataset_dir, "**", pattern), recursive=True)
        if matches:
            return matches[0]
        raise FileNotFoundError(f"Could not locate dataset CSV matching pattern '{pattern}' in {self.dataset_dir}")

    def initialize(self, ml_engine):
        try:
            mon_path = self._find_csv("vm_monitoring_train_8000.csv")
            evt_path = self._find_csv("vm_events_remedies_train_8000.csv")
        except FileNotFoundError:
            mon_path = self._find_csv("vm_monitoring_10000.csv")
            evt_path = self._find_csv("vm_events_remedies_10000.csv")

        df_mon = pd.read_csv(mon_path)
        df_evt = pd.read_csv(evt_path)

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

        unique_apps = df_mon['application'].unique()
        self.applications = []
        app_owners = {
            'payments': 'Checkout & Payments SRE',
            'authentication': 'Identity & Security',
            'catalog': 'Inventory & Catalog Tech',
            'search': 'Search & Relevance',
            'gateway': 'Edge Platform Ops',
            'orders': 'Order Fulfillment',
            'database': 'Data Platform',
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

        # Seed 3 real incidents (via priority/correlation engines) so the
        # dashboard isn't empty before the live ingestion loop kicks in.
        self.incidents = []
        seed_rows = df_mon[df_mon.get('health_status', 'healthy') != 'healthy'].head(3) if 'health_status' in df_mon.columns else df_mon.head(3)
        for _, row in seed_rows.iterrows():
            feats = {col: float(row.get(col, 50.0)) for col in ml_engine.feature_cols}
            feats["error_rate_pct"] = 8.0
            score = ml_engine.predict_anomaly_score(feats)
            self.create_incident_from_scoring(row.get('vm_id', 'vm-000'), row.get('application', 'payments'), feats, score, ml_engine, force=True)

        self.audit_logs = [{
            "id": "AUD-9012",
            "timestamp": datetime.now().isoformat(),
            "actor": "System",
            "action": "ML Models Initialized",
            "resource": "Dataset Corpus (train split)",
            "resourceType": "System",
            "status": "success",
            "details": f"Loaded dataset files from {mon_path}",
            "ipAddress": "127.0.0.1"
        }]
        self.remediations = []
        self.feedback = []
        self.initialized = True
        print("[State Database] Initialized with dataset records.")

    def create_incident_from_scoring(self, vm_id, application, features: dict, anomaly_score: float,
                                      ml_engine, priority_engine=None, force: bool = False):
        """
        Called by the live ingestion loop (and at startup for seeding).
        Uses PriorityEngine to classify and correlation.py to build
        rootCauseSignals / crossLayerCorrelation. Returns the incident
        dict if one was created, else None (below threshold).
        """
        from priority_engine import PriorityEngine
        pe = priority_engine
        classification = None
        if pe is not None:
            classification = pe.classify(features, anomaly_score)
        if classification is None and not force:
            return None
        if classification is None:
            classification = {"priority": "P3", "severity": "medium", "reason": "Seed incident"}

        vm_id_u = str(vm_id).upper()
        breach_thresholds = {
            "cpu_utilization_pct": 80, "memory_utilization_pct": 80, "disk_utilization_pct": 85,
            "network_in_mbps": 500, "network_out_mbps": 500, "disk_iops": 5000,
            "latency_ms": 400, "packet_loss_pct": 1.0, "temperature_c": 70, "error_rate_pct": 5,
        }
        corr = correlate(features, ml_engine.baseline_stats, breach_thresholds)

        self._incident_seq += 1
        rec_remedy = ml_engine.predict_remediation(features)
        status = "active" if classification["priority"] in ("P1", "P2") else "investigating"

        incident = {
            "id": f"INC-2026-{self._incident_seq:05d}",
            "title": f"{'Cross-layer' if corr['crossLayerCorrelation']['isCrossLayer'] else classification['severity'].title()} anomaly on host {vm_id_u}",
            "priority": classification["priority"],
            "severity": classification["severity"],
            "status": status,
            "vmId": vm_id_u,
            "vmName": f"{vm_id_u.lower()}-prod-01.us-east-1",
            "application": str(application).title(),
            "environment": "production",
            "anomalyScore": anomaly_score,
            "detectedAt": datetime.now(timezone.utc).isoformat(),
            "detectionConfidence": round(min(0.99, anomaly_score + 0.1), 2),
            "modelVersion": f"IsolationForest-{ml_engine.model_version}",
            "rootCauseSignals": corr["rootCauseSignals"],
            "crossLayerCorrelation": corr["crossLayerCorrelation"],
            "recommendedAction": rec_remedy,
            "remediationReason": f"{classification['reason']}. Model recommends {rec_remedy}.",
            "riskLevel": "medium" if classification["priority"] in ("P1", "P2") else "low",
            "requiresApproval": classification["priority"] in ("P1", "P2"),
            "expectedOutcome": "Restores node metrics to baseline within 3 minutes.",
        }
        self.incidents.insert(0, incident)
        self.incidents = self.incidents[:200]  # cap for demo memory
        return incident
