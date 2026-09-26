import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts';

interface ROCPoint {
  fpr: number;
  tpr: number;
}

interface ROCAUCCurveChartProps {
  rocData: ROCPoint[];
  aucScore: number;
}

export const ROCAUCCurveChart: React.FC<ROCAUCCurveChartProps> = ({ rocData, aucScore }) => {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-2xs space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            ROC Curve & Model Discrimination Performance
          </h4>
          <p className="text-[11px] text-slate-500">True Positive Rate vs. False Positive Rate Curve</p>
        </div>
        <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-md text-right">
          <span className="text-[10px] text-emerald-700 font-semibold uppercase block">Area Under Curve (AUC)</span>
          <span className="text-sm font-bold font-mono text-emerald-800">{aucScore.toFixed(3)}</span>
        </div>
      </div>

      <div className="h-52 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={rocData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="fpr" label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fontSize: 10 }} tick={{ fontSize: 10 }} />
            <YAxis label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', fontSize: 10 }} tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                color: '#ffffff',
                borderRadius: '6px',
                fontSize: '11px',
                padding: '6px 10px',
              }}
              formatter={(val: any, name?: any) => [val, name === 'tpr' ? 'TPR (Recall)' : 'FPR']}
            />
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} stroke="#94a3b8" strokeDasharray="4 4" />
            <Line type="monotone" dataKey="tpr" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 2 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
