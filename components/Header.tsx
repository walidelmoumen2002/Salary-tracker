import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { supabase } from '../lib/supabase';
import { Nav } from './Nav';

interface HeaderProps {
  salary: number;
  setSalary: (salary: number) => void;
  currentPage: 'dashboard' | 'fixedExpenses';
  setCurrentPage: (page: 'dashboard' | 'fixedExpenses') => void;
}

export const Header: React.FC<HeaderProps> = ({ salary, setSalary, currentPage, setCurrentPage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSalary, setNewSalary] = useState(salary.toString());

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

  return (
    <header className="bg-card border-b sticky top-0 z-40">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold tracking-tight">Salary Tracker</h1>
          <Nav currentPage={currentPage} setCurrentPage={setCurrentPage} />
        </div>
        <div className="flex items-center space-x-2">
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
      </div>
    </header>
  );
};
