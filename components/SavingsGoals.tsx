import React, { useState, useMemo } from 'react';
import { SavingsGoal, SAVINGS_ICONS, SAVINGS_COLORS, SavingsIcon } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { formatCurrency, getErrorMessage } from '../lib/utils';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

// Icons
const PlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const DepositIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const getGoalIcon = (icon: SavingsIcon) => {
  switch (icon) {
    case 'emergency':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/>
          <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
        </svg>
      );
    case 'vacation':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z"/>
        </svg>
      );
    case 'car':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-6H9L6 10l-2.5.1C2.7 10.3 2 11.1 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        </svg>
      );
    case 'house':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      );
    case 'education':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      );
    case 'retirement':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
      );
    case 'wedding':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        </svg>
      );
    default:
      return <TargetIcon className="h-6 w-6" />;
  }
};

interface SavingsGoalsProps {
  initialGoals: SavingsGoal[];
  user: User | null;
  monthlyIncome?: number;
}

export const SavingsGoals: React.FC<SavingsGoalsProps> = ({ initialGoals, user, monthlyIncome = 0 }) => {
  const [goals, setGoals] = useState<SavingsGoal[]>(initialGoals);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    target_amount: '',
    current_amount: '',
    target_date: '',
    icon: 'other' as SavingsIcon,
    color: SAVINGS_COLORS[0]
  });

  const [depositAmount, setDepositAmount] = useState('');

  // Calculations
  const { totalSaved, totalTarget, overallProgress } = useMemo(() => {
    const saved = goals.reduce((sum, g) => sum + g.current_amount, 0);
    const target = goals.reduce((sum, g) => sum + g.target_amount, 0);
    const progress = target > 0 ? (saved / target) * 100 : 0;
    return { totalSaved: saved, totalTarget: target, overallProgress: progress };
  }, [goals]);

  // Emergency fund calculation (3-6 months of expenses)
  const emergencyFundGoal = useMemo(() => {
    return goals.find(g => g.icon === 'emergency');
  }, [goals]);

  const handleError = (err: any) => {
    console.error(err);
    setError(getErrorMessage(err));
    setTimeout(() => setError(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      target_amount: '',
      current_amount: '',
      target_date: '',
      icon: 'other',
      color: SAVINGS_COLORS[0]
    });
  };

  const addGoal = async () => {
    if (!user || !formData.name.trim() || !formData.target_amount) return;
    setIsLoading(true);
    setError(null);

    try {
      const newGoal = {
        name: formData.name.trim(),
        target_amount: parseFloat(formData.target_amount),
        current_amount: parseFloat(formData.current_amount) || 0,
        target_date: formData.target_date || null,
        icon: formData.icon,
        color: formData.color,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('savings_goals')
        .insert(newGoal)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setGoals(prev => [...prev, { ...data, id: data.id.toString() }]);
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const makeDeposit = async () => {
    if (!selectedGoal || !depositAmount) return;
    setIsLoading(true);
    setError(null);

    try {
      const amount = parseFloat(depositAmount);
      const newAmount = selectedGoal.current_amount + amount;

      const { error } = await supabase
        .from('savings_goals')
        .update({ current_amount: newAmount })
        .eq('id', selectedGoal.id);

      if (error) throw error;

      setGoals(prev => prev.map(g =>
        g.id === selectedGoal.id ? { ...g, current_amount: newAmount } : g
      ));
      setIsDepositModalOpen(false);
      setSelectedGoal(null);
      setDepositAmount('');
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteGoal = async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase.from('savings_goals').delete().eq('id', id);
      if (error) throw error;
      setGoals(prev => prev.filter(g => g.id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  const openDepositModal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setDepositAmount('');
    setIsDepositModalOpen(true);
  };

  const getMonthsRemaining = (targetDate: string) => {
    if (!targetDate) return null;
    const target = new Date(targetDate);
    const now = new Date();
    const months = (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth());
    return Math.max(0, months);
  };

  const getMonthlySavingsNeeded = (goal: SavingsGoal) => {
    if (!goal.target_date) return null;
    const months = getMonthsRemaining(goal.target_date);
    if (!months || months === 0) return null;
    const remaining = goal.target_amount - goal.current_amount;
    return remaining / months;
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Saved</p>
                <p className="text-lg sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(totalSaved)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Target Total</p>
                <p className="text-lg sm:text-2xl font-bold">{formatCurrency(totalTarget)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TargetIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="col-span-2 lg:col-span-1 cursor-pointer hover:border-primary/50 transition-colors group"
          onClick={() => setIsAddModalOpen(true)}
        >
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Goals</p>
                <p className="text-lg sm:text-2xl font-bold">{goals.length}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">Click to add new goal</p>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">Savings Goals</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Track progress towards your financial goals</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {goals.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <TargetIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No savings goals yet</h3>
              <p className="text-muted-foreground text-sm mt-1">Create your first goal to start saving</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.map(goal => {
                const progress = (goal.current_amount / goal.target_amount) * 100;
                const isComplete = goal.current_amount >= goal.target_amount;
                const monthlyNeeded = getMonthlySavingsNeeded(goal);
                const monthsLeft = goal.target_date ? getMonthsRemaining(goal.target_date) : null;

                return (
                  <div
                    key={goal.id}
                    className={`border rounded-xl p-4 transition-all hover:shadow-md ${
                      isComplete ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      >
                        {getGoalIcon(goal.icon)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{goal.name}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 flex-shrink-0"
                            onClick={() => deleteGoal(goal.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>

                        {/* Progress Circle */}
                        <div className="flex items-center gap-4 mt-2">
                          <div className="relative h-16 w-16 flex-shrink-0">
                            <svg className="h-16 w-16 -rotate-90">
                              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="6" className="text-secondary" />
                              <circle
                                cx="32"
                                cy="32"
                                r="28"
                                fill="none"
                                stroke={isComplete ? '#10B981' : goal.color}
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${Math.min(progress, 100) * 1.76} 176`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-bold">{Math.min(progress, 100).toFixed(0)}%</span>
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className={`text-lg font-bold ${isComplete ? 'text-emerald-600' : ''}`}>
                              {formatCurrency(goal.current_amount)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              of {formatCurrency(goal.target_amount)}
                            </p>
                            {monthsLeft !== null && monthsLeft > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {monthsLeft} months left
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Monthly savings suggestion */}
                        {monthlyNeeded && monthlyNeeded > 0 && !isComplete && (
                          <div className="mt-3 p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-xs">
                            <span className="text-blue-700 dark:text-blue-300">
                              Save <strong>{formatCurrency(monthlyNeeded)}/month</strong> to reach your goal
                            </span>
                          </div>
                        )}

                        {isComplete && (
                          <div className="mt-3 p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                            Goal achieved!
                          </div>
                        )}

                        {/* Deposit Button */}
                        {!isComplete && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-3 gap-1"
                            onClick={() => openDepositModal(goal)}
                          >
                            <DepositIcon className="h-4 w-4" />
                            Add Money
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Goal Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Savings Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Goal Name</label>
              <Input
                placeholder="e.g., Emergency Fund, Vacation"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Icon</label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value as SavingsIcon }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SAVINGS_ICONS.map(icon => (
                    <SelectItem key={icon.value} value={icon.value}>{icon.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-center">Color</label>
              <div className="flex gap-2 flex-wrap justify-center">
                {SAVINGS_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`h-8 w-8 rounded-full transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 ring-primary scale-110' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData(prev => ({ ...prev, color }))}
                  />
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Target Amount</label>
                <Input
                  type="number"
                  placeholder="50000"
                  value={formData.target_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, target_amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Savings</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={formData.current_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_amount: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Target Date (Optional)</label>
              <Input
                type="date"
                value={formData.target_date}
                onChange={(e) => setFormData(prev => ({ ...prev, target_date: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={addGoal} disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Goal'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deposit Modal */}
      <Dialog open={isDepositModalOpen} onOpenChange={setIsDepositModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Money</DialogTitle>
          </DialogHeader>
          {selectedGoal && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedGoal.name}</p>
                <p className="text-sm text-muted-foreground">
                  Current: {formatCurrency(selectedGoal.current_amount)} / {formatCurrency(selectedGoal.target_amount)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Amount to Add</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsDepositModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={makeDeposit} disabled={isLoading}>
                  {isLoading ? 'Adding...' : 'Add'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
