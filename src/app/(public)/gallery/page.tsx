"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { useData, Photo } from '@/context/DataContext';
import { Play, X, Video, Image as ImageIcon, Loader2 } from 'lucide-react';
import { extractVideoThumbnail } from '@/lib/videoThumbnail';

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const ITEMS_PER_PAGE = 8;

function GalleryMediaTile({
  item,
  onSelect,
}: {
  item: Photo;
  onSelect: () => void;
}) {
  const tileRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);

  useEffect(() => {
    const node = tileRef.current;
    if (!node || isInView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [isInView]);

  // Extract thumbnail for non-YouTube videos
  useEffect(() => {
    if (isInView && item.type === 'video' && !isYouTubeUrl(item.url) && !videoThumbnail) {
      setIsThumbnailLoading(true);
      extractVideoThumbnail(item.url, 0.5)
        .then(thumbnail => {
          setVideoThumbnail(thumbnail);
          setIsThumbnailLoading(false);
        })
        .catch(error => {
          console.error('Failed to extract video thumbnail:', error);
          setIsThumbnailLoading(false);
        });
    }
  }, [isInView, item.type, item.url, videoThumbnail]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative group cursor-pointer aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-white/5 bg-black/10"
        onClick={onSelect}
        ref={tileRef}
      >
        {!isInView ? (
          <div className="absolute inset-0 bg-gradient-to-br from-muted/10 via-muted/20 to-muted/10 animate-pulse" />
        ) : item.type === 'video' ? (
          <div className="w-full h-full relative bg-gradient-to-br from-black/80 via-zinc-900 to-black">
            {isYouTubeUrl(item.url) ? (
              <Image
                src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`}
                alt="YouTube Video Thumbnail"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-80"
                quality={70}
                loading="lazy"
              />
            ) : videoThumbnail ? (
              <Image
                src={videoThumbnail}
                alt="Video Thumbnail"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover opacity-80"
                quality={70}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-white bg-gradient-to-br from-zinc-700 via-zinc-800 to-zinc-900">
                {isThumbnailLoading ? (
                  <>
                    <Loader2 size={36} className="animate-spin" />
                    <p className="text-sm text-white/65">Generating thumbnail...</p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/15 shadow-2xl shadow-black/30">
                      <Play size={36} fill="currentColor" />
                    </div>
                    <div className="text-center px-6">
                      <p className="text-lg font-bold">Video</p>
                      <p className="text-sm text-white/65">Click to play</p>
                    </div>
                  </>
                )}
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
              src={item.url}
              alt={item.caption}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              quality={75}
              loading="lazy"
            />
            <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
              <ImageIcon size={18} />
            </div>
          </>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
          <h3 className="text-white text-lg font-bold">{item.caption}</h3>
        </div>
      </div>
    </motion.div>
  );
}

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<Photo | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { gallery } = useData();

  // Get unique years from gallery data
  const availableYears = useMemo(
    () => ['All', ...Array.from(new Set(gallery.map(item => item.year))).sort((a, b) => b.localeCompare(a))],
    [gallery]
  );

  // Get filtered items for a specific year
  const getFilteredItemsForYear = useCallback(
    (year: string) => {
      if (year === 'All') return gallery;
      return gallery.filter(item => item.year === year);
    },
    [gallery]
  );

  // Get visible count for a specific year
  const getVisibleCount = useCallback(
    (year: string) => visibleCounts[year] || ITEMS_PER_PAGE,
    [visibleCounts]
  );

  // Get visible items for a specific year
  const getVisibleItemsForYear = useCallback(
    (year: string) => {
      const filtered = getFilteredItemsForYear(year);
      const count = getVisibleCount(year);
      return filtered.slice(0, count);
    },
    [getFilteredItemsForYear, getVisibleCount]
  );

  // Check if a year has more items
  const hasMoreForYear = useCallback(
    (year: string) => {
      const filtered = getFilteredItemsForYear(year);
      const count = getVisibleCount(year);
      return count < filtered.length;
    },
    [getFilteredItemsForYear, getVisibleCount]
  );

  // Reset visible counts when year changes
  useEffect(() => {
    setVisibleCounts({});
  }, [selectedYear]);

  // Auto-adjust visible counts when new photos are uploaded
  useEffect(() => {
    if (gallery.length === 0) return;
    
    setVisibleCounts(prev => {
      const newCounts = { ...prev };
      let hasChanges = false;
      
      availableYears.forEach(year => {
        if (year === 'All') return;
        const totalItems = getFilteredItemsForYear(year).length;
        const currentVisible = prev[year] || ITEMS_PER_PAGE;
        
        // If there are more items than currently visible, show all of them
        if (totalItems > currentVisible) {
          newCounts[year] = totalItems;
          hasChanges = true;
        }
      });
      
      return hasChanges ? newCounts : prev;
    });
  }, [gallery.length, availableYears, getFilteredItemsForYear]); // Only trigger when gallery length changes

  const loadMoreForYear = useCallback(
    async (year: string) => {
      if (isLoadingMore || !hasMoreForYear(year)) return;
      setIsLoadingMore(true);

      setVisibleCounts(prev => ({
        ...prev,
        [year]: Math.min((prev[year] || ITEMS_PER_PAGE) + ITEMS_PER_PAGE, getFilteredItemsForYear(year).length)
      }));
      setIsLoadingMore(false);
    },
    [isLoadingMore, hasMoreForYear, getFilteredItemsForYear]
  );

  // Determine which years to display
  const yearsToDisplay = useMemo(
    () => (selectedYear === 'All' ? availableYears.slice(1) : [selectedYear]),
    [selectedYear, availableYears]
  );

  // Check if any year has more items to load
  const hasAnyMore = useMemo(
    () => yearsToDisplay.some(year => hasMoreForYear(year)),
    [yearsToDisplay, hasMoreForYear]
  );

  useEffect(() => {
    if (!hasAnyMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          // Load more for the first year that has more items
          const yearWithMore = yearsToDisplay.find(year => hasMoreForYear(year));
          if (yearWithMore) {
            loadMoreForYear(yearWithMore);
          }
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnyMore, isLoadingMore, yearsToDisplay, hasMoreForYear, loadMoreForYear]);

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

      {/* Grid Layout - Paginated by Year */}
      <div className="space-y-20">
        {yearsToDisplay.map(year => {
          const yearItems = getVisibleItemsForYear(year);
          const totalItems = getFilteredItemsForYear(year).length;
          const hasMore = hasMoreForYear(year);
          
          if (yearItems.length === 0) return null;
          
          return (
            <div key={year} className="space-y-8">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-orange-600 dark:text-yellow-500">{year}</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-transparent rounded-full" />
                <span className="text-sm text-muted-foreground">{totalItems} items</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {yearItems.map((item) => (
                  <GalleryMediaTile
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedMedia(item)}
                  />
                ))}
              </div>

              {/* Load More Trigger for Year */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-8">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <Button variant="outline" onClick={() => loadMoreForYear(year)}>
                      Load More ({totalItems - yearItems.length} remaining)
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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