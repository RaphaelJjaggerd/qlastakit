# qlastakit

A monorepo to start every project from. TypeScript core, language-agnostic seams:
apps and services talk through a generated OpenAPI contract, the database schema is plain
SQL, and shared code is grouped by language so Rust, Go or Python can join any time.

## Quick start

Needs [mise](https://mise.jdx.dev) (installs Node 22 and pnpm 10) and Docker.

```sh
cp .env.example .env
mise install
mise run setup
mise run db-up && mise run db-migrate
mise run dev
```

Open http://localhost:3000. The notes page reads and writes through the API
(http://localhost:8787) to Postgres.

## Layout

```
apps/web                 TanStack Start web app
services/api             Hono API (business logic lives here)
contracts/openapi.json   generated API contract
contracts/clients/ts     generated TS client (@qlastakit/api-client)
db/migrations            plain SQL, source of truth for the schema
packages/ts              shared TS: ui, db, config (auth, email, payments planned)
packages/rust|go|python  shared code for other languages, added when needed
infra                    local Postgres
docs                     recipes and decisions
```

## Using it for a new project

Copy the repo, rename `qlastakit` in `package.json`, delete the `notes` feature once you
have your own, and follow `docs/recipes/add-feature.md`.

Agents: see `AGENTS.md`.
