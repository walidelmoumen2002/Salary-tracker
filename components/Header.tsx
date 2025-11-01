import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../lib/supabase';
import { Nav } from './Nav';
import { cn } from '../lib/utils';

interface HeaderProps {
  salary: number;
  setSalary: (salary: number) => void;
  currentPage: 'dashboard' | 'fixedExpenses';
  setCurrentPage: (page: 'dashboard' | 'fixedExpenses') => void;
}

const MenuIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);


export const Header: React.FC<HeaderProps> = ({ salary, setSalary, currentPage, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState(salary.toString());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
  
  const mobileNavItemClasses = (page: 'dashboard' | 'fixedExpenses') => cn(
    "cursor-pointer text-lg font-medium transition-colors w-full p-3 rounded-md",
    currentPage === page
      ? "bg-primary text-primary-foreground"
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  return (
    <>
      <header className="bg-card border-b sticky top-0 z-40">
        <div className="container mx-auto p-4 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <h1 className="text-2xl font-bold tracking-tight">Salary Tracker</h1>
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
                  <span className="text-lg font-medium text-muted-foreground hidden sm:inline">Salary: {formatCurrency(salary)}</span>
                  <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                </>
              )
            )}
            <Button onClick={handleSignOut} variant="ghost" size="sm">Sign Out</Button>
            <ThemeToggle />
          </div>
          <div className="md:hidden">
              <Button onClick={() => setIsMenuOpen(true)} variant="ghost" size="icon">
                  <MenuIcon className="h-6 w-6" />
              </Button>
          </div>
        </div>
      </header>
      
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background md:hidden"
             onClick={() => setIsMenuOpen(false)}>
            <div className="absolute top-0 right-0 bottom-0 h-full w-full max-w-sm bg-card border-l p-4 flex flex-col"
                 onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold">Menu</h2>
                    <Button onClick={() => setIsMenuOpen(false)} variant="ghost" size="icon">
                        <XIcon className="h-6 w-6" />
                    </Button>
                </div>

                <nav className="flex flex-col space-y-2 mb-8">
                    <a onClick={() => { setCurrentPage('dashboard'); setIsMenuOpen(false); }} className={mobileNavItemClasses('dashboard')}>
                        Dashboard
                    </a>
                    <a onClick={() => { setCurrentPage('fixedExpenses'); setIsMenuOpen(false); }} className={mobileNavItemClasses('fixedExpenses')}>
                        Fixed Expenses
                    </a>
                </nav>

                <div className="mt-auto space-y-6 border-t pt-6">
                    {currentPage === 'dashboard' && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-medium text-muted-foreground px-1">Salary</h3>
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
                                <div className="flex items-center justify-between p-2 rounded-md border">
                                    <span className="font-medium">{formatCurrency(salary)}</span>
                                    <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    <div className="flex items-center justify-between px-1">
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
