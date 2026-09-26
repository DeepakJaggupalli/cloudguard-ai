import React, { useState } from 'react';
import { useTelemetry } from '../hooks/useTelemetry';
import { TelemetryChart } from '../components/telemetry/TelemetryChart';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { TimeRange } from '../types';
import { Activity, Clock } from 'lucide-react';

export const TelemetryPage: React.FC = () => {
  const [range, setRange] = useState<TimeRange>('15m');
  const { data, loading, error, refresh } = useTelemetry(range);

  const ranges: TimeRange[] = ['1m', '5m', '15m', '1h', '24h'];

  if (loading && data.length === 0) {
    return <LoadingState message="Streaming cluster metrics from Prometheus / Telemetry pipeline..." count={4} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refresh} />;
  }

  return (
    <div className="space-y-6">
      {/* Time Range Filter Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Cluster Telemetry Stream</h2>
            <p className="text-xs text-slate-500">Live multi-dimensional feature vector metrics (5s auto-refresh)</p>
          </div>
        </div>

        {/* Range Selector */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md border border-slate-200 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-3 py-1 font-semibold rounded-md transition-colors ${
                range === r ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Telemetry Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TelemetryChart data={data} metricKey="cpu" title="CPU Utilization" unit="%" color="#2563eb" />
        <TelemetryChart data={data} metricKey="memory" title="Memory Allocation" unit="%" color="#d97706" />
        <TelemetryChart data={data} metricKey="latency" title="Request Latency (p99)" unit="ms" color="#9333ea" />
        <TelemetryChart data={data} metricKey="networkOut" title="Network Egress Rate" unit="MB/s" color="#059669" />
        <TelemetryChart data={data} metricKey="iops" title="Disk IOPS" unit="iops" color="#2563eb" />
        <TelemetryChart data={data} metricKey="packetLoss" title="Network Packet Loss" unit="%" color="#dc2626" />
      </div>
    </div>
  );
};
