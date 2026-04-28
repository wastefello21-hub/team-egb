"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Plus, Trash2, Calendar, Clock, MapPin, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

type EventFormData = {
  name: string;
  description: string;
  poster_url: string;
  date: string;
  time: string;
  venue: string;
  application_last_date: string;
  is_registration_open: boolean;
};

const initialFormData: EventFormData = {
  name: '',
  description: '',
  poster_url: '',
  date: '',
  time: '',
  venue: '',
  application_last_date: '',
  is_registration_open: true
};

export default function AdminEventsPage() {
  const router = useRouter();
  const { events, addEvent, updateEvent, deleteEvent, eventApplications, deleteEventApplication } = useData();
  const { user, loading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApplications, setShowApplications] = useState(false);
  
  // For bulk events
  const [eventsList, setEventsList] = useState<EventFormData[]>([initialFormData]);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const newEvents = [...eventsList];
    newEvents[index] = { ...newEvents[index], [e.target.name]: e.target.value };
    setEventsList(newEvents);
  };

  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newEvents = [...eventsList];
    newEvents[index] = { ...newEvents[index], is_registration_open: checked };
    setEventsList(newEvents);
  };

  const addNewEventField = () => {
    setEventsList([...eventsList, { ...initialFormData }]);
  };

  const removeEventField = (index: number) => {
    if (eventsList.length > 1) {
      const newEvents = eventsList.filter((_, i) => i !== index);
      setEventsList(newEvents);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create all events
      for (const eventData of eventsList) {
        if (eventData.name && eventData.date && eventData.time && eventData.venue) {
          await addEvent({
            name: eventData.name,
            description: eventData.description,
            poster_url: eventData.poster_url,
            date: eventData.date,
            time: eventData.time,
            venue: eventData.venue,
            application_last_date: eventData.application_last_date || undefined,
            is_registration_open: eventData.is_registration_open
          });
        }
      }
      
      setIsSubmitting(false);
      setShowForm(false);
      setEventsList([initialFormData]);
    } catch (error) {
      console.error('Error adding events:', error);
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

  const handleToggleRegistration = async (event: typeof events[0]) => {
    const newStatus = !event.is_registration_open;
    await updateEvent(event.id, { is_registration_open: newStatus });
  };

  if (loading || !user) {
    return <div className="text-center py-20 animate-pulse">Loading secure session...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header - Always visible */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-orange-600 dark:text-orange-400">Events</h1>
          <p className="text-foreground/60 text-sm">Create and manage festival events</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowApplications(!showApplications)}
            className={showApplications ? 'bg-orange-500 text-white' : ''}
          >
            {showApplications ? 'Back' : `Applications (${eventApplications.length})`}
          </Button>
          {!showApplications && (
            <Button onClick={() => setShowForm(!showForm)} size="sm">
              <Plus size={16} className="mr-1" />
              <span className="sm:hidden">Add</span>
              <span className="hidden sm:inline">Add Event</span>
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
                <GlassCard key={app.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg">{app.name}</h3>
                    <p className="text-sm text-foreground/60">Phone: {app.phone} | Age: {app.age}</p>
                    <p className="text-sm text-orange-600 dark:text-orange-400">Activity: {app.activity}</p>
                    <p className="text-xs text-foreground/40 mt-1">Event ID: {app.event_id}</p>
                  </div>
                  <Button 
                    variant="ghost" 
                    onClick={() => handleDeleteApplication(app.id)}
                    className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 self-end sm:self-center"
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
          {/* Bulk Add Form */}
          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6"
              >
                <GlassCard className="p-4 sm:p-6 border-t-4 border-t-orange-500">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add Events</h2>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setShowForm(false)}
                      className="lg:hidden"
                    >
                      <X size={20} />
                    </Button>
                  </div>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {eventsList.map((eventData, index) => (
                      <div key={index} className="relative p-4 bg-background/50 rounded-lg border border-border-color">
                        {eventsList.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEventField(index)}
                            className="absolute top-2 right-2 p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                          >
                            <X size={18} />
                          </button>
                        )}
                        
                        <div className="text-sm font-semibold text-orange-600 dark:text-orange-400 mb-3">
                          Event {index + 1}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Event Name *</label>
                            <input 
                              type="text" 
                              name="name"
                              value={eventData.name}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. Fancy Dress Competition"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Poster Image URL</label>
                            <input 
                              type="url" 
                              name="poster_url"
                              value={eventData.poster_url}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="https://example.com/poster.jpg"
                            />
                          </div>
                        </div>

                        <div className="mt-3">
                          <label className="block text-xs font-semibold mb-1">Description *</label>
                          <textarea 
                            name="description"
                            value={eventData.description}
                            onChange={(e) => handleChange(index, e)}
                            className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[60px]"
                            placeholder="Describe the event details..."
                            required
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Date *</label>
                            <input 
                              type="text" 
                              name="date"
                              value={eventData.date}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. Sep 7"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1">Time *</label>
                            <input 
                              type="text" 
                              name="time"
                              value={eventData.time}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. 4:00 PM"
                              required
                            />
                          </div>
                          <div className="col-span-2 sm:col-span-1">
                            <label className="block text-xs font-semibold mb-1">Venue *</label>
                            <input 
                              type="text" 
                              name="venue"
                              value={eventData.venue}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. Hall"
                              required
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1">Application Last Date</label>
                            <input 
                              type="text" 
                              name="application_last_date"
                              value={eventData.application_last_date}
                              onChange={(e) => handleChange(index, e)}
                              className="w-full px-3 py-2 text-sm rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                              placeholder="e.g. Sep 5"
                            />
                          </div>
                          <div className="flex items-center gap-2 pt-5">
                            <input 
                              type="checkbox" 
                              name="is_registration_open"
                              id={`is_registration_open_${index}`}
                              checked={eventData.is_registration_open}
                              onChange={(e) => handleCheckboxChange(index, e.target.checked)}
                              className="w-4 h-4 rounded border-border-color text-orange-500 focus:ring-orange-500"
                            />
                            <label htmlFor={`is_registration_open_${index}`} className="text-xs font-semibold">
                              Allow Registrations
                            </label>
                          </div>
                        </div>
                      </div>
                    ))}

                    <div className="flex flex-wrap gap-3">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={addNewEventField}
                        className="flex items-center"
                      >
                        <Plus size={16} className="mr-1" />
                        Add Another Event
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : `Create ${eventsList.length} Event${eventsList.length > 1 ? 's' : ''}`}
                      </Button>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        onClick={() => setShowForm(false)}
                        className="hidden sm:inline-flex"
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Events List */}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event) => (
                <GlassCard key={event.id} className="overflow-hidden">
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
                    {/* Delete button always visible on mobile */}
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="absolute top-2 right-2 p-2 bg-red-500/80 text-white rounded-full hover:bg-red-600 transition-colors sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                    {/* Registration status badge */}
                    {!event.is_registration_open && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded">
                        Closed
                      </div>
                    )}
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-base sm:text-lg mb-1 line-clamp-1">{event.name}</h3>
                    <p className="text-xs sm:text-sm text-foreground/70 line-clamp-2 mb-2">{event.description}</p>
                    <div className="space-y-1 text-xs text-foreground/60">
                      <div className="flex items-center gap-2">
                        <Calendar size={12} className="text-orange-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={12} className="text-orange-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-orange-500" />
                        <span>{event.venue}</span>
                      </div>
                      {event.application_last_date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={12} className="text-red-500" />
                          <span className="text-red-500">Last date: {event.application_last_date}</span>
                        </div>
                      )}
                    </div>
                    {/* Toggle Registration Button */}
                    <button
                      onClick={() => handleToggleRegistration(event)}
                      className={`mt-3 w-full py-2 px-3 rounded-lg text-xs font-semibold transition-colors ${
                        event.is_registration_open 
                          ? 'bg-green-500/20 text-green-600 hover:bg-green-500/30 dark:text-green-400' 
                          : 'bg-red-500/20 text-red-600 hover:bg-red-500/30 dark:text-red-400'
                      }`}
                    >
                      {event.is_registration_open ? '🟢 Registrations Open - Click to Close' : '🔴 Registrations Closed - Click to Open'}
                    </button>
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