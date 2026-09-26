import React, { useState, useEffect } from 'react';
import { KPISection } from '../components/dashboard/KPISection';
import { HealthOverview } from '../components/dashboard/HealthOverview';
import { AnomalyStream } from '../components/dashboard/AnomalyStream';
import { GrafanaPanel } from '../components/dashboard/GrafanaPanel';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { IncidentTable } from '../components/incidents/IncidentTable';
import { Incident, DashboardSummary } from '../types';
import { useIncidents } from '../hooks/useIncidents';
import { fetchDashboardSummary } from '../api/health';

interface DashboardPageProps {
  onSelectIncident: (id: string) => void;
  onRemediateClick: (incident: Incident) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onSelectIncident,
  onRemediateClick,
}) => {
  const { incidents, loading: loadingIncidents, error: errorIncidents, refresh } = useIncidents();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);

  useEffect(() => {
    fetchDashboardSummary()
      .then((data) => setSummary(data))
      .catch(console.error)
      .finally(() => setLoadingSummary(false));
  }, []);

  if (loadingIncidents || loadingSummary) {
    return <LoadingState message="Connecting to CloudGuard AI ingestion & ML pipeline..." count={4} />;
  }

  if (errorIncidents || !summary) {
    return <ErrorState message={errorIncidents || 'Failed to load dashboard summary'} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* KPI Section */}
      <KPISection summary={summary} />

      {/* System Health Sparklines */}
      <HealthOverview summary={summary} />

      {/* Single Pane of Glass Grafana Telemetry Panel */}
      <GrafanaPanel />

      {/* Two Column Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Anomaly Stream */}
        <AnomalyStream incidents={incidents} onSelectIncident={onSelectIncident} />

        {/* Priority Incidents Table Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Active High-Priority Incidents</h3>
            <span className="text-xs text-slate-500">Showing P1 & P2 alerts</span>
          </div>
          <IncidentTable
            incidents={incidents.filter((i) => i.priority === 'P1' || i.priority === 'P2')}
            onSelectIncident={onSelectIncident}
            onRemediateClick={onRemediateClick}
          />
        </div>
      </div>
    </div>
  );
};
