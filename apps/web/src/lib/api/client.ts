/**
 * Centralized HTTP Client for Gen Labs (Next.js Frontend -> Laravel Backend API)
 * PRD Section 17: No hardcoded URLs, unified error handling
 */

const API_BASE_URL =
  typeof window !== 'undefined'
    ? '/api'
    : (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api');

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  [key: string]: unknown;
}

export class ApiError extends Error {
  public status: number;
  public details?: unknown;

  constructor(message: string, status: number = 500, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  let token = localStorage.getItem('genlabs_auth_token') || localStorage.getItem('simula_auth_token');
  if (!token && typeof document !== 'undefined') {
    const match = document.cookie.match(/(?:^|;\s*)(?:genlabs_auth_token|simula_auth_token)=([^;]*)/);
    if (match) {
      token = decodeURIComponent(match[1]);
      try {
        localStorage.setItem('genlabs_auth_token', token);
      } catch {}
    }
  }
  return token;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
}

async function request<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  let url = endpoint;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    if (typeof window !== 'undefined') {
      // In the browser, always use relative /api path so Next.js proxies to backend seamlessly
      url = url.startsWith('/api/') ? url : `/api${url.startsWith('/') ? '' : '/'}${url}`;
    } else {
      // On the server, use absolute internal URL to backend
      const cleanEndpoint = url.startsWith('/api/') ? url.replace(/^\/api/, '') : (url.startsWith('/') ? url : `/${url}`);
      url = `${API_BASE_URL}${cleanEndpoint}`;
    }
  }

  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (!isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const isAiEndpoint = endpoint.includes('/ai/') || endpoint.includes('ai/');
  const defaultTimeout = isAiEndpoint ? 45000 : 15000;
  const timeoutMs = options.timeout ?? defaultTimeout;

  const controller = new AbortController();
  let isTimedOut = false;
  const timeoutId = setTimeout(() => {
    isTimedOut = true;
    try {
      controller.abort();
    } catch {}
  }, timeoutMs);

  if (options.signal) {
    options.signal.addEventListener('abort', () => {
      try {
        controller.abort();
      } catch {}
    });
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
      const errorMsg =
        (typeof data === 'object' && data !== null && (data.message || data.error)) ||
        `Permintaan gagal dengan status ${response.status}`;
      throw new ApiError(errorMsg, response.status, data);
    }

    return data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof ApiError) {
      throw err;
    }
    if (isTimedOut || (err instanceof Error && (err.name === 'AbortError' || err.message.toLowerCase().includes('aborted')))) {
      throw new ApiError(
        'Waktu respon server laboratorium melebihi batas waktu (timeout). Silakan periksa koneksi internet Anda dan coba lagi.',
        408,
        err
      );
    }
    // Network error / connection refused
    throw new ApiError(
      'Koneksi ke server simulasi belum terhubung. Pastikan backend Laravel sedang berjalan.',
      0,
      err
    );
  }
}

// In-memory cache for client GET requests (TTL in ms)
interface CacheEntry<T> {
  data: T;
  expires: number;
}
const getCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

export function invalidateApiCache(prefix?: string) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  for (const key of getCache.keys()) {
    if (key.includes(prefix)) {
      getCache.delete(key);
    }
  }
}

export const apiClient = {
  get: <T>(
    endpoint: string,
    headers?: Record<string, string>,
    extraOptions?: RequestInit & { ttl?: number; skipCache?: boolean }
  ) => {
    const token = getAuthToken();
    const tokenScope = token ? `auth:${token.slice(-12)}` : 'anon';
    const cleanPath = endpoint.split('?')[0];

    // Security invariant: strictly disallow caching of private user & admin state
    const isExplicitlyPrivate =
      cleanPath.startsWith('/user') ||
      cleanPath.startsWith('/admin') ||
      cleanPath.startsWith('/sessions') ||
      cleanPath.startsWith('/history') ||
      cleanPath.startsWith('/experiments') ||
      cleanPath.startsWith('/ai') ||
      cleanPath.includes('/ask') ||
      cleanPath.includes('/attempts');

    const isPublicCacheable =
      cleanPath === '/curriculum/options' ||
      cleanPath === '/modules' ||
      cleanPath.startsWith('/modules/') ||
      cleanPath.startsWith('/simulations');

    const isCacheable = !isExplicitlyPrivate && isPublicCacheable;
    const ttl = extraOptions?.ttl ?? (isCacheable ? 30000 : 0);
    const cacheKey = `${tokenScope}::${endpoint}::${headers ? JSON.stringify(headers) : ''}`;

    if (ttl > 0 && !extraOptions?.skipCache && typeof window !== 'undefined') {
      const cached = getCache.get(cacheKey);
      if (cached && cached.expires > Date.now()) {
        return Promise.resolve(cached.data as T);
      }
      if (inFlightRequests.has(cacheKey)) {
        return inFlightRequests.get(cacheKey) as Promise<T>;
      }
    }

    const reqPromise = request<T>(endpoint, { method: 'GET', headers, ...extraOptions })
      .then((data) => {
        if (ttl > 0 && typeof window !== 'undefined') {
          getCache.set(cacheKey, { data, expires: Date.now() + ttl });
        }
        inFlightRequests.delete(cacheKey);
        return data;
      })
      .catch((err) => {
        inFlightRequests.delete(cacheKey);
        throw err;
      });

    if (ttl > 0 && typeof window !== 'undefined') {
      inFlightRequests.set(cacheKey, reqPromise);
    }

    return reqPromise;
  },

  post: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) => {
    invalidateApiCache();
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(endpoint, {
      method: 'POST',
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      headers,
    });
  },

  patch: <T>(endpoint: string, body?: unknown, headers?: Record<string, string>) => {
    invalidateApiCache();
    const isFormData = typeof FormData !== 'undefined' && body instanceof FormData;
    return request<T>(endpoint, {
      method: 'PATCH',
      body: isFormData ? (body as FormData) : body ? JSON.stringify(body) : undefined,
      headers,
    });
  },

  delete: <T>(endpoint: string, options?: { headers?: Record<string, string>; body?: unknown }) => {
    invalidateApiCache();
    return request<T>(endpoint, {
      method: 'DELETE',
      headers: options?.headers,
      body: options?.body ? JSON.stringify(options.body) : undefined,
    });
  },

  getBaseUrl: () => API_BASE_URL,
};

