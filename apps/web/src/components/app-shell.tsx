'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Navbar } from './navbar';
import { AdminSidebar } from './admin-sidebar';
import { useAuth } from './auth-provider';
import { LoadingState } from './ui/loading-state';
import { Footer } from './footer';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isLoading } = useAuth();

  // Route protection for Admin and Authenticated App routes
  useEffect(() => {
    if (!isLoading && pathname?.startsWith('/admin')) {
      if (!user) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      } else if (user.role !== 'admin') {
        router.replace('/app');
      }
    }
    if (!isLoading && (pathname === '/app' || pathname?.startsWith('/app/'))) {
      if (!user) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      } else if (user.role === 'admin') {
        router.replace('/admin');
      }
    }
    if (!isLoading && (pathname === '/history' || pathname?.startsWith('/history/') || pathname === '/profile' || pathname === '/settings')) {
      if (!user) {
        router.replace('/login?redirect=' + encodeURIComponent(pathname));
      }
    }
  }, [isLoading, user, pathname, router]);

  // 1. Public Marketing Landing Page: Standalone, distraction-free marketing website
  // (Strictly separated: NO authenticated app navbar, NO mobile app dock, NO dashboard content)
  if (pathname === '/') {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </div>
    );
  }

  // 2. Auth routes: Clean, standalone, distraction-free with global footer
  if (pathname === '/login' || pathname === '/register') {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)]">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // Authenticated App Home (/app) and protected student routes: Loading & Redirect Gate
  if (
    pathname === '/app' ||
    pathname?.startsWith('/app/') ||
    pathname === '/history' ||
    pathname?.startsWith('/history/') ||
    pathname === '/profile' ||
    pathname === '/settings'
  ) {
    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <LoadingState message="Memverifikasi izin akses..." />
        </div>
      );
    }
    if (!user) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <LoadingState message="Mengarahkan ke halaman login..." />
        </div>
      );
    }
  }

  // Admin routes loading state while authenticating
  if (isLoading && pathname?.startsWith('/admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
        <LoadingState message="Memverifikasi izin akses..." />
      </div>
    );
  }

  // 2.A Admin Simulator Editor (Edit): Dedicated full-screen laboratory workspace
  if (pathname.startsWith('/admin/modules/') && pathname.endsWith('/edit')) {
    if (!user || user.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <LoadingState message="Mengarahkan ke halaman login..." />
        </div>
      );
    }
    return <main className="h-screen w-screen overflow-hidden bg-[var(--color-bg)] text-[var(--color-text)]">{children}</main>;
  }

  // 2.B Standard Admin routes: Sleek minimal sidebar + spacious main content + footer
  if (pathname?.startsWith('/admin')) {
    if (!user || user.role !== 'admin') {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
          <LoadingState message="Mengarahkan ke halaman login..." />
        </div>
      );
    }

    return (
      <div className="min-h-screen flex flex-col md:flex-row bg-[var(--color-bg)] text-[var(--color-text)]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 p-4 sm:p-6 md:p-8 lg:p-10 max-w-[1260px] mx-auto w-full">
            {children}
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  // 3. Simulation Workspace: Dedicated full-screen laboratory canvas with footer
  if (pathname?.startsWith('/simulation/')) {
    return (
      <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    );
  }

  // 3.B Tanya AI Conversation Workspace: Fixed viewport with zero double scrollbars
  if (pathname === '/tanya-ai' || pathname === '/explore' || pathname === '/eksplorasi') {
    return (
      <div className="fixed inset-0 overflow-hidden flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]" data-lenis-prevent="true">
        <div className="shrink-0">
          <Navbar />
        </div>
        <main className="flex-1 min-h-0 overflow-hidden flex flex-col">{children}</main>
      </div>
    );
  }

  // 4. Universal Simulation Platform: Lightweight Navbar + Spacious Canvas + Global Footer
  const isFocusedWorkspace = pathname?.startsWith('/modules/') || pathname?.startsWith('/simulation/');
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
      <Navbar />
      <main className={`flex-1 ${isFocusedWorkspace ? '' : 'pb-24 md:pb-12'}`}>{children}</main>
      <Footer />
    </div>
  );
}
