
import React, { useState, useMemo, useEffect } from 'react';
import { FixedExpense } from '../types';
import { supabase } from '../lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { formatCurrency, getErrorMessage, currentMonthKey, formatMonthLabel } from '../lib/utils';
import type { User } from '@supabase/supabase-js';

const TrashIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
    </svg>
);

const PencilIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
    </svg>
);

const CheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M20 6 9 17l-5-5"/>
    </svg>
);

const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
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
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editTask, setEditTask] = useState('');
    const [editAmount, setEditAmount] = useState('');

    useEffect(() => {
        setFixedExpenses(initialFixedExpenses);
    }, [initialFixedExpenses]);

    // Bills are paid again every month, so every "paid" tick is cleared the
    // first time the app is opened in a new month. The month we last cleared
    // for is remembered per user.
    useEffect(() => {
        if (!user || fixedExpenses.length === 0) return;

        const storageKey = `fixed-expenses-cleared-month:${user.id}`;
        const thisMonth = currentMonthKey();

        let clearedMonth: string | null = null;
        try { clearedMonth = window.localStorage.getItem(storageKey); } catch { /* storage unavailable */ }
        if (clearedMonth === thisMonth) return;

        const stamp = () => {
            try { window.localStorage.setItem(storageKey, thisMonth); } catch { /* storage unavailable */ }
        };

        // First run on this device: adopt the current month without touching data.
        const completedIds = fixedExpenses.filter(e => e.is_completed).map(e => e.id);
        if (!clearedMonth || completedIds.length === 0) {
            stamp();
            return;
        }

        (async () => {
            try {
                const { error } = await supabase
                    .from('fixed_expenses')
                    .update({ is_completed: false })
                    .eq('user_id', user.id)
                    .in('id', completedIds);

                if (error) throw error;
                setFixedExpenses(prev => prev.map(task => ({ ...task, is_completed: false })));
                stamp();
            } catch (err) {
                handleError(err);
            }
        })();
    }, [user, fixedExpenses]);

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

    const resetAllTasks = async () => {
        if (!user || fixedExpenses.length === 0) return;

        const completedIds = fixedExpenses.filter(e => e.is_completed).map(e => e.id);
        if (completedIds.length === 0) return;

        setError(null);
        try {
            const { error } = await supabase
                .from('fixed_expenses')
                .update({ is_completed: false })
                .eq('user_id', user.id)
                .in('id', completedIds);

            if (error) throw error;
            setFixedExpenses(prev => prev.map(task => ({ ...task, is_completed: false })));
        } catch (err) {
            handleError(err);
        }
    };

    const hasCompletedTasks = fixedExpenses.some(e => e.is_completed);

    const startEditing = (task: FixedExpense) => {
        setEditingId(task.id);
        setEditTask(task.task);
        setEditAmount(task.amount.toString());
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditTask('');
        setEditAmount('');
    };

    const saveEdit = async () => {
        if (!editingId || !editTask.trim()) return;
        const amountValue = parseFloat(editAmount);
        if (isNaN(amountValue) || amountValue <= 0) return;

        setError(null);
        try {
            const { error } = await supabase
                .from('fixed_expenses')
                .update({ task: editTask.trim(), amount: amountValue })
                .match({ id: editingId });

            if (error) throw error;
            setFixedExpenses(prev => prev.map(t =>
                t.id === editingId ? { ...t, task: editTask.trim(), amount: amountValue } : t
            ));
            cancelEditing();
        } catch (err) {
            handleError(err);
        }
    };

    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                    <div>
                        <CardTitle className="text-lg sm:text-xl">Fixed Monthly Expenses</CardTitle>
                        <p className="text-muted-foreground text-xs sm:text-sm pt-1">
                            Track your recurring bills and subscriptions. Paid ticks clear automatically each new month
                            (currently {formatMonthLabel(currentMonthKey())}).
                        </p>
                    </div>
                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 sm:gap-0 bg-muted/50 sm:bg-transparent p-3 sm:p-0 rounded-lg sm:rounded-none">
                        <div className="sm:text-right">
                            <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total</p>
                            <p className="text-lg sm:text-lg font-bold">{formatCurrency(totalAmount)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-green-500">{formatCurrency(paidAmount)} paid</p>
                            {hasCompletedTasks && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={resetAllTasks}
                                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                >
                                    Reset
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                    <Input
                        placeholder="e.g., Rent, Netflix"
                        value={newTask}
                        onChange={(e) => setNewTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTask()}
                        className="flex-grow"
                    />
                    <div className="flex gap-2">
                        <Input
                            type="number"
                            placeholder="Amount"
                            value={newAmount}
                            onChange={(e) => setNewAmount(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addTask()}
                            className="flex-1 sm:w-32"
                            step="0.01"
                        />
                        <Button onClick={addTask} className="shrink-0">Add</Button>
                    </div>
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
                            <li key={task.id} className="p-4 hover:bg-secondary/50">
                                {editingId === task.id ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editTask}
                                            onChange={(e) => setEditTask(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                            className="flex-grow"
                                            autoFocus
                                        />
                                        <Input
                                            type="number"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && saveEdit()}
                                            className="w-28"
                                            step="0.01"
                                        />
                                        <Button variant="ghost" size="icon" onClick={saveEdit} className="h-8 w-8">
                                            <CheckIcon className="h-4 w-4 text-green-600" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={cancelEditing} className="h-8 w-8">
                                            <XIcon className="h-4 w-4 text-muted-foreground" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-between">
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
                                        <div className="flex items-center gap-2">
                                            <span className={`font-semibold ${task.is_completed ? 'text-muted-foreground line-through' : ''}`}>
                                                {formatCurrency(task.amount)}
                                            </span>
                                            <Button variant="ghost" size="icon" onClick={() => startEditing(task)} className="h-8 w-8">
                                                <PencilIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)} className="h-8 w-8">
                                                <TrashIcon className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </CardContent>
        </Card>
    );
};
