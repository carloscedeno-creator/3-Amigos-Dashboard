-- issue_sprints (scope change + history snapshots)
create table if not exists public.issue_sprints (
  id uuid primary key default gen_random_uuid(),
  issue_key text not null,
  sprint_name text not null,
  status_at_sync text,
  story_points_at_sync numeric,
  is_removed boolean not null default false,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  removed_at timestamptz,
  unique (issue_key, sprint_name)
);

create index if not exists issue_sprints_issue_key_idx on public.issue_sprints(issue_key);
create index if not exists issue_sprints_sprint_name_idx on public.issue_sprints(sprint_name);
