import React, { useState, useEffect } from 'react';
import { fetchModels, triggerModelRetraining } from '../api/models';
import { ModelCard } from '../components/models/ModelCard';
import { ModelRetrainModal } from '../components/models/ModelRetrainModal';
import { LoadingState } from '../components/common/LoadingState';
import { ErrorState } from '../components/common/ErrorState';
import { ModelDetails } from '../types';
import { Cpu } from 'lucide-react';

export const ModelsPage: React.FC = () => {
  const [models, setModels] = useState<ModelDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState<ModelDetails | null>(null);

  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchModels();
      setModels(data);
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

  if (loading) {
    return <LoadingState message="Connecting to Isolation Forest & Remediation Classifier registry..." count={3} />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={loadModels} />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Cpu className="w-5 h-5 text-slate-900" />
          <div>
            <h2 className="text-sm font-bold text-slate-900">Machine Learning Model Registry</h2>
            <p className="text-xs text-slate-500">Isolation Forest Continuous Anomaly & Random Forest Classifiers</p>
          </div>
        </div>
      </div>

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
    </div>
  );
};
