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

// Debt Management Types
export interface Debt {
  id: string;
  name: string;
  total_amount: number;
  current_balance: number;
  due_date: number; // Day of month (1-31)
  category: DebtCategory;
  user_id?: string;
  created_at?: string;
}

export type DebtCategory = 'credit_card' | 'personal_loan' | 'car_loan' | 'mortgage' | 'student_loan' | 'other';

export const DEBT_CATEGORIES: { value: DebtCategory; label: string }[] = [
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'car_loan', label: 'Car Loan' },
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'other', label: 'Other' },
];

export interface DebtPayment {
  id: string;
  debt_id: string;
  amount: number;
  date: string;
  user_id?: string;
}

// Savings Goals Types
export interface SavingsGoal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date?: string;
  icon: SavingsIcon;
  color: string;
  user_id?: string;
  created_at?: string;
}

export type SavingsIcon = 'emergency' | 'vacation' | 'car' | 'house' | 'education' | 'retirement' | 'wedding' | 'other';

export const SAVINGS_ICONS: { value: SavingsIcon; label: string }[] = [
  { value: 'emergency', label: 'Emergency Fund' },
  { value: 'vacation', label: 'Vacation' },
  { value: 'car', label: 'Car' },
  { value: 'house', label: 'House' },
  { value: 'education', label: 'Education' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'other', label: 'Other' },
];

export const SAVINGS_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
];

// Income Types (for multi-income support)
export interface Income {
  id: string;
  name: string;
  amount: number;
  type: IncomeType;
  is_recurring: boolean;
  pay_date?: number; // Day of month
  user_id?: string;
}

export type IncomeType = 'salary' | 'freelance' | 'investment' | 'rental' | 'bonus' | 'other';

export const INCOME_TYPES: { value: IncomeType; label: string }[] = [
  { value: 'salary', label: 'Salary' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'investment', label: 'Investment' },
  { value: 'rental', label: 'Rental Income' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'other', label: 'Other' },
];

// Category Budget Types
export interface CategoryBudget {
  id: string;
  category: string;
  budget_amount: number;
  user_id: string;
}

// Recurring Expense Types
export interface RecurringExpense {
  id: string;
  description: string;
  amount: number;
  category: Category;
  frequency: RecurringFrequency;
  next_date: string;
  is_active: boolean;
  user_id?: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export const RECURRING_FREQUENCIES: { value: RecurringFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];