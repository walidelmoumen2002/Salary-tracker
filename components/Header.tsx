
import React, { useState } from 'react';
import { formatCurrency } from '../lib/utils';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';

interface HeaderProps {
  salary: number;
  setSalary: (salary: number) => void;
}

export const Header: React.FC<HeaderProps> = ({ salary, setSalary }) => {
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

  return (
    <header className="bg-card border-b">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Salary Tracker</h1>
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
            <>
              <span className="text-lg font-medium text-muted-foreground">Salary: {formatCurrency(salary)}</span>
              <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">Edit</Button>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};