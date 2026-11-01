import type { SimulationDefinition } from './engine';
import type { SimulationSpecification, ExperimentChallenge, SimulationInsight } from '@genlab/simulation-types';

export interface GenlabVisualSpec {
  archetype: 'chart' | 'funnel' | 'balance' | 'grid' | 'structure' | 'tax';
  title?: string;
  labels?: string[];
  metrics?: Record<string, any>;
}

export interface ExtendedSimulationDefinition extends SimulationDefinition {
  visual?: GenlabVisualSpec;
  formulaLatex?: string;
  discipline: string;
  category: string;
}

// ============================================================================
// 1. TEKNOLOGI REKAYASA PERANGKAT LUNAK (TRPL) - 7 SIMULASI
// ============================================================================

import { sortingVisualizer } from './simulations/sorting-visualizer';
import { binarySearch } from './simulations/binary-search';

// 1.1 Sorting Algorithm Visualizer
export const sortingVisualizerSimulation: ExtendedSimulationDefinition = {
  ...sortingVisualizer,
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Struktur Data & Algoritma',
  formulaLatex: 'T(n) = O(n^2) \\quad \\text{(Bubble/Selection)}, \\quad O(n \\log n) \\quad \\text{(Quick/Merge)}',
  visual: { archetype: 'chart', title: 'Visualisasi Urutan Data Bar Chart' },
  experiments: [
    {
      id: 'sort-exp-1',
      title: 'Uji Kompleksitas Array 20 Elemen',
      objective: 'Atur ukuran array menjadi 20 elemen untuk menganalisis jumlah komparasi.',
      description: 'Amati komparasi algoritma pengurutan data.',
      targetCondition: { output: 'arraySize', operator: '==', value: 20, tolerance: 0.1 },
    },
    {
      id: 'sort-exp-2',
      title: 'Uji Kecepatan Eksekusi Maksimum',
      objective: 'Atur kecepatan visualisasi ke 80% untuk mempercepat pemrosesan algoritma.',
      description: 'Pelajari efisiensi eksekusi algoritma.',
      targetCondition: { output: 'speed', operator: '>=', value: 80, tolerance: 0.1 },
    },
  ],
};

// 1.2 Binary Search Playground
export const binarySearchSimulation: ExtendedSimulationDefinition = {
  ...binarySearch,
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Algoritma Pencarian',
  formulaLatex: 'T(n) = O(\\log_2 n), \\quad \\text{Ruang Pencarian Dipotong Separuh}',
  visual: { archetype: 'structure', title: 'Visualisasi Array Pointer Low, Mid, High' },
  experiments: [
    {
      id: 'bs-exp-1',
      title: 'Menemukan Elemen Target di Tengah Array',
      objective: 'Atur target pencarian ke angka 50 untuk mengamati pencarian biner langsung pada langkah pertama.',
      description: 'Pelajari kondisi best-case O(1) ketika nilai target berada tepat pada indeks tengah array.',
      targetCondition: { output: 'target', operator: '==', value: 50, tolerance: 0.1 },
    },
    {
      id: 'bs-exp-2',
      title: 'Mencapai Langkah Pencarian Maksimum (Worst Case)',
      objective: 'Atur target ke angka 95 dan ukuran array 32 untuk membuktikan batas atas log2(32) = 5 langkah.',
      description: 'Pahami kompleksitas waktu worst-case logaritmik O(log n).',
      targetCondition: { output: 'arraySize', operator: '>=', value: 30, tolerance: 0.1 },
    },
  ],
};


// 1.3 Stack & Queue Simulator
export const stackQueueSimulation: ExtendedSimulationDefinition = {

  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Struktur Data & Algoritma',
  formulaLatex: '\\text{Stack: LIFO (Last In First Out)}, \\quad \\text{Queue: FIFO (First In First Out)}',
  spec: {
    engine: 'computer-science',
    simulation: 'stack_queue',
    version: 1,
    title: 'Simulator Struktur Data Stack & Queue',
    description: 'Eksplorasi prinsip LIFO (Stack) dan FIFO (Queue), pointer TOP, FRONT, REAR, serta pencegahan overflow/underflow.',
    domain: 'Computer Science',
    concepts: ['stack', 'queue', 'lifo', 'fifo', 'pointer', 'overflow'],
    parameters: {
      capacity: { value: 6, min: 4, max: 10, step: 1, unit: 'slot', label: 'Kapasitas Buffer' },
      itemCount: { value: 4, min: 0, max: 10, step: 1, unit: 'item', label: 'Elemen Terisi' },
      operationMode: { value: 1, min: 1, max: 2, step: 1, unit: '', label: 'Mode (1:Stack, 2:Queue)' },
    },
    controls: ['capacity', 'itemCount', 'operationMode'],
  },
  compute: (params: Record<string, number>) => {
    const capacity = Math.max(4, Math.min(10, params.capacity ?? 6));
    const count = Math.max(0, Math.min(capacity, params.itemCount ?? 4));
    const mode = params.operationMode === 2 ? 'Queue (FIFO)' : 'Stack (LIFO)';
    const isFull = count >= capacity;
    const isEmpty = count === 0;
    const fillPct = Math.round((count / capacity) * 100);
    const topPointer = count > 0 ? count - 1 : -1;

    return {
      capacity,
      itemCount: count,
      mode,
      isFull: isFull ? 'PENUH (Overflow Risk)' : 'AMAN',
      isEmpty: isEmpty ? 'KOSONG (Underflow Risk)' : 'TERISI',
      fillPct,
      topPointer,
      availableSlots: capacity - count,
    };
  },
  experiments: [
    {
      id: 'sq-exp-1',
      title: 'Mencapai Kondisi Stack Penuh (Full Buffer)',
      objective: 'Atur jumlah elemen terisi hingga tepat mencapai kapasitas maksimum (fillPct = 100%).',
      description: 'Pahami kondisi batas overflow saat stack/queue mencapai kapasitas puncak.',
      targetCondition: { output: 'fillPct', operator: '==', value: 100, tolerance: 0.1 },
    },
    {
      id: 'sq-exp-2',
      title: 'Keseimbangan Buffer 50%',
      objective: 'Pertahankan kapasitas 8 slot dan isi tepat 4 elemen (fillPct = 50%).',
      description: 'Pelajari efisiensi pemanfaatan memori dinamis.',
      targetCondition: { output: 'fillPct', operator: '==', value: 50, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Dinamika Struktur Data Linear',
    changes: [{ parameter: 'Elemen Terisi', from: before.itemCount ?? 4, to: after.itemCount ?? 4, unit: 'item' }],
    held: [{ parameter: 'Kapasitas', value: after.capacity ?? 6, unit: 'slot' }],
    result: { label: 'Status Buffer', from: `${before.itemCount ?? 4}/${after.capacity ?? 6}`, to: `${after.itemCount ?? 4}/${after.capacity ?? 6}` },
    keyInsight: (after.itemCount ?? 4) >= (after.capacity ?? 6)
      ? `Buffer telah mencapai kapasitas penuh (${after.capacity} slot). Operasi PUSH atau ENQUEUE berikutnya akan memicu kondisi Stack/Queue OVERFLOW.`
      : `Tersedia ${(after.capacity ?? 6) - (after.itemCount ?? 4)} slot memori bebas. Akses elemen mengikuti disiplin ${after.operationMode === 2 ? 'FIFO (First-In-First-Out)' : 'LIFO (Last-In-First-Out)'}.`,
    tryNext: 'Ubah kapasitas atau beralih antara Stack dan Queue untuk membedakan perilaku pointer.',
  }),
  visual: { archetype: 'structure', title: 'Visualisasi Stack & Queue Pointer' },
};

// 1.4 Algorithm Complexity Explorer
export const algorithmComplexitySimulation: ExtendedSimulationDefinition = {
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Struktur Data & Algoritma',
  formulaLatex: 'T(n) = O(1) < O(\\log n) < O(n) < O(n \\log n) < O(n^2) < O(2^n)',
  spec: {
    engine: 'computer-science',
    simulation: 'algorithm_complexity',
    version: 1,
    title: 'Eksplorasi Kompleksitas Algoritma (Big-O Notation)',
    description: 'Analisis kurva pertumbuhan waktu komputasi asimptotik algoritma terhadap peningkatan ukuran data input N.',
    domain: 'Computer Science',
    concepts: ['big-o', 'time-complexity', 'asymptotic-analysis', 'runtime'],
    parameters: {
      n: { value: 64, min: 8, max: 512, step: 8, unit: 'elemen', label: 'Ukuran Input (N)' },
      clockSpeedMhz: { value: 10, min: 1, max: 100, step: 5, unit: 'MHz', label: 'Kecepatan CPU' },
    },
    controls: ['n', 'clockSpeedMhz'],
  },
  compute: (params: Record<string, number>) => {
    const n = Math.max(8, Math.min(512, params.n ?? 64));
    const mhz = Math.max(1, params.clockSpeedMhz ?? 10);
    const opsPerSec = mhz * 1_000_000;

    const opConstant = 1;
    const opLogN = Math.round(Math.log2(n));
    const opLinear = n;
    const opNLogN = Math.round(n * Math.log2(n));
    const opQuadratic = n * n;

    return {
      n,
      opConstant,
      opLogN,
      opLinear,
      opNLogN,
      opQuadratic,
      timeQuadraticMs: Number(((opQuadratic / opsPerSec) * 1000).toFixed(4)),
      timeLinearMs: Number(((opLinear / opsPerSec) * 1000).toFixed(4)),
      ratioQuadraticToLinear: Math.round(opQuadratic / opLinear),
    };
  },
  experiments: [
    {
      id: 'ac-exp-1',
      title: 'Eskalasi Operasi O(n²) di Atas 100.000 Operasi',
      objective: 'Tingkatkan ukuran input N hingga operasi kuadratik mencapai minimal 100.000 langkah.',
      description: 'Amati ledakan kompleksitas pada algoritma komparasi naive seperti Bubble Sort.',
      targetCondition: { output: 'opQuadratic', operator: '>=', value: 100000, tolerance: 1000 },
    },
    {
      id: 'ac-exp-2',
      title: 'Efisiensi O(n log n) pada Data Menengah N = 256',
      objective: 'Atur input N tepat 256 dan bandingkan rasio penghematan O(n log n) terhadap O(n²).',
      description: 'Pahami mengapa Quicksort/Mergesort jauh mengungguli algoritma kuadratik.',
      targetCondition: { output: 'n', operator: '==', value: 256, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Pertumbuhan Kompleksitas Asimptotik',
    changes: [{ parameter: 'Ukuran Input N', from: before.n ?? 64, to: after.n ?? 64, unit: 'elemen' }],
    held: [{ parameter: 'Clock Speed', value: after.clockSpeedMhz ?? 10, unit: 'MHz' }],
    result: { label: 'Langkah O(n²)', from: `${(before.n ?? 64) ** 2}`, to: `${(after.n ?? 64) ** 2}` },
    keyInsight: `Saat input N bernilai ${after.n}, algoritma O(n²) membutuhkan ${after.opQuadratic} operasi, yaitu ${after.ratioQuadraticToLinear}× lipat lebih banyak dibandingkan algoritma linier O(n).`,
    tryNext: 'Naikkan N mendekati 512 untuk mengamati jurang performa ekstrem antara O(log n) dan O(n²).',
  }),
  visual: { archetype: 'chart', title: 'Kurva Pertumbuhan Big-O' },
};

// 1.5 Database Query Simulator
export const databaseQuerySimulation: ExtendedSimulationDefinition = {
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Basis Data',
  formulaLatex: '\\text{Cost}_{\\text{Seq}} = \\text{Pages} \\times 1.0 + \\text{Rows} \\times 0.01, \\quad \\text{Cost}_{\\text{Index}} = \\text{Depth} + \\text{Hits} \\times 1.2',
  spec: {
    engine: 'computer-science',
    simulation: 'database_query',
    version: 1,
    title: 'Simulator Eksekusi Query Basis Data (Index vs Table Scan)',
    description: 'Analisis perbedaan biaya I/O (Query Execution Cost) antara Sequential Full Table Scan dan Index Seek B-Tree.',
    domain: 'Computer Science',
    concepts: ['indexing', 'b-tree', 'query-plan', 'sequential-scan', 'selectivity', 'cost-model'],
    parameters: {
      totalRows: { value: 50000, min: 5000, max: 200000, step: 5000, unit: 'baris', label: 'Total Baris Tabel' },
      selectivityPct: { value: 2, min: 0.1, max: 20, step: 0.5, unit: '%', label: 'Selektivitas Query' },
      useIndex: { value: 1, min: 0, max: 1, step: 1, unit: '', label: 'Pakai Index B-Tree (1:Ya, 0:Tidak)' },
    },
    controls: ['totalRows', 'selectivityPct', 'useIndex'],
  },
  compute: (params: Record<string, number>) => {
    const rows = Math.max(5000, params.totalRows ?? 50000);
    const selectivity = Math.max(0.1, params.selectivityPct ?? 2) / 100;
    const hasIndex = (params.useIndex ?? 1) >= 1;

    const rowsPerPage = 100;
    const totalPages = Math.ceil(rows / rowsPerPage);
    const matchedRows = Math.ceil(rows * selectivity);

    const seqPagesRead = totalPages;
    const seqCost = Math.round(seqPagesRead * 1.0 + rows * 0.01);
    const btreeDepth = Math.max(2, Math.ceil(Math.log(totalPages) / Math.log(50)));
    const indexPagesRead = hasIndex ? btreeDepth + Math.ceil(matchedRows / 5) : seqPagesRead;
    const indexCost = hasIndex ? Math.round(indexPagesRead * 1.2 + matchedRows * 0.05) : seqCost;
    const costSavingsPct = hasIndex ? Math.round(((seqCost - indexCost) / seqCost) * 100) : 0;

    return {
      totalRows: rows,
      totalPages,
      matchedRows,
      queryPlan: hasIndex ? 'Index Scan (B-Tree Seek)' : 'Sequential Table Scan',
      pagesRead: hasIndex ? indexPagesRead : seqPagesRead,
      queryCost: hasIndex ? indexCost : seqCost,
      costSavingsPct,
      speedupFactor: hasIndex ? Number((seqCost / Math.max(1, indexCost)).toFixed(1)) : 1.0,
    };
  },
  experiments: [
    {
      id: 'db-exp-1',
      title: 'Optimasi Query Cost dengan B-Tree Indexing',
      objective: 'Aktifkan index B-Tree pada tabel 50.000 baris untuk mencapai penghematan biaya I/O minimal 85%.',
      description: 'Pahami cara kerja query optimizer di PostgreSQL / MySQL.',
      targetCondition: { output: 'costSavingsPct', operator: '>=', value: 85, tolerance: 2 },
    },
    {
      id: 'db-exp-2',
      title: 'Titik Balik Efisiensi Index (Tipping Point)',
      objective: 'Naikkan selektivitas ke 15% dan amati bagaimana biaya index seek mulai mendekati sequential scan.',
      description: 'Pelajari kapan query optimizer memutuskan tidak menggunakan index.',
      targetCondition: { output: 'matchedRows', operator: '>=', value: 7000, tolerance: 500 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Eksekusi Query Optimizer',
    changes: [{ parameter: 'Status Index', from: before.useIndex ?? 1, to: after.useIndex ?? 1 }],
    held: [{ parameter: 'Total Baris', value: after.totalRows ?? 50000, unit: 'baris' }],
    result: { label: 'Query Cost', from: `${before.queryCost ?? 100}`, to: `${after.queryCost ?? 100}` },
    keyInsight: (after.useIndex ?? 1) >= 1
      ? `Dengan Index B-Tree, engine hanya membaca ${after.pagesRead} halaman disk dari total ${after.totalPages} halaman. Terjadi penghematan beban I/O sebesar ${after.costSavingsPct}%.`
      : `Tanpa index, engine terpaksa melakukan Full Table Scan (Seq Scan) dengan membaca seluruh ${after.totalPages} halaman data.`,
    tryNext: 'Ubah persentase selektivitas untuk mengamati titik jenuh di mana index tidak lagi menguntungkan.',
  }),
  visual: { archetype: 'structure', title: 'Rencana Eksekusi Query (Query Plan Tree)' },
};

// 1.6 IP Address & Subnet Simulator
export const ipSubnetSimulation: ExtendedSimulationDefinition = {
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Jaringan Komputer',
  formulaLatex: '\\text{Usable Hosts} = 2^{(32 - \\text{CIDR})} - 2',
  spec: {
    engine: 'computer-science',
    simulation: 'ip_subnet',
    version: 1,
    title: 'Simulator Subnetting IP Jaringan Komputer (CIDR)',
    description: 'Kalkulasi dinamis alokasi prefix CIDR, subnet mask, jumlah host valid, alamat network, dan broadcast address.',
    domain: 'Computer Science',
    concepts: ['ip', 'subnet', 'cidr', 'netmask', 'broadcast', 'network-id'],
    parameters: {
      cidrPrefix: { value: 26, min: 24, max: 30, step: 1, unit: '', label: 'Prefix CIDR (/X)' },
      subnetIndex: { value: 0, min: 0, max: 3, step: 1, unit: '', label: 'Blok Subnet Ke-' },
    },
    controls: ['cidrPrefix', 'subnetIndex'],
  },
  compute: (params: Record<string, number>) => {
    const cidr = Math.max(24, Math.min(30, params.cidrPrefix ?? 26));
    const subIdx = Math.max(0, Math.min(params.subnetIndex ?? 0, Math.pow(2, cidr - 24) - 1));

    const totalAddresses = Math.pow(2, 32 - cidr);
    const usableHosts = Math.max(0, totalAddresses - 2);
    const totalSubnets = Math.pow(2, cidr - 24);

    const maskBits = cidr - 24;
    let lastOctetMask = 0;
    for (let i = 0; i < maskBits; i++) lastOctetMask += Math.pow(2, 7 - i);
    const subnetMask = `255.255.255.${lastOctetMask}`;

    const networkOctet = subIdx * totalAddresses;
    const broadcastOctet = networkOctet + totalAddresses - 1;

    return {
      cidrPrefix: `/${cidr}`,
      subnetMask,
      totalSubnets,
      totalAddressesPerSubnet: totalAddresses,
      usableHosts,
      networkAddress: `192.168.10.${networkOctet}`,
      broadcastAddress: `192.168.10.${broadcastOctet}`,
      efficiencyPct: Math.round((usableHosts / totalAddresses) * 100),
    };
  },
  experiments: [
    {
      id: 'ip-exp-1',
      title: 'Alokasi Subnet Tepat 62 Usable Host',
      objective: 'Tentukan prefix CIDR yang mampu menampung tepat 62 komputer host aktif per subnet.',
      description: 'Pahami pembagian blok alamat IPv4 kelas C.',
      targetCondition: { output: 'usableHosts', operator: '==', value: 62, tolerance: 0.1 },
    },
    {
      id: 'ip-exp-2',
      title: 'Subnetting Hemat Point-to-Point (/30)',
      objective: 'Atur CIDR ke /30 untuk kebutuhan interkoneksi router p2p dengan tepat 2 host.',
      description: 'Pelajari pencegahan pemborosan alamat IP publik.',
      targetCondition: { output: 'usableHosts', operator: '==', value: 2, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Topologi Alokasi IP Jaringan',
    changes: [{ parameter: 'Prefix CIDR', from: before.cidrPrefix ?? 26, to: after.cidrPrefix ?? 26, unit: '' }],
    held: [{ parameter: 'Kelas Jaringan', value: 192, unit: 'Class C' }],
    result: { label: 'Kapasitas Host', from: `${before.usableHosts ?? 62}`, to: `${after.usableHosts ?? 62}` },
    keyInsight: `Dengan prefix ${after.cidrPrefix}, jaringan terbagi menjadi ${after.totalSubnets} blok subnet independen. Masing-masing blok memiliki ${after.usableHosts} host valid.`,
    tryNext: 'Ubah blok subnet untuk melihat perubahan alamat awal dan akhir segmen LAN.',
  }),
  visual: { archetype: 'structure', title: 'Peta Bit Subnet IPv4' },
};

// 1.7 Logic Gate Playground
export const logicGatesSimulation: ExtendedSimulationDefinition = {
  discipline: 'Teknologi Rekayasa Perangkat Lunak',
  category: 'Arsitektur Komputer & Logika Digital',
  formulaLatex: 'Y_{\\text{AND}} = A \\cdot B, \\quad Y_{\\text{OR}} = A + B, \\quad Y_{\\text{XOR}} = A \\oplus B',
  spec: {
    engine: 'computer-science',
    simulation: 'logic_gates',
    version: 1,
    title: 'Playground Gerbang Logika Digital (Boolean Logic)',
    description: 'Eksperimen sirkuit gerbang logika dasar AND, OR, XOR, NAND, NOR dan verifikasi tabel kebenaran seketika.',
    domain: 'Computer Science',
    concepts: ['logic-gates', 'boolean-algebra', 'truth-table', 'and', 'or', 'xor', 'nand'],
    parameters: {
      inputA: { value: 1, min: 0, max: 1, step: 1, unit: 'bit', label: 'Input A (0 / 1)' },
      inputB: { value: 0, min: 0, max: 1, step: 1, unit: 'bit', label: 'Input B (0 / 1)' },
      gateType: { value: 3, min: 1, max: 5, step: 1, unit: '', label: 'Tipe Gerbang (1:AND, 2:OR, 3:XOR, 4:NAND, 5:NOR)' },
    },
    controls: ['inputA', 'inputB', 'gateType'],
  },
  compute: (params: Record<string, number>) => {
    const a = (params.inputA ?? 1) >= 1 ? 1 : 0;
    const b = (params.inputB ?? 0) >= 1 ? 1 : 0;
    const gateCode = Math.max(1, Math.min(5, params.gateType ?? 3));
    const gateNames = ['AND', 'OR', 'XOR', 'NAND', 'NOR'];
    const activeGate = gateNames[gateCode - 1];

    let output = 0;
    switch (gateCode) {
      case 1: output = a & b; break;
      case 2: output = a | b; break;
      case 3: output = a ^ b; break;
      case 4: output = (a & b) === 1 ? 0 : 1; break;
      case 5: output = (a | b) === 1 ? 0 : 1; break;
    }

    return {
      inputA: a,
      inputB: b,
      activeGate,
      outputBit: output,
      voltageOutput: output === 1 ? 'HIGH (+5.0 V)' : 'LOW (0.0 V)',
      statusLed: output === 1 ? 'MENYALA' : 'MATI',
    };
  },
  experiments: [
    {
      id: 'lg-exp-1',
      title: 'Aktifkan Output XOR dengan Input Berbeda',
      objective: 'Atur input gerbang XOR agar menghasilkan output bit 1 (HIGH).',
      description: 'Pahami sifat eksklusif dari gerbang XOR pada komputasi adder.',
      targetCondition: { output: 'outputBit', operator: '==', value: 1, tolerance: 0.1 },
    },
    {
      id: 'lg-exp-2',
      title: 'Verifikasi Universal Gate NAND',
      objective: 'Pilih gerbang NAND (tipe 4) dan temukan input di mana output bernilai 0.',
      description: 'Buktikan bahwa NAND hanya bernilai 0 jika semua input 1.',
      targetCondition: { output: 'outputBit', operator: '==', value: 0, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Aljabar Boolean Sirkuit',
    changes: [{ parameter: 'Gerbang Aktif', from: before.gateType ?? 3, to: after.gateType ?? 3 }],
    held: [{ parameter: 'Input A', value: after.inputA ?? 1, unit: 'bit' }],
    result: { label: 'Output Logika Y', from: `${before.outputBit ?? 1}`, to: `${after.outputBit ?? 1}` },
    keyInsight: `Dengan input A=${after.inputA} dan B=${after.inputB}, gerbang ${after.activeGate} menghasilkan output ${after.outputBit} (${after.voltageOutput}).`,
    tryNext: 'Ganti kombinasi input A dan B untuk menguji seluruh baris tabel kebenaran.',
  }),
  visual: { archetype: 'structure', title: 'Diagram Skematik Gerbang Logika' },
};

// ============================================================================
// 2. AKUNTANSI & PERPAJAKAN - 7 SIMULASI
// ============================================================================

export const accountingEquationSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Akuntansi Keuangan',
  formulaLatex: '\\text{Aset} = \\text{Liabilitas} + \\text{Ekuitas}',
  spec: {
    engine: 'economics',
    simulation: 'accounting_equation',
    version: 1,
    title: 'Persamaan Dasar Akuntansi (Balance Sheet Equation)',
    description: 'Eksplorasi hubungan fundamental Aset = Liabilitas + Ekuitas dan efek transaksi bisnis terhadap keseimbangan neraca.',
    domain: 'Accounting',
    concepts: ['balance-sheet', 'assets', 'liabilities', 'equity', 'double-entry', 'accounting-equation'],
    parameters: {
      kas: { value: 60, min: 10, max: 200, step: 5, unit: 'Juta Rp', label: 'Kas & Bank' },
      piutang: { value: 30, min: 0, max: 100, step: 5, unit: 'Juta Rp', label: 'Piutang Usaha' },
      asetTetap: { value: 110, min: 20, max: 300, step: 10, unit: 'Juta Rp', label: 'Aset Tetap (Peralatan)' },
      utangLancar: { value: 40, min: 0, max: 150, step: 5, unit: 'Juta Rp', label: 'Utang Usaha & Bank' },
      modalPemilik: { value: 160, min: 20, max: 400, step: 10, unit: 'Juta Rp', label: 'Modal Disetor' },
    },
    controls: ['kas', 'piutang', 'asetTetap', 'utangLancar', 'modalPemilik'],
  },
  compute: (params: Record<string, number>) => {
    const kas = params.kas ?? 60;
    const piutang = params.piutang ?? 30;
    const asetTetap = params.asetTetap ?? 110;
    const utang = params.utangLancar ?? 40;
    const modal = params.modalPemilik ?? 160;

    const totalAset = kas + piutang + asetTetap;
    const totalPasiva = utang + modal;
    const selisihBalancing = totalAset - totalPasiva;
    const isBalanced = Math.abs(selisihBalancing) < 0.01;
    const rasioUtang = Number(((utang / Math.max(1, totalAset)) * 100).toFixed(1));

    return {
      totalAsetJuta: totalAset,
      totalPasivaJuta: totalPasiva,
      selisihJuta: selisihBalancing,
      statusKeseimbangan: isBalanced ? 'SEIMBANG (Balanced)' : 'TIDAK SEIMBANG (Discrepancy)',
      rasioUtangPct: rasioUtang,
      likuiditasKasPct: Number(((kas / Math.max(1, totalAset)) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'acc-exp-1',
      title: 'Mencapai Neraca Seimbang Sempurna',
      objective: 'Sesuaikan komponen aset dan pasiva hingga selisih balancing tepat bernilai 0.',
      description: 'Prinsip utama pembukuan double-entry akuntansi.',
      targetCondition: { output: 'selisihJuta', operator: '==', value: 0, tolerance: 0.1 },
    },
    {
      id: 'acc-exp-2',
      title: 'Struktur Modal Sehat (Leverage < 30%)',
      objective: 'Pertahankan neraca seimbang dengan rasio utang terhadap aset di bawah 30%.',
      description: 'Analisis solvabilitas perusahaan berkelanjutan.',
      targetCondition: { output: 'rasioUtangPct', operator: '<=', value: 30, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Verifikasi Keseimbangan Neraca Keuangan',
    changes: [{ parameter: 'Total Aset', from: before.totalAsetJuta ?? 200, to: after.totalAsetJuta ?? 200, unit: 'Juta Rp' }],
    held: [{ parameter: 'Mata Uang', value: 1, unit: 'IDR' }],
    result: { label: 'Selisih Keseimbangan', from: `${before.selisihJuta ?? 0}`, to: `${after.selisihJuta ?? 0}` },
    keyInsight: Math.abs(after.selisihJuta ?? 0) < 0.01
      ? `Neraca berada dalam kondisi SEIMBANG SEMPURNA: Total Aset Rp${after.totalAsetJuta} Juta persis sama dengan Total Liabilitas + Ekuitas Rp${after.totalPasivaJuta} Juta.`
      : `Terjadi DISKREPANSI sebesar Rp${Math.abs(after.selisihJuta ?? 0)} Juta.`,
    tryNext: 'Sesuaikan modal atau kas hingga selisih menjadi tepat Rp0.',
  }),
  visual: { archetype: 'balance', title: 'T-Account Neraca Keseimbangan' },
};

export const journalEntriesSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Siklus Akuntansi',
  formulaLatex: '\\sum \\text{Debit} = \\sum \\text{Kredit}',
  spec: {
    engine: 'economics',
    simulation: 'journal_entries',
    version: 1,
    title: 'Simulator Pencatatan Jurnal Transaksi (Debit & Kredit)',
    description: 'Simulasi alur transaksi bisnis terhadap mutasi saldo akun Debit dan Kredit serta dampaknya pada buku besar.',
    domain: 'Accounting',
    concepts: ['journal', 'debit', 'credit', 'ledger', 'double-entry', 'cash-basis'],
    parameters: {
      transaksiNilai: { value: 25, min: 5, max: 100, step: 5, unit: 'Juta Rp', label: 'Nilai Transaksi' },
      tipeTransaksi: { value: 1, min: 1, max: 4, step: 1, unit: '', label: 'Jenis (1:Penjualan, 2:Beli Aset, 3:Beban, 4:Utang)' },
    },
    controls: ['transaksiNilai', 'tipeTransaksi'],
  },
  compute: (params: Record<string, number>) => {
    const nilai = params.transaksiNilai ?? 25;
    const tipe = params.tipeTransaksi ?? 1;
    let akunDebit = 'Kas & Bank (+Aset)';
    let akunKredit = 'Pendapatan Jasa (+Ekuitas)';
    let efekLaba = nilai;
    let efekKas = nilai;

    if (tipe === 2) { akunDebit = 'Peralatan (+Aset Tetap)'; akunKredit = 'Kas & Bank (-Kas)'; efekLaba = 0; efekKas = -nilai; }
    else if (tipe === 3) { akunDebit = 'Beban Gaji (+Beban)'; akunKredit = 'Kas & Bank (-Kas)'; efekLaba = -nilai; efekKas = -nilai; }
    else if (tipe === 4) { akunDebit = 'Kas & Bank (+Aset)'; akunKredit = 'Utang Bank (+Utang)'; efekLaba = 0; efekKas = nilai; }

    return {
      nilaiTransaksiJuta: nilai,
      akunDebit,
      akunKredit,
      totalDebit: nilai,
      totalKredit: nilai,
      selisihJurnal: 0,
      efekKasJuta: efekKas,
      efekLabaBersihJuta: efekLaba,
    };
  },
  experiments: [
    {
      id: 'je-exp-1',
      title: 'Jurnal Pendapatan Tunai Rp50.000.000',
      objective: 'Catat transaksi penjualan tunai dengan nilai tepat Rp50 Juta dan amati kenaikan laba bersih.',
      description: 'Pahami pengaruh pencatatan akun nominal terhadap ekuitas.',
      targetCondition: { output: 'efekLabaBersihJuta', operator: '==', value: 50, tolerance: 0.1 },
    },
    {
      id: 'je-exp-2',
      title: 'Pengendalian Kas Beban Operasional',
      objective: 'Pilih jenis transaksi pembayaran beban operasional dengan nilai Rp20 Juta.',
      description: 'Analisis arus kas keluar operasional.',
      targetCondition: { output: 'efekKasJuta', operator: '==', value: -20, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Posisi Akun Jurnal',
    changes: [{ parameter: 'Nilai Transaksi', from: before.transaksiNilai ?? 25, to: after.transaksiNilai ?? 25, unit: 'Juta Rp' }],
    held: [{ parameter: 'Keseimbangan', value: 0, unit: 'Debit = Kredit' }],
    result: { label: 'Dampak Kas', from: `${before.efekKasJuta ?? 25}`, to: `${after.efekKasJuta ?? 25}` },
    keyInsight: `Transaksi dicatat: [DEBIT] ${after.akunDebit} Rp${after.nilaiTransaksiJuta} Juta dan [KREDIT] ${after.akunKredit} Rp${after.nilaiTransaksiJuta} Juta.`,
    tryNext: 'Ubah jenis transaksi untuk mengamati bagaimana pembelian aset tetap tidak mengubah laba rugi.',
  }),
  visual: { archetype: 'balance', title: 'Format Jurnal Umum & T-Account' },
};

export const breakEvenPointSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Akuntansi Manajemen & Biaya',
  formulaLatex: '\\text{BEP}_{\\text{unit}} = \\frac{\\text{Fixed Cost}}{P - V}, \\quad \\text{BEP}_{\\text{Rp}} = \\frac{\\text{Fixed Cost}}{\\text{CM Ratio}}',
  spec: {
    engine: 'economics',
    simulation: 'break_even_point',
    version: 1,
    title: 'Analisis Titik Impas (Break-Even Point / BEP)',
    description: 'Simulasi penentuan volume penjualan minimum untuk menutup seluruh biaya tetap dan variabel perusahaan.',
    domain: 'Accounting',
    concepts: ['break-even', 'fixed-cost', 'variable-cost', 'contribution-margin', 'margin-of-safety'],
    parameters: {
      fixedCostJuta: { value: 30, min: 10, max: 100, step: 5, unit: 'Juta Rp', label: 'Biaya Tetap (FC)' },
      variableCostRibu: { value: 60, min: 20, max: 200, step: 5, unit: 'Ribu Rp/Unit', label: 'Biaya Variabel (VC)' },
      sellingPriceRibu: { value: 100, min: 50, max: 300, step: 10, unit: 'Ribu Rp/Unit', label: 'Harga Jual (P)' },
    },
    controls: ['fixedCostJuta', 'variableCostRibu', 'sellingPriceRibu'],
  },
  compute: (params: Record<string, number>) => {
    const fc = (params.fixedCostJuta ?? 30) * 1_000_000;
    const vc = (params.variableCostRibu ?? 60) * 1_000;
    const p = Math.max(vc + 5_000, (params.sellingPriceRibu ?? 100) * 1_000);

    const marginPerUnit = p - vc;
    const cmRatio = Number((marginPerUnit / p).toFixed(4));
    const bepUnits = Math.ceil(fc / marginPerUnit);
    const bepRupiahJuta = Number(((bepUnits * p) / 1_000_000).toFixed(2));

    return {
      fixedCostJuta: fc / 1_000_000,
      variableCostRibu: vc / 1_000,
      sellingPriceRibu: p / 1_000,
      marginPerUnitRibu: marginPerUnit / 1_000,
      cmRatioPct: Number((cmRatio * 100).toFixed(1)),
      bepUnits,
      bepRupiahJuta,
      safetyBufferUnits: Math.round(bepUnits * 0.2),
    };
  },
  experiments: [
    {
      id: 'bep-exp-1',
      title: 'Mencapai BEP Rendah <= 500 Unit',
      objective: 'Sesuaikan harga jual dan efisiensi biaya agar titik impas tercapai pada maksimal 500 unit produk.',
      description: 'Strategi akselerasi profitabilitas operasional.',
      targetCondition: { output: 'bepUnits', operator: '<=', value: 500, tolerance: 5 },
    },
    {
      id: 'bep-exp-2',
      title: 'Margin Kontribusi Sehat >= 50%',
      objective: 'Atur rasio harga jual terhadap biaya variabel hingga Contribution Margin Ratio mencapai minimal 50%.',
      description: 'Fundamental penetapan harga berbasis nilai tambah.',
      targetCondition: { output: 'cmRatioPct', operator: '>=', value: 50, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Titik Impas Operasional',
    changes: [{ parameter: 'Harga Jual', from: before.sellingPriceRibu ?? 100, to: after.sellingPriceRibu ?? 100, unit: 'Ribu Rp' }],
    held: [{ parameter: 'Biaya Tetap', value: after.fixedCostJuta ?? 30, unit: 'Juta Rp' }],
    result: { label: 'BEP Volume', from: `${before.bepUnits ?? 750} unit`, to: `${after.bepUnits ?? 750} unit` },
    keyInsight: `Margin kontribusi per unit adalah Rp${after.marginPerUnitRibu} Ribu (${after.cmRatioPct}% dari harga jual). Bisnis wajib menjual minimal ${after.bepUnits} unit (omset Rp${after.bepRupiahJuta} Juta) hanya untuk menutup seluruh biaya tetap sebelum menghasilkan laba.`,
    tryNext: 'Naikkan harga jual untuk mengamati bagaimana BEP unit menurun secara drastis.',
  }),
  visual: { archetype: 'chart', title: 'Grafik Kurva Titik Impas (CVP Chart)' },
};

// 2.3 Simulasi Harga Pokok Produksi (HPP)
export const hppSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Akuntansi Biaya & Manufaktur',
  formulaLatex: '\\text{HPP/Unit} = \\frac{\\text{Biaya Bahan Baku} + \\text{Tenaga Kerja} + \\text{Overhead}}{\\text{Jumlah Produksi}}',
  spec: {
    engine: 'economics',
    simulation: 'hpp_calculation',
    version: 1,
    title: 'Simulasi Harga Pokok Produksi (HPP)',
    description: 'Kalkulasi komponen pembentuk HPP: Biaya Bahan Baku, Tenaga Kerja Langsung, dan Biaya Overhead Pabrik per unit produk.',
    domain: 'Accounting',
    concepts: ['hpp', 'cogs', 'bahan-baku', 'tenaga-kerja', 'overhead', 'biaya-produksi'],
    parameters: {
      bahanBakuJuta: { value: 45, min: 10, max: 200, step: 5, unit: 'Juta Rp', label: 'Bahan Baku' },
      tenagaKerjaJuta: { value: 25, min: 5, max: 100, step: 5, unit: 'Juta Rp', label: 'Tenaga Kerja Langsung' },
      overheadJuta: { value: 15, min: 5, max: 80, step: 5, unit: 'Juta Rp', label: 'Biaya Overhead (BOP)' },
      jumlahProduksiUnit: { value: 5000, min: 500, max: 20000, step: 500, unit: 'Unit', label: 'Jumlah Produksi' },
    },
    controls: ['bahanBakuJuta', 'tenagaKerjaJuta', 'overheadJuta', 'jumlahProduksiUnit'],
  },
  compute: (params: Record<string, number>) => {
    const raw = (params.bahanBakuJuta ?? 45) * 1_000_000;
    const labor = (params.tenagaKerjaJuta ?? 25) * 1_000_000;
    const overhead = (params.overheadJuta ?? 15) * 1_000_000;
    const units = Math.max(1, params.jumlahProduksiUnit ?? 5000);

    const totalCost = raw + labor + overhead;
    const hppPerUnit = Math.round(totalCost / units);
    const totalCostJuta = Number((totalCost / 1_000_000).toFixed(2));

    return {
      bahanBakuJuta: raw / 1_000_000,
      tenagaKerjaJuta: labor / 1_000_000,
      overheadJuta: overhead / 1_000_000,
      jumlahProduksiUnit: units,
      totalCostJuta,
      hppPerUnit,
      primeCostJuta: (raw + labor) / 1_000_000,
      conversionCostJuta: (labor + overhead) / 1_000_000,
    };
  },
  experiments: [
    {
      id: 'hpp-exp-1',
      title: 'Target Efisiensi HPP <= Rp15.000 / Unit',
      objective: 'Ubah salah satu komponen biaya atau tingkatkan volume produksi hingga HPP per unit mencapai maksimal Rp15.000.',
      description: 'Optimalisasi skala ekonomis (economies of scale) dan efisiensi rantai pasok.',
      targetCondition: { output: 'hppPerUnit', operator: '<=', value: 15000, tolerance: 100 },
    },
    {
      id: 'hpp-exp-2',
      title: 'Penskalaan Produksi 10.000 Unit',
      objective: 'Tingkatkan jumlah produksi ke 10.000 unit dan amati penurunan beban overhead per unit.',
      description: 'Pahami pengenceran biaya tetap manufaktur terhadap unit yang diproduksi.',
      targetCondition: { output: 'jumlahProduksiUnit', operator: '==', value: 10000, tolerance: 10 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Komposisi Harga Pokok Produksi',
    changes: [{ parameter: 'Jumlah Produksi', from: before.jumlahProduksiUnit ?? 5000, to: after.jumlahProduksiUnit ?? 5000, unit: 'Unit' }],
    held: [{ parameter: 'Total Biaya', value: after.totalCostJuta ?? 85, unit: 'Juta Rp' }],
    result: { label: 'HPP / Unit', from: `Rp${(before.hppPerUnit ?? 17000).toLocaleString('id-ID')}`, to: `Rp${(after.hppPerUnit ?? 17000).toLocaleString('id-ID')}` },
    keyInsight: `Total biaya manufaktur adalah Rp${after.totalCostJuta} Juta (Bahan Baku Rp${after.bahanBakuJuta} Jt, Tenaga Kerja Rp${after.tenagaKerjaJuta} Jt, Overhead Rp${after.overheadJuta} Jt). Dengan volume ${after.jumlahProduksiUnit} unit, HPP yang terbentuk adalah Rp${(after.hppPerUnit ?? 0).toLocaleString('id-ID')} per unit.`,
    tryNext: 'Tingkatkan jumlah produksi untuk melihat penurunan HPP per unit karena efisiensi overhead.',
  }),
  visual: { archetype: 'chart', title: 'Komposisi Biaya Manufaktur & HPP Per Unit' },
};

export const cashFlowSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Manajemen Keuangan',
  formulaLatex: '\\Delta \\text{Cash} = \\text{CFO} + \\text{CFI} + \\text{CFF}',
  spec: {
    engine: 'economics',
    simulation: 'cash_flow',
    version: 1,
    title: 'Simulator Laporan Arus Kas (Cash Flow Statement)',
    description: 'Eksplorasi ketiga pilar arus kas: Operasional (CFO), Investasi (CFI), dan Pendanaan (CFF) untuk solvabilitas kas.',
    domain: 'Accounting',
    concepts: ['cash-flow', 'cfo', 'cfi', 'cff', 'liquidity', 'working-capital'],
    parameters: {
      cfoJuta: { value: 80, min: -20, max: 200, step: 5, unit: 'Juta Rp', label: 'Arus Kas Operasi (CFO)' },
      cfiJuta: { value: -40, min: -100, max: 20, step: 5, unit: 'Juta Rp', label: 'Arus Kas Investasi (CFI)' },
      cffJuta: { value: -15, min: -50, max: 80, step: 5, unit: 'Juta Rp', label: 'Arus Kas Pendanaan (CFF)' },
      beginningCashJuta: { value: 50, min: 10, max: 150, step: 10, unit: 'Juta Rp', label: 'Saldo Kas Awal' },
    },
    controls: ['cfoJuta', 'cfiJuta', 'cffJuta', 'beginningCashJuta'],
  },
  compute: (params: Record<string, number>) => {
    const cfo = params.cfoJuta ?? 80;
    const cfi = params.cfiJuta ?? -40;
    const cff = params.cffJuta ?? -15;
    const startCash = params.beginningCashJuta ?? 50;

    const netCashChange = cfo + cfi + cff;
    const endingCash = startCash + netCashChange;
    const freeCashFlow = cfo + Math.min(0, cfi);

    return {
      cfoJuta: cfo,
      cfiJuta: cfi,
      cffJuta: cff,
      netCashChangeJuta: netCashChange,
      endingCashJuta: endingCash,
      freeCashFlowJuta: freeCashFlow,
      statusArusKas: netCashChange >= 0 ? 'SURPLUS KAS (+)' : 'DEFISIT KAS (-)',
      cashBurnRisk: endingCash < 20 ? 'RISIKO LIKUIDITAS TINGGI' : 'LIKUIDITAS AMAN',
    };
  },
  experiments: [
    {
      id: 'cf-exp-1',
      title: 'Mencapai Net Cash Flow Positif Minimal Rp30 Juta',
      objective: 'Kelola arus kas sehingga surplus kas bersih periode mencapai minimal Rp30 Juta.',
      description: 'Menjaga bantalan likuiditas kas operasional.',
      targetCondition: { output: 'netCashChangeJuta', operator: '>=', value: 30, tolerance: 1 },
    },
    {
      id: 'cf-exp-2',
      title: 'Free Cash Flow (FCF) Sehat >= Rp50 Juta',
      objective: 'Tingkatkan CFO dan kendalikan belanja modal CFI agar Free Cash Flow mencapai minimal Rp50 Juta.',
      description: 'Metrik utama kemampuan dividen dan ekspansi mandiri.',
      targetCondition: { output: 'freeCashFlowJuta', operator: '>=', value: 50, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Diagnosis Kesehatan Arus Kas',
    changes: [{ parameter: 'CFO Operasional', from: before.cfoJuta ?? 80, to: after.cfoJuta ?? 80, unit: 'Juta Rp' }],
    held: [{ parameter: 'Saldo Kas Awal', value: after.beginningCashJuta ?? 50, unit: 'Juta Rp' }],
    result: { label: 'Saldo Kas Akhir', from: `${before.endingCashJuta ?? 75}`, to: `${after.endingCashJuta ?? 75}` },
    keyInsight: `Perubahan kas bersih periode ini adalah ${(after.netCashChangeJuta ?? 0) >= 0 ? '+' : ''}Rp${after.netCashChangeJuta} Juta, menghasilkan saldo kas akhir Rp${after.endingCashJuta} Juta.`,
    tryNext: 'Perbesar belanja investasi (CFI lebih negatif) dan amati pengaruhnya terhadap kebutuhan pendanaan CFF.',
  }),
  visual: { archetype: 'balance', title: 'Waterfall Arus Kas 3 Aktivitas' },
};

// PP 58/2023 & PMK 168/2023 TER rate lookup table for monthly employee withholding
export function getTerRatePct(category: 'A' | 'B' | 'C', grossMonthly: number): number {
  if (category === 'A') {
    if (grossMonthly <= 5_400_000) return 0.0;
    if (grossMonthly <= 5_650_000) return 0.25;
    if (grossMonthly <= 5_950_000) return 0.5;
    if (grossMonthly <= 6_300_000) return 0.75;
    if (grossMonthly <= 6_750_000) return 1.0;
    if (grossMonthly <= 7_500_000) return 1.25;
    if (grossMonthly <= 8_550_000) return 1.5;
    if (grossMonthly <= 9_650_000) return 1.75;
    if (grossMonthly <= 10_050_000) return 2.0;
    if (grossMonthly <= 10_350_000) return 2.25;
    if (grossMonthly <= 10_700_000) return 2.5;
    if (grossMonthly <= 11_050_000) return 3.0;
    if (grossMonthly <= 11_600_000) return 3.5;
    if (grossMonthly <= 12_500_000) return 4.0;
    if (grossMonthly <= 13_750_000) return 5.0;
    if (grossMonthly <= 15_100_000) return 6.0;
    if (grossMonthly <= 16_950_000) return 7.0;
    if (grossMonthly <= 19_750_000) return 8.0;
    if (grossMonthly <= 24_100_000) return 9.0;
    if (grossMonthly <= 26_450_000) return 10.0;
    if (grossMonthly <= 28_000_000) return 11.0;
    if (grossMonthly <= 30_050_000) return 12.0;
    if (grossMonthly <= 32_400_000) return 13.0;
    if (grossMonthly <= 35_400_000) return 14.0;
    if (grossMonthly <= 39_100_000) return 15.0;
    if (grossMonthly <= 43_850_000) return 16.0;
    if (grossMonthly <= 47_800_000) return 17.0;
    if (grossMonthly <= 51_400_000) return 18.0;
    if (grossMonthly <= 56_300_000) return 19.0;
    if (grossMonthly <= 62_200_000) return 20.0;
    if (grossMonthly <= 68_600_000) return 21.0;
    if (grossMonthly <= 77_500_000) return 22.0;
    if (grossMonthly <= 89_000_000) return 23.0;
    if (grossMonthly <= 101_900_000) return 24.0;
    return 25.0;
  }
  if (category === 'B') {
    if (grossMonthly <= 6_200_000) return 0.0;
    if (grossMonthly <= 6_500_000) return 0.25;
    if (grossMonthly <= 6_850_000) return 0.5;
    if (grossMonthly <= 7_300_000) return 0.75;
    if (grossMonthly <= 9_200_000) return 1.0;
    if (grossMonthly <= 10_750_000) return 1.5;
    if (grossMonthly <= 11_250_000) return 2.0;
    if (grossMonthly <= 11_600_000) return 2.5;
    if (grossMonthly <= 12_600_000) return 3.0;
    if (grossMonthly <= 13_600_000) return 4.0;
    if (grossMonthly <= 14_950_000) return 5.0;
    if (grossMonthly <= 16_400_000) return 6.0;
    if (grossMonthly <= 18_450_000) return 7.0;
    if (grossMonthly <= 21_850_000) return 8.0;
    if (grossMonthly <= 26_000_000) return 9.0;
    if (grossMonthly <= 27_700_000) return 10.0;
    if (grossMonthly <= 29_350_000) return 11.0;
    if (grossMonthly <= 31_450_000) return 12.0;
    if (grossMonthly <= 33_950_000) return 13.0;
    if (grossMonthly <= 37_100_000) return 14.0;
    if (grossMonthly <= 41_100_000) return 15.0;
    if (grossMonthly <= 45_800_000) return 16.0;
    if (grossMonthly <= 49_500_000) return 17.0;
    if (grossMonthly <= 53_800_000) return 18.0;
    if (grossMonthly <= 58_500_000) return 19.0;
    if (grossMonthly <= 64_000_000) return 20.0;
    if (grossMonthly <= 71_000_000) return 21.0;
    if (grossMonthly <= 80_000_000) return 22.0;
    if (grossMonthly <= 93_000_000) return 23.0;
    if (grossMonthly <= 109_000_000) return 24.0;
    return 25.0;
  }
  // Category C
  if (grossMonthly <= 6_600_000) return 0.0;
  if (grossMonthly <= 6_950_000) return 0.25;
  if (grossMonthly <= 7_350_000) return 0.5;
  if (grossMonthly <= 7_800_000) return 0.75;
  if (grossMonthly <= 8_850_000) return 1.0;
  if (grossMonthly <= 9_800_000) return 1.25;
  if (grossMonthly <= 10_950_000) return 1.5;
  if (grossMonthly <= 11_200_000) return 1.75;
  if (grossMonthly <= 12_050_000) return 2.0;
  if (grossMonthly <= 12_950_000) return 3.0;
  if (grossMonthly <= 14_150_000) return 4.0;
  if (grossMonthly <= 15_550_000) return 5.0;
  if (grossMonthly <= 17_050_000) return 6.0;
  if (grossMonthly <= 19_500_000) return 7.0;
  if (grossMonthly <= 22_700_000) return 8.0;
  if (grossMonthly <= 24_700_000) return 9.0;
  if (grossMonthly <= 27_700_000) return 10.0;
  if (grossMonthly <= 30_600_000) return 11.0;
  if (grossMonthly <= 33_700_000) return 12.0;
  if (grossMonthly <= 36_600_000) return 13.0;
  if (grossMonthly <= 40_800_000) return 14.0;
  if (grossMonthly <= 45_300_000) return 15.0;
  if (grossMonthly <= 49_600_000) return 16.0;
  if (grossMonthly <= 54_100_000) return 17.0;
  if (grossMonthly <= 59_600_000) return 18.0;
  if (grossMonthly <= 65_200_000) return 19.0;
  if (grossMonthly <= 72_800_000) return 20.0;
  if (grossMonthly <= 82_000_000) return 21.0;
  if (grossMonthly <= 95_000_000) return 22.0;
  if (grossMonthly <= 110_000_000) return 23.0;
  return 24.0;
}

export const taxCalculationSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Perpajakan Indonesia',
  formulaLatex: '\\text{PKP} = \\text{Netto Setahun} - \\text{PTKP}, \\quad \\text{PPh 21} = \\sum (\\text{Lapisan} \\times \\text{Tarif})',
  spec: {
    engine: 'economics',
    simulation: 'tax_calculation',
    version: 1,
    title: 'Kalkulator Pajak Penghasilan (PPh Pasal 21 UU HPP)',
    description: 'Simulasi perhitungan tarif pajak progresif orang pribadi UU Harmonisasi Peraturan Perpajakan (5% s/d 35%) dan PTKP.',
    domain: 'Taxation',
    concepts: ['tax', 'pph-21', 'ptkp', 'pkp', 'progressive-tax', 'uu-hpp'],
    parameters: {
      gajiBulananJuta: { value: 15, min: 5, max: 100, step: 2.5, unit: 'Juta Rp/Bulan', label: 'Gaji Pokok & Tunjangan' },
      statusPtkpIndex: { value: 2, min: 1, max: 5, step: 1, unit: '', label: 'Status PTKP (1:TK/0, 2:K/0, 3:K/1, 4:K/2, 5:K/3)' },
    },
    controls: ['gajiBulananJuta', 'statusPtkpIndex'],
  },

  compute: (params: Record<string, number>) => {
    const gajiBulan = (params.gajiBulananJuta ?? 15) * 1_000_000;
    const ptkpCode = params.statusPtkpIndex ?? 2;
    const ptkpMap: Record<number, { label: string; amount: number; terCategory: 'A' | 'B' | 'C' }> = {
      1: { label: 'TK/0 (Tidak Kawin)', amount: 54_000_000, terCategory: 'A' },
      2: { label: 'K/0 (Kawin 0 Tanggungan)', amount: 58_500_000, terCategory: 'A' },
      3: { label: 'K/1 (Kawin 1 Tanggungan)', amount: 63_000_000, terCategory: 'B' },
      4: { label: 'K/2 (Kawin 2 Tanggungan)', amount: 67_500_000, terCategory: 'B' },
      5: { label: 'K/3 (Kawin 3 Tanggungan)', amount: 72_000_000, terCategory: 'C' },
    };
    const ptkpInfo = ptkpMap[ptkpCode] || ptkpMap[2];
    const brutoSetahun = gajiBulan * 12;
    const biayaJabatan = Math.min(6_000_000, brutoSetahun * 0.05);
    const nettoSetahun = brutoSetahun - biayaJabatan;
    const pkp = Math.max(0, Math.floor((nettoSetahun - ptkpInfo.amount) / 1000) * 1000);

    let pph21Tahunan = 0;
    let sisaPkp = pkp;
    const b1 = Math.min(sisaPkp, 60_000_000); pph21Tahunan += b1 * 0.05; sisaPkp -= b1;
    const b2 = Math.min(sisaPkp, 190_000_000); pph21Tahunan += b2 * 0.15; sisaPkp -= b2;
    const b3 = Math.min(sisaPkp, 250_000_000); pph21Tahunan += b3 * 0.25; sisaPkp -= b3;
    const b4 = Math.min(sisaPkp, 4_500_000_000); pph21Tahunan += b4 * 0.30; sisaPkp -= b4;
    if (sisaPkp > 0) pph21Tahunan += sisaPkp * 0.35;

    const pph21Bulanan = Math.round(pph21Tahunan / 12);
    const effectiveRatePct = brutoSetahun > 0 ? Number(((pph21Tahunan / brutoSetahun) * 100).toFixed(2)) : 0;

    // PP 58/2023 & PMK 168/2023 TER Monthly Withholding (Jan-Nov) & Month 12 True-Up
    const terRatePct = getTerRatePct(ptkpInfo.terCategory, gajiBulan);
    const pph21TerBulanan = Math.round(gajiBulan * (terRatePct / 100));
    const pph21DesemberTrueUp = Math.max(0, pph21Tahunan - (11 * pph21TerBulanan));

    return {
      gajiBulananJuta: gajiBulan / 1_000_000,
      statusPtkp: ptkpInfo.label,
      ptkpJuta: ptkpInfo.amount / 1_000_000,
      pkpJuta: Number((pkp / 1_000_000).toFixed(2)),
      pph21TahunanJuta: Number((pph21Tahunan / 1_000_000).toFixed(2)),
      pph21BulananRibu: Math.round(pph21Bulanan / 1000),
      takeHomePayBulananJuta: Number(((gajiBulan - pph21Bulanan) / 1_000_000).toFixed(2)),
      effectiveRatePct,
      terCategory: `Kategori ${ptkpInfo.terCategory}`,
      terRatePct,
      pph21TerBulananRibu: Math.round(pph21TerBulanan / 1000),
      pph21DesemberRibu: Math.round(pph21DesemberTrueUp / 1000),
      withholdingReconciliationTotal: (11 * pph21TerBulanan) + pph21DesemberTrueUp,
    };
  },
  experiments: [
    {
      id: 'tax-exp-1',
      title: 'Kalkulasi PPh 21 Gaji Rp15 Juta Status K/0',
      objective: 'Hitung PPh 21 bulanan untuk gaji Rp15.000.000 dengan status PTKP K/0.',
      description: 'Pahami pengurang biaya jabatan dan tarif bertingkat UU HPP.',
      targetCondition: { output: 'pph21BulananRibu', operator: 'between', value: 800, value2: 1200, tolerance: 50 },
    },
    {
      id: 'tax-exp-2',
      title: 'Batas Bebas Pajak (PKP = 0)',
      objective: 'Atur gaji ke Rp5 Juta dengan status K/2 agar PKP bernilai 0 (nihil pajak).',
      description: 'Analisis perlindungan penghasilan tidak kena pajak bagi pekerja.',
      targetCondition: { output: 'pkpJuta', operator: '==', value: 0, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Struktur Pemotongan Pajak Penghasilan',
    changes: [{ parameter: 'Gaji Bruto', from: before.gajiBulananJuta ?? 15, to: after.gajiBulananJuta ?? 15, unit: 'Juta Rp' }],
    held: [{ parameter: 'Regulasi', value: 2024, unit: 'UU HPP' }],
    result: { label: 'PPh 21 Bulanan', from: `${before.pph21BulananRibu ?? 1000} Rb`, to: `${after.pph21BulananRibu ?? 1000} Rb` },
    keyInsight: `Dengan PTKP sebesar Rp${after.ptkpJuta} Juta (${after.statusPtkp}), Penghasilan Kena Pajak (PKP) ditetapkan sebesar Rp${after.pkpJuta} Juta. Total PPh 21 terutang adalah Rp${after.pph21TahunanJuta} Juta/tahun, setara tarif efektif ${after.effectiveRatePct}%.`,
    tryNext: 'Ganti status PTKP untuk mengamati penurunan pajak dari tanggungan keluarga.',
  }),
  visual: { archetype: 'tax', title: 'Lapisan Tarif Progresif Pajak (Brackets)' },
};

export const financialRatiosSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Analisis Laporan Keuangan',
  formulaLatex: '\\text{CR} = \\frac{\\text{CA}}{\\text{CL}}, \\quad \\text{DER} = \\frac{\\text{Debt}}{\\text{Equity}}, \\quad \\text{ROE} = \\frac{\\text{Net Income}}{\\text{Equity}} \\times 100\\%',
  spec: {
    engine: 'economics',
    simulation: 'financial_ratios',
    version: 1,
    title: 'Analisis Rasio Keuangan Perusahaan (Likuiditas & Solvabilitas)',
    description: 'Kalkulasi rasio likuiditas (Current Ratio), solvabilitas (Debt to Equity), dan profitabilitas (ROE) untuk diagnosis kelayakan kredit.',
    domain: 'Accounting',
    concepts: ['ratios', 'current-ratio', 'der', 'roe', 'liquidity', 'solvency', 'profitability'],
    parameters: {
      currentAssetsJuta: { value: 180, min: 50, max: 500, step: 10, unit: 'Juta Rp', label: 'Aset Lancar (CA)' },
      currentLiabilitiesJuta: { value: 90, min: 20, max: 300, step: 10, unit: 'Juta Rp', label: 'Liabilitas Lancar (CL)' },
      totalDebtJuta: { value: 120, min: 20, max: 400, step: 10, unit: 'Juta Rp', label: 'Total Liabilitas (Debt)' },
      equityJuta: { value: 200, min: 50, max: 600, step: 10, unit: 'Juta Rp', label: 'Total Ekuitas (Equity)' },
      netIncomeJuta: { value: 35, min: 5, max: 150, step: 5, unit: 'Juta Rp', label: 'Laba Bersih (Net Income)' },
    },
    controls: ['currentAssetsJuta', 'currentLiabilitiesJuta', 'totalDebtJuta', 'equityJuta', 'netIncomeJuta'],
  },
  compute: (params: Record<string, number>) => {
    const ca = params.currentAssetsJuta ?? 180;
    const cl = Math.max(1, params.currentLiabilitiesJuta ?? 90);
    const debt = params.totalDebtJuta ?? 120;
    const equity = Math.max(1, params.equityJuta ?? 200);
    const ni = params.netIncomeJuta ?? 35;

    const currentRatio = Number((ca / cl).toFixed(2));
    const der = Number((debt / equity).toFixed(2));
    const roe = Number(((ni / equity) * 100).toFixed(1));

    return {
      currentRatio,
      debtToEquityRatio: der,
      roePct: roe,
      workingCapitalJuta: ca - cl,
      liquidityStatus: currentRatio >= 2.0 ? 'SANGAT SEHAT' : currentRatio >= 1.2 ? 'CUKUP' : 'RAWAN LIKUIDITAS',
      solvencyStatus: der <= 0.8 ? 'SOLVABEL KUAT' : der <= 1.5 ? 'MODERAT' : 'LEVERAGE TINGGI',
    };
  },
  experiments: [
    {
      id: 'fr-exp-1',
      title: 'Current Ratio Prima >= 2.00x',
      objective: 'Atur aset lancar dan liabilitas lancar sehingga rasio likuiditas mencapai minimal 2.00x.',
      description: 'Tolok ukur kemampuan membayar kewajiban jangka pendek tanpa menjual aset tetap.',
      targetCondition: { output: 'currentRatio', operator: '>=', value: 2.0, tolerance: 0.05 },
    },
    {
      id: 'fr-exp-2',
      title: 'Profitabilitas Ekuitas ROE >= 20%',
      objective: 'Tingkatkan efisiensi laba bersih sehingga imbal hasil ekuitas (ROE) melampaui 20%.',
      description: 'Menarik investor modal ventura dan pasar modal.',
      targetCondition: { output: 'roePct', operator: '>=', value: 20, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Diagnosis Fundamental Keuangan',
    changes: [{ parameter: 'Aset Lancar', from: before.currentAssetsJuta ?? 180, to: after.currentAssetsJuta ?? 180, unit: 'Juta Rp' }],
    held: [{ parameter: 'Ekuitas', value: after.equityJuta ?? 200, unit: 'Juta Rp' }],
    result: { label: 'Current Ratio', from: `${before.currentRatio ?? 2.0}x`, to: `${after.currentRatio ?? 2.0}x` },
    keyInsight: `Current Ratio sebesar ${after.currentRatio}x menandakan perusahaan memiliki Rp${after.currentRatio} aset likuid untuk setiap Rp1 kewajiban jatuh tempo.`,
    tryNext: 'Tingkatkan liabilitas untuk mengamati dampak kenaikan risiko leverage terhadap nilai DER.',
  }),
  visual: { archetype: 'chart', title: 'Radar Kesehatan Rasio Finansial' },
};

export const budgetingSimulation: ExtendedSimulationDefinition = {
  discipline: 'Akuntansi Perpajakan',
  category: 'Penganggaran Perusahaan',
  formulaLatex: '\\text{Variance} = \\text{Aktual} - \\text{Anggaran}',
  spec: {
    engine: 'economics',
    simulation: 'budgeting_simulator',
    version: 1,
    title: 'Simulator Anggaran & Analisis Varians (Budgeting vs Actual)',
    description: 'Analisis penyimpangan anggaran operasional, varians Favorable (F) dan Unfavorable (U) untuk evaluasi kinerja manajerial.',
    domain: 'Accounting',
    concepts: ['budget', 'variance', 'favorable', 'unfavorable', 'cost-control', 'variance-analysis'],
    parameters: {
      budgetedRevenueJuta: { value: 300, min: 100, max: 1000, step: 20, unit: 'Juta Rp', label: 'Target Pendapatan' },
      actualRevenueJuta: { value: 320, min: 100, max: 1000, step: 20, unit: 'Juta Rp', label: 'Realisasi Pendapatan' },
      budgetedExpenseJuta: { value: 200, min: 50, max: 600, step: 10, unit: 'Juta Rp', label: 'Plafon Beban' },
      actualExpenseJuta: { value: 190, min: 50, max: 600, step: 10, unit: 'Juta Rp', label: 'Realisasi Beban' },
    },
    controls: ['budgetedRevenueJuta', 'actualRevenueJuta', 'budgetedExpenseJuta', 'actualExpenseJuta'],
  },
  compute: (params: Record<string, number>) => {
    const bRev = params.budgetedRevenueJuta ?? 300;
    const aRev = params.actualRevenueJuta ?? 320;
    const bExp = params.budgetedExpenseJuta ?? 200;
    const aExp = params.actualExpenseJuta ?? 190;

    const revVariance = aRev - bRev;
    const expVariance = bExp - aExp;
    const budgetedProfit = bRev - bExp;
    const actualProfit = aRev - aExp;
    const netProfitVariance = actualProfit - budgetedProfit;

    return {
      budgetedProfitJuta: budgetedProfit,
      actualProfitJuta: actualProfit,
      revenueVarianceJuta: revVariance,
      expenseVarianceJuta: -expVariance,
      netProfitVarianceJuta: netProfitVariance,
      revenueStatus: revVariance >= 0 ? 'Favorable (F)' : 'Unfavorable (U)',
      expenseStatus: expVariance >= 0 ? 'Favorable (F)' : 'Unfavorable (U)',
      netStatus: netProfitVariance >= 0 ? 'FAVORABLE (Target Tercapai)' : 'UNFAVORABLE (Di Bawah Target)',
      achievementPct: Number(((actualProfit / Math.max(1, budgetedProfit)) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'bg-exp-1',
      title: 'Mencapai Net Variance Favorable >= Rp30 Juta',
      objective: 'Tingkatkan pendapatan aktual dan lakukan efisiensi beban hingga laba melampaui anggaran minimal Rp30 Juta.',
      description: 'Prinsip manajemen berbasis kinerja dan efisiensi biaya.',
      targetCondition: { output: 'netProfitVarianceJuta', operator: '>=', value: 30, tolerance: 1 },
    },
    {
      id: 'bg-exp-2',
      title: 'Efisiensi Beban (Penghematan >= Rp15 Juta)',
      objective: 'Tekan realisasi beban hingga minimal Rp15 Juta di bawah batas plafon anggaran.',
      description: 'Pengendalian biaya operasional departemen.',
      targetCondition: { output: 'expenseVarianceJuta', operator: '<=', value: -15, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Realisasi Kinerja Anggaran',
    changes: [{ parameter: 'Realisasi Laba', from: before.actualProfitJuta ?? 130, to: after.actualProfitJuta ?? 130, unit: 'Juta Rp' }],
    held: [{ parameter: 'Target Laba Anggaran', value: after.budgetedProfitJuta ?? 100, unit: 'Juta Rp' }],
    result: { label: 'Varians Laba Bersih', from: `${before.netProfitVarianceJuta ?? 30} Jt`, to: `${after.netProfitVarianceJuta ?? 30} Jt` },
    keyInsight: `Kinerja perusahaan mencatat realisasi laba bersih Rp${after.actualProfitJuta} Juta (${after.achievementPct}% dari anggaran). Varians laba bernilai ${after.netStatus} sebesar Rp${Math.abs(after.netProfitVarianceJuta ?? 0)} Juta.`,
    tryNext: 'Tingkatkan realisasi beban melebihi plafon untuk melihat timbulnya varians Unfavorable.',
  }),
  visual: { archetype: 'chart', title: 'Komparasi Batang Anggaran vs Realisasi' },
};

// ============================================================================
// 3. MANAJEMEN PEMASARAN INTERNASIONAL - 6 SIMULASI
// ============================================================================

export const marketingFunnelSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Pemasaran Digital & Analitik',
  formulaLatex: '\\text{Customers} = \\text{Impressions} \\times \\text{CTR} \\times \\text{LeadConv} \\times \\text{SaleConv}',
  spec: {
    engine: 'economics',
    simulation: 'marketing_funnel',
    version: 1,
    title: 'Simulator Corong Pemasaran Digital (Marketing Funnel & CAC/LTV)',
    description: 'Simulasi multi-tahap konversi Awareness -> Interest -> Consideration -> Purchase dan analisis efisiensi biaya akuisisi (CAC).',
    domain: 'Marketing',
    concepts: ['funnel', 'ctr', 'conversion-rate', 'cac', 'ltv', 'roas'],
    parameters: {
      impressionsRibu: { value: 100, min: 10, max: 500, step: 10, unit: 'Ribu Tayang', label: 'Impresi Iklan' },
      ctrPct: { value: 3.5, min: 0.5, max: 10, step: 0.5, unit: '%', label: 'Click-Through Rate (CTR)' },
      leadConvPct: { value: 12, min: 2, max: 30, step: 1, unit: '%', label: 'Konversi ke Lead' },
      saleConvPct: { value: 15, min: 2, max: 40, step: 1, unit: '%', label: 'Konversi Lead ke Pembeli' },
      adSpendJuta: { value: 15, min: 2, max: 80, step: 1, unit: 'Juta Rp', label: 'Total Anggaran Iklan' },
    },
    controls: ['impressionsRibu', 'ctrPct', 'leadConvPct', 'saleConvPct', 'adSpendJuta'],
  },
  compute: (params: Record<string, number>) => {
    const impressions = (params.impressionsRibu ?? 100) * 1000;
    const ctr = (params.ctrPct ?? 3.5) / 100;
    const leadRate = (params.leadConvPct ?? 12) / 100;
    const saleRate = (params.saleConvPct ?? 15) / 100;
    const adSpend = (params.adSpendJuta ?? 15) * 1_000_000;

    const clicks = Math.round(impressions * ctr);
    const leads = Math.round(clicks * leadRate);
    const customers = Math.round(leads * saleRate);

    const cpa = customers > 0 ? Math.round(adSpend / customers) : 0;
    const cpl = leads > 0 ? Math.round(adSpend / leads) : 0;
    const cpc = clicks > 0 ? Math.round(adSpend / clicks) : 0;

    return {
      impressions,
      clicks,
      leads,
      customers,
      cpcRupiah: cpc,
      cplRupiah: cpl,
      cacRupiah: cpa,
      funnelDropoffPct: Number((((impressions - customers) / impressions) * 100).toFixed(2)),
      overallConvPct: Number(((customers / Math.max(1, impressions)) * 100).toFixed(4)),
    };
  },
  experiments: [
    {
      id: 'mf-exp-1',
      title: 'Akuisisi Minimal 50 Pelanggan Baru',
      objective: 'Optimalkan CTR dan konversi corong hingga berhasil mengakuisisi minimal 50 pembeli baru.',
      description: 'Strategi optimasi conversion rate optimization (CRO).',
      targetCondition: { output: 'customers', operator: '>=', value: 50, tolerance: 1 },
    },
    {
      id: 'mf-exp-2',
      title: 'Efisiensi CAC di Bawah Rp250.000',
      objective: 'Kendalikan biaya akuisisi pelanggan (CAC) agar tidak melampaui Rp250.000 per pembeli.',
      description: 'Menjaga unit ekonomi bisnis berkelanjutan.',
      targetCondition: { output: 'cacRupiah', operator: '<=', value: 250000, tolerance: 5000 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Efisiensi Konversi Corong Pemasaran',
    changes: [{ parameter: 'CTR', from: before.ctrPct ?? 3.5, to: after.ctrPct ?? 3.5, unit: '%' }],
    held: [{ parameter: 'Anggaran Iklan', value: after.adSpendJuta ?? 15, unit: 'Juta Rp' }],
    result: { label: 'Pelanggan Baru', from: `${before.customers ?? 63}`, to: `${after.customers ?? 63}` },
    keyInsight: `Dari total ${(after.impressions ?? 100000).toLocaleString('id-ID')} tayangan iklan, sistem menghasilkan ${after.clicks} klik, ${after.leads} prospek (leads), dan berhasil mengonversi ${after.customers} pembeli akhir. Biaya akuisisi per pelanggan (CAC) adalah Rp${(after.cacRupiah ?? 0).toLocaleString('id-ID')}.`,
    tryNext: 'Tingkatkan rasio konversi lead ke penjualan untuk menurunkan CAC secara langsung.',
  }),
  visual: { archetype: 'funnel', title: 'Visualisasi Corong Konversi 4 Tahap' },
};

export const pricingStrategySimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Strategi Penetapan Harga',
  formulaLatex: 'P_{\\text{CostPlus}} = \\text{COGS} \\times (1 + m), \\quad \\text{Margin} = \\frac{P - \\text{COGS}}{P} \\times 100\\%',
  spec: {
    engine: 'economics',
    simulation: 'pricing_strategy',
    version: 1,
    title: 'Simulator Penetapan Harga Global (Cost-Plus vs Value-Based)',
    description: 'Analisis komparasi penetapan harga cost-plus vs value-based, elastisitas penerimaan pasar, dan margin kotor ekspor.',
    domain: 'Marketing',
    concepts: ['pricing', 'cost-plus', 'value-based', 'markup', 'gross-margin', 'international-trade'],
    parameters: {
      cogsRibu: { value: 120, min: 40, max: 400, step: 10, unit: 'Ribu Rp/Unit', label: 'HPP / COGS Ekspor' },
      markupPct: { value: 50, min: 10, max: 150, step: 5, unit: '%', label: 'Target Markup Biaya' },
      competitorPriceRibu: { value: 200, min: 50, max: 500, step: 10, unit: 'Ribu Rp', label: 'Harga Rata-Rata Pesaing' },
      perceivedValueMultiplier: { value: 1.2, min: 0.8, max: 2.0, step: 0.1, unit: 'x', label: 'Indeks Nilai Tambah Merek' },
    },
    controls: ['cogsRibu', 'markupPct', 'competitorPriceRibu', 'perceivedValueMultiplier'],
  },
  compute: (params: Record<string, number>) => {
    const cogs = params.cogsRibu ?? 120;
    const markup = (params.markupPct ?? 50) / 100;
    const compPrice = params.competitorPriceRibu ?? 200;
    const valueMult = params.perceivedValueMultiplier ?? 1.2;

    const costPlusPrice = Math.round(cogs * (1 + markup));
    const valueBasedPrice = Math.round(compPrice * valueMult);

    const costPlusMarginPct = Number((((costPlusPrice - cogs) / costPlusPrice) * 100).toFixed(1));
    const valueBasedMarginPct = Number((((valueBasedPrice - cogs) / valueBasedPrice) * 100).toFixed(1));
    const priceCompetitiveness = Number((costPlusPrice / compPrice).toFixed(2));

    return {
      costPlusPriceRibu: costPlusPrice,
      valueBasedPriceRibu: valueBasedPrice,
      cogsRibu: cogs,
      costPlusMarginPct,
      valueBasedMarginPct,
      priceCompetitivenessRatio: priceCompetitiveness,
      marketPosition: priceCompetitiveness < 0.95 ? 'Harga Kompetitif (Penetrasi)' : priceCompetitiveness > 1.15 ? 'Harga Premium (Skimming)' : 'Setara Pasar',
    };
  },
  experiments: [
    {
      id: 'ps-exp-1',
      title: 'Margin Kotor Ekspor >= 40%',
      objective: 'Tentukan harga jual dengan margin kotor minimal 40% namun rasio daya saing harga tetap <= 1.05x kompetitor.',
      description: 'Optimalisasi profitabilitas ekspor produk komoditas bernilai tambah.',
      targetCondition: { output: 'costPlusMarginPct', operator: '>=', value: 40, tolerance: 0.5 },
    },
    {
      id: 'ps-exp-2',
      title: 'Positioning Premium Berbasis Nilai',
      objective: 'Tingkatkan indeks nilai tambah hingga harga berbasis nilai (Value-Based) melampaui Rp250 Ribu.',
      description: 'Strategi diferensiasi brand di pasar internasional.',
      targetCondition: { output: 'valueBasedPriceRibu', operator: '>=', value: 250, tolerance: 5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Strategi Penetapan Harga',
    changes: [{ parameter: 'Markup Biaya', from: before.markupPct ?? 50, to: after.markupPct ?? 50, unit: '%' }],
    held: [{ parameter: 'Harga Kompetitor', value: after.competitorPriceRibu ?? 200, unit: 'Ribu Rp' }],
    result: { label: 'Harga Cost-Plus', from: `Rp${before.costPlusPriceRibu ?? 180} Rb`, to: `Rp${after.costPlusPriceRibu ?? 180} Rb` },
    keyInsight: `Harga cost-plus menghasilkan Rp${after.costPlusPriceRibu} Ribu (margin ${after.costPlusMarginPct}%), berposisi ${after.marketPosition} terhadap kompetitor (${after.priceCompetitivenessRatio}x).`,
    tryNext: 'Ubah indeks nilai tambah merek untuk melihat peluang penetapan harga premium.',
  }),
  visual: { archetype: 'chart', title: 'Perbandingan Harga & Margin Strategis' },
};

export const marketSegmentationSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Riset Pasar Internasional',
  formulaLatex: '\\text{SOM} = \\text{Total Market} \\times \\text{Segment Share} \\times \\text{Target Penetration}',
  spec: {
    engine: 'economics',
    simulation: 'market_segmentation',
    version: 1,
    title: 'Simulator Segmentasi Pasar Global (TAM, SAM, SOM)',
    description: 'Kalkulasi potensi pasar Total Addressable Market (TAM), Serviceable Addressable Market (SAM), dan Serviceable Obtainable Market (SOM).',
    domain: 'Marketing',
    concepts: ['tam', 'sam', 'som', 'segmentation', 'market-share', 'market-sizing'],
    parameters: {
      tamPopulasiRibu: { value: 1200, min: 200, max: 5000, step: 100, unit: 'Ribu Orang', label: 'Total Populasi Pasar (TAM)' },
      targetSegmentPct: { value: 30, min: 5, max: 70, step: 5, unit: '%', label: 'Ukuran Segmen Relevan (SAM %)' },
      penetrationTargetPct: { value: 5, min: 0.5, max: 20, step: 0.5, unit: '%', label: 'Target Pangsa Penetrasi (SOM %)' },
      arpuRibuTahunan: { value: 450, min: 100, max: 2000, step: 50, unit: 'Ribu Rp/Tahun', label: 'Rata-Rata Belanja/Tahun (ARPU)' },
    },
    controls: ['tamPopulasiRibu', 'targetSegmentPct', 'penetrationTargetPct', 'arpuRibuTahunan'],
  },
  compute: (params: Record<string, number>) => {
    const tamPeople = (params.tamPopulasiRibu ?? 1200) * 1000;
    const samPct = (params.targetSegmentPct ?? 30) / 100;
    const somPct = (params.penetrationTargetPct ?? 5) / 100;
    const arpu = (params.arpuRibuTahunan ?? 450) * 1000;

    const samPeople = Math.round(tamPeople * samPct);
    const somPeople = Math.round(samPeople * somPct);

    return {
      tamPeople,
      samPeople,
      somPeople,
      tamRevenueMiliar: Number(((tamPeople * arpu) / 1_000_000_000).toFixed(2)),
      samRevenueMiliar: Number(((samPeople * arpu) / 1_000_000_000).toFixed(2)),
      somRevenueMiliar: Number(((somPeople * arpu) / 1_000_000_000).toFixed(2)),
      somShareOfTamPct: Number(((somPeople / tamPeople) * 100).toFixed(2)),
    };
  },
  experiments: [
    {
      id: 'ms-exp-1',
      title: 'Target Pasar Terjangkau SOM Minimal Rp5 Miliar',
      objective: 'Atur segmentasi dan penetrasi agar potensi pasar riil (SOM Revenue) mencapai minimal Rp5 Miliar/tahun.',
      description: 'Justifikasi kelayakan ekspansi pasar ekspor baru.',
      targetCondition: { output: 'somRevenueMiliar', operator: '>=', value: 5.0, tolerance: 0.2 },
    },
    {
      id: 'ms-exp-2',
      title: 'Akuisisi Target 20.000 Pelanggan Segmen',
      objective: 'Tentukan kombinasi populasi dan penetrasi yang menghasilkan minimal 20.000 pembeli (SOM).',
      description: 'Penskalaan kapasitas rantai pasok pemasaran.',
      targetCondition: { output: 'somPeople', operator: '>=', value: 20000, tolerance: 500 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Ukuran & Nilai Peluang Pasar',
    changes: [{ parameter: 'Target Penetrasi SOM', from: before.penetrationTargetPct ?? 5, to: after.penetrationTargetPct ?? 5, unit: '%' }],
    held: [{ parameter: 'ARPU Konsumen', value: after.arpuRibuTahunan ?? 450, unit: 'Ribu Rp' }],
    result: { label: 'SOM Revenue', from: `Rp${before.somRevenueMiliar ?? 8} M`, to: `Rp${after.somRevenueMiliar ?? 8} M` },
    keyInsight: `Dari Total Pasar (TAM) ${(after.tamPeople ?? 0).toLocaleString('id-ID')} konsumen, segmen sasaran (SAM) mencakup ${(after.samPeople ?? 0).toLocaleString('id-ID')} orang. SOM Anda adalah ${(after.somPeople ?? 0).toLocaleString('id-ID')} pelanggan dengan potensi omset Rp${after.somRevenueMiliar} Miliar/tahun.`,
    tryNext: 'Persempit segmen ke kelompok lebih spesifik dengan daya beli (ARPU) lebih tinggi.',
  }),
  visual: { archetype: 'funnel', title: 'Hierarki Potensi Pasar (TAM -> SAM -> SOM)' },
};

// 3.4 Simulator Bauran Pemasaran (Marketing Mix 4P)
export const marketingMixSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Strategi Pemasaran Global',
  formulaLatex: '\\text{Respons Pasar} = f(\\text{Product}, \\text{Price}, \\text{Place}, \\text{Promotion})',
  spec: {
    engine: 'economics',
    simulation: 'marketing_mix',
    version: 1,
    title: 'Simulator Bauran Pemasaran (Marketing Mix 4P)',
    description: 'Model edukasi interaksi 4P: Product, Price, Place, Promotion dan dampaknya terhadap estimasi respon pasar dan proyeksi permintaan.',
    domain: 'Marketing',
    concepts: ['marketing-mix', '4p', 'product', 'price', 'place', 'promotion', 'market-response'],
    parameters: {
      productQuality: { value: 7, min: 1, max: 10, step: 1, unit: 'Skor', label: 'Product (Kualitas & Fitur)' },
      priceIndex: { value: 6, min: 1, max: 10, step: 1, unit: 'Skor', label: 'Price (Keterjangkauan Harga)' },
      placeReach: { value: 7, min: 1, max: 10, step: 1, unit: 'Skor', label: 'Place (Jangkauan Distribusi)' },
      promotionBudget: { value: 8, min: 1, max: 10, step: 1, unit: 'Skor', label: 'Promotion (Intensitas Promosi)' },
    },
    controls: ['productQuality', 'priceIndex', 'placeReach', 'promotionBudget'],
  },
  compute: (params: Record<string, number>) => {
    const prod = params.productQuality ?? 7;
    const price = params.priceIndex ?? 6;
    const place = params.placeReach ?? 7;
    const promo = params.promotionBudget ?? 8;

    // Weighted educational response model
    const rawScore = prod * 0.35 + price * 0.2 + place * 0.2 + promo * 0.25;
    const marketResponseScore = Math.min(100, Math.round((rawScore / 10) * 100));
    const estimatedDemandUnits = Math.round(marketResponseScore * 125);
    const brandPerception = marketResponseScore >= 80 ? 'Sangat Kuat' : marketResponseScore >= 60 ? 'Kuat' : 'Moderat';

    return {
      productQuality: prod,
      priceIndex: price,
      placeReach: place,
      promotionBudget: promo,
      marketResponseScore,
      estimatedDemandUnits,
      brandPerception,
    };
  },
  experiments: [
    {
      id: 'mm-exp-1',
      title: 'Mencapai Respon Pasar Minimal 80%',
      objective: 'Seimbangkan bauran 4P agar skor respon pasar mencapai minimal 80 poin.',
      description: 'Menemukan sinergi bauran pemasaran yang optimal bagi pasar sasaran.',
      targetCondition: { output: 'marketResponseScore', operator: '>=', value: 80, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Sinergi Bauran Pemasaran 4P',
    changes: [{ parameter: 'Kualitas Produk', from: before.productQuality ?? 7, to: after.productQuality ?? 7, unit: 'Skor' }],
    held: [{ parameter: 'Bujet Promosi', value: after.promotionBudget ?? 8, unit: 'Skor' }],
    result: { label: 'Respon Pasar', from: `${before.marketResponseScore ?? 75}%`, to: `${after.marketResponseScore ?? 75}%` },
    keyInsight: `Kombinasi 4P menghasilkan estimasi respon pasar ${after.marketResponseScore}% dengan persepsi merek '${after.brandPerception}'. Proyeksi permintaan diperkirakan mencapai ${after.estimatedDemandUnits} unit. Model edukasi ini menunjukkan keterkaitan antar variabel bauran pemasaran.`,
    tryNext: 'Turunkan harga atau naikkan promosi untuk melihat sensitivitas elastisitas respon pasar.',
  }),
  visual: { archetype: 'chart', title: 'Pengaruh Bauran 4P terhadap Respon Pasar' },
};

export const exchangeRateBusinessSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Perdagangan & Keuangan Internasional',
  formulaLatex: '\\text{Profit} = (\\text{Export USD} \\times \\text{Kurs}) - \\text{Local Cost} + \\text{Hedging Gain}',
  spec: {
    engine: 'economics',
    simulation: 'exchange_rate_business',
    version: 1,
    title: 'Simulator Risiko Fluktuasi Kurs Valuta Asing (FX Hedging)',
    description: 'Analisis dampak volatilitas nilai tukar USD/IDR terhadap margin transaksi ekspor dan mitigasi instrumen lindung nilai (hedging).',
    domain: 'Marketing',
    concepts: ['exchange-rate', 'forex', 'hedging', 'export-import', 'currency-risk', 'fx-gain'],
    parameters: {
      kontrakUsd: { value: 50000, min: 10000, max: 200000, step: 5000, unit: 'USD', label: 'Nilai Kontrak Ekspor' },
      kursKontrakIdr: { value: 15500, min: 14000, max: 17500, step: 100, unit: 'IDR/USD', label: 'Kurs Acuan Saat Kontrak' },
      kursRealisasiIdr: { value: 15100, min: 14000, max: 17500, step: 100, unit: 'IDR/USD', label: 'Kurs Spot Saat Pembayaran' },
      rasioHedgingPct: { value: 60, min: 0, max: 100, step: 10, unit: '%', label: 'Porsi Lindung Nilai (Hedging)' },
    },
    controls: ['kontrakUsd', 'kursKontrakIdr', 'kursRealisasiIdr', 'rasioHedgingPct'],
  },
  compute: (params: Record<string, number>) => {
    const usd = params.kontrakUsd ?? 50000;
    const kAwal = params.kursKontrakIdr ?? 15500;
    const kAkhir = params.kursRealisasiIdr ?? 15100;
    const hedgePct = (params.rasioHedgingPct ?? 60) / 100;

    const nilaiAwalJuta = (usd * kAwal) / 1_000_000;
    const unhedgedUsd = usd * (1 - hedgePct);
    const hedgedUsd = usd * hedgePct;

    const penerimaanHedgedJuta = (hedgedUsd * kAwal) / 1_000_000;
    const penerimaanSpotJuta = (unhedgedUsd * kAkhir) / 1_000_000;
    const totalPenerimaanJuta = penerimaanHedgedJuta + penerimaanSpotJuta;

    const selisihTanpaHedgingJuta = ((usd * kAkhir) - (usd * kAwal)) / 1_000_000;
    const selisihDenganHedgingJuta = totalPenerimaanJuta - nilaiAwalJuta;
    const kerugianDicegahJuta = selisihDenganHedgingJuta - selisihTanpaHedgingJuta;

    return {
      kontrakUsd: usd,
      nilaiAwalJuta: Number(nilaiAwalJuta.toFixed(2)),
      totalPenerimaanJuta: Number(totalPenerimaanJuta.toFixed(2)),
      selisihKursJuta: Number(selisihDenganHedgingJuta.toFixed(2)),
      kerugianDicegahJuta: Number(kerugianDicegahJuta.toFixed(2)),
      statusDampakKurs: selisihDenganHedgingJuta >= 0 ? 'FX GAIN (Keuntungan Kurs)' : 'FX LOSS (Kerugian Kurs Terkendali)',
    };
  },
  experiments: [
    {
      id: 'fx-exp-1',
      title: 'Mitigasi Kerugian Kurs Melemah dengan Hedging >= 70%',
      objective: 'Lindungi kontrak US$50.000 saat Rupiah menguat (kurs spot turun Rp400) agar kerugian terkendali di bawah Rp5 Juta.',
      description: 'Penerapan instrumen forward contract untuk melindungi arus kas ekspor.',
      targetCondition: { output: 'selisihKursJuta', operator: '>=', value: -5.0, tolerance: 0.5 },
    },
    {
      id: 'fx-exp-2',
      title: 'Pencegahan Kerugian Valas Minimal Rp10 Juta',
      objective: 'Tingkatkan rasio hedging sehingga nilai kerugian yang berhasil dicegah mencapai minimal Rp10 Juta.',
      description: 'Kuantifikasi efektivitas manajemen risiko valuta asing.',
      targetCondition: { output: 'kerugianDicegahJuta', operator: '>=', value: 10.0, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Manajemen Risiko Fluktuasi Valas',
    changes: [{ parameter: 'Rasio Hedging', from: before.rasioHedgingPct ?? 60, to: after.rasioHedgingPct ?? 60, unit: '%' }],
    held: [{ parameter: 'Nilai Kontrak', value: after.kontrakUsd ?? 50000, unit: 'USD' }],
    result: { label: 'Penerimaan Riil', from: `Rp${before.totalPenerimaanJuta ?? 760} Jt`, to: `Rp${after.totalPenerimaanJuta ?? 760} Jt` },
    keyInsight: `Dari kontrak US$${(after.kontrakUsd ?? 0).toLocaleString('id-ID')}, porsi ${after.rasioHedgingPct}% dikunci pada kurs Rp${after.kursKontrakIdr}. Berkat hedging, perusahaan berhasil mencegah potensi kerugian sebesar Rp${after.kerugianDicegahJuta} Juta dari pergerakan kurs spot.`,
    tryNext: 'Turunkan rasio hedging ke 0% untuk melihat risiko eksposur terbuka penuh tanpa proteksi.',
  }),
  visual: { archetype: 'chart', title: 'Sensitivitas Margin Terhadap Kurs USD/IDR' },
};

export const demandVsPriceSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Ekonomi Manajerial',
  formulaLatex: 'E_d = \\frac{\\Delta Q / Q}{\\Delta P / P}, \\quad \\text{Total Revenue} = P \\times Q',
  spec: {
    engine: 'economics',
    simulation: 'demand_vs_price',
    version: 1,
    title: 'Simulator Elastisitas Permintaan & Pendapatan (Price Elasticity of Demand)',
    description: 'Eksplorasi hubungan perubahan harga jual terhadap volume permintaan dan dampaknya pada Total Revenue ($P \\times Q$).',
    domain: 'Marketing',
    concepts: ['elasticity', 'demand', 'total-revenue', 'price-sensitivity', 'inelastic', 'elastic'],
    parameters: {
      basePriceRibu: { value: 50, min: 20, max: 200, step: 5, unit: 'Ribu Rp', label: 'Harga Awal (P0)' },
      priceChangePct: { value: 15, min: -30, max: 50, step: 5, unit: '%', label: 'Perubahan Harga (ΔP %)' },
      elasticityEd: { value: 0.6, min: 0.2, max: 2.5, step: 0.1, unit: '', label: 'Koefisien Elastisitas (|Ed|)' },
      baseQuantityUnit: { value: 1000, min: 200, max: 5000, step: 100, unit: 'Unit', label: 'Volume Awal (Q0)' },
    },
    controls: ['basePriceRibu', 'priceChangePct', 'elasticityEd', 'baseQuantityUnit'],
  },
  compute: (params: Record<string, number>) => {
    const p0 = (params.basePriceRibu ?? 50) * 1000;
    const deltaPPct = (params.priceChangePct ?? 15) / 100;
    const ed = params.elasticityEd ?? 0.6;
    const q0 = params.baseQuantityUnit ?? 1000;

    const deltaQPct = -ed * deltaPPct;
    const p1 = Math.round(p0 * (1 + deltaPPct));
    const q1 = Math.max(0, Math.round(q0 * (1 + deltaQPct)));

    const tr0Juta = (p0 * q0) / 1_000_000;
    const tr1Juta = (p1 * q1) / 1_000_000;
    const deltaTrJuta = tr1Juta - tr0Juta;

    return {
      p0Ribu: p0 / 1000,
      p1Ribu: p1 / 1000,
      q0Units: q0,
      q1Units: q1,
      tr0Juta: Number(tr0Juta.toFixed(2)),
      tr1Juta: Number(tr1Juta.toFixed(2)),
      deltaTrJuta: Number(deltaTrJuta.toFixed(2)),
      elasticityCategory: ed > 1.0 ? 'ELASTIS (|Ed| > 1)' : ed < 1.0 ? 'INELASTIS (|Ed| < 1)' : 'UNITARY (|Ed| = 1)',
      revenueEffect: deltaTrJuta >= 0 ? 'PENDAPATAN NAIK (+)' : 'PENDAPATAN TURUN (-)',
      quantityDropPct: Number((deltaQPct * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'dvp-exp-1',
      title: 'Buktikan Kenaikan Revenue pada Permintaan Inelastis',
      objective: 'Atur elastisitas ke 0.5 (Inelastis) dan naikkan harga 20% untuk membuktikan Total Revenue bertambah.',
      description: 'Strategi harga komoditas kebutuhan pokok hortikultura.',
      targetCondition: { output: 'deltaTrJuta', operator: '>=', value: 4.0, tolerance: 0.5 },
    },
    {
      id: 'dvp-exp-2',
      title: 'Bahaya Kenaikan Harga pada Pasar Elastis',
      objective: 'Ubah elastisitas ke 1.8 (Elastis) dan amati penurunan drastis Total Revenue saat harga dinaikkan.',
      description: 'Menghindari jebakan harga pada produk komoditas banyak substitusi.',
      targetCondition: { output: 'deltaTrJuta', operator: '<=', value: -3.0, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Hukum Elastisitas Harga & Dampak Pendapatan',
    changes: [{ parameter: 'Kenaikan Harga', from: before.priceChangePct ?? 15, to: after.priceChangePct ?? 15, unit: '%' }],
    held: [{ parameter: 'Koefisien Elastisitas', value: after.elasticityEd ?? 0.6, unit: '|Ed|' }],
    result: { label: 'Total Revenue', from: `Rp${before.tr1Juta ?? 50} Jt`, to: `Rp${after.tr1Juta ?? 50} Jt` },
    keyInsight: `Kategori permintaan produk adalah ${after.elasticityCategory}. Karena permintaan inelastis (|Ed| = ${after.elasticityEd}), persentase kenaikan harga (${after.priceChangePct}%) melampaui persentase penurunan volume (${after.quantityDropPct}%), sehingga Total Revenue ${after.revenueEffect} sebesar Rp${Math.abs(after.deltaTrJuta ?? 0)} Juta.`,
    tryNext: 'Tingkatkan koefisien elastisitas di atas 1.0 untuk melihat pembalikan arah Total Revenue.',
  }),
  visual: { archetype: 'chart', title: 'Kurva Permintaan & Luas Total Revenue' },
};

export const marketingCampaignSimulation: ExtendedSimulationDefinition = {
  discipline: 'Manajemen Pemasaran Internasional',
  category: 'Pemasaran Digital & Analitik',
  formulaLatex: '\\text{ROAS} = \\frac{\\text{Revenue}}{\\text{Ad Spend}}, \\quad \\text{ROI} = \\frac{\\text{Profit}}{\\text{Ad Spend}} \\times 100\\%',
  spec: {
    engine: 'economics',
    simulation: 'marketing_campaign',
    version: 1,
    title: 'Simulator ROI & ROAS Kampanye Pemasaran Digital',
    description: 'Analisis profitabilitas belanja iklan digital, Return on Ad Spend (ROAS), Cost per Click (CPC), dan kontribusi margin bersih.',
    domain: 'Marketing',
    concepts: ['campaign-roi', 'roas', 'ad-spend', 'aov', 'cpc', 'profitability'],
    parameters: {
      budgetJuta: { value: 20, min: 5, max: 100, step: 5, unit: 'Juta Rp', label: 'Anggaran Iklan' },
      cpcRibu: { value: 2.5, min: 0.5, max: 10, step: 0.5, unit: 'Ribu Rp/Klik', label: 'Biaya Per Klik (CPC)' },
      conversionRatePct: { value: 4.0, min: 0.5, max: 15, step: 0.5, unit: '%', label: 'Tingkat Konversi Pembelian' },
      aovRibu: { value: 350, min: 50, max: 1500, step: 25, unit: 'Ribu Rp', label: 'Nilai Rata-Rata Order (AOV)' },
      cogsRatioPct: { value: 45, min: 20, max: 80, step: 5, unit: '%', label: 'HPP Produk (%)' },
    },
    controls: ['budgetJuta', 'cpcRibu', 'conversionRatePct', 'aovRibu', 'cogsRatioPct'],
  },
  compute: (params: Record<string, number>) => {
    const budget = (params.budgetJuta ?? 20) * 1_000_000;
    const cpc = (params.cpcRibu ?? 2.5) * 1000;
    const convRate = (params.conversionRatePct ?? 4.0) / 100;
    const aov = (params.aovRibu ?? 350) * 1000;
    const cogsPct = (params.cogsRatioPct ?? 45) / 100;

    const totalClicks = Math.round(budget / Math.max(100, cpc));
    const totalOrders = Math.round(totalClicks * convRate);
    const grossRevenue = totalOrders * aov;
    const totalCogs = grossRevenue * cogsPct;
    const grossProfit = grossRevenue - totalCogs;
    const netCampaignProfit = grossProfit - budget;

    const roas = budget > 0 ? Number((grossRevenue / budget).toFixed(2)) : 0;
    const roiPct = budget > 0 ? Number(((netCampaignProfit / budget) * 100).toFixed(1)) : 0;

    return {
      totalClicks,
      totalOrders,
      revenueJuta: Number((grossRevenue / 1_000_000).toFixed(2)),
      netProfitJuta: Number((netCampaignProfit / 1_000_000).toFixed(2)),
      roasRatio: roas,
      roiPct,
      cpaRibu: totalOrders > 0 ? Math.round(budget / totalOrders / 1000) : 0,
      campaignHealth: roas >= 4.0 ? 'SKALA TINGGI (Sangat Untung)' : roas >= 2.5 ? 'PROFITABEL' : roas >= 1.0 ? 'BREAK-EVEN' : 'RUGI (Burn Cash)',
    };
  },
  experiments: [
    {
      id: 'mc-exp-1',
      title: 'Capai ROAS Tinggi >= 4.0x',
      objective: 'Optimalkan rasio konversi dan AOV hingga Return on Ad Spend (ROAS) mencapai minimal 4.0x.',
      description: 'Standar emas profitabilitas iklan digital e-commerce.',
      targetCondition: { output: 'roasRatio', operator: '>=', value: 4.0, tolerance: 0.1 },
    },
    {
      id: 'mc-exp-2',
      title: 'Laba Bersih Kampanye Minimal Rp25 Juta',
      objective: 'Hasilkan laba bersih bersih kampanye (setelah dipotong belanja iklan & HPP) minimal Rp25 Juta.',
      description: 'Menghasilkan margin riil bagi pertumbuhan bisnis.',
      targetCondition: { output: 'netProfitJuta', operator: '>=', value: 25.0, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Kinerja Belanja Iklan Digital',
    changes: [{ parameter: 'Konversi Pembelian', from: before.conversionRatePct ?? 4, to: after.conversionRatePct ?? 4, unit: '%' }],
    held: [{ parameter: 'Anggaran Iklan', value: after.budgetJuta ?? 20, unit: 'Juta Rp' }],
    result: { label: 'ROAS', from: `${before.roasRatio ?? 4.0}x`, to: `${after.roasRatio ?? 4.0}x` },
    keyInsight: `Anggaran iklan Rp${after.budgetJuta} Juta menghasilkan ${after.totalOrders} pesanan dengan omset kotor Rp${after.revenueJuta} Juta (ROAS ${after.roasRatio}x). Setelah dipotong HPP dan ad spend, laba bersih kampanye adalah Rp${after.netProfitJuta} Juta (ROI ${after.roiPct}%).`,
    tryNext: 'Turunkan CPC melalui perbaikan ad score untuk melipatgandakan jumlah klik dan pesanan.',
  }),
  visual: { archetype: 'chart', title: 'Tolak Ukur Finansial Kampanye Iklan' },
};

// ============================================================================
// 4. AGRIBISNIS HORTIKULTURA - 7 SIMULASI
// ============================================================================

// 4.1 Precision Farming
export const precisionFarmingSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Pertanian Presisi & Nutrisi Tanaman',
  formulaLatex: '\\text{Dosis Urea (kg/ha)} = \\frac{\\text{Kebutuhan N Total} - \\text{N Tanah Asal}}{0.46 \\times \\text{Efisiensi}}',
  spec: {
    engine: 'agriculture',
    simulation: 'precision_farming',
    version: 1,
    title: 'Simulator Pemupukan Presisi Hortikultura (Precision Farming NPK)',
    description: 'Kalkulasi kebutuhan hara makro Nitrogen, Fosfor, Kalium berbasis uji tanah dan target hasil panen hortikultura.',
    domain: 'Agriculture',
    concepts: ['precision-farming', 'soil-testing', 'nitrogen', 'fertilizer', 'urea', 'crop-nutrition'],
    parameters: {
      luasLahanHa: { value: 2.0, min: 0.5, max: 10, step: 0.5, unit: 'Hektar', label: 'Luas Areal Tanam' },
      targetYieldTonPerHa: { value: 35, min: 10, max: 80, step: 5, unit: 'Ton/Ha', label: 'Target Panen Hortikultura' },
      soilNitrogenPpm: { value: 25, min: 10, max: 80, step: 5, unit: 'ppm N', label: 'Kadar N Tanah Awal' },
      fertilizerEfficiencyPct: { value: 65, min: 40, max: 85, step: 5, unit: '%', label: 'Efisiensi Serapan Pupuk' },
    },
    controls: ['luasLahanHa', 'targetYieldTonPerHa', 'soilNitrogenPpm', 'fertilizerEfficiencyPct'],
  },
  compute: (params: Record<string, number>) => {
    const luas = params.luasLahanHa ?? 2.0;
    const targetTon = params.targetYieldTonPerHa ?? 35;
    const soilPpm = params.soilNitrogenPpm ?? 25;
    const eff = (params.fertilizerEfficiencyPct ?? 65) / 100;

    const totalNNeededKgHa = targetTon * 2.8;
    const soilSuppliedNha = soilPpm * 2.0;
    const netNDeficitKgHa = Math.max(0, totalNNeededKgHa - soilSuppliedNha);
    const ureaDoseKgHa = Math.round(netNDeficitKgHa / (0.46 * eff));
    const totalUreaKg = Math.round(ureaDoseKgHa * luas);
    const pupukCostJuta = Number(((totalUreaKg * 7500) / 1_000_000).toFixed(2));

    return {
      luasLahanHa: luas,
      totalNNeededKgHa: Math.round(totalNNeededKgHa),
      soilSuppliedNha: Math.round(soilSuppliedNha),
      ureaDoseKgHa,
      totalUreaKg,
      pupukCostJuta,
      fertilizerSavingsPct: Math.round(((totalNNeededKgHa - netNDeficitKgHa) / totalNNeededKgHa) * 100),
    };
  },
  experiments: [
    {
      id: 'pf-exp-1',
      title: 'Kalkulasi Dosis Urea Tepat Target 35 Ton/Ha',
      objective: 'Tentukan kebutuhan total pupuk Urea untuk lahan 2 hektar dengan target panen 35 Ton/Ha.',
      description: 'Pencegahan over-fertilization yang merusak struktur mikroba tanah.',
      targetCondition: { output: 'ureaDoseKgHa', operator: 'between', value: 150, value2: 250, tolerance: 10 },
    },
    {
      id: 'pf-exp-2',
      title: 'Penghematan Pupuk Presisi Minimal 40%',
      objective: 'Optimalkan efisiensi serapan pupuk hingga persentase penghematan hara mencapai minimal 40%.',
      description: 'Pertanian presisi berkelanjutan dan ramah lingkungan.',
      targetCondition: { output: 'fertilizerSavingsPct', operator: '>=', value: 40, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Rekomendasi Pemupukan Presisi Tanah',
    changes: [{ parameter: 'Kadar N Tanah', from: before.soilNitrogenPpm ?? 25, to: after.soilNitrogenPpm ?? 25, unit: 'ppm' }],
    held: [{ parameter: 'Luas Lahan', value: after.luasLahanHa ?? 2.0, unit: 'Ha' }],
    result: { label: 'Kebutuhan Urea Total', from: `${before.totalUreaKg ?? 320} kg`, to: `${after.totalUreaKg ?? 320} kg` },
    keyInsight: `Untuk target panen ${after.targetYieldTonPerHa} Ton/Ha di lahan ${after.luasLahanHa} Ha, tanah telah menyumbang ${after.soilSuppliedNha} kg N/ha (${after.fertilizerSavingsPct}% hemat). Rekomendasi dosis Urea adalah ${after.ureaDoseKgHa} kg/ha (Total ${after.totalUreaKg} kg pupuk, anggaran Rp${after.pupukCostJuta} Juta).`,
    tryNext: 'Tingkatkan efisiensi pemupukan melalui fertigasi tetes untuk memangkas dosis pupuk.',
  }),
  visual: { archetype: 'grid', title: 'Peta Status Hara Tanah Petak Sawah/Kebun' },
};

// 4.2 Irrigation Simulator
export const irrigationSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Teknologi Pengairan & Irigasi Presisi',
  formulaLatex: '\\text{Kebutuhan Air (Liter)} = \\text{Area} \\times [(\\text{FC} - \\text{SM}) \\times \\text{Depth} + \\text{ET}]',
  spec: {
    engine: 'agriculture',
    simulation: 'irrigation_simulator',
    version: 1,
    title: 'Simulator Kebutuhan Air & Irigasi Tetes (Drip Irrigation)',
    description: 'Model dinamika ketersediaan air tanah, kapasitas lapang (Field Capacity), laju evapotranspirasi (ETc), dan durasi pompa irigasi tetes.',
    domain: 'Agriculture',
    concepts: ['irrigation', 'soil-moisture', 'field-capacity', 'evapotranspiration', 'drip-irrigation', 'water-balance'],
    parameters: {
      soilMoisturePct: { value: 20, min: 10, max: 45, step: 1, unit: '%', label: 'Kelembaban Tanah Riil (SM)' },
      evapotranspirationMm: { value: 4.5, min: 2.0, max: 10.0, step: 0.5, unit: 'mm/hari', label: 'Laju Evapotranspirasi (ETc)' },
      fieldCapacityPct: { value: 35, min: 25, max: 45, step: 1, unit: '%', label: 'Kapasitas Lapang Tanah' },
      areaM2: { value: 5000, min: 1000, max: 20000, step: 500, unit: 'm²', label: 'Luas Blok Kebun' },
    },
    controls: ['soilMoisturePct', 'evapotranspirationMm', 'fieldCapacityPct', 'areaM2'],
  },
  compute: (params: Record<string, number>) => {
    const sm = params.soilMoisturePct ?? 20;
    const etc = params.evapotranspirationMm ?? 4.5;
    const fc = params.fieldCapacityPct ?? 35;
    const area = params.areaM2 ?? 5000;

    const wiltingPoint = 14;
    const moistureDeficitPct = Math.max(0, fc - sm);
    const rootDepthMm = 300;
    const waterDepthNeededMm = (moistureDeficitPct / 100) * rootDepthMm + etc;
    const totalVolumeLiters = Math.round(area * waterDepthNeededMm);
    const pumpFlowRateLpm = 100;
    const pumpDurationMinutes = Math.round(totalVolumeLiters / pumpFlowRateLpm);

    const stressRisk = sm <= wiltingPoint + 3 ? 'STRES AIR TINGGI (Kritis Layu)' : sm <= 22 ? 'PERLU IRIGASI' : 'KADAR AIR OPTIMAL';

    return {
      soilMoisturePct: sm,
      moistureDeficitPct,
      totalVolumeLiters,
      pumpDurationMinutes,
      stressRisk,
      waterLitresPerM2: Number((totalVolumeLiters / area).toFixed(1)),
      dailyWaterCostRibu: Math.round((totalVolumeLiters / 1000) * 2.5),
    };
  },
  experiments: [
    {
      id: 'ir-exp-1',
      title: 'Pemulihan Kadar Air ke Kapasitas Lapang 35%',
      objective: 'Hitung durasi pompa irigasi tetes yang dibutuhkan untuk menaikkan kelembaban tanah 20% ke 35%.',
      description: 'Menjamin ketersediaan lengas optimal bagi tanaman buah hortikultura.',
      targetCondition: { output: 'totalVolumeLiters', operator: 'between', value: 200000, value2: 350000, tolerance: 10000 },
    },
    {
      id: 'ir-exp-2',
      title: 'Pencegahan Titik Layu Permanen',
      objective: 'Pertahankan kelembaban tanah di atas 24% agar status stres air berada pada kondisi KADAR AIR OPTIMAL.',
      description: 'Manajemen stres abiotik tanaman hortikultura.',
      targetCondition: { output: 'moistureDeficitPct', operator: '<=', value: 11, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Manajemen Neraca Air Tanaman',
    changes: [{ parameter: 'Kelembaban Tanah', from: before.soilMoisturePct ?? 20, to: after.soilMoisturePct ?? 20, unit: '%' }],
    held: [{ parameter: 'Kapasitas Lapang', value: after.fieldCapacityPct ?? 35, unit: '%' }],
    result: { label: 'Kebutuhan Air', from: `${(before.totalVolumeLiters ?? 0).toLocaleString()} L`, to: `${(after.totalVolumeLiters ?? 0).toLocaleString()} L` },
    keyInsight: `Status kebun adalah ${after.stressRisk} (defisit lengas ${after.moistureDeficitPct}%). Dibutuhkan ${(after.totalVolumeLiters ?? 0).toLocaleString('id-ID')} Liter air (${after.waterLitresPerM2} L/m²) dengan durasi pompa ${after.pumpDurationMinutes} menit untuk mengembalikan tanah ke kapasitas lapang.`,
    tryNext: 'Simulasikan hari terik dengan menaikkan evapotranspirasi ke 8.0 mm/hari.',
  }),
  visual: { archetype: 'grid', title: 'Status Lengas Tanah & Zona Irigasi' },
};

// 4.3 Greenhouse Climate (VPD Simulator)
export const greenhouseClimateSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Teknologi Smart Greenhouse',
  formulaLatex: '\\text{VPD} = e_s(T) \\times \\left(1 - \\frac{\\text{RH}}{100}\\right), \\quad e_s(T) = 0.61078 \\exp\\left(\\frac{17.27 T}{T + 237.3}\\right)',
  spec: {
    engine: 'agriculture',
    simulation: 'greenhouse_climate',
    version: 1,
    title: 'Simulator Iklim Mikro Greenhouse (Suhu, RH, & VPD)',
    description: 'Pengendalian defisit tekanan uap (Vapour Pressure Deficit / VPD), kelembaban relatif, ventilasi, dan naungan untuk fotosintesis optimum.',
    domain: 'Agriculture',
    concepts: ['greenhouse', 'vpd', 'microclimate', 'humidity', 'temperature', 'photosynthesis', 'transpiration'],
    parameters: {
      tempAmbientC: { value: 34, min: 25, max: 42, step: 1, unit: '°C', label: 'Suhu Udara Luar' },
      rhAmbientPct: { value: 55, min: 35, max: 95, step: 1, unit: '%', label: 'Kelembaban Luar (RH)' },
      ventilationSpeedPct: { value: 60, min: 0, max: 100, step: 5, unit: '%', label: 'Kecepatan Exhaust Fan' },
      shadingNetPct: { value: 40, min: 0, max: 70, step: 5, unit: '%', label: 'Kerapatan Paranet/Shading' },
    },
    controls: ['tempAmbientC', 'rhAmbientPct', 'ventilationSpeedPct', 'shadingNetPct'],
  },
  compute: (params: Record<string, number>) => {
    let tAmb = params.tempAmbientC ?? params.temp ?? params.temperature ?? 34;
    if (tAmb > 100) tAmb -= 273.15; // Normalize Kelvin -> Celsius
    let rhAmb = params.rhAmbientPct ?? params.rh ?? params.humidity ?? 55;
    // Explicit fraction conversion: ONLY if fractional unit flag is passed
    if (params.rhFractional === 1 || params.isFractional === 1) {
      rhAmb *= 100;
    }
    // Strict percent handling: do NOT infer rhAmb <= 1.0 as fraction. RH=1% is 1% (arid/desert).

    const vent = (params.ventilationSpeedPct ?? 60) / 100;
    const shade = (params.shadingNetPct ?? 40) / 100;

    let tGh = params.tempInsideC !== undefined
      ? params.tempInsideC
      : Number((tAmb - (shade * 4.5) - (vent * 3.0)).toFixed(1));
    if (tGh > 100) tGh -= 273.15;

    let rhGh = params.rhInsidePct !== undefined
      ? params.rhInsidePct
      : Math.min(100, Math.max(1, Math.round(rhAmb + (shade * 8) - (vent * 5))));
    if (params.rhFractional === 1 || params.isFractional === 1) {
      if (params.rhInsidePct !== undefined && rhGh <= 1.0) rhGh *= 100;
    }

    const es = 0.61078 * Math.exp((17.27 * tGh) / (tGh + 237.3));
    const ea = es * (rhGh / 100);
    const vpd = Number((es - ea).toFixed(2));

    const vpdZone = vpd < 0.4 ? 'TERLALU LEMBAB (Risiko Jamur)' : vpd <= 0.8 ? 'ZONA PERAKARAN/VEGETATIF' : vpd <= 1.2 ? 'ZONA FOTOSINTESIS OPTIMUM' : vpd <= 1.6 ? 'VEGETATIF CEPAT' : 'STRES KERING (Stomata Menutup)';

    return {
      tempInsideC: tGh,
      rhInsidePct: rhGh,
      vpdKpa: vpd,
      vpdZone,
      coolingEffectC: Number((tAmb - tGh).toFixed(1)),
      transpirationRate: vpd >= 0.8 && vpd <= 1.2 ? 'MAKSIMAL SEHAT' : 'TERGANGGU',
    };
  },
  experiments: [
    {
      id: 'gh-exp-1',
      title: 'Mencapai Zona VPD Optimum (0.80 - 1.20 kPa)',
      objective: 'Atur kombinasi ventilasi fan dan shading paranet agar nilai VPD berada tepat di zona 0.80 - 1.20 kPa.',
      description: 'Parameter kritis pemacu laju fotosintesis tanaman melon/tomat greenhouse.',
      targetCondition: { output: 'vpdKpa', operator: 'between', value: 0.80, value2: 1.20, tolerance: 0.05 },
    },
    {
      id: 'gh-exp-2',
      title: 'Peredaman Suhu Panas Ekstrem Minimal 5.0°C',
      objective: 'Redam suhu udara greenhouse saat siang terik (38°C) hingga suhu turun minimal 5.0°C.',
      description: 'Pencegahan kegagalan penyerbukan bunga akibat heat stress.',
      targetCondition: { output: 'coolingEffectC', operator: '>=', value: 5.0, tolerance: 0.2 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Iklim Mikro Greenhouse',
    changes: [{ parameter: 'Suhu Luar', from: before.tempAmbientC ?? 34, to: after.tempAmbientC ?? 34, unit: '°C' }],
    held: [{ parameter: 'Paranet Shading', value: after.shadingNetPct ?? 40, unit: '%' }],
    result: { label: 'VPD Greenhouse', from: `${before.vpdKpa ?? 1.1} kPa`, to: `${after.vpdKpa ?? 1.1} kPa` },
    keyInsight: `Iklim mikro greenhouse terkontrol pada suhu ${after.tempInsideC}°C dan RH ${after.rhInsidePct}%, menghasilkan nilai VPD ${after.vpdKpa} kPa (${after.vpdZone}). Stomata daun terbuka sempurna untuk menyerap CO2 tanpa risiko dehidrasi seluler.`,
    tryNext: 'Matikan ventilasi fan (0%) untuk mengamati lonjakan kelembaban dan bahaya serangan jamur botrytis.',
  }),
  visual: { archetype: 'grid', title: 'Indikator Iklim Mikro & Gauge VPD' },
};

// 4.4 Hydroponic Simulator
export const hydroponicSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Sistem Hidroponik Modern',
  formulaLatex: '\\text{TDS (ppm)} = \\text{EC} \\times 500, \\quad \\text{Dosis AB Mix (ml)} = (\\text{EC Target} - \\text{EC Riil}) \\times \\text{Volume} \\times 5',
  spec: {
    engine: 'agriculture',
    simulation: 'hydroponic_simulator',
    version: 1,
    title: 'Simulator Nutrisi Hidroponik (EC, pH, & TDS Ab Mix)',
    description: 'Simulasi formulasi nutrisi hidroponik fertigasi, koreksi elektrokonduktivitas (EC), ppm TDS, dan penyesuaian pH larutan.',
    domain: 'Agriculture',
    concepts: ['hydroponics', 'ec-meter', 'ppm', 'ph-solution', 'ab-mix', 'fertigation'],
    parameters: {
      waterVolumeLiters: { value: 200, min: 50, max: 1000, step: 25, unit: 'Liter', label: 'Volume Tandon Air' },
      ecCurrent: { value: 1.2, min: 0.4, max: 2.8, step: 0.1, unit: 'mS/cm', label: 'Nilai EC Saat Ini' },
      ecTarget: { value: 2.2, min: 1.0, max: 3.2, step: 0.1, unit: 'mS/cm', label: 'Target EC Fase Panen' },
      phCurrent: { value: 6.8, min: 4.5, max: 8.5, step: 0.1, unit: '', label: 'Nilai pH Larutan Saat Ini' },
    },
    controls: ['waterVolumeLiters', 'ecCurrent', 'ecTarget', 'phCurrent'],
  },
  compute: (params: Record<string, number>) => {
    const vol = params.waterVolumeLiters ?? 200;
    const ecCur = params.ecCurrent ?? 1.2;
    const ecTar = params.ecTarget ?? 2.2;
    const ph = params.phCurrent ?? 6.8;

    const ecDeficit = Math.max(0, ecTar - ecCur);
    const abMixDoseMl = Math.round(ecDeficit * vol * 5); // ~5ml per liter for 1.0 EC increase
    const currentPpm = Math.round(ecCur * 500);
    const targetPpm = Math.round(ecTar * 500);

    const phStatus = ph < 5.5 ? 'TERLALU ASAM (Perlu pH UP)' : ph > 6.5 ? 'TERLALU BASA (Perlu pH DOWN)' : 'PH IDEAL (5.5 - 6.5)';
    const phCorrectorMl = ph > 6.5 ? Math.round((ph - 6.0) * vol * 0.1) : ph < 5.5 ? Math.round((6.0 - ph) * vol * 0.1) : 0;

    return {
      waterVolumeLiters: vol,
      currentPpm,
      targetPpm,
      ecDeficit: Number(ecDeficit.toFixed(1)),
      abMixDoseMl,
      phStatus,
      phCorrectorMl,
      nutrientUptakeStatus: ph >= 5.5 && ph <= 6.5 ? 'SERAPAN HARA OPTIMAL' : 'NUTRIENT LOCKOUT (Serapan Terhambat)',
    };
  },
  experiments: [
    {
      id: 'hy-exp-1',
      title: 'Formulasi Dosis Nutrisi Melon Fase Generatif (EC = 2.2)',
      objective: 'Tentukan dosis penambahan stok AB Mix (ml) pada tandon 200 Liter untuk mencapai EC 2.2 mS/cm.',
      description: 'Menghasilkan buah melon dengan tingkat kemanisan (Brix) tinggi.',
      targetCondition: { output: 'abMixDoseMl', operator: 'between', value: 900, value2: 1100, tolerance: 20 },
    },
    {
      id: 'hy-exp-2',
      title: 'Penyeimbangan pH Larutan ke Zona Ideal (5.8 - 6.2)',
      objective: 'Koreksi pH larutan agar status nutrisi beralih ke SERAPAN HARA OPTIMAL.',
      description: 'Mencegah pengendapan unsur mikro besi (Fe) dan fosfor (P).',
      targetCondition: { output: 'phCorrectorMl', operator: '==', value: 0, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Kualitas Larutan Nutrisi Hidroponik',
    changes: [{ parameter: 'Target EC', from: before.ecTarget ?? 2.2, to: after.ecTarget ?? 2.2, unit: 'mS/cm' }],
    held: [{ parameter: 'Volume Tandon', value: after.waterVolumeLiters ?? 200, unit: 'Liter' }],
    result: { label: 'Dosis AB Mix', from: `${before.abMixDoseMl ?? 1000} ml`, to: `${after.abMixDoseMl ?? 1000} ml` },
    keyInsight: `Untuk menaikkan kepekatan larutan tandon ${after.waterVolumeLiters} L dari ${after.currentPpm} ppm ke ${after.targetPpm} ppm (EC ${after.ecTarget}), tambahkan masing-masing ${after.abMixDoseMl} ml Pekatan A dan Pekatan B. Status pH: ${after.phStatus}.`,
    tryNext: 'Ubah nilai pH menjadi 7.8 untuk mengamati fenomena lockout penyerapan unsur hara.',
  }),
  visual: { archetype: 'grid', title: 'Status Tandon Nutrisi Hidroponik' },
};

// 4.5 Plant Density
export const plantDensitySimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Agronomi Hortikultura',
  formulaLatex: '\\text{Populasi/Ha} = \\frac{10.000}{\\text{Jarak Baris (m)} \\times \\text{Jarak Dalam (m)}}, \\quad \\text{Benih} = \\frac{\\text{Populasi}}{1 - \\text{Mortalitas}}',
  spec: {
    engine: 'agriculture',
    simulation: 'plant_density',
    version: 1,
    title: 'Simulator Kerapatan Tanaman & Populasi (Plant Density & Spacing)',
    description: 'Eksplorasi jarak tanam hortikultura, populasi tanaman per hektar, kebutuhan benih, dan kompetisi kanopi cahaya matahari.',
    domain: 'Agriculture',
    concepts: ['plant-density', 'spacing', 'population', 'lai', 'canopy', 'seed-requirement'],
    parameters: {
      jarakBarisCm: { value: 70, min: 40, max: 150, step: 5, unit: 'cm', label: 'Jarak Antar Barisan' },
      jarakDalamBarisCm: { value: 50, min: 20, max: 80, step: 5, unit: 'cm', label: 'Jarak Dalam Barisan' },
      luasLahanHa: { value: 1.0, min: 0.25, max: 5.0, step: 0.25, unit: 'Hektar', label: 'Luas Areal Kebun' },
      seedMortalityPct: { value: 8, min: 2, max: 20, step: 1, unit: '%', label: 'Estimasi Mortalitas Bibit' },
    },
    controls: ['jarakBarisCm', 'jarakDalamBarisCm', 'luasLahanHa', 'seedMortalityPct'],
  },
  compute: (params: Record<string, number>) => {
    const rowM = (params.jarakBarisCm ?? 70) / 100;
    const inRowM = (params.jarakDalamBarisCm ?? 50) / 100;
    const luasHa = params.luasLahanHa ?? 1.0;
    const mortPct = (params.seedMortalityPct ?? 8) / 100;

    const areaPerPlantM2 = rowM * inRowM;
    const popPerHa = Math.floor(10000 / areaPerPlantM2);
    const totalPopulasiLahan = Math.floor(popPerHa * luasHa);
    const totalBenihDibutuhkan = Math.ceil(totalPopulasiLahan / (1 - mortPct));

    const canopyCompetition = popPerHa > 35000 ? 'SANGAT PADAT (Kompetisi Cahaya Ketat)' : popPerHa >= 22000 ? 'POPULASI OPTIMAL HORTIKULTURA' : 'TERLALU JARANG (Potensi Lahan Tersisa)';

    return {
      areaPerPlantM2: Number(areaPerPlantM2.toFixed(3)),
      populasiPerHa: popPerHa,
      totalPopulasiLahan,
      totalBenihDibutuhkan,
      canopyCompetition,
      efisiensiRuangPct: Number(((popPerHa / 30000) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'pd-exp-1',
      title: 'Populasi Optimal Cabai/Tomat (22.000 - 28.000 Pohon/Ha)',
      objective: 'Tentukan jarak tanam baris dan dalam barisan agar populasi per hektar berada di kisaran 22.000 - 28.000 pohon.',
      description: 'Menghindari kelembaban berlebih yang memicu penyakit antraknosa.',
      targetCondition: { output: 'populasiPerHa', operator: 'between', value: 22000, value2: 28000, tolerance: 500 },
    },
    {
      id: 'pd-exp-2',
      title: 'Estimasi Pengadaan Benih Lahan 2 Hektar',
      objective: 'Hitung kebutuhan benih total dengan asumsi mortalitas bibit 8% untuk populasi lahan 2 Ha.',
      description: 'Manajemen pengadaan input produksi pertanian.',
      targetCondition: { output: 'totalBenihDibutuhkan', operator: 'between', value: 45000, value2: 60000, tolerance: 2000 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Kerapatan & Populasi Tanaman',
    changes: [{ parameter: 'Jarak Antar Baris', from: before.jarakBarisCm ?? 70, to: after.jarakBarisCm ?? 70, unit: 'cm' }],
    held: [{ parameter: 'Luas Lahan', value: after.luasLahanHa ?? 1.0, unit: 'Ha' }],
    result: { label: 'Populasi/Ha', from: `${(before.populasiPerHa ?? 28500).toLocaleString()}`, to: `${(after.populasiPerHa ?? 28500).toLocaleString()}` },
    keyInsight: `Jarak tanam ${after.jarakBarisCm} × ${after.jarakDalamBarisCm} cm menghasilkan kerapatan ${(after.populasiPerHa ?? 0).toLocaleString('id-ID')} pohon/ha (${after.canopyCompetition}). Untuk areal ${after.luasLahanHa} Ha dengan estimasi mortalitas bibit ${after.seedMortalityPct}%, siapkan total ${(after.totalBenihDibutuhkan ?? 0).toLocaleString('id-ID')} benih.`,
    tryNext: 'Persempit jarak tanam ke 40 × 30 cm untuk mengamati timbulnya kompetisi kanopi ekstrem.',
  }),
  visual: { archetype: 'grid', title: 'Kisi Spasi Pola Tanam Bedengan' },
};

// 4.6 Crop Yield Estimator
export const cropYieldEstimatorSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Ekonomi Produksi Hortikultura',
  formulaLatex: '\\text{Yield (Ton)} = \\frac{\\text{Pohon} \\times \\text{Buah} \\times \\text{Bobot (kg)}}{1.000} \\times (1 - \\text{Reject})',
  spec: {
    engine: 'agriculture',
    simulation: 'crop_yield_estimator',
    version: 1,
    title: 'Simulator Estimasi Hasil Panen & Omset (Crop Yield & Revenue)',
    description: 'Proyeksi hasil panen bersih komoditas hortikultura berdasarkan populasi pohon, load buah, bobot rata-rata, dan tingkat reject pasar.',
    domain: 'Agriculture',
    concepts: ['crop-yield', 'harvest', 'fruit-load', 'reject-rate', 'agribusiness-revenue', 'horticulture'],
    parameters: {
      populasiPohon: { value: 3000, min: 500, max: 10000, step: 250, unit: 'Pohon', label: 'Jumlah Populasi Pohon' },
      buahPerPohon: { value: 12, min: 4, max: 40, step: 2, unit: 'Buah/Pohon', label: 'Rata-Rata Jumlah Buah' },
      rataBobotBuahGram: { value: 450, min: 100, max: 2000, step: 50, unit: 'Gram/Buah', label: 'Bobot Buah Rata-Rata' },
      rejectRatePct: { value: 6, min: 2, max: 25, step: 1, unit: '%', label: 'Tingkat Reject/Sortir Panen' },
      hargaJualPerKgRibu: { value: 18, min: 5, max: 60, step: 1, unit: 'Ribu Rp/Kg', label: 'Harga Jual Petani' },
    },
    controls: ['populasiPohon', 'buahPerPohon', 'rataBobotBuahGram', 'rejectRatePct', 'hargaJualPerKgRibu'],
  },
  compute: (params: Record<string, number>) => {
    const trees = params.populasiPohon ?? 3000;
    const fruits = params.buahPerPohon ?? 12;
    const weightKg = (params.rataBobotBuahGram ?? 450) / 1000;
    const reject = (params.rejectRatePct ?? 6) / 100;
    const pricePerKg = (params.hargaJualPerKgRibu ?? 18) * 1000;

    const grossYieldKg = trees * fruits * weightKg;
    const netYieldKg = Math.round(grossYieldKg * (1 - reject));
    const netYieldTon = Number((netYieldKg / 1000).toFixed(2));
    const grossRevenueJuta = Number(((netYieldKg * pricePerKg) / 1_000_000).toFixed(2));

    return {
      populasiPohon: trees,
      grossYieldTon: Number((grossYieldKg / 1000).toFixed(2)),
      netYieldTon,
      grossRevenueJuta,
      yieldPerTreeKg: Number(((fruits * weightKg) * (1 - reject)).toFixed(2)),
      rejectWeightKg: Math.round(grossYieldKg * reject),
    };
  },
  experiments: [
    {
      id: 'cy-exp-1',
      title: 'Target Panen Bersih Minimal 15.00 Ton',
      objective: 'Optimalkan load buah dan bobot rata-rata hingga menghasilkan panen bersih layak pasar minimal 15.00 Ton.',
      description: 'Pencapaian target kuota kontrak pasok supermarket/industri.',
      targetCondition: { output: 'netYieldTon', operator: '>=', value: 15.0, tolerance: 0.2 },
    },
    {
      id: 'cy-exp-2',
      title: 'Pendapatan Panen Melampaui Rp250 Juta',
      objective: 'Tingkatkan kualitas panen dengan menekan reject rate agar omset penjualan melampaui Rp250 Juta.',
      description: 'Profitabilitas usaha tani agribisnis komersial.',
      targetCondition: { output: 'grossRevenueJuta', operator: '>=', value: 250.0, tolerance: 2 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Proyeksi Produktivitas & Pendapatan Panen',
    changes: [{ parameter: 'Bobot Buah', from: before.rataBobotBuahGram ?? 450, to: after.rataBobotBuahGram ?? 450, unit: 'Gram' }],
    held: [{ parameter: 'Jumlah Pohon', value: after.populasiPohon ?? 3000, unit: 'Pohon' }],
    result: { label: 'Hasil Bersih Layak Jual', from: `${before.netYieldTon ?? 15} Ton`, to: `${after.netYieldTon ?? 15} Ton` },
    keyInsight: `Dari ${(after.populasiPohon ?? 0).toLocaleString('id-ID')} pohon produktif, diperoleh estimasi panen kotor ${after.grossYieldTon} Ton. Setelah dikurangi susut sortir ${after.rejectRatePct}% (${after.rejectWeightKg} kg), panen bersih layak jual adalah ${after.netYieldTon} Ton dengan proyeksi omset Rp${after.grossRevenueJuta} Juta.`,
    tryNext: 'Tekan persentase reject rate dengan perbaikan teknik perlindungan tanaman terhadap hama lalat buah.',
  }),
  visual: { archetype: 'chart', title: 'Grafik Distribusi Hasil Panen & Omset' },
};

// 4.7 Agricultural Supply Chain Simulator
export const agriSupplyChainSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Rantai Pasok & Logistik Pertanian',
  formulaLatex: '\\text{Loss Rate (\\%)} = \\text{Hari} \\times (0.8 + 0.15 \\times \\text{Suhu}), \\quad \\text{Final Volume} = \\text{Panen} \\times (1 - \\text{Loss})',
  spec: {
    engine: 'agriculture',
    simulation: 'agri_supply_chain',
    version: 1,
    title: 'Simulator Rantai Pasok Dingin Hortikultura (Cold Chain Loss)',
    description: 'Analisis susut bobot dan pembusukan komoditas hortikultura selama logistik distribusi berbasis suhu cold storage dan waktu tempuh.',
    domain: 'Agriculture',
    concepts: ['supply-chain', 'cold-chain', 'post-harvest-loss', 'shelf-life', 'horticulture-logistics', 'respiration'],
    parameters: {
      panenAwalKg: { value: 5000, min: 1000, max: 20000, step: 500, unit: 'Kg', label: 'Volume Panen Awal' },
      suhuColdStorageC: { value: 4, min: 2, max: 28, step: 1, unit: '°C', label: 'Suhu Rantai Pasok/Truk' },
      durasiLogistikHari: { value: 3, min: 1, max: 10, step: 1, unit: 'Hari', label: 'Waktu Distribusi ke Pasar' },
      hargaPerKgRibu: { value: 20, min: 5, max: 50, step: 2, unit: 'Ribu Rp/Kg', label: 'Harga Komoditas di Pasar' },
    },
    controls: ['panenAwalKg', 'suhuColdStorageC', 'durasiLogistikHari', 'hargaPerKgRibu'],
  },
  compute: (params: Record<string, number>) => {
    const harvestKg = params.panenAwalKg ?? 5000;
    const temp = params.suhuColdStorageC ?? 4;
    const days = params.durasiLogistikHari ?? 3;
    const price = (params.hargaPerKgRibu ?? 20) * 1000;

    const dailyLossPct = 0.6 + (temp > 10 ? (temp - 10) * 0.45 : temp * 0.08);
    const totalLossPct = Math.min(60, Number((days * dailyLossPct).toFixed(1)));
    const lossWeightKg = Math.round(harvestKg * (totalLossPct / 100));
    const arrivedWeightKg = harvestKg - lossWeightKg;

    const initialValueJuta = (harvestKg * price) / 1_000_000;
    const realizedValueJuta = (arrivedWeightKg * price) / 1_000_000;
    const economicLossJuta = initialValueJuta - realizedValueJuta;

    return {
      panenAwalKg: harvestKg,
      arrivedWeightKg,
      lossWeightKg,
      totalLossPct,
      realizedValueJuta: Number(realizedValueJuta.toFixed(2)),
      economicLossJuta: Number(economicLossJuta.toFixed(2)),
      chainGrade: temp <= 6 ? 'COLD CHAIN PRIMA' : temp <= 15 ? 'COLD CHAIN STANDAR' : 'NON-REFRIGERATED (Risiko Busuk Tinggi)',
    };
  },
  experiments: [
    {
      id: 'sc-exp-1',
      title: 'Kendalikan Susut Logistik di Bawah 5.0%',
      objective: 'Terapkan suhu cold chain <= 4°C selama pengiriman 3 hari agar susut pasca-panen tetap <= 5.0%.',
      description: 'Menjaga kesegaran komoditas hortikultura bernilai tinggi.',
      targetCondition: { output: 'totalLossPct', operator: '<=', value: 5.0, tolerance: 0.2 },
    },
    {
      id: 'sc-exp-2',
      title: 'Penyelamatan Nilai Ekonomis di Atas Rp90 Juta',
      objective: 'Kirim 5.000 kg muatan dengan nilai realisasi jual pasar tujuan minimal Rp95 Juta.',
      description: 'Efisiensi rantai pasok agribisnis hortikultura.',
      targetCondition: { output: 'realizedValueJuta', operator: '>=', value: 95.0, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Efisiensi Rantai Dingin Pasca-Panen',
    changes: [{ parameter: 'Suhu Cold Storage', from: before.suhuColdStorageC ?? 4, to: after.suhuColdStorageC ?? 4, unit: '°C' }],
    held: [{ parameter: 'Durasi Logistik', value: after.durasiLogistikHari ?? 3, unit: 'Hari' }],
    result: { label: 'Susut Bobot Total', from: `${before.totalLossPct ?? 5}%`, to: `${after.totalLossPct ?? 5}%` },
    keyInsight: `Pada suhu ${after.suhuColdStorageC}°C (${after.chainGrade}), laju respirasi komoditas terkendali dengan susut pasca-panen ${after.totalLossPct}% (${after.lossWeightKg} kg). Komoditas tiba di pasar sebanyak ${after.arrivedWeightKg} kg dengan nilai jual Rp${after.realizedValueJuta} Juta.`,
    tryNext: 'Naikkan suhu ke 25°C (truk bak terbuka) untuk melihat lonjakan pembusukan komoditas.',
  }),
  visual: { archetype: 'funnel', title: 'Penurunan Bobot Sepanjang Rantai Pasok' },
};

// 4.8 Analisis Biaya Produksi Hortikultura
export const horticultureProductionCostSimulation: ExtendedSimulationDefinition = {
  discipline: 'Agribisnis Hortikultura',
  category: 'Ekonomi Produksi Pertanian',
  formulaLatex: '\\text{Biaya Pokok/Kg} = \\frac{\\sum \\text{Biaya Input}}{\\text{Hasil Panen Bersih (Kg)}}',
  spec: {
    engine: 'agriculture',
    simulation: 'horticulture_cost',
    version: 1,
    title: 'Analisis Biaya Produksi Hortikultura',
    description: 'Kalkulasi total biaya budidaya hortikultura (benih, pupuk, tenaga kerja, irigasi, transportasi) dan biaya pokok per kilogram hasil panen.',
    domain: 'Agriculture',
    concepts: ['biaya-produksi', 'hortikultura', 'biaya-pokok', 'margin-panen', 'pupuk', 'tenaga-kerja'],
    parameters: {
      seedCostJuta: { value: 6, min: 1, max: 30, step: 1, unit: 'Juta Rp', label: 'Biaya Benih / Bibit' },
      fertilizerCostJuta: { value: 12, min: 2, max: 50, step: 2, unit: 'Juta Rp', label: 'Biaya Pupuk & Pestisida' },
      laborCostJuta: { value: 15, min: 3, max: 60, step: 3, unit: 'Juta Rp', label: 'Biaya Tenaga Kerja' },
      irrigationCostJuta: { value: 4, min: 1, max: 20, step: 1, unit: 'Juta Rp', label: 'Biaya Irigasi & Operasional' },
      transportCostJuta: { value: 3, min: 1, max: 20, step: 1, unit: 'Juta Rp', label: 'Biaya Transportasi & Logistik' },
      harvestYieldKg: { value: 8000, min: 1000, max: 30000, step: 500, unit: 'Kg', label: 'Hasil Panen Bersih' },
    },
    controls: ['seedCostJuta', 'fertilizerCostJuta', 'laborCostJuta', 'irrigationCostJuta', 'transportCostJuta', 'harvestYieldKg'],
  },
  compute: (params: Record<string, number>) => {
    const seed = (params.seedCostJuta ?? 6) * 1_000_000;
    const fert = (params.fertilizerCostJuta ?? 12) * 1_000_000;
    const labor = (params.laborCostJuta ?? 15) * 1_000_000;
    const irrig = (params.irrigationCostJuta ?? 4) * 1_000_000;
    const trans = (params.transportCostJuta ?? 3) * 1_000_000;
    const yieldKg = Math.max(100, params.harvestYieldKg ?? 8000);

    const totalCost = seed + fert + labor + irrig + trans;
    const costPerKg = Math.round(totalCost / yieldKg);
    const totalCostJuta = Number((totalCost / 1_000_000).toFixed(2));
    const marketPriceEstimatedPerKg = 8500;
    const revenueEstimatedJuta = Number(((yieldKg * marketPriceEstimatedPerKg) / 1_000_000).toFixed(2));
    const estimatedMarginPct = Number((((revenueEstimatedJuta - totalCostJuta) / revenueEstimatedJuta) * 100).toFixed(1));

    return {
      totalCostJuta,
      costPerKg,
      harvestYieldKg: yieldKg,
      revenueEstimatedJuta,
      estimatedMarginPct,
    };
  },
  experiments: [
    {
      id: 'hpc-exp-1',
      title: 'Tekan Biaya Pokok <= Rp4.500 / Kg',
      objective: 'Ubah hasil panen atau efisiensi biaya input agar biaya pokok produksi per kg tetap di bawah Rp4.500.',
      description: 'Menjaga daya saing komoditas hortikultura di pasar induk.',
      targetCondition: { output: 'costPerKg', operator: '<=', value: 4500, tolerance: 50 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Struktur Biaya Budidaya & Margin Panen',
    changes: [{ parameter: 'Hasil Panen', from: before.harvestYieldKg ?? 8000, to: after.harvestYieldKg ?? 8000, unit: 'Kg' }],
    held: [{ parameter: 'Total Biaya', value: after.totalCostJuta ?? 40, unit: 'Juta Rp' }],
    result: { label: 'Biaya Pokok per Kg', from: `Rp${before.costPerKg ?? 5000}`, to: `Rp${after.costPerKg ?? 5000}` },
    keyInsight: `Dengan total pengeluaran Rp${after.totalCostJuta} Juta dan hasil panen ${after.harvestYieldKg} kg, biaya pokok per kg adalah Rp${after.costPerKg}. Pada asumsi harga jual pasar Rp8.500/kg, estimasi margin operasional adalah ${after.estimatedMarginPct}%.`,
    tryNext: 'Tingkatkan hasil panen per hektar untuk menurunkan beban biaya pokok per kg.',
  }),
  visual: { archetype: 'chart', title: 'Komposisi Biaya Input & Analisis Biaya Pokok Hortikultura' },
};

// ============================================================================
// 5. PENGELOLAAN KONVENSI & ACARA (MICE) - 7 SIMULASI
// ============================================================================

// 5.1 Event Budget Simulator
export const eventBudgetSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Manajemen Keuangan Acara',
  formulaLatex: '\\text{Contingency} = \\text{Total Budget} - (\\text{Venue} + \\text{F&B} + \\text{AV Production} + \\text{Marketing})',
  spec: {
    engine: 'economics',
    simulation: 'event_budget',
    version: 1,
    title: 'Simulator Anggaran & Alokasi Biaya Acara (Event Budgeting)',
    description: 'Simulasi alokasi pos pengeluaran acara MICE: Venue, F&B, Produksi Panggung & AV, Pemasaran, serta Dana Cadangan Kontinjensi.',
    domain: 'Event Management',
    concepts: ['event-budget', 'contingency-fund', 'cost-allocation', 'mice', 'fnb-cost', 'production-cost'],
    parameters: {
      totalBudgetJuta: { value: 200, min: 50, max: 1000, step: 25, unit: 'Juta Rp', label: 'Plafon Total Anggaran' },
      venuePct: { value: 30, min: 15, max: 50, step: 5, unit: '%', label: 'Porsi Sewa Venue' },
      fnbPct: { value: 25, min: 15, max: 40, step: 5, unit: '%', label: 'Porsi Makanan & Minuman (F&B)' },
      avProductionPct: { value: 20, min: 10, max: 35, step: 5, unit: '%', label: 'Porsi Panggung & AV' },
      marketingPct: { value: 15, min: 5, max: 25, step: 5, unit: '%', label: 'Porsi Pemasaran & Promosi' },
    },
    controls: ['totalBudgetJuta', 'venuePct', 'fnbPct', 'avProductionPct', 'marketingPct'],
  },
  compute: (params: Record<string, number>) => {
    const total = params.totalBudgetJuta ?? 200;
    const vPct = params.venuePct ?? 30;
    const fPct = params.fnbPct ?? 25;
    const aPct = params.avProductionPct ?? 20;
    const mPct = params.marketingPct ?? 15;

    const allocatedPct = vPct + fPct + aPct + mPct;
    const contingencyPct = Math.max(0, 100 - allocatedPct);

    const venueJuta = Number(((total * vPct) / 100).toFixed(1));
    const fnbJuta = Number(((total * fPct) / 100).toFixed(1));
    const avJuta = Number(((total * aPct) / 100).toFixed(1));
    const marketingJuta = Number(((total * mPct) / 100).toFixed(1));
    const contingencyJuta = Number(((total * contingencyPct) / 100).toFixed(1));

    return {
      totalBudgetJuta: total,
      venueJuta,
      fnbJuta,
      avJuta,
      marketingJuta,
      contingencyJuta,
      contingencyPct,
      budgetSafetyStatus: contingencyPct >= 10 ? 'AMAN (Kontinjensi Sehat >= 10%)' : contingencyPct >= 5 ? 'MODERAT' : 'BERISIKO OVERBUDGET (Dana Cadangan Rendah)',
    };
  },
  experiments: [
    {
      id: 'eb-exp-1',
      title: 'Amankan Cadangan Kontinjensi Minimal 10%',
      objective: 'Seimbangkan alokasi pos biaya acara hingga dana darurat tak terduga mencapai minimal 10% (Rp20 Juta).',
      description: 'SOP mitigasi risiko pembengkakan biaya tak terduga saat pelaksanaan.',
      targetCondition: { output: 'contingencyPct', operator: '>=', value: 10, tolerance: 0.5 },
    },
    {
      id: 'eb-exp-2',
      title: 'Alokasi Pengalaman Peserta F&B Minimal Rp50 Juta',
      objective: 'Tingkatkan alokasi pos F&B agar mencapai minimal Rp50 Juta tanpa mengurangi dana kontinjensi di bawah 8%.',
      description: 'Meningkatkan kepuasan delegasi konferensi internasional.',
      targetCondition: { output: 'fnbJuta', operator: '>=', value: 50, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Struktur Alokasi Anggaran Acara',
    changes: [{ parameter: 'Porsi Venue', from: before.venuePct ?? 30, to: after.venuePct ?? 30, unit: '%' }],
    held: [{ parameter: 'Total Anggaran', value: after.totalBudgetJuta ?? 200, unit: 'Juta Rp' }],
    result: { label: 'Dana Kontinjensi', from: `Rp${before.contingencyJuta ?? 20} Jt`, to: `Rp${after.contingencyJuta ?? 20} Jt` },
    keyInsight: `Dari plafon Rp${after.totalBudgetJuta} Juta, alokasi terbesar adalah Venue (Rp${after.venueJuta} Jt) dan F&B (Rp${after.fnbJuta} Jt). Dana cadangan kontinjensi tersisa sebesar Rp${after.contingencyJuta} Juta (${after.contingencyPct}%), dengan status ${after.budgetSafetyStatus}.`,
    tryNext: 'Naikkan pos promosi dan amati bagaimana dana kontinjensi menipis.',
  }),
  visual: { archetype: 'chart', title: 'Komposisi Alokasi Anggaran Acara MICE' },
};

// 5.2 Event Capacity Planner
export const eventCapacityPlannerSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Operasional & Tata Ruang Acara',
  formulaLatex: '\\text{Kapasitas Kursi} = \\frac{\\text{Luas Hall} \\times (1 - \\text{Aisle})}{\\text{Standar Space/Org}}',
  spec: {
    engine: 'general',
    simulation: 'event_capacity_planner',
    version: 1,
    title: 'Simulator Perencanaan Kapasitas Ruang Acara (Capacity Planner)',
    description: 'Kalkulasi kapasitas daya tampung ballroom/aula MICE berdasarkan gaya tata letak (Theater, Classroom, Banquet) dan koridor keselamatan.',
    domain: 'Event Management',
    concepts: ['event-capacity', 'ballroom-layout', 'theater-style', 'banquet-style', 'classroom-style', 'aisle-clearance'],
    parameters: {
      hallAreaM2: { value: 600, min: 200, max: 3000, step: 50, unit: 'm²', label: 'Luas Bersih Hall' },
      setupStyleIndex: { value: 2, min: 1, max: 3, step: 1, unit: '', label: 'Gaya Layout (1:Theater, 2:Classroom, 3:Banquet)' },
      aisleClearancePct: { value: 20, min: 15, max: 35, step: 5, unit: '%', label: 'Rasio Koridor & Sirkulasi' },
    },
    controls: ['hallAreaM2', 'setupStyleIndex', 'aisleClearancePct'],
  },
  compute: (params: Record<string, number>) => {
    const area = params.hallAreaM2 ?? 600;
    const styleCode = params.setupStyleIndex ?? 2;
    const aislePct = (params.aisleClearancePct ?? 20) / 100;

    const styles: Record<number, { name: string; m2PerPerson: number }> = {
      1: { name: 'Theater Style (0.8 m²/org)', m2PerPerson: 0.8 },
      2: { name: 'Classroom Style (1.5 m²/org)', m2PerPerson: 1.5 },
      3: { name: 'Round Banquet Table (2.0 m²/org)', m2PerPerson: 2.0 },
    };
    const activeStyle = styles[styleCode] || styles[2];

    const netUsableM2 = area * (1 - aislePct);
    const maxCapacity = Math.floor(netUsableM2 / activeStyle.m2PerPerson);
    const minFireExitDoors = Math.max(2, Math.ceil(maxCapacity / 250));

    return {
      hallAreaM2: area,
      layoutStyle: activeStyle.name,
      netUsableAreaM2: Math.round(netUsableM2),
      maxAttendeesCapacity: maxCapacity,
      minFireExitDoors,
      comfortDensity: Number((maxCapacity / area).toFixed(2)),
    };
  },
  experiments: [
    {
      id: 'ec-exp-1',
      title: 'Tampung Minimal 300 Peserta Classroom Style',
      objective: 'Atur luas hall dan koridor keselamatan agar gaya Classroom mampu menampung minimal 300 peserta.',
      description: 'Standar penataan ruang workshop korporat skala menengah.',
      targetCondition: { output: 'maxAttendeesCapacity', operator: '>=', value: 300, tolerance: 10 },
    },
    {
      id: 'ec-exp-2',
      title: 'Maksimalkan Kapasitas Theater Style >= 600 Delegasi',
      objective: 'Pilih layout Theater pada hall 600 m² dengan koridor keselamatan 20%.',
      description: 'Konvensi pleno pembukaan konferensi internasional.',
      targetCondition: { output: 'maxAttendeesCapacity', operator: '>=', value: 600, tolerance: 20 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Tata Letak & Kapasitas Hall',
    changes: [{ parameter: 'Gaya Layout', from: before.setupStyleIndex ?? 2, to: after.setupStyleIndex ?? 2 }],
    held: [{ parameter: 'Luas Hall', value: after.hallAreaM2 ?? 600, unit: 'm²' }],
    result: { label: 'Kapasitas Kursi', from: `${before.maxAttendeesCapacity ?? 320} org`, to: `${after.maxAttendeesCapacity ?? 320} org` },
    keyInsight: `Dengan luas hall ${after.hallAreaM2} m² dan koridor sirkulasi ${after.aisleClearancePct}%, luas lantai efektif adalah ${after.netUsableAreaM2} m². Pengaturan ${after.layoutStyle} menampung maksimal ${after.maxAttendeesCapacity} peserta, dengan syarat minimal ${after.minFireExitDoors} pintu evakuasi darurat.`,
    tryNext: 'Beralih ke gaya Banquet Round Table untuk melihat penurunan kapasitas kursi.',
  }),
  visual: { archetype: 'grid', title: 'Denah Layout Penataan Kursi Hall' },
};

// 5.3 Ticket Pricing Simulator
export const ticketPricingSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Strategi Komersial Acara',
  formulaLatex: '\\text{Gross Revenue} = \\sum (\\text{Quota}_i \\times \\text{Price}_i)',
  spec: {
    engine: 'economics',
    simulation: 'ticket_pricing',
    version: 1,
    title: 'Simulator Penetapan Harga Tiket Acara (Tiered Ticket Pricing)',
    description: 'Simulasi diferensiasi tiket bertingkat Early Bird, Regular, dan VIP untuk memproyeksikan potensi pendapatan kotor penjualan tiket.',
    domain: 'Event Management',
    concepts: ['ticket-pricing', 'early-bird', 'vip-tier', 'revenue-projection', 'ticketing'],
    parameters: {
      earlyBirdQuota: { value: 150, min: 50, max: 500, step: 25, unit: 'Tiket', label: 'Kuota Early Bird' },
      earlyBirdPriceRibu: { value: 250, min: 100, max: 800, step: 25, unit: 'Ribu Rp', label: 'Harga Early Bird' },
      regularQuota: { value: 400, min: 100, max: 1500, step: 50, unit: 'Tiket', label: 'Kuota Regular' },
      regularPriceRibu: { value: 400, min: 150, max: 1200, step: 25, unit: 'Ribu Rp', label: 'Harga Regular' },
      vipQuota: { value: 50, min: 10, max: 200, step: 10, unit: 'Tiket', label: 'Kuota VIP Access' },
      vipPriceRibu: { value: 1000, min: 400, max: 3000, step: 50, unit: 'Ribu Rp', label: 'Harga VIP' },
    },
    controls: ['earlyBirdQuota', 'earlyBirdPriceRibu', 'regularQuota', 'regularPriceRibu', 'vipQuota', 'vipPriceRibu'],
  },
  compute: (params: Record<string, number>) => {
    const qEb = params.earlyBirdQuota ?? 150;
    const pEb = (params.earlyBirdPriceRibu ?? 250) * 1000;
    const qReg = params.regularQuota ?? 400;
    const pReg = (params.regularPriceRibu ?? 400) * 1000;
    const qVip = params.vipQuota ?? 50;
    const pVip = (params.vipPriceRibu ?? 1000) * 1000;

    const totalTickets = qEb + qReg + qVip;
    const revEbJuta = (qEb * pEb) / 1_000_000;
    const revRegJuta = (qReg * pReg) / 1_000_000;
    const revVipJuta = (qVip * pVip) / 1_000_000;
    const totalRevenueJuta = revEbJuta + revRegJuta + revVipJuta;

    const avgTicketPriceRibu = totalTickets > 0 ? Math.round(((totalRevenueJuta * 1_000_000) / totalTickets) / 1000) : 0;

    return {
      totalTickets,
      revEbJuta: Number(revEbJuta.toFixed(1)),
      revRegJuta: Number(revRegJuta.toFixed(1)),
      revVipJuta: Number(revVipJuta.toFixed(1)),
      totalRevenueJuta: Number(totalRevenueJuta.toFixed(1)),
      avgTicketPriceRibu,
      vipRevenueSharePct: Number(((revVipJuta / totalRevenueJuta) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'tp-exp-1',
      title: 'Target Penjualan Tiket Minimal Rp250 Juta',
      objective: 'Rancang kombinasi harga dan kuota tiket 3 tier agar potensi omset mencapai minimal Rp250 Juta.',
      description: 'Memenuhi anggaran belanja produksi acara berkelas.',
      targetCondition: { output: 'totalRevenueJuta', operator: '>=', value: 250.0, tolerance: 2 },
    },
    {
      id: 'tp-exp-2',
      title: 'Kontribusi Omset VIP Minimal 20%',
      objective: 'Atur harga dan kuota tiket VIP hingga menyumbang minimal 20% dari total pendapatan kotor tiket.',
      description: 'Strategi paket pengalaman premium eksklusif.',
      targetCondition: { output: 'vipRevenueSharePct', operator: '>=', value: 20.0, tolerance: 0.5 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Struktur Penerimaan Tiket Acara',
    changes: [{ parameter: 'Harga Tiket Regular', from: before.regularPriceRibu ?? 400, to: after.regularPriceRibu ?? 400, unit: 'Ribu Rp' }],
    held: [{ parameter: 'Total Kuota Kursi', value: after.totalTickets ?? 600, unit: 'Tiket' }],
    result: { label: 'Proyeksi Omset Tiket', from: `Rp${before.totalRevenueJuta ?? 247} Jt`, to: `Rp${after.totalRevenueJuta ?? 247} Jt` },
    keyInsight: `Dari total ${after.totalTickets} tiket, tier Regular menyumbang Rp${after.revRegJuta} Juta dan VIP menyumbang Rp${after.revVipJuta} Juta (${after.vipRevenueSharePct}%). Total potensi pendapatan adalah Rp${after.totalRevenueJuta} Juta dengan harga rata-rata tertimbang Rp${after.avgTicketPriceRibu} Ribu/tiket.`,
    tryNext: 'Perbesar kuota VIP untuk menaikkan harga rata-rata tertimbang.',
  }),
  visual: { archetype: 'chart', title: 'Komposisi Pendapatan per Kategori Tiket' },
};

// 5.4 Event Break-Even Simulator
export const eventBreakEvenSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Manajemen Keuangan Acara',
  formulaLatex: '\\text{BEP Peserta} = \\frac{\\text{Biaya Tetap (Venue + Talent)}}{\\text{Harga Tiket} - \\text{Variable Cost/Peserta}}',
  spec: {
    engine: 'economics',
    simulation: 'event_break_even',
    version: 1,
    title: 'Simulator Titik Impas Acara (Event Break-Even & Attendance)',
    description: 'Kalkulasi jumlah peserta minimum yang harus mendaftar agar seluruh biaya tetap venue, panggung, dan artis tertutup sempurna.',
    domain: 'Event Management',
    concepts: ['event-bep', 'fixed-cost', 'ticket-margin', 'break-even-attendance', 'risk-management'],
    parameters: {
      biayaVenueJuta: { value: 40, min: 10, max: 150, step: 5, unit: 'Juta Rp', label: 'Sewa Venue & Hall' },
      biayaTalentJuta: { value: 35, min: 5, max: 150, step: 5, unit: 'Juta Rp', label: 'Narasumber & Artis' },
      hargaTiketRibu: { value: 350, min: 100, max: 1000, step: 25, unit: 'Ribu Rp/Peserta', label: 'Harga Tiket Masuk' },
      variableCostPesertaRibu: { value: 100, min: 30, max: 300, step: 10, unit: 'Ribu Rp/Peserta', label: 'Biaya Variabel (Kit + F&B)' },
    },
    controls: ['biayaVenueJuta', 'biayaTalentJuta', 'hargaTiketRibu', 'variableCostPesertaRibu'],
  },
  compute: (params: Record<string, number>) => {
    const venue = (params.biayaVenueJuta ?? 40) * 1_000_000;
    const talent = (params.biayaTalentJuta ?? 35) * 1_000_000;
    const price = (params.hargaTiketRibu ?? 350) * 1000;
    const vc = (params.variableCostPesertaRibu ?? 100) * 1000;

    const totalFixedCost = venue + talent;
    const marginPerTicket = Math.max(10_000, price - vc);
    const bepAttendees = Math.ceil(totalFixedCost / marginPerTicket);
    const bepGrossRevenueJuta = Number(((bepAttendees * price) / 1_000_000).toFixed(2));

    return {
      totalFixedCostJuta: totalFixedCost / 1_000_000,
      marginPerTicketRibu: marginPerTicket / 1000,
      bepAttendees,
      bepGrossRevenueJuta,
      cmRatioPct: Number(((marginPerTicket / price) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'ebe-exp-1',
      title: 'Target BEP Terjangkau <= 300 Peserta',
      objective: 'Sesuaikan harga tiket dan negosiasi biaya tetap agar BEP tercapai pada maksimal 300 peserta.',
      description: 'Menurunkan risiko kegagalan finansial acara.',
      targetCondition: { output: 'bepAttendees', operator: '<=', value: 300, tolerance: 5 },
    },
    {
      id: 'ebe-exp-2',
      title: 'Margin Kontribusi Tiket Minimal 70%',
      objective: 'Atur harga tiket terhadap biaya kit/F&B hingga margin kontribusi per peserta mencapai minimal 70%.',
      description: 'Standar kesehatan keuangan acara komersial.',
      targetCondition: { output: 'cmRatioPct', operator: '>=', value: 70, tolerance: 1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Analisis Titik Impas Kehadiran Peserta',
    changes: [{ parameter: 'Harga Tiket', from: before.hargaTiketRibu ?? 350, to: after.hargaTiketRibu ?? 350, unit: 'Ribu Rp' }],
    held: [{ parameter: 'Total Biaya Tetap', value: after.totalFixedCostJuta ?? 75, unit: 'Juta Rp' }],
    result: { label: 'BEP Kehadiran', from: `${before.bepAttendees ?? 300} peserta`, to: `${after.bepAttendees ?? 300} peserta` },
    keyInsight: `Total biaya tetap adalah Rp${after.totalFixedCostJuta} Juta dengan margin per tiket Rp${after.marginPerTicketRibu} Ribu. Acara wajib menjaring minimal ${after.bepAttendees} peserta (omset Rp${after.bepGrossRevenueJuta} Juta) hanya untuk menutup modal awal.`,
    tryNext: 'Naikkan harga tiket untuk memangkas jumlah minimum peserta BEP.',
  }),
  visual: { archetype: 'chart', title: 'Grafik Kurva Titik Impas Tiket Acara' },
};

// 5.5 Event Timeline & Critical Path Simulator
export const eventTimelineSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Manajemen Operasional Acara',
  formulaLatex: '\\text{Total Durasi (Jam)} = \\text{Loading In} + \\text{Rehearsal} + \\text{Show} + \\text{Loading Out} + \\text{Buffer}',
  spec: {
    engine: 'general',
    simulation: 'event_timeline',
    version: 1,
    title: 'Simulator Rundown & Jadwal Kritis Acara (Event Timeline & Critical Path)',
    description: 'Manajemen jadwal sewa gedung, tahapan loading in, gladi resik (GR), live show, breakdown, dan buffer waktu pengaman overtime.',
    domain: 'Event Management',
    concepts: ['timeline', 'critical-path', 'rundown', 'loading-in', 'teardown', 'overtime-risk'],
    parameters: {
      loadingInHours: { value: 8, min: 4, max: 24, step: 1, unit: 'Jam', label: 'Setup Panggung & Loading-In' },
      rehearsalHours: { value: 3, min: 1, max: 8, step: 0.5, unit: 'Jam', label: 'Gladi Resik (Rehearsal)' },
      showDurationHours: { value: 5, min: 2, max: 10, step: 0.5, unit: 'Jam', label: 'Durasi Live Acara' },
      loadingOutHours: { value: 4, min: 2, max: 12, step: 1, unit: 'Jam', label: 'Bongkar Panggung (Teardown)' },
      bufferHours: { value: 2, min: 0.5, max: 6, step: 0.5, unit: 'Jam', label: 'Buffer Waktu Kontinjensi' },
    },
    controls: ['loadingInHours', 'rehearsalHours', 'showDurationHours', 'loadingOutHours', 'bufferHours'],
  },
  compute: (params: Record<string, number>) => {
    const lIn = params.loadingInHours ?? 8;
    const reh = params.rehearsalHours ?? 3;
    const show = params.showDurationHours ?? 5;
    const lOut = params.loadingOutHours ?? 4;
    const buf = params.bufferHours ?? 2;

    const totalHours = lIn + reh + show + lOut + buf;
    const maxDayBookingHours = 24;
    const isOvertime = totalHours > maxDayBookingHours;
    const overtimeHours = isOvertime ? totalHours - maxDayBookingHours : 0;
    const overtimeChargeJuta = overtimeHours * 3.5; // Rp3.5 Jt/jam denda overtime

    return {
      totalHours,
      overtimeHours,
      overtimeChargeJuta,
      scheduleSafety: isOvertime ? 'PERINGATAN OVERTIME (Kena Denda Sewa)' : 'JADWAL EFISIEN (Dalam Batas Sewa 24 Jam)',
      bufferSharePct: Number(((buf / totalHours) * 100).toFixed(1)),
    };
  },
  experiments: [
    {
      id: 'et-exp-1',
      title: 'Susun Timeline Aman Maksimal 24 Jam',
      objective: 'Optimalkan seluruh tahapan agar total sewa gedung tidak melebihi batas 24 jam dan bebas penalti overtime.',
      description: 'Menghindari biaya denda overtime gedung konvensi.',
      targetCondition: { output: 'totalHours', operator: '<=', value: 24, tolerance: 0.1 },
    },
    {
      id: 'et-exp-2',
      title: 'Pertahankan Buffer Waktu Minimal 2.0 Jam',
      objective: 'Sediakan buffer kontinjensi minimal 2.0 jam dalam batas total sewa 24 jam.',
      description: 'SOP pengamanan keterlambatan artis dan masalah teknis sound system.',
      targetCondition: { output: 'bufferHours', operator: '>=', value: 2.0, tolerance: 0.1 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Manajemen Jalur Kritis Rundown Acara',
    changes: [{ parameter: 'Durasi Setup', from: before.loadingInHours ?? 8, to: after.loadingInHours ?? 8, unit: 'Jam' }],
    held: [{ parameter: 'Batas Sewa Gedung', value: 24, unit: 'Jam' }],
    result: { label: 'Total Waktu', from: `${before.totalHours ?? 22} Jam`, to: `${after.totalHours ?? 22} Jam` },
    keyInsight: `Rundown acara memakan total waktu ${after.totalHours} jam (${after.scheduleSafety}). Porsi buffer pengaman sebesar ${after.bufferHours} jam (${after.bufferSharePct}%) krusial untuk mengantisipasi keterlambatan artis tanpa terkena penalti overtime.`,
    tryNext: 'Perpanjang waktu loading in menjadi 14 jam untuk menguji timbulnya denda overtime.',
  }),
  visual: { archetype: 'chart', title: 'Diagram Gantt Alur Waktu Rundown Acara' },
};

// 5.6 Venue Layout & Flow Simulator
export const venueLayoutSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Tata Ruang Pameran & Eksibisi',
  formulaLatex: '\\text{Public Aisle (\\%)} = \\frac{\\text{Hall Area} - (\\text{Booth Count} \\times \\text{Booth Size})}{\\text{Hall Area}} \\times 100\\%',
  spec: {
    engine: 'general',
    simulation: 'venue_layout',
    version: 1,
    title: 'Simulator Tata Letak Booth Pameran & Alur Pengunjung (Exhibition Layout)',
    description: 'Penataan grid booth pameran, lebar lorong sirkulasi (aisle width), mitigasi titik penumpukan (bottleneck), dan keselamatan pengunjung.',
    domain: 'Event Management',
    concepts: ['exhibition', 'booth-layout', 'aisle-width', 'crowd-flow', 'bottleneck', 'trade-show'],
    parameters: {
      boothCount: { value: 36, min: 10, max: 80, step: 2, unit: 'Booth', label: 'Jumlah Booth Pameran' },
      boothSizeM2: { value: 9, min: 6, max: 24, step: 3, unit: 'm²/Booth', label: 'Ukuran Standar Booth' },
      hallAreaM2: { value: 1000, min: 400, max: 3000, step: 100, unit: 'm²', label: 'Luas Bersih Hall Pameran' },
      aisleWidthMeters: { value: 3.0, min: 2.0, max: 5.0, step: 0.5, unit: 'Meter', label: 'Lebar Lorong Sirkulasi' },
    },
    controls: ['boothCount', 'boothSizeM2', 'hallAreaM2', 'aisleWidthMeters'],
  },
  compute: (params: Record<string, number>) => {
    const count = params.boothCount ?? 36;
    const size = params.boothSizeM2 ?? 9;
    const hall = params.hallAreaM2 ?? 1000;
    const aisleW = params.aisleWidthMeters ?? 3.0;

    const totalBoothArea = count * size;
    const publicAreaM2 = Math.max(0, hall - totalBoothArea);
    const aisleSharePct = Number(((publicAreaM2 / hall) * 100).toFixed(1));

    const flowQuality = aisleSharePct >= 55 && aisleW >= 3.0 ? 'SIRKULASI LANCAR (Standar Internasional)' : aisleSharePct >= 40 ? 'PADAT MODERAT' : 'SESAK (Rawan Bottleneck & Bahaya Evakuasi)';

    return {
      boothCount: count,
      totalBoothAreaM2: totalBoothArea,
      publicAreaM2,
      aisleSharePct,
      flowQuality,
      maxSimultaneousVisitors: Math.round(publicAreaM2 / 1.5),
    };
  },
  experiments: [
    {
      id: 'vl-exp-1',
      title: 'Sirkulasi Pameran Ideal (Area Publik >= 55%)',
      objective: 'Atur jumlah booth dan luas hall agar area lorong publik mencapai minimal 55% dari total luas hall.',
      description: 'Menjamin kenyamanan pengunjung pameran dagang internasional.',
      targetCondition: { output: 'aisleSharePct', operator: '>=', value: 55, tolerance: 0.5 },
    },
    {
      id: 'vl-exp-2',
      title: 'Tampung 35 Booth dengan Koridor Lebar 3.0 Meter',
      objective: 'Tempatkan 36 booth ukuran 9 m² di hall 1.000 m² dengan lorong sirkulasi lancar.',
      description: 'Optimalisasi monetisasi sewa space pameran MICE.',
      targetCondition: { output: 'totalBoothAreaM2', operator: 'between', value: 300, value2: 400, tolerance: 10 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Evaluasi Tata Ruang Eksibisi Pameran',
    changes: [{ parameter: 'Jumlah Booth', from: before.boothCount ?? 36, to: after.boothCount ?? 36, unit: 'Unit' }],
    held: [{ parameter: 'Luas Hall', value: after.hallAreaM2 ?? 1000, unit: 'm²' }],
    result: { label: 'Rasio Area Publik', from: `${before.aisleSharePct ?? 67}%`, to: `${after.aisleSharePct ?? 67}%` },
    keyInsight: `Dari hall ${after.hallAreaM2} m², ${after.boothCount} booth memakan ${after.totalBoothAreaM2} m². Tersedia area sirkulasi ${after.publicAreaM2} m² (${after.aisleSharePct}%), berstatus ${after.flowQuality} dan mampu menampung ${after.maxSimultaneousVisitors} pengunjung simultan.`,
    tryNext: 'Tambah jumlah booth hingga 65 unit untuk mengamati bahaya penumpukan pengunjung di lorong sempit.',
  }),
  visual: { archetype: 'grid', title: 'Peta Denah Grid Booth Pameran' },
};

// 5.7 Event Risk Simulator
export const eventRiskSimulation: ExtendedSimulationDefinition = {
  discipline: 'Pengelolaan Konvensi dan Acara',
  category: 'Manajemen Risiko Acara',
  formulaLatex: '\\text{EMV} = P \\times \\text{Severity}, \\quad \\text{Residual Risk} = \\text{Severity} \\times (1 - \\text{Coverage}) \\times (P \\times 0.5)',
  spec: {
    engine: 'general',
    simulation: 'event_risk_simulator',
    version: 1,
    title: 'Simulator Manajemen Risiko Acara (Event Risk & Mitigation)',
    description: 'Kuantifikasi Expected Monetary Value (EMV) risiko operasional acara (cuaca, vendor default, insiden AV) dan efektivitas asuransi/SOP.',
    domain: 'Event Management',
    concepts: ['event-risk', 'risk-management', 'mitigation', 'insurance', 'emv', 'residual-risk'],
    parameters: {
      riskProbabilityPct: { value: 35, min: 5, max: 80, step: 5, unit: '%', label: 'Probabilitas Kejadian Risiko' },
      impactSeverityJuta: { value: 120, min: 20, max: 300, step: 10, unit: 'Juta Rp', label: 'Besaran Dampak Finansial' },
      mitigationCostJuta: { value: 15, min: 2, max: 40, step: 1, unit: 'Juta Rp', label: 'Biaya Program Mitigasi/SOP' },
      insuranceCoveragePct: { value: 70, min: 0, max: 100, step: 10, unit: '%', label: 'Proteksi Asuransi Acara' },
    },
    controls: ['riskProbabilityPct', 'impactSeverityJuta', 'mitigationCostJuta', 'insuranceCoveragePct'],
  },
  compute: (params: Record<string, number>) => {
    const p = (params.riskProbabilityPct ?? 35) / 100;
    const impact = params.impactSeverityJuta ?? 120;
    const mitCost = params.mitigationCostJuta ?? 15;
    const insPct = (params.insuranceCoveragePct ?? 70) / 100;

    const emvInitialJuta = Number((p * impact).toFixed(1));
    const mitigatedProb = p * 0.45; // SOP cuts probability by 55%
    const uninsLoss = impact * (1 - insPct);
    const residualRiskJuta = Number((mitigatedProb * uninsLoss).toFixed(1));
    const riskExposureCutJuta = Number((emvInitialJuta - residualRiskJuta).toFixed(1));
    const mitigationRoi = mitCost > 0 ? Number(((riskExposureCutJuta / mitCost) * 100).toFixed(0)) : 0;

    return {
      emvInitialJuta,
      residualRiskJuta,
      riskExposureCutJuta,
      mitigationRoiPct: mitigationRoi,
      riskLevel: residualRiskJuta <= 15 ? 'RISIKO RENDAH (Terkendali)' : residualRiskJuta <= 35 ? 'RISIKO MODERAT' : 'RISIKO TINGGI (Wajib Ditangani)',
    };
  },
  experiments: [
    {
      id: 'er-exp-1',
      title: 'Turunkan Risiko Residual di Bawah Rp15 Juta',
      objective: 'Kombinasikan belanja mitigasi dan asuransi hingga eksposur risiko residual turun di bawah Rp15 Juta.',
      description: 'Memenuhi klausul audit kepatuhan event internasional.',
      targetCondition: { output: 'residualRiskJuta', operator: '<=', value: 15.0, tolerance: 0.5 },
    },
    {
      id: 'er-exp-2',
      title: 'Efektivitas Biaya Mitigasi ROI >= 200%',
      objective: 'Capai penghematan eksposur risiko minimal 2× lipat dari biaya mitigasi yang dikeluarkan (ROI >= 200%).',
      description: 'Justifikasi pengeluaran proteksi kepada stakeholder.',
      targetCondition: { output: 'mitigationRoiPct', operator: '>=', value: 200, tolerance: 10 },
    },
  ],
  generateInsight: (before, after) => ({
    title: 'Kuantifikasi Eksposur Risiko Acara',
    changes: [{ parameter: 'Proteksi Asuransi', from: before.insuranceCoveragePct ?? 70, to: after.insuranceCoveragePct ?? 70, unit: '%' }],
    held: [{ parameter: 'Dampak Maksimal', value: after.impactSeverityJuta ?? 120, unit: 'Juta Rp' }],
    result: { label: 'Risiko Residual', from: `Rp${before.residualRiskJuta ?? 10} Jt`, to: `Rp${after.residualRiskJuta ?? 10} Jt` },
    keyInsight: `Nilai risiko awal (EMV) adalah Rp${after.emvInitialJuta} Juta. Melalui mitigasi SOP dan proteksi asuransi ${after.insuranceCoveragePct}%, risiko residual ditekan menjadi Rp${after.residualRiskJuta} Juta (${after.riskLevel}). Pengurangan risiko ini memberikan efektivitas biaya mitigasi sebesar ${after.mitigationRoiPct}%.`,
    tryNext: 'Turunkan asuransi ke 0% untuk melihat lonjakan risiko finansial langsung ke penyelenggara.',
  }),
  visual: { archetype: 'chart', title: 'Matriks Probabilitas & Dampak Risiko Acara' },
};

// ============================================================================
// REGISTRY DICTIONARY & CATALOG EXPORT
// ============================================================================

export const GENLAB_SIMULATIONS: Record<string, ExtendedSimulationDefinition> = {
  // TRPL (7)
  'sorting-algorithms': sortingVisualizerSimulation,
  'sorting-visualizer': sortingVisualizerSimulation,
  'binary-search': binarySearchSimulation,

  'stack-queue': stackQueueSimulation,
  'algorithm-complexity': algorithmComplexitySimulation,
  'database-query': databaseQuerySimulation,
  'ip-subnet': ipSubnetSimulation,
  'logic-gates': logicGatesSimulation,

  // Akuntansi & Perpajakan (8)
  'accounting-equation': accountingEquationSimulation,
  'journal-entries': journalEntriesSimulation,
  'break-even-point': breakEvenPointSimulation,
  'hpp-calculation': hppSimulation,
  'simulasi-hpp': hppSimulation,
  'cash-flow': cashFlowSimulation,
  'tax-calculation': taxCalculationSimulation,
  'financial-ratios': financialRatiosSimulation,
  'budgeting-simulator': budgetingSimulation,
  'budgeting-variance': budgetingSimulation,

  // Manajemen Pemasaran Internasional (7)
  'marketing-funnel': marketingFunnelSimulation,
  'pricing-strategy': pricingStrategySimulation,
  'market-segmentation': marketSegmentationSimulation,
  'marketing-mix': marketingMixSimulation,
  'exchange-rate-business': exchangeRateBusinessSimulation,
  'demand-vs-price': demandVsPriceSimulation,
  'marketing-campaign': marketingCampaignSimulation,

  // Agribisnis Hortikultura (8)
  'precision-farming': precisionFarmingSimulation,
  'irrigation-simulator': irrigationSimulation,
  'greenhouse-climate': greenhouseClimateSimulation,
  'hydroponic-simulator': hydroponicSimulation,
  'hydroponic-nutrient': hydroponicSimulation,
  'plant-density': plantDensitySimulation,
  'crop-yield-estimator': cropYieldEstimatorSimulation,
  'horticulture-production-cost': horticultureProductionCostSimulation,
  'analisis-biaya-hortikultura': horticultureProductionCostSimulation,
  'agri-supply-chain': agriSupplyChainSimulation,

  // Pengelolaan Konvensi dan Acara (7)
  'event-budget': eventBudgetSimulation,
  'event-capacity-planner': eventCapacityPlannerSimulation,
  'event-capacity': eventCapacityPlannerSimulation,
  'ticket-pricing': ticketPricingSimulation,
  'event-break-even': eventBreakEvenSimulation,
  'event-timeline': eventTimelineSimulation,
  'venue-layout': venueLayoutSimulation,
  'event-risk-simulator': eventRiskSimulation,
};

export function getGenlabSimulation(slug: string): ExtendedSimulationDefinition | undefined {
  if (GENLAB_SIMULATIONS[slug]) return GENLAB_SIMULATIONS[slug];
  const normalized = slug.toLowerCase().replace(/_/g, '-');
  if (GENLAB_SIMULATIONS[normalized]) return GENLAB_SIMULATIONS[normalized];
  return undefined;
}


