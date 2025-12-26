import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/Select';
import { Button } from './ui/Button';
import { formatCurrency } from '../lib/utils';
import { Expense } from '../types';

interface MonthlyReportProps {
  expenses: Expense[];
  salary: number;
}

const TrendUpIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
    <polyline points="16 7 22 7 22 13" />
  </svg>
);

const TrendDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const DownloadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

export const MonthlyReport: React.FC<MonthlyReportProps> = ({ expenses, salary }) => {
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    expenses.forEach(e => months.add(e.date.substring(0, 7)));
    return Array.from(months).sort().reverse();
  }, [expenses]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || new Date().toISOString().substring(0, 7)
  );

  const [compareMonth, setCompareMonth] = useState<string>(availableMonths[1] || '');

  // Current month data
  const currentMonthData = useMemo(() => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const byCategory: Record<string, number> = {};

    monthExpenses.forEach(e => {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
    });

    const sortedCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: total > 0 ? (amount / total) * 100 : 0
      }));

    return {
      total,
      count: monthExpenses.length,
      byCategory: sortedCategories,
      avgPerDay: total / new Date(selectedMonth + '-01').getDate(),
      savingsRate: salary > 0 ? ((salary - total) / salary) * 100 : 0
    };
  }, [expenses, selectedMonth, salary]);

  // Comparison month data
  const comparisonData = useMemo(() => {
    if (!compareMonth) return null;

    const monthExpenses = expenses.filter(e => e.date.startsWith(compareMonth));
    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

    return {
      total,
      count: monthExpenses.length,
      difference: currentMonthData.total - total,
      percentageChange: total > 0 ? ((currentMonthData.total - total) / total) * 100 : 0
    };
  }, [expenses, compareMonth, currentMonthData]);

  // Export to CSV
  const exportToCSV = () => {
    const monthExpenses = expenses.filter(e => e.date.startsWith(selectedMonth));

    const headers = ['Date', 'Description', 'Category', 'Amount'];
    const rows = monthExpenses.map(e => [
      e.date,
      `"${e.description.replace(/"/g, '""')}"`,
      e.category,
      e.amount.toFixed(2)
    ]);

    // Add summary
    rows.push([]);
    rows.push(['Summary']);
    rows.push(['Total Expenses', '', '', currentMonthData.total.toFixed(2)]);
    rows.push(['Number of Transactions', '', '', currentMonthData.count.toString()]);
    rows.push(['Monthly Income', '', '', salary.toFixed(2)]);
    rows.push(['Savings', '', '', (salary - currentMonthData.total).toFixed(2)]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `expenses_${selectedMonth}.csv`;
    link.click();
  };

  const formatMonthLabel = (month: string) => {
    return new Date(`${month}-01T12:00:00Z`).toLocaleString('default', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Monthly Report</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Detailed spending analysis</p>
            </div>
            <Button onClick={exportToCSV} variant="outline" className="gap-2">
              <DownloadIcon className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Month</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableMonths.map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Compare With</label>
              <Select value={compareMonth} onValueChange={setCompareMonth}>
                <SelectTrigger>
                  <SelectValue placeholder="Select month to compare" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No comparison</SelectItem>
                  {availableMonths.filter(m => m !== selectedMonth).map(month => (
                    <SelectItem key={month} value={month}>
                      {formatMonthLabel(month)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Total Spent</p>
            <p className="text-lg sm:text-2xl font-bold text-red-600 dark:text-red-400">
              {formatCurrency(currentMonthData.total)}
            </p>
            {comparisonData && comparisonData.difference !== 0 && (
              <div className={`flex items-center gap-1 text-xs mt-1 ${
                comparisonData.difference > 0 ? 'text-red-500' : 'text-emerald-500'
              }`}>
                {comparisonData.difference > 0 ? (
                  <TrendUpIcon className="h-3 w-3" />
                ) : (
                  <TrendDownIcon className="h-3 w-3" />
                )}
                <span>
                  {comparisonData.difference > 0 ? '+' : ''}
                  {comparisonData.percentageChange.toFixed(1)}% vs prev
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Transactions</p>
            <p className="text-lg sm:text-2xl font-bold">{currentMonthData.count}</p>
            {comparisonData && (
              <p className="text-xs text-muted-foreground mt-1">
                {comparisonData.count} in prev month
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Savings</p>
            <p className={`text-lg sm:text-2xl font-bold ${
              salary - currentMonthData.total >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {formatCurrency(salary - currentMonthData.total)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentMonthData.savingsRate.toFixed(1)}% savings rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <p className="text-xs sm:text-sm text-muted-foreground">Avg per Day</p>
            <p className="text-lg sm:text-2xl font-bold">
              {formatCurrency(currentMonthData.avgPerDay)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {currentMonthData.byCategory.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No expenses this month</p>
          ) : (
            <div className="space-y-4">
              {currentMonthData.byCategory.map(({ category, amount, percentage }) => (
                <div key={category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category}</span>
                    <div className="text-right">
                      <span className="font-semibold">{formatCurrency(amount)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentMonthData.byCategory[0] && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm">
                  <span className="font-medium">Top spending category:</span>{' '}
                  {currentMonthData.byCategory[0].category} ({formatCurrency(currentMonthData.byCategory[0].amount)})
                </p>
              </div>
            )}

            {currentMonthData.savingsRate < 20 && salary > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300">
                <p className="text-sm">
                  Your savings rate is below 20%. Consider reducing spending to build savings.
                </p>
              </div>
            )}

            {currentMonthData.savingsRate >= 30 && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                <p className="text-sm">
                  Great job! You're saving {currentMonthData.savingsRate.toFixed(1)}% of your income this month.
                </p>
              </div>
            )}

            {comparisonData && comparisonData.difference > 0 && comparisonData.percentageChange > 20 && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300">
                <p className="text-sm">
                  Spending increased by {comparisonData.percentageChange.toFixed(1)}% compared to last month.
                </p>
              </div>
            )}

            {comparisonData && comparisonData.difference < 0 && (
              <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300">
                <p className="text-sm">
                  You spent {formatCurrency(Math.abs(comparisonData.difference))} less than the previous month!
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
