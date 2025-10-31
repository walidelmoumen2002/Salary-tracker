
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Expense, Category, FixedExpense, DEFAULT_CATEGORIES } from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AddExpense } from './components/AddExpense';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { ThemeProvider } from './contexts/ThemeContext';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import type { Session, User } from '@supabase/supabase-js';
import { FixedExpenses } from './components/FixedExpenses';

const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

type Page = 'dashboard' | 'fixedExpenses';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salary, setSalary] = useState<number>(7000);
  const [categories, setCategories] = useState<Category[]>([...DEFAULT_CATEGORIES]);
  const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>([]);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = useCallback(async (user: User) => {
    // Fetch Salary
    const { data: profile } = await supabase.from('profiles').select('salary').eq('id', user.id).single();
    if (profile) setSalary(profile.salary);

    // Fetch Expenses
    const { data: expensesData } = await supabase.from('expense').select('*').eq('user_id', user.id);
    if (expensesData) setExpenses(expensesData.map(e => ({...e, id: e.id.toString() })));

    // Fetch Categories
    const { data: categoriesData } = await supabase.from('categories').select('name').eq('user_id', user.id);
    if (categoriesData) {
      const userCategories = categoriesData.map(c => c.name);
      setCategories([...new Set([...DEFAULT_CATEGORIES, ...userCategories])]);
    }

    // Fetch Fixed Expenses
    const { data: fixedExpensesData } = await supabase.from('fixed_expenses').select('*').eq('user_id', user.id);
    if (fixedExpensesData) setFixedExpenses(fixedExpensesData.map(e => ({...e, id: e.id.toString() })));

  }, []);

  useEffect(() => {
    if (user) {
      fetchData(user);
    } else {
      // Reset state on logout
      setExpenses([]);
      setSalary(7000);
      setCategories([...DEFAULT_CATEGORIES]);
      setFixedExpenses([]);
    }
  }, [user, fetchData]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id'>) => {
    if (!user) return;
    const { data, error } = await supabase.from('expense').insert([{ ...expense, user_id: user.id }]).select();
    if (data) {
      setExpenses(prev => [...prev, { ...data[0], id: data[0].id.toString() }]);
    }
    if (error) console.error("Error adding expense:", error);
  }, [user]);

  const deleteExpense = useCallback(async (id: string) => {
    const { error } = await supabase.from('expense').delete().match({ id });
    if (!error) {
      setExpenses(prev => prev.filter(expense => expense.id !== id));
    } else {
      console.error("Error deleting expense:", error);
    }
  }, []);

  const updateSalary = useCallback(async (newSalary: number) => {
    if (!user) return;
    const { error } = await supabase.from('profiles').update({ salary: newSalary }).eq('id', user.id);
    if (!error) {
      setSalary(newSalary);
    } else {
      console.error("Error updating salary:", error);
    }
  }, [user]);

  const addCategory = useCallback(async (category: Category) => {
    if (!user || categories.includes(category)) return;
    const { error } = await supabase.from('categories').insert([{ name: category, user_id: user.id }]);
    if (!error) {
        setCategories(prev => [...prev, category]);
    } else {
        console.error("Error adding category", error);
    }
  }, [user, categories]);
  
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => salary - totalExpenses, [salary, totalExpenses]);

  if (loading) {
      return <div className="min-h-screen bg-background flex items-center justify-center"><p>Loading...</p></div>;
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
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Header 
          salary={salary} 
          setSalary={updateSalary} 
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          />

        <main className="container mx-auto p-4 md:p-8 space-y-8">
          {currentPage === 'dashboard' ? (
            <>
              <SummaryCards
                salary={salary}
                totalExpenses={totalExpenses}
                remainingBalance={remainingBalance}
              />
              <ExpenseDashboard expenses={expenses} deleteExpense={deleteExpense} categories={categories}/>
            </>
          ) : (
            <FixedExpenses initialFixedExpenses={fixedExpenses} />
          )}
        </main>

        {currentPage === 'dashboard' && (
          <div className="fixed bottom-6 right-6 z-50">
            <button
              onClick={() => setIsAddExpenseOpen(true)}
              className="bg-primary text-primary-foreground h-16 w-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              aria-label="Add new expense"
            >
              <Plus className="h-8 w-8" />
            </button>
          </div>
        )}

        <AddExpense 
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          addExpense={addExpense}
          categories={categories}
          addCategory={addCategory}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
