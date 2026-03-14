-- Phase 1 foundation: user profile + ownership policies.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_goal') then
    create type public.user_goal as enum ('cycle_tracking', 'ttc', 'pregnant', 'postpartum');
  end if;

  if not exists (select 1 from pg_type where typname = 'pregnancy_status') then
    create type public.pregnancy_status as enum ('none', 'trying', 'pregnant', 'postpartum');
  end if;
end
$$;

create table if not exists public.user_profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  dob date,
  country text,
  time_zone text default 'UTC',
  sex_at_birth text,
  goal public.user_goal default 'cycle_tracking',
  pregnancy_status public.pregnancy_status default 'none',
  medical_history jsonb default '{}'::jsonb,
  preferences jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_user_profiles_goal on public.user_profiles (goal);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_user_profiles_updated_at on public.user_profiles;
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.set_updated_at();

alter table public.user_profiles enable row level security;

drop policy if exists "Profiles are readable by owner" on public.user_profiles;
create policy "Profiles are readable by owner"
  on public.user_profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists "Profiles are insertable by owner" on public.user_profiles;
create policy "Profiles are insertable by owner"
  on public.user_profiles
  for insert
  to authenticated
  with check (auth.uid() = id);

drop policy if exists "Profiles are updatable by owner" on public.user_profiles;
create policy "Profiles are updatable by owner"
  on public.user_profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Profiles are deletable by owner" on public.user_profiles;
create policy "Profiles are deletable by owner"
  on public.user_profiles
  for delete
  to authenticated
  using (auth.uid() = id);

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id)
  values (new.id)
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user_profile();
