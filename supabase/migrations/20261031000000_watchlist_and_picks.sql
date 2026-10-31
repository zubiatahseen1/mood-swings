-- Mood Swings 2: the two tables the app needs.
--
--   watchlist  films a user saved for later
--   picks      films a user said they are watching, per mood.
--              Their genres tune that mood's future suggestions.
--
-- Row Level Security makes every row private to its owner: the browser
-- talks to Postgres directly, so these policies are the real access control.

create table public.watchlist (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tmdb_id      integer not null,
  title        text not null,
  poster_path  text,
  release_year text,
  vote_average numeric(3, 1),
  created_at   timestamptz not null default now(),
  unique (user_id, tmdb_id)
);

create table public.picks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null default auth.uid() references auth.users (id) on delete cascade,
  tmdb_id    integer not null,
  title      text not null,
  mood       text not null check (mood in ('happy', 'sad', 'angry', 'chill', 'surprise', 'romantic', 'scared')),
  genre_ids  integer[] not null default '{}',
  created_at timestamptz not null default now(),
  unique (user_id, tmdb_id, mood)
);

create index picks_user_mood_idx on public.picks (user_id, mood);
create index watchlist_user_created_idx on public.watchlist (user_id, created_at desc);

alter table public.watchlist enable row level security;
alter table public.picks enable row level security;

-- (select auth.uid()) is evaluated once per query instead of once per row.
create policy "Users read their own watchlist" on public.watchlist
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add to their own watchlist" on public.watchlist
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users remove from their own watchlist" on public.watchlist
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "Users read their own picks" on public.picks
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users add their own picks" on public.picks
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users remove their own picks" on public.picks
  for delete to authenticated using ((select auth.uid()) = user_id);
