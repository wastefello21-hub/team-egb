"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';

export default function PublicExpenditurePage() {
  const { expenditures: expenses, totalExpenditure: totalSpent, settings } = useData();

  return (
    <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto min-h-screen">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-red-600 dark:text-red-400 mb-4">Expenditure Details</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Complete transparency in how your generous contributions are being utilized for the grand celebration.
        </p>
      </motion.div>

      {!settings.showExpenditurePublicly ? (
        <GlassCard className="p-12 text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold mb-2">Expenditure Details Hidden</h2>
          <p className="text-foreground/60 max-w-md mx-auto">
            The admin has chosen to keep expenditure details private at this time. Please contact the organizing committee for more information.
          </p>
        </GlassCard>
      ) : (
        <>
          <GlassCard className="mb-8 p-6 bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-lg text-foreground/70 font-medium">Total Expenditure to Date</h2>
            </div>
            <div className="text-4xl font-bold text-red-600 dark:text-red-400">
              ₹ {totalSpent.toLocaleString('en-IN')}
            </div>
          </GlassCard>

          <div className="space-y-4">
            {expenses.map((expense, index) => (
              <motion.div
                key={expense.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-red-500/30 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-md">
                        {expense.category}
                      </span>
                      <span className="text-xs text-foreground/50">{expense.date}</span>
                    </div>
                    <h3 className="font-bold text-lg">{expense.description}</h3>
                  </div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400 shrink-0">
                    ₹ {expense.amount.toLocaleString('en-IN')}
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
