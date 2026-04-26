import React from 'react';
import { PublicNavbar } from '@/components/layout/PublicNavbar';

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <PublicNavbar />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <footer className="glass mt-20 py-8 border-t border-border-color">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-foreground/70 font-medium">
            © {new Date().getFullYear()} TEAM EGB Ganesha Festival. All rights reserved.
          </p>
          <p className="text-sm mt-2 text-foreground/50">
            Devotion • Faith • Trust
          </p>
        </div>
      </footer>
    </div>
  );
}
