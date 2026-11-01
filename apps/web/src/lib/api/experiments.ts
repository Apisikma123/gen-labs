import { apiClient } from './client';

export interface ExperimentModel {
  id: string | number;
  session_id: string | number;
  title: string;
  objective: string;
  target_condition: {
    output: string;
    targetValue: number;
    tolerance?: number;
    unit?: string;
  };
  rules?: {
    allowedParameters?: string[];
    heldConstant?: string[];
  };
  status?: 'pending' | 'in_progress' | 'completed' | 'failed';
}

export interface AttemptResult {
  success: boolean;
  actualValue: number;
  targetValue: number;
  delta: number;
  withinTolerance: boolean;
  passed: boolean;
  message: string;
  feedback?: string;
}

export const experimentsApi = {
  create: async (
    sessionId: string | number,
    data: Partial<ExperimentModel>
  ): Promise<{ success: boolean; experiment: ExperimentModel }> => {
    return apiClient.post<{ success: boolean; experiment: ExperimentModel }>(
      `/sessions/${sessionId}/experiments`,
      data
    );
  },

  submitAttempt: async (
    experimentId: string | number,
    data: {
      parameters: Record<string, number>;
      computed: Record<string, unknown>;
    }
  ): Promise<{ success: boolean; attempt: AttemptResult }> => {
    return apiClient.post<{ success: boolean; attempt: AttemptResult }>(
      `/experiments/${experimentId}/attempts`,
      data
    );
  },
};
