import React, { useState, useMemo, useEffect } from 'react';
import { FixedExpense } from '../types';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency } from '../lib/utils';

const Trash2: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);

interface FixedExpensesProps {
    initialFixedExpenses: FixedExpense[];
}

export const FixedExpenses: React.FC<FixedExpensesProps> = ({ initialFixedExpenses }) => {
    const { user } = useAuth();
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(initialFixedExpenses);
    const [newTask, setNewTask] = useState('');
    const [newAmount, setNewAmount] = useState('');

    useEffect(() => {
        setFixedExpenses(initialFixedExpenses);
    }, [initialFixedExpenses]);

    const { totalAmount, paidAmount } = useMemo(() => {
        const total = fixedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const paid = fixedExpenses.filter(e => e.is_completed).reduce((sum, exp) => sum + (exp.amount || 0), 0);
        return { totalAmount: total, paidAmount: paid };
    }, [fixedExpenses]);

    const addTask = async () => {
        const amountValue = parseFloat(newAmount);
        if (!newTask.trim() || !user || isNaN(amountValue) || amountValue <= 0) return;

        const { data, error } = await supabase
            .from('fixed_expenses')
            .insert({ task: newTask.trim(), amount: amountValue, user_id: user.id, is_completed: false })
            .select()
            .single();
        
        if (data) {
            setFixedExpenses(prev => [...prev, {...data, id: data.id.toString()}]);
            setNewTask('');
            setNewAmount('');
        }
        if (error) console.error("Error adding task:", error);
    };

    const toggleTask = async (id: string, is_completed: boolean) => {
        const { error } = await supabase
            .from('fixed_expenses')
            .update({ is_completed: !is_completed })
            .match({ id });
        
        if (!error) {
            setFixedExpenses(prev => prev.map(task => 
                task.id === id ? { ...task, is_completed: !is_completed } : task
            ));
        }
    };

    const deleteTask = async (id: string) => {
        const { error } = await supabase
            .from('fixed_expenses')
            .delete()
            .match({ id });
        
        if (!error) {
            setFixedExpenses(prev => prev.filter(task => task.id !== id));
        }
    };
    
    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle>Fixed Monthly Expenses</CardTitle>
                        <p className="text-muted-foreground text-sm pt-1">Track your recurring bills and subscriptions.</p>
                    </div>
                    <div className="text-right">
                         <p className="text-sm font-medium text-muted-foreground">Total</p>
                         <p className="text-lg font-bold">{formatCurrency(totalAmount)}</p>
                         <p className="text-xs text-green-500">{formatCurrency(paidAmount)} paid</p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-6">
                    <Input 
                        placeholder="e.g., Rent, Netflix"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="flex-grow"
                    />
                    <Input
                        type="number"
                        placeholder="Amount"
                        value={newAmount}
                        onChange={(e) => setNewAmount(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="w-32"
                        step="0.01"
                    />
                    <Button onClick={addTask}>Add</Button>
                </div>

                {fixedExpenses.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg">
                        <h3 className="text-lg font-semibold">No fixed expenses added yet.</h3>
                        <p className="text-muted-foreground">Add items like rent, utilities, or subscriptions.</p>
                    </div>
                ) : (
                    <ul className="border rounded-lg divide-y">
                        {fixedExpenses.map(task => (
                            <li key={task.id} className="p-4 flex items-center justify-between hover:bg-secondary/50">
                                <div className="flex items-center gap-4">
                                    <input 
                                        type="checkbox"
                                        checked={task.is_completed}
                                        onChange={() => toggleTask(task.id, task.is_completed)}
                                        className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <span className={task.is_completed ? 'line-through text-muted-foreground' : ''}>
                                        {task.task}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                     <span className={`font-semibold ${task.is_completed ? 'text-muted-foreground line-through' : ''}`}>
                                        {formatCurrency(task.amount)}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}>
                                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};