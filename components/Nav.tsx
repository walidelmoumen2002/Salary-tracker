import React from 'react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

interface NavProps {
  currentPage: 'dashboard' | 'fixedExpenses';
  setCurrentPage: (page: 'dashboard' | 'fixedExpenses') => void;
}

export const Nav: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClasses = (page: 'dashboard' | 'fixedExpenses') => cn(
    "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors",
    currentPage === page
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  return (
    <nav className="flex items-center space-x-2 md:space-x-4">
      <a onClick={() => setCurrentPage('dashboard')} className={navItemClasses('dashboard')}>
        Dashboard
      </a>
      <a onClick={() => setCurrentPage('fixedExpenses')} className={navItemClasses('fixedExpenses')}>
        Fixed Expenses
      </a>
    </nav>
  );
};
