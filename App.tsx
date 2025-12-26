
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Expense, Category, FixedExpense, DEFAULT_CATEGORIES, Debt, SavingsGoal } from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AddExpense } from './components/AddExpense';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { ExpenseCharts } from './components/ExpenseCharts';
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
import { Footer } from './components/Footer';
import { BudgetManager } from './components/BudgetManager';
import { MonthlyReport } from './components/MonthlyReport';
import { getErrorMessage } from './lib/utils';
import { Button } from './components/ui/Button';

const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8" />
    <path d="M8 12h8" />
  </svg>
);

const X: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<number>(7000);
  const [categories, setCategories] = useState<Category[]>([...DEFAULT_CATEGORIES]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [isUpdatePasswordOpen, setIsUpdatePasswordOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleGlobalError = useCallback((error: any) => {
    console.error("Global Error:", error);
    const msg = getErrorMessage(error);
    setGlobalError(msg);

    // Auto-dismiss error after 5 seconds only if it's NOT a connection error
    if (!msg.includes("Unable to connect")) {
      setTimeout(() => setGlobalError(null), 5000);
    }
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error("Error getting session:", error);
        if ((error as any).message === "Failed to fetch") {
          handleGlobalError(error);
        }
      } finally {
        setLoading(false);
      }
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (event === 'PASSWORD_RECOVERY') {
        setIsUpdatePasswordOpen(true);
      }
    });

    return () => subscription.unsubscribe();
  }, [handleGlobalError]);

  const fetchData = useCallback(async (user: User) => {
    setGlobalError(null);
    try {
      // Fetch Salary
      const { data: profile, error: profileError } = await supabase.from('profiles').select('salary').eq('id', user.id).maybeSingle();
      if (profileError && profileError.code !== 'PGRST116' && profileError.code !== '406') {
        console.warn('Profile fetch issue:', profileError);
      }
      if (profile?.salary) setSalary(profile.salary);

      // Fetch Expenses
      const { data: expensesData, error: expensesError } = await supabase.from('expenses').select('*').eq('user_id', user.id);
      if (expensesError) throw expensesError;
      if (expensesData) setExpenses(expensesData.map(e => ({ ...e, id: e.id.toString() })));

      // Fetch Categories
      const { data: categoriesData, error: categoriesError } = await supabase.from('categories').select('name').eq('user_id', user.id);
      if (categoriesError) throw categoriesError;
      if (categoriesData) {
        const userCategories = categoriesData.map(c => c.name);
        setCategories([...new Set([...DEFAULT_CATEGORIES, ...userCategories])]);
      }

      // Fetch Fixed Expenses
      const { data: fixedExpensesData, error: fixedError } = await supabase.from('fixed_expenses').select('*').eq('user_id', user.id);
      if (fixedError) throw fixedError;
      if (fixedExpensesData) setFixedExpenses(fixedExpensesData.map(e => ({ ...e, id: e.id.toString() })));

      // Fetch Debts
      const { data: debtsData, error: debtsError } = await supabase.from('debts').select('*').eq('user_id', user.id);
      if (debtsError && debtsError.code !== 'PGRST116' && debtsError.code !== '42P01') {
        console.warn('Debts table might not exist yet:', debtsError);
      }
      if (debtsData) setDebts(debtsData.map(d => ({ ...d, id: d.id.toString() })));

      // Fetch Savings Goals
      const { data: savingsData, error: savingsError } = await supabase.from('savings_goals').select('*').eq('user_id', user.id);
      if (savingsError && savingsError.code !== 'PGRST116' && savingsError.code !== '42P01') {
        console.warn('Savings goals table might not exist yet:', savingsError);
      }
      if (savingsData) setSavingsGoals(savingsData.map(s => ({ ...s, id: s.id.toString() })));

    } catch (error) {
      handleGlobalError(error);
    }
  }, [handleGlobalError]);

  useEffect(() => {
    if (user) {
      fetchData(user);
    } else {
      // Reset state on logout
      setExpenses([]);
      setSalary(7000);
      setCategories([...DEFAULT_CATEGORIES]);
      setFixedExpenses([]);
      setDebts([]);
      setSavingsGoals([]);
    }
  }, [user, fetchData]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    try {
      const { data, error } = await supabase.from('expenses').insert([{ ...expense, user_id: user.id }]).select();
      if (error) throw error;
      if (data) {
        setExpenses(prev => [...prev, { ...data[0], id: data[0].id.toString() }]);
      }
    } catch (error) {
      handleGlobalError(error);
    }
  }, [user, handleGlobalError]);

  const deleteExpense = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('expenses').delete().match({ id });
      if (error) throw error;
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } catch (error) {
      handleGlobalError(error);
    }
  }, [handleGlobalError]);

  const updateSalary = useCallback(async (newSalary: number) => {
    if (!user) return;
    try {
      // Try to update existing profile first
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ salary: newSalary })
        .eq('id', user.id)
        .select();

      // If no row was updated (profile doesn't exist), insert it
      if (!updateError && (!data || data.length === 0)) {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, salary: newSalary });
        if (insertError) throw insertError;
      } else if (updateError) {
        throw updateError;
      }

      setSalary(newSalary);
    } catch (error) {
      handleGlobalError(error);
    }
  }, [user, handleGlobalError]);

  const addCategory = useCallback(async (category: Category) => {
    if (!user || categories.includes(category)) return;
    try {
      const { error } = await supabase.from('categories').insert([{ name: category, user_id: user.id }]);
      if (error) throw error;
      setCategories(prev => [...prev, category]);
    } catch (error) {
      handleGlobalError(error);
    }
  }, [user, categories, handleGlobalError]);

  const deleteCategory = useCallback(async (category: Category) => {
    if (!user || DEFAULT_CATEGORIES.includes(category as any)) return;
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('name', category)
        .eq('user_id', user.id);
      if (error) throw error;
      setCategories(prev => prev.filter(c => c !== category));
    } catch (error) {
      handleGlobalError(error);
    }
  }, [user, handleGlobalError]);

  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const fixedExpensesTotal = useMemo(() => {
    return fixedExpenses.reduce((sum, fe) => sum + fe.amount, 0);
  }, [fixedExpenses]);

  const totalDebts = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.current_balance, 0);
  }, [debts]);

  const paidDebts = useMemo(() => {
    return debts.reduce((sum, d) => sum + (d.total_amount - d.current_balance), 0);
  }, [debts]);

  const totalDebtsOriginal = useMemo(() => {
    return debts.reduce((sum, d) => sum + d.total_amount, 0);
  }, [debts]);

  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + g.current_amount, 0);
  }, [savingsGoals]);

  const remainingBalance = useMemo(() => salary - totalExpenses, [salary, totalExpenses]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <ThemeProvider defaultTheme="dark" storageKey="salary-tracker-theme">
        <Auth />
      </ThemeProvider>
    )
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="salary-tracker-theme">
      <div className="min-h-screen bg-background text-foreground font-sans antialiased flex">
        {/* Desktop Sidebar */}
        <Sidebar
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          isCollapsed={isSidebarCollapsed}
          onCollapsedChange={setIsSidebarCollapsed}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-h-screen">
          <Header
            salary={salary}
            setSalary={updateSalary}
            currentPage={currentPage}
            setCurrentPage={setCurrentPage}
            onMenuOpenChange={setIsMobileMenuOpen}
          />

          {globalError && (
            <div className="bg-destructive/15 text-destructive px-4 py-3 text-center text-sm font-medium border-b border-destructive/20 animate-in slide-in-from-top flex flex-col sm:flex-row items-center justify-center gap-2 relative">
              <p>{globalError}</p>
              {globalError.includes("Unable to connect") && user && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchData(user)}
                  className="h-7 px-3 border-destructive/30 hover:bg-destructive/20 bg-transparent text-destructive hover:text-destructive text-xs"
                >
                  Retry
                </Button>
              )}
              <button
                onClick={() => setGlobalError(null)}
                className="sm:absolute sm:right-4 p-1 hover:bg-destructive/20 rounded-full transition-colors"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <main className="flex-1 px-4 py-3 sm:px-6 sm:py-4 md:px-8 md:py-6 space-y-3 sm:space-y-6 pb-20 md:pb-6 overflow-y-auto">
          {currentPage === 'dashboard' && (
            <>
              <SummaryCards
                salary={salary}
                totalExpenses={totalExpenses}
                remainingBalance={remainingBalance}
                fixedExpensesTotal={fixedExpensesTotal}
                totalDebts={totalDebts}
                totalDebtsOriginal={totalDebtsOriginal}
                paidDebts={paidDebts}
                totalSavings={totalSavings}
              />
              <ExpenseCharts expenses={expenses} />
              <ExpenseList expenses={expenses} deleteExpense={deleteExpense} />
            </>
          )}

          {currentPage === 'expenses' && (
            <ExpenseDashboard expenses={expenses} deleteExpense={deleteExpense} categories={categories} />
          )}

          {currentPage === 'fixedExpenses' && (
            <FixedExpenses initialFixedExpenses={fixedExpenses} user={user} />
          )}

          {currentPage === 'debts' && (
            <DebtManager initialDebts={debts} user={user} />
          )}

          {currentPage === 'savings' && (
            <SavingsGoals initialGoals={savingsGoals} user={user} monthlyIncome={salary} />
          )}

          {currentPage === 'budgets' && (
            <BudgetManager expenses={expenses} user={user} salary={salary} />
          )}

          {currentPage === 'reports' && (
            <MonthlyReport expenses={expenses} salary={salary} />
          )}
          </main>

          {/* Footer - Hidden on mobile due to bottom nav */}
          <Footer />
        </div>

        {/* Floating Action Button - Only on expenses page */}
        {currentPage === 'expenses' && !isMobileMenuOpen && (
          <div className="fixed bottom-24 md:bottom-6 right-6 z-40">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-primary text-primary-foreground h-14 w-14 md:h-16 md:w-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Add new expense"
            >
              <Plus className="h-7 w-7 md:h-8 md:w-8" />
            </button>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <MobileNav currentPage={currentPage} setCurrentPage={setCurrentPage} />

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
