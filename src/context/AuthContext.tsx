"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  role?: 'admin' | 'team';
  teamMemberId?: string;
  name?: string;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  isAdmin: boolean;
  isTeam: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTeam: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock authentication: Automatically log in as Admin for preview purposes
    const mockUser: AppUser = {
      uid: 'admin-mock-id',
      email: 'wastefello23@egb',
      displayName: 'EGB Admin',
      role: 'admin',
      name: 'EGB Administrator',
    };
    
    // Simulate a short loading delay for realistic feel
    const timer = setTimeout(() => {
      setUser(mockUser);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTeam }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
