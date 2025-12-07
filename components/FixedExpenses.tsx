
import React, { useState, useMemo, useEffect } from 'react';
import { FixedExpense } from '../types';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency, getErrorMessage } from '../lib/utils';
import type { User } from '@supabase/supabase-js';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        {...props}
    >
        <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.02.166m-1.02-.165L18.16 19.673A2.25 2.25 0 0 1 15.916 21.75H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.338-.059.678-.114 1.02-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

interface FixedExpensesProps {
    initialFixedExpenses: FixedExpense[];
    user: User | null;
}

export const FixedExpenses: React.FC<FixedExpensesProps> = ({ initialFixedExpenses, user }) => {
    const [fixedExpenses, setFixedExpenses] = useState<FixedExpense[]>(initialFixedExpenses);
    const [newTask, setNewTask] = useState('');
    const [newAmount, setNewAmount] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFixedExpenses(initialFixedExpenses);
    }, [initialFixedExpenses]);

    const { totalAmount, paidAmount } = useMemo(() => {
        const total = fixedExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
        const paid = fixedExpenses.filter(e => e.is_completed).reduce((sum, exp) => sum + (exp.amount || 0), 0);
        return { totalAmount: total, paidAmount: paid };
    }, [fixedExpenses]);

    const handleError = (err: any) => {
        console.error(err);
        setError(getErrorMessage(err));
        setTimeout(() => setError(null), 5000);
    };

    const addTask = async () => {
        const amountValue = parseFloat(newAmount);
        if (!newTask.trim() || !user || isNaN(amountValue) || amountValue <= 0) return;

        setError(null);
        try {
            const { data, error } = await supabase
                .from('fixed_expenses')
                .insert({ task: newTask.trim(), amount: amountValue, user_id: user.id, is_completed: false })
                .select()
                .single();

            if (error) throw error;
            if (data) {
                setFixedExpenses(prev => [...prev, { ...data, id: data.id.toString() }]);
                setNewTask('');
                setNewAmount('');
            }
        } catch (err) {
            handleError(err);
        }
    };

    const toggleTask = async (id: string, is_completed: boolean) => {
        setError(null);
        try {
            const { error } = await supabase
                .from('fixed_expenses')
                .update({ is_completed: !is_completed })
                .match({ id });

            if (error) throw error;
            setFixedExpenses(prev => prev.map(task =>
                task.id === id ? { ...task, is_completed: !is_completed } : task
            ));
        } catch (err) {
            handleError(err);
        }
    };

    const deleteTask = async (id: string) => {
        setError(null);
        try {
            const { error } = await supabase
                .from('fixed_expenses')
                .delete()
                .match({ id });

            if (error) throw error;
            setFixedExpenses(prev => prev.filter(task => task.id !== id));
        } catch (err) {
            handleError(err);
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
                <div className="flex gap-2 mb-2">
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

                {error && <p className="text-sm text-red-500 mb-4">{error}</p>}

                {fixedExpenses.length === 0 ? (
                    <div className="text-center py-10 border rounded-lg mt-4">
                        <h3 className="text-lg font-semibold">No fixed expenses added yet.</h3>
                        <p className="text-muted-foreground">Add items like rent, utilities, or subscriptions.</p>
                    </div>
                ) : (
                    <ul className="border rounded-lg divide-y mt-4">
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
                                        <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
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
