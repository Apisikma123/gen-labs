import { apiClient } from './client';
import { SimulationModel } from './simulations';

export interface AdminMetrics {
  totalSimulations: number;
  totalModules: number;
  totalUsers?: number;
  totalStudents: number;
  totalAdmins?: number;
  publishedCount: number;
  draftCount: number;
  archivedCount: number;
  totalSessions: number;
  totalEvents: number;
  completedExperiments: number;
  validationSuccessPercent: number;
  aiMonitoring?: {
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
  };
}

export interface AdminUserModel {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'student';
  status: 'active' | 'inactive';
  avatar?: string;
  created_at: string;
  updated_at?: string;
}

export interface StudyProgramModel {
  id: number;
  name: string;
  code?: string;
  description?: string;
  status: 'active' | 'inactive';
  topics_count?: number;
  created_at?: string;
}

export interface TopicModel {
  id: number;
  study_program_id?: number;
  name: string;
  description?: string;
  status: 'active' | 'inactive';
  study_program?: StudyProgramModel;
  created_at?: string;
}

export interface DifficultyModel {
  id: number;
  name: string;
  slug: string;
  status: 'active' | 'inactive';
}

export interface ActivityModel {
  id: number;
  user_name: string;
  role: string;
  action: string;
  target: string;
  ip_address?: string;
  created_at: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface AdminSettingsModel {
  ai: {
    provider: string;
    status: string;
    model: string;
    light_model: string;
    api_key_status: string;
    rate_limit: string;
    max_tokens: number;
  };
  system: {
    app_name: string;
    environment: string;
    php_version: string;
    laravel_version: string;
    database: string;
    auth_driver: string;
    timezone: string;
  };
}

export const adminApi = {
  // Metrics & Dashboard
  getMetrics: async (): Promise<{ success: boolean; metrics: AdminMetrics; recentSessions?: unknown[] }> => {
    return apiClient.get<{ success: boolean; metrics: AdminMetrics; recentSessions?: unknown[] }>('/admin/metrics');
  },

  // User Management
  getUsers: async (params?: { search?: string; role?: string; status?: string; page?: number; per_page?: number }): Promise<{ success: boolean; data: AdminUserModel[]; meta: PaginationMeta }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.role && params.role !== 'all') qs.set('role', params.role);
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    const qStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<{ success: boolean; data: AdminUserModel[]; meta: PaginationMeta }>(`/admin/users${qStr}`);
  },

  getUser: async (id: number | string): Promise<{ success: boolean; user: AdminUserModel }> => {
    return apiClient.get<{ success: boolean; user: AdminUserModel }>(`/admin/users/${id}`);
  },

  createUser: async (payload: { name: string; email: string; password: string; role: string }): Promise<{ success: boolean; message: string; user: AdminUserModel }> => {
    return apiClient.post<{ success: boolean; message: string; user: AdminUserModel }>('/admin/users', payload);
  },

  updateUser: async (id: number | string, payload: { name: string; email: string; role?: string; password?: string }): Promise<{ success: boolean; message: string; user: AdminUserModel }> => {
    return apiClient.patch<{ success: boolean; message: string; user: AdminUserModel }>(`/admin/users/${id}`, payload);
  },

  toggleUserStatus: async (id: number | string): Promise<{ success: boolean; message: string; user: AdminUserModel }> => {
    return apiClient.patch<{ success: boolean; message: string; user: AdminUserModel }>(`/admin/users/${id}/toggle-status`, {});
  },

  deleteUser: async (id: number | string): Promise<{ success: boolean; message: string }> => {
    return apiClient.delete<{ success: boolean; message: string }>(`/admin/users/${id}`);
  },

  // Master Data: Bidang (Categories)
  getStudyPrograms: async (params?: { search?: string; status?: string }): Promise<{ success: boolean; data: StudyProgramModel[] }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    const qStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<{ success: boolean; data: StudyProgramModel[] }>(`/admin/master-data/study-programs${qStr}`);
  },

  createStudyProgram: async (payload: { name: string; code?: string; description?: string }): Promise<{ success: boolean; message: string; data: StudyProgramModel }> => {
    return apiClient.post<{ success: boolean; message: string; data: StudyProgramModel }>('/admin/master-data/study-programs', payload);
  },

  updateStudyProgram: async (id: number | string, payload: { name: string; code?: string; description?: string; status?: string }): Promise<{ success: boolean; message: string; data: StudyProgramModel }> => {
    return apiClient.patch<{ success: boolean; message: string; data: StudyProgramModel }>(`/admin/master-data/study-programs/${id}`, payload);
  },

  toggleStudyProgramStatus: async (id: number | string): Promise<{ success: boolean; message: string; data: StudyProgramModel }> => {
    return apiClient.patch<{ success: boolean; message: string; data: StudyProgramModel }>(`/admin/master-data/study-programs/${id}/toggle-status`, {});
  },

  // Master Data: Topics
  getTopics: async (params?: { search?: string; study_program_id?: number | string; status?: string }): Promise<{ success: boolean; data: TopicModel[] }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.study_program_id) qs.set('study_program_id', String(params.study_program_id));
    if (params?.status && params.status !== 'all') qs.set('status', params.status);
    const qStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<{ success: boolean; data: TopicModel[] }>(`/admin/master-data/topics${qStr}`);
  },

  createTopic: async (payload: { name: string; study_program_id?: number | string; description?: string }): Promise<{ success: boolean; message: string; data: TopicModel }> => {
    return apiClient.post<{ success: boolean; message: string; data: TopicModel }>('/admin/master-data/topics', payload);
  },

  updateTopic: async (id: number | string, payload: { name: string; study_program_id?: number | string; description?: string; status?: string }): Promise<{ success: boolean; message: string; data: TopicModel }> => {
    return apiClient.patch<{ success: boolean; message: string; data: TopicModel }>(`/admin/master-data/topics/${id}`, payload);
  },

  toggleTopicStatus: async (id: number | string): Promise<{ success: boolean; message: string; data: TopicModel }> => {
    return apiClient.patch<{ success: boolean; message: string; data: TopicModel }>(`/admin/master-data/topics/${id}/toggle-status`, {});
  },

  // Master Data: Difficulties
  getDifficulties: async (): Promise<{ success: boolean; data: DifficultyModel[] }> => {
    return apiClient.get<{ success: boolean; data: DifficultyModel[] }>('/admin/master-data/difficulties');
  },

  toggleDifficultyStatus: async (id: number | string): Promise<{ success: boolean; message: string; data: DifficultyModel }> => {
    return apiClient.patch<{ success: boolean; message: string; data: DifficultyModel }>(`/admin/master-data/difficulties/${id}/toggle-status`, {});
  },

  // Activity Log
  getActivities: async (params?: { search?: string; page?: number; per_page?: number }): Promise<{ success: boolean; data: ActivityModel[]; meta: PaginationMeta }> => {
    const qs = new URLSearchParams();
    if (params?.search) qs.set('search', params.search);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    const qStr = qs.toString() ? `?${qs.toString()}` : '';
    return apiClient.get<{ success: boolean; data: ActivityModel[]; meta: PaginationMeta }>(`/admin/activities${qStr}`);
  },

  // Settings
  getSettings: async (): Promise<{ success: boolean; settings: AdminSettingsModel }> => {
    return apiClient.get<{ success: boolean; settings: AdminSettingsModel }>('/admin/settings');
  },

  // Simulations
  getSimulations: async (status?: string, search?: string): Promise<{ success: boolean; simulations: SimulationModel[] }> => {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.set('status', status);
    if (search) params.set('search', search);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient.get<{ success: boolean; simulations: SimulationModel[] }>(`/admin/simulations${qs}`);
  },

  updateStatus: async (
    idOrSlug: string | number,
    status: 'published' | 'validating' | 'draft' | 'archived' | 'active' | string
  ): Promise<{ success: boolean; simulation: SimulationModel }> => {
    return apiClient.patch<{ success: boolean; simulation: SimulationModel }>(`/admin/simulations/${idOrSlug}`, {
      status,
    });
  },
};
