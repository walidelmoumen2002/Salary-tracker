import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';

interface SummaryCardsProps {
  salary: number;
  setSalary?: (s: number) => void;
  totalExpenses: number;
  remainingBalance: number;
  /** Month these totals cover, e.g. "August". */
  monthLabel?: string;
  /** Day the counters start over, e.g. "September 1". */
  resetsOn?: string;
  onViewHistory?: () => void;
}

const ArrowUpIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 19V5M6 11l6-6 6 6"/>
  </svg>
);

const ArrowDownIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 5v14M6 13l6 6 6-6"/>
  </svg>
);

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  salary, setSalary, totalExpenses, remainingBalance, monthLabel, resetsOn, onViewHistory,
}) => {
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(salary));

  const pct = salary > 0 ? (totalExpenses / salary) * 100 : 0;
  const over = pct >= 90;
  const near = pct >= 75;
  const tone = over ? 'var(--warn-color)' : 'var(--accent-color)';
  const savedPct = salary > 0 ? Math.round((remainingBalance / salary) * 100) : 0;

  const saveSalary = () => {
    const v = parseFloat(salaryInput);
    if (!isNaN(v) && v >= 0 && setSalary) setSalary(v);
    setEditingSalary(false);
  };

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
      className={'bg-surface border p-5 ' + className}
      style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
    >
      {children}
    </div>
  );

  return (
    <div className="space-y-3">
      {/* 3 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Income */}
        <Card>
          <p className="eyebrow">Monthly income</p>
          {editingSalary ? (
            <div className="flex gap-2 mt-2">
              <input
                type="number"
                value={salaryInput}
                onChange={e => setSalaryInput(e.target.value)}
                className="flex-1 h-9 px-3 text-sm border bg-paper text-ink num"
                style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
                autoFocus
                onKeyDown={e => e.key === 'Enter' && saveSalary()}
              />
              <button
                onClick={saveSalary}
                className="h-9 px-3 text-sm font-semibold text-white"
                style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
              >
                Save
              </button>
              <button
                onClick={() => setEditingSalary(false)}
                className="h-9 px-3 text-sm font-medium text-muted-foreground border"
                style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
              >
                ×
              </button>
            </div>
          ) : (
            <>
              <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none text-ink">
                {formatCurrency(salary)}
              </p>
              <div className="mt-2.5 flex items-center gap-2">
                <span className="font-mono text-[0.72rem] text-muted-foreground">Paid monthly</span>
                {setSalary && (
                  <button
                    onClick={() => { setSalaryInput(String(salary)); setEditingSalary(true); }}
                    className="font-mono text-[0.68rem] underline-offset-2 hover:underline"
                    style={{ color: 'var(--accent-color)' }}
                  >
                    Edit
                  </button>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Spent */}
        <Card>
          <p className="eyebrow">Spent so far{monthLabel ? ` · ${monthLabel}` : ''}</p>
          <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none text-ink">
            {formatCurrency(totalExpenses)}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[0.72rem] text-muted-foreground">
              {pct.toFixed(0)}% of income
            </span>
            {resetsOn && (
              <span className="font-mono text-[0.68rem] text-muted-foreground">· resets {resetsOn}</span>
            )}
          </div>
        </Card>

        {/* Remaining */}
        <Card>
          <p className="eyebrow">Remaining</p>
          <p className="num text-[2rem] font-bold tracking-tight mt-2 leading-none" style={{ color: 'var(--accent-color)' }}>
            {formatCurrency(Math.max(remainingBalance, 0))}
          </p>
          <div className="mt-2.5">
            <span className="font-mono text-[0.72rem] text-muted-foreground">
              {savedPct}% of income unspent
            </span>
          </div>
        </Card>
      </div>

      {/* Budget progress */}
      <div
        className="bg-surface border p-5"
        style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
      >
        <div className="flex items-end justify-between mb-3">
          <div>
            <p className="eyebrow">Spent in {monthLabel || 'this month'}</p>
            <p className="num text-2xl font-bold mt-1 text-ink">
              {formatCurrency(totalExpenses)}
              <span className="text-sm font-medium text-muted-foreground"> / {formatCurrency(salary)}</span>
            </p>
          </div>
          <span className="num text-2xl font-bold" style={{ color: tone }}>{pct.toFixed(0)}%</span>
        </div>

        <div
          className="relative h-2.5 bg-paper border overflow-hidden"
          style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
        >
          <div
            className="h-full"
            style={{ width: Math.min(pct, 100) + '%', background: tone, borderRadius: 'var(--radius)' }}
          />
        </div>

        <div className="flex items-center justify-between mt-3 gap-3">
          <span className="font-mono text-[0.7rem] text-muted-foreground">
            {over ? 'Over pace — ease up' : near ? 'Approaching your limit' : 'On a comfortable pace'}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.7rem] text-muted-foreground">
              {formatCurrency(Math.max(salary - totalExpenses, 0))} left
            </span>
            {onViewHistory && (
              <button
                onClick={onViewHistory}
                className="focus-ring font-mono text-[0.7rem] underline-offset-2 hover:underline"
                style={{ color: 'var(--accent-color)' }}
              >
                History
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
