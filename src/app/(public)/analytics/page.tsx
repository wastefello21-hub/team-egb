"use client";

import React, { useEffect, useState, useMemo } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useData } from '@/context/DataContext';

export default function AnalyticsPage() {
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [mounted, setMounted] = useState(false);
  const { contributions } = useData();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Process contributions into chart data
  const chartData = useMemo(() => {
    if (!contributions || contributions.length === 0) {
      return [];
    }

    // Group by date
    const grouped: Record<string, number> = {};
    
    contributions.forEach((contribution) => {
      const date = contribution.date ? new Date(contribution.date) : new Date();
      let key: string;
      
      if (view === 'daily') {
        // Group by actual date (YYYY-MM-DD format for sorting)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        key = `${year}-${month}-${day}`;
      } else if (view === 'weekly') {
        // Group by week (approximate)
        const weekNum = Math.ceil(date.getDate() / 7);
        key = `Week ${weekNum}`;
      } else {
        // Group by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        key = months[date.getMonth()];
      }
      
      grouped[key] = (grouped[key] || 0) + (contribution.amount || 0);
    });

    // Convert to array and sort
    const result = Object.entries(grouped).map(([name, amount]) => ({ name, amount }));
    
    // Sort based on view
    if (view === 'daily') {
      // Sort by date string (YYYY-MM-DD sorts correctly)
      result.sort((a, b) => a.name.localeCompare(b.name));
      // Format the date for display (e.g., "Sep 15")
      result.forEach(item => {
        const date = new Date(item.name);
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        item.name = `${months[date.getMonth()]} ${date.getDate()}`;
      });
    } else if (view === 'weekly') {
      const weekOrder = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
      result.sort((a, b) => weekOrder.indexOf(a.name) - weekOrder.indexOf(b.name));
    } else {
      const monthOrder = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      result.sort((a, b) => monthOrder.indexOf(a.name) - monthOrder.indexOf(b.name));
    }

    return result;
  }, [contributions, view]);

  // Fallback data when no contributions
  const dailyData = [
    { name: 'No Data', amount: 0 },
  ];

  const weeklyData = [
    { name: 'Week 1', amount: 0 },
    { name: 'Week 2', amount: 0 },
    { name: 'Week 3', amount: 0 },
    { name: 'Week 4', amount: 0 },
  ];

  const monthlyData = [
    { name: 'Jan', amount: 0 },
    { name: 'Feb', amount: 0 },
    { name: 'Mar', amount: 0 },
    { name: 'Apr', amount: 0 },
  ];

  const getData = () => {
    if (chartData.length > 0) return chartData;
    
    switch (view) {
      case 'weekly': return weeklyData;
      case 'monthly': return monthlyData;
      default: return dailyData;
    }
  };

  return (
    <div className="pt-28 pb-20 px-4 section-shell min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="inline-flex items-center px-4 py-2 rounded-full bg-orange-500/10 text-orange-700 dark:text-orange-300 text-xs font-bold uppercase tracking-[0.25em] mb-5 border border-orange-500/15">
          Live Overview
        </span>
        <h1 className="text-4xl md:text-5xl font-black text-orange-600 dark:text-orange-400 mb-4 section-title">Collection Analytics</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Explore the trends of devotion and contribution towards the Ganesha Festival. Our transparent ledger updates in real-time.
        </p>
      </motion.div>

      <GlassCard className="p-4 md:p-8 relative overflow-hidden glass-hover">
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

        <div className="h-[400px] w-full min-h-[320px]">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%" minHeight={320}>
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
          ) : (
            <div className="h-full w-full animate-pulse rounded-xl bg-foreground/5" />
          )}
        </div>
      </GlassCard>
    </div>
  );
}
