-- Run once in the Supabase SQL editor, after supabase-menu.sql.
-- "hidden" items are kept in the dashboard but not shown on the menu at all.
alter table menu_items add column if not exists hidden boolean not null default false;
