# Jira → Supabase Sheet Sync

## Overview
This service pulls the public CSV export from Google Sheets (Jira Cloud for Sheets) and upserts:
- Raw payloads into `sheet_issues_raw`
- Normalized records into `issues_normalized`

It is wired to run every 30 minutes via GitHub Actions (`.github/workflows/sync-sheet.yml`).

## Environment Variables
Prefer a single `.env` at repo root. The sync service loads `.env` in this order:
1) `jira-supabase-sync/.env` (if exists)
2) `jira-supabase-sync/../.env`
3) Repo root `.env`

Recommended: keep only the root `.env` and remove `jira-supabase-sync/.env` to avoid drift.

Vars (set in root `.env` or Actions secrets):
- `SUPABASE_URL` (required) — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (required) — service_role key
- `SHEET_CSV_URL` (optional) — CSV source; defaults to the provided public sheet URL
- `SUPABASE_ISSUES_TABLE` (optional) — default `sheet_issues_raw`
- `SUPABASE_ISSUES_NORMALIZED_TABLE` (optional) — default `issues_normalized`
- `SUPABASE_ISSUE_SPRINTS_TABLE` (optional) — default `issue_sprints`
- `SUPABASE_SPRINT_METRICS_TABLE` (optional) — default `sprint_metrics`
- `SUPABASE_SCOPE_CHANGES_TABLE` (optional) — default `sprint_scope_changes`
- `SUPABASE_SYNC_STATE_TABLE` (optional) — default `sync_state`
- `SUPABASE_SPRINTS_TABLE` (optional) — default `sprints`
- `SYNC_MODE` (optional) — `full` to force full sync; defaults to incremental

See `.env.example` for placeholders.

## Tables (SQL)
Run in Supabase (schema `public`):

```sql
-- staging
create table if not exists public.sheet_issues_raw (
  key text primary key,
  issue_id text,
  payload jsonb not null,
  ingested_at timestamptz not null default now(),
  constraint sheet_issues_raw_key_chk check (char_length(key) > 0)
);
create unique index if not exists sheet_issues_raw_issue_id_uq
  on public.sheet_issues_raw(issue_id);

-- normalized
create table if not exists public.issues_normalized (
  key text primary key,
  issue_id text unique,
  summary text,
  project text,
  assignee text,
  priority text,
  status text,
  sprint text,
  story_points numeric,
  story_points_qa numeric,
  story_points_dev numeric,
  resolved timestamptz,
  resolution text,
  created_at timestamptz,
  parent_key text,
  payload jsonb not null,
  ingested_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint issues_normalized_key_chk check (char_length(key) > 0),
  constraint issues_normalized_parent_fk
    foreign key (parent_key) references public.issues_normalized(key)
    deferrable initially deferred
);
create index if not exists issues_normalized_project_idx on public.issues_normalized(project);
create index if not exists issues_normalized_status_idx  on public.issues_normalized(status);
create index if not exists issues_normalized_assignee_idx on public.issues_normalized(assignee);
create index if not exists issues_normalized_sprint_idx   on public.issues_normalized(sprint);

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

-- sprint_metrics (aggregated metrics per sprint)
create table if not exists public.sprint_metrics (
  sprint_name text primary key,
  metrics jsonb not null,
  updated_at timestamptz not null default now()
);
create index if not exists sprint_metrics_updated_idx on public.sprint_metrics(updated_at);

-- sprint_scope_changes (scope change log)
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

-- sprints (discovered sprint names)
create table if not exists public.sprints (
  name text primary key,
  start_date date,
  end_date date,
  last_seen_at timestamptz not null default now(),
  source text default 'sheet'
);
create index if not exists sprints_last_seen_idx on public.sprints(last_seen_at);

-- sync_state (bookkeeping)
create table if not exists public.sync_state (
  id text primary key,
  last_incremental_at timestamptz,
  last_full_at timestamptz,
  updated_at timestamptz not null default now()
);
```

## How it works
1) `src/clients/sheet-client.js` downloads CSV and parses rows.
2) `src/utils/sheet-mapper.js` maps headers exactly as received (handles duplicates).
3) `src/processors/sheet-to-supabase.js` upserts raw rows into `sheet_issues_raw`.
4) `src/processors/normalize-issues.js` maps key fields and upserts into `issues_normalized`.
5) `src/processors/issue-sprints.js` snapshots issue↔sprint and marks removed associations.
6) `src/processors/scope-change-detector.js` logs adds/removes/SP deltas into `sprint_scope_changes`.
7) `src/processors/compute-sprint-metrics.js` aggregates per-sprint metrics.
8) `src/processors/sprint-processor.js` registers sprint names into `sprints`.

## Local Run
```bash
cd jira-supabase-sync
npm install
npm start   # uses .env
```

## GitHub Actions
Workflow: `.github/workflows/sync-sheet.yml`
- Runs `npm ci && npm start` every 30 minutes (incremental).
- You can force a full sync with `SYNC_MODE=full`.
- Secrets required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Optional secrets: `SHEET_CSV_URL`, `SUPABASE_ISSUES_TABLE`, `SUPABASE_ISSUES_NORMALIZED_TABLE`.
