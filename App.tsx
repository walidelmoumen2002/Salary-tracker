import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Expense, Category, FixedExpense, DEFAULT_CATEGORIES, Debt, SavingsGoal } from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AddExpense } from './components/AddExpense';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { ExpenseList } from './components/ExpenseList';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import { UpdatePassword } from './components/UpdatePassword';
import type { Session, User } from '@supabase/supabase-js';
import { FixedExpenses } from './components/FixedExpenses';
import { DebtManager } from './components/DebtManager';
import { SavingsGoals } from './components/SavingsGoals';
import { MobileNav, Page } from './components/Nav';
import { Sidebar } from './components/Sidebar';
import { BudgetManager } from './components/BudgetManager';
import { MonthlyReport } from './components/MonthlyReport';
import { formatCurrency, getErrorMessage } from './lib/utils';

// ── Trend chart (cumulative spend for the current month) ────────────────────
function TrendChart({ expenses, salary }: { expenses: Expense[]; salary: number }) {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = now.getDate();

  const monthExpenses = expenses.filter(e => {
    const [ey, em] = e.date.split('-').map(Number);
    return ey === year && em - 1 === month;
  });

  const perDay = new Array(daysInMonth + 2).fill(0);
  monthExpenses.forEach(e => { perDay[parseInt(e.date.slice(-2), 10)] += e.amount; });

  const series: { day: number; value: number }[] = [];
  let run = 0;
  for (let d = 1; d <= daysInMonth; d++) { run += perDay[d]; series.push({ day: d, value: run }); }

  const W = 720, H = 168, padB = 22, padT = 10;
  const maxY = Math.max(salary, (series[series.length - 1]?.value || 0)) * 1.04 || 1;
  const n = series.length;
  const sx = (i: number) => (i / (n - 1)) * W;
  const sy = (v: number) => padT + (1 - v / maxY) * (H - padB - padT);

  const linePts = series.map((_, i) => [sx(i), sy(series[i].value)] as [number, number]);
  const linePath = linePts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  const areaPath = linePts.length > 1
    ? linePath + ` L ${W} ${H - padB} L 0 ${H - padB} Z`
    : '';
  const salaryY = sy(salary);

  const todayIdx = Math.min(today - 1, n - 1);
  const todayVal = series[todayIdx]?.value ?? 0;

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long' });

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none" className="overflow-visible">
        <defs>
          <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--accent-color)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--accent-color)" stopOpacity="0" />
          </linearGradient>
        </defs>
        {salary > 0 && (
          <line x1="0" y1={salaryY} x2={W} y2={salaryY} stroke="var(--faint)" strokeWidth="1" strokeDasharray="2 4" />
        )}
        {areaPath && <path d={areaPath} fill="url(#trendFill)" />}
        {linePath && (
          <path d={linePath} fill="none" stroke="var(--accent-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        )}
        {n > 0 && (
          <circle cx={sx(todayIdx)} cy={sy(todayVal)} r="3.5" fill="white" stroke="var(--accent-color)" strokeWidth="2" />
        )}
      </svg>
      <div className="flex justify-between mt-1.5 px-0.5">
        <span className="font-mono text-muted-foreground" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {monthLabel} 1
        </span>
        <span className="font-mono text-muted-foreground" style={{ fontSize: '0.62rem' }}>
          income ceiling {formatCurrency(salary)}
        </span>
        <span className="font-mono text-muted-foreground" style={{ fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          {monthLabel} {daysInMonth}
        </span>
      </div>
    </div>
  );
}

// ── Category breakdown (horizontal bars) ───────────────────────────────────
function CategoryBreakdown({ expenses }: { expenses: Expense[] }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const totals = Object.entries(
    expenses.reduce((acc, e) => { acc[e.category] = (acc[e.category] || 0) + e.amount; return acc; }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 6);

  if (totals.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
        No expenses yet
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {totals.map(([cat, value], i) => {
        const pct = total > 0 ? (value / total) * 100 : 0;
        const op = 1 - i * 0.13;
        return (
          <div key={cat}>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-sm font-medium text-ink truncate">{cat}</span>
              <div className="flex items-baseline gap-2 flex-shrink-0 ml-2">
                <span className="num text-sm font-semibold text-ink">{formatCurrency(value)}</span>
                <span className="font-mono text-muted-foreground text-right" style={{ fontSize: '0.7rem', minWidth: '2.25rem' }}>
                  {pct.toFixed(0)}%
                </span>
              </div>
            </div>
            <div
              className="h-1.5 bg-paper border overflow-hidden"
              style={{ borderColor: 'color-mix(in oklab, var(--line) 60%, transparent)', borderRadius: 'var(--radius)' }}
            >
              <div
                className="h-full"
                style={{ width: pct + '%', background: 'var(--accent-color)', opacity: op, borderRadius: 'var(--radius)' }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Recent expense row ──────────────────────────────────────────────────────
interface RecentRowProps { key?: React.Key; exp: Expense; onDelete?: (id: string) => void }
function RecentRow({ exp, onDelete }: RecentRowProps) {
  return (
    <div
      className="group flex items-center gap-3.5 hover:bg-paper transition-colors"
      style={{ paddingTop: 'var(--row-pad)', paddingBottom: 'var(--row-pad)', borderRadius: 'var(--radius)' }}
    >
      <div
        className="h-10 w-10 flex-shrink-0 border flex items-center justify-center text-xs font-bold text-muted-foreground"
        style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)' }}
      >
        {exp.category.substring(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink truncate leading-tight">{exp.description}</p>
        <p className="font-mono text-[0.72rem] text-muted-foreground mt-0.5">{exp.category}</p>
      </div>
      <span className="num text-sm font-semibold text-ink flex-shrink-0">{formatCurrency(exp.amount)}</span>
      {onDelete && (
        <button
          onClick={() => onDelete(exp.id)}
          className="focus-ring opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all flex-shrink-0 -mr-1"
          aria-label="Delete"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/>
          </svg>
        </button>
      )}
    </div>
  );
}

// ── Placeholder for non-redesigned screens ──────────────────────────────────
function Placeholder({ title }: { title: string }) {
  return (
    <div className="max-w-[920px] mx-auto">
      <div className="bg-surface border p-10 sm:p-14 text-center" style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}>
        <p className="text-base font-bold text-ink">{title}</p>
        <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
          This screen keeps the classic layout for now.
        </p>
      </div>
    </div>
  );
}

// ── Main App ────────────────────────────────────────────────────────────────
const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalaryState] = useState<number>(7000);
  const [categories, setCategories] = useState<Category[]>([...DEFAULT_CATEGORIES]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleGlobalError = useCallback((error: any) => {
    console.error('Global Error:', error);
    const msg = getErrorMessage(error);
    setGlobalError(msg);
    if (!msg.includes('Unable to connect')) setTimeout(() => setGlobalError(null), 5000);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        if ((error as any).message === 'Failed to fetch') handleGlobalError(error);
      } finally {
        setLoading(false);
      }
    };
    getSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') setIsUpdatePasswordOpen(true);
    });
    return () => subscription.unsubscribe();
  }, [handleGlobalError]);

  const fetchData = useCallback(async (u: User) => {
    setGlobalError(null);
    try {
      const { data: profile } = await supabase.from('profiles').select('salary').eq('id', u.id).maybeSingle();
      if (profile?.salary) setSalaryState(profile.salary);

      const { data: expensesData, error: expErr } = await supabase.from('expenses').select('*').eq('user_id', u.id);
      if (expErr) throw expErr;
      if (expensesData) setExpenses(expensesData.map(e => ({ ...e, id: e.id.toString() })));

      const { data: catData } = await supabase.from('categories').select('name').eq('user_id', u.id);
      if (catData) setCategories([...new Set([...DEFAULT_CATEGORIES, ...catData.map(c => c.name)])]);

      const { data: fixedData, error: fixErr } = await supabase.from('fixed_expenses').select('*').eq('user_id', u.id);
      if (fixErr) throw fixErr;
      if (fixedData) setFixedExpenses(fixedData.map(e => ({ ...e, id: e.id.toString() })));

      const { data: debtsData } = await supabase.from('debts').select('*').eq('user_id', u.id);
      if (debtsData) setDebts(debtsData.map(d => ({ ...d, id: d.id.toString() })));

      const { data: savingsData } = await supabase.from('savings_goals').select('*').eq('user_id', u.id);
      if (savingsData) setSavingsGoals(savingsData.map(s => ({ ...s, id: s.id.toString() })));
    } catch (error) { handleGlobalError(error); }
  }, [handleGlobalError]);

  useEffect(() => {
    if (user) {
      fetchData(user);
    } else {
      setExpenses([]); setSalaryState(7000); setCategories([...DEFAULT_CATEGORIES]);
      setFixedExpenses([]); setDebts([]); setSavingsGoals([]);
    }
  }, [user, fetchData]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('expenses').insert([{ ...expense, user_id: user.id }]).select();
      if (error) throw error;
      if (data) setExpenses(prev => [...prev, { ...data[0], id: data[0].id.toString() }]);
    } catch (error) { handleGlobalError(error); }
  }, [user, handleGlobalError]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().match({ id });
      if (error) throw error;
      setExpenses(prev => prev.filter(e => e.id !== id));
    } catch (error) { handleGlobalError(error); }
  }, [handleGlobalError]);

  const updateSalary = useCallback(async (newSalary: number) => {
    if (!user) return;
    try {
      const { data, error: uErr } = await supabase.from('profiles').update({ salary: newSalary }).eq('id', user.id).select();
      if (!uErr && (!data || data.length === 0)) {
        const { error: iErr } = await supabase.from('profiles').insert({ id: user.id, salary: newSalary });
        if (iErr) throw iErr;
      } else if (uErr) throw uErr;
      setSalaryState(newSalary);
    } catch (error) { handleGlobalError(error); }
  }, [user, handleGlobalError]);

  const addCategory = useCallback(async (category: Category) => {
    if (!user || categories.includes(category)) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: category, user_id: user.id }]);
      if (error) throw error;
      setCategories(prev => [...prev, category]);
    } catch (error) { handleGlobalError(error); }
  }, [user, categories, handleGlobalError]);

  const deleteCategory = useCallback(async (category: Category) => {
    if (!user || DEFAULT_CATEGORIES.includes(category as any)) return;
    try {
      const { error } = await supabase.from('categories').delete().eq('name', category).eq('user_id', user.id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c !== category));
    } catch (error) { handleGlobalError(error); }
  }, [user, handleGlobalError]);

  const totalExpenses = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const remainingBalance = useMemo(() => salary - totalExpenses, [salary, totalExpenses]);
  const recentExpenses = useMemo(() => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 5), [expenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" style={{ borderColor: 'var(--line)', borderTopColor: 'var(--accent-color)' }} />
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <ThemeProvider defaultTheme="light" storageKey="salary-tracker-theme">
        <Auth />
      </ThemeProvider>
    );
  }

  const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div className={'bg-surface border ' + className} style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}>
      {children}
    </div>
  );

  return (
    <ThemeProvider defaultTheme="light" storageKey="salary-tracker-theme">
      <div className="flex min-h-screen bg-paper">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onAdd={() => setIsAddExpenseOpen(true)}
            user={user}
            salary={salary}
            setSalary={updateSalary}
          />

          {globalError && (
            <div className="px-4 py-3 text-center text-sm font-medium border-b" style={{ background: 'var(--warn-soft)', color: 'var(--warn-color)', borderColor: 'color-mix(in oklab, var(--warn-color) 20%, transparent)' }}>
              <p>{globalError}</p>
            </div>
          )}

          <main className="flex-1 px-5 md:px-9 py-5 md:py-7 pb-24 md:pb-10 overflow-y-auto">
            {/* ── Dashboard ──────────────────────────────────────────────── */}
            {currentPage === 'dashboard' && (
              <div className="space-y-3 max-w-[1180px] mx-auto">
                <SummaryCards
                  salary={salary}
                  setSalary={updateSalary}
                  totalExpenses={totalExpenses}
                  remainingBalance={remainingBalance}
                />

                {/* Trend + Budget meter */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <Card className="lg:col-span-2 p-5 sm:p-6">
                    <div className="flex items-start justify-between mb-5">
                      <div>
                        <p className="eyebrow">Spending trend</p>
                        <p className="text-base font-bold mt-1 text-ink">Cumulative this month</p>
                      </div>
                      <div className="text-right">
                        <p className="num text-lg font-bold leading-none text-ink">{formatCurrency(totalExpenses)}</p>
                        <p className="font-mono text-[0.7rem] text-muted-foreground mt-1">of {formatCurrency(salary)}</p>
                      </div>
                    </div>
                    <TrendChart expenses={expenses} salary={salary} />
                  </Card>

                  <Card className="p-5 sm:p-6">
                    {(() => {
                      const pct = salary > 0 ? (totalExpenses / salary) * 100 : 0;
                      const over = pct >= 90;
                      const near = pct >= 75;
                      const tone = over ? 'var(--warn-color)' : 'var(--accent-color)';
                      return (
                        <div className="space-y-3">
                          <div className="flex items-end justify-between">
                            <div>
                              <p className="eyebrow">Spent this month</p>
                              <p className="num text-2xl font-bold mt-1 text-ink">
                                {formatCurrency(totalExpenses)}
                                <span className="text-sm font-medium text-muted-foreground"> / {formatCurrency(salary)}</span>
                              </p>
                            </div>
                            <span className="num text-2xl font-bold" style={{ color: tone }}>{pct.toFixed(0)}%</span>
                          </div>
                          <div className="relative h-2.5 bg-paper border overflow-hidden" style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}>
                            <div className="h-full" style={{ width: Math.min(pct, 100) + '%', background: tone, borderRadius: 'var(--radius)' }} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-[0.7rem] text-muted-foreground">
                              {over ? 'Over pace — ease up' : near ? 'Approaching limit' : 'Comfortable pace'}
                            </span>
                            <span className="font-mono text-[0.7rem] text-muted-foreground">
                              {formatCurrency(Math.max(salary - totalExpenses, 0))} left
                            </span>
                          </div>
                        </div>
                      );
                    })()}
                  </Card>
                </div>

                {/* Category breakdown + Recent expenses */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <Card className="p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <p className="eyebrow">Where it went</p>
                        <p className="text-base font-bold mt-1 text-ink">By category</p>
                      </div>
                    </div>
                    <CategoryBreakdown expenses={expenses} />
                  </Card>

                  <Card className="lg:col-span-2 p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="eyebrow">Latest activity</p>
                        <p className="text-base font-bold mt-1 text-ink">Recent expenses</p>
                      </div>
                      <button
                        onClick={() => setIsAddExpenseOpen(true)}
                        className="focus-ring inline-flex items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
                        style={{ color: 'var(--accent-color)' }}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M12 5v14M5 12h14"/>
                        </svg>
                        Add
                      </button>
                    </div>
                    {recentExpenses.length === 0 ? (
                      <div className="py-12 text-center text-sm text-muted-foreground">No expenses yet</div>
                    ) : (
                      <div className="divide-y" style={{ borderColor: 'color-mix(in oklab, var(--line) 70%, transparent)' }}>
                        {recentExpenses.map(e => <RecentRow key={e.id} exp={e} onDelete={deleteExpense} />)}
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            )}

            {/* ── Expenses ───────────────────────────────────────────────── */}
            {currentPage === 'expenses' && (
              <ExpenseDashboard expenses={expenses} deleteExpense={deleteExpense} categories={categories} />
            )}

            {/* ── Other screens ──────────────────────────────────────────── */}
            {currentPage === 'fixedExpenses' && <FixedExpenses initialFixedExpenses={fixedExpenses} user={user} />}
            {currentPage === 'debts' && <DebtManager initialDebts={debts} user={user} />}
            {currentPage === 'savings' && <SavingsGoals initialGoals={savingsGoals} user={user} monthlyIncome={salary} />}
            {currentPage === 'budgets' && <BudgetManager expenses={expenses} user={user} salary={salary} />}
            {currentPage === 'reports' && <MonthlyReport expenses={expenses} salary={salary} />}
          </main>
        </div>

        <MobileNav
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          onAdd={() => setIsAddExpenseOpen(true)}
        />

        <AddExpense
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          addExpense={addExpense}
          categories={categories}
          addCategory={addCategory}
          deleteCategory={deleteCategory}
        />

        <UpdatePassword
          isOpen={isUpdatePasswordOpen}
          onClose={() => setIsUpdatePasswordOpen(false)}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
