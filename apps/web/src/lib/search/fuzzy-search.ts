/**
 * GEN LABS — High-Performance Native Fuzzy Search Engine
 * Zero external dependencies. Designed for Indonesian & scientific educational queries.
 * Handles typos, character transpositions, abbreviations, and prefix matches.
 */

import type { ModuleModel } from '@/lib/api/modules';

/**
 * Standard Indonesian and English stop words to avoid biasing multi-word searches.
 */
const SEARCH_STOP_WORDS = new Set([
  'dan', 'atau', 'di', 'dari', 'ke', 'untuk', 'dengan', 'pada', 'yang', 'ini', 'itu',
  'saya', 'mau', 'ingin', 'belajar', 'tentang', 'apa', 'bagaimana', 'dong', 'kah',
  'and', 'or', 'in', 'of', 'to', 'for', 'with', 'on', 'the', 'a', 'an'
]);

/**
 * Fast Levenshtein distance using 2-row iterative algorithm.
 * O(min(m, n)) space complexity, highly optimized for V8.
 */
export function levenshteinDistance(s1: string, s2: string): number {
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

  let prevRow = new Array<number>(aLen + 1);
  let currRow = new Array<number>(aLen + 1);

  for (let i = 0; i <= aLen; i++) {
    prevRow[i] = i;
  }

  for (let j = 1; j <= bLen; j++) {
    currRow[0] = j;
    const bChar = b.charCodeAt(j - 1);

    for (let i = 1; i <= aLen; i++) {
      const aChar = a.charCodeAt(i - 1);
      const cost = aChar === bChar ? 0 : 1;

      currRow[i] = Math.min(
        currRow[i - 1] + 1,       // insertion
        prevRow[i] + 1,           // deletion
        prevRow[i - 1] + cost     // substitution
      );
    }

    const temp = prevRow;
    prevRow = currRow;
    currRow = temp;
  }

  return prevRow[aLen];
}

/**
 * Normalized string similarity score between 0.0 (completely dissimilar) and 1.0 (identical).
 */
export function stringSimilarity(s1: string, s2: string): number {
  if (s1 === s2) return 1.0;
  const maxLen = Math.max(s1.length, s2.length);
  if (maxLen === 0) return 1.0;
  const dist = levenshteinDistance(s1, s2);
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Clean and normalize text into searchable tokens.
 */
export function tokenizeText(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s=²^]/gu, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 0);
}

export interface FuzzyMatchResult {
  isMatch: boolean;
  score: number;
  highlightWords: string[];
}

/**
 * Match a single search token against a candidate target word.
 */
function scoreTokenAgainstWord(token: string, word: string): number {
  if (token === word) return 1.0;

  // Exact substring / prefix
  if (word.startsWith(token)) {
    return 0.85 + Math.min(0.1, (token.length / word.length) * 0.1);
  }
  if (word.includes(token)) {
    return 0.75 + Math.min(0.1, (token.length / word.length) * 0.1);
  }
  if (token.includes(word) && word.length >= 3) {
    return 0.70;
  }

  // Fuzzy Levenshtein match with length-adjusted tolerances
  const tLen = token.length;
  const wLen = word.length;
  const lenDiff = Math.abs(tLen - wLen);

  if (lenDiff > 3) return 0;

  const dist = levenshteinDistance(token, word);

  // For short tokens (3-4 chars), max allowed distance is 1
  if (tLen <= 4 && dist <= 1) {
    return 0.80;
  }
  // For medium tokens (5-7 chars), distance 1 => 0.82, distance 2 => 0.68
  if (tLen >= 5 && tLen <= 7) {
    if (dist <= 1) return 0.84;
    if (dist === 2) return 0.68;
  }
  // For long tokens (8+ chars), distance <= 2 is acceptable
  if (tLen >= 8) {
    if (dist <= 1) return 0.88;
    if (dist <= 2) return 0.72;
    if (dist === 3 && tLen >= 10) return 0.60;
  }

  return 0;
}

export interface FuzzySearchableItem {
  title?: string | null;
  description?: string | null;
  discipline?: string | null;
  topic?: string | null;
  slug?: string | null;
  tags?: string[] | null;
  [key: string]: any;
}

/**
 * Score a query against an item's textual fields with semantic weights.
 */
export function scoreModule(mod: FuzzySearchableItem, query: string): FuzzyMatchResult {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) {
    return { isMatch: true, score: 1.0, highlightWords: [] };
  }

  const queryTokens = tokenizeText(cleanQuery).filter(
    (t) => !SEARCH_STOP_WORDS.has(t) || cleanQuery.split(/\s+/).length === 1
  );

  if (queryTokens.length === 0) {
    return { isMatch: true, score: 0.5, highlightWords: [] };
  }

  const title = (mod.title || '').toLowerCase();
  const desc = (mod.description || '').toLowerCase();
  const disc = (mod.discipline || '').toLowerCase();
  const topic = (mod.topic || '').toLowerCase();
  const slug = (mod.slug || '').toLowerCase().replace(/[-_]/g, ' ');

  // Direct exact full phrase hit in title (immediate top tier match)
  if (title.includes(cleanQuery)) {
    return { isMatch: true, score: 10.0 + (cleanQuery.length / (title.length + 1)), highlightWords: [cleanQuery] };
  }
  if (slug.includes(cleanQuery)) {
    return { isMatch: true, score: 8.0, highlightWords: [cleanQuery] };
  }

  const titleTokens = tokenizeText(title);
  const slugTokens = tokenizeText(slug);
  const discTokens = tokenizeText(disc);
  const topicTokens = tokenizeText(topic);
  const descTokens = tokenizeText(desc);

  let cumulativeScore = 0;
  let matchedTokensCount = 0;
  const highlightWords: string[] = [];

  for (const qToken of queryTokens) {
    let bestTokenScore = 0;
    let bestMatchedWord = '';

    // Check title (weight: 4.0)
    for (const w of titleTokens) {
      const s = scoreTokenAgainstWord(qToken, w);
      if (s > bestTokenScore) {
        bestTokenScore = s * 4.0;
        bestMatchedWord = w;
      }
    }

    // Check slug (weight: 3.0)
    for (const w of slugTokens) {
      const s = scoreTokenAgainstWord(qToken, w);
      if (s * 3.0 > bestTokenScore) {
        bestTokenScore = s * 3.0;
        bestMatchedWord = w;
      }
    }

    // Check topic & discipline (weight: 2.0)
    for (const w of [...topicTokens, ...discTokens]) {
      const s = scoreTokenAgainstWord(qToken, w);
      if (s * 2.0 > bestTokenScore) {
        bestTokenScore = s * 2.0;
        bestMatchedWord = w;
      }
    }

    // Check description (weight: 1.0)
    for (const w of descTokens) {
      const s = scoreTokenAgainstWord(qToken, w);
      if (s * 1.0 > bestTokenScore) {
        bestTokenScore = s * 1.0;
        bestMatchedWord = w;
      }
    }

    // Threshold for accepting token hit: 0.65 normalized (scaled by minimum 1.0 weight)
    if (bestTokenScore >= 0.65) {
      matchedTokensCount++;
      cumulativeScore += bestTokenScore;
      if (bestMatchedWord && !highlightWords.includes(bestMatchedWord)) {
        highlightWords.push(bestMatchedWord);
      }
    }
  }

  // To qualify as a match, at least 60% of non-stop-word query tokens must match
  const matchRatio = matchedTokensCount / queryTokens.length;
  const isMatch = matchRatio >= 0.6 || (queryTokens.length === 1 && matchedTokensCount === 1);

  return {
    isMatch,
    score: isMatch ? cumulativeScore * matchRatio : 0,
    highlightWords,
  };
}

/**
 * Filter and sort items (modules, simulations, catalog items) using fuzzy search scoring.
 * Preserves stable sorting for equal scores.
 */
export function fuzzyFilterAndRank<T extends FuzzySearchableItem>(
  items: T[],
  query: string,
  minScore = 0.6
): T[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return items;
  }

  const scored: Array<{ item: T; score: number }> = [];

  for (const item of items) {
    const res = scoreModule(item, trimmed);
    if (res.isMatch && res.score >= minScore) {
      scored.push({ item, score: res.score });
    }
  }

  // Sort descending by match score
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.item);
}

export const fuzzyFilterAndRankModules = fuzzyFilterAndRank;
