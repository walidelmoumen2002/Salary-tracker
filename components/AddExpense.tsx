import React, { useState, useEffect } from 'react';
import { Expense, Category, DEFAULT_CATEGORIES } from '../types';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/Dialog';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

interface AddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (category: Category) => void;
}

export const AddExpense: React.FC<AddExpenseProps> = ({ isOpen, onClose, addExpense, categories, addCategory, deleteCategory }) => {
  const [isManagingCategories, setIsManagingCategories] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (isOpen) {
      setDescription('');
      setAmount('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
      setIsAddingCategory(false);
      setNewCategoryName('');
      setIsManagingCategories(false);
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

  const handleCategoryChange = (value: string) => {
      if (value === 'add-new') {
          setIsAddingCategory(true);
          setCategory('');
      } else if (value === 'manage-categories') {
          setIsManagingCategories(true);
      } else {
          setIsAddingCategory(false);
          setCategory(value as Category);
      }
  }

  const isCustomCategory = (cat: Category) => {
    return !DEFAULT_CATEGORIES.includes(cat as any);
  }

  const handleDeleteCategory = (e: React.MouseEvent, cat: Category) => {
    e.preventDefault();
    e.stopPropagation();
    deleteCategory(cat);
    if (category === cat) {
      setCategory('');
    }
  }

  const handleAddNewCategory = () => {
    if (newCategoryName.trim() && !categories.includes(newCategoryName.trim())) {
        addCategory(newCategoryName.trim());
        setCategory(newCategoryName.trim());
        setIsAddingCategory(false);
        setNewCategoryName('');
    }
  }
  
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
            <Select onValueChange={handleCategoryChange} value={category}>
                <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                    {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                          {isCustomCategory(cat) && <span className="ml-1 text-xs text-muted-foreground">(custom)</span>}
                        </SelectItem>
                    ))}
                    <SelectItem value="add-new">+ Add New Category</SelectItem>
                    {categories.some(isCustomCategory) && (
                      <SelectItem value="manage-categories" className="text-muted-foreground">Manage Categories...</SelectItem>
                    )}
                </SelectContent>
            </Select>
          </div>
          {isAddingCategory && (
              <div className="flex items-center gap-2">
                  <Input
                      placeholder="New category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                  <Button type="button" onClick={handleAddNewCategory}>Add</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsAddingCategory(false)}>Cancel</Button>
              </div>
          )}
          {isManagingCategories && (
              <div className="border rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Custom Categories</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setIsManagingCategories(false)} className="h-6 px-2 text-xs">
                      Done
                    </Button>
                  </div>
                  {categories.filter(isCustomCategory).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-2">No custom categories</p>
                  ) : (
                    <ul className="space-y-1">
                      {categories.filter(isCustomCategory).map(cat => (
                        <li key={cat} className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50">
                          <span className="text-sm">{cat}</span>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCategory(e, cat)}
                            className="p-1.5 rounded hover:bg-destructive/10 transition-colors"
                          >
                            <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
              </div>
          )}
          {error && <p className="text-sm text-red-500 dark:text-red-400">{error}</p>}
          <div className="flex justify-end pt-2">
            <Button type="submit">Add Expense</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
