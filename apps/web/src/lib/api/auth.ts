import { apiClient } from './client';

export interface UserProfile {
  id: string | number;
  name: string;
  email: string;
  role: 'student' | 'admin';
  avatar?: string;
  preferences?: Record<string, unknown>;
  created_at?: string;
}

export interface AuthResponse {
  success: boolean;
  user: UserProfile;
  token?: string;
  message?: string;
}

export function setAuthCookies(token?: string, role?: string) {
  if (typeof document === 'undefined') return;
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  if (token) {
    document.cookie = `simula_auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
    document.cookie = `genlabs_auth_token=${encodeURIComponent(token)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
  }
  if (role) {
    document.cookie = `simula_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
    document.cookie = `genlabs_role=${encodeURIComponent(role)}; path=/; max-age=2592000; SameSite=Lax${secureFlag}`;
  }
}

export function clearAuthCookies() {
  if (typeof document === 'undefined') return;
  const secureFlag = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : '';
  const cookieNames = [
    'simula_auth_token',
    'genlabs_auth_token',
    'simula_role',
    'genlabs_role',
    'simula_user_id',
    'genlabs_user_id',
  ];
  const paths = ['/', '/app', '/admin', '/history', '/profile', '/settings'];
  for (const name of cookieNames) {
    for (const p of paths) {
      document.cookie = `${name}=; path=${p}; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secureFlag}`;
    }
  }
}

export const authApi = {
  login: async (
    email: string,
    password: string,
    role?: 'student' | 'admin'
  ): Promise<AuthResponse> => {
    try {
      const res = await apiClient.post<AuthResponse>('/auth/login', {
        email,
        password,
        role,
      });
      if (res.token && typeof window !== 'undefined') {
        localStorage.setItem('simula_auth_token', res.token);
        localStorage.setItem('genlabs_auth_token', res.token);
        setAuthCookies(res.token, res.user?.role);
      }
      if (res.user && typeof window !== 'undefined') {
        localStorage.setItem('simula_user', JSON.stringify(res.user));
        localStorage.setItem('genlabs_user', JSON.stringify(res.user));
      }
      return res;
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Autentikasi gagal. Periksa email dan kata sandi Anda.';
      throw new Error(errorMsg);
    }
  },

  register: async (
    name: string,
    email: string,
    password: string,
    role: 'student' | 'admin' = 'student'
  ): Promise<AuthResponse> => {
    const res = await apiClient.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
      role,
    });
    if (res.token && typeof window !== 'undefined') {
      localStorage.setItem('simula_auth_token', res.token);
      localStorage.setItem('genlabs_auth_token', res.token);
      setAuthCookies(res.token, res.user?.role);
    }
    if (res.user && typeof window !== 'undefined') {
      localStorage.setItem('simula_user', JSON.stringify(res.user));
      localStorage.setItem('genlabs_user', JSON.stringify(res.user));
    }
    return res;
  },

  logout: async (): Promise<{ success: boolean; message?: string }> => {
    try {
      // 1. Invalidate Next.js edge route session and clear edge cookies
      await fetch('/api/v1/auth/logout', { method: 'POST', credentials: 'include' }).catch(() => {});
      // 2. Notify backend Laravel endpoint if active
      const res = await apiClient.post<{ success: boolean; message?: string }>('/auth/logout').catch(() => ({ success: true }));
      if (typeof window !== 'undefined') {
        localStorage.removeItem('simula_auth_token');
        localStorage.removeItem('simula_user');
        localStorage.removeItem('genlabs_auth_token');
        localStorage.removeItem('genlabs_user');
        sessionStorage.clear();
        clearAuthCookies();
      }
      return res;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('simula_auth_token');
        localStorage.removeItem('simula_user');
        localStorage.removeItem('genlabs_auth_token');
        localStorage.removeItem('genlabs_user');
        sessionStorage.clear();
        clearAuthCookies();
      }
      return { success: true };
    }
  },

  getMe: async (): Promise<{ success: boolean; user: UserProfile | null }> => {
    let token = typeof window !== 'undefined' ? localStorage.getItem('simula_auth_token') || localStorage.getItem('genlabs_auth_token') : null;
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)(?:simula_auth_token|genlabs_auth_token)=([^;]*)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token) {
      return { success: false, user: null };
    }

    if (token.startsWith('mock_')) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('simula_auth_token');
        localStorage.removeItem('simula_user');
        localStorage.removeItem('genlabs_auth_token');
        localStorage.removeItem('genlabs_user');
      }
      clearAuthCookies();
      return { success: false, user: null };
    }

    try {
      const res = await apiClient.get<UserProfile | { success: boolean; user: UserProfile }>('/user');
      if ('user' in res) {
        return { success: true, user: res.user };
      }
      return { success: true, user: res as UserProfile };
    } catch {
      return { success: false, user: null };
    }
  },
};
