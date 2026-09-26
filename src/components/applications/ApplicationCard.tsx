import React from 'react';
import { Layers, Server, AlertTriangle, Activity } from 'lucide-react';
import { ApplicationItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';

interface ApplicationCardProps {
  app: ApplicationItem;
  onSelect: (app: ApplicationItem) => void;
}

export const ApplicationCard: React.FC<ApplicationCardProps> = ({ app, onSelect }) => {
  return (
    <div
      onClick={() => onSelect(app)}
      className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-4 group"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 text-white group-hover:bg-blue-600 transition-colors">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">{app.name}</h3>
              <StatusBadge status={app.health} size="sm" />
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {app.ownerTeam} • {app.version} ({app.environment})
            </p>
          </div>
        </div>

        {app.activeIncidentsCount > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            {app.activeIncidentsCount} Incident
          </span>
        )}
      </div>

      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{app.description}</p>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-slate-100 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">p99 Latency</span>
          <span className="font-mono font-bold text-slate-900">{app.latencyMs}ms</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Error Rate</span>
          <span
            className={`font-mono font-bold ${
              app.errorRatePercent > 2 ? 'text-rose-600' : 'text-slate-900'
            }`}
          >
            {app.errorRatePercent}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Throughput</span>
          <span className="font-mono font-bold text-slate-900">{app.requestsPerSec} req/s</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Active VMs</span>
          <span className="font-mono font-bold text-slate-900 flex items-center gap-1">
            <Server className="w-3 h-3 text-slate-400" />
            {app.totalVMsCount} nodes
          </span>
        </div>
      </div>
    </div>
  );
};
