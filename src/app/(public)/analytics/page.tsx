"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

export default function AnalyticsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Mock data for graphs
  const dailyData = [
    { name: 'Mon', amount: 4000 },
    { name: 'Tue', amount: 3000 },
    { name: 'Wed', amount: 2000 },
    { name: 'Thu', amount: 8000 },
    { name: 'Fri', amount: 15000 },
    { name: 'Sat', amount: 45000 },
    { name: 'Sun', amount: 77000 },
  ];

  const weeklyData = [
    { name: 'Week 1', amount: 15000 },
    { name: 'Week 2', amount: 25000 },
    { name: 'Week 3', amount: 45000 },
    { name: 'Week 4', amount: 69000 },
  ];

  const monthlyData = [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 5000 },
    { name: 'Mar', amount: 12000 },
    { name: 'Apr', amount: 137000 },
  ];

  const getData = () => {
    switch (view) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 max-w-6xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-orange-600 dark:text-orange-400 mb-4">Collection Analytics</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Explore the trends of devotion and contribution towards the Ganesha Festival. Our transparent ledger updates in real-time.
        </p>
      </motion.div>

      <GlassCard className="p-4 md:p-8 relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h2 className="text-2xl font-bold">Contribution Trends</h2>
          
          <div className="flex bg-background/50 p-1 rounded-xl border border-border-color">
            <button 
              onClick={() => setView('daily')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'daily' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-foreground/5'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setView('weekly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'weekly' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-foreground/5'}`}
            >
              Weekly
            </button>
            <button 
              onClick={() => setView('monthly')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'monthly' ? 'bg-orange-500 text-white shadow-md' : 'hover:bg-foreground/5'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={getData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="name" stroke="currentColor" className="text-foreground/60 text-xs" />
              <YAxis stroke="currentColor" className="text-foreground/60 text-xs" tickFormatter={(value) => `₹${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: '1px solid rgba(255,165,0,0.3)', borderRadius: '8px', color: '#fff' }}
                itemStyle={{ color: '#ffb74d' }}
                formatter={(value: any) => [`₹${value}`, 'Collection']}
              />
              <Bar dataKey="amount" fill="url(#colorOrange)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="colorOrange" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ea580c" stopOpacity={0.4}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </GlassCard>
    </div>
  );
}
