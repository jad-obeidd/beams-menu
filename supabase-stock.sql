-- Run once in the Supabase SQL editor (the same "beams" project).
-- The website fills stock_items from the depot checklist the first time /stock opens.

create table if not exists stock_items (
  id text primary key,
  section text not null check (section in ('beans', 'fresh', 'syrups', 'paper')),
  grp text,
  name text not null,
  unit text,
  target numeric,
  position integer not null default 0,
  updated_by text,
  updated_at timestamptz not null default now()
);

-- A count in progress is saved here, so a closed phone doesn't lose it.
create table if not exists stock_checks (
  id text primary key,
  status text not null default 'open' check (status in ('open', 'done')),
  counts jsonb not null default '{}',
  summary jsonb,
  shopping_text text,
  started_by text not null,
  finished_by text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Only one count can be open at a time.
create unique index if not exists stock_one_open_check on stock_checks (status) where status = 'open';
create index if not exists stock_checks_finished on stock_checks (finished_at desc);

-- Only the website's server (service role key) can read or change these.
alter table stock_items enable row level security;
alter table stock_checks enable row level security;
