/**
 * Resolves media URLs (cover images, thumbnails) for Gen Labs
 * Supports local Laravel backend uploads, Next.js rewrites, and external URLs
 */
export function resolveMediaUrl(url?: string | null): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return '';
  }

  const clean = url.trim();

  // If already absolute or data URI
  if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:') || clean.startsWith('blob:')) {
    return clean;
  }

  // If relative path starting with /uploads, return relative path so Next.js rewrite proxies it seamlessly
  if (clean.startsWith('/uploads')) {
    if (process.env.NEXT_PUBLIC_API_URL && process.env.NEXT_PUBLIC_API_URL.startsWith('http')) {
      const backendOrigin = process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, '');
      return `${backendOrigin}${clean}`;
    }
    return clean;
  }

  // If local Next.js public asset
  if (clean.startsWith('/')) {
    return clean;
  }

  return `/${clean}`;
}
