"use client";

import React, { useState } from 'react';
import { useData } from '@/context/DataContext';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { ThumbsUp, ThumbsDown, Trash2, MessageSquarePlus } from 'lucide-react';
import { format } from 'date-fns';

export default function SuggestionsPage() {
  const { suggestions, addSuggestion, voteSuggestion, deleteSuggestion } = useData();
  const { isAdmin } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    suggestion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [votedItems, setVotedItems] = useState<Record<string, 'up' | 'down'>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.suggestion) return;

    try {
      setIsSubmitting(true);
      await addSuggestion(formData);
      setFormData({ name: '', phone: '', suggestion: '' });
      alert("Thank you! Your suggestion has been submitted.");
    } catch (error) {
      console.error("Error submitting suggestion:", error);
      alert("Failed to submit suggestion. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (id: string, type: 'up' | 'down') => {
    if (votedItems[id] === type) return; // Prevent multiple same votes
    
    try {
      await voteSuggestion(id, type === 'up' ? 'like' : 'dislike');
      setVotedItems(prev => ({ ...prev, [id]: type }));
    } catch (error) {
      console.error("Error voting:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this suggestion?")) return;
    
    try {
      await deleteSuggestion(id);
    } catch (error) {
      console.error("Error deleting suggestion:", error);
      alert("Failed to delete suggestion.");
    }
  };

  return (
    <div className="pt-24 pb-16 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-red-600 dark:from-yellow-400 dark:to-orange-500 mb-4 inline-flex items-center gap-3">
            <MessageSquarePlus className="h-8 w-8 text-orange-500" />
            Community Suggestions
          </h1>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            We value your feedback! Share your ideas, suggestions, and feedback for the Ganesha Festival. What can we improve next year?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Submit Form */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6 sticky top-28">
              <h2 className="text-xl font-bold mb-4 text-orange-600 dark:text-orange-400">Leave a Suggestion</h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-border-color bg-background/50 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="John Doe"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 flex items-center justify-between">
                    <span>Phone Number</span>
                    <span className="text-[10px] text-orange-500">(Kept private)</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-border-color bg-background/50 focus:ring-2 focus:ring-orange-500 outline-none"
                    placeholder="+91..."
                  />
                  <p className="text-xs text-foreground/50 mt-1">
                    Your phone number is only visible to admins.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Suggestion / Feedback *</label>
                  <textarea
                    required
                    value={formData.suggestion}
                    onChange={(e) => setFormData({...formData, suggestion: e.target.value})}
                    className="w-full px-4 py-2 rounded-md border border-border-color bg-background/50 focus:ring-2 focus:ring-orange-500 outline-none min-h-[120px]"
                    placeholder="I suggest we should..."
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Suggestion'}
                </Button>
              </form>
            </GlassCard>
          </div>

          {/* Suggestions List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-bold">Recent Suggestions</h2>
              <div className="text-sm text-foreground/60">
                {suggestions.length} total
              </div>
            </div>

            {suggestions.length === 0 ? (
              <div className="text-center py-12 p-6 border border-dashed border-border-color rounded-xl opacity-70">
                <MessageSquarePlus className="h-12 w-12 mx-auto mb-3 text-foreground/30" />
                <h3 className="text-lg font-medium">No suggestions yet!</h3>
                <p className="text-sm">Be the first to share your ideas with us.</p>
              </div>
            ) : (
              suggestions.map((item) => (
                <GlassCard key={item.id} className="p-5 flex flex-col sm:flex-row gap-4 relative overflow-hidden group">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-lg">{item.name}</h3>
                        <p className="text-xs text-foreground/50">
                          {item.created_at ? format(new Date(item.created_at), `MMM d, yyyy 'at' h:mm a`) : 'Recently'}
                        </p>
                        {/* Only Admin sees phone number */}
                        {isAdmin && item.phone && (
                          <p className="text-xs text-orange-500 mt-1 font-mono">
                            📞 {item.phone}
                          </p>
                        )}
                      </div>
                      
                      {isAdmin && (
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors"
                          title="Delete (Admin Only)"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    
                    <div className="bg-background/40 p-4 rounded-lg my-3 text-foreground/90 whitespace-pre-wrap text-sm border border-border-color/50">
                      {item.suggestion}
                    </div>
                  </div>
                  
                  {/* Voting Column */}
                  <div className="flex sm:flex-col items-center justify-start sm:justify-center gap-4 sm:border-l border-t sm:border-t-0 border-border-color pt-3 sm:pt-0 pl-0 sm:pl-4">
                    <button 
                      onClick={() => handleVote(item.id, 'up')}
                      className={`flex flex-col items-center gap-1 transition-colors ${
                        votedItems[item.id] === 'up' ? 'text-green-500' : 'text-foreground/50 hover:text-green-500'
                      }`}
                    >
                      <ThumbsUp className={`h-5 w-5 ${votedItems[item.id] === 'up' ? 'fill-current' : ''}`} />
                      <span className="text-xs font-bold">{item.likes}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleVote(item.id, 'down')}
                      className={`flex flex-col items-center gap-1 transition-colors ${
                        votedItems[item.id] === 'down' ? 'text-red-500' : 'text-foreground/50 hover:text-red-500'
                      }`}
                    >
                      <ThumbsDown className={`h-5 w-5 ${votedItems[item.id] === 'down' ? 'fill-current' : ''}`} />
                      <span className="text-xs font-bold">{item.dislikes}</span>
                    </button>
                  </div>
                </GlassCard>
              ))
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
