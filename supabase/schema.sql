-- Schema for Salary Tracker app on Supabase
-- Create required tables and RLS policies.

-- PROFILES: stores salary per user
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  salary numeric not null default 0
);

alter table public.profiles enable row level security;

-- RLS: users can read/write their own profile
do $$ begin
  create policy "profiles_select_own"
    on public.profiles for select
    using (auth.uid() = id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "profiles_update_own"
    on public.profiles for update
    using (auth.uid() = id);
exception when duplicate_object then null; end $$;


-- EXPENSES: individual expenses
create table if not exists public.expenses (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric not null check (amount > 0),
  category text not null,
  date date not null
);

alter table public.expenses enable row level security;

do $$ begin
  create policy "expenses_select_own"
    on public.expenses for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "expenses_insert_own"
    on public.expenses for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "expenses_delete_own"
    on public.expenses for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


-- CATEGORIES: per-user custom categories
create table if not exists public.categories (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null
);

create unique index if not exists categories_user_name_unique
on public.categories (user_id, name);

alter table public.categories enable row level security;

do $$ begin
  create policy "categories_select_own"
    on public.categories for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "categories_insert_own"
    on public.categories for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;


-- FIXED_EXPENSES: recurring items
create table if not exists public.fixed_expenses (
  id bigserial primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  task text not null,
  amount numeric not null check (amount >= 0),
  is_completed boolean not null default false
);

alter table public.fixed_expenses enable row level security;

do $$ begin
  create policy "fixed_expenses_select_own"
    on public.fixed_expenses for select
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "fixed_expenses_insert_own"
    on public.fixed_expenses for insert
    with check (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "fixed_expenses_update_own"
    on public.fixed_expenses for update
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;

do $$ begin
  create policy "fixed_expenses_delete_own"
    on public.fixed_expenses for delete
    using (auth.uid() = user_id);
exception when duplicate_object then null; end $$;
