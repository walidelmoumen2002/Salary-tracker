import React, { useState, useMemo } from 'react';
import { Expense, Category } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ExpenseList } from './ExpenseList';
import { ExpenseCharts } from './ExpenseCharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

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
      <CardHeader>
        <CardTitle>Expenses Overview</CardTitle>
        <div className="border-t pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="month-filter" className="text-sm font-medium text-muted-foreground">Month</label>
              <Select onValueChange={setSelectedMonth} value={selectedMonth}>
                <SelectTrigger id="month-filter" className="w-full">
                  <SelectValue placeholder="Filter by month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {new Date(`${month}-01T12:00:00Z`).toLocaleString('default', { month: 'long', year: 'numeric', timeZone: 'UTC' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="category-filter" className="text-sm font-medium text-muted-foreground">Category</label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger id="category-filter" className="w-full">
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

            <div className="flex flex-col space-y-1.5">
              <label htmlFor="date-from" className="text-sm font-medium text-muted-foreground">Start Date</label>
              <Input id="date-from" type="date" value={dateRange.from} onChange={(e) => handleDateChange(e, 'from')} />
            </div>
            
            <div className="flex flex-col space-y-1.5">
              <label htmlFor="date-to" className="text-sm font-medium text-muted-foreground">End Date</label>
              <Input id="date-to" type="date" value={dateRange.to} onChange={(e) => handleDateChange(e, 'to')} />
            </div>
            
            <Button onClick={clearFilters} variant="outline" disabled={!hasActiveFilters}>
              Clear Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <ExpenseCharts expenses={filteredExpenses} />
        <ExpenseList expenses={filteredExpenses} deleteExpense={deleteExpense} />
      </CardContent>
    </Card>
  );
};
