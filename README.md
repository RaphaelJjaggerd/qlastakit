# foundation

A monorepo to start every project from. TypeScript core, language-agnostic seams:
apps and services talk through a generated OpenAPI contract, the database schema is plain
SQL, and shared code is grouped by language so Rust, Go or Python can join any time.

## Quick start

Needs Node 22+, pnpm 10, Docker, and (recommended) [just](https://github.com/casey/just)
and [mise](https://mise.jdx.dev).

```sh
cp .env.example .env
just setup
just db-up && just db-migrate
just dev
```

Open http://localhost:3000. The notes page reads and writes through the API
(http://localhost:8787) to Postgres.

## Layout

```
apps/web                 TanStack Start web app
services/api             Hono API (business logic lives here)
contracts/openapi.json   generated API contract
contracts/clients/ts     generated TS client (@kit/api-client)
db/migrations            plain SQL, source of truth for the schema
packages/ts              shared TS: ui, db, config (auth, email, payments planned)
packages/rust|go|python  shared code for other languages, added when needed
infra                    local Postgres
docs                     recipes and decisions
```

## Using it for a new project

Copy the repo, rename `foundation` in `package.json`, delete the `notes` feature once you
have your own, and follow `docs/recipes/add-feature.md`.

Agents: see `AGENTS.md`.
