-- sprint_scope_changes (tracks adds/removes/SP changes per issue+sprint)
create table if not exists public.sprint_scope_changes (
  id uuid primary key default gen_random_uuid(),
  issue_key text not null,
  sprint_name text not null,
  change_type text not null, -- added | removed | story_points_changed
  from_sp numeric,
  to_sp numeric,
  status_at_change text,
  changed_at timestamptz not null default now()
);

create index if not exists sprint_scope_changes_issue_key_idx on public.sprint_scope_changes(issue_key);
create index if not exists sprint_scope_changes_sprint_idx on public.sprint_scope_changes(sprint_name);
