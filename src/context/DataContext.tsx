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
  const defaultContributions = [
    { id: 'TXN-001', name: 'Sanjay Gupta', house: '#45, MG Road', phone: '9876543210', amount: 5001, mode: 'UPI', date: '25 Apr 2026', collector: 'EGB-01' },
    { id: 'TXN-002', name: 'Anonymous', house: '#12, Layout', phone: 'Hidden', amount: 1001, mode: 'Cash', date: '25 Apr 2026', collector: 'EGB-03' },
    { id: 'TXN-003', name: 'Priya Desai', house: 'Apt 4B', phone: '9123456789', amount: 10000, mode: 'Bank Transfer', date: '24 Apr 2026', collector: 'EGB-01' },
    { id: 'TXN-004', name: 'House 88', house: '#88, Cross', phone: '9988776655', amount: 500, mode: 'Cash', date: '24 Apr 2026', collector: 'EGB-02' },
  ];

  const defaultExpenditures = [
    { id: 'EXP-1', category: 'Decoration', description: 'Main Pandal setup and floral decor', amount: 45000, date: '10 Apr 2026' },
    { id: 'EXP-2', category: 'Idol', description: 'Eco-friendly Ganesha Idol booking advance', amount: 15000, date: '12 Apr 2026' },
    { id: 'EXP-3', category: 'Prasad', description: 'Sweets for daily distribution', amount: 8000, date: '15 Apr 2026' },
  ];

  const defaultTeam = [
    { id: 'EGB-01', name: 'Rahul Sharma', role: 'Team Lead', collections: 15001, status: 'Active', password: 'password123' },
    { id: 'EGB-02', name: 'Amit Kumar', role: 'Volunteer', collections: 500, status: 'Active', password: 'password123' },
    { id: 'EGB-03', name: 'Priya Patel', role: 'Volunteer', collections: 1001, status: 'Active', password: 'password123' },
  ];

  const defaultGallery: Photo[] = [
    { id: 'GAL-1', year: '2025', url: '/ganesha_hero_bg.png', caption: 'Grand Visarjan 2025', type: 'image' },
    { id: 'GAL-2', year: '2025', url: '/ganesha_hero_bg.png', caption: 'Maha Aarti', type: 'image' },
    { id: 'GAL-3', year: '2024', url: '/ganesha_hero_bg.png', caption: 'Pandal Decoration', type: 'image' },
  ];

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
        console.error('Supabase Fetch Error:', error.message, error.details);
      }

      if (!error && data && data.length > 0) {
        setContributions(data);
      } else {
        // load fallback from localstorage if supabase is empty or fails
        const storedContributions = localStorage.getItem('egb_contributions');
        if (storedContributions) setContributions(JSON.parse(storedContributions));
      }
    };
    
    fetchContributions();

    try {
      const storedExpenditures = localStorage.getItem('egb_expenditures');
      if (storedExpenditures) setExpenditures(JSON.parse(storedExpenditures));

      const storedTeam = localStorage.getItem('egb_teamMembers');
      if (storedTeam) setTeamMembers(JSON.parse(storedTeam));

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
