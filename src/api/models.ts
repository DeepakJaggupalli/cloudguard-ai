import { apiClient } from './client';
import { config } from '../config/environment';
import { mockModels } from '../mock/models';
import { ModelDetails } from '../types';

let stateModels: ModelDetails[] = [...mockModels];

export const fetchModels = async (): Promise<ModelDetails[]> => {
  if (config.useMockData) {
    await apiClient.mockDelay(80);
    return [...stateModels];
  }
  return apiClient.get<ModelDetails[]>('/models');
};

export const triggerModelRetraining = async (modelId: string): Promise<ModelDetails> => {
  if (config.useMockData) {
    await apiClient.mockDelay(1800); // Simulate background training job dispatch
    stateModels = stateModels.map((m) => {
      if (m.id === modelId) {
        const nextSubVersion = (parseFloat(m.version.replace('v', '')) + 0.1).toFixed(1);
        return {
          ...m,
          version: `v${nextSubVersion}`,
          status: 'Active',
          lastTrained: new Date().toISOString(),
          trainingSamplesCount: m.trainingSamplesCount + 120,
          precision: Math.min(0.98, Number((m.precision + 0.008).toFixed(3))),
          f1Score: Math.min(0.97, Number((m.f1Score + 0.007).toFixed(3)))
        };
      }
      return m;
    });

    const updated = stateModels.find((m) => m.id === modelId);
    if (!updated) throw new Error('Model not found');
    return updated;
  }

  return apiClient.post<ModelDetails>('/models/retrain', { modelId });
};
