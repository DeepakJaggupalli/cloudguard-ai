import React from 'react';
import { Cpu, HelpCircle, TrendingUp } from 'lucide-react';

export interface SHAPFeature {
  feature: string;
  key: string;
  importance: number;
  observed: number | string;
  baseline: number | string;
  impact: 'High' | 'Medium' | 'Low';
}

interface SHAPAnalysisPanelProps {
  features: SHAPFeature[];
}

export const SHAPAnalysisPanel: React.FC<SHAPAnalysisPanelProps> = ({ features }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-purple-600" />
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Explainable AI (SHAP Feature Importance Attribution)
          </h4>
        </div>
        <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
          <HelpCircle className="w-3 h-3" /> TreeSHAP Contrib Vector
        </span>
      </div>

      <p className="text-xs text-slate-500">
        Feature contribution breakdown explaining the top metric deviations driving the ML anomaly score decision.
      </p>

      <div className="space-y-2.5 pt-1">
        {features.map((feat, idx) => {
          const impactColor =
            feat.impact === 'High'
              ? 'bg-rose-600 text-white'
              : feat.impact === 'Medium'
              ? 'bg-amber-500 text-white'
              : 'bg-slate-500 text-white';

          const barColor =
            feat.impact === 'High' ? 'bg-rose-500' : feat.impact === 'Medium' ? 'bg-amber-500' : 'bg-slate-400';

          return (
            <div key={idx} className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{feat.feature}</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9px] font-mono uppercase font-bold ${impactColor}`}>
                    {feat.impact} Impact
                  </span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-slate-500">
                    Observed: <strong className="text-slate-800">{feat.observed}</strong> (Base: {feat.baseline})
                  </span>
                  <span className="font-bold text-slate-900 w-12 text-right">{feat.importance}%</span>
                </div>
              </div>

              {/* Attribution Bar */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${barColor}`} style={{ width: `${feat.importance}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
