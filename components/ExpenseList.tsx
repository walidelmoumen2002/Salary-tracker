
import React from 'react';
import { Expense } from '../types';
import { formatCurrency } from '../lib/utils';
import { Button } from './ui/Button';

interface ExpenseListProps {
  expenses: Expense[];
  deleteExpense: (id: string) => void;
}

const Trash2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);


export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, deleteExpense }) => {
  const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (sortedExpenses.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-semibold">No expenses yet!</h3>
        <p className="text-muted-foreground">Click the '+' button to add your first expense.</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Expense History</h3>
      <div className="border rounded-lg">
        <ul className="divide-y">
          {sortedExpenses.map((expense) => (
            <li key={expense.id} className="p-4 flex items-center justify-between hover:bg-secondary/50">
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <p className="font-semibold">{expense.description}</p>
                  <p className="text-muted-foreground">{new Date(expense.date + 'T12:00:00').toLocaleDateString()} &bull; {expense.category}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-semibold text-red-500 dark:text-red-400">-{formatCurrency(expense.amount)}</span>
                <Button variant="ghost" size="icon" onClick={() => deleteExpense(expense.id)}>
                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};