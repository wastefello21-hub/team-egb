"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Plus, Edit2, Trash2, Shield, User, X } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function ManageTeamPage() {
  const { teamMembers: team, deleteTeamMember, updateTeamMember } = useData();

  const [editingMember, setEditingMember] = useState<{originalId: string, id: string, name: string, password?: string} | null>(null);
  const [deletingMember, setDeletingMember] = useState<string | null>(null);

  const confirmDelete = () => {
    if (deletingMember) {
      deleteTeamMember(deletingMember);
      setDeletingMember(null);
    }
  };

  const saveEdit = () => {
    if (editingMember && editingMember.name.trim() !== '' && editingMember.id.trim() !== '') {
      updateTeamMember(editingMember.originalId, {
        id: editingMember.id.trim(),
        name: editingMember.name.trim(),
        ...(editingMember.password ? { password: editingMember.password } : {})
      });
      setEditingMember(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-20 md:pb-0 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-orange-600 dark:text-orange-400">Team Members</h2>
          <p className="text-sm text-foreground/60">Manage your collection team and their access.</p>
        </div>
        <Button className="flex items-center gap-2 w-full sm:w-auto">
          <Plus size={18} />
          Add Member
        </Button>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border-color text-sm text-foreground/60 uppercase tracking-wider">
              <th className="p-4 font-semibold">Member</th>
              <th className="p-4 font-semibold">ID</th>
              <th className="p-4 font-semibold">Role</th>
              <th className="p-4 font-semibold">Collections</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            {team.map((member) => (
              <tr key={member.id} className="hover:bg-foreground/5 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 flex items-center justify-center font-bold text-sm shrink-0">
                      {member.name.charAt(0)}
                    </div>
                    <span className="font-medium whitespace-nowrap">{member.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm">{member.id}</td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                    {member.role === 'Team Lead' ? <Shield size={12} /> : <User size={12} />}
                    {member.role}
                  </span>
                </td>
                <td className="p-4 font-medium text-orange-600 dark:text-orange-400">₹{member.collections}</td>
                <td className="p-4">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                    {member.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end gap-2">
                    <button 
                      onClick={() => setEditingMember({ originalId: member.id, id: member.id, name: member.name, password: '' })}
                      className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      title="Edit Member"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeletingMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      title="Remove Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>

      {/* Custom Edit Modal */}
      {editingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative">
            <button onClick={() => setEditingMember(null)} className="absolute top-4 right-4 text-foreground/50 hover:text-foreground">
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold mb-4">Edit Team Member</h3>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input 
              type="text" 
              value={editingMember.name}
              onChange={(e) => setEditingMember({...editingMember, name: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
              autoFocus
            />
            <label className="block text-sm font-medium mb-1">Team Member ID</label>
            <input 
              type="text" 
              value={editingMember.id}
              onChange={(e) => setEditingMember({...editingMember, id: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 mb-3"
            />
            <label className="block text-sm font-medium mb-1">New Password (Optional)</label>
            <input 
              type="password" 
              value={editingMember.password || ''}
              onChange={(e) => setEditingMember({...editingMember, password: e.target.value})}
              className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:outline-none focus:ring-2 focus:ring-orange-500 mb-6"
              placeholder="••••••••"
            />
            <div className="flex gap-3">
              <Button onClick={() => setEditingMember(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={saveEdit} className="flex-1">Save</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Custom Delete Modal */}
      {deletingMember && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-2 text-red-500">Confirm Deletion</h3>
            <p className="text-foreground/70 mb-6">Are you sure you want to remove team member {deletingMember}? This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button onClick={() => setDeletingMember(null)} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={confirmDelete} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Delete</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
