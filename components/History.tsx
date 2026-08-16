import React, { useMemo, useState } from 'react';
import { Expense } from '../types';
import { formatCurrency, formatMonthLabel, currentMonthKey, monthKey } from '../lib/utils';

interface HistoryProps {
  expenses: Expense[];
  salary: number;
}

interface MonthSummary {
  key: string;
  label: string;
  total: number;
  count: number;
  saved: number;
  isCurrent: boolean;
  byCategory: { category: string; amount: number; pct: number }[];
  expenses: Expense[];
  /** Change vs the month before it — null when there is no prior month on record. */
  delta: number | null;
}

const ChevronIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={'bg-surface border ' + className} style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}>
    {children}
  </div>
);

export const History: React.FC<HistoryProps> = ({ expenses, salary }) => {
  const thisMonth = currentMonthKey();

  const months: MonthSummary[] = useMemo(() => {
    const buckets = new Map<string, Expense[]>();
    expenses.forEach(e => {
      const key = monthKey(e.date);
      const bucket = buckets.get(key);
      if (bucket) bucket.push(e);
      else buckets.set(key, [e]);
    });

    // Oldest → newest first so each month can be compared with the one before it.
    const ascending = Array.from(buckets.keys()).sort();

    const summaries = ascending.map((key, i) => {
      const monthExpenses = buckets.get(key)!;
      const total = monthExpenses.reduce((s, e) => s + e.amount, 0);

      const totals: Record<string, number> = {};
      monthExpenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });

      const prevKey = ascending[i - 1];
      const prevTotal = prevKey ? buckets.get(prevKey)!.reduce((s, e) => s + e.amount, 0) : null;

      return {
        key,
        label: formatMonthLabel(key),
        total,
        count: monthExpenses.length,
        saved: salary - total,
        isCurrent: key === thisMonth,
        byCategory: Object.entries(totals)
          .sort((a, b) => b[1] - a[1])
          .map(([category, amount]) => ({ category, amount, pct: total > 0 ? (amount / total) * 100 : 0 })),
        expenses: [...monthExpenses].sort((a, b) => b.date.localeCompare(a.date) || b.amount - a.amount),
        delta: prevTotal === null ? null : total - prevTotal,
      };
    });

    return summaries.reverse(); // newest first for display
  }, [expenses, salary, thisMonth]);

  const closedMonths = useMemo(() => months.filter(m => !m.isCurrent), [months]);

  // `undefined` means "untouched", so the newest closed month opens by itself
  // once the expenses have loaded.
  const [openMonth, setOpenMonth] = useState<string | null | undefined>(undefined);
  const expandedMonth = openMonth === undefined
    ? (closedMonths[0]?.key ?? months[0]?.key ?? null)
    : openMonth;

  const stats = useMemo(() => {
    if (closedMonths.length === 0) return null;
    const total = closedMonths.reduce((s, m) => s + m.total, 0);
    const highest = closedMonths.reduce((a, b) => (b.total > a.total ? b : a));
    const lowest = closedMonths.reduce((a, b) => (b.total < a.total ? b : a));
    return { total, average: total / closedMonths.length, highest, lowest, count: closedMonths.length };
  }, [closedMonths]);

  const peak = useMemo(() => Math.max(salary, ...months.map(m => m.total), 1), [months, salary]);

  if (months.length === 0) {
    return (
      <div className="max-w-[1180px] mx-auto">
        <Card className="p-10 sm:p-14 text-center">
          <p className="text-base font-bold text-ink">Nothing archived yet</p>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
            Each month is closed automatically on the 1st. Once a month rolls over, you will find it here.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-[1180px] mx-auto">
      {/* Lifetime stats over closed months */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-5">
            <p className="eyebrow">Months on record</p>
            <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none text-ink">{stats.count}</p>
            <p className="font-mono text-[0.72rem] text-muted-foreground mt-2.5">completed months</p>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">Average month</p>
            <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none text-ink">{formatCurrency(stats.average)}</p>
            <p className="font-mono text-[0.72rem] text-muted-foreground mt-2.5">
              {salary > 0 ? `${((stats.average / salary) * 100).toFixed(0)}% of income` : 'spent per month'}
            </p>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">Highest month</p>
            <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none" style={{ color: 'var(--warn-color)' }}>
              {formatCurrency(stats.highest.total)}
            </p>
            <p className="font-mono text-[0.72rem] text-muted-foreground mt-2.5">{stats.highest.label}</p>
          </Card>
          <Card className="p-5">
            <p className="eyebrow">Lowest month</p>
            <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none" style={{ color: 'var(--accent-color)' }}>
              {formatCurrency(stats.lowest.total)}
            </p>
            <p className="font-mono text-[0.72rem] text-muted-foreground mt-2.5">{stats.lowest.label}</p>
          </Card>
        </div>
      )}

      {/* Month by month */}
      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="eyebrow">Archive</p>
            <p className="text-base font-bold mt-1 text-ink">Month by month</p>
          </div>
          <p className="font-mono text-[0.7rem] text-muted-foreground text-right hidden sm:block">
            compared against {formatCurrency(salary)} income
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: 'color-mix(in oklab, var(--line) 70%, transparent)' }}>
          {months.map(m => {
            const open = expandedMonth === m.key;
            const pct = salary > 0 ? (m.total / salary) * 100 : 0;
            const barPct = (m.total / peak) * 100;
            const tone = pct >= 100 ? 'var(--warn-color)' : 'var(--accent-color)';

            return (
              <div key={m.key} className="py-3">
                <button
                  onClick={() => setOpenMonth(open ? null : m.key)}
                  className="focus-ring w-full text-left"
                  aria-expanded={open}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="text-muted-foreground flex-shrink-0 transition-transform"
                      style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
                    >
                      <ChevronIcon />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-ink">{m.label}</p>
                        {m.isCurrent && (
                          <span
                            className="font-mono px-1.5 py-0.5"
                            style={{ fontSize: '0.6rem', letterSpacing: '0.08em', textTransform: 'uppercase', background: 'var(--accent-soft)', color: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
                          >
                            In progress
                          </span>
                        )}
                      </div>
                      <p className="font-mono text-[0.7rem] text-muted-foreground mt-0.5">
                        {m.count} transaction{m.count !== 1 ? 's' : ''}
                        {m.delta !== null && (
                          <span style={{ color: m.delta > 0 ? 'var(--warn-color)' : 'var(--accent-color)' }}>
                            {' · '}{m.delta > 0 ? '+' : ''}{formatCurrency(m.delta)} vs prev
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <p className="num text-sm font-semibold text-ink">{formatCurrency(m.total)}</p>
                      <p className="font-mono text-[0.7rem] mt-0.5" style={{ color: m.saved >= 0 ? 'var(--accent-color)' : 'var(--warn-color)' }}>
                        {m.saved >= 0 ? `${formatCurrency(m.saved)} kept` : `${formatCurrency(Math.abs(m.saved))} over`}
                      </p>
                    </div>
                  </div>

                  <div
                    className="h-1.5 bg-paper border overflow-hidden mt-2.5"
                    style={{ borderColor: 'color-mix(in oklab, var(--line) 60%, transparent)', borderRadius: 'var(--radius)' }}
                  >
                    <div className="h-full" style={{ width: Math.min(barPct, 100) + '%', background: tone, borderRadius: 'var(--radius)' }} />
                  </div>
                </button>

                {open && (
                  <div className="mt-4 pl-0 sm:pl-7 grid grid-cols-1 lg:grid-cols-2 gap-5">
                    {/* Categories */}
                    <div>
                      <p className="eyebrow mb-3">Where it went</p>
                      <div className="space-y-3">
                        {m.byCategory.map(({ category, amount, pct: cpct }, i) => (
                          <div key={category}>
                            <div className="flex items-baseline justify-between mb-1.5">
                              <span className="text-sm font-medium text-ink truncate">{category}</span>
                              <div className="flex items-baseline gap-2 flex-shrink-0 ml-2">
                                <span className="num text-sm font-semibold text-ink">{formatCurrency(amount)}</span>
                                <span className="font-mono text-muted-foreground text-right" style={{ fontSize: '0.7rem', minWidth: '2.25rem' }}>
                                  {cpct.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                            <div
                              className="h-1.5 bg-paper border overflow-hidden"
                              style={{ borderColor: 'color-mix(in oklab, var(--line) 60%, transparent)', borderRadius: 'var(--radius)' }}
                            >
                              <div
                                className="h-full"
                                style={{ width: cpct + '%', background: 'var(--accent-color)', opacity: 1 - i * 0.13, borderRadius: 'var(--radius)' }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Transactions */}
                    <div>
                      <p className="eyebrow mb-3">All transactions</p>
                      <div
                        className="divide-y overflow-y-auto"
                        style={{ borderColor: 'color-mix(in oklab, var(--line) 70%, transparent)', maxHeight: '320px' }}
                      >
                        {m.expenses.map(e => (
                          <div key={e.id} className="flex items-center gap-3 py-2.5">
                            <span className="font-mono text-[0.7rem] text-muted-foreground flex-shrink-0" style={{ minWidth: '3.25rem' }}>
                              {new Date(e.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-ink truncate leading-tight">{e.description}</p>
                              <p className="font-mono text-[0.68rem] text-muted-foreground mt-0.5">{e.category}</p>
                            </div>
                            <span className="num text-sm font-semibold text-ink flex-shrink-0">{formatCurrency(e.amount)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default History;
