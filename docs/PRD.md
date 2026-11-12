# Foundation Monorepo: PRD

**Status:** draft, still being fleshed out. Do not build features on it yet.
**Last updated:** 2026-11-12

## 1. Vision

One monorepo to start every project from (web, mobile, desktop), so no project starts
from scratch. Inspired by turbostarter.dev and superstarter.dev, but not locked to
TypeScript: TS is the core today, and Rust, Go, Python, Kotlin or Swift can join later
without a rewrite.

The kit handles UI, infrastructure and plumbing. The developer (human or AI agent) only
writes the idea and its custom business logic.

First real consumers: the two idea management apps.

## 2. Principles

1. **KISS.** Build a module only when a real project needs it. No empty abstractions.
2. **Contract-first seams.** Apps talk to services only through a generated OpenAPI
   client. No TS-only coupling between apps and services.
3. **Business logic is framework-free.** Plain services with no HTTP framework imports,
   so the HTTP layer (NestJS today, Hono later) stays a thin, swappable shell.
4. **Shared code grouped by language:** `packages/ts`, `rust`, `go`, `python`.
5. **AI-friendly.** `AGENTS.md`, recipes, decision records, one reference feature to copy.

## 3. Decisions

### Locked

| Area | Choice | Notes |
|---|---|---|
| Package manager | pnpm workspaces | |
| Build orchestration | Turborepo | TS tasks only |
| Web app | TanStack Start | Next.js at most for marketing |
| Main API | **NestJS** | Hono offered later as an option |
| Database | **Postgres, always** | |
| ORM | **Drizzle** | Postgres only |
| Optional DB | **MongoDB**, per project | See open question Q3 |
| Contract | OpenAPI, generated from the API | Hey API for the TS client |
| Linter | **oxlint** | Needs a formatter, see Q4 |
| Shared code layout | `packages/<language>/<name>` | |
| Schema source of truth | Plain SQL migrations in `db/migrations` | Postgres only |
| Toolchain versions | mise | |
| Local infra | Docker Compose | |

### Open questions

- **Q1. Task runner: keep `just` or use mise tasks?**
  Options: `just` (simple, popular, one extra install), **mise tasks** (already using mise
  for versions, so one tool fewer), Taskfile (YAML, verbose), Make (preinstalled, but tab
  rules and shell quirks), Turborepo only (cannot run Rust or Go natively).
  Recommendation: mise tasks, purely for one less tool. `just` is also fine.

- **Q2. How do NestJS and Hono both exist without doubling the work?**
  Proposal: business logic lives in plain classes or functions (e.g. `packages/ts/core` or
  `services/api/src/features/*/service.ts`) with no Nest decorators inside. NestJS
  controllers and Hono routes are thin adapters over the same services. Hono is added only
  when a project actually wants it. Decide: does the kit ship both, or one per project
  chosen at scaffold time?

- **Q3. MongoDB scope.** Drizzle does not support MongoDB, so Mongo means a separate
  driver (official `mongodb` driver or Mongoose) and SQL migrations do not apply to it.
  Decide: is Mongo an extra store next to Postgres (e.g. for documents or logs), or a
  replacement for Postgres in some projects? Recommendation: extra store only, since
  "Postgres always" is locked.

- **Q4. Formatter to pair with oxlint.** oxfmt (from the same Oxc project) or Prettier.
  Check oxfmt maturity before choosing.

- **Q5. NestJS OpenAPI style.** `@nestjs/swagger` with DTO classes, or zod schemas via
  `nestjs-zod`. Zod keeps schemas closer to the rest of the TS code.

- **Q6. Auth.** Better Auth inside the API, issuing JWTs verifiable by any language via
  JWKS? Confirm it works well with NestJS.

- **Q7. Payments.** Which providers first (Stripe, Paystack, M-Pesa)?

- **Q8. Scaffolding.** Template repo you copy and trim, or a CLI later? Recommendation:
  template first, CLI only after 2 or 3 projects show what repeats.

- **Q9. Which apps ship in v1.** web only, or also mobile (Expo), desktop (Tauri),
  admin, marketing, extension (WXT)?

- **Q10. UI kit.** Port the existing React Router 7 UI kit into `packages/ts/ui`, or start
  from shadcn/ui?

## 4. Current state of the skeleton

What exists today (verified working end to end against Postgres):

- `apps/web`: TanStack Start + Tailwind v4, notes page using the generated client
- `services/api`: **Hono** + zod-openapi, reference `notes` feature, JSON error shape
- `contracts/`: generated `openapi.json` and `@kit/api-client`
- `db/migrations` + `db/migrate.sh`
- `packages/ts`: `ui`, `db` (Drizzle), `config`; `auth`, `email`, `payments` are README
  plans only
- `packages/rust`, `go`, `python`: README with setup steps only
- Linting with **Biome**, tasks with **just**
- `AGENTS.md`, `CLAUDE.md`, recipes, decision records, `/new-feature` command

Gaps against the locked decisions: API is Hono not NestJS, linter is Biome not oxlint,
task runner pending Q1. Untested here: `just` recipes and Docker Compose.

## 5. Roadmap

### Phase 0: Finish fleshing out (current)
- [ ] Answer Q1 to Q10 and move each into "Locked"
- [ ] Update decision records in `docs/decisions` to match

### Phase 1: Align the skeleton with decisions
- [ ] Replace Hono API with NestJS (Drizzle module, OpenAPI per Q5, same JSON error shape)
- [ ] Keep the `notes` reference feature with framework-free service logic (Q2)
- [ ] Swap Biome for oxlint + chosen formatter (Q4)
- [ ] Switch task runner if Q1 says so
- [ ] Verify `just check` (or equivalent) and Docker Compose locally
- [ ] Update `AGENTS.md`, recipes and `services/api/AGENTS.md` for NestJS

### Phase 2: Core modules (one at a time, each with a test)
- [ ] Auth (Q6), including JWKS for other languages
- [ ] Email
- [ ] Payments (Q7)
- [ ] UI kit (Q10)
- [ ] MongoDB option (Q3)

### Phase 3: More apps (only the ones Q9 picks)
- [ ] Mobile (Expo) using the generated client
- [ ] Desktop (Tauri)
- [ ] Admin / marketing / extension

### Phase 4: First real project
- [ ] Build idea management app 1 on the kit
- [ ] Feed back anything that repeated into the kit

### Later
- [ ] Hono adapter option
- [ ] First Rust, Go or Python service + shared package (via `docs/recipes/add-service.md`)
- [ ] Deployment adapters and CI
- [ ] Scaffolding CLI (Q8)

## 6. Change log
- 2026-11-12: Draft created. Skeleton built and verified. Locked NestJS, Drizzle,
  Postgres, oxlint. Mongo optional.
