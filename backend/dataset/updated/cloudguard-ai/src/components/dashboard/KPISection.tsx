import React from 'react';
import { AlertTriangle, ShieldAlert, Cpu, Server, Wrench, HeartPulse } from 'lucide-react';
import { MetricCard } from '../common/MetricCard';
import { DashboardSummary } from '../../types';

interface KPISectionProps {
  summary: DashboardSummary;
}

export const KPISection: React.FC<KPISectionProps> = ({ summary }) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      <MetricCard
        title="Active Incidents"
        value={summary.activeIncidents}
        subtitle="12 Total open alerts"
        icon={AlertTriangle}
        variant={summary.activeIncidents > 0 ? 'warning' : 'default'}
      />
      <MetricCard
        title="Critical Incidents"
        value={summary.criticalIncidents}
        subtitle="P1/P2 action required"
        icon={ShieldAlert}
        variant={summary.criticalIncidents > 0 ? 'critical' : 'healthy'}
      />
      <MetricCard
        title="Anomalies"
        value={summary.anomaliesDetected}
        subtitle="Isolation Forest score > 0.75"
        icon={Cpu}
      />
      <MetricCard
        title="Affected VMs"
        value={summary.affectedVMs}
        subtitle="8 Nodes degraded"
        icon={Server}
      />
      <MetricCard
        title="Remediations Today"
        value={summary.remediationsToday}
        subtitle="19 Actions logged"
        icon={Wrench}
      />
      <MetricCard
        title="System Health"
        value={`${summary.systemHealthPercent}%`}
        subtitle="Operational baseline"
        icon={HeartPulse}
        variant={summary.systemHealthPercent > 95 ? 'healthy' : 'warning'}
      />
    </div>
  );
};
