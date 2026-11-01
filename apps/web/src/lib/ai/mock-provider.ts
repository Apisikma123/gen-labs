import type {
  SimulationSpecification,
  AIContextPayload,
  AIAskResponse,
  ExperimentChallenge,
  SimulationInsight,
  AIAction,
} from '@genlab/simulation-types';
import type {
  AiProvider,
  AiAuthoringContext,
  AiPatchContext,
  AiPatchResult,
  AiTutorContext,
  AiTutorResult,
} from './types';
import type { UnifiedSimulatorSpec } from '../simulation/simulator-schema';
import { generateAiSimulator, interpretAiPatchInstruction } from '../simulation/ai-simulator-authoring';
import { validateSimulationSpecification } from './validator';
import { GENLAB_SIMULATIONS } from '@genlab/simulation-core';
import { isQuestionInSimulatorScope, STANDARD_REFUSAL_RESPONSE } from './scope-guard';

export class MockAiProvider implements AiProvider {
  name = 'Deterministic-Mock-Provider';

  async generateSimulator(prompt: string, context?: Partial<AiAuthoringContext>): Promise<UnifiedSimulatorSpec> {
    return generateAiSimulator(prompt);
  }

  async patchSimulator(spec: UnifiedSimulatorSpec, instruction: string, context?: Partial<AiPatchContext>): Promise<AiPatchResult> {
    const res = interpretAiPatchInstruction(spec, instruction);
    return {
      patched: res.patched,
      patches: [{ op: 'replace', path: '/info/version', value: (spec.info.version || 1) + 1 }],
      appliedCount: 1,
    };
  }

  async tutor(context: AiTutorContext): Promise<AiTutorResult> {
    const scope = isQuestionInSimulatorScope(context);
    if (!scope.relevant) {
      return {
        answer: scope.refusalResponse || STANDARD_REFUSAL_RESPONSE,
      };
    }
    return {
      answer: `[Mock Tutor] Pertanyaan Anda terkait "${context.question}" pada simulator ${context.simulatorTitle}. Gunakan Gemini AI provider untuk jawaban analitik mendalam.`,
    };
  }

  async generateSimulation(prompt: string): Promise<SimulationSpecification> {
    const lower = prompt.toLowerCase();

    // Check for genuinely unsupported concepts
    const unsupportedKeywords = [
      'quantum teleportation', 'blockchain', 'crypto', 'astrology', 'supernatural', 'biologi', 'mitosis', 'sel'
    ];

    for (const kw of unsupportedKeywords) {
      if (lower.includes(kw)) {
        throw new Error(
          `GEN LABS belum memiliki engine untuk konsep simulasi ini. Silakan coba topik fisika, komputasi, bisnis, atau keuangan.`
        );
      }
    }

    let rawSpec: SimulationSpecification | undefined;

    // 1. Direct match with 34 Gen Labs academic simulations
    for (const [slug, def] of Object.entries(GENLAB_SIMULATIONS)) {
      const matchSlug = slug.replace(/-/g, ' ');
      if (lower.includes(slug) || lower.includes(matchSlug)) {
        rawSpec = def.spec;
        break;
      }
      const titleLower = def.spec.title.toLowerCase();
      if (lower.includes(titleLower)) {
        rawSpec = def.spec;
        break;
      }
    }

    // 2. Keyword domain matching for academic disciplines
    if (!rawSpec) {
      if (lower.includes('break') || lower.includes('bep') || lower.includes('impas') || lower.includes('break even') || lower.includes('bisnis')) {
        rawSpec = GENLAB_SIMULATIONS['break-even-point']?.spec;
      } else if (lower.includes('akuntansi') || lower.includes('neraca') || lower.includes('persamaan akuntansi') || lower.includes('aset')) {
        rawSpec = GENLAB_SIMULATIONS['accounting-equation']?.spec;
      } else if (lower.includes('jurnal') || lower.includes('debit') || lower.includes('kredit')) {
        rawSpec = GENLAB_SIMULATIONS['journal-entries']?.spec;
      } else if (lower.includes('kas') || lower.includes('cash flow') || lower.includes('arus kas')) {
        rawSpec = GENLAB_SIMULATIONS['cash-flow']?.spec;
      } else if (lower.includes('pajak') || lower.includes('pph') || lower.includes('tax')) {
        rawSpec = GENLAB_SIMULATIONS['tax-calculation']?.spec;
      } else if (lower.includes('rasio') || lower.includes('likuiditas') || lower.includes('solvabilitas')) {
        rawSpec = GENLAB_SIMULATIONS['financial-ratios']?.spec;
      } else if (lower.includes('anggaran') || lower.includes('budget')) {
        rawSpec = GENLAB_SIMULATIONS['budgeting-simulator']?.spec;
      } else if (lower.includes('funnel') || lower.includes('corong') || lower.includes('pemasaran')) {
        rawSpec = GENLAB_SIMULATIONS['marketing-funnel']?.spec;
      } else if (lower.includes('pricing') || lower.includes('harga') || lower.includes('elastisitas')) {
        rawSpec = GENLAB_SIMULATIONS['pricing-strategy']?.spec;
      } else if (lower.includes('segmentasi') || lower.includes('tam') || lower.includes('sam')) {
        rawSpec = GENLAB_SIMULATIONS['market-segmentation']?.spec;
      } else if (lower.includes('kurs') || lower.includes('valas') || lower.includes('forex') || lower.includes('hedging')) {
        rawSpec = GENLAB_SIMULATIONS['exchange-rate-business']?.spec;
      } else if (lower.includes('kampanye') || lower.includes('campaign') || lower.includes('roas')) {
        rawSpec = GENLAB_SIMULATIONS['marketing-campaign']?.spec;
      } else if (lower.includes('precision') || lower.includes('farming') || lower.includes('npk') || lower.includes('tanah')) {
        rawSpec = GENLAB_SIMULATIONS['precision-farming']?.spec;
      } else if (lower.includes('irigasi') || lower.includes('tetes') || lower.includes('air')) {
        rawSpec = GENLAB_SIMULATIONS['irrigation-simulator']?.spec;
      } else if (lower.includes('greenhouse') || lower.includes('vpd') || lower.includes('iklim') || lower.includes('suhu')) {
        rawSpec = GENLAB_SIMULATIONS['greenhouse-climate']?.spec;
      } else if (lower.includes('hidroponik') || lower.includes('hydroponic') || lower.includes('ec')) {
        rawSpec = GENLAB_SIMULATIONS['hydroponic-simulator']?.spec;
      } else if (lower.includes('kerapatan') || lower.includes('jarak tanam') || lower.includes('populasi')) {
        rawSpec = GENLAB_SIMULATIONS['plant-density']?.spec;
      } else if (lower.includes('panen') || lower.includes('yield') || lower.includes('hasil panen')) {
        rawSpec = GENLAB_SIMULATIONS['crop-yield-estimator']?.spec;
      } else if (lower.includes('rantai pasok') || lower.includes('cold chain') || lower.includes('susut')) {
        rawSpec = GENLAB_SIMULATIONS['agri-supply-chain']?.spec;
      } else if (lower.includes('kapasitas') || lower.includes('venue') || lower.includes('okupansi') || lower.includes('event') || lower.includes('acara')) {
        rawSpec = GENLAB_SIMULATIONS['event-capacity-planner']?.spec;
      } else if (lower.includes('tiket') || lower.includes('ticket') || lower.includes('tiered')) {
        rawSpec = GENLAB_SIMULATIONS['ticket-pricing']?.spec;
      } else if (lower.includes('timeline') || lower.includes('cpm') || lower.includes('jadwal')) {
        rawSpec = GENLAB_SIMULATIONS['event-timeline']?.spec;
      } else if (lower.includes('denah') || lower.includes('layout') || lower.includes('booth')) {
        rawSpec = GENLAB_SIMULATIONS['venue-layout']?.spec;
      } else if (lower.includes('risiko') || lower.includes('mitigasi') || lower.includes('risk')) {
        rawSpec = GENLAB_SIMULATIONS['event-risk-simulator']?.spec;
      } else if (lower.includes('stack') || lower.includes('queue') || lower.includes('antrean') || lower.includes('tumpukan')) {
        rawSpec = GENLAB_SIMULATIONS['stack-queue']?.spec;
      } else if (lower.includes('big o') || lower.includes('kompleksitas') || lower.includes('complexity')) {
        rawSpec = GENLAB_SIMULATIONS['algorithm-complexity']?.spec;
      } else if (lower.includes('query') || lower.includes('database') || lower.includes('sql') || lower.includes('index')) {
        rawSpec = GENLAB_SIMULATIONS['database-query']?.spec;
      } else if (lower.includes('subnet') || lower.includes('ip') || lower.includes('cidr')) {
        rawSpec = GENLAB_SIMULATIONS['ip-subnet']?.spec;
      } else if (lower.includes('logika') || lower.includes('gerbang') || lower.includes('logic gate')) {
        rawSpec = GENLAB_SIMULATIONS['logic-gates']?.spec;
      } else if (lower.includes('newton') || lower.includes('force') || lower.includes('gaya') || lower.includes('percepatan') || lower.includes('peluru')) {
        rawSpec = {
          engine: 'physics',
          simulation: 'newtons_second_law',
          version: 1,
          title: "Newton's Second Law Dynamics",
          description: 'Kinetic vector model calculating linear acceleration from net force and mass.',
          domain: 'Physics',
          concepts: ['force', 'mass', 'acceleration', 'F=ma', 'friction'],
          parameters: {
            mass: { value: 5, min: 0.5, max: 20, step: 0.5, unit: 'kg', label: 'Object Mass' },
            force: { value: 25, min: 0, max: 100, step: 1, unit: 'N', label: 'Applied Force' },
            friction: { value: 0.1, min: 0, max: 0.5, step: 0.01, unit: 'μ', label: 'Surface Friction' },
          },
          controls: ['mass', 'force', 'friction'],
        };
      } else if (lower.includes('function') || lower.includes('quadratic') || lower.includes('parabola') || lower.includes('fungsi') || lower.includes('kuadrat')) {
        rawSpec = {
          engine: 'mathematics',
          simulation: 'function_explorer',
          version: 1,
          title: 'Quadratic Polynomial Matrix',
          description: 'Coordinate plotting of parabolas with real-time vertex tracking and discriminant calculation.',
          domain: 'Mathematics',
          concepts: ['quadratic', 'parabola', 'vertex', 'roots', 'discriminant'],
          parameters: {
            a: { value: 1, min: -5, max: 5, step: 0.1, label: 'a (leading)' },
            b: { value: -2, min: -10, max: 10, step: 0.5, label: 'b (linear)' },
            c: { value: 1, min: -10, max: 10, step: 0.5, label: 'c (constant)' },
            xMin: { value: -10, min: -20, max: 0, step: 1, label: 'X min' },
            xMax: { value: 10, min: 0, max: 20, step: 1, label: 'X max' },
          },
          controls: ['a', 'b', 'c', 'xMin', 'xMax'],
        };
      } else if (lower.includes('sort') || lower.includes('algorithm') || lower.includes('bubble') || lower.includes('pengurutan') || lower.includes('cs')) {
        rawSpec = {
          engine: 'computer-science',
          simulation: 'sorting_visualizer',
          version: 1,
          title: 'Algorithmic State Tracer',
          description: 'Deterministic memory permutation tracer for comparison sorting routines.',
          domain: 'Computer Science',
          concepts: ['sorting', 'bubble sort', 'selection sort', 'insertion sort', 'complexity'],
          parameters: {
            arraySize: { value: 20, min: 5, max: 40, step: 1, unit: 'items', label: 'Array Size' },
            speed: { value: 60, min: 10, max: 100, step: 5, unit: '%', label: 'Step Speed' },
            algorithm: { value: 0, min: 0, max: 2, step: 1, label: 'Algorithm Mode' },
          },
          controls: ['arraySize', 'speed', 'algorithm'],
        };
      } else {
        // Default to Break-Even Point for business/general
        rawSpec = GENLAB_SIMULATIONS['break-even-point']?.spec;
      }
    }


    const validation = validateSimulationSpecification(rawSpec);
    if (!validation.valid || !validation.specification) {
      throw new Error(`GEN LABS couldn't safely prepare this simulation: ${validation.errors.join('; ')}`);
    }

    return validation.specification;
  }

  async answerQuestion(question: string, context: AIContextPayload): Promise<AIAskResponse> {
    const { simulation, state } = context;
    const { parameters, computed } = state;

    // Server-Side Scope Guard Check (Section 17, 18)
    const scope = isQuestionInSimulatorScope({
      simulatorTitle: simulation.title,
      concept: simulation.description,
      formula: (simulation as any).formula,
      parameters,
      currentState: parameters,
      derivedResults: computed,
      question,
    });
    if (!scope.relevant) {
      return {
        answer: scope.refusalResponse || STANDARD_REFUSAL_RESPONSE,
        confidence: 1.0,
      };
    }

    const q = question.toLowerCase();
    let answer = '';
    const suggestedPrompts: string[] = [];

    const simId = (simulation.id || simulation.slug || '').toLowerCase();
    let action: AIAction | undefined;

    // 1. INTENT: GENERATE CHALLENGE / EXPERIMENT ("Kasih aku eksperimen", "Kasih tantangan", etc.)
    if (
      (q.includes('kasih') && (q.includes('eksperimen') || q.includes('tantangan') || q.includes('challenge'))) ||
      q.includes('uji saya') ||
      q.includes('beri tantangan') ||
      q.includes('tantangan baru')
    ) {
      if (simId.includes('newton') || simulation.engine === 'physics') {
        const mass = parameters.mass ?? 5;
        const targetA = 8.0;
        const neededF = mass * targetA;
        answer = `Ayo kita uji pemahamanmu!\n\nTANTANGAN: Bisakah kamu mencapai percepatan tepat ${targetA.toFixed(1)} m/s² tanpa mengubah massa (${mass} kg)?\n\nPetunjuk: Gunakan F = m · a. Untuk mencapai a = ${targetA.toFixed(1)} m/s² pada massa ${mass} kg, kamu perlu mengatur gaya dorong menjadi ${neededF} N.`;
        action = {
          type: 'start_challenge',
          label: `MULAI TANTANGAN: TARGET ${targetA.toFixed(1)} m/s²`,
          challenge: {
            id: 'ai-gen-target-8',
            title: `Capai Percepatan ${targetA.toFixed(1)} m/s²`,
            objective: `Atur nilai gaya agar percepatan mencapai ${targetA.toFixed(1)} m/s² sementara massa tetap ${mass} kg.`,
            description: `Ubah slider gaya untuk menghasilkan percepatan target ${targetA.toFixed(1)} m/s².`,
            allowedParameters: ['force'],
            targetCondition: {
              output: 'acceleration',
              operator: '==',
              value: targetA,
              tolerance: 0.1,
            },
            hint: `F_net = m · a = ${mass} · ${targetA} = ${neededF} N.`,
          },
        };
        suggestedPrompts.push('Berapa gaya yang harus saya atur?', 'Kenapa massanya tidak boleh diubah?');
        return { answer, confidence: 0.98, suggestedPrompts, action };
      } else if (simId.includes('linear_regression') || simulation.engine === 'statistics') {
        answer = `TANTANGAN REGRESI: Bisakah kamu mencapai koefisien determinasi R² ≥ 0.90 dengan memperkecil noise acak pada sebaran titik data?`;
        action = {
          type: 'start_challenge',
          label: 'MULAI TANTANGAN: R² ≥ 0.90',
          challenge: {
            id: 'ai-gen-target-r2',
            title: 'Kecocokan Garis Optimal R² ≥ 0.90',
            objective: 'Rapatkan sebaran titik data ke garis regresi agar R² ≥ 0.90.',
            description: 'Sesuaikan slider noise untuk merapatkan sebaran titik data ke garis regresi hingga R² ≥ 0.90.',
            allowedParameters: ['noise'],
            targetCondition: {
              output: 'rSquared',
              operator: '>=',
              value: 0.90,
              tolerance: 0.02,
            },
          },
        };
        return { answer, confidence: 0.98, suggestedPrompts, action };
      } else if (simId.includes('supply_demand') || simulation.engine === 'economics') {
        answer = `TANTANGAN PASAR: Geser kurva permintaan atau penawaran untuk mencapai harga ekuilibrium P* ≥ $60.0.`;
        action = {
          type: 'start_challenge',
          label: 'MULAI TANTANGAN: P* ≥ $60',
          challenge: {
            id: 'ai-gen-target-p60',
            title: 'Keseimbangan Pasar P* ≥ $60',
            objective: 'Capai harga ekuilibrium pasar P* ≥ $60.',
            description: 'Ubah batas kurva permintaan atau penawaran untuk memindahkan titik ekuilibrium pasar ke harga P* ≥ $60.',
            allowedParameters: ['demandIntercept', 'supplyIntercept'],
            targetCondition: {
              output: 'equilibriumPrice',
              operator: '>=',
              value: 60.0,
              tolerance: 1.0,
            },
          },
        };
        return { answer, confidence: 0.98, suggestedPrompts, action };
      }
    }

    // 2. INTENT: "WHAT IF" PREDICTION
    if (
      q.includes('kalau') || q.includes('bagaimana jika') || q.includes('what if') || q.includes('jika')
    ) {
      if (simId.includes('newton') || simulation.engine === 'physics') {
        const mass = parameters.mass ?? 5;
        const force = parameters.force ?? 20;
        let newMass = mass;
        let newForce = force;

        if (q.includes('dua kali') || q.includes('gandakan') || q.includes('double')) {
          if (q.includes('massa')) newMass = mass * 2;
          else if (q.includes('gaya')) newForce = force * 2;
        } else if (q.includes('10')) {
          newMass = 10;
        } else if (q.includes('setengah')) {
          if (q.includes('massa')) newMass = Math.max(1, mass / 2);
          else if (q.includes('gaya')) newForce = force / 2;
        }

        const newAccel = newForce / newMass;
        answer = `PREDIKSI WHAT-IF:\nJika massa diubah dari ${mass} kg menjadi ${newMass} kg dengan gaya ${newForce} N, percepatan akan menjadi:\n\na_baru = ${newForce} N / ${newMass} kg = ${newAccel.toFixed(2)} m/s².\n\n(Percepatan saat ini: ${(force / mass).toFixed(2)} m/s²). Karena massa berbanding terbalik dengan percepatan, ${newMass > mass ? 'menaikkan' : 'menurunkan'} massa akan ${newAccel < (force / mass) ? 'memperlambat laju pertambahan kecepatan' : 'membuat benda bergerak lebih gesit'}.`;

        action = {
          type: 'set_parameters',
          label: `TERAPKAN PERUBAHAN: MASSA ${newMass} KG`,
          parameters: { mass: newMass, force: newForce },
          preview: {
            parameter: 'Massa',
            from: `${mass} kg`,
            to: `${newMass} kg`,
            predictedOutput: `a = ${newAccel.toFixed(2)} m/s²`,
          },
        };
        suggestedPrompts.push('Terapkan perubahan ini', 'Bagaimana jika gaya dinaikkan 50 N?');
        return { answer, confidence: 0.98, suggestedPrompts, action };
      } else if (simId.includes('linear_regression') || simulation.engine === 'statistics') {
        const currentNoise = parameters.noise ?? 4;
        if (q.includes('noise') || q.includes('nol') || q.includes('0')) {
          answer = `PREDIKSI WHAT-IF:\nJika noise acak disetel ke 0, seluruh titik data akan berada persis di sepanjang garis persamaan y = ${Number(parameters.trueSlope || 1.8).toFixed(1)}x + ${Number(parameters.trueIntercept || 5).toFixed(1)}.\n\nAkibatnya:\n• Total kuadrat residual Σ(y - ŷ)² = 0\n• Koefisien determinasi R² melonjak dari ${Number(computed.rSquared || 0.85).toFixed(2)} menjadi 1.00 (100% variasi data terjelaskan sempurna oleh model).`;
          action = {
            type: 'set_parameters',
            label: 'TERAPKAN PERUBAHAN: NOISE 0',
            parameters: { noise: 0 },
            preview: {
              parameter: 'Noise',
              from: `${currentNoise}`,
              to: '0',
              predictedOutput: 'R² = 100% (1.00)',
            },
          };
          suggestedPrompts.push('Terapkan perubahan ini', 'Kenapa garisnya berubah?');
          return { answer, confidence: 0.98, suggestedPrompts, action };
        }
      } else if (simId.includes('supply_demand') || simulation.engine === 'economics') {
        const dInt = parameters.demandIntercept ?? 100;
        const dSlope = parameters.demandSlope ?? -2;
        const sInt = parameters.supplyIntercept ?? 20;
        const sSlope = parameters.supplySlope ?? 2;

        const newDInt = dInt + 20;
        const newQ = (newDInt - sInt) / (sSlope - dSlope);
        const newP = newDInt + dSlope * newQ;

        answer = `PREDIKSI WHAT-IF:\nJika batas harga permintaan dinaikkan dari $${dInt} menjadi $${newDInt} (kurva permintaan bergeser ke kanan atas):\n\nEkuilibrium baru akan tercapai pada:\n• Harga pasar P* naik dari $${Number(computed.equilibriumPrice || 60).toFixed(0)} menjadi $${newP.toFixed(0)}\n• Kuantitas barang beredar Q* naik dari ${Number(computed.equilibriumQuantity || 20).toFixed(1)} menjadi ${newQ.toFixed(1)} unit.\n\nHal ini menunjukkan bahwa peningkatan minat atau daya beli konsumen akan mendongkrak harga sekaligus mendorong produsen memproduksi lebih banyak.`;

        action = {
          type: 'set_parameters',
          label: 'TERAPKAN PERUBAHAN: PERMINTAAN +20',
          parameters: { demandIntercept: newDInt },
          preview: {
            parameter: 'Demand Intercept',
            from: `$${dInt}`,
            to: `$${newDInt}`,
            predictedOutput: `P* = $${newP.toFixed(0)}, Q* = ${newQ.toFixed(1)}`,
          },
        };
        suggestedPrompts.push('Terapkan perubahan ini', 'Kenapa harga memengaruhi permintaan?');
        return { answer, confidence: 0.98, suggestedPrompts, action };
      }
    }

    // 3. INTENT: RECENT CHANGE REASONING ("Kenapa jadi lebih cepat?", "Kenapa akselerasinya naik?")
    if (
      (q.includes('kenapa') || q.includes('mengapa')) &&
      (q.includes('lebih cepat') || q.includes('naik') || q.includes('akselerasi') || q.includes('percepatan'))
    ) {
      const recentChange = context.history && context.history.length > 0
        ? context.history[context.history.length - 1]
        : null;

      if (recentChange && recentChange.parameterChanges.length > 0) {
        const ch = recentChange.parameterChanges[0];
        const currentA = computed.acceleration ?? 6.0;
        answer = `Karena kamu baru saja menaikkan ${ch.parameter} dari ${ch.from} menjadi ${ch.to}, sementara massa dijaga konstan (${parameters.mass ?? 5} kg)! Berdasarkan hubungan matematis F_net = m · a, peningkatan gaya dorong secara langsung memperbesar percepatan benda menjadi ${Number(currentA).toFixed(2)} m/s².`;
        suggestedPrompts.push('Kasih aku tantangan', 'Kalau massanya jadi dua kali lipat?');
        return { answer, confidence: 0.98, suggestedPrompts };
      }
    }

    if (simId.includes('binary_search') || simId.includes('binary-search')) {
      const target = parameters.target ?? 20;
      const size = parameters.arraySize ?? 16;
      const steps = computed.stepsCount ?? 3;
      const foundIdx = computed.foundIndex;

      if (q.includes('dilewati') || q.includes('skip') || q.includes('lewat') || q.includes('kenapa') || q.includes('mengapa')) {
        answer = `Binary Search memanfaatkan sifat larik yang telah terurut rapi. Pada setiap iterasi, algoritma membandingkan target (${target}) dengan elemen tengah (mid). Karena data terurut naik, jika target lebih besar dari nilai mid, seluruh separuh kiri (indeks lebih kecil) pasti bernilai lebih kecil dari target dan dapat langsung diabaikan secara aman. Pendekatan divide-and-conquer ini memangkas ruang pencarian menjadi setengahnya pada setiap langkah, menghasilkan kompleksitas logaritmik O(log n) yaitu maksimum ${computed.maxTheoreticalSteps || 4} perbandingan untuk ${size} elemen.`;
      } else {
        answer = `Pencarian nilai target ${target} pada larik terurut ${size} elemen diselesaikan dalam ${steps} langkah perbandingan. Status: ${computed.statusText || (Number(foundIdx) >= 0 ? `Ditemukan di indeks ${foundIdx}` : 'Tidak ditemukan')}.`;
      }
      suggestedPrompts.push('Kenapa larik harus terurut?', 'Berapa langkah maksimal untuk 1000 elemen?');
    } else if (simId.includes('graph_traversal') || simId.includes('graph-traversal')) {
      const method = parameters.searchMethod === 1 ? 'Depth-First Search (DFS)' : 'Breadth-First Search (BFS)';
      answer = `Penelusuran menggunakan ${method} dari simpul awal berhasil menjelajahi ${computed.visitedCount || 6} simpul dengan urutan lintasan: ${computed.path_display || 'A → B → C'}. BFS menggunakan struktur antrean (Queue) untuk penelusuran per level, sedangkan DFS menggunakan tumpukan (Stack) atau rekursi untuk menelusuri ke kedalaman maksimal terlebih dahulu.`;
      suggestedPrompts.push('Kapan sebaiknya menggunakan BFS dibanding DFS?', 'Bagaimana cara mendeteksi siklus pada graf?');
    } else if (simId.includes('linear_regression') || simId.includes('linear-regression') || q.includes('regresi')) {
      const slope = Number(computed.calcSlope || parameters.trueSlope || 1.8).toFixed(2);
      const intercept = Number(computed.calcIntercept || parameters.trueIntercept || 5.0).toFixed(2);
      const r2 = Number(computed.rSquared || 0.85).toFixed(3);

      if (q.includes('garis') && (q.includes('berubah') || q.includes('bergerak') || q.includes('geser') || q.includes('putar'))) {
        answer = `Garis regresi OLS (Ordinary Least Squares) berubah posisi secara otomatis karena algoritma mencari garis lurus y = mx + c yang meminimalkan total kuadrat jarak vertikal Σ(y - ŷ)² dari setiap titik data ke garis. Saat sebaran titik atau kemiringan diubah, metode kuadrat terkecil langsung menghitung ulang nilai slope dan intercept optimal agar error keseluruhannya tetap yang paling minimum.`;
      } else if (q.includes('outlier') || q.includes('pencilan') || q.includes('noise')) {
        answer = `Pencilan (outlier) atau titik dengan noise tinggi akan meningkatkan nilai kuadrat residual (y - ŷ)². Karena metode Kuadrat Terkecil (OLS) meminimalkan total kuadrat error Σ(e)², sebuah pencilan ekstrem dapat "menarik" garis regresi ke arahnya dan menurunkan nilai koefisien determinasi R² (saat ini R² = ${r2}).`;
      } else {
        answer = `Model regresi linear terkalibrasi: ŷ = ${slope}x + ${intercept} dengan R² = ${r2}. Kemiringan (slope ${slope}) menunjukkan bahwa setiap kenaikan 1 unit variabel X diprediksi meningkatkan nilai Y sebesar ${slope} unit.`;
      }
      suggestedPrompts.push('Kenapa garisnya berubah?', 'Apa makna nilai koefisien determinasi R²?');
    } else if (simId.includes('normal_distribution') || simId.includes('normal-distribution') || q.includes('normal') || q.includes('gauss')) {
      const mu = parameters.mean ?? 0;
      const sigma = parameters.stdDev ?? 1;
      const z = Number(computed.zScore || 0).toFixed(2);
      const cdf = Number(computed.cdfPercent || 50).toFixed(1);

      answer = `Distribusi normal simetris berbentuk lonceng (bell curve) berpusat di rata-rata μ = ${mu} dengan sebaran deviasi σ = ${sigma}. Titik evaluasi menghasilkan skor standar Z = (x - μ)/σ = ${z}, yang berarti ${cdf}% dari seluruh populasi berada di bawah nilai ini (P(X ≤ x) = ${cdf}%).`;
      suggestedPrompts.push('Apa aturan empiris 68-95-99.7?', 'Bagaimana kaitan Z-score dengan p-value?');
    } else if (simId.includes('ph_scale') || simId.includes('ph-scale') || q.includes('ph')) {
      const ph = Number(computed.pH || 7.0).toFixed(2);
      const nature = computed.nature || 'Netral';

      answer = `Skala pH adalah ukuran derajat keasaman berbasis konsentrasi ion hidrogen [H+] secara logaritmik: pH = -log₁₀[H+]. Larutan saat ini memiliki pH = ${ph} (${nature}). Karena skalanya logaritmik, larutan ber-pH 4 memiliki keasaman 10 kali lebih pekat daripada pH 5 dan 100 kali lebih pekat daripada pH 6.`;
      suggestedPrompts.push('Kenapa air murni pada 25°C memiliki pH tepat 7?', 'Bagaimana hubungan antara pH dan pOH?');
    } else if (simId.includes('compound_interest') || simId.includes('compound-interest') || q.includes('bunga') || q.includes('majemuk')) {
      const p = parameters.principal ?? 10000000;
      const r = parameters.ratePercent ?? 8;
      const t = parameters.years ?? 10;
      const finalA = computed.finalAmount_display || 'Rp 21.589.250';
      const r72 = computed.rule72_display || '9.0 tahun';

      answer = `Bunga majemuk (compound interest) bertumbuh secara eksponensial A = P(1 + r/n)^(nt) karena bunga yang terakumulasi di setiap periode ikut diperhitungkan untuk menghasilkan bunga tambahan di periode berikutnya ("bunga berbunga"). Pada modal pokok Rp ${Number(p).toLocaleString('id-ID')} dengan bunga ${r}% per tahun selama ${t} tahun, nilai akhir modal tumbuh menjadi ${finalA}. Berdasarkan Kaidah 72 (Rule of 72), modal akan berlipat ganda dalam waktu sekitar 72 / ${r} ≈ ${r72}.`;
      suggestedPrompts.push('Bagaimana jika frekuensi majemuk dijadikan bulanan?', 'Apa perbedaan bunga tunggal dan bunga majemuk?');
    } else if (simId.includes('projectile_motion') || simId.includes('projectile-motion')) {
      const v0 = parameters.velocity ?? 25;
      const ang = parameters.angle ?? 45;
      const r = computed.range_display || '63.8 m';
      const h = computed.maxHeight_display || '15.9 m';

      answer = `Gerak parabola merupakan perpaduan dua gerak independen: GLB pada sumbu horizontal (vx = v₀ cos θ tetap konstan) dan GLBB pada sumbu vertikal diperlambat gravitasi (vy = v₀ sin θ - gt). Pada kecepatan awal v₀ = ${v0} m/s dan sudut elevasi θ = ${ang}°, peluru mencapai tinggi maksimum ${h} dan jarak jangkauan horizontal sejauh ${r}. Jarak jangkauan terjauh selalu tercapai pada sudut 45° di medan datar.`;
      suggestedPrompts.push('Kenapa sudut 30° dan 60° menghasilkan jarak jangkauan yang sama?', 'Bagaimana pengaruh hambatan udara pada gerak nyata?');
    } else if (simId.includes('vector_math') || simId.includes('vector-math')) {
      const dot = computed.dotProduct_display || '0.00';
      const magR = computed.magR_display || '5.00';

      answer = `Operasi vektor melibatkan komponen arah dan magnitudo. Perkalian titik (dot product) A · B = Ax·Bx + Ay·By saat ini bernilai ${dot}. Jika dot product bernilai 0, maka kedua vektor tegak lurus (ortogonal, sudut 90°). Resultan vektor R = A + B memiliki panjang magnitudo ${magR}.`;
      suggestedPrompts.push('Apa arti fisis dari perkalian titik bernilai negatif?', 'Bagaimana cara menghitung sudut apit dua vektor?');
    } else if (simulation.engine === 'physics') {
      const mass = parameters.mass ?? 5;
      const force = parameters.force ?? 20;
      const friction = parameters.friction ?? 0;
      const accel = typeof computed.acceleration === 'number' ? computed.acceleration : parseFloat(String(computed.acceleration || 0));
      const netForce = typeof computed.netForce === 'number' ? computed.netForce : parseFloat(String(computed.netForce || 0));

      if (q.includes('kenapa') || q.includes('mengapa') || q.includes('dua kali') || q.includes('gaya')) {
        if (q.includes('dua kali')) {
          answer = `Berdasarkan Hukum II Newton (a = F_net / m), percepatan berbanding lurus dengan gaya bersih. Jika gaya dorong diperbesar dua kali lipat sementara massa benda tetap konstan (${mass} kg), maka percepatan gerak benda juga akan meningkat tepat dua kali lipat dari ${(accel).toFixed(2)} m/s² menjadi ${(accel * 2).toFixed(2)} m/s² (dengan asumsi tanpa gesekan).`;
        } else {
          answer = `Berdasarkan hukum II Newton (F_net = m · a), percepatan dihitung dari gaya bersih dibagi massa: a = ${netForce.toFixed(1)} N / ${mass} kg = ${accel.toFixed(2)} m/s². Saat massa = ${mass} kg dan gaya bersih = ${netForce.toFixed(1)} N, hasilnya persis ${accel.toFixed(2)} m/s².`;
        }
        suggestedPrompts.push('Apa yang terjadi jika gaya diperbesar dua kali lipat?', 'Bagaimana jika gesekan diaktifkan?');
      } else if (q.includes('massa') || q.includes('mass')) {
        answer = `Massa (${mass} kg) adalah ukuran inersia (kelembaman) benda. Semakin besar massa, semakin kecil percepatan yang dihasilkan oleh gaya yang sama (berbanding terbalik).`;
        suggestedPrompts.push('Bagaimana jika massa digandakan?');
      } else {
        answer = `Pada kondisi saat ini: Gaya terpasang = ${force} N, Massa = ${mass} kg, Gaya bersih = ${netForce.toFixed(1)} N, menghasilkan percepatan ${accel.toFixed(2)} m/s². Hubungan matematisnya adalah a = F_net / m.`;
        suggestedPrompts.push('Kenapa percepatannya berubah?', 'Bagaimana hubungan massa dan percepatan?');
      }
    } else if (simulation.engine === 'mathematics') {
      const a = parameters.a ?? 1;
      const b = parameters.b ?? 0;
      const c = parameters.c ?? 0;
      const disc = computed.discriminant;
      const vx = computed.vertexX;
      const vy = computed.vertexY;

      if (q.includes('terbuka') || q.includes('arah') || q.includes('direction') || q.includes('opens')) {
        answer = `Karena nilai koefisien a = ${a} (${a > 0 ? 'positif' : a < 0 ? 'negatif' : 'nol'}), kurva parabola terbuka ${a > 0 ? 'ke atas (cekung ke atas)' : a < 0 ? 'ke bawah (cekung ke bawah)' : 'menjadi garis lurus'}.`;
      } else if (q.includes('akar') || q.includes('root') || q.includes('diskriminan')) {
        answer = `Diskriminan saat ini Δ = b² - 4ac = ${disc}. Karena Δ ${Number(disc) > 0 ? '> 0, fungsi memiliki 2 akar riil berbeda' : Number(disc) === 0 ? '= 0, kurva menyinggung sumbu X (1 akar kembar)' : '< 0, tidak ada perpotongan dengan sumbu X (akar imajiner)'}.`;
      } else {
        answer = `Pada fungsi kuadrat f(x) = ${a}x² + ${b}x + ${c}, titik puncaknya (vertex) berada di koordinat (${vx}, ${vy}) dengan diskriminan Δ = ${disc}.`;
      }
      suggestedPrompts.push('Bagaimana cara membalik kurva?', 'Kapan kurva memiliki tepat 1 akar?');
    } else if (simulation.engine === 'computer-science') {
      const size = parameters.arraySize ?? 20;
      const algName = computed.algorithmName ?? 'Bubble Sort';

      answer = `Algoritma yang aktif adalah ${algName} pada larik ${size} elemen. Kompleksitas rata-rata: ${computed.averageCase}, kasus terbaik: ${computed.bestCase}, kasus terburuk: ${computed.worstCase}. Algoritma ini menukar elemen yang tidak berurutan secara deterministik.`;
      suggestedPrompts.push('Mana algoritma tercepat?', 'Bagaimana Insertion Sort bekerja?');
    } else {
      const eqP = computed.equilibriumPrice;
      const eqQ = computed.equilibriumQuantity;

      if (q.includes('harga') && (q.includes('permintaan') || q.includes('jumlah') || q.includes('turun') || q.includes('naik') || q.includes('pengaruh'))) {
        answer = `Hukum permintaan menyatakan hubungan berbanding terbalik antara harga dan kuantitas yang diminta (kemiringan kurva negatif). Ketika harga barang meningkat, konsumen cenderung mengurangi konsumsi atau mencari barang pengganti/substitusi (efek substitusi) serta daya beli riil mereka menurun (efek pendapatan), sehingga kuantitas barang yang diminta berkurang.`;
      } else {
        answer = `Hukum permintaan menyatakan bahwa ketika harga naik, jumlah barang yang diminta akan menurun (kemiringan kurva negatif). Titik keseimbangan pasar tercapai saat kurva Permintaan berpotongan dengan Penawaran pada harga ekuilibrium P* = $${eqP}, di mana jumlah permintaan dan penawaran berimbang di Q* = ${eqQ} unit.`;
      }
      suggestedPrompts.push('Kenapa harga memengaruhi permintaan?', 'Apa yang terjadi jika harga di atas ekuilibrium?');
    }

    return {
      answer,
      confidence: 0.95,
      suggestedPrompts,
    };
  }

  async generateExperiment(context: AIContextPayload): Promise<ExperimentChallenge> {
    const { simulation, state } = context;

    if (simulation.engine === 'physics') {
      const mass = state.parameters.mass ?? 5;
      const targetA = 5.0;
      return {
        id: `exp-${Date.now()}`,
        title: `Target Acceleration: ${targetA.toFixed(1)} m/s²`,
        objective: `Adjust force so acceleration equals ${targetA.toFixed(2)} m/s² while mass is ${mass} kg.`,
        description: `Set mass to ${mass} kg and adjust the applied force until acceleration reads exactly ${targetA.toFixed(2)} m/s².`,
        allowedParameters: ['force'],
        targetCondition: {
          output: 'acceleration',
          operator: '==',
          value: targetA,
          tolerance: 0.05,
        },
        hint: `Use F = m · a: ${mass} kg × ${targetA} m/s² = ${mass * targetA} N.`,
      };
    }

    return {
      id: `exp-${Date.now()}`,
      title: 'Calibration Trial',
      objective: 'Observe state variation upon changing active parameter.',
      description: 'Adjust controls to observe system response.',
      targetCondition: {
        output: 'acceleration',
        operator: '!=',
        value: 0,
      },
    };
  }

  async generateInsight(
    before: Record<string, number>,
    after: Record<string, number>,
    computed: Record<string, number | string>,
    spec: SimulationSpecification
  ): Promise<SimulationInsight> {
    const changes: SimulationInsight['changes'] = [];
    const held: SimulationInsight['held'] = [];

    for (const [key, def] of Object.entries(spec.parameters)) {
      if (before[key] !== undefined && after[key] !== undefined && before[key] !== after[key]) {
        changes.push({
          parameter: def.label || key,
          from: before[key],
          to: after[key],
          unit: def.unit,
        });
      } else if (after[key] !== undefined) {
        held.push({
          parameter: def.label || key,
          value: after[key],
          unit: def.unit,
        });
      }
    }

    const primaryKey = changes[0]?.parameter || 'Parameter';
    const primaryParamKey = Object.keys(spec.parameters).find(
      (k) => (spec.parameters[k].label || k) === primaryKey
    );
    const mainOutput = Object.keys(computed)[0] || 'result';
    const outputVal = computed[mainOutput];
    const keyRef = primaryParamKey && !primaryKey.toLowerCase().includes(primaryParamKey.toLowerCase())
      ? ` (${primaryParamKey})`
      : '';

    return {
      title: 'What you discovered',
      changes,
      held,
      result: {
        label: mainOutput,
        from: 'Baseline',
        to: String(outputVal),
      },
      keyInsight: `You adjusted ${primaryKey}${keyRef}. In accordance with ${spec.title}, changing this parameter caused the system to transition to an output of ${outputVal}.`,
      tryNext: `Can you achieve the same output while keeping ${primaryKey} constant?`,
    };
  }
}
