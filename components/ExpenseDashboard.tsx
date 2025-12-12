import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { formatCurrency } from '../lib/utils';

interface ExpenseDashboardProps {
  expenses: Expense[];
  deleteExpense: (id: string) => void;
  categories: Category[];
}

const getMonthsWithExpenses = (expenses: Expense[]): string[] => {
  const monthSet = new Set<string>();
  expenses.forEach(expense => {
    monthSet.add(expense.date.substring(0, 7)); // YYYY-MM
  });
  return Array.from(monthSet).sort().reverse();
};

export const ExpenseDashboard: React.FC<ExpenseDashboardProps> = ({ expenses, deleteExpense, categories }) => {
  const availableMonths = useMemo(() => getMonthsWithExpenses(expenses), [expenses]);
  
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'from' | 'to') => {
    setDateRange(prev => ({ ...prev, [field]: e.target.value }));
  };

  const clearFilters = () => {
    setSelectedMonth('all');
    setSelectedCategory('all');
    setDateRange({ from: '', to: '' });
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      const monthMatch = selectedMonth === 'all' || expense.date.startsWith(selectedMonth);
      const categoryMatch = selectedCategory === 'all' || expense.category === selectedCategory;
      const fromMatch = !dateRange.from || expense.date >= dateRange.from;
      const toMatch = !dateRange.to || expense.date <= dateRange.to;

      return monthMatch && categoryMatch && fromMatch && toMatch;
    });
  }, [expenses, selectedMonth, selectedCategory, dateRange]);

  const hasActiveFilters = selectedMonth !== 'all' || selectedCategory !== 'all' || !!dateRange.from || !!dateRange.to;

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-base sm:text-lg">Expenses Overview</CardTitle>
        <div className="border-t pt-3 sm:pt-4 mt-3 sm:mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4 items-end">

            <div className="flex flex-col space-y-1">
              <label htmlFor="month-filter" className="text-xs sm:text-sm font-medium text-muted-foreground">Month</label>
              <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                <SelectTrigger id="month-filter" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {new Date(`${month}-01T12:00:00Z`).toLocaleString('default', { month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="category-filter" className="text-xs sm:text-sm font-medium text-muted-foreground">Category</label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger id="category-filter" className="w-full h-9 sm:h-10 text-xs sm:text-sm">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="date-from" className="text-xs sm:text-sm font-medium text-muted-foreground">Start Date</label>
              <Input id="date-from" type="date" value={dateRange.from} onChange={(e) => handleDateChange(e, 'from')} className="h-9 sm:h-10 text-xs sm:text-sm" />
            </div>

            <div className="flex flex-col space-y-1">
              <label htmlFor="date-to" className="text-xs sm:text-sm font-medium text-muted-foreground">End Date</label>
              <Input id="date-to" type="date" value={dateRange.to} onChange={(e) => handleDateChange(e, 'to')} className="h-9 sm:h-10 text-xs sm:text-sm" />
            </div>

            <Button onClick={clearFilters} variant="outline" disabled={!hasActiveFilters} className="col-span-2 lg:col-span-1 h-9 sm:h-10 text-xs sm:text-sm">
              Clear Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-muted mb-3 sm:mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
                <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
                <path d="M12 17.5v-11"/>
              </svg>
            </div>
            <h3 className="text-base sm:text-lg font-semibold">No expenses found</h3>
            <p className="text-muted-foreground text-xs sm:text-sm mt-1">
              {hasActiveFilters ? 'Try adjusting your filters' : 'Click the + button to add your first expense'}
            </p>
          </div>
        ) : (
          <>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-2">
              {filteredExpenses
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{expense.description}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{new Date(expense.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>•</span>
                      <span className="truncate">{expense.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-red-500 dark:text-red-400 whitespace-nowrap">
                      -{formatCurrency(expense.amount)}
                    </span>
                    <button
                      onClick={() => deleteExpense(expense.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 transition-all"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground hover:text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Description</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground">Category</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground text-right">Amount</th>
                    <th className="pb-3 text-sm font-medium text-muted-foreground w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredExpenses
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((expense) => (
                    <tr key={expense.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors group">
                      <td className="py-3 text-sm">
                        {new Date(expense.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="py-3 text-sm font-medium">{expense.description}</td>
                      <td className="py-3 text-sm text-muted-foreground">{expense.category}</td>
                      <td className="py-3 text-sm font-semibold text-red-500 dark:text-red-400 text-right">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          onClick={() => deleteExpense(expense.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground hover:text-destructive" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t flex justify-between items-center">
              <span className="text-xs sm:text-sm text-muted-foreground">
                {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
              </span>
              <span className="text-xs sm:text-sm font-semibold">
                Total: <span className="text-red-500 dark:text-red-400">-{formatCurrency(filteredExpenses.reduce((sum, e) => sum + e.amount, 0))}</span>
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
