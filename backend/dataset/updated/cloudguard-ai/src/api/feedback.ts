import { apiClient } from './client';
import { config } from '../config/environment';
import { mockFeedbackSummary, mockRecentFeedback } from '../mock/feedback';
import { FeedbackSummary, OperatorFeedback } from '../types';

let stateFeedbackSummary: FeedbackSummary = { ...mockFeedbackSummary };

export const fetchFeedbackSummary = async (): Promise<FeedbackSummary> => {
  if (config.useMockData) {
    await apiClient.mockDelay(75);
    return { ...stateFeedbackSummary };
  }
  return apiClient.get<FeedbackSummary>('/feedback');
};

export const submitOperatorFeedback = async (payload: {
  incidentId: string;
  incidentTitle: string;
  type: 'true_positive' | 'false_positive';
  comment: string;
  submittedBy?: string;
  vmId: string;
  application: string;
}): Promise<OperatorFeedback> => {
  if (config.useMockData) {
    await apiClient.mockDelay(400);
    const newFeedback: OperatorFeedback = {
      id: `FB-${Math.floor(500 + Math.random() * 500)}`,
      incidentId: payload.incidentId,
      incidentTitle: payload.incidentTitle,
      type: payload.type,
      comment: payload.comment || (payload.type === 'true_positive' ? 'Verified genuine incident' : 'Flagged as false alert'),
      submittedBy: payload.submittedBy || 'Current Operator',
      submittedAt: new Date().toISOString(),
      vmId: payload.vmId,
      application: payload.application
    };

    const isTP = payload.type === 'true_positive';
    stateFeedbackSummary = {
      ...stateFeedbackSummary,
      totalFeedback: stateFeedbackSummary.totalFeedback + 1,
      truePositives: stateFeedbackSummary.truePositives + (isTP ? 1 : 0),
      falsePositives: stateFeedbackSummary.falsePositives + (isTP ? 0 : 1),
      recentFeedback: [newFeedback, ...stateFeedbackSummary.recentFeedback]
    };

    return newFeedback;
  }

  return apiClient.post<OperatorFeedback>(`/incidents/${payload.incidentId}/feedback`, payload);
};
