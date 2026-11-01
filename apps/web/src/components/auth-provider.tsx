'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi, type UserProfile } from '@/lib/api/auth';
import { invalidateApiCache } from '@/lib/api/client';

interface AuthContextType {
  user: UserProfile | null;
  role: 'student' | 'admin';
  isLoading: boolean;
  login: (email?: string, password?: string, role?: 'student' | 'admin') => Promise<UserProfile>;
  logout: () => Promise<void>;
  switchRole: (role: 'student' | 'admin') => Promise<UserProfile>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: 'student',
  isLoading: false,
  login: async () => {
    throw new Error('AuthProvider not initialized');
  },
  logout: async () => {},
  switchRole: async () => {
    throw new Error('AuthProvider not initialized');
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial session check & bfcache protection
  useEffect(() => {
    async function initAuth() {
      try {
        let token =
          typeof window !== 'undefined'
            ? localStorage.getItem('simula_auth_token') || localStorage.getItem('genlabs_auth_token')
            : null;

        if (!token && typeof document !== 'undefined') {
          const match = document.cookie.match(/(?:^|;\s*)(?:simula_auth_token|genlabs_auth_token)=([^;]*)/);
          if (match) {
            token = decodeURIComponent(match[1]);
            try {
              localStorage.setItem('simula_auth_token', token);
              localStorage.setItem('genlabs_auth_token', token);
            } catch {}
          }
        }

        if (!token) {
          // Unauthenticated visitor: zero auto-login, strictly null, purge orphaned user storage
          if (typeof window !== 'undefined') {
            localStorage.removeItem('simula_user');
            localStorage.removeItem('genlabs_user');
          }
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Validate session against backend /api/v1/auth/me
        const data = await authApi.getMe().catch(() => null);
        if (data && data.user) {
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('simula_user', JSON.stringify(data.user));
            localStorage.setItem('genlabs_user', JSON.stringify(data.user));
          }
        } else {
          // Session expired or token invalidated
          if (typeof window !== 'undefined') {
            localStorage.removeItem('simula_auth_token');
            localStorage.removeItem('simula_user');
            localStorage.removeItem('genlabs_auth_token');
            localStorage.removeItem('genlabs_user');
            document.cookie = 'simula_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'genlabs_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'simula_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            document.cookie = 'genlabs_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          }
          setUser(null);
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('simula_auth_token');
          localStorage.removeItem('simula_user');
          localStorage.removeItem('genlabs_auth_token');
          localStorage.removeItem('genlabs_user');
          document.cookie = 'simula_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'genlabs_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'simula_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          document.cookie = 'genlabs_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    initAuth();

    // Defense against browser bfcache restoration on Back button navigation
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        const curToken = localStorage.getItem('simula_auth_token') || localStorage.getItem('genlabs_auth_token');
        if (!curToken) {
          setUser(null);
          const p = window.location.pathname;
          if (
            p.startsWith('/app') ||
            p.startsWith('/admin') ||
            p.startsWith('/history') ||
            p.startsWith('/profile') ||
            p.startsWith('/settings')
          ) {
            window.location.replace('/login');
          }
        }
      }
    };

    window.addEventListener('pageshow', onPageShow);
    return () => {
      window.removeEventListener('pageshow', onPageShow);
    };
  }, []);

  const login = useCallback(
    async (
      email?: string,
      password?: string,
      role: 'student' | 'admin' = 'student'
    ): Promise<UserProfile> => {
      setIsLoading(true);
      const targetEmail =
        email || (role === 'admin' ? 'admin@genlabs.app' : 'user@genlabs.app');
      const targetPassword = password || 'secret123';
      const targetRole = role || (targetEmail.includes('admin') ? 'admin' : 'student');

      try {
        const data = await authApi.login(targetEmail, targetPassword, targetRole);
        if (data && data.user) {
          invalidateApiCache();
          setUser(data.user);
          if (typeof window !== 'undefined') {
            localStorage.setItem('simula_user', JSON.stringify(data.user));
          }
          return data.user;
        }
        throw new Error(data?.message || 'Kredensial tidak valid.');
      } catch (err: unknown) {
        setUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('simula_user');
          localStorage.removeItem('simula_auth_token');
          localStorage.removeItem('genlabs_user');
          localStorage.removeItem('genlabs_auth_token');
        }
        const message = err instanceof Error ? err.message : 'Kredensial tidak valid.';
        throw new Error(message);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.warn('Logout notification error:', err);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('simula_auth_token');
        localStorage.removeItem('simula_user');
        localStorage.removeItem('genlabs_auth_token');
        document.cookie = 'simula_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'genlabs_auth_token=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'simula_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'genlabs_role=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        invalidateApiCache();
        // Clear all in-memory user state and navigate directly to login page
        setUser(null);
        setIsLoading(false);
        window.location.replace('/login');
      } else {
        invalidateApiCache();
        setUser(null);
        setIsLoading(false);
      }
    }
  }, []);

  const switchRole = useCallback(
    async (role: 'student' | 'admin'): Promise<UserProfile> => {
      const email = role === 'admin' ? 'admin@genlabs.app' : 'user@genlabs.app';
      return login(email, 'secret123', role);
    },
    [login]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        role: (user?.role as 'student' | 'admin') || 'student',
        isLoading,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
