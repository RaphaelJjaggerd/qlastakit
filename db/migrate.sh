#!/usr/bin/env bash
# Minimal migration runner: applies each db/migrations/*.sql once, in order.
# Tracks applied files in a schema_migrations table. Needs DATABASE_URL and the
# Compose Postgres running (mise run db-up). psql runs inside the Postgres
# container, so the host needs only docker and docker compose, not psql.
# DATABASE_URL is used from inside the container: the default localhost:5432
# points at the container's own Postgres.
set -euo pipefail
: "${DATABASE_URL:?DATABASE_URL is not set}"
cd "$(dirname "$0")/.."

compose=(docker compose -f infra/docker-compose.yml)

if ! "${compose[@]}" exec -T postgres true >/dev/null 2>&1; then
  echo "migrate: the postgres container is not running (mise run db-up)" >&2
  exit 1
fi

psql() { "${compose[@]}" exec -T postgres psql "$DATABASE_URL" "$@"; }

psql -q -c "set client_min_messages = warning; create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now());"

for path in db/migrations/*.sql; do
  f=$(basename "$path")
  applied=$(psql -tAc "select 1 from schema_migrations where name = '$f'" | tr -d '\r')
  if [ "$applied" != "1" ]; then
    echo "applying $f"
    psql -v ON_ERROR_STOP=1 -q -1 -f - < "$path"
    psql -q -c "insert into schema_migrations (name) values ('$f');"
  fi
done
echo "migrations up to date"
