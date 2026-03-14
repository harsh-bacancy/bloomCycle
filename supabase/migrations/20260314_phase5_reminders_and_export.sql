-- Phase 5: appointments, medications, reminders, notifications, and data exports.

create extension if not exists pgcrypto;

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider_id uuid,
  title text not null,
  description text,
  date_time timestamptz not null,
  location text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'canceled')),
  created_at timestamptz not null default now()
);
create index if not exists idx_appointments_user_time on public.appointments (user_id, date_time);

create table if not exists public.medications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  dosage text,
  frequency text,
  route text,
  start_date date,
  end_date date,
  type text default 'medication',
  created_at timestamptz not null default now()
);
create index if not exists idx_medications_user_created on public.medications (user_id, created_at desc);

create table if not exists public.reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  medication_id uuid references public.medications (id) on delete set null,
  type text not null check (type in ('medication', 'appointment', 'custom')),
  schedule jsonb not null default '{}'::jsonb,
  delivery_channel text not null default 'in_app' check (delivery_channel in ('in_app', 'email', 'push', 'sms')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists idx_reminders_user_type on public.reminders (user_id, type);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  body text not null,
  type text,
  payload jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_notifications_user_created on public.notifications (user_id, created_at desc);

create table if not exists public.data_exports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  requested_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'processing', 'ready', 'failed')),
  file_url text,
  export_type text,
  error text
);
create index if not exists idx_data_exports_user on public.data_exports (user_id, requested_at desc);

alter table public.appointments enable row level security;
alter table public.medications enable row level security;
alter table public.reminders enable row level security;
alter table public.notifications enable row level security;
alter table public.data_exports enable row level security;

-- owner policies
DO $$
DECLARE
  t text;
BEGIN
  FOR t IN SELECT unnest(array['appointments','medications','reminders','notifications','data_exports'])
  LOOP
    EXECUTE format('drop policy if exists "%s select owner" on public.%I', initcap(t), t);
    EXECUTE format('create policy "%s select owner" on public.%I for select to authenticated using (auth.uid() = user_id)', initcap(t), t);

    EXECUTE format('drop policy if exists "%s insert owner" on public.%I', initcap(t), t);
    EXECUTE format('create policy "%s insert owner" on public.%I for insert to authenticated with check (auth.uid() = user_id)', initcap(t), t);

    EXECUTE format('drop policy if exists "%s update owner" on public.%I', initcap(t), t);
    EXECUTE format('create policy "%s update owner" on public.%I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', initcap(t), t);

    EXECUTE format('drop policy if exists "%s delete owner" on public.%I', initcap(t), t);
    EXECUTE format('create policy "%s delete owner" on public.%I for delete to authenticated using (auth.uid() = user_id)', initcap(t), t);
  END LOOP;
END
$$;
