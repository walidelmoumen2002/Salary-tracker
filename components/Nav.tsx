import React from 'react';

function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

export type Page = 'dashboard' | 'expenses' | 'fixedExpenses' | 'debts' | 'savings';

interface NavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

// Navigation Icons
const DashboardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>
  </svg>
);

const ReceiptIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/><path d="M14 8H8"/><path d="M16 12H8"/><path d="M13 16H8"/>
  </svg>
);

const CreditCardIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/>
  </svg>
);

const TargetIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);

const WalletIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1"/><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4"/>
  </svg>
);

const navItems: { page: Page; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { page: 'expenses', label: 'Expenses', icon: WalletIcon },
  { page: 'fixedExpenses', label: 'Fixed', icon: ReceiptIcon },
  { page: 'debts', label: 'Debts', icon: CreditCardIcon },
  { page: 'savings', label: 'Savings', icon: TargetIcon },
];

export const Nav: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClasses = (page: Page) => cn(
    "cursor-pointer px-2 md:px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
    currentPage === page
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  return (
    <nav className="flex items-center space-x-1 md:space-x-2">
      {navItems.map(({ page, label, icon: Icon }) => (
        <a
          key={page}
          onClick={() => setCurrentPage(page)}
          className={navItemClasses(page)}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden lg:inline">{label}</span>
        </a>
      ))}
    </nav>
  );
};

// Mobile Bottom Navigation
export const MobileNav: React.FC<NavProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClasses = (page: Page) => cn(
    "flex flex-col items-center justify-center py-2 px-3 rounded-lg transition-colors flex-1",
    currentPage === page
      ? "text-primary"
      : "text-muted-foreground"
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t z-50 md:hidden safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-1">
        {navItems.map(({ page, label, icon: Icon }) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={navItemClasses(page)}
          >
            <Icon className={cn(
              "h-5 w-5 mb-0.5 transition-transform",
              currentPage === page && "scale-110"
            )} />
            <span className="text-[10px] font-medium">{label}</span>
            {currentPage === page && (
              <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};
