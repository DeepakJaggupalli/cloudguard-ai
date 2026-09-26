import React, { useState, useEffect } from 'react';
import { fetchModels, triggerModelRetraining } from '../api/models';
import { ModelCard } from '../components/models/ModelCard';
import { ModelRetrainModal } from '../components/models/ModelRetrainModal';
import { DatasetUploadModal } from '../components/models/DatasetUploadModal';
import { ROCAUCCurveChart } from '../components/models/ROCAUCCurveChart';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ModelDetails } from '../types';
import { Cpu, Upload, Sliders } from 'lucide-react';
import { config } from '../config/environment';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelDetails | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [evaluation, setEvaluation] = useState<any | null>(null);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchModels();
      setModels(data);

      const evalRes = await fetch(`${config.apiBaseUrl}/models/evaluation`);
      const evalData = await evalRes.json();
      setEvaluation(evalData);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to fetch ML model registry');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  const handleRetrainConfirm = async (modelId: string) => {
    const updated = await triggerModelRetraining(modelId);
    setModels((prev) => prev.map((m) => (m.id === modelId ? updated : m)));
    return updated;
  };

  const handleUploadDatasetSubmit = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${config.apiBaseUrl}/models/upload-dataset`, {
      method: 'POST',
      body: formData,
    });
    const result = await res.json();
    loadModels();
    return result;
  };

  const handleSelectActiveAlgorithm = async (modelName: string) => {
    await fetch(`${config.apiBaseUrl}/models/select`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modelName }),
    });
    loadModels();
  };

  if (loading) {
    return <LoadingState message="Connecting to Isolation Forest, One-Class SVM & Classifier registry..." count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadModels} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-slate-900" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Machine Learning Model Registry & Evaluation</h2>
            <p className="text-xs text-slate-500">Isolation Forest, One-Class SVM, and Gradient Boosting Classifiers</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Model Selector */}
          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-md px-2 py-1 text-xs">
            <Sliders className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-slate-500 font-medium">Algorithm:</span>
            <select
              onChange={(e) => handleSelectActiveAlgorithm(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none"
            >
              <option value="Isolation Forest">Isolation Forest</option>
              <option value="One-Class SVM">One-Class SVM</option>
              <option value="Random Forest">Random Forest</option>
            </select>
          </div>

          <button
            onClick={() => setIsUploadModalOpen(true)}
            className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-md shadow-xs flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Dataset
          </button>
        </div>
      </div>

      {/* ROC & AUC Curve Chart */}
      {evaluation && evaluation.roc_curve && (
        <ROCAUCCurveChart rocData={evaluation.roc_curve} aucScore={evaluation.auc_score} />
      )}

      {/* Model Cards */}
      <div className="space-y-4">
        {models.map((model) => (
          <ModelCard key={model.id} model={model} onTriggerRetrain={(m) => setSelectedModel(m)} />
        ))}
      </div>

      {/* Retrain Modal */}
      <ModelRetrainModal
        model={selectedModel}
        isOpen={Boolean(selectedModel)}
        onClose={() => setSelectedModel(null)}
        onConfirmRetrain={handleRetrainConfirm}
      />

      {/* Dataset Upload Modal */}
      <DatasetUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadDataset={handleUploadDatasetSubmit}
      />
    </div>
  );
};
