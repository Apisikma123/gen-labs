import type { SimulationSearchResult, SimulationEngine } from '@genlab/simulation-types';

interface SearchableSimulation {
  simulationId: string;
  slug: string;
  title: string;
  domain: string;
  engine: SimulationEngine;
  version: number;
  concepts: string[];
  exactKeywords: string[];
  synonyms: {
    en: string[];
    id: string[];
  };
}

const CATALOG: SearchableSimulation[] = [
  // 1. Newton's Second Law
  {
    simulationId: 'physics:newtons_second_law',
    slug: 'newtons-second-law',
    title: "Hukum II Newton (Dinamika Partikel)",
    domain: 'Physics',
    engine: 'physics',
    version: 1,
    concepts: ['force', 'mass', 'acceleration', 'F=ma', 'friction', 'inertia'],
    exactKeywords: ['f=ma', 'f = ma', 'newton', "newton's second law", 'hukum newton', 'hukum 2 newton', 'hukum ii newton'],
    synonyms: {
      en: [
        'force', 'mass', 'acceleration', 'friction', 'inertia', 'motion',
        'dynamics', 'kinetic', 'net force', 'velocity', 'gravity', 'push',
        'heavy object', 'speed up', 'resistance'
      ],
      id: [
        'hukum newton', 'hukum 2 newton', 'hukum ii newton', 'gaya', 'massa',
        'percepatan', 'gesekan', 'kelembaman', 'inersia', 'gaya gesek',
        'hubungan gaya massa dan percepatan', 'bagaimana gaya memengaruhi percepatan',
        'benda bergerak', 'mendorong benda', 'hukum gerak', 'kalau gaya diperbesar dua kali'
      ],
    },
  },
  // 2. Projectile Motion
  {
    simulationId: 'physics:projectile_motion',
    slug: 'projectile-motion',
    title: 'Gerak Parabola & Kinematika Peluru',
    domain: 'Physics',
    engine: 'physics',
    version: 1,
    concepts: ['projectile', 'parabola', 'angle', 'velocity', 'gravity', 'range', 'height'],
    exactKeywords: ['gerak peluru', 'peluru', 'gerak parabola', 'projectile motion', 'kinematika peluru', 'jarak tembak', 'sudut elevasi'],
    synonyms: {
      en: [
        'projectile motion', 'parabola', 'trajectory', 'elevation angle', 'initial velocity',
        'flight time', 'max height', 'ballistics', 'cannon'
      ],
      id: [
        'gerak parabola', 'proyektil', 'lintasan peluru', 'sudut elevasi', 'kecepatan awal',
        'jarak maksimum', 'ketinggian maksimum', 'waktu melayang', 'menembak peluru'
      ],
    },
  },
  // 3. Momentum & Collision
  {
    simulationId: 'physics:momentum_collision',
    slug: 'momentum-collision',
    title: 'Momentum & Tumbukan 1D',
    domain: 'Physics',
    engine: 'physics',
    version: 1,
    concepts: ['momentum', 'collision', 'elasticity', 'conservation', 'kinetic energy'],
    exactKeywords: ['momentum', 'collision', 'tumbukan', 'kekekalan momentum', 'lenting sempurna'],
    synonyms: {
      en: [
        'momentum', 'collision', 'elastic', 'inelastic', 'restitution', 'conservation of momentum',
        'kinetic energy loss', 'impact'
      ],
      id: [
        'momentum', 'tumbukan', 'tabrakan', 'lenting sempurna', 'tidak lenting',
        'kekekalan momentum', 'kereta dinamika', 'koefisien elastisitas'
      ],
    },
  },
  // 4. Function Explorer
  {
    simulationId: 'mathematics:function_explorer',
    slug: 'function-explorer',
    title: 'Fungsi & Grafik Kuadrat',
    domain: 'Mathematics',
    engine: 'mathematics',
    version: 1,
    concepts: ['quadratic', 'parabola', 'vertex', 'roots', 'coefficients', 'discriminant', 'f(x)'],
    exactKeywords: ['f(x)', 'quadratic', 'parabola', 'fungsi kuadrat', 'persamaan kuadrat', 'ax^2', 'ax2'],
    synonyms: {
      en: [
        'quadratic function', 'parabola', 'vertex', 'roots', 'coefficients',
        'discriminant', 'algebra', 'polynomial', 'curve', 'concavity',
        'turning point', 'intercept', 'axis of symmetry', 'math'
      ],
      id: [
        'fungsi kuadrat', 'parabola', 'akar kuadrat', 'diskriminan',
        'titik puncak', 'titik balik', 'koefisien', 'kurva kuadrat',
        'persamaan kuadrat', 'matematika aljabar', 'grafik fungsi kuadrat parabola'
      ],
    },
  },
  // 5. Vector Math
  {
    simulationId: 'mathematics:vector_math',
    slug: 'vector-math',
    title: 'Operasi Vektor 2D',
    domain: 'Mathematics',
    engine: 'mathematics',
    version: 1,
    concepts: ['vector', 'resultant', 'magnitude', 'components', 'dot product', 'cartesian'],
    exactKeywords: ['vektor', 'vector', 'vektor 2d', 'resultan vektor', 'dot product'],
    synonyms: {
      en: [
        'vector addition', 'resultant vector', 'cartesian components', 'magnitude', 'direction',
        'dot product', 'scalar product', 'orthogonal vectors'
      ],
      id: [
        'vektor', 'vektor 2d', 'operasi vektor', 'penjumlahan vektor', 'resultan',
        'komponen kartesius', 'magnitudo vektor', 'perkalian titik', 'arah sudut'
      ],
    },
  },
  // 6. Probability Coin
  {
    simulationId: 'mathematics:probability_distribution',
    slug: 'probability-coin',
    title: 'Eksperimen Peluang & Probabilitas',
    domain: 'Mathematics',
    engine: 'mathematics',
    version: 1,
    concepts: ['probability', 'coin toss', 'law of large numbers', 'relative frequency', 'binomial'],
    exactKeywords: ['probabilitas', 'peluang', 'hukum bilangan besar', 'law of large numbers', 'koin'],
    synonyms: {
      en: [
        'probability', 'coin toss', 'law of large numbers', 'relative frequency',
        'binomial experiment', 'random chance', 'empirical probability'
      ],
      id: [
        'peluang', 'probabilitas', 'hukum bilangan besar', 'pelemparan koin',
        'frekuensi relatif', 'teori peluang', 'percobaan acak'
      ],
    },
  },
  // 7. Sorting Algorithms
  {
    simulationId: 'computer-science:sorting_visualizer',
    slug: 'sorting-algorithms',
    title: 'Tracer Algoritma Pengurutan (Sorting)',
    domain: 'Computer Science',
    engine: 'computer-science',
    version: 1,
    concepts: ['sorting', 'bubble sort', 'selection sort', 'insertion sort', 'algorithm', 'complexity', 'arrays'],
    exactKeywords: ['sorting', 'bubble sort', 'selection sort', 'insertion sort', 'pengurutan', 'algoritma sorting'],
    synonyms: {
      en: [
        'sorting', 'bubble sort', 'selection sort', 'insertion sort', 'quick sort', 'merge sort',
        'algorithm', 'complexity', 'time complexity', 'big o', 'arrays',
        'data structure', 'comparisons', 'swaps', 'ordered list'
      ],
      id: [
        'pengurutan', 'algoritma sorting', 'bubble sort', 'selection sort',
        'insertion sort', 'kompleksitas algoritma', 'mengurutkan data',
        'larik', 'struktur data', 'algoritma komputer', 'bubble sort vs quick sort'
      ],
    },
  },
  // 8. Binary Search
  {
    simulationId: 'computer-science:binary_search',
    slug: 'binary-search',
    title: 'Visualizer Pencarian Biner (Binary Search)',
    domain: 'Computer Science',
    engine: 'computer-science',
    version: 1,
    concepts: ['binary search', 'search algorithm', 'divide and conquer', 'logarithmic', 'sorted array'],
    exactKeywords: ['binary search', 'pencarian biner', 'divide and conquer', 'cara kerja binary search'],
    synonyms: {
      en: [
        'binary search', 'searching algorithm', 'divide and conquer', 'logarithmic complexity',
        'sorted list', 'low mid high', 'search steps'
      ],
      id: [
        'binary search', 'pencarian biner', 'cara kerja binary search', 'mencari data cepat',
        'bagaimana komputer mencari data dengan cepat', 'divide and conquer', 'algoritma pencarian'
      ],
    },
  },
  // 9. Graph Traversal
  {
    simulationId: 'computer-science:graph_traversal',
    slug: 'graph-traversal',
    title: 'Pelacakan Graf: BFS vs DFS',
    domain: 'Computer Science',
    engine: 'computer-science',
    version: 1,
    concepts: ['graph', 'bfs', 'dfs', 'breadth first', 'depth first', 'queue', 'stack'],
    exactKeywords: ['graf', 'graph traversal', 'bfs', 'dfs', 'breadth first', 'depth first'],
    synonyms: {
      en: [
        'graph traversal', 'breadth first search', 'depth first search', 'bfs', 'dfs',
        'queue', 'stack', 'shortest path', 'connected nodes'
      ],
      id: [
        'penelusuran graf', 'graf', 'bfs', 'dfs', 'lintasan graf', 'antrean',
        'tumpukan', 'pencarian melebar', 'pencarian mendalam'
      ],
    },
  },
  // 10. Linear Regression
  {
    simulationId: 'statistics:linear_regression',
    slug: 'linear-regression',
    title: 'Regresi Linear & Garis Kecocokan Terbaik',
    domain: 'Statistics',
    engine: 'statistics',
    version: 1,
    concepts: ['linear regression', 'ols', 'scatter plot', 'correlation', 'r-squared', 'best fit'],
    exactKeywords: ['regresi linear', 'linear regression', 'regresi', 'r squared', 'least squares', 'korelasi'],
    synonyms: {
      en: [
        'linear regression', 'ordinary least squares', 'ols', 'trend line', 'best fit line',
        'scatter plot', 'pearson correlation', 'r-squared', 'residuals', 'prediction'
      ],
      id: [
        'regresi linear', 'regresi', 'garis tren', 'korelasi', 'r kuadrat',
        'titik pencilan', 'outliers', 'saya mau belajar regresi', 'kuadrat terkecil'
      ],
    },
  },
  // 11. Normal Distribution
  {
    simulationId: 'statistics:normal_distribution',
    slug: 'normal-distribution',
    title: 'Distribusi Normal Gauss & Kaidah Empiris',
    domain: 'Statistics',
    engine: 'statistics',
    version: 1,
    concepts: ['normal distribution', 'gaussian', 'bell curve', 'mean', 'std dev', 'z-score'],
    exactKeywords: ['distribusi normal', 'normal distribution', 'kurva lonceng', 'gauss', 'z-score', 'z score'],
    synonyms: {
      en: [
        'normal distribution', 'gaussian curve', 'bell curve', 'mean', 'standard deviation',
        'z-score', 'empirical rule', 'cumulative probability', 'percentile'
      ],
      id: [
        'distribusi normal', 'kurva lonceng', 'kurva normal', 'rata rata', 'simpangan baku',
        'z-score', 'standar deviasi', 'kaidah empiris'
      ],
    },
  },
  // 12. Supply & Demand
  {
    simulationId: 'economics:supply_demand',
    slug: 'supply-demand',
    title: 'Hukum Penawaran & Permintaan Pasar',
    domain: 'Economics',
    engine: 'economics',
    version: 1,
    concepts: ['supply', 'demand', 'equilibrium', 'market', 'price', 'quantity', 'shortage', 'surplus'],
    exactKeywords: ['supply and demand', 'supply demand', 'equilibrium', 'penawaran dan permintaan', 'permintaan dan penawaran', 'keseimbangan pasar'],
    synonyms: {
      en: [
        'supply', 'demand', 'market equilibrium', 'price', 'quantity',
        'market clearing', 'shortage', 'surplus', 'elasticity', 'microeconomics',
        'buyers and sellers', 'cost curve'
      ],
      id: [
        'penawaran', 'permintaan', 'ekuilibrium', 'keseimbangan pasar',
        'harga pasar', 'kelebihan permintaan', 'kelebihan penawaran',
        'kurva penawaran', 'kurva permintaan', 'ekonomi mikro', 'pasar',
        'kenapa harga mempengaruhi jumlah permintaan', 'hukum penawaran dan permintaan pasar'
      ],
    },
  },
  // 13. Compound Interest
  {
    simulationId: 'economics:compound_interest',
    slug: 'compound-interest',
    title: 'Bunga Majemuk Eksponensial (Compound Interest)',
    domain: 'Economics',
    engine: 'economics',
    version: 1,
    concepts: ['compound interest', 'finance', 'investment', 'exponential', 'future value', 'rule of 72'],
    exactKeywords: ['bunga majemuk', 'compound interest', 'bunga berbunga', 'investasi', 'rule of 72'],
    synonyms: {
      en: [
        'compound interest', 'exponential growth', 'future value', 'investment returns',
        'rule of 72', 'time value of money', 'capital accumulation'
      ],
      id: [
        'bunga majemuk', 'compound interest', 'bagaimana bunga majemuk bekerja',
        'kenapa bunga bisa berbunga', 'investasi uang', 'pelipatgandaan modal', 'nilai masa depan'
      ],
    },
  },
  // 14. pH Scale
  {
    simulationId: 'chemistry:ph_scale',
    slug: 'ph-scale',
    title: 'Skala pH & Kesetimbangan Ion Air',
    domain: 'Chemistry',
    engine: 'chemistry',
    version: 1,
    concepts: ['ph', 'acid', 'base', 'hydrogen ion', 'logarithmic', 'universal indicator'],
    exactKeywords: ['ph', 'skala ph', 'asam basa', 'derajat keasaman', 'konsentrasi h+'],
    synonyms: {
      en: [
        'ph scale', 'acid base', 'hydrogen ion concentration', 'poh', 'hydronium',
        'neutral water', 'alkaline', 'litmus indicator'
      ],
      id: [
        'skala ph', 'ph', 'asam basa', 'bagaimana ph berubah', 'derajat keasaman',
        'konsentrasi ion', 'larutan asam', 'larutan basa', 'indikator universal'
      ],
    },
  },
];

const STOP_WORDS = new Set([
  // English
  'i', 'want', 'to', 'learn', 'understand', 'explore', 'about', 'how', 'does',
  'what', 'is', 'the', 'a', 'an', 'and', 'or', 'in', 'of', 'for', 'with',
  'show', 'me', 'can', 'you', 'explain', 'please', 'tell', 'works',
  // Indonesian
  'saya', 'mau', 'ingin', 'belajar', 'paham', 'memahami', 'tentang', 'bagaimana',
  'apa', 'itu', 'dan', 'atau', 'di', 'dari', 'untuk', 'dengan', 'tolong',
  'jelaskan', 'dong', 'materi', 'konsep', 'yang', 'pada', 'bisa', 'kah',
  'bekerja', 'ngerti', 'kenapa'
]);

export function normalizeQuery(query: string): { normalized: string; tokens: string[] } {
  const clean = query
    .toLowerCase()
    .replace(/[^\w\s=²^]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  const rawTokens = clean.split(' ').filter(Boolean);
  const filteredTokens = rawTokens.filter((t) => !STOP_WORDS.has(t) && t.length > 1);

  return {
    normalized: clean,
    tokens: filteredTokens.length > 0 ? filteredTokens : rawTokens,
  };
}

function fastLevenshtein(s1: string, s2: string): number {
  if (s1 === s2) return 0;
  if (s1.length === 0) return s2.length;
  if (s2.length === 0) return s1.length;
  let a = s1;
  let b = s2;
  if (a.length > b.length) {
    a = s2;
    b = s1;
  }
  const aLen = a.length;
  const bLen = b.length;
  const prevRow = new Array<number>(aLen + 1);
  const currRow = new Array<number>(aLen + 1);
  for (let i = 0; i <= aLen; i++) prevRow[i] = i;
  for (let j = 1; j <= bLen; j++) {
    currRow[0] = j;
    const bChar = b.charCodeAt(j - 1);
    for (let i = 1; i <= aLen; i++) {
      const aChar = a.charCodeAt(i - 1);
      const cost = aChar === bChar ? 0 : 1;
      currRow[i] = Math.min(currRow[i - 1] + 1, prevRow[i] + 1, prevRow[i - 1] + cost);
    }
    for (let i = 0; i <= aLen; i++) prevRow[i] = currRow[i];
  }
  return prevRow[aLen];
}

export function searchSimulations(query: string): SimulationSearchResult[] {
  const { normalized, tokens } = normalizeQuery(query);

  if (!normalized) return [];

  const results: SimulationSearchResult[] = [];

  for (const item of CATALOG) {
    let score = 0;
    const matchedReasons: string[] = [];

    // 1. Exact title or keyword matches
    for (const kw of item.exactKeywords) {
      if (normalized.includes(kw) || kw.includes(normalized)) {
        const kwScore = 0.94 + Math.min(0.05, (kw.length / (normalized.length + 1)) * 0.05);
        if (kwScore > score) {
          score = kwScore;
          matchedReasons.push(`Cocok persis kata kunci: "${kw}"`);
        }
      }
    }

    // 2. Token overlap against concepts
    let conceptHits = 0;
    for (const token of tokens) {
      for (const concept of item.concepts) {
        if (concept.toLowerCase().includes(token) || token.includes(concept.toLowerCase())) {
          conceptHits++;
          break;
        }
      }
    }

    if (conceptHits > 0) {
      const conceptScore = 0.5 + Math.min(0.4, (conceptHits / tokens.length) * 0.4);
      if (conceptScore > score) {
        score = conceptScore;
        matchedReasons.push(`Cocok konsep inti (${conceptHits} istilah)`);
      }
    }

    // 3. Synonym matches (Indonesian & English)
    const allSynonyms = [...item.synonyms.en, ...item.synonyms.id];
    let synonymHits = 0;

    for (const syn of allSynonyms) {
      const synLower = syn.toLowerCase();
      if (normalized.includes(synLower)) {
        synonymHits += 2;
      } else {
        for (const token of tokens) {
          if (token.length > 2 && synLower.includes(token)) {
            synonymHits++;
            break;
          }
        }
      }
    }

    if (synonymHits > 0) {
      const synScore = 0.4 + Math.min(0.5, (synonymHits / (tokens.length + 1)) * 0.35);
      if (synScore > score) {
        score = synScore;
        matchedReasons.push(`Kesesuaian semantik pustaka`);
      }
    }

    // 4. Fuzzy typo tolerant matching across exact keywords and concepts
    if (score < 0.85) {
      for (const token of tokens) {
        if (token.length < 3) continue;
        for (const kw of item.exactKeywords) {
          const kwTokens = kw.split(' ');
          for (const kt of kwTokens) {
            if (kt.length < 3) continue;
            const dist = fastLevenshtein(token, kt);
            const maxL = Math.max(token.length, kt.length);
            const sim = 1 - dist / maxL;
            if (sim >= 0.72) {
              const fuzzyScore = 0.70 + sim * 0.15;
              if (fuzzyScore > score) {
                score = fuzzyScore;
                matchedReasons.push(`Cocok fonetik/typo kata kunci: "${kt}"`);
              }
            }
          }
        }
      }
    }

    if (score >= 0.45) {
      results.push({
        simulationId: item.simulationId,
        slug: item.slug,
        title: item.title,
        domain: item.domain,
        engine: item.engine,
        version: item.version,
        similarityScore: Math.round(score * 100) / 100,
        matchReason: matchedReasons.join('; ') || 'Kesesuaian konsep umum',
        isExactMatch: score >= 0.85,
        concepts: item.concepts,
      });
    }
  }

  // Sort by highest similarity score
  return results.sort((a, b) => b.similarityScore - a.similarityScore);
}

export function findBestSimulationMatch(
  query: string,
  minThreshold: number = 0.65
): SimulationSearchResult | null {
  const matches = searchSimulations(query);
  if (matches.length === 0) return null;
  const best = matches[0];
  return best.similarityScore >= minThreshold ? best : null;
}

