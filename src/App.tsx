import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { TelemetryPage } from './pages/TelemetryPage';
import { InfrastructurePage } from './pages/InfrastructurePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { RemediationPage } from './pages/RemediationPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ModelsPage } from './pages/ModelsPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { SettingsPage } from './pages/SettingsPage';
import { IncidentDetailsDrawer } from './components/incidents/IncidentDetailsDrawer';
import { RemediationDialog } from './components/remediation/RemediationDialog';
import { useIncidentDetails } from './hooks/useIncidents';
import { executeRemediationAction } from './api/remediation';
import { submitOperatorFeedback } from './api/feedback';
import { updateIncidentState } from './api/incidents';
import { logAuditEvent } from './api/audit';
import { Environment, Incident, AppNotification } from './types';

export const AppContent: React.FC = () => {
  const [activeEnv, setActiveEnv] = useState<Environment>('production');
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [remediatingIncident, setRemediatingIncident] = useState<Incident | null>(null);

  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'NOTIF-01',
      title: 'P1 Incident Detected',
      message: 'Isolation Forest score 0.91 on Payments API (VM-204)',
      timestamp: '12m ago',
      type: 'p1_incident',
      read: false,
      incidentId: 'INC-2026-00124',
    },
    {
      id: 'NOTIF-02',
      title: 'Remediation Action Complete',
      message: 'Connection pool flushed on VM-108 (Auth Service)',
      timestamp: '25m ago',
      type: 'remediation_complete',
      read: true,
    },
  ]);

  const { incident: activeIncidentDetail } = useIncidentDetails(selectedIncidentId || undefined);

  const handleConfirmRemedy = async (incident: Incident) => {
    const record = await executeRemediationAction({
      incidentId: incident.id,
      incidentTitle: incident.title,
      action: incident.recommendedAction,
      target: `${incident.vmId} (${incident.application})`,
      requestedBy: 'Operator Approval (UI)',
    });

    updateIncidentState(incident.id, { status: 'resolved' });

    logAuditEvent({
      actor: 'Operations Specialist',
      action: 'Remediation Executed & Resolved',
      resource: `${incident.id} (${incident.vmId})`,
      resourceType: 'Remediation',
      status: 'success',
      details: `Executed ${incident.recommendedAction}. Outcome: ${record.result}`,
      ipAddress: '192.168.1.104',
    });

    return record;
  };

  const handleSubmitFeedback = async (payload: {
    incidentId: string;
    incidentTitle: string;
    type: 'true_positive' | 'false_positive';
    comment: string;
    vmId: string;
    application: string;
  }) => {
    await submitOperatorFeedback(payload);
    updateIncidentState(payload.incidentId, {
      feedbackSubmitted: payload.type,
      feedbackComment: payload.comment,
    });
    logAuditEvent({
      actor: 'Operations Specialist',
      action: 'Feedback Submitted',
      resource: payload.incidentId,
      resourceType: 'Feedback',
      status: 'info',
      details: `Operator labeled incident as ${payload.type}. Comment: "${payload.comment}"`,
      ipAddress: '192.168.1.104',
    });
  };

  return (
    <AppShell
      title="CloudGuard AI"
      activeEnvironment={activeEnv}
      onEnvironmentChange={setActiveEnv}
      systemHealthPercent={98.7}
      notifications={notifications}
      onMarkNotificationsRead={() =>
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    >
      <Routes>
        <Route
          path="/"
          element={
            <DashboardPage
              onSelectIncident={(id) => setSelectedIncidentId(id)}
              onRemediateClick={(inc) => setRemediatingIncident(inc)}
            />
          }
        />
        <Route
          path="/incidents"
          element={
            <IncidentsPage
              onSelectIncident={(id) => setSelectedIncidentId(id)}
              onRemediateClick={(inc) => setRemediatingIncident(inc)}
            />
          }
        />
        <Route path="/telemetry" element={<TelemetryPage />} />
        <Route path="/infrastructure" element={<InfrastructurePage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/remediation" element={<RemediationPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/models" element={<ModelsPage />} />
        <Route path="/audit-logs" element={<AuditLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>

      {/* Incident Details Drawer */}
      <IncidentDetailsDrawer
        incident={activeIncidentDetail}
        onClose={() => setSelectedIncidentId(null)}
        onPerformRemedy={(inc) => {
          setSelectedIncidentId(null);
          setRemediatingIncident(inc);
        }}
        onSubmitFeedback={handleSubmitFeedback}
      />

      {/* Remediation Flow Dialog */}
      <RemediationDialog
        incident={remediatingIncident}
        isOpen={Boolean(remediatingIncident)}
        onClose={() => setRemediatingIncident(null)}
        onConfirmRemedy={handleConfirmRemedy}
      />
    </AppShell>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
