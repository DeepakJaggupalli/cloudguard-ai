import React, { useState } from 'react';
import { Wrench, X, ShieldAlert, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Incident, RemediationRecord } from '../../types';

interface RemediationDialogProps {
  incident: Incident | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRemedy: (incident: Incident) => Promise<RemediationRecord>;
}

export const RemediationDialog: React.FC<RemediationDialogProps> = ({
  incident,
  isOpen,
  onClose,
  onConfirmRemedy,
}) => {
  const [step, setStep] = useState<'confirm' | 'progress' | 'result'>('confirm');
  const [progressState, setProgressState] = useState<'queued' | 'running' | 'completed' | 'failed'>('queued');
  const [resultRecord, setResultRecord] = useState<RemediationRecord | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen || !incident) return null;

  const handleStartRemedy = async () => {
    setStep('progress');
    setProgressState('queued');
    setErrorMessage(null);

    // Progress state transition simulation for feedback clarity
    setTimeout(() => {
      setProgressState('running');
    }, 600);

    try {
      const record = await onConfirmRemedy(incident);
      setProgressState('completed');
      setResultRecord(record);
      setStep('result');
    } catch (err: unknown) {
      setProgressState('failed');
      setErrorMessage(err instanceof Error ? err.message : 'Remediation action failed on cluster');
      setStep('result');
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setProgressState('queued');
    setResultRecord(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={handleClose}
          disabled={step === 'progress'}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 disabled:opacity-30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Step 1: Confirmation Form */}
        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-blue-100 text-blue-600">
                <Wrench className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Confirm Self-Healing Remediation</h3>
                <p className="text-xs text-slate-500 font-mono">Incident ID: {incident.id}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Recommended Action:</span>
                <span className="font-bold text-slate-900 font-mono">{incident.recommendedAction}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Target Host / VM:</span>
                <span className="font-bold text-slate-900 font-mono">{incident.vmId} ({incident.application})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Expected Impact:</span>
                <span className="text-slate-800 text-right">{incident.expectedOutcome}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Approval Requirement:</span>
                <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                  {incident.requiresApproval ? 'Human Operator Approval Required' : 'Auto-Approved Policy'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Risk Level:</span>
                <span className="font-bold uppercase text-slate-800">{incident.riskLevel}</span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-[11px] text-amber-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Executing this remediation will issue orchestrated RPC calls to cluster infrastructure controllers. Action will be audited under your operator identity.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleStartRemedy}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs flex items-center gap-1.5"
              >
                <Wrench className="w-3.5 h-3.5" />
                Authorize & Perform Remedy
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Execution Progress */}
        {step === 'progress' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Executing Remediation Pipeline</h3>
              <p className="text-xs text-slate-500 mt-1">Communicating with backend cluster agent...</p>
            </div>

            {/* Stepper indicator */}
            <div className="flex items-center justify-center gap-4 text-xs font-semibold pt-4">
              <span className={`px-2.5 py-1 rounded-full ${progressState === 'queued' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                1. Queued
              </span>
              <span className={`px-2.5 py-1 rounded-full ${progressState === 'running' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                2. Running Ansible / K8s
              </span>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-400">
                3. Verification
              </span>
            </div>
          </div>
        )}

        {/* Step 3: Result Outcome */}
        {step === 'result' && (
          <div className="space-y-4 text-center py-2">
            {progressState === 'completed' && (
              <>
                <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-900">Remediation Successful</h3>
                <p className="text-xs text-slate-600 max-w-sm mx-auto">{resultRecord?.result}</p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-left text-xs font-mono space-y-1">
                  <div>Record ID: {resultRecord?.id}</div>
                  <div>Duration: {resultRecord?.durationSeconds} seconds</div>
                  <div>Target: {resultRecord?.target}</div>
                  <div>Logged At: {resultRecord?.timestamp}</div>
                </div>
              </>
            )}

            {progressState === 'failed' && (
              <>
                <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-rose-900">Remediation Action Failed</h3>
                <p className="text-xs text-rose-700 max-w-sm mx-auto">{errorMessage}</p>
              </>
            )}

            <button
              onClick={handleClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs mt-4"
            >
              Close & Update Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
