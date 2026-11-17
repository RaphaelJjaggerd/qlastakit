# qlastakit v1: PRD

**Status:** draft from the design grill of 2026-11-15. Not yet through potato-eng's
PRD review. Do not build product features until Phase 0 is done.
**Scope:** the kit only. The CLI, GUI and Qlastabase are in `docs/VISION.md` and each
gets its own PRD later.

## 1. What this is

qlastakit is the monorepo every project starts from, so no project starts from scratch.
It handles UI, auth, payments, email, storage, jobs, AI plumbing and deployment. The
developer (human or AI agent) writes only the idea and its business logic.

- **Audience for v1:** Raphael only. Private repo, opinionated, no docs site.
- **How projects use it:** copy the repo, rename, delete what is not needed. No CLI yet.
- **v1 is done when:** the first idea management app is built on the kit and deployed
  to production. Nothing counts as finished until it survives that app.

## 2. Principles

1. **KISS.** A module is built only when a real project needs it. No empty abstractions.
2. **Contract-first seams.** Apps reach services only through a client generated from
   OpenAPI. No TypeScript-only coupling between apps and services.
3. **Framework-free core.** Business logic, zod schemas and data access live in
   `packages/ts/core` with no framework imports. HTTP frameworks are thin adapters.
4. **Shared code grouped by language:** `packages/ts`, `rust`, `go`, `python`.
5. **Prove, then extract.** Anything new is built inside a real app first and moves
   into the kit only when a second use appears.
6. **AI-friendly.** `AGENTS.md`, recipes, decision records, one reference feature.
7. **Stand on existing kits.** supastarter and SaasRock are reading material (see
   `docs/REFERENCES.md`). Agents study how they solved a module before building ours,
   then write qlastakit's own implementation.

## 3. Locked decisions

### Foundation

| Area | Choice | Notes |
|---|---|---|
| Repo | One `qlastakit` repo | Engine and CLI join this repo later. Qlastabase is separate |
| Runtime | Current Node LTS + pnpm workspaces | Pinned in mise |
| Build orchestration | Turborepo | TS tasks only |
| Versions and tasks | mise | Replaces `just` |
| Lint and format | oxlint (type-aware) + oxfmt | oxfmt is pre-1.0: pin it. Fallback: Prettier |
| Package scope | `@qlastakit/*` | Same scope in every project made from the kit |
| Git flow | Branch per phase, one PR at the phase gate | CI runs on the PR |
| Build process | potato-eng, tier `full` | Friction logged in `docs/potato-eng-notes.md` |

### Backend

| Area | Choice | Notes |
|---|---|---|
| API | NestJS | Only framework shipped. Hono/Express adapters only when a project wants one |
| Business logic | `packages/ts/core` | No decorators, no request objects. Dependencies passed in |
| Contract | OpenAPI from `nestjs-zod` | Reuses the zod schemas in core. Hey API generates the TS client |
| Database | Postgres only | MongoDB dropped. Revisit only if a project needs it |
| ORM | Drizzle | Mirrors the SQL. Never generates migrations |
| Schema source of truth | Plain SQL in `db/migrations` | Usable from any language |
| Background jobs | pg-boss | Queue lives in Postgres. No Redis |
| Redis | Not in v1 | Sessions and rate limits in Postgres. Optional module later |
| Logs | pino, structured JSON with request IDs | |

### Accounts

| Area | Choice | Notes |
|---|---|---|
| Auth | Better Auth | NestJS adapter is community-maintained (one maintainer). Small enough to own if abandoned |
| Login methods | Email + password, Google | With email verification and password reset |
| Tenancy | Organizations from v1 | Better Auth organization plugin |
| Personal org | Every new user gets one automatically | Every row belongs to an org. One code path |
| Data isolation | Scoped queries in core | Every table has `org_id`. Core functions take an org context. No RLS |
| Org admin | Routes inside the web app | Members, invites, roles, billing |
| Super admin | Separate app, separate deploy (later phase) | Platform owner only: bans, moderation, site settings, SEO. Shares the API and database, so it survives a web outage, not an API outage |

### Modules

| Module | Choice | In v1? |
|---|---|---|
| Email | Resend + React Email behind one `sendEmail` | Yes |
| Payments interface | One provider-agnostic interface with adapters | Yes |
| Payments: Stripe | First adapter (existing account, international customers) | Yes |
| Payments: Paystack | Local cards and M-Pesa. Subscriptions renew on cards only | Next phase |
| Payments: Polar | Merchant of record | Next phase. Confirm payout route first |
| Billing models | Subscriptions + one-time | Yes |
| Usage credits | Ledger of grants and spends | Later. Data model leaves room |
| File storage | S3 API, signed-URL uploads. R2 in production, MinIO locally | Yes |
| AI | Vercel AI SDK, provider set by env, streaming. Tested against OpenRouter | Yes |
| i18n | All UI text through message files from day one. English only shipped | Yes |
| Analytics | PostHog as an opt-in module | Later |

### Frontend

| Area | Choice | Notes |
|---|---|---|
| Web app | TanStack Start + Tailwind v4 | The only app in v1 |
| UI package | Raphael's existing "Tactile" kit moved into `@qlastakit/ui` | It is already shadcn (base-vega style, Base UI primitives, Tailwind v4, CSS variables). See section 6a |
| Theming | Multi-theme by design, one theme shipped | Every color, shadow, border, surface and effect comes from a semantic token. A theme is a set of token values under `[data-theme="name"]`. v1 ships only the default look. More themes and a theme editor come later, named and designed by Raphael |
| Data layer | TanStack Query + generated client | Same pattern reused by Expo later |
| Home page in v1 | A plain route in the web app | Until the marketing site exists |
| Mobile (later) | Expo. Shares client, schemas, query hooks, tokens. Not UI | |
| Marketing (later) | Separate Astro site | |
| Desktop (later) | Tauri wrapping the web app | First Rust in the repo |

### Operations

| Area | Choice | Notes |
|---|---|---|
| Packaging | A Dockerfile per app and service | Runs anywhere. The unit Qlastabase hosts later |
| Reference deploy | One VPS running Coolify | Git push deploys, SSL |
| Production Postgres | Same VPS, in Docker | Scheduled backups to R2. Restore must be rehearsed once |
| Testing | Vitest for core, API tests on a real Postgres, one Playwright smoke test | Smoke: sign up, log in, create something |
| CI | GitHub Actions | Lint, typecheck, tests, contract-drift check |
| Errors | Sentry (web and API) | |

### Defaults assumed without asking (veto any)

UUID primary keys. Env vars validated with zod at boot. Rate limiting on auth routes.
Security headers and a CORS allowlist. API docs UI served at `/docs`. Light and dark
theme via CSS variables. No websockets in v1 (SSE for AI streaming only). One JSON
error shape: `{ error: { code, message } }`, with codes (not text) so clients can
translate them.

## 4. Open questions (settle in `/grill`)

- **Q1. i18n library.** Recommendation: i18next. The existing UI kit already uses it and
  it runs in Expo. Confirm, then lock.
- **Q2. Polar.** Does it pay out to the entity that will own the account? Verify on
  polar.sh before the Polar phase is scheduled.
- **Q3. Tokens for other languages.** Better Auth JWT + JWKS plugin so Rust/Go/Python
  services can verify logins. Cookie sessions for web, bearer tokens for mobile.
- **Q4. VPS provider and region.** Latency for Kenyan users against price.
- **Q5. Kit updates.** How do fixes in the kit reach projects already copied from it?
  Manual for now. Known gap until the CLI exists.
- **Q6. First idea app.** Its name, scope and its own PRD. Needs from the kit are
  already known: auth, orgs, email, payments, uploads, AI.
- **Q7. Domains.** App domain, email sending domain, DNS host.

## 5. Not in v1

Mobile, marketing site, super admin app, desktop, Paystack, Polar, credits, analytics,
Redis, a second API framework, any non-TS service, the engine/CLI, Qlastabase.
All of these are ordered in section 7 or `docs/VISION.md`.

Built inside the first idea app, not the kit (extract only on second use): the rich
notes editor and Postgres full-text search.

## 6. Current state of the skeleton

Verified working end to end against Postgres (install, typecheck, lint, contract
generation, create and list a note through web, client, API, database):

- `apps/web`: TanStack Start + Tailwind v4, notes page on the generated client
- `services/api`: **Hono** + zod-openapi, reference `notes` feature
- `contracts/`: generated `openapi.json` and `@qlastakit/api-client`
- `db/migrations` + `db/migrate.sh`
- `packages/ts`: `ui`, `db`, `config`. `auth`, `email`, `payments` are README plans
- `packages/rust`, `go`, `python`: README setup steps only
- Biome for lint, `just` for tasks
- `AGENTS.md`, recipes, decision records, `/new-feature` command

Gaps against section 3: Hono not NestJS, no `core` package, Biome not oxlint + oxfmt,
`just` not mise tasks, no TanStack Query, no tests, no CI. Never run here: the `just`
recipes and Docker Compose.

## 6a. The existing UI kit (audited 2026-11-17)

Source: the `react-starter-nue` project (React Router 7, Vite, mock API).

- **Already shadcn.** shadcn CLI v4, style `base-vega`, Base UI primitives, Tailwind v4,
  zinc base, Tabler icons, RTL enabled. No conversion needed.
- **24 UI components**, none of which import React Router. They move as they are.
- **"Tactile" design language** on top of the shadcn tokens: about 30 extra tokens
  (raised and recessed shadow scales, surfaces, glow, etched lines, success, warning).
  Partly documented in its `docs/ui-spec.md`. Some of it still lives in a
  `tactile.ts` helper instead of inside the components.
- **Layouts:** 6 app shells (collapsible, floating, frameless and stacked sidebars, top
  bar, blank) and 4 auth layouts.
- **Screens:** sign in, sign up, forgot and reset password, OTP, settings (profile,
  security, notifications, billing, integrations), roles and permissions, access denied.
- **Needs rewriting (about 20 files):** routing, route guards and navigation use
  React Router. Auth is a mock (axios + zustand store).
- **i18n:** already uses i18next with one `en.json`.
- **Loose ends:** both Lucide and Tabler icons are installed; Activity Log and Pricing
  pages are stubs.

The design system (tokens, component inventory, rules) is being finalized in a separate
design session. Its outputs land in `@qlastakit/ui`: `theme.css`, a component inventory
and `DESIGN.md`.

## 7. Roadmap

### Phase 0: Align the skeleton
- [ ] `/potato-eng setup`, tier full
- [ ] Unpack the reference kits into `references/` (see `docs/REFERENCES.md`)
- [ ] Close section 4 with `/grill`, then `/prd`, `scripts/prd-review.sh`, `/tasks`
- [ ] Create `packages/ts/core`. Move `notes` logic and zod schemas into it
- [ ] Replace the Hono API with NestJS + `nestjs-zod`. `notes` controller as a thin adapter
- [ ] Swap Biome for oxlint + oxfmt. Replace `justfile` with mise tasks
- [ ] Add TanStack Query to the web app
- [ ] Test harness: Vitest, API tests on real Postgres, Playwright smoke
- [ ] GitHub Actions workflow with the contract-drift check
- [ ] Verify `mise run check` and Docker Compose locally
- [ ] Update `AGENTS.md`, recipes and decision records to match

### Phase 1: Accounts
Reference first: supastarter `packages/auth`, `packages/mail`, organizations routes and UI.
- [ ] Move the 24 Tactile components and `theme.css` into `@qlastakit/ui` (after the design session signs off)
- [ ] No hardcoded shadows, borders or surfaces left in components (the current kit hardcodes shadows). Proven by a throwaway test theme that changes the whole look without editing a component file
- [ ] Pick one default app shell and one auth layout for v1. Other variants move only when used
- [ ] Rewrite routing, guards and navigation for TanStack Router
- [ ] Rebuild auth and settings screens on Better Auth and the generated client (drop the mock API and auth store)
- [ ] i18n wiring (Q1). All shell text through message files
- [ ] Email module (Resend + React Email)
- [ ] Better Auth: email + password, Google, verification, reset
- [ ] Organizations: personal org on signup, members, invites, roles, org switcher
- [ ] Org context in core. `org_id` on every table. A test proving one org cannot read another's rows
- [ ] `notes` reference feature made org-scoped

### Phase 2: Modules the first app needs
Reference first: supastarter `packages/payments`, `packages/storage`, `packages/ai`.
- [ ] pg-boss jobs: email sending and webhook processing run through it
- [ ] File storage: signed-URL upload flow, MinIO in Compose
- [ ] Payments interface + Stripe adapter: subscriptions, one-time, webhooks, org billing page
- [ ] AI module: AI SDK, OpenRouter, a streaming endpoint and a web hook to consume it

### Phase 3: Ship it
- [ ] Dockerfile per app and service
- [ ] Coolify reference deploy, documented as a recipe
- [ ] Postgres backups to R2 and one rehearsed restore
- [ ] Sentry in web and API

### Phase 4: First idea app (its own repo and PRD)
- [ ] Copy the kit, build the app with potato-eng, deploy it
- [ ] Retro: every "wish the kit had X" becomes a kit task or is rejected
- [ ] Tag qlastakit v1.0

### After v1 (in this order unless a project forces another)
1. Paystack adapter
2. Polar adapter
3. Usage credits
4. Mobile app (Expo)
5. Marketing site (Astro)
6. Super admin app
7. Desktop (Tauri)
8. Analytics module
9. More themes, then a theme editor (saves token values per user or org)
10. Engine + CLI (own PRD, see `docs/VISION.md`)

## 8. Change log
- 2026-11-12: First draft. Skeleton built and verified.
- 2026-11-13: Framework-free core locked.
- 2026-11-15: Renamed to qlastakit, scope `@qlastakit/*`. Full design grill: scope, apps,
  auth and orgs, payments, storage, jobs, AI, i18n, hosting, testing, CI, monitoring.
  Roadmap rewritten into phases 0 to 4.
- 2026-11-17: Added supastarter and SaasRock as read-only references with a module map.
  Audited the existing UI kit: already shadcn, so it becomes `@qlastakit/ui` directly.
  Theming: token-driven and multi-theme capable, only the default look ships in v1.
