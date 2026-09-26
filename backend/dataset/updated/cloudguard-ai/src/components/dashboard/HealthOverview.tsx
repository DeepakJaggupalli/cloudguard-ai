import React from 'react';
import { Card } from '../common/Card';
import { Sparkline } from '../common/Sparkline';
import { DashboardSummary } from '../../types';

interface HealthOverviewProps {
  summary: DashboardSummary;
}

export const HealthOverview: React.FC<HealthOverviewProps> = ({ summary }) => {
  const cpuHistory = [42, 45, 48, 52, 58, 62, 60, 64, 62];
  const memoryHistory = [65, 66, 68, 70, 72, 71, 73, 71];
  const latencyHistory = [120, 125, 130, 145, 184, 175, 190, 184];
  const errorRateHistory = [0.2, 0.4, 0.5, 1.1, 1.8, 1.6, 2.0, 1.8];

  return (
    <Card title="System Resource Health" subtitle="Live cluster telemetry sparklines (5s refresh)">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {/* CPU */}
        <div className="border border-slate-100 rounded-md p-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">CPU Usage</span>
            <span className="font-bold text-slate-900">{summary.cpuUsage}%</span>
          </div>
          <Sparkline data={cpuHistory} color="#2563eb" height={36} />
        </div>

        {/* Memory */}
        <div className="border border-slate-100 rounded-md p-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Memory</span>
            <span className="font-bold text-slate-900">{summary.memoryUsage}%</span>
          </div>
          <Sparkline data={memoryHistory} color="#d97706" height={36} />
        </div>

        {/* Latency */}
        <div className="border border-slate-100 rounded-md p-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Latency</span>
            <span className="font-bold text-slate-900">{summary.latencyMs} ms</span>
          </div>
          <Sparkline data={latencyHistory} color="#9333ea" height={36} />
        </div>

        {/* Error Rate */}
        <div className="border border-slate-100 rounded-md p-3 bg-slate-50/50">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold uppercase tracking-wider">Error Rate</span>
            <span className="font-bold text-rose-600">{summary.errorRatePercent}%</span>
          </div>
          <Sparkline data={errorRateHistory} color="#dc2626" height={36} />
        </div>
      </div>
    </Card>
  );
};
