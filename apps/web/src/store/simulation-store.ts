import { create } from 'zustand';
import type {
  SimulationSpecification,
  SimulationState,
  SimulationInsight,
  ExperimentChallenge,
  ExperimentEvent,
  ExperimentEvaluation,
  AIAction,
} from '@genlab/simulation-types';
import type { SimulationDefinition } from '@genlab/simulation-core';
import { evaluateTargetCondition, defaultGenerateInsight } from '@genlab/simulation-core';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  action?: AIAction;
}

interface SimulationStore {
  definition: SimulationDefinition | null;
  spec: SimulationSpecification | null;
  state: SimulationState | null;
  previousParams: Record<string, number> | null;
  activeChallenge: ExperimentChallenge | null;
  experimentActive: boolean;
  experimentStartParams: Record<string, number> | null;
  experimentEvaluation: ExperimentEvaluation | null;
  experimentHistory: ExperimentEvent[];
  insight: SimulationInsight | null;
  chatMessages: ChatMessage[];

  loadSimulation: (def: SimulationDefinition) => void;
  setParameter: (key: string, value: number) => void;
  resetParameters: () => void;
  selectChallenge: (challenge: ExperimentChallenge) => void;
  startExperiment: (challenge?: ExperimentChallenge) => void;
  endExperiment: () => void;
  clearInsight: () => void;
  addChatMessage: (role: 'user' | 'assistant', content: string, action?: AIAction) => void;
  executeAIAction: (action: AIAction) => void;
  clearChat: () => void;
}

export const useSimulationStore = create<SimulationStore>((set, get) => ({
  definition: null,
  spec: null,
  state: null,
  previousParams: null,
  activeChallenge: null,
  experimentActive: false,
  experimentStartParams: null,
  experimentEvaluation: null,
  experimentHistory: [],
  insight: null,
  chatMessages: [],

  loadSimulation: (def) => {
    const params: Record<string, number> = {};
    for (const [key, p] of Object.entries(def.spec.parameters)) {
      params[key] = p.value;
    }
    const defaultChallenge = def.experiments?.[0] || null;

    const initialState: SimulationState = def.createInitialState
      ? def.createInitialState(params)
      : {
          parameters: { ...params },
          computed: def.compute(params),
          time: 0,
          running: false,
        };

    set({
      definition: def,
      spec: def.spec,
      state: initialState,
      previousParams: null,
      activeChallenge: defaultChallenge,
      experimentActive: false,
      experimentStartParams: null,
      experimentEvaluation: null,
      experimentHistory: [],
      insight: null,
      chatMessages: [],
    });
  },

  setParameter: (key, value) => {
    const { definition, state, experimentActive, activeChallenge, experimentStartParams, experimentHistory } = get();
    if (!definition || !state) return;

    const prev = { ...state.parameters };
    const next = { ...state.parameters, [key]: value };
    const computed = definition.compute(next);

    let evaluation: ExperimentEvaluation | null = null;
    let nextHistory = experimentHistory;

    if (experimentActive && activeChallenge?.targetCondition) {
      evaluation = evaluateTargetCondition(
        activeChallenge.targetCondition,
        computed,
        next,
        experimentStartParams || prev,
        activeChallenge.allowedParameters
      );

      const event: ExperimentEvent = {
        parameterChanges: [{ parameter: key, from: prev[key], to: value }],
        outputs: computed,
        timestamp: Date.now(),
      };
      nextHistory = [...experimentHistory, event];
    }

    set({
      previousParams: prev,
      state: { ...state, parameters: next, computed },
      experimentEvaluation: evaluation,
      experimentHistory: nextHistory,
    });
  },

  resetParameters: () => {
    const { definition, activeChallenge, experimentActive, experimentStartParams } = get();
    if (!definition) return;
    const params: Record<string, number> = {};
    for (const [key, p] of Object.entries(definition.spec.parameters)) {
      params[key] = p.value;
    }
    const initial: SimulationState = definition.createInitialState
      ? definition.createInitialState(params)
      : {
          parameters: { ...params },
          computed: definition.compute(params),
          time: 0,
          running: false,
        };

    let evalReset: ExperimentEvaluation | null = null;
    if (experimentActive && activeChallenge?.targetCondition) {
      evalReset = evaluateTargetCondition(
        activeChallenge.targetCondition,
        initial.computed,
        params,
        experimentStartParams || params,
        activeChallenge.allowedParameters
      );
    }

    set({
      state: initial,
      previousParams: null,
      experimentEvaluation: evalReset,
      insight: null,
    });
  },

  selectChallenge: (challenge) => {
    const { state } = get();
    let initialEval: ExperimentEvaluation | null = null;
    if (state && challenge.targetCondition) {
      initialEval = evaluateTargetCondition(challenge.targetCondition, state.computed);
    }
    set({
      activeChallenge: challenge,
      experimentEvaluation: initialEval,
    });
  },

  startExperiment: (challenge) => {
    const { state, activeChallenge } = get();
    if (!state) return;

    const targetChallenge = challenge || activeChallenge;
    const currentParams = { ...state.parameters };

    let initialEval: ExperimentEvaluation | null = null;
    if (targetChallenge?.targetCondition) {
      initialEval = evaluateTargetCondition(targetChallenge.targetCondition, state.computed, currentParams, currentParams, targetChallenge.allowedParameters);
    }

    set({
      activeChallenge: targetChallenge,
      experimentActive: true,
      experimentStartParams: currentParams,
      experimentEvaluation: initialEval,
      experimentHistory: [],
      insight: null,
    });
  },

  endExperiment: () => {
    const { definition, spec, state, experimentStartParams, experimentHistory, activeChallenge } = get();
    if (!definition || !spec || !state || !experimentStartParams) return;

    const insight = definition.generateInsight
      ? definition.generateInsight(experimentStartParams, state.parameters, spec)
      : defaultGenerateInsight(experimentStartParams, state.parameters, spec);

    // If challenge had specific target condition, enrich insight
    if (activeChallenge?.objective) {
      insight.title = `Discovery: ${activeChallenge.title}`;
    }

    set({
      experimentActive: false,
      insight,
      experimentHistory,
    });
  },

  clearInsight: () => set({ insight: null }),

  addChatMessage: (role, content, action) => {
    const msg: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      role,
      content,
      timestamp: Date.now(),
      action,
    };
    set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
  },

  executeAIAction: (action) => {
    if (action.type === 'set_parameters' && action.parameters) {
      for (const [k, v] of Object.entries(action.parameters)) {
        get().setParameter(k, v);
      }
    } else if (action.type === 'start_challenge' && action.challenge) {
      get().startExperiment(action.challenge);
    } else if (action.type === 'reset') {
      get().resetParameters();
    }
  },

  clearChat: () => set({ chatMessages: [] }),
}));
