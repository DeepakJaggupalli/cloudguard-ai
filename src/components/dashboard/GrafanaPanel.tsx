import React from 'react';
import { ExternalLink, Layers, Activity } from 'lucide-react';

export const GrafanaPanel: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Single Pane of Glass Grafana Telemetry Visualization
          </h4>
        </div>
        <a
          href="http://localhost:3000"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          Open Grafana Workspace <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-md p-3.5 space-y-2 text-xs">
        <div className="flex justify-between text-slate-700">
          <span>Aggregated Prometheus Metrics:</span>
          <span className="font-mono font-bold text-slate-900">node_cpu_seconds_total, http_requests_total</span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Alerting Rule Status:</span>
          <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            Prometheus Alerts Active (2 Threshold Rules)
          </span>
        </div>
        <div className="flex justify-between text-slate-700">
          <span>Dashboard Synchronization:</span>
          <span className="font-mono text-slate-800">Synced to FastAPI telemetry socket (`ws://localhost:8000/ws`)</span>
        </div>
      </div>
    </div>
  );
};
