export const DEFAULT_CATEGORIES = [
  "Food",
  "Transport",
  "Utilities",
  "Housing",
  "Entertainment",
  "Health",
  "Shopping",
  "Education",
  "Other",
] as const;

export type Category = string;

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string; // ISO string format: YYYY-MM-DD
  user_id?: string;
}

export interface FixedExpense {
  id: string;
  task: string;
  amount: number;
  is_completed: boolean;
  user_id?: string;
}