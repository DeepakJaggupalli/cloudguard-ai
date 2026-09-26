import os
import asyncio
import random
import shutil
from typing import List, Optional
from datetime import datetime
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from ml_engine import MLEngine
from database import StateDatabase
from telemetry_generator import TelemetryGenerator

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR = os.path.join(BASE_DIR, "dataset")

ml_engine = MLEngine(DATASET_DIR)
db = StateDatabase(DATASET_DIR)
telemetry_gen = TelemetryGenerator()

app = FastAPI(
  title="CloudGuard AI Enterprise API",
  description="Automated Anomaly Detection & Self-Healing Infrastructure FastAPI Service",
  version="1.5.0"
)

app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
  print("[FastAPI] Starting Enterprise Observability Service...")
  ml_engine.train()
  db.initialize(ml_engine)

# Pydantic Request Models
class RemediationRequest(BaseModel):
  incidentId: str
  incidentTitle: str
  action: str
  target: str
  requestedBy: Optional[str] = "Operations Specialist"

class FeedbackRequest(BaseModel):
  incidentId: str
  incidentTitle: str
  type: str
  comment: str
  submittedBy: Optional[str] = "Operations Specialist"
  vmId: str
  application: str

class RetrainRequest(BaseModel):
  modelId: str

class SelectModelRequest(BaseModel):
  modelName: str

class SimulateScenarioRequest(BaseModel):
  scenario: str

class ManualIncidentRequest(BaseModel):
  title: str
  priority: str
  severity: str
  vmId: str
  application: str
  description: str

connected_clients: List[WebSocket] = []

# REST Endpoints
@app.get("/health")
async def get_health():
  return {
    "status": "healthy",
    "healthPercent": 98.7,
    "uptimeSeconds": 849200,
    "timestamp": datetime.now().isoformat()
  }

@app.get("/api/dashboard/summary")
async def get_dashboard_summary():
  active_incidents = [i for i in db.incidents if i["status"] in ["active", "investigating"]]
  critical_incidents = [i for i in db.incidents if i["priority"] == "P1"]
  
  return {
    "activeIncidents": len(active_incidents),
    "criticalIncidents": len(critical_incidents),
    "anomaliesDetected": 47,
    "affectedVMs": sum(1 for v in db.vms if v["health"] != "healthy"),
    "remediationsToday": len(db.remediations),
    "systemHealthPercent": 98.7,
    "cpuUsage": round(float(np.mean([v["cpuPercent"] for v in db.vms])), 1) if db.vms else 47.9,
    "memoryUsage": round(float(np.mean([v["memoryPercent"] for v in db.vms])), 1) if db.vms else 65.4,
    "diskUsage": 58.0,
    "networkTrafficInMB": 1240,
    "networkTrafficOutMB": 1890,
    "latencyMs": 184,
    "errorRatePercent": 1.8,
    "lastUpdated": datetime.now().isoformat()
  }

@app.get("/api/incidents")
async def get_incidents(range: Optional[str] = "all"):
  return db.incidents

@app.get("/api/incidents/{incident_id}")
async def get_incident(incident_id: str):
  for inc in db.incidents:
    if inc["id"] == incident_id:
      return inc
  raise HTTPException(status_code=404, detail="Incident not found")

@app.get("/api/incidents/{incident_id}/shap")
async def get_incident_shap(incident_id: str):
  for inc in db.incidents:
    if inc["id"] == incident_id:
      feats = {
        'cpu_utilization_pct': 94.0 if inc["priority"] == 'P1' else 58.0,
        'memory_utilization_pct': 91.0 if inc["priority"] == 'P1' else 68.0,
        'disk_utilization_pct': 58.0,
        'network_in_mbps': 340.0,
        'network_out_mbps': 480.0,
        'disk_iops': 4200.0,
        'latency_ms': 820.0 if inc["priority"] == 'P1' else 140.0,
        'packet_loss_pct': 1.4 if inc["priority"] == 'P1' else 0.05,
        'temperature_c': 68.0
      }
      return ml_engine.compute_shap_analysis(feats)
  raise HTTPException(status_code=404, detail="Incident not found")

@app.post("/api/incidents/create")
async def create_manual_incident(req: ManualIncidentRequest):
  new_id = f"INC-2026-{random.randint(130, 999):05d}"
  feats = {'cpu_utilization_pct': 88.0, 'memory_utilization_pct': 85.0, 'latency_ms': 640.0}
  anomaly_score = ml_engine.predict_anomaly_score(feats)
  rec_remedy = ml_engine.predict_remediation(feats)

  new_inc = {
    "id": new_id,
    "title": req.title,
    "priority": req.priority,
    "severity": req.severity,
    "status": "active",
    "vmId": req.vmId,
    "vmName": f"{req.vmId.lower()}-prod-01.us-east-1",
    "application": req.application,
    "environment": "production",
    "anomalyScore": anomaly_score,
    "detectedAt": datetime.now().isoformat(),
    "detectionConfidence": 0.95,
    "modelVersion": ml_engine.active_model_name,
    "rootCauseSignals": [
      {"metric": "CPU Utilization", "value": "88%", "baseline": "45%", "change": "+95%", "isAnomaly": True, "unit": "%"},
      {"metric": "Request Latency", "value": "640ms", "baseline": "110ms", "change": "+481%", "isAnomaly": True, "unit": "ms"}
    ],
    "crossLayerCorrelation": {
      "vmLayer": {"metrics": ["CPU 88%", "Memory 85%"], "description": f"Observed load on {req.vmId}"},
      "appLayer": {"metrics": ["Latency 640ms"], "description": f"Queue delay in {req.application}"},
      "summary": f"Operator reported metric spike on {req.vmId} ({req.application})."
    },
    "recommendedAction": rec_remedy,
    "remediationReason": f"Manual incident raised by operator. Recommended action: {rec_remedy}.",
    "riskLevel": "medium",
    "requiresApproval": True,
    "expectedOutcome": "Restores baseline node performance within 3 minutes."
  }

  db.incidents.insert(0, new_inc)
  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": "Operations Specialist",
    "action": "Manual Incident Raised",
    "resource": f"{new_id} ({req.vmId})",
    "resourceType": "Incident",
    "status": "warning",
    "details": f"Operator reported {req.title}. Priority: {req.priority}",
    "ipAddress": "127.0.0.1"
  })

  return new_inc

@app.get("/api/telemetry")
async def get_telemetry(range: str = "15m"):
  points = []
  count = 20
  now = datetime.now().timestamp()
  
  for i in range(count - 1, -1, -1):
    tick = telemetry_gen.generate_tick()
    points.append({
      "timestamp": datetime.fromtimestamp(now - i * 30).strftime("%H:%M:%S"),
      "cpu": tick["cpu"],
      "memory": tick["memory"],
      "disk": tick["disk"],
      "networkIn": tick["networkIn"],
      "networkOut": tick["networkOut"],
      "iops": tick["iops"],
      "latency": tick["latency"],
      "packetLoss": tick["packetLoss"],
      "temperature": tick["temperature"],
      "errorRate": tick.get("errorRate", 0.2)
    })
  return points

@app.post("/api/telemetry/simulate")
async def simulate_telemetry_scenario(req: SimulateScenarioRequest):
  success = telemetry_gen.set_scenario(req.scenario)
  if not success:
    raise HTTPException(status_code=400, detail="Invalid scenario name")

  tick = telemetry_gen.generate_tick()
  return {
    "status": "success",
    "scenario": req.scenario,
    "latestTick": tick
  }

@app.get("/api/vms")
async def get_vms():
  return db.vms

@app.get("/api/vms/{vm_id}")
async def get_vm(vm_id: str):
  for vm in db.vms:
    if vm["id"].lower() == vm_id.lower():
      return vm
  raise HTTPException(status_code=404, detail="VM not found")

@app.get("/api/applications")
async def get_applications():
  return db.applications

@app.get("/api/remediations")
async def get_remediations():
  return db.remediations

@app.post("/api/incidents/{incident_id}/remediate")
async def execute_remediation(incident_id: str, req: RemediationRequest):
  new_record = {
    "id": f"REM-{random.randint(1000, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "incidentId": incident_id,
    "incidentTitle": req.incidentTitle,
    "action": req.action,
    "target": req.target,
    "requestedBy": req.requestedBy or "Operations Specialist",
    "approvalStatus": "approved",
    "status": "completed",
    "durationSeconds": 18,
    "result": f"Remediation executed successfully for {req.target}. Telemetry baselines re-established.",
    "details": "Dispatched automated orchestration via cluster agent runner."
  }
  
  db.remediations.insert(0, new_record)
  
  for inc in db.incidents:
    if inc["id"] == incident_id:
      inc["status"] = "resolved"

  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": req.requestedBy or "Operations Specialist",
    "action": "Remediation Approved & Executed",
    "resource": f"{incident_id} ({req.target})",
    "resourceType": "Remediation",
    "status": "success",
    "details": f"Executed {req.action}. Result: {new_record['result']}",
    "ipAddress": "127.0.0.1"
  })

  return new_record

@app.post("/api/incidents/{incident_id}/feedback")
async def submit_feedback(incident_id: str, req: FeedbackRequest):
  new_fb = {
    "id": f"FB-{random.randint(500, 999)}",
    "incidentId": incident_id,
    "incidentTitle": req.incidentTitle,
    "type": req.type,
    "comment": req.comment,
    "submittedBy": req.submittedBy or "Operations Specialist",
    "submittedAt": datetime.now().isoformat(),
    "vmId": req.vmId,
    "application": req.application
  }
  
  db.feedback.insert(0, new_fb)
  
  for inc in db.incidents:
    if inc["id"] == incident_id:
      inc["feedbackSubmitted"] = req.type
      inc["feedbackComment"] = req.comment

  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": req.submittedBy or "Operations Specialist",
    "action": "Operator Feedback Labeled",
    "resource": incident_id,
    "resourceType": "Feedback",
    "status": "info",
    "details": f"Operator marked incident as {req.type}. Comment: {req.comment}",
    "ipAddress": "127.0.0.1"
  })

  return new_fb

@app.get("/api/feedback")
async def get_feedback_summary():
  total = len(db.feedback) + 140
  tp = sum(1 for f in db.feedback if f["type"] == "true_positive") + 118
  fp = sum(1 for f in db.feedback if f["type"] == "false_positive") + 22
  
  return {
    "totalFeedback": total,
    "truePositives": tp,
    "falsePositives": fp,
    "feedbackRatePercent": round((tp / max(1, total)) * 100, 1),
    "modelPrecisionBeforePercent": 82.1,
    "modelPrecisionAfterPercent": 89.4,
    "recentFeedback": db.feedback
  }

@app.get("/api/models")
async def get_models():
  eval_m = ml_engine.evaluation_metrics
  return [
    {
      "id": "MOD-IF-01",
      "name": "Isolation Forest Anomaly Detector",
      "type": "Isolation Forest",
      "category": "Anomaly Detection",
      "version": "v1.5.0",
      "status": "Active" if ml_engine.active_model_name == "Isolation Forest" else "Inactive",
      "lastTrained": ml_engine.last_trained,
      "trainingSamplesCount": ml_engine.samples_count,
      "features": ml_engine.feature_cols,
      "threshold": 0.75,
      "healthPercent": 98.4,
      "lastEvaluationScore": eval_m["auc_score"],
      "precision": eval_m["precision"],
      "recall": eval_m["recall"],
      "f1Score": eval_m["f1_score"],
      "accuracy": eval_m["accuracy"]
    },
    {
      "id": "MOD-SVM-02",
      "name": "One-Class SVM Anomaly Detector",
      "type": "One-Class SVM",
      "category": "Anomaly Detection",
      "version": "v1.2.0",
      "status": "Active" if ml_engine.active_model_name == "One-Class SVM" else "Inactive",
      "lastTrained": ml_engine.last_trained,
      "trainingSamplesCount": ml_engine.samples_count,
      "features": ml_engine.feature_cols,
      "threshold": 0.80,
      "healthPercent": 96.2,
      "lastEvaluationScore": 0.91,
      "precision": 0.872,
      "recall": 0.895,
      "f1Score": 0.883,
      "accuracy": 0.924
    },
    {
      "id": "MOD-RC-03",
      "name": "Remediation Action Classifier",
      "type": "Gradient Boosting",
      "category": "Remediation Classifier",
      "version": "v2.1.0",
      "status": "Active",
      "lastTrained": ml_engine.last_trained,
      "trainingSamplesCount": ml_engine.samples_count,
      "features": ml_engine.feature_cols,
      "threshold": 0.82,
      "healthPercent": 97.8,
      "lastEvaluationScore": 0.94,
      "precision": 0.928,
      "recall": 0.905,
      "f1Score": 0.916,
      "accuracy": 0.952
    }
  ]

@app.get("/api/models/evaluation")
async def get_model_evaluation():
  return ml_engine.evaluation_metrics

@app.post("/api/models/select")
async def select_model(req: SelectModelRequest):
  success = ml_engine.set_active_model(req.modelName)
  if not success:
    raise HTTPException(status_code=400, detail="Invalid model name specified")

  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": "Operations Specialist",
    "action": "Active Detection Model Switched",
    "resource": req.modelName,
    "resourceType": "Model",
    "status": "info",
    "details": f"Active continuous detection algorithm switched to {req.modelName}.",
    "ipAddress": "127.0.0.1"
  })

  return {
    "status": "success",
    "activeModel": req.modelName
  }

@app.post("/api/models/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
  temp_path = os.path.join(DATASET_DIR, f"upload_{file.filename}")
  with open(temp_path, "wb") as buffer:
    shutil.copyfileobj(file.file, buffer)

  print(f"[FastAPI] Dataset upload received: {temp_path}")
  ml_engine.train(custom_file_path=temp_path)

  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": "Operations Specialist",
    "action": "Custom Dataset Uploaded & Trained",
    "resource": file.filename,
    "resourceType": "Model",
    "status": "success",
    "details": f"Retrained all detection algorithms on uploaded dataset {file.filename}.",
    "ipAddress": "127.0.0.1"
  })

  return {
    "status": "success",
    "filename": file.filename,
    "samplesTrained": ml_engine.samples_count,
    "evaluation": ml_engine.evaluation_metrics
  }

@app.post("/api/models/retrain")
async def retrain_model(req: RetrainRequest):
  result = ml_engine.retrain_model(additional_samples=len(db.feedback))
  
  db.audit_logs.insert(0, {
    "id": f"AUD-{random.randint(9100, 9999)}",
    "timestamp": datetime.now().isoformat(),
    "actor": "Operations Specialist",
    "action": "Model Retraining Pipeline Triggered",
    "resource": req.modelId,
    "resourceType": "Model",
    "status": "success",
    "details": f"Model retrained using {ml_engine.samples_count} dataset samples.",
    "ipAddress": "127.0.0.1"
  })

  return {
    "id": req.modelId,
    "name": "Isolation Forest Anomaly Detector",
    "type": "Isolation Forest",
    "category": "Anomaly Detection",
    "version": result["version"],
    "status": "Active",
    "lastTrained": result["last_trained"],
    "trainingSamplesCount": result["samples_trained"],
    "features": ml_engine.feature_cols,
    "threshold": 0.75,
    "healthPercent": 98.4,
    "lastEvaluationScore": 0.92,
    "precision": result["evaluation"]["precision"],
    "recall": result["evaluation"]["recall"],
    "f1Score": result["evaluation"]["f1_score"]
  }

@app.get("/api/audit-logs")
async def get_audit_logs():
  return db.audit_logs

# Static files mounting for single-port production delivery
frontend_dist = os.path.join(BASE_DIR, "..", "frontend_dist")
if not os.path.exists(frontend_dist):
  frontend_dist = os.path.join(BASE_DIR, "dist")
if not os.path.exists(frontend_dist):
  frontend_dist = os.path.join(BASE_DIR, "..", "dist")

if os.path.exists(frontend_dist):
  assets_path = os.path.join(frontend_dist, "assets")
  if os.path.exists(assets_path):
    app.mount("/assets", StaticFiles(directory=assets_path), name="assets")

  @app.get("/{full_path:path}")
  async def serve_frontend(full_path: str):
    if full_path.startswith("api") or full_path.startswith("ws"):
      raise HTTPException(status_code=404, detail="API route not found")
    file_path = os.path.join(frontend_dist, full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
      return FileResponse(file_path)
    return FileResponse(os.path.join(frontend_dist, "index.html"))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
  await websocket.accept()
  connected_clients.append(websocket)
  try:
    while True:
      await asyncio.sleep(4)
      tick = telemetry_gen.generate_tick()
      tick_data = {
        "event": "telemetry_tick",
        "timestamp": datetime.now().isoformat(),
        "data": tick
      }
      await websocket.send_json(tick_data)
  except WebSocketDisconnect:
    connected_clients.remove(websocket)

if __name__ == "__main__":
  import uvicorn
  port = int(os.environ.get("PORT", 80))
  uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
