import React, { useState } from 'react';
import { X, ShieldAlert, Cpu, CheckCircle2, XCircle, Wrench, MessageSquare, AlertTriangle, ArrowRight } from 'lucide-react';
import { Incident } from '../../types';
import { PriorityBadge } from '../common/PriorityBadge';
import { SeverityBadge } from '../common/SeverityBadge';
import { StatusBadge } from '../common/StatusBadge';
import { CorrelationPanel } from './CorrelationPanel';
import { formatDate } from '../../utils/formatters';

interface IncidentDetailsDrawerProps {
  incident: Incident | null;
  onClose: () => void;
  onPerformRemedy: (incident: Incident) => void;
  onSubmitFeedback: (payload: {
    incidentId: string;
    incidentTitle: string;
    type: 'true_positive' | 'false_positive';
    comment: string;
    vmId: string;
    application: string;
  }) => Promise<void>;
}

export const IncidentDetailsDrawer: React.FC<IncidentDetailsDrawerProps> = ({
  incident,
  onClose,
  onPerformRemedy,
  onSubmitFeedback,
}) => {
  const [feedbackType, setFeedbackType] = useState<'true_positive' | 'false_positive' | null>(null);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccessMessage, setFeedbackSuccessMessage] = useState<string | null>(null);

  if (!incident) return null;

  const handleFeedbackSubmit = async () => {
    if (!feedbackType) return;
    try {
      setIsSubmittingFeedback(true);
      await onSubmitFeedback({
        incidentId: incident.id,
        incidentTitle: incident.title,
        type: feedbackType,
        comment: feedbackComment,
        vmId: incident.vmId,
        application: incident.application,
      });
      setFeedbackSuccessMessage(`Operator feedback recorded as ${feedbackType === 'true_positive' ? 'True Incident' : 'False Positive'}. Saved for backend model retraining.`);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-rose-100 text-rose-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-xs text-slate-500">{incident.id}</span>
                <PriorityBadge priority={incident.priority} />
                <SeverityBadge severity={incident.severity} />
                <StatusBadge status={incident.status} size="sm" />
              </div>
              <h2 className="text-base font-bold text-slate-900 mt-1">{incident.title}</h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md hover:bg-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          {/* Metadata Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Affected VM</span>
              <span className="font-bold text-slate-800 text-xs font-mono">{incident.vmId}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Application</span>
              <span className="font-bold text-slate-800 text-xs">{incident.application}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Detected Timestamp</span>
              <span className="font-mono text-slate-700 text-[11px]">{formatDate(incident.detectedAt)}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">Detection Model</span>
              <span className="font-mono text-slate-700 text-[11px]">{incident.modelVersion}</span>
            </div>
          </div>

          {/* Anomaly Score Box */}
          <div className="p-4 rounded-lg border border-slate-200 bg-white shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Isolation Forest Continuous Anomaly Score</span>
              </div>
              <span className="font-mono text-base font-bold text-rose-600">{incident.anomalyScore.toFixed(2)}</span>
            </div>

            {/* Score Visual Bar */}
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className={`h-full rounded-full ${
                  incident.anomalyScore > 0.85 ? 'bg-rose-600' : 'bg-amber-500'
                }`}
                style={{ width: `${Math.round(incident.anomalyScore * 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>Baseline: 0.00</span>
              <span>Threshold: 0.75</span>
              <span>Confidence: {(incident.detectionConfidence * 100).toFixed(0)}%</span>
            </div>
          </div>

          {/* Root Cause Signals */}
          <div>
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Root Cause Signals (Telemetry Feature Vector)
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Metric Name</th>
                    <th className="py-2 px-3">Observed Value</th>
                    <th className="py-2 px-3">Baseline</th>
                    <th className="py-2 px-3">Variance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {incident.rootCauseSignals.map((sig, idx) => (
                    <tr key={idx} className={sig.isAnomaly ? 'bg-rose-50/40 font-semibold' : ''}>
                      <td className="py-2 px-3 text-slate-800">{sig.metric}</td>
                      <td className={`py-2 px-3 font-mono ${sig.isAnomaly ? 'text-rose-700 font-bold' : 'text-slate-700'}`}>
                        {sig.value}
                      </td>
                      <td className="py-2 px-3 font-mono text-slate-500">{sig.baseline}</td>
                      <td className="py-2 px-3 font-mono">
                        <span
                          className={`px-1.5 py-0.5 rounded-xs ${
                            sig.isAnomaly ? 'bg-rose-100 text-rose-800 font-bold' : 'text-slate-600'
                          }`}
                        >
                          {sig.change}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cross Layer Correlation */}
          <CorrelationPanel correlation={incident.crossLayerCorrelation} />

          {/* Recommended Remediation Section */}
          <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/30 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-100 pb-2">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span className="font-bold text-slate-900">Recommended Remediation Action</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-md">
                {incident.recommendedAction}
              </span>
            </div>

            <div className="space-y-1.5 text-xs text-slate-700">
              <p><strong className="text-slate-900">Reason:</strong> {incident.remediationReason}</p>
              <p><strong className="text-slate-900">Expected Outcome:</strong> {incident.expectedOutcome}</p>
              <div className="flex items-center gap-4 text-[11px] pt-1">
                <span>Risk Level: <strong className="uppercase text-amber-700">{incident.riskLevel}</strong></span>
                <span>Human Approval: <strong className="text-slate-900">{incident.requiresApproval ? 'Required' : 'Auto-Approved'}</strong></span>
              </div>
            </div>

            {incident.status !== 'resolved' && (
              <div className="pt-2">
                <button
                  onClick={() => onPerformRemedy(incident)}
                  className="w-full py-2 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 focus:outline-none"
                >
                  <Wrench className="w-4 h-4" />
                  Perform Remedy ("{incident.recommendedAction}")
                </button>
              </div>
            )}
          </div>

          {/* Operator Feedback Section */}
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-slate-600" />
                <span className="font-bold text-slate-900">Operator Feedback & Retraining Label</span>
              </div>
              {incident.feedbackSubmitted && (
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Feedback Logged
                </span>
              )}
            </div>

            {feedbackSuccessMessage ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-md text-emerald-800 font-medium text-xs">
                {feedbackSuccessMessage}
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600">Was this detection a genuine incident or a false alarm?</p>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setFeedbackType('true_positive')}
                    className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      feedbackType === 'true_positive'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    True Incident
                  </button>
                  <button
                    type="button"
                    onClick={() => setFeedbackType('false_positive')}
                    className={`flex-1 py-2 px-3 rounded-md border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      feedbackType === 'false_positive'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <XCircle className="w-4 h-4" />
                    False Positive
                  </button>
                </div>

                {feedbackType && (
                  <div className="space-y-2 animate-in fade-in duration-100">
                    <textarea
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      placeholder={
                        feedbackType === 'false_positive'
                          ? 'Why was this marked false positive? (e.g., scheduled batch job, maintenance window)'
                          : 'Optional notes regarding incident root cause or ML accuracy'
                      }
                      className="w-full p-2.5 border border-slate-300 rounded-md text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                      rows={2}
                    />
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isSubmittingFeedback}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-md text-xs shadow-xs transition-colors flex items-center gap-1.5"
                    >
                      {isSubmittingFeedback && (
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      )}
                      Submit Feedback to Backend
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
