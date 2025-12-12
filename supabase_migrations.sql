-- Salary Tracker Database Migrations
-- Run this SQL in your Supabase SQL Editor to add support for Debts and Savings Goals
-- This version is safe to re-run (uses DROP IF EXISTS for policies)

-- ============================================
-- DEBTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS debts (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_balance DECIMAL(12,2) NOT NULL DEFAULT 0,
    due_date INTEGER DEFAULT 1 CHECK (due_date >= 1 AND due_date <= 31),
    category TEXT DEFAULT 'other' CHECK (category IN ('credit_card', 'personal_loan', 'car_loan', 'mortgage', 'student_loan', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop minimum_payment column if it exists (migration cleanup)
ALTER TABLE debts DROP COLUMN IF EXISTS minimum_payment;

-- Enable Row Level Security
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create
DROP POLICY IF EXISTS "Users can view their own debts" ON debts;
DROP POLICY IF EXISTS "Users can insert their own debts" ON debts;
DROP POLICY IF EXISTS "Users can update their own debts" ON debts;
DROP POLICY IF EXISTS "Users can delete their own debts" ON debts;

CREATE POLICY "Users can view their own debts" ON debts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debts" ON debts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own debts" ON debts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debts" ON debts
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_debts_user_id ON debts(user_id);

-- ============================================
-- SAVINGS GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS savings_goals (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    target_date DATE,
    icon TEXT DEFAULT 'other' CHECK (icon IN ('emergency', 'vacation', 'car', 'house', 'education', 'retirement', 'wedding', 'other')),
    color TEXT DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE savings_goals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create
DROP POLICY IF EXISTS "Users can view their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can insert their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can update their own savings goals" ON savings_goals;
DROP POLICY IF EXISTS "Users can delete their own savings goals" ON savings_goals;

CREATE POLICY "Users can view their own savings goals" ON savings_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings goals" ON savings_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own savings goals" ON savings_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings goals" ON savings_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);

-- ============================================
-- OPTIONAL: Debt Payments History Table
-- (For tracking payment history - optional feature)
-- ============================================
CREATE TABLE IF NOT EXISTS debt_payments (
    id BIGSERIAL PRIMARY KEY,
    debt_id BIGINT REFERENCES debts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create
DROP POLICY IF EXISTS "Users can view their own debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can insert their own debt payments" ON debt_payments;
DROP POLICY IF EXISTS "Users can delete their own debt payments" ON debt_payments;

CREATE POLICY "Users can view their own debt payments" ON debt_payments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own debt payments" ON debt_payments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own debt payments" ON debt_payments
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_debt_payments_user_id ON debt_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);

-- ============================================
-- OPTIONAL: Savings Deposits History Table
-- (For tracking deposit history - optional feature)
-- ============================================
CREATE TABLE IF NOT EXISTS savings_deposits (
    id BIGSERIAL PRIMARY KEY,
    goal_id BIGINT REFERENCES savings_goals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    deposit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE savings_deposits ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist, then create
DROP POLICY IF EXISTS "Users can view their own savings deposits" ON savings_deposits;
DROP POLICY IF EXISTS "Users can insert their own savings deposits" ON savings_deposits;
DROP POLICY IF EXISTS "Users can delete their own savings deposits" ON savings_deposits;

CREATE POLICY "Users can view their own savings deposits" ON savings_deposits
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own savings deposits" ON savings_deposits
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own savings deposits" ON savings_deposits
    FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_savings_deposits_user_id ON savings_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_savings_deposits_goal_id ON savings_deposits(goal_id);
