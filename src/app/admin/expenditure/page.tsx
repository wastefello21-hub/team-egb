"use client";

import React, { useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useData } from '@/context/DataContext';

export default function AdminExpenditurePage() {
  const { expenditures: expenses, addExpenditure, deleteExpenditure } = useData();

  const [isAdding, setIsAdding] = useState(false);
  const [newExpense, setNewExpense] = useState({ category: '', description: '', amount: '', date: '' });
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleAdd = () => {
    setError('');
    if (!newExpense.category || !newExpense.description || !newExpense.amount) {
      setError('Please fill in all required fields (Category, Description, Amount).');
      return;
    }
    
    addExpenditure({ 
      id: `EXP-${Date.now()}`, 
      category: newExpense.category,
      description: newExpense.description,
      amount: Number(newExpense.amount),
      date: newExpense.date || new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    });
    setNewExpense({ category: '', description: '', amount: '', date: '' });
    setIsAdding(false);
  };

  const confirmDelete = () => {
    if (deletingId) {
      deleteExpenditure(deletingId);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 md:pb-0 relative">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
            <Receipt className="w-6 h-6" /> Manage Expenditure
          </h2>
          <p className="text-sm text-foreground/60">Log expenses to reflect on the public ledger.</p>
        </div>
        <Button onClick={() => setIsAdding(true)} className="flex items-center gap-2 w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
          <Plus size={18} />
          Log Expense
        </Button>
      </div>

      <GlassCard className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-border-color text-sm text-foreground/60 uppercase tracking-wider">
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Category</th>
              <th className="p-4 font-semibold">Description</th>
              <th className="p-4 font-semibold">Amount</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-color">
            <AnimatePresence>
              {expenses.map((expense) => (
                <motion.tr 
                  key={expense.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="hover:bg-foreground/5 transition-colors"
                >
                  <td className="p-4 text-sm text-foreground/60">{expense.date}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-semibold rounded-md">
                      {expense.category}
                    </span>
                  </td>
                  <td className="p-4 font-medium">{expense.description}</td>
                  <td className="p-4 font-bold text-red-600 dark:text-red-400">₹{expense.amount.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => setDeletingId(expense.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </GlassCard>

      {/* Add Expense Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold mb-4">Log New Expense</h3>
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 text-sm rounded-lg border border-red-200 dark:border-red-800">
                {error}
              </div>
            )}
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select 
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Select Category</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Idol">Idol</option>
                  <option value="Prasad">Prasad</option>
                  <option value="Logistics">Logistics</option>
                  <option value="Misc">Miscellaneous</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input 
                  type="text" 
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:ring-2 focus:ring-red-500"
                  placeholder="e.g. Flower vendor advance"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (₹)</label>
                <input 
                  type="number" 
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border-color focus:ring-2 focus:ring-red-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setIsAdding(false); setError(''); }} variant="outline" className="flex-1">Cancel</Button>
              <Button onClick={handleAdd} className="flex-1 bg-red-600 hover:bg-red-700 text-white">Save Expense</Button>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Custom Delete Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <GlassCard className="w-full max-w-sm p-6 relative border-t-4 border-red-500">
            <h3 className="text-xl font-bold mb-2 text-red-500">Confirm Deletion</h3>
            <p className="text-foreground/70 mb-6">Are you sure you want to delete this expense record?</p>
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
