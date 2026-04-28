"use client";

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useData, Photo } from '@/context/DataContext';
import { Play, X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ITEMS_PER_PAGE = 8;

// Skeleton placeholder while loading
function GalleryItemSkeleton() {
  return (
    <div className="relative group cursor-pointer aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-muted/20 animate-pulse">
      <div className="absolute inset-0 bg-gradient-to-r from-muted/10 via-muted/20 to-muted/10 skeleton-shimmer" />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full bg-muted/30" />
      </div>
    </div>
  );
}

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<Photo | null>(null);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [newlyLoadedIds, setNewlyLoadedIds] = useState<Set<string>>(new Set());
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { gallery } = useData();

  // Get unique years from gallery data
  const availableYears = ['All', ...Array.from(new Set(gallery.map(item => item.year))).sort((a, b) => b.localeCompare(a))];

  // Get filtered and flattened items for pagination
  const getFilteredItems = () => {
    if (selectedYear === 'All') return gallery;
    return gallery.filter(item => item.year === selectedYear);
  };

  const filteredItems = getFilteredItems();
  const visibleItems = filteredItems.slice(0, visibleCount);
  const hasMore = visibleCount < filteredItems.length;

  // Reset visible count when year changes
  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [selectedYear]);

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, visibleCount]);

  const loadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    
    // Get the items that will be newly loaded
    const newItems = filteredItems.slice(visibleCount, visibleCount + ITEMS_PER_PAGE);
    const newIds = new Set(newItems.map(item => item.id));
    
    // Simulate small delay for smooth UX
    await new Promise(resolve => setTimeout(resolve, 300));
    
    setVisibleCount(prev => Math.min(prev + ITEMS_PER_PAGE, filteredItems.length));
    setNewlyLoadedIds(prev => new Set([...prev, ...newIds]));
    
    // Clear the "new" highlight after animation
    setTimeout(() => {
      setNewlyLoadedIds(new Set());
    }, 1500);
    
    setIsLoadingMore(false);
  };

  if (!gallery || gallery.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500">
          Divine Memories
        </h1>
        <p className="text-foreground/70">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500"
        >
          Divine Memories
        </motion.h1>
        <p className="text-foreground/70 max-w-2xl mx-auto text-lg italic">
          "Witness the grandeur and devotion of our journey through the years."
        </p>
      </div>

      {/* Filters */}
      <div className="flex justify-center flex-wrap gap-3 mb-16">
        {availableYears.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'primary' : 'outline'}
            onClick={() => setSelectedYear(year)}
            className="rounded-full px-8 py-2"
          >
            {year}
          </Button>
        ))}
      </div>

      {/* Grid Layout - Paginated */}
      <div className="space-y-20">
        {(selectedYear === 'All' ? availableYears.slice(1) : [selectedYear]).map(year => {
          const yearItems = filteredItems.filter(item => item.year === year);
          const visibleYearItems = visibleItems.filter(item => item.year === year);
          
          if (yearItems.length === 0) return null;
          
          return (
            <div key={year} className="space-y-8">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-orange-600 dark:text-yellow-500">{year}</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-transparent rounded-full" />
                <span className="text-sm text-muted-foreground">{yearItems.length} items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {/* Show skeleton placeholders while loading */}
                {isLoadingMore && Array.from({ length: Math.min(ITEMS_PER_PAGE, yearItems.length - visibleYearItems.length) }).map((_, i) => (
                  <GalleryItemSkeleton key={`skeleton-${year}-${i}`} />
                ))}
                
                {visibleYearItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ 
                      opacity: newlyLoadedIds.has(item.id) ? [0, 1, 1] : 1, 
                      y: newlyLoadedIds.has(item.id) ? [20, 0, 0] : 0,
                      scale: newlyLoadedIds.has(item.id) ? [0.95, 1, 1] : 1
                    }}
                    transition={{ 
                      duration: newlyLoadedIds.has(item.id) ? 0.8 : 0.3,
                      ease: "easeOut"
                    }}
                  >
                    <div
                    className="relative group cursor-pointer aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-white/5"
                    onClick={() => setSelectedMedia(item)}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full relative bg-black/20">
                        {isYouTubeUrl(item.url) ? (
                          <Image 
                            src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} 
                            alt="YouTube Video Thumbnail"
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                            className="object-cover opacity-75"
                            quality={70}
                          />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/30 transition-colors">
                          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/30">
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
                          src={item.url} 
                          alt={item.caption} 
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover"
                          quality={75}
                        />
                        <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
                          <ImageIcon size={18} />
                        </div>
                      </>
                    )}
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                      <h3 className="text-white text-lg font-bold">
                        {item.caption}
                      </h3>
                    </div>
                  </div>
                  </motion.div>
                ))}
              </div>

              {/* Load More Trigger for Year */}
              {selectedYear === year && hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={loadMore}>
                      Load More
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Global Load More for "All" view */}
      {selectedYear === 'All' && hasMore && (
        <div ref={loadMoreRef} className="flex justify-center py-12">
          {isLoadingMore ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="animate-spin" size={24} />
              <span>Loading more...</span>
            </div>
          ) : (
            <Button variant="primary" onClick={loadMore} className="px-8">
              Load More ({filteredItems.length - visibleCount} remaining)
            </Button>
          )}
        </div>
      )}

      {/* Lightbox / Media Viewer */}
      {selectedMedia && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-orange-500 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-[110]"
            onClick={() => setSelectedMedia(null)}
          >
            <X size={24} />
          </button>
          
          <div 
            className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-full flex items-center justify-center rounded-3xl overflow-hidden bg-black/40 shadow-2xl border border-white/10">
              {selectedMedia.type === 'video' ? (
                isYouTubeUrl(selectedMedia.url) ? (
                  <iframe 
                    src={`https://www.youtube.com/embed/${getYouTubeId(selectedMedia.url)}?autoplay=1`} 
                    className="w-full h-full min-h-[50vh] max-h-[75vh]" 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen
                  />
                ) : (
                  <video 
                    src={selectedMedia.url} 
                    className="w-full max-h-[75vh] object-contain" 
                    controls 
                    autoPlay
                  />
                )
              ) : (
                <Image
                  src={selectedMedia.url}
                  alt={selectedMedia.caption}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  quality={80}
                />
              )}
            </div>
            
            <div className="text-center max-w-2xl">
              <span className="text-orange-500 font-black tracking-widest uppercase text-sm mb-2 block">{selectedMedia.year}</span>
              <h3 className="text-white text-2xl md:text-3xl font-bold">{selectedMedia.caption}</h3>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}