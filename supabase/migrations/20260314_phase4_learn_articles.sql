-- Phase 4: Learn content library + minimal admin support.

create extension if not exists pgcrypto;

create table if not exists public.articles (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  body text not null,
  topic text,
  stage text,
  language text not null default 'en',
  is_premium boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_articles_topic on public.articles (topic);
create index if not exists idx_articles_stage on public.articles (stage);
create index if not exists idx_articles_published on public.articles (published_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_articles_updated_at on public.articles;
create trigger trg_articles_updated_at
before update on public.articles
for each row
execute function public.set_updated_at();

alter table public.articles enable row level security;

drop policy if exists "Articles published are public readable" on public.articles;
create policy "Articles published are public readable"
  on public.articles
  for select
  to anon, authenticated
  using (published_at is not null);

drop policy if exists "Articles admins read all" on public.articles;
create policy "Articles admins read all"
  on public.articles
  for select
  to authenticated
  using (true);

drop policy if exists "Articles manageable by authenticated" on public.articles;
create policy "Articles manageable by authenticated"
  on public.articles
  for all
  to authenticated
  using (true)
  with check (true);
