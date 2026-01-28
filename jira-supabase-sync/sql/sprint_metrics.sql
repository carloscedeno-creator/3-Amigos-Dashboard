-- sprint_metrics (aggregated metrics per sprint)
create table if not exists public.sprint_metrics (
  sprint_name text primary key,
  metrics jsonb not null,
  updated_at timestamptz not null default now()
);

create index if not exists sprint_metrics_updated_idx on public.sprint_metrics(updated_at);
