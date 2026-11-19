# AGENTS.md

Guide for AI agents (and humans) working in this repo. Read this first.

> **Status: draft.** The kit is still being aligned with its PRD. Read `docs/PRD.md`
> for locked decisions, open questions and the roadmap, and `docs/VISION.md` for where
> this is heading. Where this file and the PRD disagree (the PRD locks NestJS, a
> framework-free core, oxlint + oxfmt and mise tasks),
> the PRD wins. Do not build product features until Phase 0 is done.

Tier: full
<!-- jam | full. jam skips PRD review rounds, /review, gates and the scout. -->

## Working method (potato-eng)

One task per session. `/task` picks the first `todo` card in `docs/TASKS.md`, reads
only the PRD sections the card lists, does that task, runs `scripts/verify.sh`,
commits, stops. `/review` on the checker model follows. Two returns wake `/advise` on
the advisor model. Phase gates run the retro. Loop: `scripts/run-tasks.sh`. Plan
review: `scripts/prd-review.sh`. Models: `scripts/models.env`.

- Read the PRD by section, never whole.
- Prefer Grep and targeted Read; a `scout` agent for anything over five files.
- Build only the card. Stub later work behind an interface and log it.
- A card with `Ref:` follows that reference's mode in `docs/REFERENCES.md`. `reuse`
  means copy the vetted code and change only what is wrong; never rewrite it for taste.
- A locked PRD decision is never worked around. Set the card `blocked` and say why.
- Mechanical rules are checks in `scripts/verify.sh`; judgement calls are lines in
  `docs/STANDARDS.md`. Do not add rules here.
- Every closed card logs: built, open decisions taken, stubs, wishes.
- ADRs (`/decide`) go in `docs/adr/`.
- Scratch files (lint probes, throwaway scripts and Playwright runs, temp output) go in
  `.potato/tmp/` (gitignored; `mkdir -p` it), never in the repo or the system temp
  folder. Lint a probe there by its path (`pnpm exec oxlint .potato/tmp/x.ts`). A probe
  that must sit at a real path, to hit a path-scoped or type-aware lint rule, is deleted
  with `rm` before the session ends. Recursive `rm` is blocked; files only.

## What this repo is

qlastakit: the monorepo every project starts from. The infrastructure (UI kit, API plumbing, database, contracts,
tooling) is already done. Your job is almost always **business logic for one project**:
add features to `services/api` and screens to `apps/*`.

## Map

| Path | What | Language |
|---|---|---|
| `apps/web` | Web app, TanStack Start | TS |
| `apps/*` | Other clients (mobile, desktop, extension) as they are added | any |
| `services/api` | Main HTTP API, NestJS (Express) + nestjs-zod. **All business logic lives here.** | TS |
| `services/*` | Other services, any language, each self-contained | any |
| `contracts/openapi.json` | The API contract. **Generated, never edit by hand.** | none |
| `contracts/clients/ts` | Generated TS client (`@qlastakit/api-client`) | TS |
| `db/migrations` | Plain SQL migrations. **Source of truth for the schema.** | SQL |
| `packages/ts/*` | Shared TS code (`@qlastakit/ui`, `@qlastakit/db`, `@qlastakit/config`, ...) | TS |
| `packages/rust`, `go`, `python` | Shared code for those languages (empty until needed) | each |
| `infra/` | Docker Compose for local Postgres | none |
| `docs/recipes` | Step-by-step guides for common tasks | |
| `docs/adr` | Why things are the way they are (read before changing structure) | |
| `docs/REFERENCES.md` | Map of the reference kits in `references/` (gitignored, read-only) | |
| `docs/TASKS.md` | Task cards: the state of the work (`/tasks` writes it) | |
| `docs/STANDARDS.md` | Judgement rules, read at review only | |
| `GLOSSARY.md` | Project terms, one line each | |
| `scripts/` | potato-eng loop: `verify.sh`, `run-tasks.sh`, `prd-review.sh`, `models.env` | bash |

## Golden rules

1. **Apps talk to services only through the generated client.** Never import server code
   into an app. Never call `fetch` on the API by hand.
2. **Business logic goes in `packages/ts/core`** (zod schemas and plain functions that take
   the db as an argument). The API route is a thin adapter. Not in routes, not in the web
   app, not in TanStack Start server functions.
3. **Schema changes start in SQL.** Add `db/migrations/NNNN_name.sql`, then mirror it in
   `packages/ts/db/src/schema.ts`. Never edit an applied migration.
4. **After changing any API route, run `mise run contract`** so the spec and clients update.
5. **Packages are per language.** `packages/ts/*` is only for TS code. A Rust service uses
   `packages/rust/*`, never TS packages.
6. **Keep it simple.** Do not add a library, layer or abstraction the task does not need.
   Prefer editing an existing file over creating a new pattern.
7. **References are for reading.** Before building a module, check `docs/REFERENCES.md`
   and send a scout to the listed paths. Learn the shape, write our own code, and follow
   current library docs over the reference. Never run anything inside `references/`.

## Commands

```sh
mise run setup       # install everything
mise run db-up       # start Postgres (Docker)
mise run db-migrate  # apply SQL migrations
mise run dev         # run all apps and services
mise run contract    # regenerate openapi.json and clients
mise run check       # typecheck + lint (oxlint type-aware + oxfmt check)
scripts/verify.sh    # potato-eng gate: typecheck, lint, tests, contract drift
```

Each mise task is one `pnpm` command: `pnpm install`, `pnpm dev`, `pnpm contract`,
`pnpm check`, `pnpm format` (oxfmt, writes).

Local URLs: web `http://localhost:3000`, API `http://localhost:8787/api`,
spec `http://localhost:8787/api/openapi.json`, docs `http://localhost:8787/api/docs`.

## Windows

- Shell scripts (`scripts/*.sh`, hooks) run in Git Bash.
- Postgres runs in Docker Compose (`mise run db-up`). Any Docker-compatible runtime
  works (Docker Desktop, Kiri, Podman) as long as `docker` and `docker compose` are on
  the PATH.
- Migrations run from Node (`packages/ts/db/src/migrate.ts`, via `mise run db-migrate`);
  `psql` is not needed on the host.
- Line endings are LF everywhere (`.gitattributes`). Do not commit CRLF.

## Common tasks

- New feature end to end: `docs/recipes/add-feature.md`
- New service in another language: `docs/recipes/add-service.md`
- Notes is the reference feature: logic in `packages/ts/core/src/notes`, its thin API
  controller in `services/api/src/features/notes/notes.controller.ts`. Copy its shape.

## Definition of done

`scripts/verify.sh` passes (it runs typecheck, lint, tests and the contract-drift check),
the card's "Done when" is met, and the change is covered by the recipe it followed.
Do not leave TODO stubs without telling the user.
