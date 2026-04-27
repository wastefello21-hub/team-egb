"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { useAuth } from '@/context/AuthContext';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate login validation
    setTimeout(() => {
      setIsLoading(false);
      // Hardcoded super admin values based on user reqs
      if (email === "wastefello23@egb" && password === 'prajwal08@egb') {
        login('SUPER-ADMIN', 'admin', 'EGB Administrator');
        router.push('/admin/dashboard');
      } else {
        setError('Invalid Admin Email or Password.');
      }
    }, 1000);
  };

  return (
    <GlassCard className="w-full max-w-md border-t-4 border-t-red-600 relative overflow-hidden">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-600 to-maroon-800 dark:from-red-400 dark:to-orange-500">
          Admin Login
        </h2>
        <p className="text-foreground/60 text-sm mt-2">Secure access to the management console</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Admin Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="example@egb"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            placeholder="••••••••"
            required
          />
        </div>
        <Button 
          type="submit" 
          variant="secondary"
          className="w-full py-3 mt-4 text-lg bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800" 
          disabled={isLoading}
        >
          {isLoading ? 'Authenticating...' : 'Secure Login'}
        </Button>
      </form>
    </GlassCard>
  );
}
