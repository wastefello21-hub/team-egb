"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, TrendingUp, Heart, Wallet, Play, Video, MessageSquarePlus, ThumbsUp, ThumbsDown, Phone, Mail, Tv, Camera } from 'lucide-react';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const { totalCollection, totalExpenditure, balance, contributions, gallery, settings, suggestions, voteSuggestion } = useData();
  const { isAdmin } = useAuth();
  const [votedItems, setVotedItems] = useState<Record<string, 'up' | 'down'>>({});

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (votedItems[id] === type) return;
    try {
      const success = await voteSuggestion(id, type === 'up' ? 'like' : 'dislike');
      if (success) {
        setVotedItems(prev => ({ ...prev, [id]: type }));
      }
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  // Format currencies
  const formatCurrency = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  const analytics = {
    totalContributions: formatCurrency(totalCollection),
    contributors: contributions.length,
    expenditure: formatCurrency(totalExpenditure),
    balance: formatCurrency(balance)
  };

  // Get most recent 4
  const recentContributions = contributions.slice(0, 4).map((c, i) => ({
    id: c.id,
    name: c.name,
    amount: c.amount,
    date: c.date || (i === 0 ? "Just now" : "Recently")
  }));

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Hero Section */}
      <section className="relative w-full min-h-[90vh] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/logo_v2.jpg" 
            alt="Festival Background" 
            fill
            className="object-cover opacity-70"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/10 to-background" />
        </div>

        <motion.div 
          className="text-center px-4 max-w-5xl z-10 py-12 rounded-3xl bg-black/5 backdrop-blur-[2px] border border-white/5"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, type: "spring" }}
        >
          <h1 className="text-5xl md:text-8xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-orange-600 [filter:drop-shadow(0_4px_8px_rgba(0,0,0,0.5))] tracking-tight leading-tight">
            {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[0].trim() : (settings?.festivalName || 'TEAM EGB')}
            <br />
            <span className="text-4xl md:text-6xl text-white dark:text-yellow-400 font-bold block mt-2 [text-shadow:0_2px_10px_rgba(0,0,0,0.5)] opacity-95">
              {settings?.festivalName?.includes('-') ? settings.festivalName.split('-')[1].trim() : 'Ganesha Chaturthi Celebrations'}
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl font-bold mb-12 text-foreground dark:text-white max-w-2xl mx-auto italic [text-shadow:0_2px_4px_rgba(0,0,0,0.3)]">
            "Celebrating Devotion, Faith, and Youth Unity"
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link href="#contributions" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-10 py-5 rounded-2xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-xl shadow-orange-600/20 border-none transition-all hover:scale-105 active:scale-95">
                View Contributions
              </Button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full text-lg px-10 py-5 rounded-2xl glass border-yellow-500/30 hover:bg-yellow-500/10 transition-all hover:scale-105 active:scale-95">
                View Gallery
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Analytics Dashboard */}
      <section className="w-full max-w-7xl px-4 py-20" id="contributions">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 glow-text text-orange-600 dark:text-orange-400">
            Transparency Matters
          </h2>
          <p className="text-foreground/70 max-w-2xl mx-auto">
            We believe in complete transparency. Every rupee contributed by you is accounted for and utilized for the divine celebration.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          <Link href="/analytics" className="block group">
            <GlassCard className="relative overflow-hidden group h-full hover:border-orange-500/50 transition-all cursor-pointer">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/40 transition-all" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl shadow-lg">
                  <Wallet className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground/80 group-hover:text-orange-500 transition-colors">Total Collection</h3>
              </div>
              <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600">
                {analytics.totalContributions}
              </p>
            </GlassCard>
          </Link>

          <Link href="/contributors" className="block group">
            <GlassCard className="relative overflow-hidden group h-full hover:border-blue-500/50 transition-all cursor-pointer">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground/80 group-hover:text-blue-500 transition-colors">Contributors</h3>
              </div>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {analytics.contributors}
              </p>
            </GlassCard>
          </Link>

          <Link href="/expenditure" className="block group">
            <GlassCard className="relative overflow-hidden group h-full hover:border-red-500/50 transition-all cursor-pointer">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-gradient-to-br from-red-400 to-red-600 rounded-xl shadow-lg">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-foreground/80 group-hover:text-red-500 transition-colors">Expenditure</h3>
              </div>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {analytics.expenditure}
              </p>
            </GlassCard>
          </Link>

          <GlassCard className="relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all" />
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-green-600 rounded-xl shadow-lg">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-foreground/80">Balance</h3>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {analytics.balance}
            </p>
          </GlassCard>
        </motion.div>
      </section>

      {/* Glimpses of Devotion */}
      <section className="w-full max-w-7xl px-4 pb-32">
        <div className="flex justify-between items-end mb-10 px-4">
          <div>
            <h2 className="text-3xl font-black glow-text text-orange-600 dark:text-orange-400">
              Glimpses of Devotion
            </h2>
            <p className="text-foreground/70">Beautiful moments captured during our celebrations.</p>
          </div>
          <Link href="/gallery" className="text-orange-600 dark:text-yellow-500 font-bold hover:underline flex items-center gap-2">
            View All Gallery <Play size={14} fill="currentColor" />
          </Link>
        </div>
        
        <div className="flex overflow-x-auto gap-8 pb-8 snap-x snap-mandatory hide-scrollbar px-4">
          {gallery.slice(0, 8).map((media) => (
            <motion.div 
              whileHover={{ y: -10 }}
              key={media.id} 
              className="snap-center shrink-0 w-[300px] sm:w-[350px] rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5"
            >
              <div className="aspect-[3/4] w-full relative">
                {media.type === 'video' ? (
                  <div className="w-full h-full relative">
                    <video src={media.url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform group-hover:scale-110 transition-transform">
                        <Play size={32} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <img 
                    src={media.url} 
                    alt={media.caption} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest">{media.year}</span>
                  {media.type === 'video' && <span className="text-white/60"><Video size={14} /></span>}
                </div>
                <h3 className="text-white text-xl font-black drop-shadow-lg">{media.caption}</h3>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Recent Contributions */}
      <section className="w-full max-w-7xl px-4 pb-20">
        <GlassCard className="max-w-3xl mx-auto border-t-4 border-t-orange-500">
          <h3 className="text-2xl font-bold mb-6 text-center">Recent Devotees</h3>
          <div className="space-y-4">
            {recentContributions.map((contribution, index) => (
              <motion.div 
                key={contribution.id}
                className="flex justify-between items-center p-4 rounded-xl bg-background/50 border border-border-color hover:border-orange-500/50 transition-colors"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-200 to-red-200 dark:from-orange-900 dark:to-red-900 flex items-center justify-center text-orange-800 dark:text-orange-200 font-bold">
                    {settings.showNamesPublicly ? contribution.name.charAt(0) : '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{settings.showNamesPublicly ? contribution.name : 'Anonymous Devotee'}</p>
                    <p className="text-xs text-foreground/50">{contribution.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-orange-600 dark:text-orange-400">{settings.showAmountsPublicly ? `₹${contribution.amount}` : '✓ Contributed'}</p>
                  <p className="text-xs text-foreground/50">Contributed</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/contributors">
              <Button variant="outline">View All Contributions</Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Community Suggestions Preview */}
      <section className="w-full max-w-7xl px-4 pb-32">
        <div className="flex justify-between items-end mb-10 px-4">
          <div>
            <h2 className="text-3xl font-black glow-text text-orange-600 dark:text-orange-400">
              Community Voice
            </h2>
            <p className="text-foreground/70">See what others are suggesting for the festival.</p>
          </div>
          <Link href="/suggestions" className="text-orange-600 dark:text-yellow-500 font-bold hover:underline flex items-center gap-2">
            View All & Submit <MessageSquarePlus size={14} />
          </Link>
        </div>

        {suggestions.length === 0 ? (
          <div className="text-center py-12 p-6 border border-dashed border-border-color rounded-xl opacity-70">
            <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-foreground/30" />
            <h3 className="text-lg font-medium">No suggestions yet!</h3>
            <p className="text-sm">Be the first to share your ideas with us.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suggestions.slice(0, 6).map((suggestion) => (
              <GlassCard key={suggestion.id} className="p-6 flex flex-col h-full hover:border-orange-500/30 transition-colors">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                    {suggestion.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{suggestion.name}</h3>
                    <p className="text-xs text-foreground/50">
                      {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : 'Recently'}
                    </p>
                  </div>
                </div>
                
                <p className="text-foreground/80 flex-1 mb-4 line-clamp-3">
                  {suggestion.suggestion}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-border-color">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleVote(suggestion.id, 'up')}
                      disabled={votedItems[suggestion.id] === 'up'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        votedItems[suggestion.id] === 'up' 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' 
                          : 'hover:bg-green-50 dark:hover:bg-green-900/20 text-foreground/60'
                      }`}
                    >
                      <ThumbsUp size={16} />
                      <span className="font-bold text-sm">{suggestion.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleVote(suggestion.id, 'down')}
                      disabled={votedItems[suggestion.id] === 'down'}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors ${
                        votedItems[suggestion.id] === 'down' 
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' 
                          : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-foreground/60'
                      }`}
                    >
                      <ThumbsDown size={16} />
                      <span className="font-bold text-sm">{suggestion.dislikes}</span>
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </section>

      {/* Contact Section */}
      <section className="w-full max-w-7xl px-4 pb-20 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          viewport={{ once: true, margin: "-50px" }}
        >
          <GlassCard className="border-t-4 border-t-orange-500 shadow-2xl relative overflow-hidden">
            {/* Background elements for cool effect */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -z-10" />
            
            <h3 className="text-3xl font-black mb-10 text-center glow-text text-orange-600 dark:text-orange-400">
              Get In Touch
            </h3>
            
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {[
                { 
                  name: "Contact 1", 
                  value: "+91 8183859491", 
                  href: "tel:+918183859491", 
                  icon: Phone, 
                  color: "from-green-500 to-emerald-600",
                  bgHover: "hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30",
                  border: "border-green-200 dark:border-green-800",
                  text: "text-green-700 dark:text-green-400"
                },
                { 
                  name: "Contact 2", 
                  value: "+91 9380753581", 
                  href: "tel:+919380753581", 
                  icon: Phone, 
                  color: "from-green-500 to-emerald-600",
                  bgHover: "hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30",
                  border: "border-green-200 dark:border-green-800",
                  text: "text-green-700 dark:text-green-400"
                },
                { 
                  name: "Contact 3", 
                  value: "+91 0000000000", 
                  href: "tel:+910000000000", 
                  icon: Phone, 
                  color: "from-green-500 to-emerald-600",
                  bgHover: "hover:from-green-100 hover:to-emerald-100 dark:hover:from-green-900/30 dark:hover:to-emerald-900/30",
                  border: "border-green-200 dark:border-green-800",
                  text: "text-green-700 dark:text-green-400"
                },
                { 
                  name: "YouTube", 
                  value: "@EkadanthaBoysGMP", 
                  href: "https://www.youtube.com/@EkadanthaBoysGMP", 
                  icon: Tv, 
                  color: "from-red-500 to-rose-600",
                  bgHover: "hover:from-red-100 hover:to-rose-100 dark:hover:from-red-900/30 dark:hover:to-rose-900/30",
                  border: "border-red-200 dark:border-red-800",
                  text: "text-red-700 dark:text-red-400"
                },
                { 
                  name: "Instagram", 
                  value: "@ekadanta_boys_gmp", 
                  href: "https://www.instagram.com/ekadanta_boys_gmp?igsh=MXVqaGF2MHc5em5yNQ==", 
                  icon: Camera, 
                  color: "from-pink-500 to-purple-600",
                  bgHover: "hover:from-pink-100 hover:to-purple-100 dark:hover:from-pink-900/30 dark:hover:to-purple-900/30",
                  border: "border-pink-200 dark:border-pink-800",
                  text: "text-pink-700 dark:text-pink-400"
                },
                { 
                  name: "Email", 
                  value: "ekadantaboysgmp@gmail.com", 
                  href: "mailto:ekadantaboysgmp@gmail.com", 
                  icon: Mail, 
                  color: "from-blue-500 to-indigo-600",
                  bgHover: "hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30",
                  border: "border-blue-200 dark:border-blue-800",
                  text: "text-blue-700 dark:text-blue-400"
                }
              ].map((contact, index) => (
                <motion.a 
                  key={index}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  href={contact.href} 
                  target={contact.href.startsWith("http") ? "_blank" : undefined}
                  rel={contact.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className={`flex items-center gap-4 p-5 rounded-2xl bg-gradient-to-r ${contact.bgHover} transition-all duration-300 group border ${contact.border} shadow-sm hover:shadow-xl relative z-10 bg-background/50 dark:bg-background/20 backdrop-blur-sm`}
                >
                  <div className={`p-4 bg-gradient-to-br ${contact.color} rounded-2xl shadow-lg shadow-black/10 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/60 font-medium uppercase tracking-wider mb-1">{contact.name}</p>
                    <p className={`font-black ${contact.text} truncate text-lg`}>{contact.value}</p>
                  </div>
                </motion.a>
              ))}
            </motion.div>
          </GlassCard>
        </motion.div>
      </section>
    </div>
  );
}
