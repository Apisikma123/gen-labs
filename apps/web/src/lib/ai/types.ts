import type {
  SimulationSpecification,
  AIContextPayload,
  AIAskResponse,
  ExperimentChallenge,
  SimulationInsight,
} from '@genlab/simulation-types';
import type { UnifiedSimulatorSpec } from '../simulation/simulator-schema';

export interface AiAuthoringContext {
  concept?: string;
  learningObjective?: string;
  audience?: string;
  difficulty?: 'basic' | 'intermediate' | 'advanced';
  requestedSimulator?: string;
  discipline?: string;
  availableCapabilities?: string[];
}

export interface JsonPatchOperation {
  op: 'add' | 'remove' | 'replace' | 'move' | 'copy' | 'test';
  path: string;
  value?: unknown;
}

export interface AiPatchContext {
  selectedElement?: string;
  allowedPaths?: string[];
  userInstruction: string;
}

export interface AiPatchResult {
  patched: UnifiedSimulatorSpec;
  patches: JsonPatchOperation[];
  appliedCount: number;
}

export interface AiTutorContext {
  simulatorTitle: string;
  concept?: string;
  formula?: string;
  parameters: Record<string, { label: string; min: number; max: number; unit?: string; value: number }>;
  currentState: Record<string, number>;
  derivedResults: Record<string, number | string>;
  currentInsight?: string;
  activeExperiment?: {
    id: string;
    title: string;
    targetMetric: string;
    targetValue: number;
    currentValue?: number;
    achieved?: boolean;
  };
  question: string;
}

export interface AiTutorResult {
  answer: string;
  suggestedAction?: {
    type: 'adjust_parameter';
    parameter: string;
    suggestedValue: number;
    reasoning: string;
  };
  usage?: {
    promptTokens?: number;
    candidatesTokens?: number;
    totalTokens?: number;
  };
}

export interface AiProvider {
  name: string;

  /**
   * Gen Labs Real Gemini Core: Generate UnifiedSimulatorSpec from concept prompt.
   */
  generateSimulator(prompt: string, context?: Partial<AiAuthoringContext>): Promise<UnifiedSimulatorSpec>;

  /**
   * Gen Labs Real Gemini Core: Surgical JSON Patch modification.
   */
  patchSimulator(spec: UnifiedSimulatorSpec, instruction: string, context?: Partial<AiPatchContext>): Promise<AiPatchResult>;

  /**
   * Gen Labs Real Gemini Core: Live contextual student tutor.
   */
  tutor(context: AiTutorContext): Promise<AiTutorResult>;

  // Legacy compatibility methods
  generateSimulation(prompt: string): Promise<SimulationSpecification>;
  answerQuestion(question: string, context: AIContextPayload): Promise<AIAskResponse>;
  generateExperiment(context: AIContextPayload): Promise<ExperimentChallenge>;
  generateInsight(
    before: Record<string, number>,
    after: Record<string, number>,
    computed: Record<string, number | string>,
    spec: SimulationSpecification
  ): Promise<SimulationInsight>;
}

