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
  activeMembers: string[];
  login: (teamMemberId: string, role: 'admin' | 'team', name: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAdmin: false,
  isTeam: false,
  activeMembers: [],
  login: () => {},
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMembers, setActiveMembers] = useState<string[]>([]);

  useEffect(() => {
    // Look up who logged in from sessionStorage
    const storedUser = sessionStorage.getItem('egb_auth_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Default to nothing until logged in properly
      setUser(null);
    }

    // Load active members from localStorage
    const storedActive = localStorage.getItem('egb_active_members');
    if (storedActive) {
      try {
        setActiveMembers(JSON.parse(storedActive));
      } catch (e) {
        setActiveMembers([]);
      }
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

    // Add to active members
    const updatedActive = [...activeMembers, teamMemberId];
    setActiveMembers(updatedActive);
    localStorage.setItem('egb_active_members', JSON.stringify(updatedActive));
  };

  const logout = () => {
    const memberId = user?.teamMemberId;
    setUser(null);
    sessionStorage.removeItem('egb_auth_user');

    // Remove from active members
    if (memberId) {
      const updatedActive = activeMembers.filter(id => id !== memberId);
      setActiveMembers(updatedActive);
      localStorage.setItem('egb_active_members', JSON.stringify(updatedActive));
    }
  };

  const isAdmin = user?.role === 'admin';
  const isTeam = user?.role === 'team' || isAdmin;

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, isTeam, activeMembers, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
