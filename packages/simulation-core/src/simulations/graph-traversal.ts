import type { SimulationSpecification, ExperimentChallenge } from '@genlab/simulation-types';
import type { SimulationDefinition } from '../engine';

const spec: SimulationSpecification = {
  engine: 'computer-science',
  simulation: 'graph_traversal',
  version: 1,
  title: 'Pelacakan Graf: BFS vs DFS',
  description: 'Visualisasi eksplorasi simpul graf menggunakan Breadth-First Search (Queue / antrean) dan Depth-First Search (Stack / tumpukan).',
  domain: 'Informatika',
  concepts: ['graf', 'bfs', 'dfs', 'struktur data', 'antrean', 'tumpukan', 'lintasan terpendek'],
  parameters: {
    algorithm: { value: 0, min: 0, max: 1, step: 1, unit: 'mode', label: 'Metode (0=BFS, 1=DFS)' },
    startNode: { value: 0, min: 0, max: 5, step: 1, unit: 'node', label: 'Simpul Awal (0:A s.d. 5:F)' },
  },
  controls: ['algorithm', 'startNode'],
};

// Canonical 6-node university graph
// A(0) -- B(1) -- D(3)
//  |       |       |
// C(2) -- E(4) -- F(5)
export const CANONICAL_GRAPH = {
  nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
  adj: [
    [1, 2],    // A connects to B, C
    [0, 3, 4], // B connects to A, D, E
    [0, 4],    // C connects to A, E
    [1, 5],    // D connects to B, F
    [1, 2, 5], // E connects to B, C, F
    [3, 4],    // F connects to D, E
  ],
};

function compute(params: Record<string, number>): Record<string, number | string> {
  const { algorithm = 0, startNode = 0 } = params;
  const isDFS = algorithm === 1;
  const start = Math.min(5, Math.max(0, Math.floor(startNode)));

  const visited: number[] = [];
  const visitedSet = new Set<number>();

  if (!isDFS) {
    // BFS traversal using Queue
    const queue: number[] = [start];
    visitedSet.add(start);

    while (queue.length > 0) {
      const u = queue.shift()!;
      visited.push(u);

      for (const v of CANONICAL_GRAPH.adj[u]) {
        if (!visitedSet.has(v)) {
          visitedSet.add(v);
          queue.push(v);
        }
      }
    }
  } else {
    // DFS traversal using Stack
    const stack: number[] = [start];

    while (stack.length > 0) {
      const u = stack.pop()!;
      if (!visitedSet.has(u)) {
        visitedSet.add(u);
        visited.push(u);

        // push reverse order for deterministic left-to-right exploration
        const neighbors = [...CANONICAL_GRAPH.adj[u]].reverse();
        for (const v of neighbors) {
          if (!visitedSet.has(v)) {
            stack.push(v);
          }
        }
      }
    }
  }

  const visitedPath = visited.map((i) => CANONICAL_GRAPH.nodes[i]).join(' → ');

  return {
    algorithm: isDFS ? 'DFS' : 'BFS',
    startNodeLabel: CANONICAL_GRAPH.nodes[start],
    visitedCount: visited.length,
    visitedPath,
    visitedOrder: visited.join(','),
    method_display: isDFS ? 'DFS (Depth-First)' : 'BFS (Breadth-First)',
    path_display: visitedPath,
    equation: `Simpul Terjelajahi: ${visited.length} / 6 (${isDFS ? 'Stack' : 'Queue'})`,
  };
}

const experiments: ExperimentChallenge[] = [
  {
    id: 'traverse-all-nodes',
    title: 'Eksplorasi Lengkap 6 Simpul',
    objective: 'Jelajahi seluruh 6 simpul graf dari simpul awal A.',
    description: 'Jalankan algoritma pelacakan untuk membuktikan bahwa graf ini adalah graf terhubung (connected graph) dengan jumlah simpul terkunjungi = 6.',
    allowedParameters: ['startNode'],
    targetCondition: {
      output: 'visitedCount',
      operator: '==',
      value: 6,
      tolerance: 0,
    },
    hint: 'Karena graf terhubung penuh, dari simpul mana pun seluruh 6 simpul akan terjelajahi.',
  },
];

export const graphTraversal: SimulationDefinition = {
  spec,
  compute,
  experiments,
};
