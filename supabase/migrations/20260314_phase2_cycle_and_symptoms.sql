-- Phase 2 foundation: menstrual cycle and symptom tracking.

create extension if not exists pgcrypto;

create table if not exists public.menstrual_cycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  cycle_start_date date not null,
  cycle_end_date date,
  average_cycle_length integer,
  flow_intensity smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_menstrual_cycles_user_date
  on public.menstrual_cycles (user_id, cycle_start_date);

create table if not exists public.symptoms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  date date not null,
  type text not null check (type in ('mood', 'pain', 'energy', 'other')),
  label text not null,
  intensity smallint,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_symptoms_user_date
  on public.symptoms (user_id, date);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_menstrual_cycles_updated_at on public.menstrual_cycles;
create trigger trg_menstrual_cycles_updated_at
before update on public.menstrual_cycles
for each row
execute function public.set_updated_at();

alter table public.menstrual_cycles enable row level security;
alter table public.symptoms enable row level security;

-- menstrual_cycles policies
drop policy if exists "Cycles are readable by owner" on public.menstrual_cycles;
create policy "Cycles are readable by owner"
  on public.menstrual_cycles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Cycles are insertable by owner" on public.menstrual_cycles;
create policy "Cycles are insertable by owner"
  on public.menstrual_cycles
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Cycles are updatable by owner" on public.menstrual_cycles;
create policy "Cycles are updatable by owner"
  on public.menstrual_cycles
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Cycles are deletable by owner" on public.menstrual_cycles;
create policy "Cycles are deletable by owner"
  on public.menstrual_cycles
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- symptoms policies
drop policy if exists "Symptoms are readable by owner" on public.symptoms;
create policy "Symptoms are readable by owner"
  on public.symptoms
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Symptoms are insertable by owner" on public.symptoms;
create policy "Symptoms are insertable by owner"
  on public.symptoms
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Symptoms are updatable by owner" on public.symptoms;
create policy "Symptoms are updatable by owner"
  on public.symptoms
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Symptoms are deletable by owner" on public.symptoms;
create policy "Symptoms are deletable by owner"
  on public.symptoms
  for delete
  to authenticated
  using (auth.uid() = user_id);
