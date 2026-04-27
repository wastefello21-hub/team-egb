"use client";

import React from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Upload, Trash2, X, Play, Image as ImageIcon, Video } from 'lucide-react';
import { useData } from '@/context/DataContext';

const isYouTubeUrl = (url: string) => {
  return url.includes('youtube.com') || url.includes('youtu.be');
};

const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ManageGalleryPage() {
  const { gallery, addPhoto, deletePhoto } = useData();
  const [isUploading, setIsUploading] = React.useState(false);
  const [deletingId, setDeletingId] = React.useState<string | null>(null);
  const [newMedia, setNewMedia] = React.useState({ year: '2026', caption: '', url: '', type: 'image' as 'image' | 'video' });
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const confirmDelete = () => {
    if (deletingId) {
      deletePhoto(deletingId);
      setDeletingId(null);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      const reader = new FileReader();
      reader.onloadend = () => {
        img.src = reader.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxWidth = 800;
        const maxHeight = 600;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      img.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        try {
          const compressedUrl = await compressImage(file);
          setNewMedia(prev => ({ ...prev, url: compressedUrl, type: 'image' }));
          setUploadError('');
          setIsUploading(true);
        } catch {
          setUploadError('Failed to process image.');
        }
      } else if (file.type.startsWith('video/')) {
        // Video files are often too large for local base64 storage
        if (file.size > 5 * 1024 * 1024) { // 5MB limit
          setUploadError('Video file is too large (max 5MB). Please use an external link instead.');
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          setNewMedia(prev => ({ ...prev, url: event.target?.result as string, type: 'video' }));
          setUploadError('');
          setIsUploading(true);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleSaveUpload = () => {
    setUploadError('');
    if (!newMedia.caption.trim()) {
      setUploadError('Please provide a caption.');
      return;
    }
    if (!newMedia.url) {
      setUploadError('No media selected.');
      return;
    }

    try {
      addPhoto({
        id: `GAL-${Date.now()}`,
        year: newMedia.year,
        caption: newMedia.caption.trim(),
        url: newMedia.url,
        type: newMedia.type
      });
      setIsUploading(false);
      setNewMedia({ year: '2026', caption: '', url: '', type: 'image' });
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      setUploadError('Storage limit reached. Use external URLs for large media.');
    }
  };

  // Group gallery by years
  const years = Array.from(new Set(gallery.map(item => item.year))).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-10 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Manage Media Gallery</h2>
          <p className="text-sm text-foreground/60">Organize photos and videos by year for the community.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <input 
            type="file" 
            accept="image/*,video/*" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <Button onClick={() => {
            setNewMedia({ year: '2026', caption: '', url: '', type: 'video' });
            setUploadError('');
            setIsUploading(true);
          }} variant="outline" className="flex-1 sm:flex-none flex items-center gap-2 border-orange-500/50 text-orange-600">
            <Upload size={18} />
            Link Video
          </Button>
          <Button onClick={() => fileInputRef.current?.click()} className="flex-1 sm:flex-none flex items-center gap-2">
            <Upload size={18} />
            Upload File
          </Button>
        </div>
      </div>

      {years.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border-color rounded-3xl">
          <ImageIcon size={48} className="mx-auto mb-4 text-foreground/20" />
          <p className="text-foreground/50">Your gallery is empty. Start by adding some memories!</p>
        </div>
      ) : (
        years.map(year => (
          <div key={year} className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-bold text-foreground/80">{year}</h3>
              <div className="h-px flex-1 bg-gradient-to-r from-border-color to-transparent" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.filter(item => item.year === year).map((item) => (
                <GlassCard key={item.id} className="p-3 group relative overflow-hidden flex flex-col h-full">
                  <div className="aspect-video w-full rounded-xl overflow-hidden mb-3 relative bg-black/5">
                    {item.type === 'video' ? (
                      <>
                        {isYouTubeUrl(item.url) ? (
                          <img src={`https://img.youtube.com/vi/${getYouTubeId(item.url)}/hqdefault.jpg`} className="w-full h-full object-cover opacity-75" alt="YouTube Thumbnail" />
                        ) : (
                          <video src={item.url} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                            <Play size={20} fill="currentColor" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt={item.caption} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white">
                        {item.type === 'video' ? <Video size={14} /> : <ImageIcon size={14} />}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-auto">
                    <p className="font-semibold text-sm line-clamp-1">{item.caption}</p>
                    <button 
                      onClick={() => setDeletingId(item.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-2 text-red-500">Delete Media</h3>
            <p className="text-foreground/70 mb-6 text-sm">Are you sure you want to delete this {gallery.find(i => i.id === deletingId)?.type}? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => setDeletingId(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Upload Details Modal */}
      {isUploading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6 relative">
            <button onClick={() => setIsUploading(false)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">Media Details</h3>
            
            {uploadError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {uploadError}
              </div>
            )}
            
            <div className="mb-6 aspect-video w-full rounded-xl overflow-hidden border border-border-color bg-black/5 flex items-center justify-center">
              {newMedia.url ? (
                newMedia.type === 'video' ? (
                  isYouTubeUrl(newMedia.url) ? (
                    <iframe 
                      src={`https://www.youtube.com/embed/${getYouTubeId(newMedia.url)}`}
                      className="w-full h-full object-cover"
                      allowFullScreen
                    />
                  ) : (
                    <video src={newMedia.url} className="w-full h-full object-cover" controls />
                  )
                ) : (
                  <img src={newMedia.url} alt="Preview" className="w-full h-full object-cover" />
                )
              ) : (
                <div className="text-center text-foreground/40 text-sm p-4">
                  No media URL provided.
                  <br/>Paste a video link below.
                </div>
              )}
            </div>

            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5 ml-1">Media URL (For external videos/links)</label>
                <input 
                  type="url" 
                  value={newMedia.url}
                  onChange={(e) => setNewMedia({...newMedia, url: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                  placeholder="e.g. https://www.youtube.com/watch... or direct .mp4 link"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5 ml-1">Caption</label>
                <input 
                  type="text" 
                  value={newMedia.caption}
                  onChange={(e) => setNewMedia({...newMedia, caption: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="e.g. Maha Aarti 2026"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5 ml-1">Year</label>
                  <select 
                    value={newMedia.year}
                    onChange={(e) => setNewMedia({...newMedia, year: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map(y => (
                      <option key={y} value={y.toString()}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-foreground/50 mb-1.5 ml-1">Media Type</label>
                  <select 
                    value={newMedia.type}
                    onChange={(e) => setNewMedia({...newMedia, type: e.target.value as 'image' | 'video'})}
                    className="w-full px-4 py-2.5 rounded-xl bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={() => setIsUploading(false)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleSaveUpload} className="flex-1">Save to Gallery</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
