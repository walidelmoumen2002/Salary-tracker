import React from 'react';
import { Page } from './Nav';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const WalletIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 7V5a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h14a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V6"/>
    <path d="M16 12h.01"/>
  </svg>
);

const DashboardIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="3" width="7" height="9" rx="0.5"/><rect x="14" y="3" width="7" height="5" rx="0.5"/>
    <rect x="14" y="12" width="7" height="9" rx="0.5"/><rect x="3" y="16" width="7" height="5" rx="0.5"/>
  </svg>
);

const CalendarIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="3" y="4" width="18" height="17" rx="0.5"/><path d="M16 2v4M8 2v4M3 9h18"/>
  </svg>
);

const PieIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 3v9l7.5 4.3A9 9 0 1 0 12 3z"/><path d="M12 3a9 9 0 0 1 7.5 13.3"/>
  </svg>
);

const CardIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <rect x="2" y="5" width="20" height="14" rx="0.5"/><path d="M2 10h20"/>
  </svg>
);

const PiggyIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M19 5c-1.5 0-2.8 1.4-3 2-3.5-1.5-11-.3-11 5 0 1.8 0 3 2 4.5V20h4v-2h3v2h4v-4c1-.5 1.7-1 2-2h2v-4h-2c0-1-.5-1.5-1-2V5z"/>
    <path d="M2 9v1c0 1.1.9 2 2 2h1"/><path d="M16 11h.01"/>
  </svg>
);

const BarsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M6 20V10M12 20V4M18 20v-6"/>
  </svg>
);

const SettingsIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1v.2a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 9 19.4a1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 4.6 15a1.6 1.6 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.6 9a1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1h.2a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.4 1z"/>
  </svg>
);

const LogoutIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
  </svg>
);

const NAV = [
  { page: 'dashboard'     as Page, label: 'Dashboard',      Icon: DashboardIcon },
  { page: 'expenses'      as Page, label: 'Expenses',        Icon: WalletIcon    },
  { page: 'fixedExpenses' as Page, label: 'Fixed',           Icon: CalendarIcon  },
  { page: 'budgets'       as Page, label: 'Budgets',         Icon: PieIcon       },
  { page: 'debts'         as Page, label: 'Debts',           Icon: CardIcon      },
  { page: 'savings'       as Page, label: 'Savings',         Icon: PiggyIcon     },
  { page: 'reports'       as Page, label: 'Reports',         Icon: BarsIcon      },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, setCurrentPage }) => {
  return (
    <aside className="hidden md:flex flex-col w-[244px] flex-shrink-0 h-screen sticky top-0 border-r bg-surface" style={{ borderColor: 'var(--line)' }}>
      {/* Brand */}
      <div className="h-[68px] flex items-center gap-3 px-6 border-b" style={{ borderColor: 'var(--line)' }}>
        <div className="h-8 w-8 flex items-center justify-center text-white" style={{ background: 'var(--accent-color)' }}>
          <WalletIcon />
        </div>
        <div className="leading-none">
          <p className="font-bold text-ink" style={{ fontSize: '0.95rem', letterSpacing: '-0.01em' }}>Ledger</p>
          <p className="eyebrow mt-0.5" style={{ fontSize: '0.6rem' }}>Salary Tracker</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        <p className="eyebrow px-3 pb-2">Overview</p>
        {NAV.map(({ page, label, Icon }) => {
          const active = currentPage === page;
          return (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className="focus-ring w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors"
              style={{
                borderRadius: 'var(--radius)',
                color: active ? 'var(--ink)' : undefined,
                background: active ? 'var(--accent-soft)' : undefined,
              }}
              onMouseEnter={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = 'var(--paper)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}}
              onMouseLeave={e => { if (!active) { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = ''; }}}
            >
              <span style={{ color: active ? 'var(--accent-color)' : 'var(--faint)' }}>
                <Icon />
              </span>
              <span className={active ? 'text-ink' : 'text-muted-foreground'}>{label}</span>
              {active && (
                <span className="ml-auto h-1.5 w-1.5" style={{ background: 'var(--accent-color)', borderRadius: '99px' }} />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t space-y-0.5" style={{ borderColor: 'var(--line)' }}>
        <button
          className="focus-ring w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--paper)'; (e.currentTarget as HTMLElement).style.color = 'var(--ink)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ''; (e.currentTarget as HTMLElement).style.color = ''; }}
        >
          <SettingsIcon /><span>Settings</span>
        </button>
        <button
          onClick={() => supabase.auth.signOut()}
          className="focus-ring w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors"
          style={{ borderRadius: 'var(--radius)' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--warn-color)'; (e.currentTarget as HTMLElement).style.background = 'var(--warn-soft)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = ''; (e.currentTarget as HTMLElement).style.background = ''; }}
        >
          <LogoutIcon /><span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
