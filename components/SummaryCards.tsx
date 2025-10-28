
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { formatCurrency } from '../lib/utils';

interface SummaryCardsProps {
  salary: number;
  totalExpenses: number;
  remainingBalance: number;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ salary, totalExpenses, remainingBalance }) => {
  const expensePercentage = salary > 0 ? (totalExpenses / salary) * 100 : 0;
  const balanceColor = remainingBalance >= 0 ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Salary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatCurrency(salary)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(totalExpenses)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Remaining Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${balanceColor}`}>{formatCurrency(remainingBalance)}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-4 bg-card p-4 rounded-lg border">
          <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-primary">Expenses</span>
            <span className="text-sm font-medium text-primary">{formatCurrency(totalExpenses)} / {formatCurrency(salary)}</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-4">
            <div 
              className="bg-blue-600 dark:bg-blue-500 h-4 rounded-full" 
              style={{ width: `${Math.min(expensePercentage, 100)}%` }}
            ></div>
          </div>
      </div>
    </section>
  );
};