"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, Trash2, Calendar, Clock, MapPin, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function AdminEventsPage() {
  const router = useRouter();
  const { events, addEvent, deleteEvent, eventApplications, deleteEventApplication } = useData();
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    poster_url: '',
    date: '',
    time: '',
    venue: '',
    last_registration_date: '',
    is_registration_open: true
  });

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addEvent({
        name: formData.name,
        description: formData.description,
        poster_url: formData.poster_url,
        date: formData.date,
        time: formData.time,
        venue: formData.venue,
        last_registration_date: formData.last_registration_date || undefined,
        is_registration_open: formData.is_registration_open
      });
      
      setIsSubmitting(false);
      setShowForm(false);
      setFormData({
        name: '',
        description: '',
        poster_url: '',
        date: '',
        time: '',
        venue: '',
        last_registration_date: '',
        is_registration_open: true
      });
    } catch (error) {
      console.error('Error adding event:', error);
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    if (confirm('Are you sure you want to delete this application?')) {
      await deleteEventApplication(id);
    }
  };

  if (loading || !user) {
    return <div className="text-center py-20 animate-pulse">Loading secure session...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-orange-600 dark:text-orange-400">Events Management</h1>
          <p className="text-foreground/60">Create and manage festival events</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setShowApplications(!showApplications)}
            className={showApplications ? 'bg-orange-500 text-white' : ''}
          >
            {showApplications ? 'Back to Events' : `View Applications (${eventApplications.length})`}
          </Button>
          {!showApplications && (
            <Button onClick={() => setShowForm(!showForm)}>
              <Plus size={18} className="mr-2" />
              Add Event
            </Button>
          )}
        </div>
      </div>

      {showApplications ? (
        <div className="space-y-4">
          <h2 className="text-xl font-bold mb-4">Event Applications</h2>
          {eventApplications.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <p className="text-foreground/60">No applications yet</p>
            </GlassCard>
          ) : (
            <div className="grid gap-4">
              {eventApplications.map((app) => (
                <GlassCard key={app.id} className="p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-sm text-foreground/60">Phone: {app.phone} | Age: {app.age}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Activity: {app.activity}</p>
                    <p className="text-xs text-foreground/40 mt-1">Event ID: {app.event_id}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeleteApplication(app.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 size={18} />
                  </Button>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
          {showForm && (
            <GlassCard className="mb-8 p-6 border-t-4 border-t-orange-500">
              <h2 className="text-xl font-bold mb-4">Add New Event</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Event Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Fancy Dress Competition"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Poster Image URL</label>
                    <input 
                      type="url" 
                      name="poster_url"
                      value={formData.poster_url}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="https://example.com/poster.jpg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[100px]"
                    placeholder="Describe the event details..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Date</label>
                    <input 
                      type="text" 
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. September 7, 2026"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Time</label>
                    <input 
                      type="text" 
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. 4:00 PM"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Venue</label>
                    <input 
                      type="text" 
                      name="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. Community Hall"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Last Registration Date</label>
                    <input 
                      type="text" 
                      name="last_registration_date"
                      value={formData.last_registration_date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="e.g. September 5, 2026"
                    />
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input 
                      type="checkbox" 
                      name="is_registration_open"
                      id="is_registration_open"
                      checked={formData.is_registration_open}
                      onChange={(e) => setFormData({ ...formData, is_registration_open: e.target.checked })}
                      className="w-5 h-5 rounded border-border-color text-orange-500 focus:ring-orange-500"
                    />
                    <label htmlFor="is_registration_open" className="text-sm font-semibold">
                      Allow Registrations
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Creating...' : 'Create Event'}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </GlassCard>
          )}

          {events.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 text-foreground/30" />
              <h3 className="text-lg font-medium">No events yet</h3>
              <p className="text-sm text-foreground/60 mb-4">Create your first event to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus size={18} className="mr-2" />
                Add Event
              </Button>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <GlassCard key={event.id} className="overflow-hidden group">
                  <div className="aspect-[4/3] relative bg-background">
                    {event.poster_url ? (
                      <img 
                        src={event.poster_url} 
                        alt={event.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
                        <ImageIcon className="w-12 h-12 text-orange-500/30" />
                      </div>
                    )}
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{event.name}</h3>
                    <p className="text-sm text-foreground/70 line-clamp-2 mb-3">{event.description}</p>
                    <div className="space-y-1 text-xs text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-orange-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-orange-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-orange-500" />
                        <span>{event.venue}</span>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}