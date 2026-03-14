-- Restrict article management to owner.

alter table public.articles
  add column if not exists created_by uuid references auth.users (id) on delete set null;

create index if not exists idx_articles_created_by on public.articles (created_by);

drop policy if exists "Articles admins read all" on public.articles;
drop policy if exists "Articles manageable by authenticated" on public.articles;

drop policy if exists "Articles published are public readable" on public.articles;
create policy "Articles published are public readable"
  on public.articles
  for select
  to anon, authenticated
  using (published_at is not null or auth.uid() = created_by);

create policy "Articles insert by owner"
  on public.articles
  for insert
  to authenticated
  with check (auth.uid() = created_by);

create policy "Articles update by owner"
  on public.articles
  for update
  to authenticated
  using (auth.uid() = created_by)
  with check (auth.uid() = created_by);

create policy "Articles delete by owner"
  on public.articles
  for delete
  to authenticated
  using (auth.uid() = created_by);
