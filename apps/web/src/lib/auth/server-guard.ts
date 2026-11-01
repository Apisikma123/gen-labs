import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import { SimulationStorageRepository, type User } from '@/lib/storage/session-store';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  preferences?: Record<string, unknown>;
}

export interface AuthResult {
  authenticated: boolean;
  isAdmin?: boolean;
  user?: AuthenticatedUser;
  errorResponse?: NextResponse;
}

interface ServerSession {
  token: string;
  user: AuthenticatedUser;
  createdAt: number;
  expiresAt: number;
}

// In-memory active session store (backed by server-side registry)
const serverSessions = new Map<string, ServerSession>();
// Invalidation blacklist: immediately and permanently revokes sessions on logout
const invalidatedTokens = new Set<string>();


/**
 * Register a server-side session token
 */
export function registerServerSession(token: string, user: AuthenticatedUser, ttlMs = 1000 * 60 * 60 * 24 * 7): void {
  const now = Date.now();
  invalidatedTokens.delete(token);
  serverSessions.set(token, {
    token,
    user,
    createdAt: now,
    expiresAt: now + ttlMs,
  });
}

/**
 * Retrieve session by token if still valid
 */
export function getServerSession(token: string): AuthenticatedUser | null {
  if (!token || invalidatedTokens.has(token)) return null;
  const session = serverSessions.get(token);
  if (session) {
    if (Date.now() > session.expiresAt) {
      serverSessions.delete(token);
      return null;
    }
    return session.user;
  }

  return null;
}

/**
 * Invalidate a session token on logout
 */
export function invalidateServerSession(token: string): void {
  if (token) {
    serverSessions.delete(token);
    invalidatedTokens.add(token);
  }
}

/**
 * Extract token from Authorization header or cookies
 */
export function extractTokenFromRequest(request: Request): string | null {
  // 1. Authorization: Bearer <token>
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const t = authHeader.slice(7).trim();
    if (t) return t;
  }

  // 2. Cookie header inspection
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/(?:genlabs_auth_token|simula_auth_token)=([^;]+)/);
  if (match) {
    return decodeURIComponent(match[1].trim());
  }

  return null;
}

/**
 * CSRF check for state-changing cookie-authenticated requests
 */
function isCsrfValid(request: Request, isBearerAuth: boolean): boolean {
  // Bearer tokens in Authorization header are immune to browser CSRF
  if (isBearerAuth) return true;

  const method = request.method.toUpperCase();
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true;
  }

  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!origin && !referer) {
    // Non-browser client or direct curl/test
    return true;
  }

  const checkUrl = origin || referer || '';
  try {
    const parsed = new URL(checkUrl);
    return parsed.host === host;
  } catch {
    return false;
  }
}

/**
 * Verify credentials securely against database / stored records.
 * NEVER trusts client-provided roles.
 */
export async function verifyUserCredentials(
  email: string,
  password?: string
): Promise<AuthenticatedUser | null> {
  if (!email || !password || typeof password !== 'string' || password.length === 0) {
    return null;
  }

  const cleanEmail = email.trim().toLowerCase();

  // 1. Attempt Laravel backend authentication if accessible
  const rawBackend = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const backendUrl = rawBackend.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${backendUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ email: cleanEmail, password }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        return {
          id: String(data.user.id),
          name: data.user.name,
          email: data.user.email,
          role: data.user.role === 'admin' ? 'admin' : 'student',
          avatar: data.user.avatar,
        };
      }
    }
  } catch {
    // Backend offline / connection refused
  }

  return null;
}

/**
 * Authenticate any user (student or admin)
 */
export async function authenticateUser(request: Request): Promise<AuthResult> {
  const token = extractTokenFromRequest(request);
  if (!token) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Unauthenticated. Sesi otentikasi diperlukan.',
        },
        { status: 401 }
      ),
    };
  }

  const isBearer = Boolean(request.headers.get('authorization')?.startsWith('Bearer '));
  if (!isCsrfValid(request, isBearer)) {
    return {
      authenticated: false,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Forbidden. CSRF validation failed.',
        },
        { status: 403 }
      ),
    };
  }

  // 1. Check local server session store
  const localSessionUser = getServerSession(token);
  if (localSessionUser) {
    return {
      authenticated: true,
      isAdmin: localSessionUser.role === 'admin',
      user: localSessionUser,
    };
  }

  // 2. Validate token against Laravel Sanctum if available
  const rawBackend = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  const backendUrl = rawBackend.replace(/\/api\/?$/, '').replace(/\/+$/, '');
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${backendUrl}/api/user`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const u = data.user || data;
      if (u && u.id) {
        const authedUser: AuthenticatedUser = {
          id: String(u.id),
          name: u.name,
          email: u.email,
          role: u.role === 'admin' ? 'admin' : 'student',
          avatar: u.avatar,
        };
        // Cache in server session
        registerServerSession(token, authedUser);
        return {
          authenticated: true,
          isAdmin: authedUser.role === 'admin',
          user: authedUser,
        };
      }
    }
  } catch {
    // Backend offline / connection refused
  }

  return {
    authenticated: false,
    errorResponse: NextResponse.json(
      {
        success: false,
        error: 'Unauthenticated. Token otentikasi tidak valid atau telah kedaluwarsa.',
      },
      { status: 401 }
    ),
  };
}

/**
 * Authenticate administrator strictly on server.
 * Rejects unauthenticated (401) and non-admins (403).
 */
export async function authenticateAdmin(request: Request): Promise<AuthResult> {
  const result = await authenticateUser(request);
  if (!result.authenticated || result.errorResponse) {
    return result;
  }

  if (result.user?.role !== 'admin') {
    return {
      authenticated: true,
      isAdmin: false,
      user: result.user,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Endpoint ini hanya dapat diakses oleh Administrator.',
        },
        { status: 403 }
      ),
    };
  }

  return {
    authenticated: true,
    isAdmin: true,
    user: result.user,
  };
}
