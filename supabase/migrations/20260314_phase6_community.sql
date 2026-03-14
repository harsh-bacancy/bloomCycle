-- Phase 6: community posts/comments with basic flagging and anonymous posting.

create extension if not exists pgcrypto;

create table if not exists public.community_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  category text,
  title text not null,
  content text not null,
  is_anonymous boolean not null default false,
  flags jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.community_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.community_post_flags (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.community_posts (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  reason text,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create index if not exists idx_community_posts_category_created on public.community_posts (category, created_at desc);
create index if not exists idx_community_comments_post on public.community_comments (post_id, created_at);
create index if not exists idx_community_flags_post on public.community_post_flags (post_id, created_at);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists trg_community_posts_updated_at on public.community_posts;
create trigger trg_community_posts_updated_at
before update on public.community_posts
for each row
execute function public.set_updated_at();

alter table public.community_posts enable row level security;
alter table public.community_comments enable row level security;
alter table public.community_post_flags enable row level security;

-- community_posts policies
DROP POLICY IF EXISTS "Community posts readable" ON public.community_posts;
create policy "Community posts readable"
  on public.community_posts
  for select
  to authenticated
  using (true);

DROP POLICY IF EXISTS "Community posts insert owner" ON public.community_posts;
create policy "Community posts insert owner"
  on public.community_posts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community posts update owner" ON public.community_posts;
create policy "Community posts update owner"
  on public.community_posts
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community posts delete owner" ON public.community_posts;
create policy "Community posts delete owner"
  on public.community_posts
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- community_comments policies
DROP POLICY IF EXISTS "Community comments readable" ON public.community_comments;
create policy "Community comments readable"
  on public.community_comments
  for select
  to authenticated
  using (true);

DROP POLICY IF EXISTS "Community comments insert owner" ON public.community_comments;
create policy "Community comments insert owner"
  on public.community_comments
  for insert
  to authenticated
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community comments update owner" ON public.community_comments;
create policy "Community comments update owner"
  on public.community_comments
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community comments delete owner" ON public.community_comments;
create policy "Community comments delete owner"
  on public.community_comments
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- community_post_flags policies
DROP POLICY IF EXISTS "Community flags readable" ON public.community_post_flags;
create policy "Community flags readable"
  on public.community_post_flags
  for select
  to authenticated
  using (true);

DROP POLICY IF EXISTS "Community flags insert owner" ON public.community_post_flags;
create policy "Community flags insert owner"
  on public.community_post_flags
  for insert
  to authenticated
  with check (auth.uid() = user_id);

DROP POLICY IF EXISTS "Community flags delete owner" ON public.community_post_flags;
create policy "Community flags delete owner"
  on public.community_post_flags
  for delete
  to authenticated
  using (auth.uid() = user_id);
