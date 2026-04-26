"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function ContributorsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const { contributions, settings } = useData();

  const filtered = contributions.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.house.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-4">Our Devotees</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          A heartfelt thank you to everyone contributing to the grand success of our festival. May Lord Ganesha bless you all.
        </p>
      </motion.div>

      <GlassCard className="p-4 md:p-6 mb-8">
        <div className="relative w-full max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search by name or area..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((contributor, index) => (
          <motion.div
            key={contributor.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
          >
            <GlassCard className="p-4 flex items-center justify-between hover:border-blue-500/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 flex items-center justify-center text-blue-700 dark:text-blue-300 font-bold text-lg">
                  {settings.showNamesPublicly ? contributor.name.charAt(0) : '?'}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{settings.showNamesPublicly ? contributor.name : 'Anonymous Devotee'}</h3>
                  <p className="text-xs text-foreground/50">{contributor.house} • {contributor.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-green-600 dark:text-green-400 text-lg">{settings.showAmountsPublicly ? `₹${contributor.amount}` : '✓ Contributed'}</p>
                <span className="text-[10px] uppercase tracking-wider text-foreground/40">Donation</span>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
      
      {filtered.length === 0 && (
        <div className="text-center py-20 text-foreground/50">
          No contributors found matching "{searchTerm}"
        </div>
      )}
    </div>
  );
}
