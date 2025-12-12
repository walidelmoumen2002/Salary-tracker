
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { formatCurrency } from '../lib/utils';

interface SummaryCardsProps {
  salary: number;
  totalExpenses: number;
  remainingBalance: number;
  fixedExpensesTotal?: number;
  totalDebts?: number;
  totalSavings?: number;
}

// Icons
const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/>
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  </svg>
);

const TrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
    <polyline points="16 17 22 17 22 11"/>
  </svg>
);

const PiggyBankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"/>
    <path d="M16 11h.01"/>
  </svg>
);

const ReceiptIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
    <path d="M12 17.5v-11"/>
  </svg>
);

const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2"/>
    <line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/>
    <circle cx="12" cy="12" r="6"/>
    <circle cx="12" cy="12" r="2"/>
  </svg>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  salary,
  totalExpenses,
  remainingBalance,
  fixedExpensesTotal = 0,
  totalDebts = 0,
  totalSavings = 0
}) => {
  const expensePercentage = salary > 0 ? (totalExpenses / salary) * 100 : 0;
  const balanceColor = remainingBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400';

  // Determine progress bar color based on expense percentage
  const getProgressColor = () => {
    if (expensePercentage >= 90) return 'bg-red-500';
    if (expensePercentage >= 75) return 'bg-amber-500';
    if (expensePercentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getProgressBgColor = () => {
    if (expensePercentage >= 90) return 'bg-red-100 dark:bg-red-950';
    if (expensePercentage >= 75) return 'bg-amber-100 dark:bg-amber-950';
    if (expensePercentage >= 50) return 'bg-yellow-100 dark:bg-yellow-950';
    return 'bg-emerald-100 dark:bg-emerald-950';
  };

  return (
    <section className="space-y-3 sm:space-y-4">
      {/* Main Summary Cards */}
      <div className="grid gap-2 sm:gap-3 grid-cols-2 lg:grid-cols-3">
        {/* Salary Card */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Monthly Income</p>
                <p className="text-sm sm:text-2xl font-bold tracking-tight truncate">{formatCurrency(salary)}</p>
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <WalletIcon className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>

        {/* Expenses Card */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Total Expenses</p>
                <p className="text-sm sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 truncate">{formatCurrency(totalExpenses)}</p>
                {fixedExpensesTotal > 0 && (
                  <p className="text-[9px] sm:text-xs text-muted-foreground truncate">
                    +{formatCurrency(fixedExpensesTotal)} fixed
                  </p>
                )}
              </div>
              <div className="h-8 w-8 sm:h-12 sm:w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center flex-shrink-0">
                <TrendingDownIcon className="h-4 w-4 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
        </Card>

        {/* Balance Card */}
        <Card className="relative overflow-hidden group hover:shadow-md transition-all duration-300 col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <p className="text-[10px] sm:text-sm font-medium text-muted-foreground">Remaining Balance</p>
                <p className={`text-sm sm:text-2xl font-bold tracking-tight truncate ${balanceColor}`}>
                  {formatCurrency(remainingBalance)}
                </p>
                <p className="text-[9px] sm:text-xs text-muted-foreground">
                  {expensePercentage.toFixed(0)}% of income spent
                </p>
              </div>
              <div className={`h-8 w-8 sm:h-12 sm:w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                remainingBalance >= 0
                  ? 'bg-emerald-100 dark:bg-emerald-900/30'
                  : 'bg-red-100 dark:bg-red-900/30'
              }`}>
                <PiggyBankIcon className={`h-4 w-4 sm:h-6 sm:w-6 ${
                  remainingBalance >= 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-red-600 dark:text-red-400'
                }`} />
              </div>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity ${
            remainingBalance >= 0 ? 'bg-emerald-500' : 'bg-red-500'
          }`} />
        </Card>
      </div>

      {/* Quick Stats Row - Only show if there are debts or savings */}
      {(totalDebts > 0 || totalSavings > 0) && (
        <div className="grid gap-2 sm:gap-3 grid-cols-2">
          {totalDebts > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-orange-200 dark:border-orange-800/30">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                    <CreditCardIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-xs text-muted-foreground">Total Debt</p>
                    <p className="text-xs sm:text-lg font-bold text-orange-600 dark:text-orange-400 truncate">{formatCurrency(totalDebts)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          {totalSavings > 0 && (
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-200 dark:border-emerald-800/30">
              <CardContent className="p-2.5 sm:p-4">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="h-7 w-7 sm:h-10 sm:w-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                    <TargetIcon className="h-3.5 w-3.5 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[9px] sm:text-xs text-muted-foreground">Total Savings</p>
                    <p className="text-xs sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">{formatCurrency(totalSavings)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Enhanced Progress Bar */}
      <Card className="overflow-hidden">
        <CardContent className="p-3 sm:p-6">
          <div className="space-y-2 sm:space-y-3">
            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ReceiptIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">Budget Usage</span>
              </div>
              <span className="text-[10px] sm:text-sm font-semibold whitespace-nowrap">
                {formatCurrency(totalExpenses)} / {formatCurrency(salary)}
              </span>
            </div>

            {/* Progress bar with markers */}
            <div className="relative">
              <div className={`w-full h-3 sm:h-4 rounded-full ${getProgressBgColor()} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${getProgressColor()} transition-all duration-500 ease-out`}
                  style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                />
              </div>

              {/* Milestone markers */}
              <div className="absolute inset-0 flex items-center pointer-events-none">
                <div className="absolute left-1/2 w-0.5 h-2 sm:h-3 bg-gray-400/50 dark:bg-gray-500/50 rounded-full" style={{ transform: 'translateX(-50%)' }} />
                <div className="absolute left-3/4 w-0.5 h-2 sm:h-3 bg-gray-400/50 dark:bg-gray-500/50 rounded-full" style={{ transform: 'translateX(-50%)' }} />
                <div className="absolute left-[90%] w-0.5 h-2 sm:h-3 bg-gray-400/50 dark:bg-gray-500/50 rounded-full" style={{ transform: 'translateX(-50%)' }} />
              </div>
            </div>

            {/* Milestone labels */}
            <div className="flex justify-between text-[10px] sm:text-xs text-muted-foreground px-1">
              <span>0%</span>
              <span>50%</span>
              <span>75%</span>
              <span>90%</span>
              <span>100%</span>
            </div>

            {/* Warning message */}
            {expensePercentage >= 75 && (
              <div className={`flex items-center gap-2 p-2 rounded-lg text-xs sm:text-sm ${
                expensePercentage >= 90
                  ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <span>
                  {expensePercentage >= 90
                    ? "You've spent 90% of your budget!"
                    : "You're approaching your budget limit"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};
