export type SimulationEngine =
  | 'physics'
  | 'mathematics'
  | 'computer-science'
  | 'statistics'
  | 'economics'
  | 'chemistry'
  | 'biology'
  | 'engineering'
  | 'architecture'
  | 'agriculture'
  | 'general';

export type SimulationDifficulty = 'Pemula' | 'Menengah' | 'Lanjutan';
export type SimulationStatus = 'active' | 'coming_soon';

export interface SimulationCatalogItem {
  id: string;
  slug: string;
  title: string;
  discipline: string;
  disciplineSlug: string;
  category: string;
  description: string;
  difficulty: SimulationDifficulty;
  status: SimulationStatus;
  engine: SimulationEngine;
  formula?: string;
  tags: string[];
  learningObjectives: string[];
  parametersPreview?: Array<{ name: string; range: string }>;
  readoutsPreview?: string[];
}

export interface ParameterDefinition {
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  label?: string;
}

export interface SimulationSpecification {
  id?: string;
  engine: SimulationEngine;
  simulation: string;
  version: number;
  title: string;
  description: string;
  parameters: Record<string, ParameterDefinition>;
  controls: string[];
  domain?: string;
  concepts?: string[];
}

export interface SimulationState {
  parameters: Record<string, number>;
  computed: Record<string, number | string>;
  time: number;
  running: boolean;
}

export interface ExperimentTargetCondition {
  output: string;
  operator: '==' | '>=' | '<=' | '>' | '<' | '!=' | 'between';
  value: number;
  value2?: number; // for between
  tolerance?: number;
}

export interface ExperimentChallenge {
  id: string;
  title: string;
  objective?: string;
  description: string;
  allowedParameters?: string[];
  targetCondition?: ExperimentTargetCondition | string;
  hint?: string;
  hints?: string[];
}

export interface ExperimentEvent {
  parameterChanges: Array<{
    parameter: string;
    from: number;
    to: number;
  }>;
  outputs: Record<string, number | string>;
  timestamp: number;
}

export interface ExperimentEvaluation {
  success: boolean;
  currentValue: number;
  targetValue: number;
  message: string;
  toleranceMet?: boolean;
}

export interface ExperimentResult {
  challengeId: string;
  startState: Record<string, number>;
  endState: Record<string, number>;
  changes: Array<{ parameter: string; from: number; to: number }>;
  computed: Record<string, number | string>;
  success: boolean;
  duration: number;
  events?: ExperimentEvent[];
}

export interface SimulationInsight {
  title: string;
  changes: Array<{ parameter: string; from: number; to: number; unit?: string }>;
  held: Array<{ parameter: string; value: number; unit?: string }>;
  result: { label: string; from: string; to: string };
  keyInsight: string;
  tryNext?: string;
  nextPrompt?: string;
}

export interface SimulationSearchResult {
  simulationId: string;
  slug: string;
  title: string;
  domain: string;
  engine: SimulationEngine;
  version: number;
  similarityScore: number; // 0 to 1
  matchReason: string;
  isExactMatch: boolean;
  concepts: string[];
}

export interface AIAction {
  type: 'set_parameters' | 'start_challenge' | 'reset' | 'compare';
  label: string;
  parameters?: Record<string, number>;
  challenge?: ExperimentChallenge;
  preview?: {
    parameter: string;
    from: number | string;
    to: number | string;
    predictedOutput?: string;
  };
}

export interface AIContextPayload {
  simulation: {
    id: string;
    slug?: string;
    title: string;
    domain: string;
    engine: string;
    description: string;
  };
  state: {
    parameters: Record<string, number>;
    computed: Record<string, number | string>;
  };
  experiment?: {
    challengeId: string;
    title: string;
    objective?: string;
    isCompleted: boolean;
    targetCondition?: ExperimentTargetCondition | string;
  };
  history?: ExperimentEvent[];
  recentQuestions?: string[];
}

export interface AIAskResponse {
  answer: string;
  confidence?: number;
  suggestedPrompts?: string[];
  action?: AIAction;
  predictedState?: Record<string, number | string>;
}

export interface AISimulationGenerationResult {
  specification: SimulationSpecification;
  reasoning?: string;
  recommendedChallenge?: ExperimentChallenge;
}
