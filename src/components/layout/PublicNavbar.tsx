"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Home, CalendarDays, Camera, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useData } from '@/context/DataContext';
import Image from 'next/image';
import { ThemeToggle } from '@/components/ThemeToggle';

export const PublicNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { settings } = useData();

  const links = [
    { name: 'Home', href: '/' },
    { name: 'Events', href: '/events' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Contributors', href: '/contributors' },
    { name: 'Expenditure', href: '/expenditure' },
    { name: 'Gallery', href: '/gallery' },
    { name: 'Suggestions', href: '/suggestions' },
    { name: 'About', href: '/about' },
  ];

  const quickLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: CalendarDays },
    { name: 'Gallery', href: '/gallery', icon: Camera },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border-color shadow-lg shadow-black/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-lg shadow-orange-500/20 ring-1 ring-white/30">
                <Image 
                  src="/logo_v2.jpg" 
                  alt="TEAM EGB Logo" 
                  fill 
                  className="object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-yellow-400 dark:to-orange-500">
                  {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
                </h1>
                <p className="text-[10px] font-bold text-orange-800 dark:text-yellow-500 uppercase tracking-[0.2em]">
                  {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi'}
                </p>
              </div>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-all duration-300 hover:text-orange-600 dark:hover:text-orange-400 relative group ${
                  pathname === link.href ? 'text-orange-600 dark:text-orange-400' : 'text-foreground/80'
                }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-orange-500 transition-all duration-300 ${pathname === link.href ? 'w-full' : 'w-0 group-hover:w-full'}`} />
              </Link>
            ))}
            <div className="flex gap-3 items-center">
              <ThemeToggle />
              <Link href="/team/login">
                <Button variant="outline" size="sm">Team Login</Button>
              </Link>
              <Link href="/admin/login">
                <Button variant="primary" size="sm" className="hidden sm:inline-flex">Admin Portal</Button>
              </Link>
            </div>
          </div>

          <div className="flex md:hidden items-center gap-4">
            <ThemeToggle />
              <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:text-orange-600 focus:outline-none transition-transform duration-300 hover:scale-105"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div 
        className={`md:hidden absolute top-20 left-0 w-full bg-white/95 dark:bg-neutral-950/95 backdrop-blur-2xl border-b border-border-color shadow-2xl z-50 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium transition-all duration-300 hover:translate-x-1 ${
                  pathname === link.href 
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-yellow-400' 
                    : 'text-neutral-700 dark:text-neutral-200 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 px-3 flex flex-col gap-3">
              <Link href="/team/login" onClick={() => setIsOpen(false)}>
                  <Button variant="outline" className="w-full transition-all duration-300 hover:scale-[1.02]">Team Login</Button>
              </Link>
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-[1.02]">Admin Portal</Button>
              </Link>
            </div>
        </div>
      </div>

      <div className="fixed bottom-4 left-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 md:hidden">
        <div className="glass rounded-2xl border border-border-color shadow-2xl shadow-black/10 px-2 py-2">
          <div className="grid grid-cols-4 gap-1">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              const active = pathname === link.href;

              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all duration-300 ${
                    active
                      ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300'
                      : 'text-foreground/70 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{link.name}</span>
                </Link>
              );
            })}

            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition-all duration-300 ${
                isOpen
                  ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                  : 'text-foreground/70 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-900/20'
              }`}
              aria-label="Open navigation menu"
            >
              <MoreHorizontal className="h-4 w-4" />
              <span>Menu</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
