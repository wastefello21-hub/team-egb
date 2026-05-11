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

const GalleryMediaTile = React.memo(function GalleryMediaTile({
  item,
  onSelect,
  priority = false,
}: {
  item: Photo;
  onSelect: () => void;
  priority?: boolean;
}) {
  const tileRef = React.useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(priority);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [isThumbnailLoading, setIsThumbnailLoading] = useState(false);
  const [thumbnailError, setThumbnailError] = useState(false);

  // Intersection observer for lazy loading
  useEffect(() => {
    const node = tileRef.current;
    if (!node || isInView || priority) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [isInView, priority]);

  // Extract thumbnail for videos
  useEffect(() => {
    if (!isInView || item.type !== 'video' || isYouTubeUrl(item.url) || videoThumbnail || thumbnailError) {
      return;
    }

    setIsThumbnailLoading(true);
    const delay = setTimeout(async () => {
      try {
        const thumbnail = await extractVideoThumbnail(item.url, 0.5);
        setVideoThumbnail(thumbnail);
        setThumbnailError(false);
      } catch (error) {
        console.warn('Video thumbnail extraction failed:', error);
        setThumbnailError(true);
      } finally {
        setIsThumbnailLoading(false);
      }
    }, Math.random() * 200);

    return () => clearTimeout(delay);
  }, [isInView, item.type, item.url, videoThumbnail, thumbnailError]);

  // Determine thumbnail source
  const youtubeId = isYouTubeUrl(item.url) ? getYouTubeId(item.url) : null;
  const youtubeThumb = youtubeId ? `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const displaySrc = item.type === 'video' 
    ? (videoThumbnail || youtubeThumb) 
    : item.url;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative group cursor-pointer rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-white/5"
      onClick={onSelect}
      ref={tileRef}
    >
      {/* Loading skeleton */}
      {!isInView && (
        <div className="w-full aspect-square bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 animate-pulse" />
      )}

      {/* Content */}
      {isInView && (
        <>
          {item.type === 'video' ? (
            <div className="relative w-full aspect-square bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden">
              {displaySrc ? (
                <Image
                  src={displaySrc}
                  alt="Video thumbnail"
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-contain w-full h-full transition-transform duration-500 group-hover:scale-110"
                  quality={priority ? 85 : 75}
                  priority={priority}
                  loading={priority ? 'eager' : 'lazy'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                  <div className="text-center">
                    <Video className="w-12 h-12 text-slate-500 mx-auto mb-2" />
                    <p className="text-xs text-slate-400">Video</p>
                  </div>
                </div>
              )}

              {/* Loading indicator */}
              {isThumbnailLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 size={20} className="animate-spin text-white" />
                    <span className="text-xs text-white/70">Loading</span>
                  </div>
                </div>
              )}

              {/* Play button */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40 transition-colors duration-200">
                <div className="w-14 h-14 rounded-full bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center group-hover:scale-125 transition-transform duration-300 shadow-lg">
                  <Play size={28} className="text-white fill-white" />
                </div>
              </div>

              {/* Video badge */}
              <div className="absolute top-3 right-3 px-2 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white">
                <Video size={14} />
              </div>
            </div>
          ) : (
            <div className="relative w-full aspect-square bg-slate-900 overflow-hidden">
              <Image
                src={item.url}
                alt={item.caption}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
                quality={priority ? 85 : 75}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
              />

              {/* Image badge */}
              <div className="absolute top-3 right-3 px-2 py-1.5 rounded-lg bg-black/50 backdrop-blur-md border border-white/20 text-white">
                <ImageIcon size={14} />
              </div>
            </div>
          )}

          {/* Caption overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-bold text-sm leading-tight line-clamp-2">{item.caption}</h3>
          </div>
        </>
      )}
    </motion.div>
  );
});

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<Photo | null>(null);
  const [visibleCounts, setVisibleCounts] = useState<Record<string, number>>({});
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const { gallery } = useData();

  // Compute available years
  const availableYears = useMemo(
    () => ['All', ...Array.from(new Set(gallery.map(item => item.year))).sort((a, b) => b.localeCompare(a))],
    [gallery]
  );

  // Filter items by year
  const getFilteredItemsForYear = useCallback(
    (year: string) => {
      if (year === 'All') return gallery;
      return gallery.filter(item => item.year === year);
    },
    [gallery]
  );

  // Get visible count for year
  const getVisibleCount = useCallback(
    (year: string) => visibleCounts[year] || ITEMS_PER_PAGE,
    [visibleCounts]
  );

  // Get visible items for year
  const getVisibleItemsForYear = useCallback(
    (year: string) => {
      const filtered = getFilteredItemsForYear(year);
      const count = getVisibleCount(year);
      return filtered.slice(0, count);
    },
    [getFilteredItemsForYear, getVisibleCount]
  );

  // Check if there are more items for year
  const hasMoreForYear = useCallback(
    (year: string) => {
      const filtered = getFilteredItemsForYear(year);
      const count = getVisibleCount(year);
      return count < filtered.length;
    },
    [getFilteredItemsForYear, getVisibleCount]
  );

  // Reset when year changes
  useEffect(() => {
    setVisibleCounts({});
  }, [selectedYear]);

  // Load more items
  const loadMoreForYear = useCallback(
    async (year: string) => {
      if (isLoadingMore || !hasMoreForYear(year)) return;
      setIsLoadingMore(true);

      requestAnimationFrame(() => {
        setVisibleCounts(prev => ({
          ...prev,
          [year]: Math.min(
            (prev[year] || ITEMS_PER_PAGE) + ITEMS_PER_PAGE,
            getFilteredItemsForYear(year).length
          )
        }));
        setIsLoadingMore(false);
      });
    },
    [isLoadingMore, hasMoreForYear, getFilteredItemsForYear]
  );

  // Compute years to display
  const yearsToDisplay = useMemo(
    () => (selectedYear === 'All' ? availableYears.slice(1) : [selectedYear]),
    [selectedYear, availableYears]
  );

  // Check if any year has more items
  const hasAnyMore = useMemo(
    () => yearsToDisplay.some(year => hasMoreForYear(year)),
    [yearsToDisplay, hasMoreForYear]
  );

  // Intersection observer for load more button
  useEffect(() => {
    if (!hasAnyMore) return;

    let timeoutId: NodeJS.Timeout;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
            const yearWithMore = yearsToDisplay.find(year => hasMoreForYear(year));
            if (yearWithMore) {
              loadMoreForYear(yearWithMore);
            }
          }, 100);
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, [hasAnyMore, isLoadingMore, yearsToDisplay, hasMoreForYear, loadMoreForYear]);

  // Empty state
  if (!gallery || gallery.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 pb-32 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500">
          Divine Memories
        </h1>
        <p className="text-foreground/70 text-lg">Loading gallery...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-16 pb-32">
      {/* Header */}
      <div className="text-center mb-20">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl md:text-7xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500"
        >
          Divine Memories
        </motion.h1>
        <p className="text-foreground/70 max-w-2xl mx-auto text-lg italic">
          "Witness the grandeur and devotion of our journey through the years."
        </p>
      </div>

      {/* Year filters */}
      <div className="flex justify-center flex-wrap gap-3 mb-20">
        {availableYears.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'primary' : 'outline'}
            onClick={() => setSelectedYear(year)}
            className="rounded-full px-8 py-2 transition-all"
          >
            {year}
          </Button>
        ))}
      </div>

      {/* Gallery grid by year */}
      <div className="space-y-24">
        {yearsToDisplay.map(year => {
          const yearItems = getVisibleItemsForYear(year);
          const totalItems = getFilteredItemsForYear(year).length;
          const hasMore = hasMoreForYear(year);
          
          if (yearItems.length === 0) return null;
          
          return (
            <div key={year} className="space-y-12">
              {/* Year header */}
              <div className="flex items-center gap-6">
                <h2 className="text-4xl font-black text-orange-600 dark:text-yellow-500 whitespace-nowrap">{year}</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/40 via-orange-500/10 to-transparent rounded-full" />
                <span className="text-sm text-muted-foreground whitespace-nowrap">{totalItems} items</span>
              </div>

              {/* Media grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 xl:gap-8">
                {yearItems.map((item, index) => (
                  <GalleryMediaTile
                    key={item.id}
                    item={item}
                    onSelect={() => setSelectedMedia(item)}
                    priority={index === 0 && year === yearsToDisplay[0]}
                  />
                ))}
              </div>

              {/* Load more */}
              {hasMore && (
                <div ref={loadMoreRef} className="flex justify-center py-12">
                  {isLoadingMore ? (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="animate-spin" size={20} />
                      <span>Loading more...</span>
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => loadMoreForYear(year)}
                      className="px-8 py-2 rounded-full"
                    >
                      Load More ({totalItems - yearItems.length} remaining)
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox modal */}
      {selectedMedia && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
          onClick={() => setSelectedMedia(null)}
        >
          <button 
            className="absolute top-6 right-6 text-white hover:text-orange-500 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all z-[110]"
            onClick={() => setSelectedMedia(null)}
          >
            <X size={28} />
          </button>
          
          <div 
            className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-8"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media container */}
            <div className="w-full h-full flex items-center justify-center rounded-2xl overflow-hidden bg-black/40 shadow-2xl border border-white/10">
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
            
            {/* Caption */}
            <motion.div 
              className="text-center max-w-2xl px-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <span className="text-orange-500 font-black tracking-widest uppercase text-sm mb-3 block">{selectedMedia.year}</span>
              <h3 className="text-white text-2xl md:text-4xl font-bold leading-tight">{selectedMedia.caption}</h3>
            </motion.div>
          </div>
        </motion.div>
      )}
    </div>
  );
}