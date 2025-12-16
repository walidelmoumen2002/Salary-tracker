import React, { useState, useMemo } from 'react';
import { Debt, DEBT_CATEGORIES, DebtCategory } from '../types';
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

const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const TrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/>
  </svg>
);

const CheckCircleIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);

const PaymentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
  </svg>
);

const ListIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/>
  </svg>
);

interface DebtManagerProps {
  initialDebts: Debt[];
  user: User | null;
}

const getCategoryIcon = (category: DebtCategory) => {
  switch (category) {
    case 'credit_card':
      return <CreditCardIcon className="h-5 w-5" />;
    case 'car_loan':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-6H9L6 10l-2.5.1C2.7 10.3 2 11.1 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>
        </svg>
      );
    case 'mortgage':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      );
    case 'student_loan':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      );
    default:
      return <CreditCardIcon className="h-5 w-5" />;
  }
};

const getCategoryColor = (category: DebtCategory) => {
  switch (category) {
    case 'credit_card': return 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400';
    case 'personal_loan': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400';
    case 'car_loan': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400';
    case 'mortgage': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400';
    case 'student_loan': return 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400';
    default: return 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';
  }
};

export const DebtManager: React.FC<DebtManagerProps> = ({ initialDebts, user }) => {
  const [debts, setDebts] = useState<Debt[]>(initialDebts);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    total_amount: '',
    current_balance: '',
    due_date: '',
    category: 'credit_card' as DebtCategory
  });

  const [paymentAmount, setPaymentAmount] = useState('');

  // Calculations
  const { totalDebt, totalPaid, totalDebtOriginal, debtCount } = useMemo(() => {
    const total = debts.reduce((sum, d) => sum + d.current_balance, 0);
    const paid = debts.reduce((sum, d) => sum + (d.total_amount - d.current_balance), 0);
    const original = debts.reduce((sum, d) => sum + d.total_amount, 0);
    return { totalDebt: total, totalPaid: paid, totalDebtOriginal: original, debtCount: debts.length };
  }, [debts]);

  const handleError = (err: any) => {
    console.error(err);
    setError(getErrorMessage(err));
    setTimeout(() => setError(null), 5000);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      total_amount: '',
      current_balance: '',
      due_date: '',
      category: 'credit_card'
    });
  };

  const addDebt = async () => {
    if (!user || !formData.name.trim() || !formData.total_amount) return;
    setIsLoading(true);
    setError(null);

    try {
      const newDebt = {
        name: formData.name.trim(),
        total_amount: parseFloat(formData.total_amount),
        current_balance: parseFloat(formData.current_balance) || parseFloat(formData.total_amount),
        due_date: parseInt(formData.due_date) || 1,
        category: formData.category,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('debts')
        .insert(newDebt)
        .select()
        .single();

      if (error) throw error;
      if (data) {
        setDebts(prev => [...prev, { ...data, id: data.id.toString() }]);
        setIsAddModalOpen(false);
        resetForm();
      }
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const makePayment = async () => {
    if (!selectedDebt || !paymentAmount) return;
    setIsLoading(true);
    setError(null);

    try {
      const amount = parseFloat(paymentAmount);
      const newBalance = Math.max(0, selectedDebt.current_balance - amount);

      const { error } = await supabase
        .from('debts')
        .update({ current_balance: newBalance })
        .eq('id', selectedDebt.id);

      if (error) throw error;

      setDebts(prev => prev.map(d =>
        d.id === selectedDebt.id ? { ...d, current_balance: newBalance } : d
      ));
      setIsPaymentModalOpen(false);
      setSelectedDebt(null);
      setPaymentAmount('');
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDebt = async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase.from('debts').delete().eq('id', id);
      if (error) throw error;
      setDebts(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      handleError(err);
    }
  };

  const openPaymentModal = (debt: Debt) => {
    setSelectedDebt(debt);
    setPaymentAmount('');
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 border-red-200 dark:border-red-800/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Remaining Debt</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(totalDebt)}</p>
                {totalDebtOriginal > 0 && (
                  <p className="text-[10px] sm:text-xs text-red-600/60 dark:text-red-400/60 mt-0.5">
                    of {formatCurrency(totalDebtOriginal)} original
                  </p>
                )}
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0">
                <TrendingDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800/30">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Paid</p>
                <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">{formatCurrency(totalPaid)}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 dark:bg-green-900/50 flex items-center justify-center">
                <CheckCircleIcon className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 dark:text-green-400" />
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
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Debts</p>
                <p className="text-lg sm:text-2xl font-bold">{debtCount}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <PlusIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 group-hover:text-primary transition-colors">Click to add new debt</p>
          </CardContent>
        </Card>
      </div>

      {/* Debts List */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg sm:text-xl">My Debts</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Track and manage your debts</p>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

          {debts.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <CreditCardIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No debts tracked</h3>
              <p className="text-muted-foreground text-sm mt-1">Add your first debt to start tracking payments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {debts.map(debt => {
                const progress = ((debt.total_amount - debt.current_balance) / debt.total_amount) * 100;
                const isPaidOff = debt.current_balance === 0;

                return (
                  <div
                    key={debt.id}
                    className={`border rounded-lg p-4 transition-all ${
                      isPaidOff ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${getCategoryColor(debt.category)}`}>
                        {getCategoryIcon(debt.category)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className="font-semibold text-sm sm:text-base">{debt.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {DEBT_CATEGORIES.find(c => c.value === debt.category)?.label}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`font-bold text-sm sm:text-base ${isPaidOff ? 'text-emerald-600' : 'text-red-600 dark:text-red-400'}`}>
                              {isPaidOff ? 'Paid Off!' : formatCurrency(debt.current_balance)}
                            </p>
                            {!isPaidOff && (
                              <p className="text-xs text-muted-foreground">
                                of {formatCurrency(debt.total_amount)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>{progress.toFixed(0)}% paid</span>
                            <span>Due: Day {debt.due_date}</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isPaidOff ? 'bg-emerald-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 mt-3">
                          {!isPaidOff && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-1 h-8 text-xs"
                              onClick={() => openPaymentModal(debt)}
                            >
                              <PaymentIcon className="h-3 w-3" />
                              Pay
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => deleteDebt(debt.id)}
                          >
                            <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Debt Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Debt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input
                placeholder="e.g., Bank Loan, Credit Card"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value as DebtCategory }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DEBT_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1 block">Total Amount</label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={formData.total_amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, total_amount: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Current Balance</label>
                <Input
                  type="number"
                  placeholder="8500"
                  value={formData.current_balance}
                  onChange={(e) => setFormData(prev => ({ ...prev, current_balance: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Due Date (Day of Month)</label>
              <Input
                type="number"
                min="1"
                max="31"
                placeholder="15"
                value={formData.due_date}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={addDebt} disabled={isLoading}>
                {isLoading ? 'Adding...' : 'Add Debt'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
          </DialogHeader>
          {selectedDebt && (
            <div className="space-y-4 mt-4">
              <div className="p-3 rounded-lg bg-muted">
                <p className="font-medium">{selectedDebt.name}</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {formatCurrency(selectedDebt.current_balance)}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Payment Amount</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setIsPaymentModalOpen(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={makePayment} disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Pay'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
