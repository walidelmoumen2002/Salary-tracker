
export const CATEGORIES = [
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

export type Category = typeof CATEGORIES[number];

export interface Expense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  date: string; // ISO string format: YYYY-MM-DD
}
