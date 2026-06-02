import React from 'react';

export type Page = 'dashboard' | 'expenses' | 'fixedExpenses' | 'debts' | 'savings' | 'budgets' | 'reports';

interface NavProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onAdd?: () => void;
}

const DashboardIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="7" height="9" rx="0.5"/><rect x="14" y="3" width="7" height="5" rx="0.5"/>
    <rect x="14" y="12" width="7" height="9" rx="0.5"/><rect x="3" y="16" width="7" height="5" rx="0.5"/>
  </svg>
);

const WalletIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M16 12h.01"/>
  </svg>
);

const PiggyIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>
  </svg>
);

const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const PieIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3v9l7.5 4.3A9 9 0 1 0 12 3z"/><path d="M12 3a9 9 0 0 1 7.5 13.3"/>
  </svg>
);

const PRIMARY_NAV = [
  { page: 'dashboard' as Page, label: 'Home',     Icon: DashboardIcon },
  { page: 'expenses'  as Page, label: 'Expenses', Icon: WalletIcon    },
  // center FAB slot
  { page: 'budgets'   as Page, label: 'Budgets',  Icon: PieIcon       },
  { page: 'savings'   as Page, label: 'Savings',  Icon: PiggyIcon     },
];

export const MobileNav: React.FC<NavProps> = ({ currentPage, setCurrentPage, onAdd }) => {
  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t safe-area-bottom"
      style={{ background: 'color-mix(in oklab, var(--surface) 95%, transparent)', backdropFilter: 'blur(8px)', borderColor: 'var(--line)' }}
    >
      <div className="grid grid-cols-5 items-center h-16">
        {/* First 2 nav items */}
        {PRIMARY_NAV.slice(0, 2).map(({ page, label, Icon }) => (
          <NavBtn key={page} page={page} label={label} Icon={Icon} current={currentPage} set={setCurrentPage} />
        ))}

        {/* Center FAB */}
        <div className="flex justify-center">
          <button
            onClick={onAdd}
            className="focus-ring h-12 w-12 -mt-6 flex items-center justify-center text-white shadow-lg"
            style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
            aria-label="Add expense"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Last 2 nav items */}
        {PRIMARY_NAV.slice(2).map(({ page, label, Icon }) => (
          <NavBtn key={page} page={page} label={label} Icon={Icon} current={currentPage} set={setCurrentPage} />
        ))}
      </div>
    </nav>
  );
};

interface NavBtnProps {
  key?: React.Key;
  page: Page;
  label: string;
  Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement;
  current: Page;
  set: (p: Page) => void;
}

function NavBtn({ page, label, Icon, current, set }: NavBtnProps) {
  const active = current === page;
  return (
    <button
      onClick={() => set(page)}
      className="focus-ring flex flex-col items-center gap-1 py-2 transition-colors"
      style={{ color: active ? 'var(--accent-color)' : 'var(--faint)' }}
    >
      <Icon />
      <span style={{ fontSize: '0.62rem', fontWeight: 500 }}>{label}</span>
    </button>
  );
}

export const Nav: React.FC<NavProps> = () => null;
