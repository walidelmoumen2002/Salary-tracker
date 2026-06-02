import React, { useState, useEffect, useRef } from 'react';
import { Expense, Category, DEFAULT_CATEGORIES } from '../types';

const CloseIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M18 6 6 18M6 6l12 12"/>
  </svg>
);

const TrashIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6"/>
  </svg>
);

const PlusIcon = (p: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" {...p}>
    <path d="M12 5v14M5 12h14"/>
  </svg>
);

interface AddExpenseProps {
  isOpen: boolean;
  onClose: () => void;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  categories: Category[];
  addCategory: (category: Category) => void;
  deleteCategory: (category: Category) => void;
}

function isCustomCategory(cat: Category): boolean {
  return !DEFAULT_CATEGORIES.includes(cat as any);
}

export const AddExpense: React.FC<AddExpenseProps> = ({
  isOpen, onClose, addExpense, categories, addCategory, deleteCategory,
}) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState('');
  const [addingCat, setAddingCat] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [managingCats, setManagingCats] = useState(false);
  const amtRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setAmount('');
      setDescription('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
      setAddingCat(false);
      setNewCatName('');
      setManagingCats(false);
      setTimeout(() => amtRef.current?.focus(), 120);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const valid = parseFloat(amount) > 0 && description.trim().length > 0 && category !== '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!description || !num || !category || !date) { setError('Please fill in all fields.'); return; }
    if (isNaN(num) || num <= 0) { setError('Please enter a valid positive amount.'); return; }
    addExpense({ description: description.trim(), amount: Math.round(num * 100) / 100, category, date });
    onClose();
  };

  const handleAddCat = () => {
    const name = newCatName.trim();
    if (name && !categories.includes(name)) { addCategory(name); setCategory(name); }
    setAddingCat(false);
    setNewCatName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex sm:justify-end" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 overlay-in"
        style={{ background: 'color-mix(in oklab, var(--ink) 30%, transparent)', backdropFilter: 'blur(2px)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="relative bg-surface w-full sm:w-[420px] sm:h-full sm:border-l border-t sm:border-t-0 mt-auto sm:mt-0 slide-up sm:slide-right overflow-y-auto"
        style={{ maxHeight: '92vh', borderColor: 'var(--line)', ...(typeof window !== 'undefined' && window.innerWidth >= 640 ? { maxHeight: 'none' } : {}) }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 border-b sticky top-0 bg-surface z-10"
          style={{ height: '68px', borderColor: 'var(--line)' }}
        >
          <div>
            <p className="eyebrow">New entry</p>
            <p className="text-base font-bold mt-0.5 text-ink">Add expense</p>
          </div>
          <button
            onClick={onClose}
            className="focus-ring h-9 w-9 border flex items-center justify-center text-muted-foreground hover:text-ink hover:bg-paper transition-colors"
            style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
          >
            <CloseIcon />
          </button>
        </div>

        <form onSubmit={submit} className="p-6 space-y-6">
          {/* Amount */}
          <div>
            <label className="eyebrow block mb-2.5">Amount</label>
            <div
              className="flex items-center border bg-paper"
              style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
            >
              <span className="pl-4 pr-1 text-2xl font-bold text-muted-foreground">$</span>
              <input
                ref={amtRef}
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
                placeholder="0.00"
                className="num w-full bg-transparent py-4 pr-4 text-3xl font-bold text-ink placeholder:text-muted-foreground focus:outline-none"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="eyebrow block mb-2.5">Description</label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="e.g. Groceries at the market"
              className="focus-ring w-full h-11 px-3.5 bg-paper border text-sm text-ink placeholder:text-muted-foreground"
              style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
            />
          </div>

          {/* Category grid */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="eyebrow">Category</label>
              {categories.some(isCustomCategory) && (
                <button
                  type="button"
                  onClick={() => setManagingCats(v => !v)}
                  className="font-mono text-[0.68rem] underline-offset-2 hover:underline"
                  style={{ color: 'var(--accent-color)' }}
                >
                  {managingCats ? 'Done' : 'Manage'}
                </button>
              )}
            </div>

            {managingCats ? (
              <div className="border p-3 space-y-1" style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}>
                {categories.filter(isCustomCategory).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-2">No custom categories</p>
                ) : (
                  categories.filter(isCustomCategory).map(cat => (
                    <div key={cat} className="flex items-center justify-between py-1.5 px-2 hover:bg-paper" style={{ borderRadius: 'var(--radius)' }}>
                      <span className="text-sm text-ink">{cat}</span>
                      <button
                        type="button"
                        onClick={() => { deleteCategory(cat); if (category === cat) setCategory(''); }}
                        className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {categories.map(cat => {
                  const active = category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className="flex items-center justify-center py-2.5 px-2 border text-[0.75rem] font-medium transition-colors"
                      style={{
                        borderRadius: 'var(--radius)',
                        borderColor: active ? 'var(--accent-color)' : 'var(--line)',
                        background: active ? 'var(--accent-soft)' : undefined,
                        color: active ? 'var(--ink)' : undefined,
                      }}
                    >
                      {cat}
                    </button>
                  );
                })}

                {/* Add new category button */}
                {addingCat ? (
                  <div className="col-span-3 flex gap-2 mt-1">
                    <input
                      type="text"
                      value={newCatName}
                      onChange={e => setNewCatName(e.target.value)}
                      placeholder="Category name"
                      className="flex-1 h-9 px-3 text-sm border bg-paper text-ink"
                      style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
                      autoFocus
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddCat(); } }}
                    />
                    <button
                      type="button"
                      onClick={handleAddCat}
                      className="h-9 px-3 text-sm font-semibold text-white"
                      style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => { setAddingCat(false); setNewCatName(''); }}
                      className="h-9 px-3 text-sm font-medium text-muted-foreground border"
                      style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAddingCat(true)}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-2 border text-[0.75rem] font-medium text-muted-foreground hover:text-ink transition-colors"
                    style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
                  >
                    <PlusIcon /> New
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="eyebrow block mb-2.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="focus-ring num w-full h-11 px-3.5 bg-paper border text-sm text-ink"
              style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
            />
          </div>

          {error && <p className="text-sm" style={{ color: 'var(--warn-color)' }}>{error}</p>}

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="focus-ring h-11 px-4 border text-sm font-semibold text-muted-foreground hover:text-ink hover:bg-paper transition-colors"
              style={{ borderColor: 'var(--line)', borderRadius: 'var(--radius)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!valid}
              className="focus-ring flex-1 h-11 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'var(--accent-color)', borderRadius: 'var(--radius)' }}
            >
              Save expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
