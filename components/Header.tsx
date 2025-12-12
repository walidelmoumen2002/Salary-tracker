import React, { useEffect, useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../lib/supabase';
import { Nav, Page } from './Nav';
import { cn } from '../lib/utils';

interface HeaderProps {
  salary: number;
  setSalary: (salary: number) => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  onMenuOpenChange?: (open: boolean) => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

// Navigation Icons for Mobile Menu
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

const navItems: { page: Page; label: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
  { page: 'dashboard', label: 'Dashboard', icon: DashboardIcon },
  { page: 'fixedExpenses', label: 'Fixed Expenses', icon: ReceiptIcon },
  { page: 'debts', label: 'Debts', icon: CreditCardIcon },
  { page: 'savings', label: 'Savings', icon: TargetIcon },
];

export const Header: React.FC<HeaderProps> = ({ salary, setSalary, currentPage, setCurrentPage, onMenuOpenChange }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState(salary.toString());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuClosing, setIsMenuClosing] = useState(false);

  const setMenuOpen = (open: boolean) => {
    if (open) {
      setIsMenuOpen(true);
      setIsMenuClosing(false);
      onMenuOpenChange?.(true);
    } else {
      setIsMenuClosing(true);
      setTimeout(() => {
        setIsMenuOpen(false);
        setIsMenuClosing(false);
        onMenuOpenChange?.(false);
      }, 300);
    }
  };

  // Prevent background scroll when mobile menu is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = originalOverflow || '';
    }
    return () => {
      document.body.style.overflow = originalOverflow || '';
    };
  }, [isMenuOpen]);

  const handleSave = () => {
    const salaryValue = parseFloat(newSalary);
    if (!isNaN(salaryValue) && salaryValue >= 0) {
      setSalary(salaryValue);
      setIsEditing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSave();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  }

  const mobileNavItemClasses = (page: Page) => cn(
    "cursor-pointer text-base font-medium transition-colors w-full p-3 rounded-lg flex items-center gap-3",
    currentPage === page
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  return (
    <>
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-4 md:gap-8">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">Salary Tracker</h1>
            <div className="hidden md:flex">
                <Nav currentPage={currentPage} setCurrentPage={setCurrentPage} />
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            {isEditing ? (
              <>
                <Input
                  type="number"
                  value={newSalary}
                  onChange={(e) => setNewSalary(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-32"
                  placeholder="Monthly Salary"
                />
                <Button onClick={handleSave} size="sm">Save</Button>
                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm">Cancel</Button>
              </>
            ) : (
               currentPage === 'dashboard' && (
                <>
                  <span className="text-sm font-medium text-muted-foreground hidden lg:inline">Salary: {formatCurrency(salary)}</span>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                </>
              )
            )}
            <Button onClick={handleSignOut} variant="ghost" size="sm">Sign Out</Button>
            <ThemeToggle />
          </div>
          <div className="md:hidden">
              <Button onClick={() => setMenuOpen(true)} variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
              </Button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm md:hidden overflow-hidden transition-opacity duration-300",
            isMenuClosing ? "opacity-0" : "opacity-100"
          )}
          onClick={() => setMenuOpen(false)}
        >
            <div
              className={cn(
                "absolute top-0 right-0 bottom-0 h-full w-full max-w-sm bg-card border-l p-4 flex flex-col overflow-y-auto transition-transform duration-300",
                isMenuClosing ? "translate-x-full" : "translate-x-0"
              )}
              onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <Button onClick={() => setMenuOpen(false)} variant="ghost" size="icon">
                        <XIcon className="h-6 w-6" />
                    </Button>
                </div>

                <nav className="flex flex-col space-y-1 mb-6">
                    {navItems.map(({ page, label, icon: Icon }) => (
                      <a
                        key={page}
                        onClick={() => { setCurrentPage(page); setMenuOpen(false); }}
                        className={mobileNavItemClasses(page)}
                      >
                        <Icon className="h-5 w-5" />
                        {label}
                      </a>
                    ))}
                </nav>

                <div className="mt-auto space-y-4 border-t pt-4 pb-20">
                    {currentPage === 'dashboard' && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground px-1">Monthly Salary</h3>
                            {isEditing ? (
                                <div className='space-y-2'>
                                  <Input
                                    type="number"
                                    value={newSalary}
                                    onChange={(e) => setNewSalary(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Monthly Salary"
                                  />
                                  <div className='flex gap-2'>
                                      <Button onClick={handleSave} size="sm" className="flex-1">Save</Button>
                                      <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm" className="flex-1">Cancel</Button>
                                  </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                                    <span className="font-semibold">{formatCurrency(salary)}</span>
                                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                        <span className="text-sm font-medium">Theme</span>
                        <ThemeToggle />
                    </div>

                    <Button onClick={handleSignOut} variant="outline" className="w-full">Sign Out</Button>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
