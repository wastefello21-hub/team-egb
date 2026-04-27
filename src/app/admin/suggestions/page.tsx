"use client";

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Trash2, ThumbsUp, ThumbsDown, Phone, User } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSuggestionsPage() {
  const { suggestions, deleteSuggestion } = useData();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deletingId) {
      deleteSuggestion(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Manage Suggestions</h2>
          <p className="text-sm text-foreground/60">View all community suggestions and feedback.</p>
        </div>
        <div className="text-sm text-foreground/60 bg-background/50 px-4 py-2 rounded-full">
          Total: {suggestions.length} suggestions
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-border-color rounded-3xl">
          <p className="text-foreground/50">No suggestions yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {suggestions.map((suggestion) => (
            <GlassCard key={suggestion.id} className="p-6 relative overflow-hidden">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Main Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold">
                          {suggestion?.name?.charAt?.(0)?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <h3 className="font-bold text-lg">{suggestion?.name || 'Anonymous'}</h3>
                        <p className="text-xs text-foreground/50 flex items-center gap-1">
                          {suggestion.created_at ? format(new Date(suggestion.created_at), 'MMM d, yyyy h:mm a') : 'Recently'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 px-3 py-1 rounded-full">
                      <Phone size={14} />
                      <span className="text-sm font-mono">{suggestion.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="mt-4 p-4 bg-background/50 rounded-xl border border-border-color">
                    <p className="text-foreground/90 whitespace-pre-wrap">{suggestion.suggestion}</p>
                  </div>
                </div>

                {/* Actions & Stats */}
                <div className="flex flex-row md:flex-col justify-between md:justify-start gap-4 md:min-w-[140px] border-t md:border-t-0 md:border-l border-border-color pt-4 md:pt-0 md:pl-6">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-green-600 bg-green-50 dark:bg-green-900/20 px-3 py-1.5 rounded-lg">
                      <ThumbsUp size={16} />
                      <span className="font-bold">{suggestion.likes}</span>
                    </div>
                    <div className="flex items-center gap-1 text-red-600 bg-red-50 dark:bg-red-900/20 px-3 py-1.5 rounded-lg">
                      <ThumbsDown size={16} />
                      <span className="font-bold">{suggestion.dislikes}</span>
                    </div>
                  </div>

                  <button 
                    onClick={() => setDeletingId(suggestion.id)}
                    className="flex items-center justify-center gap-2 p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                    <span className="text-sm font-medium">Delete</span>
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-2 text-red-500">Delete Suggestion</h3>
            <p className="text-foreground/70 mb-6 text-sm">Are you sure you want to delete this suggestion? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => setDeletingId(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}