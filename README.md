# CloudGuard AI - Enterprise Observability & Self-Healing Infrastructure

CloudGuard AI is an enterprise-grade observability platform designed for SREs and cloud operations teams. It monitors VM infrastructure and application microservices in real time, detecting cross-layer anomalies using an Isolation Forest ML model and predicting recommended self-healing remediations via Gradient Boosting classification.

---

## 🛠️ Tech Stack & Architecture

- **Frontend Core:** React 19, TypeScript, Vite
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4, Inter Typography
- **Charts & Data Viz:** Recharts (Sparklines & Multi-metric time-series)
- **Icons:** Lucide React
- **Testing:** Vitest, React Testing Library, JSDOM

---

## 🚀 Key Features

1. **Overview Dashboard**
   - Live KPI metrics (Active Incidents, Critical P1s, Anomalies, Affected VMs, Remediations Today, System Health %)
   - Compact 5s sparkline metrics (CPU, Memory, Latency, Error Rate)
   - Real-time Isolation Forest Anomaly Stream feed with signal variance badges
   - Priority Incidents summary table

2. **Incident Management**
   - Comprehensive incident table with P1-P4 priority badges and severity markers
   - Global filters by priority, severity, status, application, environment, and VM host
   - Sort by newest, oldest, highest priority, and continuous anomaly score
   - Interactive search by incident ID, VM host, or application name

3. **Incident Inspection & Root Cause Analysis**
   - Detailed incident drawer with telemetry feature vector signals (observed vs baseline)
   - Continuous Isolation Forest anomaly score visualization bar (0.00 to 1.00)
   - Two-column Cross-Layer Correlation view (Infrastructure VM Layer ↔ Application Microservice Layer)
   - Recommended remediation details (Action, Reason, Risk Level, Approval Policy, Expected Impact)
   - Operator Feedback section (True Incident vs False Positive labeling for backend retraining)

4. **Self-Healing Remediation Workflow**
   - Controlled multi-step remediation dialog ("Perform Remedy")
   - Guarded approval requirement check
   - Live execution status progress (Queued → Running → Completed / Verification)
   - Full audit logging of all executed remediations

5. **Cluster Telemetry Stream**
   - Multi-metric time series charts (CPU %, Memory %, Latency ms, Network Egress, Disk IOPS, Packet Loss)
   - Configurable time range controls (1m, 5m, 15m, 1h, 24h)
   - WebSocket streaming client hook with automatic reconnect

6. **Infrastructure & Application Inventory**
   - Host inventory table with IP address, region, instance type, resource usage, and health status
   - Detailed VM host modal with live resource gauges
   - Microservices catalog with p99 latency, error rate, throughput (req/s), and active node counts

7. **Machine Learning Model Monitoring & Retraining**
   - Isolation Forest Anomaly Detector & Remediation Classifier model cards
   - Performance metrics tracking (Precision, Recall, F1 Score, Training Sample Count, Feature Vectors)
   - Interactive model retraining workflow with step-by-step evaluation progress

8. **Audit Trail & Settings**
   - Immutable security and action audit log table
   - Environment switcher (Production, Staging, Development)
   - Global search modal (`Ctrl+K` / `Cmd+K`)
   - Configurable mock mode flag (`VITE_USE_MOCK_DATA`) and FastAPI endpoint base URL

9. **Live Demo Scenario Mode**
   - One-click hackathon live demo trigger in the sidebar
   - Simulates synthetic multi-dimensional anomaly injection on `VM-204 (Payments API)`
   - Demonstrates the end-to-end flow: Healthy → Anomaly → Incident Created → Recommended Remediation → Operator Approval → Remediation Completed → Feedback Recorded

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm / pnpm / yarn

### Installation
```bash
npm install
```

### Running Locally
```bash
npm run dev
```
Open your browser at `http://localhost:3000`.

### Running Tests
```bash
npm run test
```

### Production Build
```bash
npm run build
```

---

## 🌐 API Contract Mappings

The frontend API service layer (`src/api/`) exposes clean abstractions for seamless FastAPI backend integration:

- `GET /health` - System health check
- `GET /api/dashboard/summary` - Key dashboard metrics
- `GET /api/incidents` - List all active/resolved incidents
- `GET /api/incidents/{id}` - Fetch incident details & root cause vector
- `GET /api/telemetry?range={15m}` - Cluster telemetry metrics
- `GET /api/vms` - Infrastructure VM node list
- `GET /api/applications` - Microservice catalog
- `GET /api/remediations` - Remediation execution history
- `POST /api/incidents/{id}/remediate` - Execute self-healing action
- `POST /api/incidents/{id}/feedback` - Submit True/False positive label
- `GET /api/models` - ML model registry and accuracy metrics
- `POST /api/models/retrain` - Trigger model retraining pipeline
- `GET /api/audit-logs` - Audit log trail

---

## 📄 License

MIT Enterprise License - CloudGuard AI Engineering Team.
