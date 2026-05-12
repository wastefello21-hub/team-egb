"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { CheckCircle2, LogOut, CreditCard, ChevronLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function TeamDashboard() {
  const router = useRouter();
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
  const [showUpi, setShowUpi] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [idCardUrl, setIdCardUrl] = useState<string | null>(null);
  const [idCardLoading, setIdCardLoading] = useState(false);
  const [idCardError, setIdCardError] = useState<string | null>(null);
  const { addContribution } = useData();
  const { user, logout, loading } = useAuth(); // Import the logged-in user

  useEffect(() => {
    if (!loading && !user) {
      router.push('/team/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    // Fetch ID card when component mounts
    if (user?.teamMemberId && showIdCard) {
      fetchIdCard();
    }
  }, [user?.teamMemberId, showIdCard]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === 'paymentMode' && e.target.value === 'UPI') {
      setShowUpi(true);
    } else if (e.target.name === 'paymentMode') {
      setShowUpi(false);
    }
  };

  const fetchIdCard = async () => {
    if (!user?.teamMemberId) return;
    
    setIdCardLoading(true);
    setIdCardError(null);
    try {
      const response = await fetch(`/api/get-id-card?memberId=${user.teamMemberId}`);
      const data = await response.json();
      
      if (response.ok) {
        if (data.idCardUrl) {
          setIdCardUrl(data.idCardUrl);
        } else {
          setIdCardError('No ID card has been uploaded yet. Please contact your administrator.');
        }
      } else {
        setIdCardError(data.error || 'Failed to fetch ID card');
      }
    } catch (error) {
      console.error('Error fetching ID card:', error);
      setIdCardError('Failed to load ID card');
    } finally {
      setIdCardLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Safely default to 'Admin' or 'EGB-01' if user ID is somehow stripped, but try to use live auth
      const collectorId = user?.teamMemberId || user?.uid || 'Unknown';

      await addContribution({
        id: `TXN-${Date.now()}`,
        name: formData.contributorName,
        house: formData.houseNumber,
        phone: formData.phoneNumber,
        amount: Number(formData.amount),
        mode: formData.paymentMode,
        date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        collector: collectorId
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

  if (loading || !user) {
    return <div className="text-center py-20 animate-pulse">Loading secure session...</div>;
  }

  // ID Card Modal
  if (showIdCard) {
    return (
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <button 
            onClick={() => setShowIdCard(false)}
            className="flex items-center gap-2 text-sm text-foreground/70 hover:text-foreground mb-4 transition-colors"
          >
            <ChevronLeft size={16} /> Back to Dashboard
          </button>

          <GlassCard className="border-t-4 border-t-orange-500 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-8">
              <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center mb-4">
                <CreditCard size={32} />
              </div>
              <h2 className="text-2xl font-bold mb-1">Your ID Card</h2>
              <p className="text-foreground/60 text-sm mb-6">{user?.name || user?.displayName || user?.teamMemberId}</p>

              {idCardLoading ? (
                <div className="w-full flex items-center justify-center py-12">
                  <div className="animate-pulse text-foreground/50">Loading your ID card...</div>
                </div>
              ) : idCardError ? (
                <div className="w-full bg-orange-100/50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300 text-sm rounded-lg p-4">
                  {idCardError}
                </div>
              ) : idCardUrl ? (
                <div className="w-full">
                  <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 shadow-xl">
                    <img 
                      src={idCardUrl} 
                      alt="ID Card" 
                      className="w-full h-auto rounded-md object-contain"
                    />
                  </div>
                  <p className="text-xs text-foreground/60 text-center mt-4">
                    This is your unique ID card. Use it for verification purposes.
                  </p>
                </div>
              ) : null}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6 flex justify-between items-start gap-3">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">New Collection</h2>
          <p className="text-sm text-foreground/60">Fill details to register a contribution</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowIdCard(true)}
            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-orange-500/10 text-orange-600 dark:text-orange-400 rounded-full hover:bg-orange-500/20 transition-colors whitespace-nowrap"
            title="View your ID card"
          >
            <CreditCard size={14} /> ID Card
          </button>
          <button 
            onClick={() => {
              logout();
            }}
            className="text-xs flex items-center gap-1 px-3 py-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors whitespace-nowrap"
          >
            <LogOut size={14} /> Exit
          </button>
        </div>
      </div>

      <GlassCard className="border-t-4 border-t-orange-500">
        {showUpi && (
          <div className="mb-6 flex flex-col items-center justify-center">
            <img
              src="/upi-qr.png"
              alt="UPI QR Code for Payment"
              className="w-64 h-64 object-contain border-2 border-dashed border-orange-400 rounded-2xl bg-white mb-2"
            />
            <div className="text-center text-xs text-foreground/70">
              <div className="font-bold text-base text-orange-700">VEMALA PRAJWAL</div>
              <div>UPI ID: <span className="font-mono">9380753581@naviaxis</span></div>
              <div className="mt-1 text-[11px]">Scan & pay using any UPI app</div>
            </div>
          </div>
        )}
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
