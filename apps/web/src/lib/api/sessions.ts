import { apiClient } from './client';

export interface LearningSessionModel {
  id: string | number;
  user_id?: string | number;
  module_id?: string | number;
  simulation_id?: string | number;
  slug?: string;
  title?: string;
  discipline?: string;
  current_state: Record<string, unknown>;
  progress?: number;
  started_at: string;
  completed_at?: string;
  last_active_at: string;
  module?: {
    id: string | number;
    title: string;
    slug: string;
    discipline?: string;
    difficulty?: string;
    description?: string;
    thumbnail_image?: string;
    cover_image?: string;
    topic?: string;
    estimated_time?: string;
    simulations?: Array<{
      id: string | number;
      title: string;
      slug: string;
      type?: string;
    }>;
  };
  simulation?: {
    id: string | number;
    title: string;
    slug: string;
  };
}

export interface SessionsResponse {
  success: boolean;
  sessions: LearningSessionModel[];
  pagination?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    has_more: boolean;
  };
}

const LOCAL_STORAGE_KEY = 'genlabs_learning_sessions';

function getLocalSessions(): LearningSessionModel[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY) || localStorage.getItem('simula_learning_sessions');
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalSession(session: LearningSessionModel): void {
  if (typeof window === 'undefined') return;
  try {
    const list = getLocalSessions();
    const idx = list.findIndex(
      (s) => String(s.id) === String(session.id) || (s.slug && session.slug && s.slug === session.slug)
    );
    if (idx >= 0) {
      list[idx] = { ...list[idx], ...session, last_active_at: new Date().toISOString() };
    } else {
      list.unshift({ ...session, last_active_at: new Date().toISOString() });
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage quota
  }
}

export const sessionsApi = {
  create: async (
    moduleIdOrSimulationId: string | number,
    initialState: Record<string, unknown> = {},
    progress: number = 0
  ): Promise<{ success: boolean; session: LearningSessionModel }> => {
    const slug = String(moduleIdOrSimulationId).toLowerCase();
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    const localSession: LearningSessionModel = {
      id: `ses-${slug}-${Date.now()}`,
      slug,
      title,
      discipline: 'Laboratorium GEN LABS',
      current_state: initialState,
      progress,
      started_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
      completed_at: progress >= 100 ? new Date().toISOString() : undefined,
      module: {
        id: slug,
        slug,
        title,
        discipline: 'Laboratorium GEN LABS',
      },
    };

    saveLocalSession(localSession);

    try {
      const res = await apiClient.post<{ success: boolean; session: LearningSessionModel }>('/sessions', {
        module_id: moduleIdOrSimulationId,
        initial_state: initialState,
        progress,
      });
      if (res?.session) {
        saveLocalSession(res.session);
        return res;
      }
    } catch {
      // Local fallback succeeds transparently
    }

    return { success: true, session: localSession };
  },

  list: async (params?: { page?: number; per_page?: number }): Promise<SessionsResponse> => {
    const page = params?.page || 1;
    const perPage = params?.per_page || 8;

    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.set('page', String(params.page));
      if (params?.per_page) searchParams.set('per_page', String(params.per_page));
      const query = searchParams.toString();
      const res = await apiClient.get<SessionsResponse>(`/sessions${query ? `?${query}` : ''}`);
      if (res?.success && Array.isArray(res.sessions) && res.sessions.length > 0) {
        for (const s of res.sessions) {
          saveLocalSession(s);
        }
        return res;
      }
    } catch {
      // Network/proxy fallback
    }

    // Load from local storage
    const local = getLocalSessions();
    const startIndex = (page - 1) * perPage;
    const paginated = local.slice(startIndex, startIndex + perPage);
    const lastPage = Math.max(1, Math.ceil(local.length / perPage));

    return {
      success: true,
      sessions: paginated,
      pagination: {
        current_page: page,
        last_page: lastPage,
        per_page: perPage,
        total: local.length,
        from: local.length > 0 ? startIndex + 1 : null,
        to: Math.min(startIndex + perPage, local.length),
        has_more: page < lastPage,
      },
    };
  },

  getById: async (id: string | number): Promise<{ success: boolean; session: LearningSessionModel }> => {
    try {
      const res = await apiClient.get<{ success: boolean; session: LearningSessionModel }>(`/sessions/${id}`);
      if (res?.success && res.session) {
        saveLocalSession(res.session);
        return res;
      }
    } catch {
      // Local fallback
    }

    const local = getLocalSessions();
    const found = local.find((s) => String(s.id) === String(id) || s.slug === String(id));
    if (found) {
      return { success: true, session: found };
    }

    return {
      success: false,
      session: {
        id,
        current_state: {},
        started_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      },
    };
  },

  updateState: async (
    id: string | number,
    state: Record<string, unknown>,
    progress?: number
  ): Promise<{ success: boolean; session: LearningSessionModel }> => {
    const local = getLocalSessions();
    const existing = local.find((s) => String(s.id) === String(id) || s.slug === String(id));
    if (existing) {
      existing.current_state = { ...existing.current_state, ...state };
      if (typeof progress === 'number') {
        existing.progress = progress;
      }
      if (progress && progress >= 100) {
        existing.completed_at = new Date().toISOString();
      }
      existing.last_active_at = new Date().toISOString();
      saveLocalSession(existing);
    }

    try {
      const res = await apiClient.patch<{ success: boolean; session: LearningSessionModel }>(`/sessions/${id}`, {
        state,
        progress,
      });
      if (res?.session) {
        saveLocalSession(res.session);
        return res;
      }
    } catch {
      // Local fallback succeeds
    }

    return {
      success: true,
      session: existing || {
        id,
        current_state: state,
        progress: progress || 0,
        started_at: new Date().toISOString(),
        last_active_at: new Date().toISOString(),
      },
    };
  },
};
