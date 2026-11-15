# AGENTS.md

Guide for AI agents (and humans) working in this repo. Read this first.

> **Status: draft.** The kit is still being aligned with its PRD. Read `docs/PRD.md`
> for locked decisions, open questions and the roadmap, and `docs/VISION.md` for where
> this is heading. Where this file and the PRD disagree (the PRD locks NestJS, a
> framework-free core, oxlint + oxfmt and mise tasks; the skeleton still uses Hono,
> Biome and `just`), the PRD wins. Do not build product features until Phase 0 is done.

## What this repo is

qlastakit: the monorepo every project starts from. The infrastructure (UI kit, API plumbing, database, contracts,
tooling) is already done. Your job is almost always **business logic for one project**:
add features to `services/api` and screens to `apps/*`.

## Map

| Path | What | Language |
|---|---|---|
| `apps/web` | Web app, TanStack Start | TS |
| `apps/*` | Other clients (mobile, desktop, extension) as they are added | any |
| `services/api` | Main HTTP API, Hono + zod-openapi. **All business logic lives here.** | TS |
| `services/*` | Other services, any language, each self-contained | any |
| `contracts/openapi.json` | The API contract. **Generated, never edit by hand.** | none |
| `contracts/clients/ts` | Generated TS client (`@qlastakit/api-client`) | TS |
| `db/migrations` | Plain SQL migrations. **Source of truth for the schema.** | SQL |
| `packages/ts/*` | Shared TS code (`@qlastakit/ui`, `@qlastakit/db`, `@qlastakit/config`, ...) | TS |
| `packages/rust`, `go`, `python` | Shared code for those languages (empty until needed) | each |
| `infra/` | Docker Compose for local Postgres | none |
| `docs/recipes` | Step-by-step guides for common tasks | |
| `docs/decisions` | Why things are the way they are (read before changing structure) | |

## Golden rules

1. **Apps talk to services only through the generated client.** Never import server code
   into an app. Never call `fetch` on the API by hand.
2. **Business logic goes in `services/api/src/features/<name>/service.ts`.** Not in routes,
   not in the web app, not in TanStack Start server functions.
3. **Schema changes start in SQL.** Add `db/migrations/NNNN_name.sql`, then mirror it in
   `packages/ts/db/src/schema.ts`. Never edit an applied migration.
4. **After changing any API route, run `just contract`** so the spec and clients update.
5. **Packages are per language.** `packages/ts/*` is only for TS code. A Rust service uses
   `packages/rust/*`, never TS packages.
6. **Keep it simple.** Do not add a library, layer or abstraction the task does not need.
   Prefer editing an existing file over creating a new pattern.

## Commands

```sh
just setup        # install everything
just db-up        # start Postgres (Docker)
just db-migrate   # apply SQL migrations
just dev          # run all apps and services
just contract     # regenerate openapi.json and clients
just check        # typecheck + lint every language
```

Without `just`: `pnpm install`, `pnpm dev`, `pnpm contract`, `pnpm typecheck`, `pnpm lint`.

Local URLs: web `http://localhost:3000`, API `http://localhost:8787`,
spec `http://localhost:8787/openapi.json`.

## Common tasks

- New feature end to end: `docs/recipes/add-feature.md`
- New service in another language: `docs/recipes/add-service.md`
- `services/api/src/features/notes` is the reference feature. Copy its shape.

## Definition of done

`just check` passes, `just contract` was run if routes changed, and the change is covered
by the recipe it followed. Do not leave TODO stubs without telling the user.
