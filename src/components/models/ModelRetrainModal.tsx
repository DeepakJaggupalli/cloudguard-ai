import React, { useState } from 'react';
import { RefreshCw, X, CheckCircle2, Loader2 } from 'lucide-react';
import { ModelDetails } from '../../types';

interface ModelRetrainModalProps {
  model: ModelDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmRetrain: (modelId: string) => Promise<ModelDetails>;
}

export const ModelRetrainModal: React.FC<ModelRetrainModalProps> = ({
  model,
  isOpen,
  onClose,
  onConfirmRetrain,
}) => {
  const [step, setStep] = useState<'confirm' | 'progress' | 'result'>('confirm');
  const [progressState, setProgressState] = useState<'queued' | 'training' | 'evaluating' | 'completed'>('queued');
  const [updatedModel, setUpdatedModel] = useState<ModelDetails | null>(null);

  if (!isOpen || !model) return null;

  const handleStartRetraining = async () => {
    setStep('progress');
    setProgressState('queued');

    setTimeout(() => {
      setProgressState('training');
    }, 600);

    setTimeout(() => {
      setProgressState('evaluating');
    }, 1300);

    try {
      const res = await onConfirmRetrain(model.id);
      setProgressState('completed');
      setUpdatedModel(res);
      setStep('result');
    } catch (e) {
      console.error(e);
    }
  };

  const handleClose = () => {
    setStep('confirm');
    setProgressState('queued');
    setUpdatedModel(null);
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

        {step === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-blue-100 text-blue-600">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Trigger Model Retraining</h3>
                <p className="text-xs text-slate-500 font-mono">{model.name} ({model.version})</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              Retraining will ingest recent operator True Positive / False Positive feedback labels into the training corpus to recalibrate feature weights and continuous anomaly decision boundaries.
            </p>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-xs space-y-1 font-mono">
              <div>Sample Corpus Size: {model.trainingSamplesCount.toLocaleString()} + recent feedback</div>
              <div>Target Model: {model.type}</div>
              <div>Current Precision: {(model.precision * 100).toFixed(1)}%</div>
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
                onClick={handleStartRetraining}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-xs flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Start Retraining Pipeline
              </button>
            </div>
          </div>
        )}

        {step === 'progress' && (
          <div className="py-8 text-center space-y-4">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto" />
            <div>
              <h3 className="text-base font-bold text-slate-900">Retraining Model</h3>
              <p className="text-xs text-slate-500 mt-1">Executing scikit-learn / XGBoost pipeline job...</p>
            </div>

            <div className="flex items-center justify-center gap-3 text-xs font-semibold pt-4">
              <span className={`px-2.5 py-1 rounded-full ${progressState === 'queued' ? 'bg-blue-100 text-blue-800 animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                Queued
              </span>
              <span className={`px-2.5 py-1 rounded-full ${progressState === 'training' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                Training
              </span>
              <span className={`px-2.5 py-1 rounded-full ${progressState === 'evaluating' ? 'bg-blue-600 text-white animate-pulse' : 'bg-slate-100 text-slate-500'}`}>
                Evaluating
              </span>
            </div>
          </div>
        )}

        {step === 'result' && updatedModel && (
          <div className="space-y-4 text-center py-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Model Retrained & Deployed</h3>
            <p className="text-xs text-slate-600">
              Model updated to version <strong className="font-mono">{updatedModel.version}</strong>. Precision improved to {(updatedModel.precision * 100).toFixed(1)}%.
            </p>

            <button
              onClick={handleClose}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-md shadow-xs mt-4"
            >
              Done & Return to Models
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
