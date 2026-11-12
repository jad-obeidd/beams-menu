-- Run once in the Supabase SQL editor (the same "beams" project as the loyalty card).
-- The menu website fills this table with the current menu the first time it loads.
create table if not exists menu_items (
  id text primary key,
  section_id text not null,
  name text not null,
  prices jsonb not null,
  description text,
  note text,
  available boolean not null default true,
  position integer not null default 0,
  updated_by text,
  updated_at timestamptz not null default now()
);
create index if not exists menu_items_section on menu_items (section_id, position);

-- Only the website's server (service role key) can read or change it.
alter table menu_items enable row level security;
