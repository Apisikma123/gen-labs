import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * GEN LABS — Enterprise Security Edge Middleware / Proxy
 * Enforces strict authentication, server-verified token validation,
 * explicit public allowlist, and server-side RBAC.
 */

interface VerifiedUser {
  id: string | number;
  name?: string;
  email: string;
  role: string;
  status?: string;
}

/**
 * Clear cached token entry (no-op since validation is real-time per request)
 */
export function invalidateEdgeTokenCache(_token?: string): void {
  // Real-time zero-trust model: token verification is real-time without stale cache
}

/**
 * Check if the request path matches an allowed public resource.
 * Strict Allowlist Model: Any path not explicitly on this list is private.
 */
function isPublicPath(pathname: string): boolean {
  // 1. Static Next.js and assets
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname === '/favicon.ico' ||
    pathname === '/icon.svg' ||
    pathname === '/site.webmanifest' ||
    pathname === '/robots.txt' ||
    pathname === '/sitemap.xml' ||
    /\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2|css|js|map|json|txt|xml)$/i.test(pathname)
  ) {
    return true;
  }

  // 2. Public web pages (Strict Allowlist: Tanya AI /tanya-ai & /explore are private)
  if (
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/not-found' ||
    pathname === '/prototype' ||
    pathname.startsWith('/prototype/')
  ) {
    return true;
  }

  // 3. Explicitly public API endpoints
  if (
    pathname === '/api/auth/login' ||
    pathname === '/api/auth/register' ||
    pathname === '/api/simulations' ||
    pathname === '/api/simulations/search' ||
    pathname === '/api/modules' ||
    pathname === '/api/curriculum/options' ||
    pathname.startsWith('/uploads/')
  ) {
    return true;
  }

  return false;
}

// In-flight token verification deduplication map (SingleFlight pattern)
// Prevents thundering herd on concurrent bursts while maintaining ZERO stale cache window.
const inFlightVerifications = new Map<string, Promise<{ valid: boolean; user?: VerifiedUser }>>();

/**
 * Verify token with Laravel Sanctum backend (in-flight deduplicated, real-time zero-delay)
 */
async function verifyTokenWithBackend(token: string): Promise<{ valid: boolean; user?: VerifiedUser }> {
  const existing = inFlightVerifications.get(token);
  if (existing) {
    return existing;
  }

  const promise = (async () => {
    const backendBase =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      'http://127.0.0.1:8000';
    const cleanBase = backendBase.replace(/\/api\/?$/, '').replace(/\/+$/, '');
    const targetUrl = `${cleanBase}/api/user`;

    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 2000);

      const res = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok) {
        const data = await res.json().catch(() => null);
        const user = data?.user || data;
        if (user && user.id) {
          const verified: VerifiedUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role === 'admin' ? 'admin' : 'student',
            status: user.status || 'active',
          };
          return { valid: true, user: verified };
        }
      }

      return { valid: false };
    } catch {
      // Backend offline / network error: fail closed
      return { valid: false };
    } finally {
      // Clean up in-flight promise immediately upon completion so subsequent requests re-verify in real-time
      inFlightVerifications.delete(token);
    }
  })();

  inFlightVerifications.set(token, promise);
  return promise;
}

/**
 * Helper to remove auth cookies from a response
 */
function purgeAuthCookies(response: NextResponse) {
  const cookieNames = [
    'genlabs_auth_token',
    'simula_auth_token',
    'genlabs_role',
    'simula_role',
    'genlabs_user_id',
    'simula_user_id',
  ];
  for (const name of cookieNames) {
    response.cookies.delete(name);
    // Explicitly set expired cookie to overwrite in browser
    response.cookies.set(name, '', {
      path: '/',
      maxAge: 0,
      expires: new Date(0),
      sameSite: 'lax',
    });
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApi = pathname.startsWith('/api/');

  // ── Extract Token from Cookie or Bearer Header ──
  const tokenCookie =
    request.cookies.get('genlabs_auth_token')?.value ||
    request.cookies.get('simula_auth_token')?.value;
  const authHeader = request.headers.get('authorization');
  let token = tokenCookie;
  if (!token && authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7).trim();
  }

  // ── 1. PUBLIC PATH HANDLING ──
  if (isPublicPath(pathname)) {
    // If authenticated user visits login or register, redirect to appropriate home
    if ((pathname === '/login' || pathname === '/register') && token) {
      const auth = await verifyTokenWithBackend(token);
      if (auth.valid && auth.user) {
        const dest = auth.user.role === 'admin' ? '/admin' : '/app';
        return NextResponse.redirect(new URL(dest, request.url));
      }
    }

    return NextResponse.next();
  }

  // ── 2. PRIVATE PATH: AUTHENTICATION CHECK ──
  if (!token) {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthenticated. Sesi login diperlukan untuk mengakses endpoint ini.',
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const res = NextResponse.redirect(loginUrl);
    purgeAuthCookies(res);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  // ── 3. SERVER-SIDE TOKEN VERIFICATION ──
  const auth = await verifyTokenWithBackend(token);

  if (!auth.valid || !auth.user) {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthenticated. Sesi otentikasi tidak valid atau telah kedaluwarsa.',
        },
        {
          status: 401,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    loginUrl.searchParams.set('error', 'session_expired');
    const res = NextResponse.redirect(loginUrl);
    purgeAuthCookies(res);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  const user = auth.user;

  // ── 4. ACCOUNT STATUS CHECK ──
  if (user.status === 'inactive') {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akun Anda berstatus nonaktif. Silakan hubungi Administrator.',
        },
        { status: 403 }
      );
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'account_inactive');
    const res = NextResponse.redirect(loginUrl);
    purgeAuthCookies(res);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  // ── 5. ROLE-BASED ACCESS CONTROL (RBAC) ──
  const isAdminPath =
    pathname === '/admin' ||
    pathname.startsWith('/admin/') ||
    pathname.startsWith('/api/admin/') ||
    pathname.startsWith('/api/v1/admin/');

  if (isAdminPath && user.role !== 'admin') {
    if (isApi) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses ditolak. Endpoint administratif hanya dapat diakses oleh Administrator.',
        },
        {
          status: 403,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
            Pragma: 'no-cache',
          },
        }
      );
    }

    // Redirect unauthorized student to /app with alert
    const appUrl = new URL('/app', request.url);
    appUrl.searchParams.set('error', 'unauthorized_admin');
    const res = NextResponse.redirect(appUrl);
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    return res;
  }

  // ── 6. FORWARD TO ROUTE WITH VERIFIED HEADERS & ANTI-CACHE ──
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(user.id));
  requestHeaders.set('x-user-role', user.role);
  requestHeaders.set('x-user-email', user.email);

  if (!authHeader && token) {
    requestHeaders.set('authorization', `Bearer ${token}`);
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // Strict anti-cache headers for all authenticated pages & endpoints
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, icon.svg, site.webmanifest
     * - Static asset file extensions
     */
    '/((?!_next/static|_next/image|favicon\\.ico|icon\\.svg|site\\.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|woff|woff2|css|js|map|json)$).*)',
  ],
};

export { proxy as middleware };
