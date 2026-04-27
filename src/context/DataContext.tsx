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

export type Suggestion = {
  id: string;
  name: string;
  phone: string;
  suggestion: string;
  likes: number;
  dislikes: number;
  created_at?: string;
};

export type SuggestionVote = {
  id: string;
  suggestion_id: string;
  user_id: string;
  vote_type: 'like' | 'dislike';
};

export type Event = {
  id: string;
  name: string;
  description: string;
  poster_url: string;
  date: string;
  time: string;
  venue: string;
  last_registration_date?: string;
  is_registration_open?: boolean;
  created_at?: string;
};

export type EventApplication = {
  id: string;
  event_id: string;
  name: string;
  phone: string;
  age: number;
  activity: string;
  created_at?: string;
};

interface DataContextType {
  contributions: Contribution[];
  expenditures: Expenditure[];
  teamMembers: TeamMember[];
  gallery: Photo[];
  suggestions: Suggestion[];
  events: Event[];
  eventApplications: EventApplication[];
  userVotes: Record<string, 'like' | 'dislike'>;
  settings: AppSettings;
  
  // Actions
  addContribution: (contribution: Contribution) => void;
  deleteContribution: (id: string) => void;
  
  addExpenditure: (expenditure: Expenditure) => void;
  deleteExpenditure: (id: string) => void;
  
  addTeamMember: (member: TeamMember) => Promise<void> | void;
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void;
  deleteTeamMember: (id: string) => void;
  
  addPhoto: (photo: Photo) => void;
  deletePhoto: (id: string) => void;

  addSuggestion: (suggestion: Omit<Suggestion, 'id' | 'likes' | 'dislikes'>) => void;
  deleteSuggestion: (id: string) => void;
  voteSuggestion: (id: string, type: 'like' | 'dislike') => Promise<boolean>;
  
  addEvent: (event: Omit<Event, 'id' | 'created_at'>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
  applyForEvent: (application: Omit<EventApplication, 'id' | 'created_at'>) => Promise<void>;
  deleteEventApplication: (id: string) => Promise<void>;
  
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
  const defaultSuggestions: Suggestion[] = [];

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
  const [suggestions, setSuggestions] = useState<Suggestion[]>(defaultSuggestions);
  const [userVotes, setUserVotes] = useState<Record<string, 'like' | 'dislike'>>({});
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventApplications, setEventApplications] = useState<EventApplication[]>([]);

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
        try {
          const storedContributions = localStorage.getItem('egb_contributions');
          if (storedContributions) {
            const parsed = JSON.parse(storedContributions);
            if (Array.isArray(parsed)) setContributions(parsed);
          }
        } catch (e) {}
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
        try {
          const storedTeam = localStorage.getItem('egb_teamMembers');
          if (storedTeam) {
            const parsed = JSON.parse(storedTeam);
            if (Array.isArray(parsed)) setTeamMembers(parsed);
          }
        } catch (e) {}
      }
    };
    
    // Fetch Gallery from Supabase
    const fetchGallery = async () => {
      const { data, error } = await supabase
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error (gallery):', error.message, error.details);
      }

      if (!error && data && Array.isArray(data)) {
        setGallery(data);
      } else {
        try {
          const storedGallery = localStorage.getItem('egb_gallery');
          if (storedGallery) {
            const parsed = JSON.parse(storedGallery);
            if (Array.isArray(parsed)) setGallery(parsed);
          }
        } catch(e) {}
      }
    };

    // Fetch Suggestions from Supabase
    const fetchSuggestions = async () => {
      const { data, error } = await supabase
        .from('suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error (suggestions):', error.message, error.details);
      }

      if (!error && data && Array.isArray(data)) {
        setSuggestions(data);
      } else {
        try {
          const storedSuggestions = localStorage.getItem('egb_suggestions');
          if (storedSuggestions) {
             const parsed = JSON.parse(storedSuggestions);
             if (Array.isArray(parsed)) setSuggestions(parsed);
          }
        } catch(e) {}
      }
    };

    // Fetch user's votes from database
    const fetchUserVotes = async () => {
      const userId = localStorage.getItem('egb_user_id');
      if (!userId) return;

      const { data, error } = await supabase
        .from('suggestion_votes')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user votes:', error.message);
        return;
      }

      if (data) {
        const votesMap: Record<string, 'like' | 'dislike'> = {};
        data.forEach(vote => {
          votesMap[vote.suggestion_id] = vote.vote_type;
        });
        setUserVotes(votesMap);
      }
    };

    // Fetch Events from Supabase
    const fetchEvents = async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error (events):', error.message);
      }

      if (!error && data) {
        setEvents(data);
      }
    };

    // Fetch Event Applications from Supabase
    const fetchEventApplications = async () => {
      const { data, error } = await supabase
        .from('event_applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase Fetch Error (event_applications):', error.message);
      }

      if (!error && data) {
        setEventApplications(data);
      }
    };

    fetchContributions();
    fetchTeamMembers();
    fetchGallery();
    fetchSuggestions();
    fetchUserVotes();
    fetchEvents();
    fetchEventApplications();

    try {
      const storedExpenditures = localStorage.getItem('egb_expenditures');
      if (storedExpenditures) {
        const parsed = JSON.parse(storedExpenditures);
        if (Array.isArray(parsed)) setExpenditures(parsed);
      }

      const storedSettings = localStorage.getItem('egb_settings');
      if (storedSettings) {
        const parsedSetting = JSON.parse(storedSettings);
        if (parsedSetting && typeof parsedSetting === 'object') {
          setSettings(prev => ({ ...prev, ...parsedSetting }));
        }
      }
    } catch (e) {
      console.error("Error loading from localStorage", e);
    }

    // Cross-tab synchronization
    const handleStorageChange = (e: StorageEvent) => {
      try {
        if (e.key === 'egb_contributions' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setContributions(parsed);
        }
        if (e.key === 'egb_expenditures' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setExpenditures(parsed);
        }
        if (e.key === 'egb_teamMembers' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setTeamMembers(parsed);
        }
        if (e.key === 'egb_gallery' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setGallery(parsed);
        }
        if (e.key === 'egb_suggestions' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) setSuggestions(parsed);
        }
        if (e.key === 'egb_settings' && e.newValue) {
          const parsed = JSON.parse(e.newValue);
          if (parsed && typeof parsed === 'object') {
            setSettings(prev => ({ ...prev, ...parsed }));
          }
        }
      } catch (err) {}
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_contributions', JSON.stringify(contributions));
      } catch (e) {
        console.warn('Failed to save contributions to localStorage', e);
      }
    }
  }, [contributions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_expenditures', JSON.stringify(expenditures));
      } catch (e) {
        console.warn('Failed to save expenditures to localStorage', e);
      }
    }
  }, [expenditures, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_teamMembers', JSON.stringify(teamMembers));
      } catch (e) {
        console.warn('Failed to save teamMembers to localStorage', e);
      }
    }
  }, [teamMembers, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_gallery', JSON.stringify(gallery));
      } catch (e) {
        console.warn('Handling High Data: Quota Exceeded for gallery. Did not save to localStorage.', e);
      }
    }
  }, [gallery, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_suggestions', JSON.stringify(suggestions));
      } catch (e) {
        console.warn('Failed to save suggestions to localStorage', e);
      }
    }
  }, [suggestions, isMounted]);

  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem('egb_settings', JSON.stringify(settings));
      } catch (e) {
        console.warn('Failed to save settings to localStorage', e);
      }
    }
  }, [settings, isMounted]);

  // Derived Totals
  const totalCollection = contributions.reduce((acc, curr) => acc + Number(curr.amount), 0);
  const totalExpenditure = expenditures.reduce((acc, curr) => acc + Number(curr.amount), 0);
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

    // 3. Update the team member's collections count in Supabase
    const member = teamMembers.find(m => m.id === contribution.collector);
    if (member) {
      await supabase
        .from('team_members')
        .update({ collections: member.collections + Number(contribution.amount) })
        .eq('id', member.id);
    }
  };

  const deleteContribution = async (id: string) => {
    const toDelete = contributions.find(c => c.id === id);
    if (toDelete) {
      setContributions(prev => prev.filter(c => c.id !== id));
      
      const member = teamMembers.find(m => m.id === toDelete.collector);
      const newTotal = member ? Math.max(0, member.collections - Number(toDelete.amount)) : 0;
      
      setTeamMembers(prev => prev.map(m => 
        m.id === toDelete.collector ? { ...m, collections: newTotal } : m
      ));

      if (member) {
        await supabase
          .from('team_members')
          .update({ collections: newTotal })
          .eq('id', member.id);
      }
    }
    
    // Delete in Supabase
    await supabase.from('contributions').delete().match({ name: toDelete?.name, amount: toDelete?.amount });
  };

  const addExpenditure = (expenditure: Expenditure) => {
    setExpenditures(prev => [expenditure, ...prev]);
  };

  const deleteExpenditure = (id: string) => {
    setExpenditures(prev => prev.filter(e => e.id !== id));
  };

  const addTeamMember = async (member: TeamMember) => {
    setTeamMembers(prev => [...prev, member]);
    
    // Sync to Supabase
    const { error } = await supabase.from('team_members').insert([{
      id: member.id,
      name: member.name,
      role: member.role,
      collections: member.collections,
      status: member.status,
      password: member.password
    }]);

    if (error) {
      console.error('Supabase Insert Error (Team Member):', error.message);
      alert(`Failed to save team member: ${error.message}`);
    }
  };

  const updateTeamMember = async (id: string, updates: Partial<TeamMember>) => {
    // 1. Optimistic UI update
    setTeamMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ));

    // 2. Sync to Supabase
    // If the ID itself changed, Supabase requires updating the primary key field
    // which is what we map `updates.id` to inside the query
    const { error } = await supabase
      .from('team_members')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Supabase Update Error:', error.message);
      alert(`Failed to update member: ${error.message}`);
    }
  };

  const deleteTeamMember = async (id: string) => {
    setTeamMembers(prev => prev.filter(member => member.id !== id));
    
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
      
    if (error) {
      console.error('Supabase Delete Error:', error.message);
      alert(`Failed to delete member: ${error.message}`);
    }
  };

  const addPhoto = async (photo: Photo) => {
    setGallery(prev => [photo, ...prev]);

    // Sync to Supabase
    const { data, error } = await supabase.from('gallery').insert([{
      url: photo.url,
      year: photo.year,
      caption: photo.caption,
      type: photo.type
    }]).select().single();

    if (error) {
      console.error('Supabase Insert Error (gallery):', error.message);
      alert(`Failed to save photo to database: ${error.message}`);
    } else if (data) {
      // Update the local list with the real database UUID so delete works
      setGallery(prev => prev.map(p => p.id === photo.id ? { ...p, id: data.id } : p));
    }
  };

  const deletePhoto = async (id: string) => {
    setGallery(prev => prev.filter(photo => photo.id !== id));

    // Sync to Supabase
    const { error } = await supabase.from('gallery').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (gallery):', error.message);
      alert(`Failed to delete photo: ${error.message}`);
    }
  };

  const addSuggestion = async (suggestion: Omit<Suggestion, 'id' | 'likes' | 'dislikes'>) => {
    // Create a temporary ID for optimistic UI
    const tempId = `SUG-${Date.now()}`;
    const fullSuggestion: Suggestion = {
      ...suggestion,
      id: tempId,
      likes: 0,
      dislikes: 0
    };

    // Optimistic UI
    setSuggestions(prev => [fullSuggestion, ...prev]);

    const { data, error } = await supabase.from('suggestions').insert([{
      name: suggestion.name,
      phone: suggestion.phone,
      suggestion: suggestion.suggestion,
      likes: 0,
      dislikes: 0
    }]).select().single();

    if (error) {
      console.error('Supabase Insert Error (suggestions):', error.message);
    } else if (data) {
      setSuggestions(prev => prev.map(s => s.id === tempId ? { ...s, id: data.id } : s));
    }
  };

  const deleteSuggestion = async (id: string) => {
    setSuggestions(prev => prev.filter(s => s.id !== id));
    const { error } = await supabase.from('suggestions').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (suggestions):', error.message);
    }
  };

  const voteSuggestion = async (id: string, type: 'like' | 'dislike'): Promise<boolean> => {
    // Check if user has already voted on this suggestion
    if (userVotes[id]) {
      console.warn('User has already voted on this suggestion');
      return false;
    }

    // Get a unique user identifier (using localStorage or generate one)
    let userId = localStorage.getItem('egb_user_id');
    if (!userId) {
      userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('egb_user_id', userId);
    }

    // Optimistic UI update
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          likes: type === 'like' ? s.likes + 1 : s.likes,
          dislikes: type === 'dislike' ? s.dislikes + 1 : s.dislikes
        };
      }
      return s;
    }));

    // Track local vote
    setUserVotes(prev => ({ ...prev, [id]: type }));

    // Save vote to database
    try {
      const { error: voteError } = await supabase.from('suggestion_votes').insert({
        suggestion_id: id,
        user_id: userId,
        vote_type: type
      });

      if (voteError) {
        console.error('Error saving vote:', voteError.message);
        // Revert optimistic update on error
        setSuggestions(prev => prev.map(s => {
          if (s.id === id) {
            return {
              ...s,
              likes: type === 'like' ? s.likes - 1 : s.likes,
              dislikes: type === 'dislike' ? s.dislikes - 1 : s.dislikes
            };
          }
          return s;
        }));
        setUserVotes(prev => {
          const newVotes = { ...prev };
          delete newVotes[id];
          return newVotes;
        });
        return false;
      }

      // Update the suggestion's like/dislike count in the database
      const current = suggestions.find(s => s.id === id);
      if (current) {
        const newLikes = type === 'like' ? current.likes + 1 : current.likes;
        const newDislikes = type === 'dislike' ? current.dislikes + 1 : current.dislikes;
        
        await supabase.from('suggestions').update({
          likes: newLikes,
          dislikes: newDislikes
        }).eq('id', id);
      }

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      return false;
    }
  };

  const updateSettings = (updates: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  // Event Actions
  const addEvent = async (event: Omit<Event, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('events').insert([event]).select().single();

    if (error) {
      console.error('Supabase Insert Error (events):', error.message);
      alert(`Failed to add event: ${error.message}`);
    } else if (data) {
      setEvents(prev => [data, ...prev]);
    }
  };

  const deleteEvent = async (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    const { error } = await supabase.from('events').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (events):', error.message);
    }
  };

  const applyForEvent = async (application: Omit<EventApplication, 'id' | 'created_at'>) => {
    const { data, error } = await supabase.from('event_applications').insert([application]).select().single();

    if (error) {
      console.error('Supabase Insert Error (event_applications):', error.message);
      alert(`Failed to submit application: ${error.message}`);
    } else if (data) {
      setEventApplications(prev => [data, ...prev]);
    }
  };

  const deleteEventApplication = async (id: string) => {
    setEventApplications(prev => prev.filter(a => a.id !== id));
    const { error } = await supabase.from('event_applications').delete().eq('id', id);
    if (error) {
      console.error('Supabase Delete Error (event_applications):', error.message);
    }
  };

  return (
    <DataContext.Provider value={{
      contributions,
      expenditures,
      teamMembers,
      gallery,
      suggestions,
      events,
      eventApplications,
      userVotes,
      settings,
      addContribution,
      deleteContribution,
      addExpenditure,
      deleteExpenditure,
      addTeamMember,
      updateTeamMember,
      deleteTeamMember,
      addPhoto,
      deletePhoto,
      addSuggestion,
      deleteSuggestion,
      voteSuggestion,
      addEvent,
      deleteEvent,
      applyForEvent,
      deleteEventApplication,
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
