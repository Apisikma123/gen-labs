import { apiClient } from './client';
import { SimulationModel } from './simulations';

export interface SimulationRequestResponse {
  success: boolean;
  status: 'existing' | 'generated';
  simulation: SimulationModel;
  explanation?: string;
  source?: string;
}

export type TutorState = 'STATE_A' | 'STATE_B' | 'STATE_C' | 'STATE_D';

export interface SourceItem {
  type: 'internal' | 'external' | 'general_science';
  id: string;
  title: string;
  publisher?: string;
  year?: number;
  url: string;
  status: 'verified' | 'supporting' | 'unverified';
  excerpt?: string;
  snippet?: string;
}

export interface TutorResponse {
  success: boolean;
  state?: TutorState;
  answer: string;
  explanation?: string;
  sources?: SourceItem[];
  action?: {
    type: 'apply_parameters';
    parameters: Record<string, number>;
  };
  suggestedFollowUp?: string[];
  quota?: {
    daily_limit: number;
    used: number;
    remaining: number;
    reset_at: string;
  };
}

export interface InsightModel {
  id: string | number;
  session_id: string | number;
  title: string;
  discovery: string;
  mathematical_delta?: string;
  next_challenge?: string;
}

export interface AiUsageModel {
  daily_limit: number;
  used: number;
  remaining: number;
  reset_at: string;
  rate_limit: {
    limit: number;
    window_minutes: number;
  };
}

export interface AiAdminMonitoringModel {
  usage_date: string;
  requests_today: number;
  successful_requests: number;
  global_daily_limit: number;
  usage_percentage: number;
  active_users_today: number;
  gemini_failures: number;
  rate_limited_requests: number;
  quota_exceeded_requests: number;
  scope_guard_rejected: number;
  avg_latency_ms: number;
}

export const aiApi = {
  requestSimulation: async (prompt: string): Promise<SimulationRequestResponse> => {
    return apiClient.post<SimulationRequestResponse>('/ai/simulation-request', {
      prompt,
    });
  },

  askTutor: async (data: {
    question: string;
    simulation_id?: string | number;
    state?: Record<string, unknown>;
    context?: Record<string, unknown>;
    history?: { role: string; content: string }[];
  }): Promise<TutorResponse> => {
    return apiClient.post<TutorResponse>('/ai/tutor', data);
  },

  getUsage: async (): Promise<AiUsageModel> => {
    return apiClient.get<AiUsageModel>('/ai/usage');
  },

  getAdminMonitoring: async (): Promise<{ success: boolean; monitoring: AiAdminMonitoringModel }> => {
    return apiClient.get<{ success: boolean; monitoring: AiAdminMonitoringModel }>('/admin/ai/usage');
  },

  getInsights: async (
    sessionId: string | number
  ): Promise<{ success: boolean; insights: InsightModel[] }> => {
    return apiClient.get<{ success: boolean; insights: InsightModel[] }>(
      `/sessions/${sessionId}/insights`
    );
  },
};
