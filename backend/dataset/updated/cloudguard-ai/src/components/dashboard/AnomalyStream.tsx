import React from 'react';
import { Card } from '../common/Card';
import { StatusBadge } from '../common/StatusBadge';
import { Activity, ArrowUpRight, ChevronRight } from 'lucide-react';
import { Incident } from '../../types';
import { formatDate } from '../../utils/formatters';

interface AnomalyStreamProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
}

export const AnomalyStream: React.FC<AnomalyStreamProps> = ({ incidents, onSelectIncident }) => {
  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-semibold text-slate-900">Real-Time Anomaly Stream</span>
        </div>
      }
      subtitle="Isolation Forest continuous vector detection feed"
    >
      <div className="space-y-3">
        {incidents.slice(0, 4).map((inc) => {
          const scorePercent = Math.round(inc.anomalyScore * 100);
          const scoreColor =
            inc.anomalyScore > 0.85
              ? 'text-rose-600 bg-rose-50 border-rose-200'
              : inc.anomalyScore > 0.7
              ? 'text-amber-600 bg-amber-50 border-amber-200'
              : 'text-blue-600 bg-blue-50 border-blue-200';

          return (
            <div
              key={inc.id}
              onClick={() => onSelectIncident(inc.id)}
              className="p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-xs transition-all bg-white cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3 group"
            >
              <div className="flex items-start gap-3">
                <div className={`px-2 py-1 rounded-md border text-xs font-mono font-bold shrink-0 ${scoreColor}`}>
                  Score {inc.anomalyScore.toFixed(2)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">{inc.vmId}</span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-700 text-xs">{inc.application}</span>
                    <span className="text-[11px] font-mono text-slate-400">({formatDate(inc.detectedAt)})</span>
                  </div>

                  {/* Signals List */}
                  <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[11px]">
                    <span className="text-slate-500 font-medium">Signals:</span>
                    {inc.rootCauseSignals.map((sig, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded-xs border text-[10px] font-mono ${
                          sig.isAnomaly
                            ? 'bg-rose-50 text-rose-700 border-rose-200 font-semibold'
                            : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {sig.metric} {sig.change}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-3 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                <StatusBadge status={inc.status} size="sm" />
                <span className="text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
