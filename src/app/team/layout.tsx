"use client";

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Wallet, List, LogOut } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function TeamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const isLoginPage = pathname === '/team/login';
  const { settings } = useData();
  const { user, loading, logout, markAsOffline } = useAuth();

  // Handle browser back button and navigation away
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (user) {
        markAsOffline();
      }
    };

    const handlePopState = () => {
      if (user) {
        markAsOffline();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [user, markAsOffline]);

  // Check if user is authenticated
  useEffect(() => {
    if (!loading && !user && !isLoginPage) {
      router.push('/team/login');
    }
  }, [user, loading, isLoginPage, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (isLoginPage) {
    return <div className="min-h-screen flex items-center justify-center p-4 bg-background">{children}</div>;
  }

  // If not logged in, don't render the team content
  if (!user) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Top Header */}
      <header className="glass sticky top-0 z-50 px-4 py-4 border-b border-border-color flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden border border-yellow-500/50">
            <Image 
              src="/logo_v2.jpg" 
              alt="TEAM EGB Logo" 
              fill 
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="font-bold text-sm text-orange-600 dark:text-yellow-500 leading-tight">Team Portal</h1>
            <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-wider">{settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0] : (settings?.festivalName || 'TEAM EGB')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => { const { logout } = useAuth(); logout(); router.push('/team/login'); }}
            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full inline-block"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4">
        {children}
      </main>

      {/* Bottom Navigation for Mobile */}
      <nav className="fixed bottom-0 left-0 w-full glass border-t border-border-color flex justify-around p-3 pb-safe z-50">
        <Link href="/team/dashboard" className={`flex flex-col items-center gap-1 ${pathname === '/team/dashboard' ? 'text-orange-600' : 'text-foreground/60'}`}>
          <Wallet size={24} />
          <span className="text-[10px] font-medium">Collect</span>
        </Link>
        <Link href="/team/my-collections" className={`flex flex-col items-center gap-1 ${pathname === '/team/my-collections' ? 'text-orange-600' : 'text-foreground/60'}`}>
          <List size={24} />
          <span className="text-[10px] font-medium">My Entries</span>
        </Link>
      </nav>
    </div>
  );
}
