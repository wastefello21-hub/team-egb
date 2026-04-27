"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';

export default function TeamDashboard() {
  const [formData, setFormData] = useState({
    houseNumber: '',
    contributorName: '',
    phoneNumber: '',
    amount: '',
    paymentMode: 'Cash',
    note: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addContribution } = useData();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await addContribution({
        id: `TXN-${Date.now()}`,
        name: formData.contributorName,
        house: formData.houseNumber,
        phone: formData.phoneNumber,
        amount: Number(formData.amount),
        mode: formData.paymentMode,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        collector: 'EGB-01' // In a real app, this would be the logged-in user's ID
      });
      
      setIsSubmitting(false);
      setSuccess(true);
      
      // Reset form after 3 seconds
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          houseNumber: '',
          contributorName: '',
          phoneNumber: '',
          amount: '',
          paymentMode: 'Cash',
          note: ''
        });
      }, 3000);
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center h-[70vh] text-center"
      >
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Success!</h2>
        <p className="text-foreground/70 mb-8 max-w-xs">
          Contribution of ₹{formData.amount} from {formData.contributorName} recorded. A WhatsApp thank you message has been triggered.
        </p>
        <Button onClick={() => setSuccess(false)}>Add Another</Button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">New Collection</h2>
        <p className="text-sm text-foreground/60">Fill details to register a contribution</p>
      </div>

      <GlassCard className="border-t-4 border-t-orange-500">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">House/Area</label>
              <input 
                type="text" 
                name="houseNumber"
                value={formData.houseNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="e.g. #42, Main St"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Phone</label>
              <input 
                type="tel" 
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="10 digit number"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Contributor Name</label>
            <input 
              type="text" 
              name="contributorName"
              value={formData.contributorName}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Full Name"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Amount (₹)</label>
              <input 
                type="number" 
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 text-lg font-bold text-orange-600 dark:text-orange-400"
                placeholder="0"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Mode</label>
              <select 
                name="paymentMode"
                value={formData.paymentMode}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Bank">Bank Transfer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 uppercase tracking-wide text-foreground/70">Optional Note</label>
            <input 
              type="text" 
              name="note"
              value={formData.note}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded-lg bg-background/50 border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
              placeholder="Any specific wishes or remarks"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full py-4 text-lg mt-6 shadow-xl shadow-orange-500/20" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Submit Contribution'}
          </Button>
        </form>
      </GlassCard>
    </div>
  );
}
