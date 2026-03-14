-- Phase 7 groundwork: integration connections + insight snapshots.

create extension if not exists pgcrypto;

create table if not exists public.integration_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  external_user_id text,
  status text not null default 'disconnected' check (status in ('connected', 'disconnected', 'error')),
  metadata jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, provider)
);

create table if not exists public.insight_snapshots (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  source text not null default 'app_analytics',
  summary text,
  metrics jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_integrations_user on public.integration_connections (user_id, provider);
create index if not exists idx_insight_snapshots_user on public.insight_snapshots (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_integrations_updated_at on public.integration_connections;
create trigger trg_integrations_updated_at
before update on public.integration_connections
for each row
execute function public.set_updated_at();

alter table public.integration_connections enable row level security;
alter table public.insight_snapshots enable row level security;

drop policy if exists "Integrations select owner" on public.integration_connections;
create policy "Integrations select owner"
  on public.integration_connections
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Integrations insert owner" on public.integration_connections;
create policy "Integrations insert owner"
  on public.integration_connections
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Integrations update owner" on public.integration_connections;
create policy "Integrations update owner"
  on public.integration_connections
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Integrations delete owner" on public.integration_connections;
create policy "Integrations delete owner"
  on public.integration_connections
  for delete
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Insight snapshots select owner" on public.insight_snapshots;
create policy "Insight snapshots select owner"
  on public.insight_snapshots
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists "Insight snapshots insert owner" on public.insight_snapshots;
create policy "Insight snapshots insert owner"
  on public.insight_snapshots
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "Insight snapshots delete owner" on public.insight_snapshots;
create policy "Insight snapshots delete owner"
  on public.insight_snapshots
  for delete
  to authenticated
  using (auth.uid() = user_id);
