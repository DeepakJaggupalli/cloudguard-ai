import React from 'react';
import { Server, Layers, GitCommit } from 'lucide-react';
import { CrossLayerCorrelation } from '../../types';

interface CorrelationPanelProps {
  correlation: CrossLayerCorrelation;
}

export const CorrelationPanel: React.FC<CorrelationPanelProps> = ({ correlation }) => {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 uppercase tracking-wider">
        <GitCommit className="w-4 h-4 text-blue-600" />
        <span>Cross-Layer Anomaly Correlation</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* VM Infrastructure Layer */}
        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
            <Server className="w-4 h-4 text-blue-600" />
            <span>Infrastructure Layer (VM Host)</span>
          </div>
          <p className="text-xs text-slate-600 mb-2.5">{correlation.vmLayer.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {correlation.vmLayer.metrics.map((m, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-xs bg-blue-50 text-blue-700 font-mono text-[11px] font-medium border border-blue-200">
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Application Layer */}
        <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Application Layer (Microservice)</span>
          </div>
          <p className="text-xs text-slate-600 mb-2.5">{correlation.appLayer.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {correlation.appLayer.metrics.map((m, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded-xs bg-emerald-50 text-emerald-700 font-mono text-[11px] font-medium border border-emerald-200">
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-700">
        <span className="font-semibold text-slate-900">ML Correlation Summary: </span>
        <span>{correlation.summary}</span>
      </div>
    </div>
  );
};
