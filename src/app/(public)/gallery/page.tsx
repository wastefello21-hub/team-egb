"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { useData, Photo } from '@/context/DataContext';
import { Play, X, Video, Image as ImageIcon } from 'lucide-react';

export default function GalleryPage() {
  const [selectedYear, setSelectedYear] = useState('All');
  const [selectedMedia, setSelectedMedia] = useState<Photo | null>(null);
  const { gallery } = useData();

  // Get unique years from gallery data
  const availableYears = ['All', ...Array.from(new Set(gallery.map(item => item.year))).sort((a, b) => b.localeCompare(a))];

  const filteredGallery = selectedYear === 'All' 
    ? gallery 
    : gallery.filter(item => item.year === selectedYear);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 pb-32">
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-black mb-6 bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-red-500 to-yellow-500"
        >
          Divine Memories
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-foreground/70 max-w-2xl mx-auto text-lg italic"
        >
          "Witness the grandeur and devotion of our journey through the years."
        </motion.p>
      </div>

      {/* Filters */}
      <div className="flex justify-center flex-wrap gap-3 mb-16">
        {availableYears.map(year => (
          <Button
            key={year}
            variant={selectedYear === year ? 'primary' : 'outline'}
            onClick={() => setSelectedYear(year)}
            className={`rounded-full px-8 py-2 transition-all duration-300 ${selectedYear === year ? 'scale-110 shadow-lg' : 'hover:scale-105'}`}
          >
            {year}
          </Button>
        ))}
      </div>

      {/* Grid Layout Grouped by Year */}
      <div className="space-y-20">
        {(selectedYear === 'All' ? availableYears.slice(1) : [selectedYear]).map(year => {
          const yearItems = gallery.filter(item => item.year === year);
          if (yearItems.length === 0) return null;
          
          return (
            <div key={year} className="space-y-8">
              <div className="flex items-center gap-6">
                <h2 className="text-3xl font-black text-orange-600 dark:text-yellow-500">{year}</h2>
                <div className="h-1 flex-1 bg-gradient-to-r from-orange-500/20 via-orange-500/5 to-transparent rounded-full" />
              </div>

              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {yearItems.map((item) => (
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      whileHover={{ y: -10 }}
                      key={item.id}
                      className="relative group cursor-pointer aspect-[4/5] rounded-3xl overflow-hidden shadow-xl border border-white/5"
                      onClick={() => setSelectedMedia(item)}
                    >
                      {item.type === 'video' ? (
                        <div className="w-full h-full relative bg-black/20">
                          <video src={item.url} className="w-full h-full object-cover" />
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
                          <img 
                            src={item.url} 
                            alt={item.caption} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 backdrop-blur-md text-white border border-white/10">
                            <ImageIcon size={18} />
                          </div>
                        </>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6">
                        <h3 className="text-white text-lg font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          {item.caption}
                        </h3>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Lightbox / Media Viewer */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/95 backdrop-blur-xl"
            onClick={() => setSelectedMedia(null)}
          >
            <button 
              className="absolute top-6 right-6 text-white hover:text-orange-500 bg-white/10 hover:bg-white/20 rounded-full p-3 transition-colors z-[110]"
              onClick={() => setSelectedMedia(null)}
            >
              <X size={24} />
            </button>
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-5xl h-full flex flex-col items-center justify-center gap-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full h-full flex items-center justify-center rounded-3xl overflow-hidden bg-black/40 shadow-2xl border border-white/10">
                {selectedMedia.type === 'video' ? (
                  <video 
                    src={selectedMedia.url} 
                    className="w-full max-h-[75vh] object-contain" 
                    controls 
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedMedia.url}
                    alt={selectedMedia.caption}
                    className="w-full h-full object-contain"
                  />
                )}
              </div>
              
              <div className="text-center max-w-2xl">
                <span className="text-orange-500 font-black tracking-widest uppercase text-sm mb-2 block">{selectedMedia.year}</span>
                <h3 className="text-white text-2xl md:text-3xl font-bold">{selectedMedia.caption}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
