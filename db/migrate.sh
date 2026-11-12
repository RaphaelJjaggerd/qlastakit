#!/usr/bin/env bash
# Minimal migration runner: applies each db/migrations/*.sql once, in order.
# Tracks applied files in a schema_migrations table. Needs psql and DATABASE_URL.
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is not set}"
cd "$(dirname "$0")/migrations"

psql "$DATABASE_URL" -q -c "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());"

for f in *.sql; do
  applied=$(psql "$DATABASE_URL" -tAc "select 1 from schema_migrations where name = '$f'")
  if [ "$applied" != "1" ]; then
    echo "applying $f"
    psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -q -1 -f "$f"
    psql "$DATABASE_URL" -q -c "insert into schema_migrations (name) values ('$f');"
  fi
done
echo "migrations up to date"
