# qlastakit v1: PRD

**Status:** v2, written 2026-11-18 from the brief (grill closed 2026-11-17), the
glossary and ADRs 0001-0003. Not yet through PRD review.
**Scope:** the kit only. The idea app, the engine, the CLI and Qlastabase each get their
own PRD (see the vision doc).

## 1. Vision

qlastakit is the monorepo every project starts from, so no project starts from scratch.
It handles UI, auth, orgs, payments, email, storage, jobs, AI plumbing and deployment.
A developer (human or AI agent) working in a project writes only the idea and its
business logic.

**Who it is for, in order**

1. The owner, starting a new project by copying the kit.
2. AI agents working inside a project copied from the kit.
3. Later, not v1: users of the CLI and of Qlastabase.

**Principles**

1. **KISS.** A module is built only when the kit proof (below) needs it. No empty
   abstractions, no machinery for a case v1 does not have.
2. **Contract-first seams.** Apps reach services only through a client generated from
   OpenAPI. No TypeScript-only coupling between apps and services.
3. **Framework-free core.** Business logic, zod schemas and data access live in the
   core package with no framework imports. HTTP frameworks are thin adapters. This also
   keeps the Light shape possible later.
4. **Prove, then extract.** Product features are built in a project first and enter the
   kit only when a second project needs them.
5. **AI-friendly.** Agent guides, recipes, ADRs and one reference feature are part of the
   product, not side documentation.

**v1 is done when** every item below works on the live reference deploy. Then tag v1.0.
Each one is checked by a test, or by the owner with a dated sign-off.

1. Sign up with email and password, receive the verification email from the sending
   subdomain, verify, sign in, sign out, reset the password.
2. Sign in with Google.
3. A personal org exists right after signup. Create a second org, invite a member by
   email, the invitee joins, switch between orgs. Roles are enforced by the API.
4. Billing in Stripe test mode: checkout with a test card for Pro, see the subscription,
   switch monthly to yearly and cancel in the customer portal, buy the one-time product.
5. Upload an avatar and an org logo in settings, and see them displayed.
6. The AI chat demo page streams a reply, and the daily cap stops a user at the limit.
7. The auth email caps hold (API test).
8. One org cannot read another org's rows (API test).
9. The Playwright smoke test passes against the reference deploy. Verify and CI are green.
10. A database backup has been restored once.

**Non-goals for v1**

- Any idea-app or product feature. The idea app is never built in this repo. No task
  may contain idea-app features.
- Mobile, marketing site, super admin app, desktop, Paystack, Polar, usage credits,
  analytics, Redis, a second API framework, any non-TS service, the engine and CLI,
  Qlastabase, the Light shape.
- A docs site or public audience. The repo is private and opinionated.

## 2. Locked decisions

Settled means settled. A task that finds one wrong sets its card `blocked` and raises
it; it never works around it.

### 2.1 Foundation

| Decision | Choice | Why |
|---|---|---|
| Repo | One qlastakit repo, kit only | The engine and CLI join it later. Projects, the idea app included, live in their own repos |
| Runtime | Current Node LTS, pnpm workspaces | Pinned by mise |
| Build orchestration | Turborepo, TS tasks only | Already in the skeleton |
| Versions and tasks | mise | One tool for toolchains and tasks. Replaces `just` |
| Lint and format | oxlint (type-aware) + oxfmt, oxfmt pinned | Fast. oxfmt is pre-1.0; fallback is Prettier |
| Package scope | `@qlastakit/*` in every project | Projects copy the kit without renaming packages |
| Shared packages | Grouped by language | A package is only importable from its own language (ADR 0003) |
| Git flow | Branch per phase, one PR at the phase gate, CI on the PR | One review point per phase |
| Build process | potato-eng, tier full | Friction goes to the potato-eng notes |
| Kit updates | Manual in v1. Each project records the kit commit it was copied from as one line in its agent guide | The minimum that makes a later diff or CLI possible |
| Branding | The kit carries no company brand | Every project gets its own |
| Domains | Live only in env vars and deploy settings, never in code or docs, not even as examples. Subdomains only, never the bare domain | Nothing in the kit may assume it is the only project |

### 2.2 Backend

| Decision | Choice | Why |
|---|---|---|
| API | NestJS, the only framework shipped | Structure for a growing API. Other adapters only when a project asks |
| Business logic | Core package: no decorators, no request objects, dependencies passed in | Testable, and core never assumes it runs inside NestJS |
| Contract | OpenAPI from nestjs-zod, reusing core's zod schemas. Hey API generates the TS client | Language-agnostic seams (ADR 0001) |
| Database | Postgres only | One database to run, back up and reason about |
| ORM | Drizzle, mirrors the SQL, never generates migrations | ADR 0002 |
| Schema source of truth | Plain SQL migrations | Usable from any language (ADR 0002) |
| Background jobs | pg-boss | The queue lives in Postgres |
| Redis | None in v1 | Sessions, rate limits, counters and the queue all live in Postgres |
| Logs | pino, structured JSON, request IDs | One log shape everywhere |
| Error shape | One JSON shape, `error` with `code` and `message`. Codes, not text | Clients translate codes |
| Defaults | UUID primary keys. Env vars validated with zod at boot. Security headers and a CORS allowlist. API docs UI at `/docs`. No websockets; SSE for AI streaming only | Assumed in the design grill, never vetoed |

### 2.3 Accounts

| Decision | Choice | Why |
|---|---|---|
| Auth | Better Auth | The NestJS adapter is community-maintained by one person; small enough to own if abandoned |
| Login methods | Email + password, Google. Email verification and password reset | What every SaaS needs first |
| Sessions | Cookie sessions only | JWT/JWKS and bearer tokens wait for the first non-TS service or the Expo app |
| Tenancy | Organizations from v1, via the Better Auth organization plugin | Adding tenancy later rewrites every query |
| Personal org | Every new user gets one automatically | Every row belongs to an org: one code path |
| Data isolation | Every product table has an org id. Core functions take an org context. No RLS. Better Auth's own tables are exempt | Isolation is visible in code and testable |
| Roles | Owner, admin, member | Tenancy is by org, not by global role |
| Org admin | Routes inside the web app: members, invites, roles, billing | No second app for it in v1 |
| Signup on the reference deploy | Open. No invitation-only switch in v1 | Harm is capped by the auth rate limits, Stripe test mode and the AI cap |
| Auth rate limits | Rate limiting on every auth route | Default |
| Auth email caps | Per email address: at most 3 verification and 3 reset emails per hour, counted per type. Per IP: at most 10 auth emails per hour, any type. Env vars with these defaults. Counters in Postgres | The public deploy must not spam people from the sending subdomain |
| Cap behaviour | Address cap hit: the normal success response, and the suppressed send is logged. IP cap hit: 429 with code `rate_limited` | No account enumeration |
| Super admin | Separate app, after v1 | Platform owner only. Not needed to prove the kit |

### 2.4 Modules

| Decision | Choice | Why |
|---|---|---|
| Email | One `sendEmail`, React Email templates, two adapters: `console` and `resend` | Local dev and tests need no account |
| Adapter choice | `console` is the default in local dev and tests. `resend` in deploys | |
| Console output | Prints one line (to, subject, every link) and saves the full email as HTML in a gitignored folder | Humans open it in a browser; tests read the newest file |
| Console in production | The API refuses to boot in production with the `console` adapter | Otherwise verification and reset emails vanish without an error |
| Payments | One provider-agnostic interface with adapters. Stripe is the first | Existing account, international customers |
| Billing models | Subscriptions and one-time purchases, owned by an org | Both are needed by most projects |
| Plans | Free, Pro (monthly and yearly), one one-time purchase. Plans in a typed config file, Stripe price IDs in env vars | Smallest set covering both models, upgrade, downgrade and the interval switch |
| Stripe on the reference deploy | Test mode | Proves the same code paths without charging strangers. Live keys are a per-project setting |
| Paystack, Polar | After v1 | Polar's payout to the owning entity is unconfirmed; it is a hands-on precondition on the first Polar task |
| Usage credits | After v1. The data model leaves room | No v1 proof needs them |
| File storage | S3 API, signed-URL uploads. R2 in production, MinIO locally | One API everywhere |
| Avatar and org logo | PNG, JPEG or WebP, at most 2 MB, no server-side resizing. Signed-URL upload, public-URL read | Avatars are not secret. Least code that meets the proof |
| AI | Vercel AI SDK, provider set by env, SSE streaming, tested against OpenRouter | Provider-neutral |
| AI chat demo | No saved chats. Signed-in users only. A per-user daily message cap set by env. A cheap model by default | Saved chats are product work. The cap protects the owner's bill |
| i18n | i18next + react-i18next. All UI text through message files from day one. English only shipped | The UI kit already uses it and it runs in Expo later |
| Analytics | PostHog as an opt-in module, after v1 | |

### 2.5 Frontend

| Decision | Choice | Why |
|---|---|---|
| Web app | TanStack Start + Tailwind v4, the only app in v1 | |
| UI package | The owner's existing UI kit moved into the UI package as it is | It is already shadcn (base-vega style, Base UI primitives, Tailwind v4, CSS variables) |
| Theming | Multi-theme by design, one theme shipped: Tactile | Every color, shadow, border, surface and effect comes from a semantic token. More themes and a theme editor come later |
| UI architecture | The UI kit's config-driven philosophy is kept. Only the changes in section 3.4 are allowed | It works. The port is a rewrite onto TanStack, not a redesign |
| Data layer | TanStack Query + the generated client | Same pattern reused by Expo later |
| Demo-only screens | Only the AI chat page, under a `/demo/` route prefix. Projects delete `/demo/*` | Every other screen is a project's real shell |
| Home page | A plain route in the web app | Until a marketing site exists |
| Mobile, marketing, desktop | After v1: Expo, Astro, Tauri | |

### 2.6 Operations

| Decision | Choice | Why |
|---|---|---|
| Packaging | A Dockerfile per app and service | Runs anywhere. The unit Qlastabase hosts later |
| Reference deploy | One VPS running Coolify, on a subdomain. Git push deploys, SSL | Cheap, and close to what Qlastabase will wrap |
| VPS provider | Chosen in Phase 4 by measured latency from Nairobi to three candidates: a Nairobi provider, a Johannesburg region, Hetzner EU. The cheapest one that is fast enough wins | Docker and Coolify make the host easy to change; measure, don't guess |
| DNS | Cloudflare | R2 lives there too: DNS, storage and SSL in one account |
| Production Postgres | Same VPS, in Docker. Scheduled backups to R2. A restore is rehearsed once | |
| Testing | Vitest for core, API tests on a real Postgres, one Playwright smoke test | See section 6 |
| CI | GitHub Actions: lint, typecheck, tests, contract-drift check | |
| Errors | Sentry in web and API | |

## 3. Architecture

### 3.1 Shapes

Every task builds from these. A new shape needs an ADR first.

| Shape | What it is | Rules |
|---|---|---|
| Migration | One plain SQL file, numbered | Never edit an applied one. Every product table has an org id, a UUID key and timestamps |
| Schema mirror | Drizzle tables matching the SQL | Updated in the same task as the migration. Never generates SQL |
| Core function | A plain function in the core package: validates input with a zod schema, does the work, returns data | No framework imports. Takes its dependencies (db, clock, adapters) and an org context as arguments. Throws coded errors |
| Zod schema | Input and output shapes in core | The single source for validation, the OpenAPI spec and the generated client |
| Controller | A NestJS controller in the API | Parses the request, builds the org context, calls one core function, maps its result. No business logic, no direct database access |
| Module adapter | One implementation of a module interface (email, payments, storage, AI) | Selected by env at boot. The interface lives in core; adapters hold only provider calls |
| Job | A pg-boss job handler | Calls core. Idempotent, because a job may run twice. Webhooks and email sending run as jobs |
| Web route | One file per route | Thin. Declares key, authority and page chrome in its static data. Access checks run before render. Calls a feature |
| Web feature | A folder of components and query hooks for one feature | Talks to the API only through the generated client and TanStack Query |
| Config | App, navigation and theme config in the web app | The control panel: product work is "add a page, register it" |

### 3.2 Where state lives

| State | Lives in |
|---|---|
| All product data, sessions, rate-limit and cap counters, the job queue | Postgres |
| Files (avatars, logos) | R2 in production, MinIO locally |
| Who is signed in | An httpOnly session cookie set by Better Auth |
| Server data in the browser | The TanStack Query cache |
| Current route, current layout | Derived from the matched route, never copied into a store |
| Theme | An attribute on the document root, token values in CSS |
| Secrets, domains, price IDs, caps, model names | Env vars, validated at boot |

### 3.3 How parts talk

- **Web to API:** the generated client over HTTP, wrapped in TanStack Query hooks. Never
  hand-written fetch. Never an import of server code.
- **Auth:** Better Auth's endpoints are mounted in the API. How the web app calls them
  is open question OQ1.
- **API to core:** a controller calls one core function with an org context.
- **Provider to API:** Stripe webhooks land on the API, are verified, and are queued as
  pg-boss jobs that call core.
- **Email:** core asks for an email through `sendEmail`; in deploys the send runs as a
  job.
- **AI:** the API streams the model's reply to the browser over SSE.

### 3.4 UI architecture: kept and changed

The UI kit today (audited 2026-11-17): a React Router 7 + Vite project with a mock API.
24 UI components, none importing React Router. About 30 Tactile tokens on top of the
shadcn ones (raised and recessed shadows, surfaces, glow, etched lines, success,
warning), some still applied by a helper outside the components. 6 app shells, 4 auth
layouts. Screens: sign in, sign up, forgot and reset password, OTP, settings (profile,
security, notifications, billing, integrations), roles and permissions, access denied.
About 20 files depend on React Router or the mock auth.

**Kept as designed**

- Config is the control panel: app, navigation and theme config are where product work
  is wired.
- One navigation tree drives every nav surface, with key, translate key, icon key and
  authority per item.
- Thin pages; real work lives in features.
- Layout comes from config, and a single route can override it.
- Page chrome (header, footer, container type, background) is declared by the route and
  rendered by one page container.
- Access is declared per route by authority, plus an authority check for conditional UI.
- Prime directives: be additive, reuse the building blocks, never hardcode colours or
  shadows, keep it typed. They move into the web app's agent guide with the recipes.

**Changed, with the reason**

| UI kit today | In qlastakit | Why |
|---|---|---|
| A central routes array with lazy imports | One file per route. Key, authority and meta live in that route's static data | TanStack Router is file-based. A parallel array loses typed links and params. Adding a page drops to two steps |
| Guard components that redirect after render | Checks in the route's before-load step | Runs before render, on the server too. Protected content never flashes |
| Layout switched by an effect writing to a store | Layout derived during render from the matched route, else the config default | No wrong-layout frame, no store |
| Current route key kept in a store | Read from the matched route | Nothing to keep in sync |
| Auth store, token strategy, axios, mock API | Better Auth session, generated client, TanStack Query | A real backend. The session is an httpOnly cookie |
| Admin and user roles | Org roles: owner, admin, member | Tenancy is by org |
| An app config with flags for features that do not exist | Only flags the kit implements. Flags that restrict behaviour are enforced by the API too | A flag checked only in the browser is cosmetic |
| Fourteen path aliases | One app alias plus package imports | Most shared code moves into packages |
| Titles as plain strings | Translation keys | i18n from v1 |

Check current TanStack Router docs for static data and before-load before building.

### 3.5 Do not port

Known defects in the references. Each one is avoided by a named task and proven by a
named check.

| Reference | Defect | Avoided in | Proven by |
|---|---|---|---|
| supastarter | Business logic inside API route handlers | 0.4 and every API task | Verify check: controllers never import the database package |
| supastarter | Prisma schema and generated migrations | 0.3 | Verify check: no Prisma dependency; migrations are hand-written SQL |
| supastarter | Library calls from early 2025 (Better Auth 1.1, AI SDK 4, Tailwind 3) | 2.3, 3.5 | Task log cites the current docs used; typecheck against current versions |
| supastarter | Redis for rate limits | 2.4 | No Redis dependency; cap tests run on Postgres only |
| saasrock | 129-model structure, entity builder, hand-rolled auth | Not used in v1 | No v1 task names saasrock |
| ui-kit | Route guards that redirect after render | 1.5 | Test: a protected route never renders its content without a session |
| ui-kit | Layout chosen by an effect writing to a store | 1.5 | No layout store; test: the first render already has the right layout |
| ui-kit | Shadows applied by a helper outside the components | 1.4 | Verify token-purity check, plus the throwaway test theme |
| ui-kit | Two icon sets installed | 1.2 | Verify check: one icon dependency |
| ui-kit | Mock API, axios, zustand auth store | 2.3 | Verify check: no axios or zustand in the web app |
| ui-kit | Config flags for features that do not exist | 1.5 | Review against section 3.4 |
| ui-kit | Fourteen path aliases | 1.2 | One alias in the web app's TS config |
| ui-kit | Plain-string titles | 1.6 | Pseudo-locale test |
| ui-kit | Stub pages (activity log, pricing) | 1.2 | Not moved. Pricing is rebuilt in 3.3 |

## 4. Layout

Target layout after Phase 0. Folder names only; files change too often to list.

```
apps/
  web/                 TanStack Start web app (the only app in v1)
services/
  api/                 NestJS API: controllers, module wiring, Better Auth mount
packages/
  ts/
    core/              business logic, zod schemas, module interfaces, org context
    db/                Drizzle mirror of the SQL schema
    ui/                UI components, theme tokens, design rules
    config/            shared TS config
    email/             React Email templates
  rust/ go/ python/    empty until a non-TS service exists
contracts/
  openapi.json         generated, never edited by hand
  clients/ts/          generated TS client
db/
  migrations/          plain SQL, the schema source of truth
infra/                 Docker Compose: Postgres, MinIO
docs/                  PRD, vision, brief, tasks, standards, references, recipes, ADRs
scripts/               potato-eng loop and verify
```

**Reference rules**

- Apps import only the UI package, the generated client and shared config. Never core,
  db or anything from services.
- Core imports no framework: no NestJS, no TanStack, no React.
- The API imports core and db. Controllers import core only.
- A package is imported only by code in its own language.
- The kit's own docs and code never contain a real domain, brand or secret.

## 5. Tooling and rules

| Kind | Where | What |
|---|---|---|
| Checked by a tool | The verify script, run by every task and by CI | Typecheck. oxlint. oxfmt check. Tests. Contract drift (regenerate, fail if it changed). Added during v1: core has no framework imports (0.3); controllers never import db (0.4); one icon dependency and no axios or zustand in the web app (1.2, 2.3); token purity in UI components (1.4); every product table in a migration has an org id (2.7) |
| Judgement, checked at review | The standards doc | Smell baseline plus project standards added by phase gates |
| Convention | Agent guides and recipes | Recipe steps, naming, where a feature's files go |

A rule that review catches twice becomes a check (mechanical) or a standard (judgement)
at the next phase gate.

## 6. Testing

| What | Kind | Where it runs |
|---|---|---|
| Core functions | Vitest unit tests, dependencies passed in as fakes | Verify, CI |
| API endpoints | Vitest API tests against a real Postgres in Docker; each test gets a clean database state | Verify, CI |
| Org isolation | An API test proving one org cannot read another's rows, for every org-scoped feature | Verify, CI |
| Auth email caps, AI cap, upload limits | API tests | Verify, CI |
| Webhooks | API tests with signed Stripe event fixtures | Verify, CI |
| The whole kit | One Playwright smoke test: sign up, read the verification link from the console email, verify, sign in, create a note | Locally after the first runtime task, CI, and against the reference deploy at the end |
| UI theming | A throwaway test theme that changes the whole look with no component edit | Once in 1.4, then the token-purity check guards it |
| i18n | A pseudo-locale test proving every shell string comes from message files | 1.6, then CI |

CI runs on every phase PR: lint, typecheck, tests with a Postgres service, the
contract-drift check and the smoke test.

## 7. Implementation plan

Each task is one vertical slice for one fresh session. "Read" lists the PRD sections to
read. **Runtime** marks a criterion proven by running the thing. **Precondition
(human)** marks a step only the owner can do; the task waits for the owner's dated
sign-off. A task with **Ref** follows that reference's mode, and the reference is vetted
before its first use.

### Phase 0: Align the skeleton

Starting point: the skeleton works end to end (web, client, API, database) on Hono,
Biome and `just`, with a notes feature. No core package, no TanStack Query, no tests, no
CI. Docker Compose and the `just` recipes have never been run.

- **0.1 mise and oxc.** Replace `just` with mise tasks and Biome with oxlint + oxfmt
  (pinned). Read §2.1, §5. Done: `mise run check` passes, no Biome config or justfile
  remains, verify passes.
- **0.2 Test harness.** Vitest across the workspace and a root test script. Read §6.
  Done: verify runs tests (no longer skipped) with at least one passing test.
- **0.3 Core package.** Move notes logic and its zod schemas into core, with unit tests.
  Read §2.2, §3.1, §4. Done: notes core tests pass; verify fails if core imports a
  framework.
- **0.4 NestJS API.** Replace Hono with NestJS + nestjs-zod; notes controller as a thin
  adapter. Read §2.2, §3.1, §3.3. Done: API tests create and list notes on real Postgres;
  the regenerated client keeps the same notes operations; verify fails if a controller
  imports db. Runtime: the API boots and serves the spec and `/docs`.
- **0.5 API baseline.** Env validation at boot, the error shape, security headers, CORS
  allowlist, pino logs with request IDs. Read §2.2. Done: API tests prove each one,
  including a refused boot on a bad env.
- **0.6 TanStack Query.** The web notes page uses the generated client through query
  hooks. Read §2.5, §3.3. Done, runtime: create and list a note in the browser.
- **0.7 Compose and smoke.** Postgres and MinIO in Docker Compose; the Playwright smoke
  test (create a note for now) and a smoke script. Precondition (human): Docker Desktop
  installed and running. Read §6. Done, runtime: the smoke test passes against the
  Compose stack.
- **0.8 CI.** GitHub Actions runs the verify steps and the smoke test with a Postgres
  service. Read §6. Precondition (human): the owner pushes the phase branch and signs off
  that CI ran green. Done: the workflow runs the same checks as verify.
- **0.9 Docs match the code.** Agent guide, recipes and ADRs describe NestJS, core and
  mise. Read §3, §4, §5. Done: no doc mentions Hono, Biome or `just` except as history;
  the add-feature recipe's steps match the layout.
- **0.G Phase 0 gate.**

### Phase 1: UI kit in the web app

Ref: ui-kit (reuse).

- **1.1 Vet ui-kit.** Precondition (human): the owner unpacks the finished UI project
  into the references folder. Read §3.4, §3.5. Done: a vet report with keep, fix or
  reject per file.
- **1.2 Move the UI kit.** Tokens, components and design rules into the UI package; one
  icon set (OQ2); one app alias; stubs left behind. Read §2.5, §3.4, §3.5. Ref: ui-kit.
  Done: the web app builds on the UI package; verify fails on a second icon dependency.
- **1.3 Component preview.** A dev-only route rendering every component. Read §2.5.
  Done, runtime: it renders in dev and is absent from the production build.
- **1.4 Token purity.** No hardcoded color, shadow, border or surface in components.
  Read §2.5, §3.5. Done: verify's token-purity check passes; runtime: a throwaway test
  theme changes the whole preview page without editing a component.
- **1.5 Shell and routing.** One app shell and one auth layout (OQ3), config-driven
  navigation, access checks before render, layout derived from the route. The session
  is a stub behind an interface until 2.3. Read §3.1, §3.4, §3.5. Ref: ui-kit. Done:
  tests prove a protected route never renders without a session and the first render
  has the right layout.
- **1.6 i18n.** i18next wired; all shell text through message files. Read §2.4. Done: the
  pseudo-locale test passes.
- **1.7 Web agent guide.** Prime directives and the "add a page" recipe in the web app's
  agent guide. Read §3.4. Done: the recipe adds a page in two steps, as the reviewer
  confirms by following it.
- **1.G Phase 1 gate.**

### Phase 2: Accounts

Ref: supastarter (study): auth, mail, organizations.

- **2.1 Vet supastarter.** Read §3.5. Done: a vet report for every supastarter path the
  references doc lists.
- **2.2 Email module.** `sendEmail`, React Email, `console` and `resend` adapters,
  console output to a gitignored folder, boot refused in production with `console`.
  Read §2.4. Precondition (human): the sending subdomain is verified on Resend, signed
  off by the owner. Done: unit tests for the console output; a boot test for the
  production refusal; runtime: one real email sent through `resend`.
- **2.3 Email and password auth.** Better Auth: sign up, verification, sign in and out,
  reset, rate limits on auth routes; the UI kit's auth screens rebuilt on it. Read §2.3,
  §3.3, §3.5. Ref: supastarter. Done, runtime: the smoke test signs up, follows the
  verification link from the console email, signs in and creates a note.
- **2.4 Auth email caps.** Per-address and per-IP caps with the agreed behaviour. Read
  §2.3. Done: API tests prove both caps, the silent address cap and the 429.
- **2.5 Google sign-in.** Read §2.3. Precondition (human): a Google OAuth client exists
  and its credentials are in the local env. Done: the owner signs off that Google sign-in
  works locally.
- **2.6 Organizations.** Personal org on signup, create an org, org switcher. Read §2.3.
  Ref: supastarter. Done, runtime: a new user lands in a personal org, creates a second
  one and switches.
- **2.7 Org scoping.** Org context in core, an org id on every product table, notes
  scoped. Read §2.3, §3.1. Done: the isolation test passes; verify fails on a product
  table without an org id.
- **2.8 Members, invites, roles.** Invite by email, accept, owner/admin/member enforced by
  the API (OQ4). Read §2.3. Ref: supastarter. Done: API tests for each role's limits;
  runtime: an invite accepted through the console email.
- **2.9 Settings.** Profile and security screens (name, email, password change) on Better
  Auth. Read §2.3, §3.4. Done, runtime: each setting saves and survives a reload.
- **2.G Phase 2 gate.**

### Phase 3: Modules

Ref: supastarter (study): payments, storage, AI.

- **3.1 Jobs.** pg-boss; email sending moves onto the queue with retries. Read §2.2,
  §3.3. Done: tests prove a failed send is retried and a job running twice sends once.
- **3.2 Payments and Stripe checkout.** The payments interface, the Stripe adapter,
  checkout for Pro and the one-time product, webhooks verified and processed as jobs,
  purchases owned by the org. Read §2.4, §3.3. Ref: supastarter. Precondition (human):
  Stripe test-mode keys and prices exist and their IDs are in the local env. Done: API
  tests with signed webhook fixtures; runtime: a test-card checkout records a
  subscription.
- **3.3 Billing page.** Plans from the config file, the current plan, the customer
  portal (switch interval, cancel), one-time purchases shown; limited by role (OQ4). Read
  §2.4. Done, runtime: the portal round trip updates the page.
- **3.4 Uploads.** Signed-URL uploads, MinIO in Compose, avatar and org logo with the
  type and size limits, public-URL reads. Read §2.4. Ref: supastarter. Done: API tests
  reject a wrong type and an oversize file; runtime: both images upload and display.
- **3.5 AI chat demo.** AI SDK, provider by env, an SSE endpoint, the chat page under
  `/demo/`, signed-in users only. Read §2.4, §3.3. Ref: supastarter. Precondition
  (human): an OpenRouter key in the local env. Done, runtime: a reply streams into the
  page.
- **3.6 AI cap.** The per-user daily cap, a cheap default model, and the agent-guide line
  telling projects to delete `/demo/*`. Read §2.4. Done: an API test proves the cap.
- **3.G Phase 3 gate.**

### Phase 4: The reference deploy

- **4.1 Dockerfiles.** One per app and service, plus a production-like Compose run.
  Read §2.6. Done, runtime: the smoke test passes against the containers.
- **4.2 Pick the VPS.** A wizard that measures latency to the three candidates. Read
  §2.6. Precondition (human): the owner runs it from Nairobi and picks the provider.
  Done: the measurements and the choice are logged.
- **4.3 Coolify deploy.** A deploy recipe and the live reference deploy on its
  subdomain. Read §2.6. Precondition (human): a VPS running Coolify, Cloudflare DNS for
  the subdomain, production env set (Resend, Stripe test mode, Google, OpenRouter, R2).
  Done, runtime: web and API answer over HTTPS.
- **4.4 Backups.** Scheduled Postgres backups to R2 and a restore recipe. Read §2.6.
  Precondition (human): an R2 bucket and keys; the owner rehearses one restore and signs
  off. Done: a backup file appears in R2 on schedule.
- **4.5 Sentry.** Web and API report errors. Read §2.6. Precondition (human): Sentry
  DSNs in the production env. Done: the owner signs off that a test error from each
  arrived.
- **4.6 Start-a-project recipe.** Copy the kit, delete `/demo/*`, record the kit commit,
  set the env. Read §2.1, §2.5. Done: following it in a scratch copy leaves verify green.
- **4.7 v1 acceptance.** The smoke test against the reference deploy, plus the owner
  walking every item in section 1's done list. Read §1. Precondition (human): the
  owner's dated sign-off for each item. Done: all ten items signed off; tag v1.0 (the
  owner pushes it).
- **4.G Phase 4 gate.**

The idea app is built afterwards in its own repo, with its own PRD. Problems it finds
come back here as kit v1.x tasks.

## 8. After v1

Parked. Each comes back only when its trigger happens. In this order unless a project
forces another.

| Item | Trigger |
|---|---|
| Paystack adapter | A project needs local cards or M-Pesa |
| Polar adapter | A project needs a merchant of record. First task: the owner confirms Polar can pay out to the owning entity |
| Usage credits | A project sells usage |
| Mobile app (Expo), with bearer tokens | A project needs a mobile app |
| JWT/JWKS for other languages | The first non-TS service, or the Expo app |
| Marketing site (Astro) | A project needs a public site beyond a plain home route |
| Super admin app | A live project needs bans, moderation or site settings |
| Desktop (Tauri) | A project needs a desktop app |
| Analytics (PostHog) | A project needs product analytics |
| More themes, then a theme editor | A project needs a look other than Tactile |
| Engine + CLI | Two projects have been copied from the kit by hand |
| Light shape | A project that needs a database but no API of its own |
| Invitation-only signup | The reference deploy is abused, or a project needs closed signup |
| Saved AI chats | A project needs chat history |
| Image resizing, private file reads | A project needs them |
| Redis | Postgres-backed limits or the queue are measured too slow |
| Rich notes editor, full-text search | Built in the idea app first; extracted on a second use |

## 9. Risks and open questions

### Risks

| Risk | Mitigation | Checked in |
|---|---|---|
| The Better Auth NestJS adapter has one maintainer | Keep the integration thin, so the kit can own it if it is abandoned | 2.3 |
| oxfmt is pre-1.0 | Pin it; fall back to Prettier if it breaks | 0.1 |
| nestjs-zod output does not suit Hey API | Prove the notes client keeps its operations before anything else is built | 0.4 |
| TanStack Router's static data or before-load APIs change | Build from current docs, cite them in the task log | 1.5 |
| The public reference deploy is abused (email spam, AI cost, junk signups) | Auth rate limits, auth email caps, AI cap, Stripe test mode | 2.4, 3.6 |
| Windows development versus Linux CI | LF line endings everywhere; CI runs on Linux from Phase 0 | 0.8 |
| The kit drifts into product features | The scope rule, enforced by every phase gate | Every gate |

### Open questions

❓ **OQ1 - Auth calls from the web app** (needed by 2.3): Better Auth ships its own client
for its endpoints, which handles sessions and redirects. Is it the one allowed exception
to "apps call the API only through the generated client"?
➡️ Yes. Wrapping its endpoints in the generated client would mean rebuilding its session
handling. Its routes still appear in the API docs.

❓ **OQ2 - Icon set** (needed by 1.2): keep Tabler and remove Lucide?
➡️ Yes. The UI kit's shadcn config already names Tabler.

❓ **OQ3 - Default shell and auth layout** (needed by 1.5): which of the 6 app shells and
4 auth layouts move first?
➡️ The collapsible sidebar shell, the most common SaaS layout. The owner picks the auth
layout after seeing them in the preview page (1.3).

❓ **OQ4 - What each role can do** (needed by 2.8, 3.3):
- Owner: everything, including deleting the org and transferring ownership.
- Admin: members, invites and billing.
- Member: uses the product.

➡️ Yes. It is the split most SaaS products use, and it is enforced by the API.

---

Change log: 2026-11-12 first draft, skeleton verified. 2026-11-13 framework-free core.
2026-11-15 renamed to qlastakit, design grill, phases 0-4. 2026-11-17 references, UI kit
audit, token theming, UI architecture kept. 2026-11-18 v2 from the brief: kit-only scope,
v1 done on the reference deploy, Phase 4 is the reference deploy, section 4 questions
closed, email adapters and caps, plans, uploads, AI demo limits.

Tier: full. Next: `scripts/prd-review.sh`.
