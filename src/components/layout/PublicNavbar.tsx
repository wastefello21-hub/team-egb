"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
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

  return (
    <nav className="fixed top-0 w-full z-50 glass border-b border-border-color">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-orange-500/50 shadow-lg shadow-orange-500/20">
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
                className={`text-sm font-medium transition-colors hover:text-orange-600 dark:hover:text-orange-400 ${
                  pathname === link.href ? 'text-orange-600 dark:text-orange-400' : 'text-foreground/80'
                }`}
              >
                {link.name}
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
              className="text-foreground hover:text-orange-600 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden glass absolute top-20 left-0 w-full border-b border-border-color shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3 flex flex-col">
            {links.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href 
                    ? 'bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400' 
                    : 'text-foreground/80 hover:bg-orange-50 dark:hover:bg-orange-900/20'
                }`}
              >
                {link.name}
              </Link>
            ))}
            <div className="mt-4 px-3 flex flex-col gap-3">
              <Link href="/team/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full">Team Login</Button>
              </Link>
              <Link href="/admin/login" onClick={() => setIsOpen(false)}>
                <Button variant="primary" className="w-full bg-red-600 hover:bg-red-700">Admin Portal</Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
