import type { AiProvider } from './types';
import { GeminiProvider } from './gemini-provider';
import { MockAiProvider } from './mock-provider';

export * from './types';
export * from './validator';
export * from './config';
export * from './gemini-provider';
export * from './mock-provider';
export * from './scope-guard';
export * from './protection';

let activeProvider: AiProvider | null = null;

export function setAiProvider(provider: AiProvider | null): void {
  activeProvider = provider;
}

/**
 * Returns the active AI Provider.
 * Architecture: GeminiProvider is the primary active provider.
 * Does NOT fallback silently to fake AI.
 */
export function getAiProvider(): AiProvider {
  if (activeProvider) return activeProvider;
  if (process.env.AI_PROVIDER === 'mock') {
    return new MockAiProvider();
  }
  activeProvider = new GeminiProvider();
  return activeProvider;
}
