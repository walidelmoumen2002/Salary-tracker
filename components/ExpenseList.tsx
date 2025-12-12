
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

// Category icons and colors
const categoryConfig: Record<string, { icon: React.FC<React.SVGProps<SVGSVGElement>>; color: string; bgColor: string }> = {
  Food: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>
      </svg>
    ),
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30'
  },
  Transport: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L18 10l-3-6H9L6 10l-2.5.1C2.7 10.3 2 11.1 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/>
      </svg>
    ),
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30'
  },
  Utilities: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><line x1="6" y1="13" x2="10" y2="13"/><line x1="14" y1="13" x2="18" y2="13"/>
      </svg>
    ),
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30'
  },
  Housing: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30'
  },
  Entertainment: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/><polyline points="17 2 12 7 7 2"/>
      </svg>
    ),
    color: 'text-pink-600 dark:text-pink-400',
    bgColor: 'bg-pink-100 dark:bg-pink-900/30'
  },
  Health: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
      </svg>
    ),
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30'
  },
  Shopping: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
      </svg>
    ),
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-100 dark:bg-teal-900/30'
  },
  Education: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
      </svg>
    ),
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30'
  },
  Other: {
    icon: (props) => (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>
      </svg>
    ),
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800'
  }
};

const getConfig = (category: string) => {
  return categoryConfig[category] || categoryConfig['Other'];
};

// Group expenses by date
const groupExpensesByDate = (expenses: Expense[]) => {
  const groups: Record<string, Expense[]> = {};

  expenses.forEach(expense => {
    const date = expense.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(expense);
  });

  return Object.entries(groups)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .map(([date, expenses]) => ({
      date,
      expenses: expenses.sort((a, b) => b.amount - a.amount),
      total: expenses.reduce((sum, e) => sum + e.amount, 0)
    }));
};

const formatDateHeader = (dateStr: string) => {
  const date = new Date(dateStr + 'T12:00:00');
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday = date.toDateString() === today.toDateString();
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
};

export const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, deleteExpense }) => {
  const groupedExpenses = groupExpensesByDate(expenses);

  if (expenses.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-xl font-semibold">Expense History</h3>
        <span className="text-xs sm:text-sm text-muted-foreground">
          {expenses.length} transaction{expenses.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {groupedExpenses.map(({ date, expenses: dayExpenses, total }) => (
          <div key={date} className="space-y-2">
            {/* Date Header */}
            <div className="flex items-center justify-between px-2 sm:px-3 py-2 bg-muted/50 rounded-lg">
              <span className="text-xs sm:text-sm font-medium text-muted-foreground">
                {formatDateHeader(date)}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-red-500 dark:text-red-400">
                -{formatCurrency(total)}
              </span>
            </div>

            {/* Expenses for this date */}
            <div className="border rounded-lg divide-y overflow-hidden">
              {dayExpenses.map((expense) => {
                const config = getConfig(expense.category);
                const IconComponent = config.icon;

                return (
                  <div
                    key={expense.id}
                    className="flex items-center gap-3 p-3 sm:p-4 hover:bg-secondary/50 transition-colors group"
                  >
                    {/* Category Icon */}
                    <div className={`h-9 w-9 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${config.bgColor}`}>
                      <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${config.color}`} />
                    </div>

                    {/* Description & Category */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">{expense.description}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{expense.category}</p>
                    </div>

                    {/* Amount */}
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="font-semibold text-sm sm:text-base text-red-500 dark:text-red-400 whitespace-nowrap">
                        -{formatCurrency(expense.amount)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteExpense(expense.id)}
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
