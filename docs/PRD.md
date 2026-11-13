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
| Main API | **NestJS** | Only framework shipped. Hono/Express added per project when wanted |
| Business logic | **Framework-free core** | `packages/ts/core`, see rules below |
| Database | **Postgres only** | MongoDB dropped for now, may revisit later |
| ORM | **Drizzle** | |
| Contract | OpenAPI, generated from the API | Hey API for the TS client |
| Linter | **oxlint** | Replaces Biome. Type-aware rules via tsgolint |
| Formatter | **oxfmt** | Replaces Biome. Pre-1.0, see note below |
| Shared code layout | `packages/<language>/<name>` | |
| Schema source of truth | Plain SQL migrations in `db/migrations` | Postgres only |
| Toolchain versions | mise | |
| Task runner | **mise tasks** | Replaces `just`. One tool for versions and tasks |
| Local infra | Docker Compose | |
| Build process | **potato-eng** | See section 3a |

**Why oxlint + oxfmt over Biome** (checked Nov 2026: oxlint 1.93, oxfmt 0.78):
- oxlint covers far more ESLint rules (typescript, react, import, unicorn, jest ports) and
  has type-aware rules such as `no-floating-promises`, which matter in async NestJS code.
- oxfmt passes Prettier's JS/TS conformance tests, also formats Markdown, YAML, TOML and
  CSS, and sorts Tailwind classes without a plugin.
- Same Oxc/VoidZero ecosystem as Vite, which TanStack Start runs on.
- Cost: two tools instead of one, and oxfmt is still pre-1.0, so pin its version in mise
  and expect occasional config changes. Formatting is easy to redo, so the risk is low.
  Fallback if oxfmt causes trouble: Prettier.

**Framework-free core (Q2).** Business logic, zod schemas, database access and error
types live in `packages/ts/core`, shared by any JS/TS framework (NestJS, Hono, Express).
- No framework imports inside core: no decorators, no `Request`/`Context` objects.
- Dependencies are passed in (e.g. a `db` argument or plain constructor), not injected by
  the framework. NestJS wraps core in providers; Hono and Express call it directly.
- Per framework, only the thin adapter is written: routing, middleware/guards, error to
  HTTP mapping, OpenAPI generation.
- Only NestJS ships. A second adapter is added only when a real project wants it.

## 3a. potato-eng

This kit is built with potato-eng and doubles as its test bed.

- This PRD is the input. Run potato-eng's PRD review once the open questions are closed.
- The reviewed PRD becomes `docs/TASKS.md`, worked one task per fresh session.
- Anything awkward about potato-eng found while building the kit goes in
  `docs/potato-eng-notes.md`, to feed back into potato-eng itself.
- Later: the kit can ship potato-eng config so every project made from it uses the same
  loop.

### Open questions

Resolved: Q1 (mise tasks), Q2 (framework-free core), Q3 (Postgres only), Q4 (oxlint + oxfmt).

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

Gaps against the locked decisions: API is Hono not NestJS, Biome instead of
oxlint + oxfmt, `just` instead of mise tasks. Untested here: `just` recipes and Docker Compose.

## 5. Roadmap

### Phase 0: Finish fleshing out (current)
- [x] Q1 task runner, Q2 shared logic, Q3 database, Q4 linter/formatter
- [ ] Answer Q5 to Q10 and move each into "Locked"
- [ ] Update decision records in `docs/decisions` to match
- [ ] Run potato-eng PRD review, then generate `docs/TASKS.md`

### Phase 1: Align the skeleton with decisions
- [ ] Replace Hono API with NestJS (Drizzle module, OpenAPI per Q5, same JSON error shape)
- [ ] Create `packages/ts/core` and move the `notes` logic and schemas there (Q2)
- [ ] NestJS `notes` controller as a thin adapter over core
- [ ] Swap Biome for oxlint (type-aware) + oxfmt, versions pinned in mise
- [ ] Replace `justfile` with mise tasks in `mise.toml`
- [ ] Verify `mise run check` and Docker Compose locally
- [ ] Update `AGENTS.md`, recipes and `services/api/AGENTS.md` for NestJS

### Phase 2: Core modules (one at a time, each with a test)
- [ ] Auth (Q6), including JWKS for other languages
- [ ] Email
- [ ] Payments (Q7)
- [ ] UI kit (Q10)

### Phase 3: More apps (only the ones Q9 picks)
- [ ] Mobile (Expo) using the generated client
- [ ] Desktop (Tauri)
- [ ] Admin / marketing / extension

### Phase 4: First real project
- [ ] Build idea management app 1 on the kit
- [ ] Feed back anything that repeated into the kit

### Later
- [ ] Hono adapter option
- [ ] Revisit MongoDB if a project needs it (Drizzle does not support it)
- [ ] First Rust, Go or Python service + shared package (via `docs/recipes/add-service.md`)
- [ ] Deployment adapters and CI
- [ ] Scaffolding CLI (Q8)

## 6. Change log
- 2026-11-12: Draft created. Skeleton built and verified. Locked NestJS, Drizzle,
  Postgres, oxlint. Mongo optional.
- 2026-11-12: Locked mise tasks, Postgres only (Mongo dropped for now), oxlint + oxfmt.
  Added potato-eng as the build process.
- 2026-11-13: Locked Q2: framework-free `packages/ts/core`, NestJS only adapter shipped.
