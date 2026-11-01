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

export interface SimulationModel {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  discipline: string;
  disciplineSlug: string;
  engine: string;
  formula: string;
  difficulty?: string;
  variables?: SimulationVariable[];
  status?: string;
  version?: number;
}

export const simulationsApi = {
  list: async (discipline?: string): Promise<{ success: boolean; simulations: SimulationModel[] }> => {
    const query = discipline ? `?discipline=${encodeURIComponent(discipline)}` : '';
    return apiClient.get<{ success: boolean; simulations: SimulationModel[] }>(`/simulations${query}`);
  },

  getById: async (id: string | number): Promise<{ success: boolean; simulation: SimulationModel }> => {
    return apiClient.get<{ success: boolean; simulation: SimulationModel }>(`/simulations/${id}`);
  },

  search: async (q: string): Promise<{ success: boolean; simulations: SimulationModel[]; exactMatch?: boolean }> => {
    return apiClient.get<{ success: boolean; simulations: SimulationModel[]; exactMatch?: boolean }>(
      `/simulations/search?q=${encodeURIComponent(q)}`
    );
  },
};
