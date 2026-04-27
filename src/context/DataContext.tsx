"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

// Types
export type Contribution = {
  id: string;
  name: string;
  house: string;
  phone: string;
  amount: number;
  mode: string;
  date: string;
  collector: string;
};

export type Expenditure = {
  id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
};

export type Photo = {
  id: string;
  year: string;
  url: string;
  caption: string;
  type: 'image' | 'video';
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  collections: number;
  status: string;
  password?: string;
};

export type AppSettings = {
  showNamesPublicly: boolean;
  showAmountsPublicly: boolean;
  showExpenditurePublicly: boolean;
  festivalName: string;
};

interface DataContextType {
  contributions: Contribution[];
  expenditures: Expenditure[];
  teamMembers: TeamMember[];
  gallery: Photo[];
  settings: AppSettings;
  
  // Actions
  addContribution: (contribution: Contribution) => void;
  deleteContribution: (id: string) => void;
  
  addExpenditure: (expenditure: Expenditure) => void;
  deleteExpenditure: (id: string) => void;
  
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;
  
  updateSettings: (updates: Partial<AppSettings>) => void;
  
  // Derived Data
  totalCollection: number;
  totalExpenditure: number;
  balance: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [isMounted, setIsMounted] = useState(false);

  // Initial Mock Data Fallbacks
  const defaultContributions: Contribution[] = [];

  const defaultExpenditures: Expenditure[] = [];

  const defaultTeam: TeamMember[] = [
    { id: 'EGB-01', name: 'Rahul Sharma', role: 'Team Lead', collections: 0, status: 'Active', password: 'password123' }
  ];

  const defaultGallery: Photo[] = [];

  const defaultSettings: AppSettings = {
    showNamesPublicly: true,
    showAmountsPublicly: false,
    showExpenditurePublicly: true,
    festivalName: 'TEAM EGB - Ganesha Chaturthi Celebrations',
  };

  const [contributions, setContributions] = useState<Contribution[]>(defaultContributions);
  const [expenditures, setExpenditures] = useState<Expenditure[]>(defaultExpenditures);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(defaultTeam);
  const [gallery, setGallery] = useState<Photo[]>(defaultGallery);
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  // Load from localStorage & Supabase on client side mount
  useEffect(() => {
    setIsMounted(true);
    
    // Fetch Contributions from Supabase
    const fetchContributions = async () => {
      const { data, error } = await supabase
        .from('contributions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error (contributions):', error.message, error.details);
      }

      if (!error && data && data.length > 0) {
        setContributions(data);
      } else {
        const storedContributions = localStorage.getItem('egb_contributions');
        if (storedContributions) setContributions(JSON.parse(storedContributions));
      }
    };

    // Fetch Team Members from Supabase
    const fetchTeamMembers = async () => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*');

      if (error) {
        console.error('Supabase Fetch Error (team_members):', error.message, error.details);
      }

      if (!error && data && data.length > 0) {
        setTeamMembers(data);
      } else {
        const storedTeam = localStorage.getItem('egb_teamMembers');
        if (storedTeam) setTeamMembers(JSON.parse(storedTeam));
      }
    };
    
    fetchContributions();
    fetchTeamMembers();

    try {
      const storedExpenditures = localStorage.getItem('egb_expenditures');
      if (storedExpenditures) setExpenditures(JSON.parse(storedExpenditures));

      const storedGallery = localStorage.getItem('egb_gallery');
      if (storedGallery) setGallery(JSON.parse(storedGallery));

      const storedSettings = localStorage.getItem('egb_settings');
      if (storedSettings) setSettings(JSON.parse(storedSettings));
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'egb_contributions' && e.newValue) {
        setContributions(JSON.parse(e.newValue));
      }
      if (e.key === 'egb_expenditures' && e.newValue) {
        setExpenditures(JSON.parse(e.newValue));
      }
      if (e.key === 'egb_teamMembers' && e.newValue) {
        setTeamMembers(JSON.parse(e.newValue));
      }
      if (e.key === 'egb_gallery' && e.newValue) {
        setGallery(JSON.parse(e.newValue));
      }
      if (e.key === 'egb_settings' && e.newValue) {
        setSettings(JSON.parse(e.newValue));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('egb_contributions', JSON.stringify(contributions));
    }
  }, [contributions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('egb_expenditures', JSON.stringify(expenditures));
    }
  }, [expenditures, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('egb_teamMembers', JSON.stringify(teamMembers));
    }
  }, [teamMembers, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('egb_gallery', JSON.stringify(gallery));
    }
  }, [gallery, isMounted]);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('egb_settings', JSON.stringify(settings));
    }
  }, [settings, isMounted]);

  // Derived Totals
  const totalCollection = contributions.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpenditure = expenditures.reduce((acc, curr) => acc + curr.amount, 0);
  const balance = totalCollection - totalExpenditure;

  // Actions
  const addContribution = async (contribution: Contribution) => {
    // 1. Instantly update UI for snappy experience
    setContributions(prev => [contribution, ...prev]);
    setTeamMembers(prev => prev.map(member => 
      member.id === contribution.collector 
        ? { ...member, collections: member.collections + Number(contribution.amount) }
        : member
    ));

    // 2. Sync to Supabase in the background
    const { error } = await supabase.from('contributions').insert([{
      name: contribution.name,
      amount: contribution.amount,
      phone: contribution.phone || 'N/A',
      house: contribution.house || 'N/A',
      mode: contribution.mode || 'Cash',
      date: contribution.date,
      collector: contribution.collector
    }]);

    if (error) {
      console.error('Supabase Insert Error:', error.message, error.details, error.hint);
      alert(`Failed to save to database: ${error.message}`);
    }
  };

  const deleteContribution = async (id: string) => {
    const toDelete = contributions.find(c => c.id === id);
    if (toDelete) {
      setContributions(prev => prev.filter(c => c.id !== id));
      setTeamMembers(prev => prev.map(member => 
        member.id === toDelete.collector 
          ? { ...member, collections: Math.max(0, member.collections - Number(toDelete.amount)) }
          : member
      ));
    }
    
    // Delete in Supabase (assuming 'id' column or another identifier exists)
    // To match your previous string ID like 'TXN-xxx' or UUID
    await supabase.from('contributions').delete().match({ name: toDelete?.name, amount: toDelete?.amount });
  };

  const addExpenditure = (expenditure: Expenditure) => {
    setExpenditures(prev => [expenditure, ...prev]);
  };

  const deleteExpenditure = (id: string) => {
    setExpenditures(prev => prev.filter(e => e.id !== id));
  };

  const updateTeamMember = (id: string, updates: Partial<TeamMember>) => {
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));
  };

  const deleteTeamMember = (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
  };

  const addPhoto = (photo: Photo) => {
    setGallery(prev => [photo, ...prev]);
  };

  const deletePhoto = (id: string) => {
    setGallery(prev => prev.filter(photo => photo.id !== id));
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  return (
    <DataContext.Provider value={{
      contributions,
      expenditures,
      teamMembers,
      gallery,
      settings,
      addContribution,
      deleteContribution,
      addExpenditure,
      deleteExpenditure,
      updateTeamMember,
      deleteTeamMember,
      addPhoto,
      deletePhoto,
      updateSettings,
      totalCollection,
      totalExpenditure,
      balance
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
