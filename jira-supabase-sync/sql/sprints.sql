-- sprints (lightweight list of sprint names discovered from sheet/Jira)
create table if not exists public.sprints (
  name text primary key,
  start_date date,
  end_date date,
  last_seen_at timestamptz not null default now(),
  source text default 'sheet'
);

create index if not exists sprints_last_seen_idx on public.sprints(last_seen_at);
