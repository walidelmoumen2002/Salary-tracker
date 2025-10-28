
import React, { useState, useEffect } from 'react';
import { Expense, Category, CATEGORIES } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';

interface AddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
}

export const AddExpense: React.FC<AddExpenseProps> = ({ isOpen, onClose, addExpense }) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form on open
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || !amount || !category || !date) {
      setError('Please fill in all fields.');
      return;
    }
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError('Please enter a valid, positive amount.');
      return;
    }
    
    addExpense({
      description,
      amount: numericAmount,
      category,
      date,
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Expense</DialogTitle>
          <DialogDescription>
            Quickly add a new expense to track your spending.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">Description</label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Coffee with friends"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-foreground mb-1">Amount</label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
              />
            </div>
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-foreground mb-1">Date</label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-foreground mb-1">Category</label>
            <Select onValueChange={(value) => setCategory(value as Category)} value={category}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {CATEGORIES.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};