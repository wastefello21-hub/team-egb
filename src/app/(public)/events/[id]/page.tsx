"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Image as ImageIcon, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { events, applyForEvent } = useData();
  const eventId = params.id as string;
  
  // Use useMemo to make event reactive to events array changes
  const event = useMemo(() => events.find(e => e.id === eventId), [events, eventId]);
  
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [registrationClosed, setRegistrationClosed] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    activity: ''
  });

  // Check if registration is allowed
  useEffect(() => {
    if (event) {
      const isOpen = event.is_registration_open !== false;
      
      // Check if last registration date has passed
      if (event.application_last_date && isOpen) {
        const regDate = new Date(event.application_last_date);
        const today = new Date();
        // Reset time to compare dates only
        today.setHours(0, 0, 0, 0);
        regDate.setHours(0, 0, 0, 0);
        
        if (today > regDate) {
          setRegistrationClosed(true);
        } else {
          setRegistrationClosed(false);
        }
      } else {
        setRegistrationClosed(!isOpen);
      }
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await applyForEvent({
        event_id: eventId,
        name: formData.name,
        phone: formData.phone,
        age: parseInt(formData.age),
        activity: formData.activity
      });
      
      setIsSubmitting(false);
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
        setShowForm(false);
        setFormData({ name: '', phone: '', age: '', activity: '' });
      }, 3000);
    } catch (error) {
      console.error('Error submitting application:', error);
      setIsSubmitting(false);
    }
  };

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
        <Button onClick={() => router.push('/events')}>
          <ArrowLeft size={18} className="mr-2" />
          Back to Events
        </Button>
      </div>
    );
  }

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="min-h-screen flex flex-col items-center justify-center p-4"
      >
        <GlassCard className="p-12 text-center max-w-md">
          <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 mx-auto">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Application Submitted!</h2>
          <p className="text-foreground/70 mb-8">
            Thank you for applying for <strong>{event.name}</strong>. We will contact you soon!
          </p>
          <Button onClick={() => { setSuccess(false); setShowForm(false); }}>
            Back to Event
          </Button>
        </GlassCard>
      </motion.div>
    );
  }

  return (
    <div className="pt-28 pb-20 px-4 max-w-4xl mx-auto min-h-screen">
      <button 
        onClick={() => router.push('/events')}
        className="flex items-center text-foreground/60 hover:text-orange-600 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        <ArrowLeft size={18} className="mr-2" />
        Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Event Poster */}
        <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-2xl">
          {event.poster_url ? (
            <img 
              src={event.poster_url} 
              alt={event.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
              <ImageIcon className="w-24 h-24 text-orange-500/30" />
            </div>
          )}
        </div>

        {/* Event Details */}
        <div>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-3xl md:text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">
              {event.name}
            </h1>

            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-3 text-foreground/80">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Calendar size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50">Date</p>
                  <p className="font-semibold">{event.date}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-foreground/80">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <Clock size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50">Time</p>
                  <p className="font-semibold">{event.time}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-foreground/80">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <MapPin size={20} className="text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-sm text-foreground/50">Venue</p>
                  <p className="font-semibold">{event.venue}</p>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-xl font-bold mb-3">About the Event</h2>
              <p className="text-foreground/70 leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Registration Info */}
            {event.application_last_date && (
              <div className="mb-6 p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                  <AlertCircle size={18} />
                  <span className="font-semibold">Last Date to Apply: {event.application_last_date}</span>
                </div>
              </div>
            )}

            {!showForm ? (
              registrationClosed ? (
                <div className="w-full py-4 px-6 text-center bg-gray-200 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-300 font-semibold">
                  Registrations Closed
                </div>
              ) : (
                <Button 
                  onClick={() => setShowForm(true)}
                  size="lg"
                  className="w-full py-4 text-lg"
                >
                  Apply Now
                </Button>
              )
            ) : (
              <GlassCard className="p-6 border-t-4 border-t-orange-500">
                <h3 className="text-lg font-bold mb-4">Application Form</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Your Name</label>
                    <input 
                      type="text" 
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Full Name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Phone Number</label>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="10 digit number"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Age</label>
                    <input 
                      type="number" 
                      name="age"
                      value={formData.age}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                      placeholder="Your age"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold mb-1">Activity / Performance</label>
                    <textarea 
                      name="activity"
                      value={formData.activity}
                      onChange={handleChange}
                      className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 min-h-[80px]"
                      placeholder="Describe what you will do (e.g., singing, dance, magic show)"
                      required
                    />
                  </div>
                  
                  <div className="flex gap-3 pt-2">
                    <Button type="submit" disabled={isSubmitting} className="flex-1">
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </GlassCard>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}