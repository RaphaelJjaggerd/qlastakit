# qlastakit v1: PRD

**Status:** v2, written 2026-11-18 from the brief (grill closed 2026-11-17), the
glossary and ADRs 0001-0003. In PRD review (rounds 1 to 5 applied).
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
| Runtime | Node 22 LTS, pnpm workspaces | Pinned by mise |
| Build orchestration | Turborepo, TS tasks only | Already in the skeleton |
| Versions and tasks | mise. Each task is one `pnpm` command, nothing shell-specific | One tool for toolchains and tasks. Replaces `just`. On Windows mise runs tasks with `cmd /c` |
| Lint and format | oxlint (type-aware) + oxfmt, oxfmt pinned | Fast. oxfmt is pre-1.0; fallback is Prettier |
| Package scope | `@qlastakit/*` in every project | Projects copy the kit without renaming packages |
| Shared packages | Grouped by language | A package is only importable from its own language (ADR 0003) |
| Git flow | Branch per phase, named `phase-0` to `phase-4`. The first card of a phase runs `git fetch origin` and creates its branch from `origin/main` if it does not exist (the previous phase's PR is merged on GitHub, so local `main` can be stale); it sets itself `blocked` if the previous phase's gate card is not signed in `docs/TASKS.md` on `origin/main` (read after the fetch, before creating the branch), or if local `main` has commits `origin/main` lacks. One PR at the phase gate, CI on the PR | One review point per phase |
| Build process | potato-eng, tier full | Friction goes to the potato-eng notes |
| Kit updates | Manual in v1. Each project records the kit commit it was copied from as one line in its agent guide | The minimum that makes a later diff or CLI possible |
| Branding | The kit carries no company brand | Every project gets its own |
| Domains | Live only in env vars and deploy settings, never in code or docs (reserved names such as `example.com` and `localhost` are allowed in tests and examples). Subdomains only, never the bare domain | Nothing in the kit may assume it is the only project |

### 2.2 Backend

| Decision | Choice | Why |
|---|---|---|
| API | NestJS, the only framework shipped | Structure for a growing API. Other adapters only when a project asks |
| Business logic | Core package: no decorators, no request objects, dependencies passed in | Testable, and core never assumes it runs inside NestJS |
| Core and Better Auth's data | Core reads and writes Better Auth's tables through the Drizzle mirror only where it must (membership checks, avatar URL, logo URL) and never imports Better Auth. The verify check's forbidden core imports include `better-auth` | The Better Auth instance lives in the API, and core still has to check membership and save image URLs |
| Contract | OpenAPI from nestjs-zod, reusing core's zod schemas. Hey API generates the TS client | Language-agnostic seams (ADR 0001) |
| Database | Postgres only | One database to run, back up and reason about |
| ORM | Drizzle, mirrors the SQL, never generates migrations | ADR 0002 |
| Schema source of truth | Plain SQL migrations | Usable from any language (ADR 0002) |
| Tables from libraries | Better Auth's tables are hand-written SQL migrations, written by the card that needs them: core tables (user, session, account, verification) in 2.3a; the organization plugin's (organization, member, invitation, the active-org column on session) with the `personal` flag in 2.5a; `rateLimit` in 2.3c. The Better Auth CLI output is used only as a reference; the tables are mirrored in Drizzle, and Better Auth is set to generate UUID ids. pg-boss's own schema is the one exemption: pg-boss creates it. Product tables reference the Better Auth organization table for their org id | Keeps one schema source and UUID keys |
| Background jobs | pg-boss | The queue lives in Postgres |
| Redis | None in v1 | Sessions, rate limits, counters and the queue all live in Postgres |
| Logs | pino, structured JSON, request IDs | One log shape everywhere |
| Error shape | One JSON shape, `error` with `code` and `message`. Codes, not text | Clients translate codes |
| Defaults | UUID primary keys. Env vars validated with zod at boot. Security headers and a CORS allowlist. API docs UI at `/api/docs`, spec at `/api/openapi.json`. No websockets; SSE for AI streaming only | Assumed in the design grill, never vetoed |

### 2.3 Accounts

| Decision | Choice | Why |
|---|---|---|
| Auth | Better Auth | The NestJS adapter is community-maintained by one person; small enough to own if abandoned |
| Login methods | Email + password, Google. Email verification and password reset. Google sign-in on an address that already has a verified password account links to that user. On an unverified password account Better Auth's default stands: sign-in fails with `account_not_linked` and the sign-in screen tells the user to verify the address or reset the password first (`requireLocalEmailVerified` is never switched off) | What every SaaS needs first. Linking onto an unverified account would let someone who signed up with another person's address keep a working password on it |
| Sessions | Cookie sessions only | JWT/JWKS and bearer tokens wait for the first non-TS service or the Expo app |
| Tenancy | Organizations from v1, via the Better Auth organization plugin | Adding tenancy later rewrites every query |
| Personal org | Every new user gets one automatically. The organization table gets a `personal` boolean (in the hand-written migration, declared to Better Auth as an additional field; if a boolean is not supported, a text flag). A user-create hook makes the org; a session-create hook sets it active. `disableOrganizationDeletion` is on in v1. Better Auth has no personal-org notion, creates none at signup and leaves the active org null at sign-in, so these hooks are needed. Otherwise a personal org is an ordinary org: its owner can rename it and invite members into it | Every row belongs to an org: one code path, and every session finds an org |
| Org creation limit | Any signed-in user can create orgs, up to `organizationLimit` set from an env var (default 5). The limit counts all memberships, the personal org and orgs joined by invitation included; v1 accepts this rather than writing a custom count | Bounds logo storage and per-org invite quotas under open signup |
| Data isolation | Every product table has an org id. Core functions take an org context. No RLS. Better Auth's own tables are exempt | Isolation is visible in code and testable |
| Roles | Owner: everything v1 offers. Admin: members, invites and billing. Member: uses the product | Tenancy is by org, not by global role |
| One owner | An org always has exactly one owner. Admins cannot remove or demote the owner; the owner cannot remove or demote themselves; no one can be made owner in v1. Enforced in the API, with a test | An org can never be left without an owner |
| Not in v1 | Screens for deleting an org, transferring ownership, deleting an account, leaving an org, changing email (settings show the email read-only) | None is in the v1 done list; each adds a destructive or second verification flow |
| Org admin | Routes inside the web app: general (rename, logo), members (role changes included), invites, billing | No second app for it in v1 |
| Invites | Invite caps by env: at most 3 per recipient address per hour and 20 per org per day; both caps return 429 with code `rate_limited` from the same before-hook (the inviter is a signed-in admin, so there is no account to hide). A pending invite can be cancelled; owners and admins can remove a member | Open signup must not mail strangers from the sending subdomain. An admin who invites or adds the wrong person needs a way back |
| Signup on the reference deploy | Open. No invitation-only switch in v1 | Harm is capped by the auth rate limits, Stripe test mode and the AI cap |
| Auth rate limits | Rate limiting on every auth route | Default |
| Auth email caps | Per email address: at most 3 verification and 3 reset emails per hour, counted per type. Per IP: at most 10 auth emails per hour, any type. Env vars with these defaults. Counters in Postgres. The client IP is read from a trusted forwarded header whose name is set by env, since behind the proxies every request otherwise arrives from the proxy's address | The public deploy must not spam people from the sending subdomain |
| Cap behaviour | Address cap hit: the normal success response, and the suppressed send is logged. IP cap hit: 429 with code `rate_limited` (Better Auth's `APIError`, see below) | No account enumeration |
| Where the caps are checked | The per-IP cap is checked before the route runs (a Better Auth before-hook on the email-sending paths that throws `APIError` with status 429 and code `rate_limited`; the limiter's own 429 body is fixed and has no code, so no limiter rule is used for this) and returns the 429; Better Auth's docs say not to await the send inside its email callbacks, and after 3.1 the send is a queued job, so nothing thrown there reaches the response. The per-address cap is checked where the send is requested and suppresses silently. Both counters stay in Postgres | The 429 cannot come from inside `sendEmail` |
| Super admin | Separate app, after v1 | Platform owner only. Not needed to prove the kit |

### 2.4 Modules

| Decision | Choice | Why |
|---|---|---|
| Email | One `sendEmail`, React Email templates, two adapters: `console` and `resend`. Core calls `sendEmail` with a template name, typed data and an idempotency key (the caller always passes one: a fresh UUID per send before 3.1, the job id from 3.1 on); the adapter in the API renders the template from `packages/ts/email`. Core never imports the email package. The `resend` adapter passes the key as Resend's `Idempotency-Key` header; the `console` adapter names the saved file by the key, so a second run overwrites. No sent-emails table | Local dev and tests need no account. Core stays React-free |
| Adapter choice | Every module follows the email pattern. Email has `console` and `resend`; payments, storage and AI each have a `fake` adapter value. The fake (`console` for email) is the default in local dev, tests and CI; the real one is chosen by env in deploys. The env schema requires a provider's keys only when its adapter is selected, so tests, CI, the smoke run and the spec export boot from the committed `.env.example` values alone | |
| Sending path | Every send is a pg-boss job, in every environment, from 3.1 on. Tests wait for the console file rather than assume it exists | One path, not two |
| Console output | Prints one line (to, subject, every link) and saves the full email as HTML in a gitignored folder | Humans open it in a browser; tests poll the folder for the newest file addressed to their own recipient (every test uses its own address) |
| Console in production | The API refuses to boot when `NODE_ENV=production` and any adapter is `console` or `fake`. Production-like container runs use a non-production `NODE_ENV` for the API container only; the web container runs with `NODE_ENV=production` | Otherwise verification and reset emails vanish without an error |
| Payments | One provider-agnostic interface with adapters. Stripe is the first | Existing account, international customers |
| Adapters | Adapters (Resend, Stripe, S3, AI) live in the API service under one adapters folder and are passed into core. Core holds only the interfaces. Exception, AI: the adapter is a function in the API returning an AI SDK language model chosen by env, the `fake` is the AI SDK's mock model, and core holds no AI interface, only the daily-cap function (3.7) | Core stays framework- and provider-free |
| Billing models | Subscriptions and one-time purchases, owned by an org | Both are needed by most projects |
| Plans | Free, Pro (monthly and yearly), one one-time purchase. The plan config is a typed file in core and includes the display amount and currency; the billing page reads plans from a billing endpoint through the generated client (apps may not import core). Stripe price IDs stay in env vars. An org can buy the one-time product more than once; each purchase is its own row on the billing page, with no already-bought check | Smallest set covering both models, upgrade, downgrade and the interval switch. Core exposes one function returning an org's current plan (Pro while the Stripe status is `active`, `trialing` or `past_due`, otherwise Free); v1 gates nothing with it |
| Stripe customer | One customer per org, stored in a product table of ours keyed by org id (not a column on Better Auth's organization table), created on first checkout | 3.2a, 3.2b and the portal all need the id, and Better Auth owns the org table |
| Stripe on the reference deploy | Test mode | Proves the same code paths without charging strangers. Live keys are a per-project setting |
| Paystack, Polar | After v1 | Polar's payout to the owning entity is unconfirmed; it is a hands-on precondition on the first Polar task |
| Usage credits | After v1. The data model leaves room | No v1 proof needs them |
| File storage | S3 API, signed-URL uploads. R2 in production, a local S3-compatible container in Compose (MinIO is no longer published; 3.5 picks a maintained one that supports presigned PUT and bucket CORS) | One API everywhere |
| Avatar and org logo | PNG, JPEG or WebP, at most 2 MB, no server-side resizing. The API refuses to sign when the declared type or size is outside the limits and signs the content type into the URL. After upload it reads the object's size and deletes an oversize object before saving the URL. Public-URL read. One fixed object key per user avatar and per org logo, so a new upload replaces the old one and storage is bounded by accounts; the saved URL carries a version query so caches refresh | A signed PUT URL cannot carry a size range and R2 has no signed POST forms. Avatars are not secret. Open signup must not allow unlimited objects |
| AI | Vercel AI SDK, one OpenAI-compatible provider configured by base URL, key and model env vars, SSE streaming (the endpoint is left out of the OpenAPI spec, since no generated client calls it), tested against OpenRouter | Covers OpenRouter. More providers come when a project asks |
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
| Reference feature | Notes stays in the kit's real routes, not under `/demo/`. The start-a-project recipe tells a project to delete it once its own first feature exists | The smoke test and the add-feature recipe depend on it |
| Icons | Tabler only; Lucide is removed | The UI kit's design rules already say Tabler only |
| Default shell and auth layout | The stacked-side app shell and the side auth layout, the UI kit's theme config defaults. Other shells and auth layouts move only when a project wants one | The owner's chosen look |
| Home page | A plain route in the web app | Until a marketing site exists |
| Mobile, marketing, desktop | After v1: Expo, Astro, Tauri | |

### 2.6 Operations

| Decision | Choice | Why |
|---|---|---|
| Packaging | A Dockerfile per app and service | Runs anywhere. The unit Qlastabase hosts later |
| Origins and paths | The API serves everything under `/api` in every environment (Nest global prefix; Better Auth at `/api/auth`; no proxy ever strips the prefix). On the deploy the web app is served on the subdomain and `/api/*` on the same subdomain is routed to the API (a proxy rule in Coolify). The rule (`/api/*` to the API, everything else to the web app, no prefix stripping) lives in three places: Coolify on the deploy, the Vite dev proxy locally, and one small reverse-proxy container in 4.1's production-like Compose run. Locally the web dev server proxies `/api` to the API port, so the browser sees one origin everywhere and the generated client's base URL is always `/api`. Server-side web code (the before-load session check) reaches the API through a separate internal URL env var. The CORS allowlist stays as a default and is empty in v1 | Cookie sessions need no cross-subdomain cookie or credentialed CORS, and every path in the contract, the Better Auth base URL and the Google redirect URI is the same in every environment |
| Reference deploy | One VPS running Coolify, on a subdomain. Git push deploys, SSL | Cheap, and close to what Qlastabase will wrap |
| Cloudflare proxying | DNS only (not proxied) for the app subdomain in v1. Coolify's proxy issues the certificate and sets `X-Forwarded-For`, which is the trusted client-IP header; SSE needs no buffering exception. Proxying is a per-project choice later (then the header is `CF-Connecting-IP` and the origin must refuse non-Cloudflare traffic) | A proxied subdomain terminates SSL twice and lets the header be forged unless the origin is locked |
| Org-level abuse limits | `organizationLimit` from env (default 5), and the personal-org rules in §2.3 | See the abuse row in §9 |
| VPS provider | Chosen in Phase 4 by measured latency from Nairobi to three candidates: a Nairobi provider, a Johannesburg region, Hetzner EU. The cheapest one whose median round trip from Nairobi is 200 ms or less wins | Docker and Coolify make the host easy to change; measure, don't guess |
| DNS | Cloudflare | R2 lives there too: DNS, storage and SSL in one account |
| Production Postgres | Same VPS, in Docker. Scheduled backups to R2. A restore is rehearsed once | |
| Testing | Vitest for core, API tests on a real Postgres, one Playwright smoke test | See section 6 |
| CI | GitHub Actions: lint, typecheck, tests, contract-drift check | |
| Errors | Sentry in web and API. Off when no DSN is set (local, CI) | |

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
| Web feature | A folder of components and query hooks for one feature | Talks to the API only through the generated client and TanStack Query. Forms validate with zod schemas generated into the TS client by Hey API's zod plugin (check its current docs in 0.6), or rely on the API's coded errors. Never a hand-copied schema |
| Config | App, navigation and theme config in the web app | The control panel: product work is "add a page, register it" |

### 3.2 Where state lives

| State | Lives in |
|---|---|
| All product data, sessions, rate-limit and cap counters, the job queue | Postgres |
| Files (avatars, logos) | R2 in production, a local S3-compatible container locally |
| Who is signed in | An httpOnly session cookie set by Better Auth |
| Server data in the browser | The TanStack Query cache |
| Current route, current layout | Derived from the matched route, never copied into a store |
| Theme | An attribute on the document root, token values in CSS |
| Active org | On the Better Auth session. A new session starts in the user's personal org; v1 does not remember the last org used. The controller builds the org context from it and core checks membership. A request with no active org gets a coded error, not a guess. A removed member's session keeps the removed org active; their next request gets the coded not-a-member error, and on that code the web app sets the personal org active and reloads. No org slug in URLs |
| Secrets, domains, price IDs, caps, model names | Env vars, validated at boot |

### 3.3 How parts talk

- **Web to API:** the generated client over HTTP, wrapped in TanStack Query hooks. Never
  hand-written fetch. Never an import of server code.
- **Auth:** Better Auth's endpoints are mounted in the API. The web app calls Better
  Auth's own client for everything Better Auth owns: sign-in and sessions,
  organizations, invites, members, roles and the active org. Those routes stay outside
  the contract and outside core. This is the first of two exceptions to the
  generated-client rule. Everything is under `/api`, Better Auth
  at `/api/auth` (section 2.6). Its endpoints keep Better Auth's own error shape; the
  IP-cap 429 raised inside a Better Auth route also uses it. A server-side before-load
  check forwards the browser's cookie to Better Auth's session endpoint, through the
  internal API URL env var.
- **API to core:** a controller calls one core function with an org context.
- **Provider to API:** Stripe webhooks land on the API, are verified, and are queued as
  pg-boss jobs that call core.
- **Email:** core asks for an email through `sendEmail`; the send runs as a job, in every
  environment. The pg-boss worker runs inside the API process in v1.
- **AI:** the API streams the model's reply to the browser over SSE. The demo page uses
  the AI SDK's chat hook, which makes its own streaming request: the second exception
  to the generated-client rule, limited to `/demo/*`.

### 3.4 UI architecture: kept and changed

The UI kit today (audited 2026-11-17): a React Router 7 + Vite project with a mock API.
24 UI components, none importing React Router. About 30 Tactile tokens on top of the
shadcn ones (raised and recessed shadows, surfaces, glow, etched lines, success,
warning), some still applied by a helper outside the components. 6 app shells, 3 auth
layouts (simple, split, side). Screens: sign in, sign up, forgot and reset password, OTP, settings (profile,
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
| supastarter | Business logic inside API route handlers | 0.4b and every API task | Verify check: controllers never import the database package |
| supastarter | Prisma schema and generated migrations | 0.3 | Verify check: no Prisma dependency; migrations are hand-written SQL |
| supastarter | Library calls from early 2025 (Better Auth 1.1, AI SDK 4, Tailwind 3) | 2.3a, 3.6 | Task log cites the current docs used; typecheck against current versions |
| supastarter | Redis for rate limits | 2.4 | No Redis dependency; cap tests run on Postgres only |
| saasrock | 129-model structure, entity builder, hand-rolled auth | Not used in v1 | No v1 task names saasrock |
| ui-kit | Route guards that redirect after render | 1.5 | Test: a protected route never renders its content without a session |
| ui-kit | Layout chosen by an effect writing to a store | 1.5 | No layout store; test: the first render already has the right layout |
| ui-kit | Shadows applied by a helper outside the components | 1.4 | Verify token-purity check, plus the throwaway test theme |
| ui-kit | Two icon sets installed | 1.2 | Verify check: one icon dependency |
| ui-kit | Mock API, axios, zustand auth store | 2.3c | Verify check: no axios or zustand in the web app |
| ui-kit | Config flags for features that do not exist | 1.5 | Review against section 3.4 |
| ui-kit | Fourteen path aliases | 1.2 | One alias in the web app's TS config |
| ui-kit | Plain-string titles | 1.6 | Pseudo-locale test |
| ui-kit | Stub pages (activity log, pricing) | 1.2 | Not moved. Pricing is rebuilt in 3.3 |
| ui-kit | Screens with no v1 feature behind them (OTP, settings notifications, settings integrations, roles and permissions) | 1.2 | Not moved |

## 4. Layout

Target layout after Phase 0. Folder names only; files change too often to list.

```
apps/
  web/                 TanStack Start web app (the only app in v1)
services/
  api/                 NestJS API: controllers, module wiring, Better Auth mount, adapters/
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
infra/                 Docker Compose: Postgres, a local S3-compatible container
docs/                  PRD, vision, brief, tasks, standards, references, recipes, ADRs
scripts/               potato-eng loop and verify
```

**Reference rules**

- Apps import only the UI package, the generated client and shared config. Never core,
  db or anything from services.
- Core imports no framework: no NestJS, no TanStack, no React.
- The API imports core and db. Controllers import core only. Adapters live in the API and are passed into core.
- A package is imported only by code in its own language.
- The kit's own docs and code never contain a real domain, brand or secret.

## 5. Tooling and rules

| Kind | Where | What |
|---|---|---|
| Checked by a tool | The verify script, run by every task and by CI | Typecheck. oxlint. oxfmt check. Tests. Contract drift (regenerate, fail if it changed). Added during v1: core has no framework imports (0.3); controllers never import db (0.4b); the web app imports no core, db or service code (0.6); one icon dependency and no axios or zustand in the web app (1.2, 2.3c); token purity in UI components (1.4); every product table in a migration has an org id, read against an allowlist of non-product tables with one reason per table, kept beside the migrations (2.6) |
| Judgement, checked at review | The standards doc | Smell baseline plus project standards added by phase gates |
| Convention | Agent guides and recipes | Recipe steps, naming, where a feature's files go |

An import rule is an oxlint `no-restricted-imports` override for its folder, so it runs
in `pnpm lint` and in the editor. This covers core, controllers, the web app, icons, and
axios and zustand. Verify gets a script only for what lint cannot see: dependency counts
in a manifest, token purity, the org-id check.

A rule that review catches twice becomes a check (mechanical) or a standard (judgement)
at the next phase gate.

## 6. Testing

| What | Kind | Where it runs |
|---|---|---|
| Core functions | Vitest unit tests for validation, coded errors and logic, with fake adapters and a fake clock. There is no fake database: queries are proven by the API tests on real Postgres | Verify, CI |
| API endpoints | Vitest API tests against a real Postgres in Docker. The API test harness starts the app in the test process on a free port and calls it with `fetch`; no framework test helper, so the tests survive the 0.4b swap and can reach the fake adapters. Tests and the smoke script use a second database in the same Compose Postgres (name by env, separate from the dev database `app`), created and migrated by the test setup, tables truncated between tests; the smoke test signs up with a unique address per run. Better Auth's rate limiter is on in the tests that prove the limits and off (by env) in the rest of the test run and in the local smoke run, since every test arrives from one IP and sign-in allows 3 requests per 10 seconds; the production-like run in 4.1 and the deploy keep it on. API test files run serially (file parallelism off for the API project); core and web tests stay parallel. Verify fails with a clear message when Postgres is not reachable | Verify, CI |
| Adapters in tests | Verify and CI use the `console` email adapter and in-memory fakes for payments, storage and AI (webhook signature checks are the exception, in the Webhooks row below), so they need no keys, no provider accounts and no S3 container. The real Stripe, S3 and AI adapters are proven by the runtime criteria (3.3, 3.5, 3.6). The local S3 container is needed for dev and 3.5's runtime check only | Verify, CI |
| Web routes and shell | Vitest with a DOM environment and Testing Library, rendering the router in memory | Verify, CI |
| Org isolation | An API test proving one org cannot read another's rows, for every org-scoped feature | Verify, CI |
| Auth email caps, AI cap, upload limits | API tests | Verify, CI |
| Webhooks | API tests with signed Stripe event fixtures; the real adapter's signature check runs offline with a test secret | Verify, CI |
| The whole kit | One Playwright smoke test with two modes. Local and CI: sign up, read the verification link from the console email, verify, sign in, create a note. Deploy (4.7): sign in with an already verified test account whose credentials come from env, then create a note; signup and verification on the deploy are covered by the owner's sign-off on section 1 item 1 | Locally after the first runtime task, CI, and against the reference deploy at the end |
| UI theming | A throwaway test theme that changes the whole look with no component edit | Once in 1.4, then the token-purity check guards it |
| i18n | A pseudo-locale test proving every shell string comes from message files | 1.6, then CI |

CI runs on every phase PR: lint, typecheck, tests with a Postgres service, the
contract-drift check and the smoke test.

## 7. Implementation plan

Each task is one vertical slice for one fresh session. "Read" lists the PRD sections to
read. **Runtime** marks a criterion proven by running the thing. **Precondition
(human)** marks a step only the owner can do; the task waits for the owner's dated
sign-off. A sign-off is a dated line the owner adds to the card in `docs/TASKS.md`; a card whose precondition is unsigned is set `blocked` with the step the owner must do, and the loop stops. A card whose builder checks pass but whose owner sign-off is missing is closed with a line `Awaiting sign-off: <what the owner does>`; the phase gate does not pass while any card in the phase has that line unsigned. A browser runtime criterion is, from 0.7 on, proven by a throwaway Playwright script run against the dev servers, not committed, with the steps and result written in the task log. Phase branches are `phase-0` to `phase-4`; the first card of a phase runs `git fetch origin` and creates the branch from `origin/main` if it does not exist, and is set `blocked` if the previous phase's gate card is not signed in `docs/TASKS.md` on `origin/main` (read after the fetch, before the branch is created) or if local `main` has commits `origin/main` lacks. A gate card has no precondition: it runs its steps and closes with `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`. The owner adds the dated sign-off lines (the gate's and every `Awaiting sign-off` in the phase) as the last commit on the phase branch, pushes, then merges; the sign-offs reach `main` in that PR. Phase sizes (11, 12 and 11 cards in phases 0, 2 and 3) are accepted; `/tasks` does not split a phase. A task with **Ref** follows that reference's mode, and the reference is vetted
before its first use. A card that removes or renames something the agent guide names (`just`, Hono, Biome) fixes those lines in the same task; 0.9 is the final sweep.

### Phase 0: Align the skeleton

Starting point: the skeleton works end to end (web, client, API, database) on Hono,
Biome and `just`, with a notes feature. No core package, no TanStack Query, no tests, no
CI. Docker Compose and the `just` recipes have never been run.

- **0.1 mise and oxc.** Precondition (human): mise is installed, and the owner has pushed `main` with the PRD and `docs/TASKS.md`. Replace `just` with mise tasks and Biome with oxlint + oxfmt
  (pinned). Read §2.1, §5. Done: `mise run check` passes, no Biome config or justfile
  remains, verify passes. If type-aware oxlint does not accept this workspace, ship oxlint
  without it and log why.
- **0.2 Test harness.** Vitest across the workspace, including a DOM environment with Testing Library for the web app, and a root test script. Read §6.
  Done: verify runs tests (no longer skipped) with at least one passing test.
- **0.3 Core package.** Move notes logic and its zod schemas into core, with unit tests. Delete the README-only `packages/ts/auth` and `packages/ts/payments` placeholders.
  Read §2.2, §3.1, §4, §6. Done: tests for the notes schemas and coded errors pass (the
  data path is proven in 0.4a); verify fails if core imports a framework or `better-auth`.
- **0.4a Postgres, migrations and API tests.** Compose Postgres, the Node migrate script,
  the API test harness on real Postgres (second test database, §6), and API tests that
  create and list notes against the existing Hono API. Replace `db/migrate.sh` with a
  small Node migrate script of the same behaviour (ordered files, the `schema_migrations`
  table, one transaction per file), used by local dev, the test setup, CI and the deploy;
  delete the shell script. Precondition (human): Docker Desktop installed and running.
  The harness starts the app in-process on a free port and calls it with `fetch` (§6), not
  Hono's `app.request()`.
  Read §6. Done: the API tests pass on real Postgres; verify fails with a clear message
  when Postgres is unreachable.
- **0.4b NestJS API.** Replace Hono with NestJS (on Express: the Better Auth adapter's
  Fastify support is beta and Better Auth needs Nest's body parser off) + nestjs-zod v5
  for zod 4 with its `cleanupOpenApiDoc` step; notes controller as a thin adapter. The
  spec export must not need a database. NestJS needs decorator metadata, which the
  skeleton's `tsx` runner does not emit, so pick a runner that does and log it. The same applies to the Vitest process that boots the app (§6): check current Vitest docs for whether its transformer emits decorator metadata from the tsconfig; if not, use `unplugin-swc` in the API test project or explicit `@Inject()` tokens on every constructor parameter. One choice for dev, tests and the spec export, logged. Write
  ADR 0004 (NestJS replaces Hono). Set the global prefix `/api` (§2.6). Read
  §2.2, §2.6, §3.1, §3.3, §6. Done: the 0.4a API tests pass unchanged apart from the
  `/api` paths (the tests written before the swap prove it); the regenerated client keeps
  the same notes operations; verify fails if a controller imports db. Runtime: the API
  boots and serves the spec at `/api/openapi.json` and the docs UI at `/api/docs`.
- **0.5 API baseline.** Env validation at boot, the error shape, security headers, CORS
  allowlist, pino logs with request IDs. Read §2.2, §2.4. The env schema requires a provider's keys only when that
  provider's adapter is selected, so tests, CI, the smoke run and the spec export boot
  from the committed `.env.example` alone (the test setup, Playwright's `webServer` and the spec export load `.env.example`; dev loads `.env`, which the setup task copies from it); each card that adds an env var adds it to
  `.env.example`. Done: API tests prove each one, including a refused boot on a bad env.
- **0.6 TanStack Query.** The web notes page uses the generated client through query
  hooks, base URL `/api`; the web dev server proxies `/api` to the API port and the
  internal API URL env var is added. Check Hey API's zod plugin docs. Add a verify check
  that the web app imports no core, db or service code (§4). Read §2.5, §2.6, §3.3, §4, §5.
  Done: the check passes, typecheck passes and the regenerated client is in use by the
  page; 0.7's smoke test proves the page in a browser.
- **0.7 Smoke test.** The Playwright smoke test (create a note for now). Playwright's
  `webServer` setting starts and stops both dev servers (the API and the web app, so the
  Vite proxy applies; not a build); the only pre-step is the migrate script, run on the
  test database. No start-and-stop shell script, so one `pnpm` command runs it. Read §6.
  Done, runtime: the smoke command passes.
- **0.8 CI.** GitHub Actions runs the verify steps and the same smoke script with a Postgres
  service. Read §6. The workflow triggers on pushes to `phase-*` branches and on PRs, and runs the 0.7 smoke command.
  Done: the workflow file runs the verify steps and the 0.7 smoke command with a Postgres service. Owner sign-off (`Awaiting sign-off`): the owner pushed `phase-0` and the run was green.
- **0.9 Docs match the code.** Agent guide, recipes, ADRs and `docs/REFERENCES.md`
  (stale pointers to "section 6b", "PRD Q1", next-intl; point at §3.4 and §3.5) describe
  NestJS, core and mise. Read §3, §4, §5. Done: no doc mentions Hono, Biome or `just` except as history;
  the add-feature recipe's steps match the layout.
- **0.G Phase 0 gate.**

### Phase 1: UI kit in the web app

Ref: ui-kit (reuse).

- **1.1 Vet ui-kit.** Precondition (human): the owner unpacks the finished UI project
  into the references folder; the card checks for the unpacked `src/` folder. Read §3.4, §3.5. Done: a vet report with keep, fix or
  reject per file.
- **1.2 Move the UI kit.** Tokens, components and design rules into the UI package (no screens: a screen enters the web app only in the card that rebuilds it, auth screens in 2.3a to 2.3c, billing in 3.3, settings in 3.4); one
  icon set (Tabler, §2.5); one app alias; stubs left behind. Read §2.5, §3.4, §3.5. Ref: ui-kit.
  Done: the web app builds on the UI package; verify fails on a second icon dependency.
- **1.3 Component preview.** A dev-only route rendering every component. Read §2.5.
  Done, runtime: it renders in dev and is absent from the production build.
- **1.4 Token purity.** No hardcoded color, shadow, border or surface in components.
  Read §2.5, §3.5. Done: verify's token-purity check passes; runtime: a throwaway test
  theme changes the whole preview page without editing a component.
- **1.5 Shell and routing.** The stacked-side app shell and the side auth layout (§2.5), config-driven
  navigation, access checks before render, layout derived from the route. The session
  is a stub behind an interface until 2.3a; a placeholder sign-in route in the side auth layout is replaced in 2.3a. Read §3.1, §3.4, §3.5. Includes the access denied screen. Ref: ui-kit. Done:
  web tests (§6) prove a protected route never renders without a session and the first render
  has the right layout.
- **1.6 i18n.** i18next wired; all shell text through message files. Read §2.4. Done: the
  pseudo-locale web test passes.
- **1.7 Web agent guide.** Prime directives and the "add a page" recipe in the web app's
  agent guide. Read §3.4. Done: the builder adds a throwaway page using only the recipe, in two steps, and removes it; the task log lists the two steps taken.
- **1.G Phase 1 gate.**

### Phase 2: Accounts

Ref: supastarter (study): auth, mail, organizations.

- **2.1 Vet supastarter.** Read §3.5. Done: a vet report for the supastarter auth, mail,
  organizations and settings paths the references doc lists.
- **2.2 Email module.** `sendEmail`, React Email, `console` and `resend` adapters,
  console output to a gitignored folder, boot refused in production with `console`.
  Read §2.4. Done: unit tests for the console output; a boot test for the production
  refusal. Owner sign-off (not a precondition for starting): the sending subdomain is
  verified on Resend, a Resend API key and a from address are in the local env, and one
  real email was sent through `resend`.
- **2.3a Sign up and sign in.** Better Auth mounted in NestJS, its core tables (user,
  session, account, verification) as SQL migrations with the Drizzle mirror, sign up,
  sign in and out, those auth screens rebuilt on it; the session replaces the 1.5 stub.
  Better Auth sits at `/api/auth` (§2.6). Read §2.2, §2.3, §2.6, §3.3, §3.5. Ref: supastarter.
  The web auth client declares the `personal` field by hand, never importing the server's `auth` type (§4). The notes endpoints require a session from here on, and the API tests get a sign-in
  helper. Done, runtime: the smoke test signs up, signs in and creates a note.
- **2.3b Email verification.** Verification required before sign in, the verification
  template and screen. Read §2.3, §2.4. Ref: supastarter. Done, runtime: the smoke test
  follows the verification link from the console email before signing in.
- **2.3c Password reset and auth limits.** Reset flow and its screens, rate limits on
  auth routes, verify check: no axios or zustand in the web app. Better Auth's limiter
  is set to database storage (its `rateLimit` table is one more hand-written migration),
  enabled explicitly so tests do not depend on the default (on in the tests that prove
  the limits, off by env elsewhere, §6), and it needs the trusted client-IP header
  setting from §2.3 now. The limiter's own tests assert status 429 and `X-Retry-After`,
  not a code. Read §2.2, §2.3, §3.5, §6.
  Ref: supastarter. Done: API tests for reset and the limits; the check passes.
- **2.4 Auth email caps.** Per-address and per-IP caps with the agreed behaviour. Read
  §2.3. The per-IP cap is a before-hook throwing `APIError` 429 with code `rate_limited`
  (no limiter rule); it is checked before the route runs; the
  per-address cap is checked where the send is requested and suppresses silently; both
  counters in Postgres (§2.3 "Where the caps are checked"). Done: API tests prove both caps, the silent address cap and the 429.
- **2.5a Personal org.** The organization plugin's tables (organization, member,
  invitation, the active-org column on session) as hand-written SQL with the Drizzle
  mirror, and the `personal` boolean on the organization table (declared to Better Auth as
  an additional field; confirm a boolean works, else a text flag). A user-create hook makes
  the org (named after the user, slug generated; no slug in URLs, §3.2), a session-create hook sets it active (§3.2), `disableOrganizationDeletion` on.
  Read §2.2, §2.3, §3.2, §3.3. Ref: supastarter. Done: an API test that a new user has
  exactly one personal org and a new session is active in it.
- **2.5b Create and switch.** `organizationLimit` from an env var (default 5; counts all
  memberships, §2.3), create an org, the org switcher, and the org general page (rename)
  limited to owner and admin. The web app calls Better Auth's own client for organization
  actions (§3.3). The before-load step loads the active member's role with the session
  through Better Auth's client, and a route's authority is a list of org roles; before this
  card the only authority is "signed in". Read §2.3, §3.2, §3.4. Ref: supastarter. Done:
  an API test for the limit; runtime: a new user lands in a personal org, creates a second
  one, switches, and renames it.
- **2.6 Org scoping.** Org context in core, an org id on every product table, notes
  scoped; the migration deletes existing notes rows (no deploy exists yet). Read §2.3, §3.1. Done: the isolation test passes; verify fails on a product
  table without an org id.
- **2.7a Invites.** Invite by email and accept. Invite caps (§2.3): at most 3 per recipient address per hour and 20 per org per
  day, by env; both return 429 with code `rate_limited`. The invite link leads to sign
  in or sign up with the invited address, the normal email verification applies, then
  the invite is accepted; the API tests cover an existing user and a new one. Both
  caps are one before-hook throwing `APIError` 429 with code `rate_limited`. An invite
  accepts only the roles `admin` and `member` (a `beforeCreateInvitation` organization hook),
  with an API test. Read §2.3.
  Cancelling a pending invite is included. Ref: supastarter. Done: API tests for
  invite, accept and cancel; runtime: an invite accepted through the console email.
- **2.7b Members and roles.** Members screen, role changes, owner/admin/member limits,
  removing a member, and the one-owner rule, all enforced by the API (§2.3) in Better Auth organization hooks (`beforeUpdateMemberRole` and the remove-member hook), not in a controller. Read §2.3, §3.2.
  Done: API tests for each role's limits, member removal, and the one-owner rule
  (admins cannot remove or demote the owner; the owner cannot remove or demote
  themselves; no one can be made owner); a removed member's next request gets the coded not-a-member error; runtime:
  an admin changes a member's role in the screen.
- **2.G Phase 2 gate.**

### Phase 3: Modules, settings and Google sign-in

Ref: supastarter (study): payments, storage, AI.

- **3.0 Vet supastarter modules.** Read §3.5. Done: a vet report for the supastarter
  payments types, Stripe adapter, purchases model, storage and AI paths.
- **3.1 Jobs.** pg-boss, its worker inside the API process; every email send moves onto
  the queue with retries. Read §2.2, §2.4, §3.3. Done: tests prove a failed send is retried and a job running twice sends once (the idempotency key, §2.4).
- **3.2a Payments and checkout.** The payments interface, the Stripe adapter, the
  purchases table owned by the org, a checkout endpoint for Pro and the one-time product,
  the Stripe customer table (one customer per org, created on first checkout, §2.4) and
  the plan-lookup function. Read §2.4, §3.2. Ref: supastarter. The checkout endpoint refuses with a coded error when the org already has an active Pro subscription (the page sends that org to the portal). The one-time product has no already-bought check (§2.4). Done: API tests for
  checkout and purchases (on fakes), including role limits (owner and admin allowed, member refused), a Pro checkout refused when a seeded active subscription exists, a second one-time checkout by the same org not refused, and the org isolation test for purchases (§6). The card also ships the core function that records a completed purchase or a subscription change, with unit tests; the API tests seed rows through it.
- **3.2b Stripe webhooks.** Webhooks verified and queued as jobs that call core, handling `checkout.session.completed`, `customer.subscription.updated` and `customer.subscription.deleted` (confirm in current Stripe docs). Read
  §2.4, §3.3. Ref: supastarter. Done: API tests with signed webhook fixtures, the same event delivered twice changes nothing, and two completed one-time checkouts make two rows.
- **3.3 Billing page.** Plans from a billing endpoint (the plan config lives in core,
  §2.4), the current plan, the customer portal (switch interval, cancel), one-time
  purchases shown, one row each; limited by role (§2.3). Read §2.4. Precondition (human): Stripe
  test-mode keys and prices exist and their IDs are in the local env; the Stripe CLI is
  installed to forward webhooks locally; the test-mode customer portal allows switching
  between the two Pro prices and cancelling. Done: API tests for the billing endpoints and the
  role limits; the owner signs off that a test-card checkout, the one-time purchase, the interval switch and
  cancel update the page (hosted Stripe pages, with the Stripe CLI forwarding).
- **3.4 Settings.** Profile and security screens (name, password change; email shown
  read-only, §2.3) on Better Auth. Read §2.3, §3.4. Ref: supastarter. Done, runtime: each setting saves and survives a reload.
- **3.5 Uploads.** Signed-URL uploads, a local S3-compatible container in Compose (pick a
  maintained one from current docs that supports presigned PUT and bucket CORS;
  candidates RustFS, Garage, SeaweedFS), avatar and org logo with the type and size
  limits, public-URL reads, one fixed key per avatar and per org logo, the avatar control on
  the 3.4 profile page, and the logo on the 2.5b org general page. Read §2.4. Ref: supastarter. Done: API tests reject a wrong
  type at signing and delete an oversize object after upload, and a member cannot sign or save an org logo; runtime: both images
  upload and display. If an oversize object is deleted, the saved URL is cleared (one
  fixed key means the previous image goes too).
- **3.6 AI chat demo.** AI SDK, provider by env (an adapter function returning a language model, the `fake` the AI SDK's mock model from `ai/test`; confirm the export name in current docs, §2.4), an SSE endpoint where the controller calls `streamText` and pipes the SDK's stream response, left out of the OpenAPI spec, the chat page under
  `/demo/`, signed-in users only. Read §2.4, §3.3. Ref: supastarter. Precondition
  (human): an OpenRouter key in the local env. Done: an API test with the fake AI
  adapter shows the endpoint refuses a request with no session and streams the fake's
  reply as SSE; runtime: a reply streams into the page.
- **3.7 AI cap.** The per-user daily cap, a cheap default model, and the agent-guide line
  telling projects to delete `/demo/*`. Read §2.4. The cap resets at 00:00 UTC. Done: an API test proves the cap.
- **3.8 Google sign-in.** Read §2.3. Linking applies to a verified password account only; the card must not set `requireLocalEmailVerified: false`, and the sign-in screen shows a message for `account_not_linked`. Precondition (human): a Google OAuth client exists
  and its credentials are in the local env. Done: the owner signs off that Google sign-in
  works locally.
- **3.G Phase 3 gate.**

### Phase 4: The reference deploy

- **4.1 Dockerfiles.** One per app and service, plus a production-like Compose run using
  the `console` adapter with a non-production `NODE_ENV` on the API container only (the web container runs with `NODE_ENV=production`), and the console email folder
  mounted as a volume so the smoke test can read the verification link from the API
  container. The Compose file includes one small reverse-proxy container with the §2.6
  rule (`/api/*` to the API, everything else to the web app, no prefix stripping), and
  the smoke test targets the proxy. The auth rate limiter stays on in this run. The API container's start command runs the Node
  migrate script from 0.4a, then starts the API (one API instance in v1, so no lock). One
  CI job builds both images, so a broken Dockerfile fails the PR; the container smoke stays
  one local `pnpm` command. Read §2.6. Done, runtime: the
  smoke test passes against the containers through the proxy.
- **4.2 Pick the VPS.** A recipe with the commands, one test endpoint per candidate
  (looked up by the card) and an empty results table. Read §2.6. Done: the recipe exists.
  Owner sign-off: the owner runs it from Nairobi; the measurements and the choice (the
  cheapest provider with a median round trip of 200 ms or less, §2.6) are logged.
- **4.3 Coolify deploy.** The card writes the deploy recipe and any repo-side config; the
  owner performs the Coolify steps and signs off. The deploy is on its subdomain, DNS
  only (§2.6); the trusted client-IP header is `X-Forwarded-For`. The card checks current
  Traefik and Better Auth docs and sets `trustedProxies` by env if needed, since a client
  could otherwise forge its IP and step around the per-IP cap. The web app and the API are
  two Coolify applications from the same repo (base directory at the repo root, one
  Dockerfile location each); the API resource sets "Path prefixes" to "Keep paths as-is",
  since Coolify strips the prefix by default, and the builder's HTTPS check requests
  `/api/openapi.json` through the public URL. Every resource sharing the hostname must be
  running, or the root route changes what it serves. Coolify deploys the
  Phase 4 branch until the gate; at 4.G the owner switches it to `main`. Postgres is
  created as a Coolify database resource, not in the app's Compose file. Read §2.6.
  The recipe also lists, as owner steps: a VPS running Coolify with read access to the
  private GitHub repo and Cloudflare DNS for the subdomain; the production env (Resend,
  Stripe test mode, Google, OpenRouter, R2, the trusted client-IP header, the Better Auth
  secret and public base URL); the Google OAuth redirect URI; the Stripe webhook endpoint
  with its signing secret in the env; the R2 bucket with public read on its own subdomain
  and a CORS rule for the web origin. Precondition: none, or the 4.2 choice signed. Done:
  the recipe names every Coolify setting and every env var, and the repo-side config is
  committed. Owner sign-off: the owner followed the recipe, the public URLs answer over
  HTTPS including `/api/openapi.json`, the API logs the real client IP for a request through
  the public URL, and a request sent with a forged `X-Forwarded-For` still logs the real
  client IP.
- **4.4 Backups.** The card writes the restore recipe (every command named) and any
  repo-side config; the owner configures Coolify's scheduled Postgres backups to R2 (no
  backup code). Read §2.6. Precondition (human): a second, private R2 bucket with its own keys, never the public uploads bucket (the restore recipe says so). Done: the restore
  recipe exists and names every command. Owner sign-off: a backup file appears in R2 on
  schedule, and one restore was rehearsed.
- **4.5 Sentry.** Web and API report errors. If `@sentry/tanstackstart-react` (alpha)
  does not work with the installed TanStack Start, use `@sentry/react` in the browser
  and `@sentry/node` on the server, and log why. Read §2.6. Precondition (human): Sentry
  DSNs in the production env. Done: the owner signs off that a test error from each
  arrived.
- **4.6 Start-a-project recipe.** Copy the kit, delete `/demo/*`, record the kit commit,
  set the env, and delete the notes feature once the project's own first feature
  exists (§2.5). Read §2.1, §2.5. Done: following it in a scratch copy leaves verify green.
- **4.7 v1 acceptance.** The smoke test (deploy mode) against the reference deploy, plus the owner
  walking section 1's done list. Read §1. Precondition (human): the owner creates and
  verifies a test account on the deploy and puts its credentials and the deploy's base
  URL in the local env; the smoke test runs from the owner's machine or the builder's
  session, not CI. The owner signs off the items a test does not prove (1 to 6, 10);
  items 7 to 9 are proven by green tests. Done: all ten items accounted for.
- **4.G Phase 4 gate.** The owner switches Coolify to `main` after the merge and tags
  v1.0 on `main` (the owner pushes it).

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
| The Better Auth NestJS adapter has one maintainer | Keep the integration thin, so the kit can own it if it is abandoned | 2.3a |
| oxfmt is pre-1.0 | Pin it; fall back to Prettier if it breaks | 0.1 |
| Type-aware oxlint runs on tsgolint, which tracks TypeScript 7; the repo is on 5.9 | If it does not accept this workspace, ship oxlint without it and log why | 0.1 |
| nestjs-zod output does not suit Hey API | Prove the notes client keeps its operations before anything else is built | 0.4b |
| TanStack Router's static data or before-load APIs change | Build from current docs, cite them in the task log | 1.5 |
| The public reference deploy is abused (email spam, AI cost, junk signups) | Auth rate limits, auth email caps, AI cap, one fixed object key per avatar and logo, an org creation limit per user (`organizationLimit`), invite caps, Stripe test mode | 2.3c, 2.4, 2.5b, 2.7a, 3.5, 3.7 |
| `@sentry/tanstackstart-react` is alpha | Fall back to `@sentry/react` and `@sentry/node` | 4.5 |
| Windows development versus Linux CI | LF line endings everywhere; CI runs on Linux from Phase 0 | 0.8 |
| The kit drifts into product features | The scope rule, enforced by every phase gate | Every gate |

### Open questions

None open. The owner answered review rounds 1 to 5 on 2026-11-18; the answers are
folded into §2.3, §2.4, §2.5, §2.6, §3.3 and the tasks.

---

Change log: 2026-11-12 first draft, skeleton verified. 2026-11-13 framework-free core.
2026-11-15 renamed to qlastakit, design grill, phases 0-4. 2026-11-17 references, UI kit
audit, token theming, UI architecture kept. 2026-11-18 v2 from the brief: kit-only scope,
v1 done on the reference deploy, Phase 4 is the reference deploy, section 4 questions
closed, email adapters and caps, plans, uploads, AI demo limits. 2026-11-18 review
rounds 1 to 5 and the owner's answers: Better Auth client and AI chat hook as the two
client exceptions, Tabler, stacked-side shell and side auth layout, roles and the
one-owner rule, invite caps and undo, read-only email, org limit 5, personal org is
ordinary, Google links only onto a verified password account, the one-time product
can be bought more than once, VPS at 200 ms, notes kept; Google sign-in and
settings moved to Phase 3.

Tier: full. Next: `scripts/prd-review.sh`.
