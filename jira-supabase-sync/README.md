# Jira → Supabase Sheet Sync

## Overview
This service pulls the public CSV export from Google Sheets (Jira Cloud for Sheets) and upserts:
- Raw payloads into `sheet_issues_raw`
- Normalized records into `issues_normalized`

It is wired to run every 30 minutes via GitHub Actions (`.github/workflows/sync-sheet.yml`).

## Environment Variables
Put these in `jira-supabase-sync/.env` or as GitHub Action secrets:
- `SUPABASE_URL` (required) — Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` (required) — service_role key
- `SHEET_CSV_URL` (optional) — CSV source; defaults to the provided public sheet URL
- `SUPABASE_ISSUES_TABLE` (optional) — default `sheet_issues_raw`
- `SUPABASE_ISSUES_NORMALIZED_TABLE` (optional) — default `issues_normalized`

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
```

## How it works
1) `src/clients/sheet-client.js` downloads CSV and parses rows.
2) `src/utils/sheet-mapper.js` maps headers exactly as received (handles duplicates).
3) `src/processors/sheet-to-supabase.js` upserts raw rows into `sheet_issues_raw`.
4) `src/processors/normalize-issues.js` maps key fields and upserts into `issues_normalized`.

## Local Run
```bash
cd jira-supabase-sync
npm install
npm start   # uses .env
```

## GitHub Actions
Workflow: `.github/workflows/sync-sheet.yml`
- Runs `npm ci && npm start` every 30 minutes.
- Secrets required: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- Optional secrets: `SHEET_CSV_URL`, `SUPABASE_ISSUES_TABLE`, `SUPABASE_ISSUES_NORMALIZED_TABLE`.
