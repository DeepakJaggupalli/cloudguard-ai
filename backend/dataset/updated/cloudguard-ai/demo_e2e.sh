#!/usr/bin/env bash
# End-to-end demo script (<=5 min) — validates the full
# detect -> prioritize -> remediate flow against a running backend.
# Usage: BACKEND_URL=http://localhost:8000 ./demo_e2e.sh
set -e
BACKEND_URL="${BACKEND_URL:-http://localhost:8000}"

echo "== 1. Health check =="
curl -sf "$BACKEND_URL/health" | python3 -m json.tool

echo -e "\n== 2. Wait for the live ingestion loop to produce telemetry (~10s) =="
sleep 10
curl -sf "$BACKEND_URL/api/ingestion/status" | python3 -m json.tool

echo -e "\n== 3. Confirm at least one incident was detected =="
INCIDENT_JSON=$(curl -sf "$BACKEND_URL/api/incidents")
echo "$INCIDENT_JSON" | python3 -m json.tool | head -40
INCIDENT_ID=$(echo "$INCIDENT_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")
if [ -z "$INCIDENT_ID" ]; then
  echo "No incidents yet — waiting another 15s for an anomaly to be injected..."
  sleep 15
  INCIDENT_JSON=$(curl -sf "$BACKEND_URL/api/incidents")
  INCIDENT_ID=$(echo "$INCIDENT_JSON" | python3 -c "import json,sys; d=json.load(sys.stdin); print(d[0]['id'] if d else '')")
fi
echo "Using incident: $INCIDENT_ID"

echo -e "\n== 4. Show priority + recommended remediation =="
curl -sf "$BACKEND_URL/api/incidents/$INCIDENT_ID" | python3 -c "
import json,sys
inc = json.load(sys.stdin)
print('priority:', inc['priority'], '| action:', inc['recommendedAction'])
print('cross-layer:', inc['crossLayerCorrelation']['summary'])
"

echo -e "\n== 5. Approve + execute remediation =="
curl -sf -X POST "$BACKEND_URL/api/incidents/$INCIDENT_ID/remediate" \
  -H "Content-Type: application/json" \
  -d "{\"incidentId\":\"$INCIDENT_ID\",\"incidentTitle\":\"Demo\",\"action\":\"restart_service\",\"target\":\"demo-vm\"}" \
  | python3 -m json.tool

echo -e "\n== 6. Submit operator feedback (true positive) =="
curl -sf -X POST "$BACKEND_URL/api/incidents/$INCIDENT_ID/feedback" \
  -H "Content-Type: application/json" \
  -d "{\"incidentId\":\"$INCIDENT_ID\",\"incidentTitle\":\"Demo\",\"type\":\"true_positive\",\"comment\":\"Confirmed via demo script\",\"vmId\":\"demo-vm\",\"application\":\"payments\"}" \
  | python3 -m json.tool

echo -e "\n== 7. Trigger retraining with the new feedback =="
curl -sf -X POST "$BACKEND_URL/api/models/retrain" \
  -H "Content-Type: application/json" \
  -d '{"modelId":"MOD-IF-01"}' | python3 -m json.tool

echo -e "\n== DONE. Full detect -> prioritize -> remediate -> feedback -> retrain flow validated. =="
