/**
 * Gen Labs AI Tutor Scope Guard & Response Validator
 * Enforces strict pedagogical boundaries: simulator-specific learning context ONLY.
 * Out-of-scope queries are rejected server-side to save tokens, latency, and cost.
 */

export interface ScopeGuardInput {
  simulatorTitle?: string;
  concept?: string;
  formula?: string;
  description?: string;
  learningObjective?: string | string[];
  parameters?: Record<string, any>;
  currentState?: Record<string, any>;
  derivedResults?: Record<string, any>;
  activeExperiment?: {
    id?: string;
    title?: string;
    targetMetric?: string;
    targetValue?: number;
    currentValue?: number;
    achieved?: boolean;
    [key: string]: any;
  };
  currentInsight?: string;
  question: string;
}

export type ScopeCategory = 'RELEVANT' | 'PARTIALLY_RELEVANT' | 'OUT_OF_SCOPE';

export interface ScopeGuardResult {
  relevant: boolean;
  category: ScopeCategory;
  reason: string;
  refusalResponse?: string;
}

// Canonical refusal responses required by Gen Labs AI Tutor Specification
export const STANDARD_REFUSAL_RESPONSE =
  'Maaf, saya hanya dapat membantu menjelaskan materi dan simulasi yang sedang Anda pelajari. Silakan ajukan pertanyaan yang berkaitan dengan simulator ini.';

export const CASUAL_CHAT_REFUSAL_RESPONSE =
  'Saya dapat membantu menjelaskan materi dan simulasi yang sedang Anda buka. Silakan tanyakan sesuatu tentang simulasi ini.';

export const PROMPT_INJECTION_REFUSAL_RESPONSE =
  'Maaf, saya hanya dapat membantu dalam konteks materi dan simulasi yang sedang digunakan.';

export const UNAVAILABLE_INFO_REFUSAL_RESPONSE =
  'Informasi tersebut tidak tersedia dalam materi simulator ini.';

// Patterns for security & prompt injection attempts
export const INJECTION_PATTERNS = [
  /(?:abaikan|ignore)\s+(?:semua\s+|all\s+)?(?:instruksi|instructions|aturan|rules)/i,
  /(?:system\s+prompt|developer\s+instruction|instruksi\s+internal|developer\s+prompt)/i,
  /(?:prompt\s+kamu|prompt\s+anda|hidden\s+context|internal\s+tools)/i,
  /(?:api[_\s-]?key|secret[_\s-]?key|kredensial|token\s+akses|env(?:ironment)?\s+var)/i,
  /(?:jadilah\s+chatgpt|act\s+as\s+chatgpt|mode\s+bebas|dan\s+mode|jailbreak)/i,
  /(?:tampilkan|berikan|bocorkan|sebutkan)\s+.*?(?:system\s+prompt|api\s*key|instruksi\s+internal)/i,
];

// Patterns for casual greetings and general chat
const CASUAL_CHAT_PATTERNS = [
  /^(?:halo|hai|hey|hello|hi|hei|pagi|siang|sore|malam)[!.,? ]*$/i,
  /^(?:siapa\s+(?:kamu|anda|dirimu)|who\s+are\s+you)[?.]*$/i,
  /^(?:ngobrol\s+dong|ayo\s+ngobrol|temani\s+ngobrol|chat\s+aja|halo\s+apa\s+kabar)[!.,? ]*$/i,
  /^(?:capek\s+nih|lelah\s+nih|bosan\s+nih|gabut\s+nih)[!.,? ]*$/i,
  /(?:kasih|beri|cerita|minta|buatkan)\s+.*?(?:jokes|lelucon|lawak|tebak-tebakan|humor|lucu)/i,
];

// Explicit request for concepts outside active simulator
const UNAVAILABLE_CONCEPT_PATTERNS = [
  /(?:konsep|materi|topik|hal)\s+(?:yang\s+)?tidak\s+ada\s+di\s+simulator/i,
  /di\s+luar\s+(?:materi|simulator|konteks\s+simulasi|pembahasan\s+simulator)/i,
];

// General off-topic topic patterns with no educational simulator relevance (Section C, D)
const OFF_TOPIC_PATTERNS = [
  /(?:siapa|nama)\s+(?:presiden|menteri|gubernur|raja|perdana\s+menteri|wakil\s+presiden)/i,
  /(?:pemilu|politik|pilkada|partai\s+politik|dpr|kabinet|pemerintahan)/i,
  /(?:resep|cara\s+(?:membuat|bikin|masak|olah))\s+.*?(?:makanan|masakan|kue|nasi\s+goreng|rendang|minuman|kopi|es\s+cendol|cendol|bakso|mie|teh)/i,
  /(?:es\s+cendol|nasi\s+goreng|resep)/i,
  /(?:bagaimana|cara)\s+(?:membuat|bikin|create|develop)\s+.*?(?:website|sistem\s+operasi|os|operating\s+system|aplikasi|game|web)/i,
  /(?:berapa|daftar)\s+harga\s+.*?(?:laptop|hp|smartphone|komputer|motor|mobil|barang)/i,
  /(?:sejarah\s+indonesia|sejarah\s+dunia|sejarah\s+perang|perang\s+dunia|revolusi\s+prancis|kemerdekaan\s+ri)/i,
  /(?:pemain\s+bola|sepak\s+bola|liga\s+champions|world\s+cup|piala\s+dunia|messi|ronaldo|klub\s+bola)/i,
  /(?:ramalan\s+zodiak|horoskop|bintang\s+kelahiran)/i,
  /(?:buatkan|tuliskan|bikin)\s+.*?(?:puisi|pantun|cerpen|lirik\s+lagu|cerita\s+cinta)/i,
  /(?:cuaca\s+(?:hari\s+ini|besok|jakarta|bandung))/i,
  /(?:rekomendasi\s+film|bioskop|aktor\s+terbaik|artis)/i,
];

// Explicit simulator-referencing terms (Must reference the active lab/simulator entity or state)
const SIMULATOR_EXPLICIT_TERMS = [
  'simulasi', 'simulator', 'lab', 'kanvas', 'slider',
  'eksperimen', 'percobaan', 'target eksperimen', 'target tantangan',
  'saat ini', 'sekarang', 'kondisi saat ini', 'nilai saat ini', 'hasil saat ini',
  'grafik ini', 'parameter ini', 'variabel ini', 'rumus ini', 'formula ini',
  'cepat', 'lambat', 'berubah', 'kenapa jadi', 'mengapa jadi', 'tantangan',
  'bagaimana jika', 'kalau',
  'sedang saya lihat', 'yang saya lihat', 'saya lihat', 'yang sedang', 'tampilan ini', 'layar ini',
];

/**
 * Normalizes text to lowercase alphanumeric tokens.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s_]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1);
}

/**
 * Extract domain and context tokens from active simulator metadata.
 */
function extractSimulatorKeywords(input: ScopeGuardInput): Set<string> {
  const keywords = new Set<string>();

  const add = (val?: any) => {
    if (!val) return;
    if (typeof val === 'string') {
      tokenize(val).forEach((t) => keywords.add(t));
    } else if (Array.isArray(val)) {
      val.forEach((item) => add(item));
    } else if (typeof val === 'object') {
      Object.keys(val).forEach((k) => {
        tokenize(k).forEach((t) => keywords.add(t));
        const v = val[k];
        if (typeof v === 'string') tokenize(v).forEach((t) => keywords.add(t));
        if (typeof v === 'object' && v !== null) {
          if (v.label) tokenize(String(v.label)).forEach((t) => keywords.add(t));
          if (v.unit) tokenize(String(v.unit)).forEach((t) => keywords.add(t));
        }
      });
    }
  };

  add(input.simulatorTitle);
  add(input.concept);
  add(input.formula);
  add(input.description);
  add(input.learningObjective);
  add(input.parameters);
  add(input.currentState);
  add(input.derivedResults);
  add(input.currentInsight);

  if (input.activeExperiment) {
    add(input.activeExperiment.title);
    add(input.activeExperiment.targetMetric);
  }

  // Common scientific / pedagogical terms related to formulas
  if (input.formula) {
    const rawTokens = input.formula.match(/[A-Za-z_]+/g) || [];
    rawTokens.forEach((t) => keywords.add(t.toLowerCase()));
  }

  // Bilingual Indonesian/English concept mapping for cross-lingual inquiries
  const textBlob = `${input.simulatorTitle || ''} ${input.concept || ''} ${input.description || ''}`.toLowerCase();
  if (textBlob.includes('supply') || textBlob.includes('demand') || textBlob.includes('pasar') || textBlob.includes('ekonomi') || textBlob.includes('economics')) {
    ['permintaan', 'penawaran', 'harga', 'kuantitas', 'ekuilibrium', 'keseimbangan', 'pasar', 'surplus', 'demand', 'supply'].forEach((k) => keywords.add(k));
  }
  if (textBlob.includes('newton') || textBlob.includes('physics') || textBlob.includes('fisika')) {
    ['gaya', 'massa', 'percepatan', 'kecepatan', 'cepat', 'lambat', 'gesek', 'hukum', 'newton', 'force', 'mass', 'accel'].forEach((k) => keywords.add(k));
  }
  if (textBlob.includes('regression') || textBlob.includes('regresi') || textBlob.includes('stat')) {
    ['regresi', 'garis', 'kemiringan', 'titik', 'sampel', 'noise', 'linear', 'korelasi', 'ols', 'kuadrat'].forEach((k) => keywords.add(k));
  }
  if (textBlob.includes('projectile') || textBlob.includes('peluru') || textBlob.includes('parabola')) {
    ['peluru', 'sudut', 'elevasi', 'parabola', 'jarak', 'jangkauan', 'puncak', 'gravitasi', 'kecepatan'].forEach((k) => keywords.add(k));
  }
  if (textBlob.includes('momentum') || textBlob.includes('tumbukan') || textBlob.includes('collision')) {
    ['momentum', 'tumbukan', 'kereta', 'elastisitas', 'lenting', 'kecepatan', 'massa'].forEach((k) => keywords.add(k));
  }

  return keywords;
}

/**
 * Deterministically checks whether a user's question is within the active simulator's scope.
 * Executes in < 1ms without external network or LLM calls.
 */
export function isQuestionInSimulatorScope(input: ScopeGuardInput): ScopeGuardResult {
  const q = (input.question || '').trim();
  if (!q) {
    return {
      relevant: false,
      category: 'OUT_OF_SCOPE',
      reason: 'Question is empty',
      refusalResponse: STANDARD_REFUSAL_RESPONSE,
    };
  }

  // 1. Prompt Injection Protection (Section 14)
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(q)) {
      return {
        relevant: false,
        category: 'OUT_OF_SCOPE',
        reason: 'Prompt injection or unauthorized system query detected',
        refusalResponse: PROMPT_INJECTION_REFUSAL_RESPONSE,
      };
    }
  }

  // 2. Casual Chat Protection (Section 13)
  for (const pattern of CASUAL_CHAT_PATTERNS) {
    if (pattern.test(q)) {
      return {
        relevant: false,
        category: 'OUT_OF_SCOPE',
        reason: 'Casual conversation out of simulator scope',
        refusalResponse: CASUAL_CHAT_REFUSAL_RESPONSE,
      };
    }
  }

  // 3. Explicit request for out-of-scope concepts (Section 7 & 16 Q9)
  for (const pattern of UNAVAILABLE_CONCEPT_PATTERNS) {
    if (pattern.test(q)) {
      return {
        relevant: false,
        category: 'OUT_OF_SCOPE',
        reason: 'Inquiry requests concepts explicitly not in simulator',
        refusalResponse: UNAVAILABLE_INFO_REFUSAL_RESPONSE,
      };
    }
  }

  const lowerQ = q.toLowerCase();

  // 4. General Off-Topic Filter (Section 5 & 16 Q4, Q5, Q6)
  let hasOffTopicMatch = false;
  for (const pattern of OFF_TOPIC_PATTERNS) {
    if (pattern.test(lowerQ)) {
      hasOffTopicMatch = true;
      break;
    }
  }

  // Extract simulator domain vocabulary
  const simKeywords = extractSimulatorKeywords(input);

  // Check overlap with simulator vocabulary
  const questionTokens = tokenize(q);
  let hasDirectDomainMatch = false;
  for (const token of questionTokens) {
    const variants = [token];
    if (token.endsWith('nya') && token.length > 5) variants.push(token.slice(0, -3));
    if (token.endsWith('kan') && token.length > 5) variants.push(token.slice(0, -3));
    if (token.endsWith('lah') && token.length > 5) variants.push(token.slice(0, -3));
    if (token.endsWith('an') && token.length > 4) variants.push(token.slice(0, -2));

    for (const v of variants) {
      if (simKeywords.has(v)) {
        hasDirectDomainMatch = true;
        break;
      }
      for (const kw of simKeywords) {
        if (kw.length >= 4 && (v.startsWith(kw) || kw.startsWith(v))) {
          hasDirectDomainMatch = true;
          break;
        }
      }
      if (hasDirectDomainMatch) break;
    }
    if (hasDirectDomainMatch) break;
  }

  // Check explicit simulator inquiry (Section 9, 10, Section E)
  // e.g. "Jelaskan kondisi saat ini", "Kenapa hasil eksperimen saya belum berhasil?"
  const hasSimulatorExplicitRef = SIMULATOR_EXPLICIT_TERMS.some((term) =>
    lowerQ.includes(term)
  );

  // If question triggered off-topic patterns:
  if (hasOffTopicMatch) {
    // If it also mentions simulator domain, it's partially relevant (Section F)
    if (hasDirectDomainMatch) {
      return {
        relevant: true,
        category: 'PARTIALLY_RELEVANT',
        reason: 'Question contains both simulator topic and off-topic parts',
      };
    }
    return {
      relevant: false,
      category: 'OUT_OF_SCOPE',
      reason: 'Question matches general off-topic query with no simulator context',
      refusalResponse: STANDARD_REFUSAL_RESPONSE,
    };
  }

  // Direct domain term match (e.g., "percepatan", "gaya", "massa", "bep", "biaya tetap")
  if (hasDirectDomainMatch) {
    return {
      relevant: true,
      category: 'RELEVANT',
      reason: 'Question directly references active simulator variables or concepts',
    };
  }

  // Explicit simulator inquiry (e.g., "Kenapa hasil eksperimen saya belum berhasil?")
  if (hasSimulatorExplicitRef) {
    return {
      relevant: true,
      category: 'RELEVANT',
      reason: 'Question references active simulator telemetry, state, or experiment progress',
    };
  }

  // If no match with simulator keywords or contextual inquiry, reject as out-of-scope
  return {
    relevant: false,
    category: 'OUT_OF_SCOPE',
    reason: 'Question does not correlate with active simulator concept, parameters, or state',
    refusalResponse: STANDARD_REFUSAL_RESPONSE,
  };
}

/**
 * Validates AI tutor response generated by the LLM.
 * Ensures no leaked system instructions, secrets, or off-scope hallucinations.
 * Section 19: AI Response Validation.
 */
export function validateAiResponse(
  response: string,
  context: ScopeGuardInput
): { valid: boolean; sanitizedAnswer: string } {
  if (!response || typeof response !== 'string') {
    return { valid: false, sanitizedAnswer: STANDARD_REFUSAL_RESPONSE };
  }

  const lower = response.toLowerCase();

  // 1. Guard against system prompt or secret leakage
  if (
    lower.includes('gen_labs_tutor_system_prompt') ||
    lower.includes('system prompt') ||
    lower.includes('system instruction') ||
    lower.includes('developer instruction') ||
    lower.includes('aizasy') ||
    lower.includes('gemini_api_key') ||
    lower.includes('api key')
  ) {
    return { valid: false, sanitizedAnswer: PROMPT_INJECTION_REFUSAL_RESPONSE };
  }

  // 2. Guard against meta AI policy declarations
  if (
    lower.includes('sebagai model bahasa') ||
    lower.includes('sebagai ai') ||
    lower.includes('kebijakan openai') ||
    lower.includes('kebijakan google')
  ) {
    return { valid: false, sanitizedAnswer: STANDARD_REFUSAL_RESPONSE };
  }

  return { valid: true, sanitizedAnswer: response };
}
