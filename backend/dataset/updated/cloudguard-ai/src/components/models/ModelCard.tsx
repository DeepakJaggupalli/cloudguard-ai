import React from 'react';
import { Cpu, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { ModelDetails } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { formatDate } from '../../utils/formatters';

interface ModelCardProps {
  model: ModelDetails;
  onTriggerRetrain: (model: ModelDetails) => void;
}

export const ModelCard: React.FC<ModelCardProps> = ({ model, onTriggerRetrain }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-900 text-white shadow-2xs">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">{model.name}</span>
              <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-slate-700">
                {model.version}
              </span>
              <StatusBadge status={model.status} size="sm" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-mono">
              Architecture: {model.type} • Category: {model.category}
            </p>
          </div>
        </div>

        <button
          onClick={() => onTriggerRetrain(model)}
          className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 flex items-center gap-1.5 focus:outline-none transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retrain Model
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-md text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Precision</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{(model.precision * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Recall</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{(model.recall * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">F1 Score</span>
          <span className="font-mono font-bold text-slate-900 text-sm">{(model.f1Score * 100).toFixed(1)}%</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-semibold block">Training Samples</span>
          <span className="font-mono font-bold text-slate-900 text-sm flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            {model.trainingSamplesCount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Features Vector */}
      <div>
        <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
          Model Input Feature Vector ({model.features.length} Signals)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {model.features.map((feat, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px] border border-slate-200"
            >
              {feat}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
        <span>Last Trained: <strong className="text-slate-700 font-mono">{formatDate(model.lastTrained)}</strong></span>
        <span>Baseline Anomaly Threshold: <strong className="text-slate-700 font-mono">{model.threshold}</strong></span>
      </div>
    </div>
  );
};
