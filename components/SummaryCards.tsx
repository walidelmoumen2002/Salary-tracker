// components/SummaryCards.tsx
import React from 'react';
import { Card, CardContent } from './ui/Card';
import { formatCurrency } from '../lib/utils';

interface SummaryCardsProps {
  salary: number;
  totalExpenses: number;
  remainingBalance: number;
  fixedExpensesTotal?: number;
  totalDebts?: number;
  paidDebts?: number;
  totalSavings?: number;
}

// Icons - slightly larger base size for better mobile visibility
const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
    <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
  </svg>
);

const TrendingDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <polyline points="22 17 13.5 8.5 8.5 13.5 2 7" />
    <polyline points="16 17 22 17 22 11" />
  </svg>
);

const PiggyBankIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z" />
    <path d="M2 9v1c0 1.1.9 2 2 2h1" />
    <path d="M16 11h.01" />
  </svg>
);

const ReceiptIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5v-11" />
  </svg>
);

const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const AlertIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  salary,
  totalExpenses,
  remainingBalance,
  fixedExpensesTotal = 0,
  totalDebts = 0,
  paidDebts = 0,
  totalSavings = 0
}) => {
  const expensePercentage = salary > 0 ? (totalExpenses / salary) * 100 : 0;
  const isPositiveBalance = remainingBalance >= 0;

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
    <section className="space-y-3">
      {/* Main Summary Cards - Stacked on mobile for better readability */}
      <div className="grid gap-2.5 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">

        {/* Salary Card */}
        <Card className="relative overflow-hidden active:scale-[0.98] transition-transform duration-150">
          <CardContent className="p-4 pt-10 pb-8 sm:p-6 sm:py-7">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <WalletIcon className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Monthly Income
                </p>
                <p className="text-lg sm:text-2xl font-bold tracking-tight truncate">
                  {formatCurrency(salary)}
                </p>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-blue-600" />
        </Card>

        {/* Expenses Card */}
        <Card className="relative overflow-hidden active:scale-[0.98] transition-transform duration-150">
          <CardContent className="p-4 pt-10 pb-8 sm:p-6 sm:py-7">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-red-100 dark:bg-red-900/40 flex items-center justify-center flex-shrink-0">
                <TrendingDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Total Expenses
                </p>
                <p className="text-lg sm:text-2xl font-bold tracking-tight text-red-600 dark:text-red-400 truncate">
                  {formatCurrency(totalExpenses)}
                </p>
                {fixedExpensesTotal > 0 && (
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    +{formatCurrency(fixedExpensesTotal)} fixed
                  </p>
                )}
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 to-red-600" />
        </Card>

        {/* Balance Card - Full width on xs screens */}
        <Card className="relative overflow-hidden active:scale-[0.98] transition-transform duration-150 xs:col-span-2 lg:col-span-1">
          <CardContent className="p-4 pt-10 pb-8 sm:p-6 sm:py-7">
            <div className="flex items-center gap-3">
              <div className={`h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPositiveBalance
                ? 'bg-emerald-100 dark:bg-emerald-900/40'
                : 'bg-red-100 dark:bg-red-900/40'
                }`}>
                <PiggyBankIcon className={`h-5 w-5 sm:h-6 sm:w-6 ${isPositiveBalance
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
                  }`} />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Remaining Balance
                </p>
                <p className={`text-lg sm:text-2xl font-bold tracking-tight truncate ${isPositiveBalance
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-red-600 dark:text-red-400'
                  }`}>
                  {formatCurrency(remainingBalance)}
                </p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  {expensePercentage.toFixed(0)}% of income spent
                </p>
              </div>
            </div>
          </CardContent>
          <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${isPositiveBalance
            ? 'from-emerald-400 to-emerald-600'
            : 'from-red-400 to-red-600'
            }`} />
        </Card>
      </div>

      {/* Quick Stats Row */}
      {(totalDebts > 0 || totalSavings > 0) && (
        <div className="grid gap-2.5 grid-cols-1 sm:grid-cols-2">
          {totalDebts > 0 && (
            <Card className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200/60 dark:border-orange-800/40">
              <CardContent className="p-4 pt-8 pb-6 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg bg-orange-100 dark:bg-orange-900/50 flex items-center justify-center flex-shrink-0">
                    <CreditCardIcon className="h-5 w-5 sm:h-5 sm:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs sm:text-xs text-orange-700/70 dark:text-orange-300/70 font-medium">
                      Total Debt
                    </p>
                    <p className="text-lg sm:text-lg font-bold text-orange-600 dark:text-orange-400 truncate">
                      {formatCurrency(totalDebts)}
                    </p>
                    {paidDebts > 0 && (
                      <p className="text-xs sm:text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(paidDebts)} paid
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {totalSavings > 0 && (
            <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-emerald-200/60 dark:border-emerald-800/40">
              <CardContent className="p-4 pt-8 pb-6 sm:p-5">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 sm:h-10 sm:w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                    <TargetIcon className="h-5 w-5 sm:h-5 sm:w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="text-xs sm:text-xs text-emerald-700/70 dark:text-emerald-300/70 font-medium">
                      Total Savings
                    </p>
                    <p className="text-lg sm:text-lg font-bold text-emerald-600 dark:text-emerald-400 truncate">
                      {formatCurrency(totalSavings)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Budget Progress Section - Simplified for mobile */}
      <Card>
        <CardContent className="p-4 pt-8 pb-6 sm:p-5">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ReceiptIcon className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-semibold">Budget Usage</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold">
                  {expensePercentage.toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="relative">
              <div className={`w-full h-3 rounded-full ${getProgressBgColor()} overflow-hidden`}>
                <div
                  className={`h-full rounded-full ${getProgressColor()} transition-all duration-700 ease-out relative overflow-hidden`}
                  style={{ width: `${Math.min(expensePercentage, 100)}%` }}
                >
                  {/* Subtle shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </div>
              </div>

              {/* Threshold markers - simplified for mobile */}
              <div className="absolute inset-y-0 left-1/2 w-px bg-gray-400/40 dark:bg-gray-500/40" />
              <div className="absolute inset-y-0 left-3/4 w-px bg-gray-400/40 dark:bg-gray-500/40" />
              <div className="absolute inset-y-0 left-[90%] w-px bg-gray-400/40 dark:bg-gray-500/40" />
            </div>

            {/* Amount details */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(totalExpenses)}</span>
              <span>of {formatCurrency(salary)}</span>
            </div>

            {/* Warning - more compact on mobile */}
            {expensePercentage >= 75 && (
              <div className={`flex items-center gap-2.5 p-2.5 rounded-lg ${expensePercentage >= 90
                ? 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'
                : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                }`}>
                <AlertIcon className="h-4 w-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">
                  {expensePercentage >= 90
                    ? "Budget nearly depleted!"
                    : "Approaching budget limit"}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </section>
  );
};