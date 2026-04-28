"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';

export default function EventsPage() {
  const { events } = useData();

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">Festival Events</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Participate in our exciting events during Ganesha Chaturthi. Click on an event to learn more and apply!
        </p>
      </motion.div>

      {events.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto mb-4 text-foreground/30" />
          <h2 className="text-2xl font-bold mb-2">No Events Yet</h2>
          <p className="text-foreground/60">Check back soon for upcoming events!</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link href={`/events/${event.id}`}>
                <GlassCard className="h-full overflow-hidden group cursor-pointer hover:border-orange-500/50 transition-all">
                  <div className="aspect-[4/3] relative bg-background overflow-hidden">
                    {event.poster_url ? (
                      <Image 
                        src={event.poster_url} 
                        alt={event.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        quality={75}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900 dark:to-red-900">
                        <ImageIcon className="w-16 h-16 text-orange-500/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-6">
                    <h2 className="text-xl font-bold mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {event.name}
                    </h2>
                    
                    <div className="space-y-2 text-sm text-foreground/70 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-orange-500" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-orange-500" />
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={16} className="text-orange-500" />
                        <span>{event.venue}</span>
                      </div>
                    </div>

                    <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold text-sm group-hover:underline">
                      View Details & Apply <ArrowRight size={16} className="ml-1" />
                    </div>
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}