export { registerSimulation, getSimulation, listSimulations, defaultGenerateInsight, defaultInitialState, defaultUpdate } from './engine';
export type { SimulationDefinition, SimulationRenderer } from './engine';

export { evaluateTargetCondition } from './evaluator';
export { searchSimulations, findBestSimulationMatch, normalizeQuery } from './search';
export { MASTER_SIMULATION_CATALOG, ACTIVE_SIMULATION_CATALOG, COMBINED_SIMULATION_CATALOG, GENLAB_CATALOG_ITEMS, DISCIPLINES } from './catalog';


// Individual simulations
export { newtonsSecondLaw } from './simulations/newtons-second-law';
export { projectileMotion } from './simulations/projectile-motion';
export { momentumCollision } from './simulations/momentum-collision';
export { functionExplorer } from './simulations/function-explorer';
export { vectorMath } from './simulations/vector-math';
export { probabilityCoin } from './simulations/probability-coin';
export { sortingVisualizer, generateSortingSteps } from './simulations/sorting-visualizer';
export type { SortingStep } from './simulations/sorting-visualizer';
export { binarySearch, generateBinarySearchData } from './simulations/binary-search';
export { graphTraversal, CANONICAL_GRAPH } from './simulations/graph-traversal';
export { linearRegression, generateRegressionPoints } from './simulations/linear-regression';
export { normalDistribution } from './simulations/normal-distribution';
export { supplyDemand } from './simulations/supply-demand';
export { compoundInterest } from './simulations/compound-interest';
export { phScale } from './simulations/ph-scale';
export * from './genlab-simulations';

import { registerSimulation } from './engine';
import { newtonsSecondLaw } from './simulations/newtons-second-law';
import { projectileMotion } from './simulations/projectile-motion';
import { momentumCollision } from './simulations/momentum-collision';
import { functionExplorer } from './simulations/function-explorer';
import { vectorMath } from './simulations/vector-math';
import { probabilityCoin } from './simulations/probability-coin';
import { sortingVisualizer } from './simulations/sorting-visualizer';
import { binarySearch } from './simulations/binary-search';
import { graphTraversal } from './simulations/graph-traversal';
import { linearRegression } from './simulations/linear-regression';
import { normalDistribution } from './simulations/normal-distribution';
import { supplyDemand } from './simulations/supply-demand';
import { compoundInterest } from './simulations/compound-interest';
import { phScale } from './simulations/ph-scale';
import { GENLAB_SIMULATIONS } from './genlab-simulations';

export function registerAllSimulations() {
  registerSimulation('physics:newtons_second_law', newtonsSecondLaw);
  registerSimulation('physics:projectile_motion', projectileMotion);
  registerSimulation('physics:momentum_collision', momentumCollision);
  registerSimulation('mathematics:function_explorer', functionExplorer);
  registerSimulation('mathematics:vector_math', vectorMath);
  registerSimulation('mathematics:probability_distribution', probabilityCoin);
  registerSimulation('computer-science:sorting_visualizer', sortingVisualizer);
  registerSimulation('computer-science:binary_search', binarySearch);
  registerSimulation('computer-science:graph_traversal', graphTraversal);
  registerSimulation('statistics:linear_regression', linearRegression);
  registerSimulation('statistics:normal_distribution', normalDistribution);
  registerSimulation('economics:supply_demand', supplyDemand);
  registerSimulation('economics:compound_interest', compoundInterest);
  registerSimulation('chemistry:ph_scale', phScale);

  for (const [key, sim] of Object.entries(GENLAB_SIMULATIONS)) {
    registerSimulation(key, sim);
    if (!key.includes(':')) {
      registerSimulation(`genlab:${key}`, sim);
    }
  }
}

