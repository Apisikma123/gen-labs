import { apiClient } from './client';

export interface SimulationVariable {
  id: string;
  label: string;
  unit: string;
  min: number;
  max: number;
  default: number;
  step?: number;
}

export interface SimulationConfig {
  type: string;
  concept: string;
  formula?: string;
  variables: SimulationVariable[];
  interactions?: string[];
  [key: string]: unknown;
}

export interface SimulationModel {
  id: number;
  slug: string;
  title: string;
  type: string;
  formula?: string;
  difficulty?: string;
  configuration?: SimulationConfig;
  concept?: {
    id: number;
    name: string;
    category: string;
  };
}

export interface ExperimentTarget {
  parameter: string;
  targetValue: number;
  tolerance: number;
  unit?: string;
}

export interface ExperimentModel {
  id: number;
  module_id: number;
  simulation_id?: number;
  title: string;
  objective: string;
  target: ExperimentTarget;
  rules?: {
    heldConstant?: string[];
    expectedValue?: Record<string, number>;
  };
  status: string;
  attempts?: ExperimentAttemptModel[];
}

export interface ExperimentAttemptModel {
  id: number;
  experiment_id: number;
  user_id?: number;
  state: Record<string, unknown>;
  result: {
    actualValue: number;
    targetValue: number;
    delta: number;
    message: string;
  };
  delta: number;
  passed: boolean;
  created_at?: string;
}

export interface InsightModel {
  id: number;
  module_id: number;
  title: string;
  content: string;
}

export interface QuestionModel {
  id: number;
  module_id: number;
  question: string;
  answer: string;
  simulation_state?: Record<string, unknown>;
  follow_ups?: string[];
  created_at?: string;
}

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  has_more: boolean;
}

export interface CurriculumAlignmentModel {
  id: number;
  module_id: number;
  simulation_id?: number | null;
  curriculum_version: string;
  education_level: 'smp' | 'sma' | 'smk' | 'higher_education';
  curriculum_phase?: string | null;
  grade_level?: string | null;
  study_program?: string | null;
  semester?: number | null;
  subject_or_course: string;
  chapter_or_unit?: string | null;
  topic?: string | null;
  learning_objective_code?: string | null;
  learning_objective_desc?: string | null;
  official_source_title: string;
  official_source_code: string;
  official_source_url?: string | null;
  verification_status: 'verified' | 'proposed' | 'unverified' | 'pilot';
  verification_notes?: string | null;
  is_primary: boolean;
}

export interface ModuleModel {
  id: number;
  slug: string;
  title: string;
  description: string;
  cover_image?: string | null;
  thumbnail_image?: string | null;
  ai_thumbnail?: boolean;
  topic?: string | null;
  estimated_time?: string | null;
  content: string;
  learning_objectives: string[];
  discipline: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
  target_audience: string;
  education_level?: 'smp' | 'sma' | 'smk' | 'higher_education' | null;
  grade_level?: string | null;
  curriculum_phase?: string | null;
  subject_name?: string | null;
  curriculum_source?: string | null;
  verification_status?: 'verified' | 'proposed' | 'unverified' | 'pilot';
  status: 'draft' | 'published' | 'archived';
  created_by?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
  simulations?: SimulationModel[];
  curriculum_alignments?: CurriculumAlignmentModel[];
  experiments?: ExperimentModel[];
  insights?: InsightModel[];
  questions?: QuestionModel[];
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface ModuleDraftResponse {
  success: boolean;
  status: 'draft';
  message?: string;
  draft: {
    is_draft: boolean;
    status: 'draft';
    slug: string;
    title: string;
    description: string;
    discipline: string;
    topic?: string;
    difficulty: string;
    estimated_time?: string;
    cover_image?: string;
    thumbnail_image?: string;
    ai_thumbnail?: boolean;
    target_audience: string;
    learning_objectives: string[];
    content: string;
    is_reused_simulation?: boolean;
    reused_simulation_title?: string | null;
    simulation: {
      id?: number | null;
      slug: string;
      title: string;
      type: string;
      formula?: string;
      configuration: SimulationConfig;
      is_reused?: boolean;
    };
    experiment: {
      title: string;
      objective: string;
      target: ExperimentTarget;
      rules?: { heldConstant?: string[] };
    };
    insight?: {
      title: string;
      content: string;
    };
    comprehension_questions?: Array<{ question: string; hint: string }>;
  };
}

export interface TutorAskResponse {
  success: boolean;
  answer: string;
  explanation?: string;
  follow_ups: string[];
  question_id?: number;
}

export interface AttemptSubmissionResponse {
  success: boolean;
  passed: boolean;
  attempt: {
    id: number;
    actualValue: number;
    targetValue: number;
    delta: number;
    unit?: string;
    passed: boolean;
    message: string;
  };
  insight?: InsightModel | null;
}

export interface CurriculumGradeOption {
  grade: string;
  roman?: string;
  label?: string;
  count: number;
}

export interface CurriculumProgramOption {
  code: string;
  name: string;
  count: number;
}

export interface CurriculumSemesterOption {
  semester: number;
  count: number;
}

export interface CurriculumLevelDetail {
  name: string;
  phase?: string;
  phases?: string[];
  total_modules: number;
  grades?: CurriculumGradeOption[];
  programs?: CurriculumProgramOption[];
  semesters?: CurriculumSemesterOption[];
}

export interface CurriculumOptionsResponse {
  success: boolean;
  total_published_modules: number;
  levels: {
    smp: CurriculumLevelDetail;
    sma: CurriculumLevelDetail;
    smk: CurriculumLevelDetail;
    higher_education: CurriculumLevelDetail;
  };
}

export const modulesApi = {
  /**
   * List published modules for students with filters & pagination (Section 7, 8, 9)
   */
  list: (params?: {
    discipline?: string;
    difficulty?: string;
    topic?: string;
    education_level?: string;
    grade_level?: string;
    study_program?: string;
    semester?: number | string;
    curriculum_phase?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.discipline && params.discipline !== 'all') {
      query.append('discipline', params.discipline);
    }
    if (params?.difficulty && params.difficulty !== 'all') {
      query.append('difficulty', params.difficulty);
    }
    if (params?.topic && params.topic !== 'all') {
      query.append('topic', params.topic);
    }
    if (params?.education_level && params.education_level !== 'all') {
      query.append('education_level', params.education_level);
    }
    if (params?.grade_level && params.grade_level !== 'all') {
      query.append('grade_level', params.grade_level);
    }
    if (params?.study_program && params.study_program !== 'all') {
      query.append('study_program', params.study_program);
    }
    if (params?.semester && params.semester !== 'all') {
      query.append('semester', String(params.semester));
    }
    if (params?.curriculum_phase && params.curriculum_phase !== 'all') {
      query.append('curriculum_phase', params.curriculum_phase);
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    if (params?.page) {
      query.append('page', String(params.page));
    }
    if (params?.per_page) {
      query.append('per_page', String(params.per_page));
    }
    const qStr = query.toString();
    return apiClient.get<{
      success: boolean;
      count: number;
      modules: ModuleModel[];
      pagination?: PaginationMeta;
    }>(`/modules${qStr ? `?${qStr}` : ''}`);
  },

  /**
   * Get dynamic curriculum options (education levels, grades, programs, semesters)
   */
  curriculumOptions: () =>
    apiClient.get<CurriculumOptionsResponse>('/curriculum/options'),

  /**
   * Get single module details for student learning workspace (Section 6, 9, 10)
   */
  getById: (idOrSlug: string | number) =>
    apiClient.get<{ success: boolean; module: ModuleModel }>(`/modules/${idOrSlug}`),

  /**
   * Student context-aware AI tutor asking question on active simulation
   */
  askTutor: (
    idOrSlug: string | number,
    data: { question: string; simulation_state?: Record<string, unknown>; experiment_id?: number }
  ) => apiClient.post<TutorAskResponse>(`/modules/${idOrSlug}/ask`, data),

  /**
   * Submit student experiment target attempt
   */
  submitAttempt: (
    idOrSlug: string | number,
    experimentId: number,
    data: {
      state: Record<string, unknown>;
      computed?: Record<string, unknown>;
      actual_value?: number;
      prediction?: string;
    }
  ) =>
    apiClient.post<AttemptSubmissionResponse>(
      `/modules/${idOrSlug}/experiments/${experimentId}/attempts`,
      data
    ),

  /**
   * Get student experiment attempt history (PRD Section 9)
   */
  getExperimentHistory: (params?: { page?: number; per_page?: number }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', String(params.page));
    if (params?.per_page) query.append('per_page', String(params.per_page));
    const qs = query.toString();
    return apiClient.get<{
      success: boolean;
      attempts: Array<{
        id: number;
        experiment_id: number;
        user_id: number;
        state: Record<string, unknown>;
        prediction?: string | null;
        result: {
          actualValue: number;
          targetValue: number;
          delta: number;
          message: string;
        };
        delta: number;
        passed: boolean;
        simulation_version?: string | null;
        created_at: string;
        experiment?: {
          id: number;
          title: string;
          objective: string;
          target: { parameter: string; targetValue: number; unit?: string; tolerance?: number };
          module?: { id: number; title: string; slug: string; version?: string };
          simulation?: { id: number; title: string; slug: string };
        };
      }>;
      pagination: PaginationMeta;
    }>(`/experiments/history${qs ? `?${qs}` : ''}`);
  },

  /**
   * Admin: List all modules with pagination & status filters (Section 7, 14)
   */
  adminList: (params?: {
    status?: string;
    discipline?: string;
    search?: string;
    page?: number;
    per_page?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') {
      query.append('status', params.status);
    }
    if (params?.discipline && params.discipline !== 'all') {
      query.append('discipline', params.discipline);
    }
    if (params?.search) {
      query.append('search', params.search);
    }
    if (params?.page) {
      query.append('page', String(params.page));
    }
    if (params?.per_page) {
      query.append('per_page', String(params.per_page));
    }
    const qStr = query.toString();
    return apiClient.get<{
      success: boolean;
      modules: ModuleModel[];
      stats: { total: number; published: number; draft: number; archived: number };
      pagination?: PaginationMeta;
    }>(`/admin/modules${qStr ? `?${qStr}` : ''}`);
  },

  /**
   * Admin AI Authoring: Generate structured DRAFT module (Section 4, 15)
   */
  adminGenerateDraft: (data: {
    topic: string;
    difficulty?: string;
    target?: string;
    instructions?: string;
  }) => apiClient.post<ModuleDraftResponse>('/admin/ai/generate-module', data),

  /**
   * Admin AI Simulation Canvas Generator (Section 4, 6, 7)
   */
  adminGenerateSimulationDraft: (data: {
    prompt: string;
    difficulty?: string;
  }) =>
    apiClient.post<{
      success: boolean;
      status: string;
      simulation: any;
      draft: ModuleDraftResponse['draft'];
      message: string;
    }>('/admin/simulations/generate', data),

  /**
   * Admin: Save module (draft or published)
   */
  adminCreate: (data: Partial<ModuleModel> & { simulation_slug?: string; experiment?: unknown }) =>
    apiClient.post<{ success: boolean; module: ModuleModel; message: string }>(
      '/admin/modules',
      data
    ),

  /**
   * Admin: Update module status, review, edit
   */
  adminUpdate: (id: number | string, data: Partial<ModuleModel> & { simulation_id?: number }) =>
    apiClient.patch<{ success: boolean; module: ModuleModel; message: string }>(
      `/admin/modules/${id}`,
      data
    ),

  /**
   * Admin: Delete module
   */
  adminDelete: (id: number | string) =>
    apiClient.delete<{ success: boolean; message: string }>(`/admin/modules/${id}`),
};

export const mediaApi = {
  /**
   * Upload image file (Cover or Thumbnail) with automatic server-side WebP optimization
   */
  upload: (file: File, type: 'thumbnail' | 'cover' = 'thumbnail') => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    return apiClient.post<{
      success: boolean;
      media: {
        url: string;
        filename: string;
        width: number;
        height: number;
        type: string;
        original_size_kb: number;
        optimized_size_kb: number;
        savings_pct: number;
      };
      message: string;
    }>('/admin/media/upload', formData);
  },

  /**
   * Generate an AI concept thumbnail tailored to the module title and discipline
   */
  generateAiThumbnail: (data: { title: string; discipline: string; topic?: string }) => {
    return apiClient.post<{
      success: boolean;
      media: {
        url: string;
        filename: string;
        width: number;
        height: number;
        type: string;
        is_ai: boolean;
        optimized_size_kb: number;
      };
      message: string;
    }>('/admin/media/generate-ai-thumbnail', data);
  },

  /**
   * Delete uploaded media
   */
  delete: (url: string) => {
    return apiClient.delete<{ success: boolean; message: string }>('/admin/media', {
      body: { url },
    });
  },
};
