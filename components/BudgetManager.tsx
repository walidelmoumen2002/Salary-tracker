import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { formatCurrency, getErrorMessage } from '../lib/utils';
import { supabase } from '../lib/supabase';
import { Expense, DEFAULT_CATEGORIES } from '../types';
import type { User } from '@supabase/supabase-js';

interface CategoryBudget {
  id: string;
  category: string;
  budget_amount: number;
  user_id: string;
}

interface BudgetManagerProps {
  expenses: Expense[];
  user: User | null;
  salary: number;
}

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
);

const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

export const BudgetManager: React.FC<BudgetManagerProps> = ({ expenses, user, salary }) => {
  const [budgets, setBudgets] = useState<CategoryBudget[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [budgetAmount, setBudgetAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get current month's expenses
  const currentMonthExpenses = useMemo(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return expenses.filter(e => e.date.startsWith(currentMonth));
  }, [expenses]);

  // Calculate spending per category
  const spendingByCategory = useMemo(() => {
    const spending: Record<string, number> = {};
    currentMonthExpenses.forEach(expense => {
      spending[expense.category] = (spending[expense.category] || 0) + expense.amount;
    });
    return spending;
  }, [currentMonthExpenses]);

  // Fetch budgets from database
  useEffect(() => {
    if (user) {
      fetchBudgets();
    }
  }, [user]);

  const fetchBudgets = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('category_budgets')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      if (data) setBudgets(data);
    } catch (err) {
      console.error('Error fetching budgets:', err);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setError(getErrorMessage(err));
    setTimeout(() => setError(null), 5000);
  };

  const saveBudget = async () => {
    if (!user || !editingCategory || !budgetAmount) return;
    setIsLoading(true);
    setError(null);

    try {
      const amount = parseFloat(budgetAmount);
      const existingBudget = budgets.find(b => b.category === editingCategory);

      if (existingBudget) {
        const { error } = await supabase
          .from('category_budgets')
          .update({ budget_amount: amount })
          .eq('id', existingBudget.id);
        if (error) throw error;
        setBudgets(prev => prev.map(b =>
          b.id === existingBudget.id ? { ...b, budget_amount: amount } : b
        ));
      } else {
        const { data, error } = await supabase
          .from('category_budgets')
          .insert({ category: editingCategory, budget_amount: amount, user_id: user.id })
          .select()
          .single();
        if (error) throw error;
        if (data) setBudgets(prev => [...prev, data]);
      }

      setIsModalOpen(false);
      setEditingCategory(null);
      setBudgetAmount('');
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const openEditModal = (category: string) => {
    const existing = budgets.find(b => b.category === category);
    setEditingCategory(category);
    setBudgetAmount(existing ? existing.budget_amount.toString() : '');
    setIsModalOpen(true);
  };

  const getBudgetStatus = (category: string) => {
    const budget = budgets.find(b => b.category === category);
    if (!budget) return null;

    const spent = spendingByCategory[category] || 0;
    const percentage = (spent / budget.budget_amount) * 100;

    return {
      budget: budget.budget_amount,
      spent,
      percentage,
      remaining: budget.budget_amount - spent,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'ok'
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'text-red-600 dark:text-red-400';
      case 'warning': return 'text-amber-600 dark:text-amber-400';
      default: return 'text-emerald-600 dark:text-emerald-400';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-red-500';
      case 'warning': return 'bg-amber-500';
      default: return 'bg-emerald-500';
    }
  };

  const categoriesWithBudgets = DEFAULT_CATEGORIES.map(category => ({
    name: category,
    ...getBudgetStatus(category)
  }));

  const alerts = categoriesWithBudgets.filter(c => c.status === 'exceeded' || c.status === 'warning');

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertIcon className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-amber-800 dark:text-amber-200">Budget Alerts</p>
                <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
                  {alerts.map(alert => (
                    <li key={alert.name}>
                      {alert.status === 'exceeded'
                        ? `${alert.name}: Exceeded by ${formatCurrency(Math.abs(alert.remaining || 0))}`
                        : `${alert.name}: ${alert.percentage?.toFixed(0)}% used (${formatCurrency(alert.remaining || 0)} left)`
                      }
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Budget Overview */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Category Budgets</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Set monthly spending limits per category</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          <div className="space-y-3">
            {categoriesWithBudgets.map(category => (
              <div
                key={category.name}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{category.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2"
                    onClick={() => openEditModal(category.name)}
                  >
                    <PencilIcon className="h-4 w-4 mr-1" />
                    {category.budget ? 'Edit' : 'Set Budget'}
                  </Button>
                </div>

                {category.budget ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className={getStatusColor(category.status || 'ok')}>
                        {formatCurrency(category.spent || 0)} spent
                      </span>
                      <span className="text-muted-foreground">
                        of {formatCurrency(category.budget)}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${getProgressColor(category.status || 'ok')}`}
                        style={{ width: `${Math.min(category.percentage || 0, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{category.percentage?.toFixed(0)}% used</span>
                      <span className={category.status === 'exceeded' ? 'text-red-500' : ''}>
                        {category.status === 'exceeded'
                          ? `${formatCurrency(Math.abs(category.remaining || 0))} over`
                          : `${formatCurrency(category.remaining || 0)} remaining`
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No budget set • Spent {formatCurrency(spendingByCategory[category.name] || 0)} this month
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Budget Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Budget for {editingCategory}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Monthly Budget Amount</label>
              <Input
                type="number"
                placeholder="Enter budget amount"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(e.target.value)}
              />
            </div>

            {editingCategory && spendingByCategory[editingCategory] > 0 && (
              <p className="text-sm text-muted-foreground">
                Current spending: {formatCurrency(spendingByCategory[editingCategory])}
              </p>
            )}

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={saveBudget} disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Budget'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
