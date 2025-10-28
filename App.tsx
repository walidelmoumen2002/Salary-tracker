
import React, { useState, useMemo, useCallback } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Expense } from './types';
import { Header } from './components/Header';
import { SummaryCards } from './components/SummaryCards';
import { AddExpense } from './components/AddExpense';
import { ExpenseDashboard } from './components/ExpenseDashboard';
import { ThemeProvider } from './contexts/ThemeContext';

// Local Plus icon component to avoid external dependencies
const Plus: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

const App: React.FC = () => {
  const [expenses, setExpenses] = useLocalStorage<Expense[]>('expenses', []);
  const [salary, setSalary] = useLocalStorage<number>('salary', 5000);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);

  const addExpense = useCallback((expense: Omit<Expense, 'id'>) => {
    setExpenses(prev => [...prev, { ...expense, id: `exp_${Date.now()}` }]);
  }, [setExpenses]);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  }, [setExpenses]);
  
  const totalExpenses = useMemo(() => {
    return expenses.reduce((sum, expense) => sum + expense.amount, 0);
  }, [expenses]);

  const remainingBalance = useMemo(() => salary - totalExpenses, [salary, totalExpenses]);

  return (
    // FIX: Combined SalaryTrackerApp and App components to resolve typing issue with ThemeProvider
    <ThemeProvider defaultTheme="dark" storageKey="salary-tracker-theme">
      <div className="min-h-screen bg-background text-foreground font-sans antialiased">
        <Header salary={salary} setSalary={setSalary} />

        <main className="container mx-auto p-4 md:p-8 space-y-8">
          <SummaryCards
            salary={salary}
            totalExpenses={totalExpenses}
            remainingBalance={remainingBalance}
          />
          
          <ExpenseDashboard expenses={expenses} deleteExpense={deleteExpense} />
        </main>

        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setIsAddExpenseOpen(true)}
            className="bg-primary text-primary-foreground h-16 w-16 rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            aria-label="Add new expense"
          >
            <Plus className="h-8 w-8" />
          </button>
        </div>

        <AddExpense 
          isOpen={isAddExpenseOpen}
          onClose={() => setIsAddExpenseOpen(false)}
          addExpense={addExpense}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;