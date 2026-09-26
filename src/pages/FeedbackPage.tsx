import React, { useState, useEffect } from 'react';
import { fetchFeedbackSummary } from '../api/feedback';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { FeedbackSummary } from '../types';
import { MessageSquare, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { formatDate } from '../utils/formatters';

export const FeedbackPage: React.FC = () => {
  const [summary, setSummary] = useState<FeedbackSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchFeedbackSummary();
      setSummary(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch operator feedback metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, []);

  if (loading) {
    return <LoadingState message="Calculating operator feedback rate and model precision improvements..." count={4} />;
  }

  if (error || !summary) {
    return <ErrorState message={error || 'Failed to load feedback'} onRetry={loadFeedback} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Operator Feedback & Retraining Metrics</h2>
            <p className="text-xs text-slate-500">Supervised labeling telemetry for model accuracy calibration</p>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Labels</span>
          <div className="mt-2 text-2xl font-bold text-slate-900">{summary.totalFeedback}</div>
          <p className="mt-1 text-xs text-slate-500">Operator reviews logged</p>
        </div>

        <div className="bg-white border border-emerald-200 bg-emerald-50/20 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">True Positives</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">{summary.truePositives}</div>
          <p className="mt-1 text-xs text-emerald-600 font-medium">Genuine incidents confirmed</p>
        </div>

        <div className="bg-white border border-rose-200 bg-rose-50/20 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-800 uppercase tracking-wider">False Positives</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-bold text-rose-700">{summary.falsePositives}</div>
          <p className="mt-1 text-xs text-rose-600 font-medium">Flagged false alarms</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Precision Metric</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{summary.modelPrecisionAfterPercent}%</span>
            <span className="text-xs font-semibold text-emerald-600">
              +{ (summary.modelPrecisionAfterPercent - summary.modelPrecisionBeforePercent).toFixed(1) }%
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">Before: {summary.modelPrecisionBeforePercent}%</p>
        </div>
      </div>

      {/* Recent Feedback Feed */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-2xs space-y-3">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Recent Operator Feedback Logs</h3>
        <div className="divide-y divide-slate-100">
          {summary.recentFeedback.map((fb) => (
            <div key={fb.id} className="py-3 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    fb.type === 'true_positive' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {fb.type === 'true_positive' ? 'True Incident' : 'False Positive'}
                  </span>
                  <span className="font-bold text-slate-900">[{fb.incidentId}] {fb.incidentTitle}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{formatDate(fb.submittedAt)}</span>
              </div>
              <p className="text-slate-700 bg-slate-50 p-2.5 rounded border border-slate-100 italic">"{fb.comment}"</p>
              <div className="text-[11px] text-slate-500 flex gap-3">
                <span>Submitted by: <strong>{fb.submittedBy}</strong></span>
                <span>VM Target: <strong>{fb.vmId}</strong></span>
                <span>Application: <strong>{fb.application}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
