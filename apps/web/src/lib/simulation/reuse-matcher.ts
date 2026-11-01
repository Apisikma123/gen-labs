/**
 * GEN LABS — Reuse-First Simulation Matcher
 * 
 * Verifies whether a learner's prompt sufficiently matches an existing,
 * validated scientific simulation before triggering custom generation.
 * 
 * Architectural Invariant:
 * Minimum matching confidence threshold = 0.65.
 * Never invent catalog entries or report false confidence.
 */

import { MASTER_SIMULATION_CATALOG } from '@genlab/simulation-core';
import type { SimulationCatalogItem } from '@genlab/simulation-types';
import { tokenizeText, stringSimilarity, levenshteinDistance } from '@/lib/search/fuzzy-search';

export interface ReuseMatchResult {
  matchFound: boolean;
  confidence: number; // 0.00 to 1.00
  simulation?: SimulationCatalogItem;
  reason: string;
  matchedKeywords: string[];
}

/**
 * Standard Indonesian stop words for educational query parsing
 */
const QUERY_STOP_WORDS = new Set([
  'dan', 'atau', 'di', 'dari', 'ke', 'untuk', 'dengan', 'pada', 'yang', 'ini', 'itu',
  'saya', 'mau', 'ingin', 'belajar', 'tentang', 'apa', 'bagaimana', 'dong', 'kah',
  'simulasi', 'simulator', 'eksperimen', 'praktikum', 'uji', 'coba', 'buat', 'buatkan',
  'bikin', 'tolong', 'tampilkan', 'lihat', 'model', 'alat'
]);

/**
 * Evaluates whether an existing catalog simulation matches the user prompt.
 */
export function findReusableSimulation(
  prompt: string,
  threshold = 0.65
): ReuseMatchResult {
  const cleanPrompt = (prompt || '').trim();
  if (!cleanPrompt) {
    return {
      matchFound: false,
      confidence: 0,
      reason: 'Prompt kosong.',
      matchedKeywords: [],
    };
  }

  // Tokenize user prompt and filter stopwords
  const rawTokens = tokenizeText(cleanPrompt);
  const userTokens = rawTokens.filter((t) => !QUERY_STOP_WORDS.has(t) && t.length > 2);

  if (userTokens.length === 0) {
    return {
      matchFound: false,
      confidence: 0,
      reason: 'Prompt tidak memiliki kata kunci sains yang spesifik.',
      matchedKeywords: [],
    };
  }

  let bestSim: SimulationCatalogItem | null = null;
  let bestConfidence = 0;
  let bestMatchedKeywords: string[] = [];
  let bestReason = '';

  for (const sim of MASTER_SIMULATION_CATALOG) {
    // Collect all searchable texts from the catalog item
    const titleTokens = tokenizeText(sim.title);
    const slugTokens = tokenizeText(sim.slug);
    const tagsTokens = (sim.tags || []).flatMap((t) => tokenizeText(t));
    const descTokens = tokenizeText(sim.description || '');
    const formulaTokens = tokenizeText(sim.formula || '');
    const objectiveTokens = (sim.learningObjectives || []).flatMap((o) => tokenizeText(o));

    let matchedCount = 0;
    const currentMatchedKeywords: string[] = [];
    let tokenScoreSum = 0;

    for (const qToken of userTokens) {
      let maxTokenScore = 0;
      let matchedWord = '';

      // 1. Direct title or tag match (weight: 1.0)
      for (const w of [...titleTokens, ...tagsTokens, ...slugTokens]) {
        if (qToken === w) {
          maxTokenScore = 1.0;
          matchedWord = w;
          break;
        }
        const simScore = stringSimilarity(qToken, w);
        if (simScore > 0.8 && simScore > maxTokenScore) {
          maxTokenScore = simScore * 0.95;
          matchedWord = w;
        }
      }

      // 2. Formula match (weight: 0.9)
      if (maxTokenScore < 0.8) {
        for (const w of formulaTokens) {
          if (qToken === w) {
            maxTokenScore = Math.max(maxTokenScore, 0.9);
            matchedWord = w;
            break;
          }
        }
      }

      // 3. Description & objectives match (weight: 0.7)
      if (maxTokenScore < 0.7) {
        for (const w of [...descTokens, ...objectiveTokens]) {
          if (qToken === w) {
            maxTokenScore = Math.max(maxTokenScore, 0.75);
            matchedWord = w;
            break;
          }
          const simScore = stringSimilarity(qToken, w);
          if (simScore > 0.85 && simScore * 0.7 > maxTokenScore) {
            maxTokenScore = simScore * 0.7;
            matchedWord = w;
          }
        }
      }

      if (maxTokenScore >= 0.6) {
        matchedCount++;
        tokenScoreSum += maxTokenScore;
        if (matchedWord && !currentMatchedKeywords.includes(matchedWord)) {
          currentMatchedKeywords.push(matchedWord);
        }
      }
    }

    if (matchedCount > 0) {
      // Confidence combines token match ratio and average token match score
      const matchRatio = matchedCount / userTokens.length;
      const avgScore = tokenScoreSum / userTokens.length;
      
      // Calculate normalized confidence in [0, 1]
      // A strong match requires both good coverage of user intent and strong token similarity
      let confidence = (matchRatio * 0.6) + (avgScore * 0.4);

      // Boost if exact title match or key scientific concept matches directly
      const promptLower = cleanPrompt.toLowerCase();
      if (promptLower.includes(sim.title.toLowerCase()) || promptLower.includes(sim.slug.replace(/-/g, ' '))) {
        confidence = Math.min(1.0, confidence + 0.25);
      }

      // Round to 2 decimal places
      confidence = Math.round(confidence * 100) / 100;

      if (confidence > bestConfidence) {
        bestConfidence = confidence;
        bestSim = sim;
        bestMatchedKeywords = currentMatchedKeywords;
        bestReason = `Cocok dengan modul "${sim.title}" (${sim.discipline}) dengan cakupan konsep ${Math.round(confidence * 100)}%.`;
      }
    }
  }

  const matchFound = bestConfidence >= threshold;

  return {
    matchFound,
    confidence: bestConfidence,
    simulation: bestSim || undefined,
    reason: matchFound
      ? bestReason
      : bestSim
      ? `Relevansi kandidat terdekat "${bestSim.title}" (${Math.round(bestConfidence * 100)}%) berada di bawah ambang batas reuse 65%.`
      : 'Tidak ditemukan modul katalog yang serupa.',
    matchedKeywords: bestMatchedKeywords,
  };
}
