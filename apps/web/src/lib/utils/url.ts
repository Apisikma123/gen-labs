/**
 * Safe URL validation utility for GEN LABS.
 * Prevents XSS, script injection, and malicious protocol handlers.
 */
export function isSafeUrl(url: string | null | undefined): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();

  // Block javascript:, data:, vbscript:, and file: schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('file:')
  ) {
    return false;
  }

  // Safe relative paths starting with / (excluding // protocol-relative URLs)
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return true;
  }

  // Safe anchor tags
  if (trimmed.startsWith('#')) {
    return true;
  }

  // Absolute http/https URLs
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

/**
 * Normalizes DOI or external search links for secure display.
 */
export function sanitizeExternalUrl(url: string | null | undefined): string {
  if (!isSafeUrl(url)) {
    return '#';
  }
  return (url || '').trim();
}
