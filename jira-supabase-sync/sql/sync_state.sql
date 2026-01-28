-- sync_state (bookkeeping for incremental/full runs)
create table if not exists public.sync_state (
  id text primary key,
  last_incremental_at timestamptz,
  last_full_at timestamptz,
  updated_at timestamptz not null default now()
);
