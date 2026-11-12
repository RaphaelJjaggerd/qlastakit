-- Plain SQL migrations are the single source of truth for the schema.
-- Any language (TS, Rust, Go, Python) reads the same tables.
-- Name new files NNNN_description.sql. Never edit an applied migration.

create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  body        text not null default '',
  created_at  timestamptz not null default now()
);
