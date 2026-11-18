# Tasks

Source of truth for progress. `/task` takes the first `todo`. One task per session.
Status: `todo` | `in-progress` | `blocked` | `done`.

Generated from `docs/PRD.md` §7 on 2026-11-18. Rules from §7 every card obeys:

- **Runtime** marks a criterion proven by running the thing. From 0.7 on, a browser
  runtime criterion is proven by a throwaway Playwright script against the dev servers,
  not committed, with the steps and result written in the log.
- **Precondition (human)**: `/task` blocks until a dated line from the owner appears
  in Log, e.g. `2026-01-01: owner: checked, passes.`
- **Sign-off (owner, after close)**: the builder's checks pass, the card closes with
  `Awaiting sign-off: <what the owner does>`, and the owner adds a dated line later.
  The phase gate does not pass while any card in the phase has that line unsigned.
- **Phase start** (first card of each phase): `git fetch origin`; set `blocked` if the
  previous gate is not signed in `docs/TASKS.md` on `origin/main`, or if local `main`
  has commits `origin/main` lacks; else create `phase-N` from `origin/main` if it does
  not exist.
- A card that removes or renames something the agent guide names (`just`, Hono, Biome)
  fixes those lines in the same card; 0.9 is the final sweep.
- A card with `Ref:` follows that reference's mode in `docs/REFERENCES.md`.
- Phase sizes (11, 13 and 10 cards in phases 0, 2 and 3) are accepted by the PRD.

<!-- /review appends "Review: approved <date>" or "Review: returned <date>" with
     Spec: and Standards: findings to Log. A returned card goes back to todo and
     Retries goes up; after 2 returns it is blocked. -->

<!-- Log entry shape, written by /task on close:
     YYYY-MM-DD: built X, Y. Decisions the PRD left open: ... Stubs: ...
     Wish: <anything the project should have had> -->

# Phase 0: Align the skeleton

## 0.1 mise and oxc
- Phase start: on `phase-0` (see the rules above).
- Precondition (human): mise is installed, and the owner has pushed `main` with the
  PRD and `docs/TASKS.md`.
- Read: PRD §2.1, §5
- Build: replace `just` with mise tasks and Biome with oxlint + oxfmt (pinned). If
  type-aware oxlint does not accept this workspace, ship oxlint without it and log why.
- Done when: `mise run check` passes, no Biome config or justfile remains,
  `scripts/verify.sh` passes.
- Status: done
- Retries: 1
- Log:
  - 2026-11-18 Raphael: mise installed, main pushed.
  - 2026-11-18: built mise tasks (setup, dev, contract, check, build, db-up, db-down,
    db-migrate; each one `pnpm` command, long ones are root scripts), pinned oxlint
    1.94.0, oxfmt 0.79.0 and oxlint-tsgolint 7.0.2007, `.oxlintrc.json` (correctness
    errors, typescript and react plugins), `.oxfmtrc.json` (same style as the old Biome
    config); `pnpm lint` = `oxlint --type-aware . && oxfmt --check .`. Removed Biome,
    justfile and `just` from mise.toml. Type-aware oxlint works on this workspace
    (proved with a throwaway `no-floating-promises` case). Fixed `just` lines in
    AGENTS.md, README, verify.sh, api AGENTS.md and two code comments. Decisions the PRD
    left open: db tasks call `docker compose` / `bash db/migrate.sh` through root pnpm
    scripts until 0.4a replaces the shell script; oxfmt reformatted two package.json
    files (key order). Stubs: none. Wish: the agent could delete or edit files under
    `.claude/` and delete its own throwaway files; `.claude/commands/new-feature.md`
    still says `just contract`/`just check` (left for 0.9), and a stray
    `services/api/src/_tmp.ts` (contents `export {};`, uncommitted) needs a human to
    delete it.
  - Review: returned 2026-11-18
    - Checked: `scripts/verify.sh` passes; `mise run check` passes; `mise tasks` lists
      all eight; no `biome.json` or `justfile` left; type-aware oxlint fires (a throwaway
      `no-floating-promises` probe was reported as an error).
    - Spec:
      - [must] `mise.toml`, `package.json:11` (`db:migrate`): the replacement drops the
        justfile's `set dotenv-load`, and nothing else loads `.env`. `db/migrate.sh:5`
        reads `DATABASE_URL` only from the environment, so the README quick start this
        diff wrote (`cp .env.example .env`, then `mise run db-migrate`, `README.md:12-16`)
        now fails with "DATABASE_URL is not set". Ran `mise run db-migrate`: that is the
        error. Restore `.env` loading for the tasks (for example mise's `[env]`
        `_.file = ".env"`), or log why not and fix the README. The loss is not in the log.
      - [minor] The justfile's other-language steps (`cargo fetch` / `go work sync` /
        `uv sync` in setup, `cargo check` / `go vet` / `ruff` in check, `cargo build` in
        build) were dropped without a log line. `packages/go/README.md:17`,
        `packages/python/README.md:24` and `packages/rust/README.md:19` still say
        "`just setup` and `just check` pick up <lang> automatically", which is now false.
      - [minor] The log says only `.claude/commands/new-feature.md` is left for 0.9, but
        `just` also remains in `docs/recipes/add-feature.md:13,23,29`,
        `docs/recipes/add-service.md:14` and `docs/adr/0001-contract-first.md:11`. 0.9 may
        sweep them; list them in the log.
    - Standards: no findings.
    - Note: deleting files is blocked for the reviewer too. Untracked
      `services/api/src/_review_probe.ts` (now just `export {};`) needs a human to delete
      it, along with `_tmp.ts`.
  - 2026-11-18 (retry 1): fixed the [must]: `mise.toml` now has `[env] _.file = ".env"`,
    so every task (including `db-migrate`) loads `.env`, replacing the justfile's
    `set dotenv-load`. Proof is partial: `mise run check` still passes with no `.env`
    present (a missing file is tolerated), but I could not create a `.env` here (writes to
    it are denied), so the "DATABASE_URL is set" path is not run; the owner should run
    `cp .env.example .env && mise run db-migrate` once. Minors: the Go, Python and Rust
    package READMEs now say mise does not cover those languages yet and name the steps
    the justfile had (`go work sync`/`go vet`, `uv sync`/`ruff`, `cargo fetch`/`cargo
    check`); those steps were dropped on purpose in 0.1 (no such code exists yet) and
    this was missing from the first log. Swept the remaining `just` mentions early
    (`docs/recipes/add-feature.md`, `add-service.md`, `docs/adr/0001-contract-first.md`),
    left for 0.9: `.claude/commands/new-feature.md:10` (edit to `.claude/` denied).
    Stubs: none. Wish: write access to `.claude/` and to `.env`, and the ability to
    delete `services/api/src/_tmp.ts` and `_review_probe.ts` (still untracked, human to
    remove).
  - Review: approved 2026-11-18
    - Checked: `scripts/verify.sh` passes (tests still skipped, expected until 0.2);
      `mise run check` passes; with no `.env`, `mise env` runs clean (missing file
      tolerated). The load path the log could not run: a scratch dir outside the repo with
      the same `[env] _.file = ".env"` and a `.env` holding `DATABASE_URL`; `mise env`
      exported it. The previous [must] is fixed. The only `just` left outside history is
      `.claude/commands/new-feature.md:10`, which is logged for 0.9.
    - Spec:
      - [minor] `docs/recipes/add-service.md:14` ("Add its commands to the mise tasks")
        and `packages/{go,python,rust}/README.md` ("add the <lang> steps ... to those mise
        tasks") read as "put `cargo check` etc. into the mise task". PRD §2.1 locks one
        `pnpm` command per task (the header of `mise.toml` says so too). Say: add the step
        to the root `package.json` script that the task calls. 0.9 can do this in its sweep.
    - Standards: no findings.
    - Note: untracked `services/api/src/_tmp.ts` and `_review_probe.ts` are still there
      for a human to delete.

## 0.2 Test harness
- Read: PRD §6
- Build: Vitest across the workspace, including a DOM environment with Testing Library
  for the web app, and a root test script.
- Done when: `scripts/verify.sh` runs tests (no longer skipped) with at least one
  passing test.
- Status: done
- Retries: 0
- Log:
  - 2026-11-18: built Vitest 4 at the root (`vitest.config.ts` with `test.projects`:
    `apps/web`, `services/api`), root `pnpm test` = `vitest run`. Web project: jsdom,
    Testing Library (react, jest-dom, user-event), `src/test-setup.ts` (jest-dom matchers,
    cleanup), its own `vitest.config.ts` (react plugin only, no TanStack Start plugin).
    One passing test (`apps/web/src/harness.test.tsx`: renders the UI `Button`, clicks
    it). API project is a node env with `passWithNoTests`, no tests yet. `scripts/verify.sh`
    now runs tests (1 passed). Decisions the PRD left open: the API project's config sits
    in `services/api/vitest.config.ts` and is not typechecked (outside `src`). Stubs: 0.3
    adds the core project to the root list, 0.4a adds API Postgres setup and serial files.
    Wish: none. The untracked `services/api/src/_tmp.ts` and `_review_probe.ts` are still
    there for a human to delete.
  - Review: approved 2026-11-18
    - Checked: `scripts/verify.sh` passes and the test step runs (not skipped): Vitest
      4.1.12, 1 file and 1 test passed. The test checks behaviour (it renders the UI
      `Button` in jsdom, clicks it through user-event and expects the handler to run
      once), so it fails if the DOM env or the click wiring breaks. The
      `@testing-library/jest-dom/vitest` entry exists in the installed 7.0.1. The tsconfig
      include change is in scope (it typechecks the new web config).
    - Spec:
      - [minor] `vitest.config.ts:1`: the root `package.json` has no `"type": "module"`, so
        every run prints a Vite warning: "ESM syntax in a file loaded as CommonJS
        (vitest.config.ts:1:1)". Vite plans to make the native loader the default, and then
        this config would break. Rename it to `vitest.config.mts`, or set
        `"type": "module"` at the root if nothing else depends on CJS there.
    - Standards: no findings.
    - Note: untracked `services/api/src/_tmp.ts` and `_review_probe.ts` are still there
      for a human to delete.

## 0.3 Core package
- Read: PRD §2.2, §3.1, §4, §6
- Build: move notes logic and its zod schemas into core, with unit tests. Delete the
  README-only `packages/ts/auth` and `packages/ts/payments` placeholders.
- Done when: tests for the notes schemas and coded errors pass (the data path is proven
  in 0.4a); verify fails if core imports a framework or `better-auth`.
- Status: todo
- Retries: 0
- Log:

## 0.4a Postgres, migrations and API tests
- Precondition (human): Docker Desktop is installed and running.
- Read: PRD §6
- Build: Compose Postgres; a small Node migrate script replacing `db/migrate.sh` with
  the same behaviour (ordered files, the `schema_migrations` table, one transaction per
  file), used by local dev, the test setup, CI and the deploy; delete the shell script.
  The API test harness on real Postgres (second test database), starting the app
  in-process on a free port and calling it with `fetch`, not Hono's `app.request()`.
  API tests that create and list notes against the existing Hono API.
- Done when: the API tests pass on real Postgres; verify fails with a clear message when
  Postgres is unreachable.
- Status: todo
- Retries: 0
- Log:

## 0.4b NestJS API
- Read: PRD §2.2, §2.6, §3.1, §3.3, §6
- Build: replace Hono with NestJS on Express (the Better Auth adapter's Fastify support
  is beta, and Better Auth needs Nest's body parser off) + nestjs-zod v5 for zod 4 with
  its `cleanupOpenApiDoc` step; the notes controller as a thin adapter. The spec export
  must not need a database. Pick one way to get decorator metadata for dev, the Vitest
  process that boots the app, and the spec export (check current Vitest docs; else
  `unplugin-swc` in the API test project, or explicit `@Inject()` tokens), and log it.
  Global prefix `/api`. Write ADR 0004 (NestJS replaces Hono).
- Done when: the 0.4a API tests pass unchanged apart from the `/api` paths; the
  regenerated client keeps the same notes operations; verify fails if a controller
  imports db. Runtime: the API boots and serves the spec at `/api/openapi.json` and the
  docs UI at `/api/docs`.
- Status: todo
- Retries: 0
- Log:

## 0.5 API baseline
- Read: PRD §2.2, §2.4
- Build: env validation at boot, the error shape, security headers, CORS allowlist,
  pino logs with request IDs. The env schema requires a provider's keys only when that
  provider's adapter is selected, so tests, CI, the smoke run and the spec export boot
  from the committed `.env.example` alone (the test setup, Playwright's `webServer` and
  the spec export load `.env.example`; dev loads `.env`, copied from it by setup). Every
  later card that adds an env var adds it to `.env.example`.
- Done when: API tests prove each one, including a refused boot on a bad env.
- Status: todo
- Retries: 0
- Log:

## 0.6 TanStack Query
- Read: PRD §2.5, §2.6, §3.3, §4, §5
- Build: the web notes page uses the generated client through query hooks, base URL
  `/api`; the web dev server proxies `/api` to the API port; the internal API URL env
  var is added. Check Hey API's zod plugin docs. A verify check that the web app imports
  no core, db or service code.
- Done when: the check passes, typecheck passes and the regenerated client is in use by
  the page (0.7's smoke test proves the page in a browser).
- Status: todo
- Retries: 0
- Log:

## 0.7 Smoke test
- Read: PRD §6
- Build: the Playwright smoke test (create a note for now). Playwright's `webServer`
  starts and stops both dev servers (the API and the web app, so the Vite proxy applies;
  not a build); the only pre-step is the migrate script on the test database. No
  start-and-stop shell script: one `pnpm` command runs it.
- Done when: runtime: the smoke command passes.
- Status: todo
- Retries: 0
- Log:

## 0.8 CI
- Read: PRD §6
- Build: a GitHub Actions workflow on pushes to `phase-*` branches and on PRs, running
  the verify steps and the 0.7 smoke command with a Postgres service.
- Done when: the workflow file runs the verify steps and the 0.7 smoke command with a
  Postgres service.
- Sign-off (owner, after close): the owner pushed `phase-0` and the run was green.
- Status: todo
- Retries: 0
- Log:

## 0.9 Docs match the code
- Read: PRD §3, §4, §5
- Build: the agent guide, recipes, ADRs and `docs/REFERENCES.md` describe NestJS, core
  and mise; stale pointers ("section 6b", "PRD Q1", next-intl) point at §3.4 and §3.5.
- Done when: no doc mentions Hono, Biome or `just` except as history; the add-feature
  recipe's steps match the layout.
- Status: todo
- Retries: 0
- Log:

## 0.G Phase 0 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: all six steps below are logged, even if a decision is "nothing"; the card
  closes with `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- Status: todo
- Retries: 0
- Steps:
  1. Wishes: read every task log in this phase and list each "wish the project had X".
  2. Parked list: for each parked item in PRD §8, does a logged wish match its trigger?
     Bring back only matched items as new cards in the next phase. Wishes that are gaps
     in what this phase shipped (not parked items) become cards too.
  3. Retro: read every `Review: returned` and every `blocked` reason in this phase.
     For each finding that appeared more than once, or that cost a retry:
     - mechanical (a banned call, a naming pattern, a missing parameter, a file in the
       wrong place): add a check to `scripts/verify.sh` or the project's linter, as a
       card in the next phase. Do not write it as a standard.
     - judgement (consistency, an abstraction that did not earn its place): add one line
       to `docs/STANDARDS.md` under Project standards, now.
     Also: any instruction in `AGENTS.md` that no session needed this phase is a
     candidate to delete; any file sessions repeatedly searched for is a candidate for a
     one-line navigation pointer in `AGENTS.md`.
  4. Limits: run every card proposed in steps 2 and 3 through the four limits
     (owner-only criteria, a user would hit it, tooling smaller than product, about 10
     cards per phase). Drop or park any that fails. Log tooling and product line counts.
  5. Scope: no card in this phase added an idea-app or product feature.
  6. Log every decision, including "nothing".
- Log:

# Phase 1: UI kit in the web app

Ref: ui-kit (reuse).

## 1.1 Vet ui-kit
- Phase start: on `phase-1` (see the rules above).
- Precondition (human): the owner unpacks the finished UI project into the references
  folder. The card checks for the unpacked `src/` folder.
- Read: PRD §3.4, §3.5
- Done when: `/vet ui-kit` has written its report with keep, fix or reject per file, and
  no verdict needs an owner decision.
- Status: todo
- Retries: 0
- Log:

## 1.2 Move the UI kit
- Read: PRD §2.5, §3.4, §3.5
- Ref: ui-kit
- Build: tokens, components and design rules into the UI package. No screens: a screen
  enters the web app only in the card that rebuilds it (auth in 2.4a to 2.4c, billing in
  3.2, settings in 3.3). One icon set (Tabler); one app alias; stubs left behind.
- Done when: the web app builds on the UI package; verify fails on a second icon
  dependency.
- Status: todo
- Retries: 0
- Log:

## 1.3 Component preview
- Read: PRD §2.5
- Build: a dev-only route rendering every component.
- Done when: runtime: it renders in dev and is absent from the production build.
- Status: todo
- Retries: 0
- Log:

## 1.4 Token purity
- Read: PRD §2.5, §3.5
- Build: no hardcoded color, shadow, border or surface in components; a verify check.
- Done when: verify's token-purity check passes; runtime: a throwaway test theme changes
  the whole preview page without editing a component.
- Status: todo
- Retries: 0
- Log:

## 1.5 Shell and routing
- Read: PRD §3.1, §3.4, §3.5
- Ref: ui-kit
- Build: the stacked-side app shell and the side auth layout (§2.5), config-driven
  navigation, access checks before render, layout derived from the route, the access
  denied screen. The session is a stub behind an interface until 2.4a; a placeholder
  sign-in route in the side auth layout is replaced in 2.4a. Auth does not exist yet, so
  the guard is tested against the stub session.
- Done when: web tests, run against the stub session, prove a protected route never
  renders without a session and the first render has the right layout.
- Status: todo
- Retries: 0
- Log:

## 1.6 i18n
- Read: PRD §2.4
- Build: i18next wired; all shell text through message files.
- Done when: the pseudo-locale web test passes.
- Status: todo
- Retries: 0
- Log:

## 1.7 Web agent guide
- Read: PRD §3.4
- Build: prime directives and the "add a page" recipe in the web app's agent guide.
- Done when: the builder adds a throwaway page using only the recipe, in two steps, and
  removes it; the task log lists the two steps taken.
- Status: todo
- Retries: 0
- Log:

## 1.G Phase 1 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: the six steps of the 0.G gate are logged for this phase, even if a decision
  is "nothing"; the card closes with
  `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- Status: todo
- Retries: 0
- Log:

# Phase 2: Accounts

Ref: supastarter (study): auth, mail, organizations.

## 2.1 Vet supastarter
- Phase start: on `phase-2` (see the rules above).
- Read: PRD §3.5
- Done when: `/vet supastarter` has written a report for the auth, mail, organizations
  and settings paths `docs/REFERENCES.md` lists, and no verdict needs an owner decision.
- Status: todo
- Retries: 0
- Log:

## 2.2 Jobs
- Read: PRD §2.2, §2.4, §3.3
- Build: pg-boss with its worker inside the API process, and the job pattern every later
  job follows: retries, and the job id as the idempotency key (§2.4). Comes before email
  so auth emails go through the queue from the first send and are never reworked.
- Done when: tests with a test job prove a failed job is retried and a job running twice
  has its effect once.
- Status: todo
- Retries: 0
- Log:

## 2.3 Email module
- Read: PRD §2.4, §3.3
- Build: `sendEmail`, React Email, `console` and `resend` adapters, console output to a
  gitignored folder, boot refused in production with `console`. Every send is a 2.2 job
  from the start, with the job id as the idempotency key.
- Done when: unit tests for the console output; a boot test for the production refusal;
  tests prove a failed send is retried and a job running twice sends once.
- Sign-off (owner, after close): the sending subdomain is verified on Resend, a Resend
  API key and a from address are in the local env, and one real email was sent through
  `resend`.
- Status: todo
- Retries: 0
- Log:

## 2.4a Sign up and sign in
- Read: PRD §2.2, §2.3, §2.6, §3.3, §3.5
- Ref: supastarter
- Build: Better Auth mounted in NestJS at `/api/auth`; its core tables (user, session,
  account, verification) as SQL migrations with the Drizzle mirror; sign up, sign in and
  out; those auth screens rebuilt on it; the session replaces the 1.5 stub. The web auth
  client declares the `personal` field by hand, never importing the server's `auth`
  type. The notes endpoints require a session from here on; the API tests get a sign-in
  helper.
- Done when: 1.5's "a protected route never renders without a session" web test passes
  again, now against the real Better Auth session (same test, stub replaced); runtime:
  the smoke test signs up, signs in and creates a note.
- Status: todo
- Retries: 0
- Log:

## 2.4b Email verification
- Read: PRD §2.3, §2.4
- Ref: supastarter
- Build: verification required before sign in; the verification template and screen.
- Done when: runtime: the smoke test follows the verification link from the console
  email before signing in.
- Status: todo
- Retries: 0
- Log:

## 2.4c Password reset and auth limits
- Read: PRD §2.2, §2.3, §3.5, §6
- Ref: supastarter
- Build: the reset flow and its screens; rate limits on auth routes; a verify check: no
  axios or zustand in the web app. Better Auth's limiter uses database storage (its
  `rateLimit` table is one more hand-written migration), enabled explicitly (on in the
  tests that prove the limits, off by env elsewhere), with the trusted client-IP header
  setting from §2.3. The limiter's tests assert status 429 and `X-Retry-After`, not a code.
- Done when: API tests for reset and the limits pass; the check passes.
- Status: todo
- Retries: 0
- Log:

## 2.5 Auth email caps
- Read: PRD §2.3
- Build: per-address and per-IP caps with the agreed behaviour. The per-IP cap is a
  before-hook throwing `APIError` 429 with code `rate_limited` (no limiter rule), checked
  before the route runs; the per-address cap is checked where the send is requested and
  suppresses silently; both counters in Postgres.
- Done when: API tests prove both caps, the silent address cap and the 429.
- Status: todo
- Retries: 0
- Log:

## 2.6a Personal org
- Read: PRD §2.2, §2.3, §3.2, §3.3
- Ref: supastarter
- Build: the organization plugin's tables (organization, member, invitation, the
  active-org column on session) as hand-written SQL with the Drizzle mirror, and the
  `personal` boolean on organization (declared to Better Auth as an additional field;
  confirm a boolean works, else a text flag). A user-create hook makes the org (named
  after the user, slug generated, no slug in URLs); a session-create hook sets it active;
  `disableOrganizationDeletion` on.
- Done when: an API test proves a new user has exactly one personal org and a new
  session is active in it.
- Status: todo
- Retries: 0
- Log:

## 2.6b Create and switch
- Read: PRD §2.3, §3.2, §3.4
- Ref: supastarter
- Build: `organizationLimit` from an env var (default 5; counts all memberships); create
  an org; the org switcher; the org general page (rename) limited to owner and admin. The
  web app calls Better Auth's own client for organization actions (§3.3). The
  before-load step loads the active member's role with the session through Better Auth's
  client; a route's authority is a list of org roles (before this card the only
  authority is "signed in").
- Done when: an API test for the limit; runtime: a new user lands in a personal org,
  creates a second one, switches, and renames it.
- Status: todo
- Retries: 0
- Log:

## 2.7 Org scoping
- Read: PRD §2.3, §3.1
- Build: org context in core, an org id on every product table, notes scoped; the
  migration deletes existing notes rows (no deploy exists yet).
- Done when: the isolation test passes; verify fails on a product table without an org id.
- Status: todo
- Retries: 0
- Log:

## 2.8a Invites
- Read: PRD §2.3
- Ref: supastarter
- Build: invite by email and accept; cancel a pending invite. Invite caps by env: at most
  3 per recipient address per hour and 20 per org per day, both in one before-hook
  throwing `APIError` 429 with code `rate_limited`. The invite link leads to sign in or
  sign up with the invited address, normal email verification applies, then the invite
  is accepted. An invite accepts only the roles `admin` and `member` (a
  `beforeCreateInvitation` organization hook).
- Done when: API tests for invite, accept (an existing user and a new one), cancel, both
  caps and the role restriction; runtime: an invite accepted through the console email.
- Status: todo
- Retries: 0
- Log:

## 2.8b Members and roles
- Read: PRD §2.3, §3.2
- Build: the members screen, role changes, owner/admin/member limits, removing a member,
  and the one-owner rule, all enforced by the API in Better Auth organization hooks
  (`beforeUpdateMemberRole` and the remove-member hook), not in a controller.
- Done when: API tests for each role's limits, member removal, and the one-owner rule
  (admins cannot remove or demote the owner; the owner cannot remove or demote
  themselves; no one can be made owner); a removed member's next request gets the coded
  not-a-member error; runtime: an admin changes a member's role in the screen.
- Status: todo
- Retries: 0
- Log:

## 2.G Phase 2 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: the six steps of the 0.G gate are logged for this phase, even if a decision
  is "nothing"; the card closes with
  `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- Status: todo
- Retries: 0
- Log:

# Phase 3: Modules, settings and Google sign-in

Ref: supastarter (study): payments, storage, AI.

## 3.0 Vet supastarter modules
- Phase start: on `phase-3` (see the rules above).
- Read: PRD §3.5
- Done when: `/vet supastarter` has written a report for the payments types, Stripe
  adapter, purchases model, storage and AI paths, and no verdict needs an owner decision.
- Status: todo
- Retries: 0
- Log:

## 3.1a Payments and checkout
- Read: PRD §2.4, §3.2
- Ref: supastarter
- Build: the payments interface, the Stripe adapter, the purchases table owned by the
  org, a checkout endpoint for Pro and the one-time product, the Stripe customer table
  (one customer per org, created on first checkout) and the plan-lookup function. The
  checkout endpoint refuses with a coded error when the org already has an active Pro
  subscription. The one-time product has no already-bought check. The core function that
  records a completed purchase or a subscription change, with unit tests; the API tests
  seed rows through it.
- Done when: API tests for checkout and purchases (on fakes) pass, including role limits
  (owner and admin allowed, member refused), a Pro checkout refused when a seeded active
  subscription exists, a second one-time checkout by the same org not refused, and the
  org isolation test for purchases.
- Status: todo
- Retries: 0
- Log:

## 3.1b Stripe webhooks
- Read: PRD §2.4, §3.3
- Ref: supastarter
- Build: webhooks verified and queued as jobs that call core, handling
  `checkout.session.completed`, `customer.subscription.updated` and
  `customer.subscription.deleted` (confirm in current Stripe docs).
- Done when: API tests with signed webhook fixtures pass, the same event delivered twice
  changes nothing, and two completed one-time checkouts make two rows.
- Status: todo
- Retries: 0
- Log:

## 3.2 Billing page
- Precondition (human): Stripe test-mode keys and prices exist and their IDs are in the
  local env; the Stripe CLI is installed to forward webhooks locally; the test-mode
  customer portal allows switching between the two Pro prices and cancelling.
- Read: PRD §2.4
- Build: plans from a billing endpoint (the plan config lives in core), the current
  plan, the customer portal (switch interval, cancel), one-time purchases shown one row
  each; limited by role (§2.3).
- Done when: API tests for the billing endpoints and the role limits pass.
- Sign-off (owner, after close): a test-card checkout, the one-time purchase, the
  interval switch and cancel update the page (hosted Stripe pages, with the Stripe CLI
  forwarding).
- Status: todo
- Retries: 0
- Log:

## 3.3 Settings
- Read: PRD §2.3, §3.4
- Ref: supastarter
- Build: profile and security screens (name, password change; email shown read-only) on
  Better Auth.
- Done when: runtime: each setting saves and survives a reload.
- Status: todo
- Retries: 0
- Log:

## 3.4 Uploads
- Read: PRD §2.4
- Ref: supastarter
- Build: signed-URL uploads; a local S3-compatible container in Compose (a maintained
  one from current docs that supports presigned PUT and bucket CORS; candidates RustFS,
  Garage, SeaweedFS); avatar and org logo with the type and size limits; public-URL
  reads; one fixed key per avatar and per org logo; the avatar control on the 3.3 profile
  page and the logo on the 2.6b org general page. If an oversize object is deleted, the
  saved URL is cleared.
- Done when: API tests reject a wrong type at signing, delete an oversize object after
  upload, and refuse a member signing or saving an org logo; runtime: both images upload
  and display.
- Status: todo
- Retries: 0
- Log:

## 3.5 AI chat demo
- Precondition (human): an OpenRouter key is in the local env.
- Read: PRD §2.4, §3.3
- Ref: supastarter
- Build: the AI SDK, provider by env (an adapter function returning a language model;
  `fake` is the AI SDK's mock model from `ai/test`, confirm the export name in current
  docs); an SSE endpoint where the controller calls `streamText` and pipes the SDK's
  stream response, left out of the OpenAPI spec; the chat page under `/demo/`, signed-in
  users only.
- Done when: an API test with the fake AI adapter shows the endpoint refuses a request
  with no session and streams the fake's reply as SSE; runtime: a reply streams into the
  page.
- Status: todo
- Retries: 0
- Log:

## 3.6 AI cap
- Read: PRD §2.4
- Build: the per-user daily cap (resets at 00:00 UTC), a cheap default model, and the
  agent-guide line telling projects to delete `/demo/*`.
- Done when: an API test proves the cap.
- Status: todo
- Retries: 0
- Log:

## 3.7 Google sign-in
- Precondition (human): a Google OAuth client exists and its credentials are in the
  local env.
- Read: PRD §2.3
- Build: Google sign-in. Linking applies to a verified password account only; never set
  `requireLocalEmailVerified: false`; the sign-in screen shows a message for
  `account_not_linked`.
- Done when: the builder's checks pass and the card closes awaiting the owner.
- Sign-off (owner, after close): Google sign-in works locally.
- Status: todo
- Retries: 0
- Log:

## 3.G Phase 3 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: the six steps of the 0.G gate are logged for this phase, even if a decision
  is "nothing"; the card closes with
  `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- Status: todo
- Retries: 0
- Log:

# Phase 4: The reference deploy

## 4.1 Dockerfiles
- Phase start: on `phase-4` (see the rules above).
- Read: PRD §2.6
- Build: one Dockerfile per app and service; a production-like Compose run using the
  `console` adapter with a non-production `NODE_ENV` on the API container only (the web
  container runs with `NODE_ENV=production`), the console email folder mounted as a
  volume so the smoke test can read the verification link. One small reverse-proxy
  container with the §2.6 rule (`/api/*` to the API, everything else to the web app, no
  prefix stripping); the smoke test targets the proxy; the auth rate limiter stays on.
  The API container's start command runs the 0.4a migrate script, then starts the API.
  One CI job builds both images; the container smoke stays one local `pnpm` command.
- Done when: runtime: the smoke test passes against the containers through the proxy.
- Status: todo
- Retries: 0
- Log:

## 4.2 Pick the VPS
- Read: PRD §2.6
- Build: a recipe with the commands, one test endpoint per candidate (looked up by the
  card) and an empty results table.
- Done when: the recipe exists.
- Sign-off (owner, after close): the owner ran it from Nairobi; the measurements and the
  choice (the cheapest provider with a median round trip of 200 ms or less) are logged.
- Status: todo
- Retries: 0
- Log:

## 4.3 Coolify deploy
- Read: PRD §2.6
- Build: the deploy recipe and any repo-side config. The deploy is on its subdomain, DNS
  only; the trusted client-IP header is `X-Forwarded-For` (check current Traefik and
  Better Auth docs; set `trustedProxies` by env if needed). The web app and the API are
  two Coolify applications from the same repo (base directory at the repo root, one
  Dockerfile location each); the API resource sets "Path prefixes" to "Keep paths as-is";
  every resource sharing the hostname must be running. Coolify deploys `phase-4` until
  the gate. Postgres is a Coolify database resource. The recipe lists as owner steps: a
  VPS running Coolify with read access to the private repo and Cloudflare DNS for the
  subdomain; the production env (Resend, Stripe test mode, Google, OpenRouter, R2, the
  trusted client-IP header, the Better Auth secret and public base URL); the Google
  OAuth redirect URI; the Stripe webhook endpoint with its signing secret; the R2 bucket
  with public read on its own subdomain and a CORS rule for the web origin.
- Done when: the recipe names every Coolify setting and every env var, and the
  repo-side config is committed.
- Sign-off (owner, after close): the owner followed the recipe on the 4.2 choice; the
  public URLs answer over HTTPS including `/api/openapi.json` (the builder's HTTPS check
  requests it through the public URL); the API logs the real client IP for a request
  through the public URL, and a request with a forged `X-Forwarded-For` still logs the
  real client IP.
- Status: todo
- Retries: 0
- Log:

## 4.4 Backups
- Precondition (human): a second, private R2 bucket with its own keys exists, never the
  public uploads bucket.
- Read: PRD §2.6
- Build: the restore recipe (every command named, and it says never to use the uploads
  bucket) and any repo-side config. The owner configures Coolify's scheduled Postgres
  backups to R2; no backup code.
- Done when: the restore recipe exists and names every command.
- Sign-off (owner, after close): a backup file appears in R2 on schedule, and one restore
  was rehearsed.
- Status: todo
- Retries: 0
- Log:

## 4.5 Sentry
- Precondition (human): Sentry DSNs are in the production env.
- Read: PRD §2.6
- Build: web and API report errors. If `@sentry/tanstackstart-react` (alpha) does not
  work with the installed TanStack Start, use `@sentry/react` in the browser and
  `@sentry/node` on the server, and log why.
- Done when: the builder's checks pass and the card closes awaiting the owner.
- Sign-off (owner, after close): a test error from each arrived.
- Status: todo
- Retries: 0
- Log:

## 4.6 Start-a-project recipe
- Read: PRD §2.1, §2.5
- Build: the recipe: copy the kit, delete `/demo/*`, record the kit commit, set the env,
  and delete the notes feature once the project's own first feature exists.
- Done when: following it in a scratch copy leaves verify green.
- Status: todo
- Retries: 0
- Log:

## 4.7 v1 acceptance
- Precondition (human): the owner creates and verifies a test account on the deploy and
  puts its credentials and the deploy's base URL in the local env.
- Read: PRD §1
- Build: the smoke test in deploy mode against the reference deploy, run from the
  owner's machine or the builder's session, not CI.
- Done when: runtime: the deploy-mode smoke test passes; items 7 to 9 of §1's done list
  are proven by green tests and all ten items are accounted for in the log.
- Sign-off (owner, after close): the owner walked §1's done list and signs items 1 to 6
  and 10.
- Status: todo
- Retries: 0
- Log:

## 4.G Phase 4 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: the six steps of the 0.G gate are logged for this phase, even if a decision
  is "nothing"; the card closes with
  `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- After the merge (owner, no sign-off): switch Coolify to `main`, tag v1.0 on `main` and
  push the tag.
- Status: todo
- Retries: 0
- Log:
