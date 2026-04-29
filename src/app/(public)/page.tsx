"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { GlassCard } from '@/components/ui/GlassCard';
import { Users, TrendingUp, Heart, Wallet, Play, Video, MessageSquarePlus, ThumbsUp, ThumbsDown, Phone, Mail, X, Image as ImageIcon } from 'lucide-react';
import { YoutubeIcon, InstagramIcon } from '@/components/ui/SocialIcons';
import Link from 'next/link';
import { useData, Photo } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { extractVideoThumbnail } from '@/lib/videoThumbnail';

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function HomeMediaTile({
  media,
  onSelect,
}: {
  media: Photo;
  onSelect: () => void;
}) {
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);

  // Extract thumbnail for non-YouTube videos
  useEffect(() => {
    if (media.type === 'video' && !isYouTubeUrl(media.url) && !videoThumbnail) {
      setIsThumbnailLoading(true);
      extractVideoThumbnail(media.url, 0.5)
        .then(thumbnail => {
          setVideoThumbnail(thumbnail);
          setIsThumbnailLoading(false);
        })
        .catch(error => {
          console.error('Failed to extract video thumbnail:', error);
          setIsThumbnailLoading(false);
        });
    }
  }, [media.type, media.url, videoThumbnail]);

  return (
    <motion.div
      whileHover={{ y: -12 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="snap-center shrink-0 w-[280px] sm:w-[320px] rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5 cursor-pointer transition-shadow duration-300 hover:shadow-3xl"
      onClick={onSelect}
    >
      <div className="aspect-[3/4] w-full relative">
        {media.type === 'video' ? (
          <div className="w-full h-full relative bg-gradient-to-br from-black/80 via-zinc-900 to-black">
            {isYouTubeUrl(media.url) ? (
              <Image
                src={`https://img.youtube.com/vi/${getYouTubeId(media.url)}/hqdefault.jpg`}
                alt="YouTube Thumbnail"
                fill
                sizes="(max-width: 640px) 280px, 320px"
                className="object-cover opacity-80"
                quality={70}
                loading="lazy"
              />
            ) : videoThumbnail ? (
              <Image
                src={videoThumbnail}
                alt="Video Thumbnail"
                fill
                sizes="(max-width: 640px) 280px, 320px"
                className="object-cover opacity-80"
                quality={70}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white px-6 text-center">
                {isThumbnailLoading ? (
                  <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-2xl shadow-black/30 animate-pulse">
                    <Play size={30} fill="currentColor" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-2xl shadow-black/30">
                    <Play size={30} fill="currentColor" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-base">Video preview</p>
                  <p className="text-xs text-white/65">Opens in the gallery viewer</p>
                </div>
              </div>
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30 transform group-hover:scale-110 transition-transform">
                <Play size={32} fill="currentColor" />
              </div>
            </div>
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
              <Video size={18} />
            </div>
          </div>
        ) : (
          <>
            <Image
              src={media.url}
              alt={media.caption}
              fill
              sizes="(max-width: 640px) 280px, 320px"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              quality={75}
              loading="lazy"
            />
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
              <ImageIcon size={18} />
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent flex flex-col justify-end p-8 opacity-100">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest">
              {media.year}
            </span>
            {media.type === 'video' && <span className="text-white/60"><Video size={14} /></span>}
          </div>
          <h3 className="text-white text-xl font-black drop-shadow-lg">{media.caption}</h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function HomePage() {
  const { totalCollection, totalExpenditure, balance, contributions, gallery, settings, suggestions, voteSuggestion } = useData();
  const { isAdmin } = useAuth();
  const [votedItems, setVotedItems] = useState<Record<string, 'up' | 'down'>>({});
  const [selectedMedia, setSelectedMedia] = useState<typeof gallery[0] | null>(null);
  const [revealedCount, setRevealedCount] = useState(0);

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

  const showcaseItems = [...gallery].sort((a, b) => Number(b.year) - Number(a.year)).slice(0, 8);
  const showcaseKey = showcaseItems.map(item => item.id).join('|');

  useEffect(() => {
    setRevealedCount(showcaseItems.length > 0 ? 1 : 0);
  }, [showcaseKey]);

  useEffect(() => {
    if (revealedCount === 0 || revealedCount >= showcaseItems.length) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRevealedCount(prev => Math.min(prev + 1, showcaseItems.length));
    }, revealedCount === 1 ? 140 : 220);

    return () => window.clearTimeout(timeoutId);
  }, [revealedCount, showcaseItems.length]);

  return (
    <div className="flex flex-col items-center w-full scroll-smooth">
      {/* Hero Section */}
      <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 z-[-1]">
          <Image 
            src="/logo_v2.jpg" 
            alt="Festival Background" 
            fill
            className="object-cover opacity-60 md:opacity-70 scale-105"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/35 via-background/10 to-background" />
        </div>

        <motion.div 
          className="text-center px-6 md:px-12 max-w-5xl z-10 py-12 rounded-[2rem] bg-black/10 backdrop-blur-md border border-white/10 shadow-2xl shadow-black/20 glass-hover"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 rounded-full bg-white/15 dark:bg-white/10 border border-white/15 text-xs md:text-sm font-bold uppercase tracking-[0.28em] text-white/90 backdrop-blur-md">
            Ganesha Chaturthi Celebration
          </div>
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
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-4">
            <Link href="#contributions" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-8 py-4 rounded-2xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 shadow-xl shadow-orange-600/20 border-none transition-all duration-300 hover:scale-105 active:scale-95">
                View Contributions
              </Button>
            </Link>
            <Link href="/gallery" className="w-full sm:w-auto">
              <Button size="lg" className="w-full text-lg px-8 py-4 rounded-2xl bg-red-600 hover:bg-red-500 shadow-xl shadow-red-600/20 border-none transition-all duration-300 hover:scale-105 active:scale-95 text-white font-bold">
                View Gallery
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Analytics Dashboard */}
      <section className="section-shell w-full px-4 py-20" id="contributions">
        <div className="text-center mb-12">
          <h2 className="section-title text-3xl md:text-4xl font-bold mb-4 glow-text text-orange-600 dark:text-orange-400">
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
            <GlassCard className="relative overflow-hidden group h-full hover:border-orange-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500/20 rounded-full blur-xl group-hover:bg-orange-500/40 transition-all duration-300" />
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
            <GlassCard className="relative overflow-hidden group h-full hover:border-blue-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-500/20 rounded-full blur-xl group-hover:bg-blue-500/40 transition-all duration-300" />
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
            <GlassCard className="relative overflow-hidden group h-full hover:border-red-500/50 transition-all duration-300 cursor-pointer hover:-translate-y-1">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all duration-300" />
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

          <GlassCard className="relative overflow-hidden group hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-green-500/20 rounded-full blur-xl group-hover:bg-green-500/30 transition-all duration-300" />
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
      <section className="section-shell w-full px-4 pb-32">
        <div className="mb-10 px-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-center gap-6">
            <div className="text-center">
              <h2 className="section-title text-3xl font-black glow-text text-orange-600 dark:text-orange-400 leading-tight">
                Glimpses of Devotion
              </h2>
              <p className="mt-2 text-foreground/70 text-sm md:text-base max-w-2xl mx-auto">
                Beautiful moments captured during our celebrations.
              </p>
            </div>
            <Link href="/gallery" className="w-full md:w-auto md:ml-8">
              <Button className="w-full md:w-auto bg-red-600 hover:bg-red-500 text-white font-bold px-4 md:px-6 py-3 rounded-xl flex items-center justify-center gap-2 text-sm md:text-base transition-all duration-300 hover:scale-105">
                View All Gallery
                <Play size={16} fill="currentColor" />
              </Button>
            </Link>
          </div>
        </div>
        
        <div className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory hide-scrollbar px-4 -mx-4 px-4">
          {showcaseItems.map((media, index) => (
            index < revealedCount ? (
              <HomeMediaTile
                key={media.id}
                media={media}
                onSelect={() => setSelectedMedia(media)}
              />
            ) : (
              <div
                key={`${media.id}-placeholder`}
                className="snap-center shrink-0 w-[280px] sm:w-[320px] rounded-3xl overflow-hidden shadow-2xl relative group border border-white/5 bg-muted/20 animate-pulse"
              >
                <div className="aspect-[3/4] w-full bg-gradient-to-br from-muted/10 via-muted/20 to-muted/10" />
              </div>
            )
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
                    {settings.showNamesPublicly ? (contribution?.name?.charAt?.(0) || '?') : '?'}
                  </div>
                  <div>
                    <p className="font-semibold">{settings.showNamesPublicly ? (contribution?.name || 'Anonymous') : 'Anonymous Devotee'}</p>
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
            <Link href="/contributors" className="w-full sm:w-auto inline-block">
              <Button variant="outline" className="w-full sm:w-auto px-6 py-3">View All Contributions</Button>
            </Link>
          </div>
        </GlassCard>
      </section>

      {/* Community Suggestions Preview */}
      <section className="w-full max-w-7xl px-4 pb-32">
        <div className="mb-10 px-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black glow-text text-orange-600 dark:text-orange-400">
                Community Voice
              </h2>
              <p className="text-foreground/70">See what others are suggesting for the festival.</p>
            </div>
            <Link href="/suggestions" className="w-full md:w-auto">
              <Button className="w-full md:w-auto bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-bold px-4 md:px-6 py-3 rounded-xl shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 text-sm md:text-base">
                <MessageSquarePlus size={18} />
                View All & Submit
              </Button>
            </Link>
          </div>
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
                    {suggestion?.name?.charAt?.(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground">{suggestion?.name || 'Anonymous'}</h3>
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
            
            <h3 className="text-3xl font-black mb-8 text-center glow-text text-orange-600 dark:text-orange-400">
              Get In Touch
            </h3>
            
            {/* Clean horizontal layout */}
            <motion.div 
              className="flex flex-wrap justify-center items-stretch gap-4"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {/* Phone */}
              <motion.a 
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                href="tel:+918183859491" 
                className="flex-1 min-w-[200px] max-w-[280px] flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-3 bg-green-500 rounded-xl shadow-lg shadow-green-500/20">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-semibold uppercase tracking-wide">Call</p>
                  <p className="font-bold text-foreground">+91 8183859491</p>
                </div>
              </motion.a>

              {/* Email */}
              <motion.a 
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:ekadantaboysgmp@gmail.com" 
                className="flex-1 min-w-[200px] max-w-[280px] flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-3 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/20">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-semibold uppercase tracking-wide">Email</p>
                  <p className="font-bold text-foreground truncate">ekadantaboysgmp@gmail.com</p>
                </div>
              </motion.a>

              {/* YouTube */}
              <motion.a 
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.youtube.com/@EkadanthaBoysGMP" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] max-w-[280px] flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-3 bg-red-500 rounded-xl shadow-lg shadow-red-500/20">
                  <YoutubeIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-semibold uppercase tracking-wide">YouTube</p>
                  <p className="font-bold text-foreground">@EkadanthaBoysGMP</p>
                </div>
              </motion.a>

              {/* Instagram */}
              <motion.a 
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.98 }}
                href="https://www.instagram.com/ekadanta_boys_gmp?igsh=MXVqaGF2MHc5em5yNQ==" 
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 min-w-[200px] max-w-[280px] flex items-center gap-4 p-5 rounded-2xl bg-white dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 shadow-md hover:shadow-xl transition-all duration-300 group"
              >
                <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                  <InstagramIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-xs text-foreground/50 font-semibold uppercase tracking-wide">Instagram</p>
                  <p className="font-bold text-foreground">@ekadanta_boys_gmp</p>
                </div>
              </motion.a>
            </motion.div>
          </GlassCard>
        </motion.div>
      </section>

      {/* Media Lightbox Modal */}
      {selectedMedia && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="relative max-w-5xl w-full max-h-[90vh] rounded-2xl overflow-hidden bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedMedia(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white transition-colors"
            >
              ✕
            </button>
            
            {selectedMedia.type === 'video' ? (
              <div className="w-full aspect-video">
                {isYouTubeUrl(selectedMedia.url) ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1`}
                    className="w-full h-full"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
            ) : (
              <div className="relative w-full h-[70vh] md:h-[80vh]">
                <img 
                  src={selectedMedia.url} 
                  alt={selectedMedia.caption}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            
            <div className="p-4 bg-gradient-to-t from-black to-transparent">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-full bg-orange-600 text-white text-xs font-black uppercase tracking-widest">{selectedMedia.year}</span>
                {selectedMedia.type === 'video' && <span className="text-white/60"><Video size={14} /></span>}
              </div>
              <h3 className="text-white text-xl font-bold">{selectedMedia.caption}</h3>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
