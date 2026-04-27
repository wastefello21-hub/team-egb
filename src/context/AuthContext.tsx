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
  login: (teamMemberId: string, role: 'admin' | 'team', name: string) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTeam: false,
  login: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Look up who logged in from sessionStorage
    const storedUser = sessionStorage.getItem('egb_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Default to nothing until logged in properly
      setUser(null);
    }
    setLoading(false);
  }, []);

  const login = (teamMemberId: string, role: 'admin' | 'team', name: string) => {
    const newUser: AppUser = {
      uid: teamMemberId,
      email: `${teamMemberId}@egb`,
      displayName: name,
      role: role,
      teamMemberId: teamMemberId,
      name: name,
    };
    setUser(newUser);
    sessionStorage.setItem('egb_auth_user', JSON.stringify(newUser));
  };

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTeam, login }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
