-- ============================================================
-- SSC CGL Mock Test — Supabase Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ============================================================

-- 1. Table to store every test attempt
create table if not exists public.results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  paper_id text not null,
  paper_title text not null,
  total_score numeric not null,
  correct_count int not null,
  incorrect_count int not null,
  skipped_count int not null,
  time_taken_seconds int not null,
  section_breakdown jsonb not null default '{}'::jsonb,
  answers jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- 2. Index for fast "get my history" queries
create index if not exists results_user_id_created_at_idx
  on public.results (user_id, created_at desc);

-- 3. Row Level Security — each user can only see/insert their own rows
alter table public.results enable row level security;

-- Allow a logged-in user to insert their own results
create policy "Users can insert their own results"
  on public.results
  for insert
  with check (auth.uid() = user_id);

-- Allow a logged-in user to read their own results
create policy "Users can view their own results"
  on public.results
  for select
  using (auth.uid() = user_id);

-- (No update/delete policy needed — results are permanent attempt records)
