import React, { useState } from 'react';
import { Page } from './Nav';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface HeaderProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onAdd?: () => void;
  user?: User | null;
  salary?: number;
  setSalary?: (s: number) => void;
}

const MenuIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={22} height={22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 6h18M3 12h18M3 18h18"/>
  </svg>
);

const BellIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>
  </svg>
);

const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

const XIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const WalletIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/><path d="M16 12h.01"/>
  </svg>
);

const navItems = [
  { page: 'dashboard'     as Page, label: 'Dashboard'     },
  { page: 'expenses'      as Page, label: 'Expenses'       },
  { page: 'fixedExpenses' as Page, label: 'Fixed Expenses' },
  { page: 'budgets'       as Page, label: 'Budgets'        },
  { page: 'debts'         as Page, label: 'Debts'          },
  { page: 'savings'       as Page, label: 'Savings'        },
  { page: 'reports'       as Page, label: 'Reports'        },
];

const PAGE_META: Record<Page, { title: string; sub: string }> = {
  dashboard:     { title: 'Dashboard',      sub: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + ' overview' },
  expenses:      { title: 'Expenses',        sub: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) },
  fixedExpenses: { title: 'Fixed Expenses', sub: 'Recurring monthly' },
  budgets:       { title: 'Budgets',         sub: 'Category limits' },
  debts:         { title: 'Debts',           sub: 'Balances & payoff' },
  savings:       { title: 'Savings',         sub: 'Goals & progress' },
  reports:       { title: 'Reports',         sub: 'History & trends' },
};

function getInitials(user?: User | null): string {
  if (!user?.email) return 'ME';
  const name = user.email.split('@')[0];
  return name.substring(0, 2).toUpperCase();
}

export const Header: React.FC<HeaderProps> = ({ currentPage, setCurrentPage, onAdd, user, salary, setSalary }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState(false);
  const [salaryInput, setSalaryInput] = useState(String(salary ?? ''));

  const meta = PAGE_META[currentPage] || PAGE_META.dashboard;
  const initials = getInitials(user);

  const saveSalary = () => {
    const v = parseFloat(salaryInput);
    if (!isNaN(v) && v >= 0 && setSalary) setSalary(v);
    setEditingSalary(false);
  };

  return (
    <>
      <header
        className="sticky top-0 z-20 border-b"
        style={{ background: 'color-mix(in oklab, var(--paper) 85%, transparent)', backdropFilter: 'blur(8px)', borderColor: 'var(--line)' }}
      >
        <div className="flex items-center gap-4 px-5 md:px-9" style={{ height: '68px' }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden focus-ring text-ink -ml-1"
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>

          {/* Title */}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none truncate text-ink">{meta.title}</h1>
            <p className="eyebrow mt-1.5 hidden sm:block">{meta.sub}</p>
          </div>

          {/* Bell */}
          <button
            className="focus-ring relative h-9 w-9 border flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-paper transition-colors"
            style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
            aria-label="Notifications"
          >
            <BellIcon />
            <span className="absolute top-2 right-2 h-1.5 w-1.5" style={{ background: 'var(--accent-color)', borderRadius: '99px' }} />
          </button>

          {/* Add expense button — desktop only */}
          {onAdd && (
            <button
              onClick={onAdd}
              className="focus-ring hidden md:inline-flex items-center gap-2 h-9 pl-3 pr-4 text-sm font-semibold text-white transition-transform active:scale-[0.97]"
              style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
            >
              <PlusIcon /> Add expense
            </button>
          )}

          {/* User avatar */}
          <div
            className="h-9 w-9 flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
            style={{ background: 'var(--ink)', borderRadius: 'var(--radius)', fontSize: '0.78rem' }}
          >
            {initials}
          </div>
        </div>
      </header>

      {/* Mobile slide-in menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 overlay-in"
            style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(2px)' }}
            onClick={() => setMenuOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-[260px] slide-right flex flex-col"
            style={{ background: 'var(--surface)', borderRight: '1px solid var(--line)' }}
          >
            {/* Menu header */}
            <div className="h-[60px] flex items-center justify-between px-4 border-b" style={{ borderColor: 'var(--line)' }}>
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 flex items-center justify-center text-white" style={{ background: 'var(--accent-color)' }}>
                  <WalletIcon />
                </div>
                <p className="font-bold text-ink tracking-tight">Ledger</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="focus-ring text-muted-foreground hover:text-ink">
                <XIcon />
              </button>
            </div>

            {/* Nav items */}
            <nav className="flex-1 p-3 overflow-y-auto">
              {navItems.map(({ page, label }) => {
                const active = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium transition-colors text-left"
                    style={{
                      borderRadius: 'var(--radius)',
                      color: active ? 'var(--ink)' : undefined,
                      background: active ? 'var(--accent-soft)' : undefined,
                    }}
                  >
                    <span className={active ? '' : 'text-muted-foreground'}>{label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Salary edit + sign out */}
            <div className="p-4 border-t space-y-3" style={{ borderColor: 'var(--line)' }}>
              {setSalary && (
                <div>
                  <p className="eyebrow mb-2">Monthly salary</p>
                  {editingSalary ? (
                    <div className="flex gap-2">
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
                        className="h-9 px-4 text-sm font-semibold text-white"
                        style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSalaryInput(String(salary ?? '')); setEditingSalary(true); }}
                      className="w-full flex items-center justify-between px-3 py-2.5 border text-sm"
                      style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)', background: 'var(--paper)' }}
                    >
                      <span className="num font-semibold text-ink">{salary?.toLocaleString('en-US', { style: 'currency', currency: 'MAD', maximumFractionDigits: 0 })}</span>
                      <span className="text-xs text-muted-foreground">Edit</span>
                    </button>
                  )}
                </div>
              )}
              <button
                onClick={() => supabase.auth.signOut()}
                className="w-full h-9 text-sm font-medium border text-muted-foreground transition-colors"
                style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
