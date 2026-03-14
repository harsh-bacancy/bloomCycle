-- Phase 3 foundation: pregnancy overview + kick counter + contraction timer.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'pregnancy_state') then
    create type public.pregnancy_state as enum ('ongoing', 'completed', 'loss');
  end if;
end
$$;

create table if not exists public.pregnancies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lmp_date date,
  estimated_due_date date,
  status public.pregnancy_state not null default 'ongoing',
  risk_flags jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_pregnancies_user on public.pregnancies (user_id);

create table if not exists public.pregnancy_logs (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  week_number integer not null,
  symptoms jsonb default '{}'::jsonb,
  weight numeric(5,2),
  notes text,
  logged_at timestamptz not null default now()
);

create index if not exists idx_pregnancy_logs_pregnancy_week
  on public.pregnancy_logs (pregnancy_id, week_number);

create table if not exists public.kick_counts (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  kick_count integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_kick_counts_pregnancy_time
  on public.kick_counts (pregnancy_id, started_at desc);

create table if not exists public.contractions (
  id uuid primary key default gen_random_uuid(),
  pregnancy_id uuid not null references public.pregnancies (id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration_seconds integer,
  interval_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_contractions_pregnancy_time
  on public.contractions (pregnancy_id, started_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_pregnancies_updated_at on public.pregnancies;
create trigger trg_pregnancies_updated_at
before update on public.pregnancies
for each row
execute function public.set_updated_at();

alter table public.pregnancies enable row level security;
alter table public.pregnancy_logs enable row level security;
alter table public.kick_counts enable row level security;
alter table public.contractions enable row level security;

DROP POLICY IF EXISTS "Pregnancies are readable by owner" ON public.pregnancies;
create policy "Pregnancies are readable by owner"
  on public.pregnancies
  for select
  to authenticated
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pregnancies are insertable by owner" ON public.pregnancies;
create policy "Pregnancies are insertable by owner"
  on public.pregnancies
  for insert
  to authenticated
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pregnancies are updatable by owner" ON public.pregnancies;
create policy "Pregnancies are updatable by owner"
  on public.pregnancies
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pregnancies are deletable by owner" ON public.pregnancies;
create policy "Pregnancies are deletable by owner"
  on public.pregnancies
  for delete
  to authenticated
  using (auth.uid() = user_id);

DROP POLICY IF EXISTS "Pregnancy logs owner access" ON public.pregnancy_logs;
create policy "Pregnancy logs owner access"
  on public.pregnancy_logs
  for all
  to authenticated
  using (
    exists (
      select 1 from public.pregnancies p
      where p.id = pregnancy_logs.pregnancy_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pregnancies p
      where p.id = pregnancy_logs.pregnancy_id and p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Kick counts owner access" ON public.kick_counts;
create policy "Kick counts owner access"
  on public.kick_counts
  for all
  to authenticated
  using (
    exists (
      select 1 from public.pregnancies p
      where p.id = kick_counts.pregnancy_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pregnancies p
      where p.id = kick_counts.pregnancy_id and p.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Contractions owner access" ON public.contractions;
create policy "Contractions owner access"
  on public.contractions
  for all
  to authenticated
  using (
    exists (
      select 1 from public.pregnancies p
      where p.id = contractions.pregnancy_id and p.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.pregnancies p
      where p.id = contractions.pregnancy_id and p.user_id = auth.uid()
    )
  );
