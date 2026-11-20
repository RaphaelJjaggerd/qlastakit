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
- Status: done
- Retries: 1
- Log:
  - 2026-11-18: built `@qlastakit/core` (`packages/ts/core`): `CodedError(code, message)`,
    notes zod schemas (plain zod, no `.openapi`), `listNotes(db)` / `createNote(db, input)`
    with the db passed in. Tests: schemas and `CodedError` (core Vitest project added to
    the root list; 7 tests plus the web one pass). The API notes routes now import core and
    name its schemas with `.openapi("Note")` / `.openapi("CreateNote")`; contract is
    unchanged (drift check green). Removed the feature's `schema.ts`/`service.ts`,
    `lib/errors.ts` (`AppError`) and the `auth` and `payments` README placeholders.
    The import ban is an oxlint `no-restricted-imports` override for `packages/ts/core/**`
    (nestjs, hono, express, fastify, tanstack, react, better-auth), so it runs in
    `pnpm lint` and verify; proved with a throwaway probe importing `hono` and
    `better-auth` (both reported). Decisions the PRD left open: core depends on
    `@qlastakit/db` and `drizzle-orm` (PRD 2.2 allows the Drizzle mirror); core errors carry
    no HTTP status, the Hono `onError` maps code to status (`not_found` 404, else 400) until
    0.4b; `createNote` takes `unknown` and validates itself, throwing `validation_error`;
    the Hono default hook still validates first. No fake-db test: the data path is proven
    in 0.4a. Stubs: none. Wish: permission to delete files from the shell (the probe
    `packages/ts/core/src/_probe.ts`, now `export {};`, plus `services/api/src/_tmp.ts` and
    `_review_probe.ts`, are untracked and need a human to delete; the probe file is not
    committed).
  - Review: returned 2026-11-18
    - Checked: `scripts/verify.sh` passes (typecheck, lint, tests, contract up to date).
      Import ban: a throwaway probe in `packages/ts/core/src/_probe.ts` importing
      `@nestjs/common`, `@tanstack/react-query`, `react`, `better-auth/plugins`, `express`
      and `fastify` got six `no-restricted-imports` errors from oxlint; `zod` passed. The
      probe is back to `export {};`. One zod copy (4.6.7) in the lockfile, so `.openapi()`
      on core's plain zod schemas works, and the contract did not change.
    - Spec:
      - [must] Coded errors are not tested where they matter. `errors.test.ts:5-10` only
        checks that the `CodedError` constructor keeps its arguments. The one coded error
        core throws, `createNote` → `validation_error` (`notes/service.ts:18`), has no test,
        and it needs no database: validation runs before `db` is touched. PRD §6 asks core
        tests to cover validation and coded errors. Add a test that `createNote` rejects bad
        input with a `CodedError` whose `code` is `validation_error` (a stub `db` is fine,
        it is never reached).
      - [must] Stale agent-guide lines, not fixed and not logged. The card deleted
        `services/api/src/features/notes/service.ts` and `schema.ts`, but `AGENTS.md:64`
        (golden rule 2) still says business logic goes in
        `services/api/src/features/<name>/service.ts`. `docs/recipes/add-feature.md:17-18`
        still says to copy the notes feature and adapt `schema.ts`, `service.ts` and
        `routes.ts`. The rules at the top of this file say a card that removes something
        the agent guide names fixes those lines in the same card. Only
        `services/api/AGENTS.md` was updated. The next builder will be sent to a file that
        no longer exists. Point both at `packages/ts/core` (schemas and the core function)
        plus the API route. Recurs: 0.1 also left stale doc mentions after a removal (its
        [minor]s on `just` in recipes and package READMEs).
      - [minor] PRD §3.1 says a core function takes "an org context as arguments".
        `listNotes(db)` and `createNote(db, input)` take none. That is right for now (notes
        has no org id, and no org table exists until 2.6a), but the log does not list it as
        a decision the PRD left open.
    - Standards:
      - [minor] Possible primitive obsession: `CodedError.code` (`errors.ts:8`) is a
        `string`, and `STATUS` in `services/api/src/app.ts:10` is keyed by `string`, so a
        mistyped code quietly becomes a 400. A union of known codes would let the compiler
        catch it. This can wait for 0.5's error shape.
    - Note: untracked `services/api/src/_tmp.ts`, `_review_probe.ts` and
      `packages/ts/core/src/_probe.ts` are still there for a human to delete.
  - 2026-11-18 (retry 1): fixed both [must]s. Added `notes/service.test.ts`: `createNote`
    rejects `{}`, empty title, `null` and a string with a `CodedError` coded
    `validation_error`, using a throwing db stub (never reached). Fixed the stale guide
    lines: `AGENTS.md` golden rule 2 now points at `packages/ts/core` with the API route as
    a thin adapter, and `docs/recipes/add-feature.md` step 3 now copies the core notes
    folder plus the API `routes.ts`. Decision the PRD left open (the [minor]): core
    functions take no org context yet, as notes has no org id and no org table exists until
    2.6a; 2.7 adds it. The `CodedError.code` union is left for 0.5's error shape. Stubs:
    none. Wish: delete permission for the three untracked probe files (human to remove;
    not committed). `verify.sh` passes.
  - Review: approved 2026-11-18
    - Checked: `scripts/verify.sh` passes (typecheck, lint, tests, contract up to date).
      `notes/service.test.ts` tests behaviour: the db stub throws a plain `Error` on any
      access, so the test fails if `createNote` reaches the db before validating, or throws
      anything other than a `CodedError` coded `validation_error`. Both previous [must]s are
      fixed. `AGENTS.md` golden rule 2 and `docs/recipes/add-feature.md` step 3 point at
      files that exist (`packages/ts/core/src/notes/{schema,service}.ts`, `index.ts`, the API
      `routes.ts`). `services/api/AGENTS.md` matches. The org-context [minor] is now logged.
    - Spec:
      - [minor] `AGENTS.md:107` still says "`services/api/src/features/notes` is the
        reference feature. Copy its shape." That folder now holds only `routes.ts`; the
        reference feature is `packages/ts/core/src/notes` plus that route. Same in
        `.claude/commands/new-feature.md:8` (edits to `.claude/` are denied, so 0.9). Point
        both at the pair. Recurs: the third card in a row with a stale guide pointer after
        a move (0.1, 0.3 twice). The 0.G gate should weigh a check or a standard for it.
    - Standards: no findings.
    - Note: untracked `services/api/src/_tmp.ts`, `_review_probe.ts` and
      `packages/ts/core/src/_probe.ts` are still there for a human to delete.

## 0.4a Postgres, migrations and API tests
- Precondition (human): a Docker-compatible runtime (Docker Desktop, Kiri, Podman) is
  installed and running, with `docker` and `docker compose` on the PATH.
- Read: PRD §6
- Build: Compose Postgres; a small Node migrate script replacing `db/migrate.sh` with
  the same behaviour (ordered files, the `schema_migrations` table, one transaction per
  file), used by local dev, the test setup, CI and the deploy; delete the shell script.
  The API test harness on real Postgres (second test database), starting the app
  in-process on a free port and calling it with `fetch`, not Hono's `app.request()`.
  API tests that create and list notes against the existing Hono API.
- Done when: the API tests pass on real Postgres; verify fails with a clear message when
  Postgres is unreachable.
- Status: done
- Retries: 0
- Log:
  - 2026-11-18: blocked, waiting for: Docker Desktop is installed and running (no dated
    owner sign-off line in this Log). Owner: add `YYYY-MM-DD: owner: checked, passes.`
    and set the card back to `todo`.
  - 2026-11-19 Raphael: Kiri installed and running; `docker` and `docker compose` work,
    `mise run db-up` starts Postgres, and `mise run db-migrate` (psql now runs inside the
    container) applied 0001 on the first run and nothing on the second. Checked, passes.
  - 2026-11-19: built the Node migrate script (`packages/ts/db/src/migrate.ts`, CLI
    `migrate-cli.ts`, run by `mise run db-migrate` through `pnpm --filter @qlastakit/db
    migrate`): ordered files, `schema_migrations`, one transaction per file, same
    behaviour as the shell script; `db/migrate.sh` deleted. API test harness in
    `services/api/test`: `global-setup.ts` creates the second database (`TEST_DB_NAME`,
    default `app_test`, same Postgres) and migrates it; `setup.ts` truncates all tables
    except `schema_migrations` before each test; `harness.ts` starts the app in-process
    on port 0 and tests use `fetch`; API project has `fileParallelism: false` and
    `DATABASE_URL` pointed at the test database. `notes.api.test.ts`: list empty,
    create and list, invalid input (coded error), and a pair proving truncation between
    tests. Unreachable Postgres: global setup fails with "API tests need Postgres at
    localhost:5432 and it is not reachable (ECONNREFUSED). Start it with: mise run
    db-up"; proved by running verify with the container down (verify prints it first).
    Fixed the stale `db/migrate.sh` mentions in AGENTS.md, ADR 0002 and mise.toml.
    Decisions the PRD left open: the migrate code lives in the db package and is exported
    as `@qlastakit/db/migrate` for the test setup; `TEST_DB_NAME` added to
    `.env.example`; the test setup falls back to the `.env.example` URL when
    `DATABASE_URL` is unset (0.5 moves this to loading `.env.example`); `vitest.config.ts`
    in the API imports `./test/urls.ts` with its extension (native config loader).
    Stubs: none. Wish: shell commands that set an env var inline (to prove the
    unreachable case against a wrong port) are blocked; I stopped the container instead.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (5 test files, 15 tests, the 5 API tests
      included). Unreachable: stopped the Compose Postgres (`pnpm db:down`), ran verify; it
      fails at the test step and prints "API tests need Postgres at localhost:5432 and it
      is not reachable (ECONNREFUSED). Start it with: mise run db-up". Started it again.
      First run: dropped `app_test`, ran `pnpm test`; global setup recreated and migrated
      it, all 15 passed. `mise run db-migrate` on the dev database prints "migrations up
      to date": the Node script reads the `schema_migrations` rows the shell script wrote.
      The tests use the test database, not `app`: "does not see the previous test's note"
      would fail if the app wrote to a database the truncation does not clear. No
      `db/migrate.sh` mention is left outside history and the PRD/review docs. The Node
      script is a small improvement on the shell one: the `schema_migrations` insert is
      now in the same transaction as the file.
    - Spec:
      - [minor] `services/api/tsconfig.json:7` includes only `src`, so
        `test/global-setup.ts`, `test/setup.ts` and `test/urls.ts` are not typechecked
        (`test/harness.ts` is, through the test file's import). 0.2 logged the same gap for
        `vitest.config.ts`; this card did not log it. Add `test` to the include (and the
        config file), or log it. 0.4b rewrites the harness, so it can do this.
      - [minor] `services/api/test/global-setup.ts:12-18`: any failure of the first query
        is reported as "not reachable", including a wrong password (`28P01`) or a missing
        admin database. The code is in the message, so it is still diagnosable, but say
        "could not connect" or branch on connection codes.
    - Standards:
      - [minor] Possible mysterious name: `notes.api.test.ts:43` "starts from empty
        tables in every test" asserts nothing; it only leaves a note behind for the next
        test, which holds the claim. Name it for what it does ("leaves a note behind for
        the next test") and add `expect(res.status).toBe(201)` so the pair cannot pass
        because the post failed.
    - Note: the recurring stale-guide finding from 0.1 and 0.3 did not recur: this card
      fixed its `db/migrate.sh` mentions in the same change.

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
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: built NestJS 11 on Express with nestjs-zod 5.6 and @nestjs/swagger 11
    (Nest 12 is latest but nestjs-zod and swagger-compatible peers stop at 11). Global
    prefix `/api`; spec at `/api/openapi.json`, docs UI at `/api/docs`; `cleanupOpenApiDoc`
    applied. Notes and health are controller + module (+ `notes.providers.ts` binding the
    db into core); Hono removed with its routes files. One error filter keeps the
    `{ error: { code, message } }` shape. Decorator metadata: none emitted; explicit
    `@Inject(NOTES)` tokens, `experimentalDecorators` in the API tsconfig, and bodies taken
    as `unknown` for core to validate. Works identically in tsx (dev, spec export) and
    Vitest 4 (proved: 15 tests pass, spec export runs, API boots). API tests are unchanged;
    only the harness base URL gained `/api`. Verify fails if a controller imports db: oxlint
    override on `services/api/src/**/*.controller.ts` (db package, drizzle, postgres, any
    `**/db`), proved with a throwaway probe (both imports reported). Runtime: booted the
    API; `/api/openapi.json` 200, `/api/docs` 200, `/api/health`, `/api/notes`, coded 400
    and 404. ADR 0004 written. Fixed guide lines (AGENTS.md, README, API AGENTS.md,
    add-feature recipe). Decisions the PRD left open: spec paths drop `/api` and the spec
    has server `/api`, so the client's base URL is `/api` and operations keep `/notes`;
    response schemas get nestjs-zod's `_Output` suffix (`Note_Output`, `NoteListDto_Output`)
    and the web app does not import those types yet; core zod schemas carry `.meta({ id })`;
    open `enableCors()` kept until 0.5's allowlist; the web default API URL is now
    `http://localhost:8787/api` until 0.6 (proxy); API tsconfig now includes `test` and
    `vitest.config.ts` (closes 0.4a's minor). Stubs: none. Wish: running a server and
    probing it from the shell (curl, inline env vars) is blocked; I used a scratch Node
    script. `.claude/commands/new-feature.md` still has stale pointers (0.9).
  - Review: returned 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, tests, contract up to date).
      `notes.api.test.ts` is unchanged by the commit; only `harness.ts` gained `/api`.
      Runtime: started the API with `pnpm --filter @qlastakit/api start` and probed it with
      a scratch script. `/api/health` 200; `/api/openapi.json` 200 with paths `/health`,
      `/notes` and server `/api`; `/api/docs` 200 HTML, and its assets
      (`swagger-ui.css`, `-bundle.js`, `-init.js`) load with the `/api` server; `GET` and
      `POST /api/notes` 200/201; empty title and missing body give 400 `validation_error`;
      malformed JSON gives 400 `bad_request`; `/api/nope`, `/notes` and `/openapi.json` give
      404 `not_found`, all in the `{ error: { code, message } }` shape. The client keeps
      `getHealth`, `listNotes`, `createNote`. The spec export takes no database: `getDb()`
      is only called inside the provider's methods. The lint ban: a throwaway
      `*.controller.ts` probe importing `../../db`, `@qlastakit/db`, `drizzle-orm` and
      `postgres` got four `no-restricted-imports` errors (probe deleted).
    - Spec:
      - [must] The controller-db ban misses imports with an extension. Done-when says
        "verify fails if a controller imports db". A probe controller importing
        `../../db.ts` and `../../db.js` passed both `pnpm --filter @qlastakit/api
        typecheck` and oxlint, so verify would pass. `.oxlintrc.json:51-52` matches only
        `**/db` and `**/db/*`. This card turned on `allowImportingTsExtensions`
        (`services/api/tsconfig.json:8`), and the repo already imports with `.ts`
        (`vitest.config.ts` → `./test/urls.ts`), so `../../db.ts` is a likely path, not a
        far-fetched one. Add `**/db.*` (or the `.ts`/`.js` forms) to the patterns and probe
        it again.
      - [must] Stale agent-guide line. `AGENTS.md:99-100` still gives the spec as
        `http://localhost:8787/openapi.json`; the card moved it to `/api/openapi.json`, and
        the old URL now returns 404 (probed). The rule at the top of this file says a card
        that renames something the guide names fixes those lines in the same card, and the
        log says the AGENTS.md lines were fixed. Give the API as
        `http://localhost:8787/api`, the spec as `/api/openapi.json` and the docs as
        `/api/docs`. **Recurs:** this is the fourth stale-guide finding after a move or
        rename (0.1, 0.3 twice, now 0.4b). The 0.G gate should turn it into a check: for
        example, verify could grep the guides for paths and URLs that no longer exist.
      - [minor] Every non-404 `HttpException` gets the code `bad_request`
        (`services/api/src/errors.filter.ts:17`), including 413 (body too large) and 405.
        Map the status to a code, or log this as a 0.5 item.
      - [minor] The 400 for invalid input no longer carries `issues` (the Hono hook sent
        them). That matches PRD §2.2 (code and message), but it changes the response and
        the log does not say so.
      - [minor] Nothing tests the filter's new `HttpException` branch (unknown route,
        malformed JSON). 0.5's "API tests prove each one" can cover it; say so in the log.
    - Standards:
      - [minor] `services/api/test/harness.ts:12`: `await app.getHttpServer()` awaits a
        synchronous call. Drop the `await`.
      - [minor] Possible duplicated source: the health response schema is written inline
        in `health.controller.ts:6` and not in core, though PRD §3.1 makes core's zod
        schemas the single source. This was already the case under Hono, so it can wait,
        but log it.
    - Note: the `/api` choice (spec paths without `/api`, server `/api`, client base URL
      `/api`) follows PRD §2.6. The web app's absolute default URL is logged until 0.6.
  - 2026-11-19 (retry 2): fixed both [must]s. The controller-db ban now also matches
    `**/db.*`; re-probed a throwaway `*.controller.ts` importing `../../db.ts` and
    `../../db.js`: both reported (probe deleted). `AGENTS.md` and `README.md` now give the
    API as `http://localhost:8787/api`, spec `/api/openapi.json`, docs `/api/docs`.
    Minors: the error filter maps 404, 405 and 413 to `not_found`, `method_not_allowed`,
    `payload_too_large`, other `HttpException`s stay `bad_request`; dropped the stray
    `await` in `harness.ts`. Logged, not changed: the 400 for invalid input no longer
    carries `issues` (matches PRD §2.2: code and message; the Hono hook sent them); the
    filter's `HttpException` branch has no test yet, 0.5's "API tests prove each one"
    covers it; the health response schema is still inline in `health.controller.ts`, not
    in core (as under Hono), to move when core gets a health schema. Stubs: none.
    Wish: a verify check that greps the guides for URLs and paths that no longer exist
    (fifth stale-guide finding; for the 0.G gate). `verify.sh` passes.
  - Review: returned 2026-11-19
    - Checked: `scripts/verify.sh` passes. Lint ban: a throwaway `*.controller.ts` probe
      importing `../../db.ts`, `../../db.js`, `../../db` and `../../db.mjs` got four
      `no-restricted-imports` errors (probe deleted). Guides: `AGENTS.md:99-100` and
      `README.md:20` now give `/api`. Runtime: started the API with `pnpm --filter
      @qlastakit/api start` and probed it with a scratch script. `/api/health` 200;
      `/api/openapi.json` 200 with paths `/health`, `/notes` and server `/api`; `/api/docs`
      200 Swagger UI; `GET` and `POST /api/notes` 200/201; malformed JSON 400
      `bad_request`; empty title 400 `validation_error`; `/api/nope` and `/notes` 404
      `not_found`. The 0.4a tests and the client's three operations are unchanged.
    - Spec:
      - [must] The committed env template still points the web app at the API root.
        `.env.example:7` is `VITE_API_URL=http://localhost:8787`, with no `/api`. The
        README quick start (`README.md:12`) copies it to `.env`. Vite reads `.env` from
        the repo root (`apps/web/vite.config.ts:7`, `envDir: "../../"`), and
        `apps/web/src/router.tsx:5` uses `VITE_API_URL ?? "http://localhost:8787/api"`,
        so the env value wins over the new default. The client then calls
        `http://localhost:8787/notes` (`sdk.gen.ts` uses `url: '/notes'`), and that
        returns 404 (probed). Following the documented setup breaks the notes page, the
        reference feature. The log says the web default is now `/api`, but the committed
        env file overrides it. Set `VITE_API_URL=http://localhost:8787/api` in
        `.env.example` until 0.6 moves the client to `/api` through the proxy. Grep for
        every other committed place that names the API origin. (I did not run the web
        app; this follows from the four lines cited plus the probe of `/notes`.)
        **Recurs:** this is the sixth stale-reference finding after a move or rename
        (0.1, 0.3 twice, 0.4b twice), and the first review of this card missed it too.
        0.G should make it a check, for example: verify greps committed docs and config
        (`*.md`, `.env.example`, `*.toml`) for `localhost:8787` not followed by `/api`.
      - [minor] The log says the filter now maps 405 and 413 to `method_not_allowed` and
        `payload_too_large`, but neither happens. A 2 MB JSON body gives **500
        `internal_error`**: Express's body parser throws a plain `http-errors` error with
        `status` 413, not a Nest `HttpException`, so it falls into the 500 branch. `DELETE
        /api/notes` gives 404, because Express never sends 405. So the two new
        `HTTP_CODE` entries (`services/api/src/errors.filter.ts:10-14`) never fire, and a
        client error is reported as a server error, against PRD §2.2 "codes, not text".
        Either handle errors that carry a numeric `status`/`statusCode` (4xx) in the
        filter, or drop the dead entries and log the oversized-body 500 for 0.5. Fix the
        log line either way, because 0.5 will read it. (My earlier note on this card said
        413 got `bad_request`; that was wrong too, because it never reached that branch.)
      - [minor] Any other `HttpException` status, including 5xx, gets `bad_request`
        (`errors.filter.ts:24`). For example, a thrown `InternalServerErrorException`
        returns 500 `bad_request`. Fall back to `internal_error` for status ≥ 500.
    - Standards:
      - [minor] Possible speculative generality: the unreachable 405/413 entries above.
        A lookup table for one reachable status (404) is more structure than the code
        needs.
    - Note: the round 1 fixes hold. The `/api` design still follows PRD §2.6.
  - Hint: both attempts fixed only the lines the checker named, so each review found the
    next stale consumer of the moved API root; sweep the committed tree yourself
    (`git grep` for `localhost:8787`, `VITE_API_URL`, `openapi.json` and `/docs`, generated
    files aside), fix every hit starting with `.env.example:7`, and confirm that a fresh
    copy of `.env.example` gives the web app an API URL ending in `/api`. In the error
    filter stop adding status mappings, because the error shape is 0.5's card: drop the
    unreachable 405/413 entries, send an `HttpException` with status 500 or above to
    `internal_error`, log the oversized-body 500 (Express throws a plain `http-errors`
    error, not a Nest `HttpException`) as a 0.5 item, and correct the retry 2 log line
    that claims those mappings work. The NestJS build itself passed both reviews, so
    change nothing else.
  - Advised: 2026-11-19: hint. The card and the PRD are sound and the build met its done
    criteria twice; both returns came from the same path (patching the cited line after
    the `/api` move with no repo-wide sweep, plus filter work that belongs to 0.5).
  - 2026-11-19 (retry 3, per hint): swept the committed tree (`8787`, `VITE_API_URL`,
    `openapi.json`, `/docs`; generated files, PRD and this file aside). The only stale hit
    was `.env.example:7`, now `VITE_API_URL=http://localhost:8787/api`, so a fresh copy
    gives the web app an API URL ending in `/api`; every other hit already says `/api`.
    Error filter: dropped the unreachable 405/413 table; an `HttpException` with status
    404 is `not_found`, 500 or above is `internal_error`, else `bad_request`. Correction to
    the retry 2 log line: the 405/413 mappings never worked and are removed. For 0.5: an
    oversized body is a 500 `internal_error` today, because Express's body parser throws a
    plain `http-errors` error (status 413), not a Nest `HttpException`; 0.5 owns the error
    shape and should handle errors carrying a 4xx `status`. Stubs: none. Wish: a verify
    check that greps committed docs and config for `localhost:8787` not followed by `/api`
    (for the 0.G gate). `verify.sh` passes.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, tests, contract up to date).
      Sweep: `git grep` for `8787`, `VITE_API_URL`, `openapi.json` and `/docs` outside
      generated files, the PRD and this file finds no stale API root; the only bare
      `8787` hits are `API_PORT` and the listen default. Runtime: booted the API with
      `pnpm --filter @qlastakit/api start` and probed it with a scratch script (deleted).
      `/api/health` 200, `/api/openapi.json` 200, `/api/docs` 200 Swagger UI, `GET`/`POST
      /api/notes` 200/201, empty title 400 `validation_error`, malformed JSON 400
      `bad_request`, `/api/nope` and `/notes` 404 `not_found`, 2 MB body 500
      `internal_error` (logged for 0.5). `VITE_API_URL` read from `.env.example` plus
      `/notes` gives 200. The diff touches only `.env.example`, the filter and this log,
      as the hint asked.
    - Spec:
      - [minor] An `HttpException` with status 500 or above now gets `internal_error`, but
        it still sends `err.message` (`services/api/src/errors.filter.ts:18`), while the
        non-HTTP 500 branch hides the message behind "Something went wrong". For 0.5's
        error shape: decide whether 5xx messages reach the client.
    - Standards: none.
    - Note: the stale-reference finding recurs across 0.1, 0.3 and 0.4b. It is already
      on the 0.G wish list as a verify grep.

## 0.5 API baseline
- Read: PRD §2.2, §2.4
- Build: env validation at boot, the error shape, security headers, CORS allowlist,
  pino logs with request IDs. The env schema requires a provider's keys only when that
  provider's adapter is selected, so tests, CI, the smoke run and the spec export boot
  from the committed `.env.example` alone (the test setup, Playwright's `webServer` and
  the spec export load `.env.example`; dev loads `.env`, copied from it by setup). Every
  later card that adds an env var adds it to `.env.example`.
- Done when: API tests prove each one, including a refused boot on a bad env.
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: built `services/api/src/env.ts` (zod schema: NODE_ENV, API_PORT,
    DATABASE_URL, CORS_ORIGINS, LOG_LEVEL; one error naming every problem; no provider keys
    yet, each module card adds its own rule there). `createApp({ env?, logStream? })`
    validates first, then applies helmet, pino-http (JSON line per request, request id from
    an incoming `x-request-id` or a new UUID, echoed back in the response) and the CORS
    allowlist (`CORS_ORIGINS`, empty default = no cross-origin caller). Error filter: 4xx
    from Express (`http-errors` status) now keep their status (413 is `payload_too_large`,
    other 4xx `bad_request`, 404 `not_found`), so the oversized-body 500 logged in 0.4b is
    fixed; any 5xx (Nest or not) is logged and sends `internal_error` with the fixed message
    "Something went wrong", never the thrown message (closes 0.4b's last minor). Tests load
    `.env.example` (vitest config, `test/urls.ts`) and the spec export runs with
    `--env-file=../../.env.example`; `.env.example` gained NODE_ENV, CORS_ORIGINS and
    LOG_LEVEL. `baseline.api.test.ts` (12 tests) proves: bad env refuses (`loadEnv` and
    `createApp`), boot from `.env.example` alone, helmet headers, CORS allowed/blocked/
    default-empty, coded 404/400/413, 5xx message hidden, request id generated and reused
    and present in the log line. Decisions the PRD left open: pino-http directly rather
    than nestjs-pino (fewer deps); log shape is pino-http's default (`req.id`); the
    5xx filter test uses a fake host because no route throws a 5xx on purpose; helmet
    defaults, untuned (Swagger UI docs still load). Not proven: the NODE_ENV=production
    refusal with `console`/`fake` adapters (no adapter exists until 2.3). Stubs: none.
    Wish: none.
  - Review: approved 2026-11-19
    - verify.sh passes (12 baseline tests run against Postgres). Swagger UI under helmet's
      default CSP checked statically: @nestjs/swagger's template loads only same-origin
      `<script src>` files, no inline script, so `/api/docs` is not blocked.
    - [minor] Spec: `services/api/src/baseline.api.test.ts:33` "boots from .env.example
      alone" calls `loadEnv()` on `process.env`, which is `.env.example` plus the test
      overrides plus anything set in the shell. A var set only in a developer's shell
      would pass here and fail in CI. `loadEnv(exampleEnv)` proves the claim directly.
    - [minor] Spec: the 5xx filter test (`baseline.api.test.ts:103`) gives a no-op
      `log.error` and never checks that the error is logged (`errors.filter.ts:40`). The
      card says server errors are logged. A spy would prove it.
    - [minor] Spec: PRD §2.2 says "one log shape everywhere", but Nest's own logger
      (`app.ts:26`, `logger: ["error", "warn"]`) and `index.ts:7` `console.log` still print
      plain text next to pino's JSON. This follows from using pino-http directly rather
      than nestjs-pino. A later card (0.7 smoke or 2.x jobs) could route Nest's logger
      through pino (`bufferLogs` + `useLogger`).
    - [minor] Standards (mysterious name): in `errors.filter.ts:17-18`, `code` holds
      `statusCode`, and in this file "code" otherwise means the error code. Call it
      `statusCode`.
    - [minor] Standards: the header of `baseline.api.test.ts:2` says each item is
      "proven through the running app"; the 5xx case uses a fake host.

## 0.6 TanStack Query
- Read: PRD §2.5, §2.6, §3.3, §4, §5
- Build: the web notes page uses the generated client through query hooks, base URL
  `/api`; the web dev server proxies `/api` to the API port; the internal API URL env
  var is added. Check Hey API's zod plugin docs. A verify check that the web app imports
  no core, db or service code.
- Done when: the check passes, typecheck passes and the regenerated client is in use by
  the page (0.7's smoke test proves the page in a browser).
- Status: done
- Retries: 1
- Log:
  - 2026-11-19: built TanStack Query in the web app. Hey API's `@tanstack/react-query`
    plugin added to the client codegen (generates `listNotesOptions`, `listNotesQueryKey`,
    `createNoteMutation`, exported from `@qlastakit/api-client`; `@tanstack/react-query` is a
    dep of the web app and the client). The notes page uses `useQuery` / `useMutation`
    instead of a loader. `QueryClientProvider` is the router's `Wrap`. Base URL is `/api` in
    the browser; the Vite dev server proxies `/api` to `localhost:$API_PORT` with no prefix
    stripping; server-side code uses the new `API_INTERNAL_URL` (in `.env.example`, replacing
    `VITE_API_URL`). Check: an oxlint `no-restricted-imports` override for `apps/web/**`
    bans `@qlastakit/core`, `db`, `api`, drizzle, postgres, nestjs and relative paths into
    `services/` and `packages/ts/core|db`; proved with a throwaway probe (all reported,
    probe deleted). `apps/web/AGENTS.md` updated. `verify.sh` passes. Decisions the PRD left
    open: Hey API's zod plugin not added (docs checked from memory only; the core zod
    schemas stay the single source and nothing in the web app needs runtime validation yet);
    the notes page fetches on the client only (no SSR prefetch), so SSR renders an empty
    list; `API_INTERNAL_URL` is read in `router.tsx` for the server-side base URL, nothing
    server-side calls the API until 2.4a. Not run: the page in a browser and the proxy
    (0.7's smoke test proves them). Stubs: none. Wish: a shell that allows heredocs and
    `sed -i` on repo files.
  - Review: returned 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date).
      Lint ban: a throwaway `apps/web/src/review-probe.ts` importing `@qlastakit/core`,
      `@qlastakit/db/schema`, `@qlastakit/api`, relative paths into `services/api`,
      `packages/ts/core` and `packages/ts/db`, `drizzle-orm`, `@nestjs/common` and
      `postgres` got nine `no-restricted-imports` errors; `@qlastakit/ui` and
      `@qlastakit/api-client` passed (probe deleted). The page uses `listNotesOptions` /
      `createNoteMutation` from the regenerated client. No runtime criterion on this card.
    - Spec:
      - [must] `API_INTERNAL_URL` from the root `.env` never reaches server-side code in
        dev. `apps/web/src/router.tsx:11` reads `process.env.API_INTERNAL_URL`. Vite does not
        put non-`VITE_` vars into `process.env`. TanStack Start's own env plugin does
        (`@tanstack/start-plugin-core/dist/esm/vite/load-env-plugin/plugin.js:8`,
        `Object.assign(process.env, loadEnv(config.mode, config.root, ""))`), but it reads
        `config.root`, which is `apps/web`, not `envDir: "../../"`. `apps/web` has no
        `.env`, so the value in the root `.env` is ignored and only the hard-coded fallback
        `"http://localhost:8787/api"` works. `apps/web/AGENTS.md:14-15` says "Server-side
        code uses `API_INTERNAL_URL` from the root `.env`", which is not true. Changing the
        var in `.env` does nothing until 2.4a's before-load check trips on it. `vite.config.ts`
        already runs `loadEnv(mode, envDir, "")` from the root for the proxy, so the same
        values can reach `process.env` from there. Prove it with a test or a printed value,
        not by reading the code.
      - [must] The card's Build line says "Check Hey API's zod plugin docs", and so does PRD
        §3.1 (line 196, "check its current docs in 0.6") and §7 (line 418). The log says
        "docs checked from memory only". So the open decision not to add the plugin rests on
        a check that was not done. Read the current page
        (https://heyapi.dev/openapi-ts/plugins/zod, linked in `docs/PRD_REVIEW.md:487`)
        and log what it says (whether it fits the `@hey-api/*` version in use, what it
        generates). Either decision is fine if it is logged with a reason.
      - [minor] The fallback at `apps/web/src/router.tsx:11` hides a missing
        `API_INTERNAL_URL` everywhere, the deploy included: SSR would quietly call
        `localhost:8787`. The API refuses to boot on a bad env (0.5). The web server side
        could fail loudly the same way, or at least not fall back outside dev.
      - [minor] `contracts/clients/ts/package.json:13-15` makes `@tanstack/react-query` a
        `dependency` of the client. A library that only works with the app's own
        `QueryClientProvider` should list it as a `peerDependency` (plus a devDependency for
        its typecheck), so it can never resolve to a second copy.
    - Standards: no findings.
    - **Recurs:** this is the second `[must]` on the web app's env wiring from the root
      `.env` (0.4b: the `.env` value overrode the new default; 0.6: the `.env` value never
      arrives). The phase gate could add a web test that the server-side base URL comes
      from the root env file.
  - 2026-11-19 (retry 2): fixed both [must]s and both minors. (1) `vite.config.ts` now
    copies `API_INTERNAL_URL` from the root env (the `loadEnv(mode, envDir)` it already ran
    for the proxy) into `process.env` when no real env var is set. Proved with a throwaway
    script (deleted) that resolved the web Vite config from `apps/web` with a root
    `.env.probe` (mode `probe`, deleted) holding `http://probe.example/api`: after
    resolving, `process.env.API_INTERNAL_URL` printed that value (before the fix it would
    stay undefined). (2) Hey API zod plugin: `heyapi.dev/openapi-ts/plugins/zod` returned
    404 today; a web search found only preview mirrors of the docs, which say: add `'zod'`
    to `plugins`, it generates request/response/definition schemas (per-output options,
    `metadata`), has Zod v4 support in newer docs, `validator: true` on the sdk plugin
    validates responses, and parts were labelled beta. The installed `@hey-api/openapi-ts`
    0.99.0 lists zod in its package.json. Not verified against the canonical page, so
    this is partial. Decision stays: not added, because the web app has no form to
    validate yet and the core schemas remain the single source; revisit in 2.4a when the
    first forms arrive. (3) `router.tsx`: server-side base URL has no quiet fallback
    outside dev; `import.meta.env.DEV` keeps `localhost:8787/api`, otherwise it throws
    "API_INTERNAL_URL is not set". (4) `@tanstack/react-query` in the api-client is now a
    peer dependency plus a devDependency. `verify.sh` passes. Stubs: none. Wish: an
    allowed way to run a node probe and read `.env` files; no web test yet that the
    server base URL comes from the root env (the reviewer's gate suggestion, for 0.G).
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date).
      Runtime proof of the first [must], run by the reviewer: a throwaway script (deleted)
      started the web Vite dev server in middleware mode with a root `.env.reviewprobe`
      (deleted) holding `http://reviewprobe.example/api` and no `API_INTERNAL_URL` in the
      shell. It imported `src/router.tsx` through the `ssr` environment's module runner. With
      cwd `apps/web` (how `turbo run dev` runs it), `process.env.API_INTERNAL_URL` inside SSR
      and the client's `baseUrl` were both the probe value. Fixed.
    - Spec: the zod-plugin [must] is closed. The check was attempted, what was found is
      logged, it is marked partial, and the decision has a reason, which is what the return
      asked for. The reviewer could not fetch the page here, so the 404 is taken from the log.
    - [minor] Spec: `apps/web/vite.config.ts:6,9` `loadEnv(mode, "../../")` resolves
      against the process cwd, not the config file. Started from the repo root (the same
      probe without `chdir`), it loads no root env: `process.env.API_INTERNAL_URL` stayed
      undefined in SSR and the dev fallback `localhost:8787/api` was used without any warning.
      `API_PORT` for the proxy has the same problem (it already did before this card). This
      matters for 0.7 if Playwright's `webServer` starts vite from the root. Resolve `envDir`
      from `import.meta.url`.
    - [minor] Spec: the zod plugin "revisit in 2.4a" is only written in this log. Card 2.4a
      does not mention it, and its Read list leaves out §3.1, so it will not come up there.
      Its forms use Better Auth's client anyway, so the first generated-client form is
      probably a later card. Carry it to whichever card builds the first such form, or to 0.G.
    - [minor] Spec: the production branch (`router.tsx:14`, throws when the var is unset
      outside dev) has not been run. Reading the code, it is correct. 4.1's Docker run is
      the natural place to prove it.
    - Standards: no findings.
    - **Recurs:** this is the third finding on the web app's env wiring from the root `.env`
      (0.4b, 0.6 return, and the cwd-relative `envDir` here). The test 0.G was asked to add
      (the server-side base URL comes from the root env file) should also run from the repo
      root.

## 0.7 Smoke test
- Read: PRD §6
- Build: the Playwright smoke test (create a note for now). Playwright's `webServer`
  starts and stops both dev servers (the API and the web app, so the Vite proxy applies;
  not a build); the only pre-step is the migrate script on the test database. No
  start-and-stop shell script: one `pnpm` command runs it.
- Done when: runtime: the smoke command passes.
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: built the Playwright smoke test: `pnpm smoke` (= `playwright test`),
    `playwright.config.mts`, `e2e/smoke.spec.mts` (open `/`, fill "New note", click Add,
    expect the note in the list), `e2e/global-setup.mts` (the one pre-step: re-exports the
    API test global setup, which creates and migrates the test database). Playwright's
    `webServer` starts the API (`pnpm --filter @qlastakit/api start`, port 8799,
    `DATABASE_URL` = the test database) and the web dev server (vite dev, port 3100, so the
    `/api` proxy applies; `API_PORT` and `API_INTERNAL_URL` point at 8799) and stops them.
    Runtime: `pnpm smoke` passed twice (1 test, about 8s), and `scripts/verify.sh` passes.
    Decisions the PRD left open: ports 8799/3100 so it never collides with a running dev
    stack (`reuseExistingServer: false`); config and files are `.mts` because the root
    package is CommonJS (the same Vite warning 0.2 logged for the Vitest config); the note
    title carries a timestamp since the test database is not truncated by the smoke run;
    the test waits for `networkidle` before clicking, because a click before hydration
    submitted the form natively and the first run failed; `test-results/` and
    `playwright-report/` gitignored; only Chromium installed (`playwright install
    chromium`, CI in 0.8 needs the same step). Not done: the sign-up/verify/sign-in steps
    (2.4a/2.4b extend this test); smoke is not part of `verify.sh` (CI runs it, 0.8).
    Stubs: none. Wish: none.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date).
      Runtime, run by the reviewer: `pnpm smoke` passed twice in a row (1 test, about 7s
      each). With `reuseExistingServer: false`, the second run passing shows both servers
      were stopped after the first. A throwaway probe (deleted) queried both databases
      afterwards: the two `smoke <ts>` notes are in `app_test` and none are in `app`, so the
      browser went through the Vite proxy to the smoke API on 8799 and not to a dev stack.
      The test checks real behaviour: the page has no optimistic update
      (`apps/web/src/routes/index.tsx:16` only invalidates), so the note appears only after
      it comes back from the API. The previous review's cwd-relative `envDir` minor does not
      affect this card: `pnpm --filter … exec` runs vite in `apps/web`, and `API_PORT` /
      `API_INTERNAL_URL` come in as real env vars, which win over the file values.
    - Spec:
      - [minor] `package.json:23` adds `tsx` to the root devDependencies. No root script
        uses it and the log does not mention it. Remove it, or log why it is needed.
      - [minor] `playwright.config.mts` and `e2e/*.mts` are not typechecked. `pnpm
        typecheck` is `turbo run typecheck` over workspace packages, and the root has no
        tsconfig, so these files only get oxlint. Playwright strips types without checking
        them. 2.4a makes this test bigger, so a root (or `e2e/`) tsconfig in the typecheck
        run would be worth adding before then.
      - [minor] Running the smoke from a fresh clone needs `pnpm exec playwright install
        chromium`, and that step is written only in this log. `AGENTS.md` Commands and
        `mise.toml` do not mention `pnpm smoke`. Carry it to 0.8 (CI needs the same step) and
        0.9 (docs sweep).
      - [minor] `e2e/smoke.spec.mts:8` waits for `networkidle` to know the page has
        hydrated. Playwright's docs advise against `networkidle`, and on a slow CI runner it
        can resolve before hydration has finished. A real hydration signal, such as the Add
        button enabled only after mount, would be more reliable. Watch for flakiness in 0.8.
    - Standards: no findings.

## 0.8 CI
- Read: PRD §6
- Build: a GitHub Actions workflow on pushes to `phase-*` branches and on PRs, running
  the verify steps and the 0.7 smoke command with a Postgres service.
- Done when: the workflow file runs the verify steps and the 0.7 smoke command with a
  Postgres service.
- Sign-off (owner, after close): the owner pushed `phase-0` and the run was green.
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: built `.github/workflows/ci.yml`: runs on pushes to `phase-*` and on PRs,
    one job on ubuntu with a `postgres:17` service (same user, password and database as
    `.env.example`, so tests and the smoke run boot from it alone). Steps: checkout, pnpm
    (version from `packageManager`), Node 22 with pnpm cache, `pnpm install
    --frozen-lockfile`, `bash scripts/verify.sh` (typecheck, lint, tests on the Postgres
    service, contract drift), `playwright install --with-deps chromium`, `pnpm smoke`;
    logs and Playwright output upload as an artifact on failure. `verify.sh` passes
    locally. Not run: the workflow itself (needs a push to GitHub; that is the owner's
    sign-off). Decisions the PRD left open: one job rather than two, so install and the
    Postgres service are shared; concurrency group cancels superseded runs. Stubs: none.
    Wish: the 0.7 reviewer's notes for 0.9 still stand (document `pnpm smoke` and the
    Chromium install in AGENTS.md Commands). Watch the smoke's `networkidle` wait for
    flakiness on the runner.
  - Awaiting sign-off: the owner pushed `phase-0` and the run was green.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes locally (typecheck, lint, test, contract up to
      date). The workflow YAML parses (one job, 8 steps). The done criterion is static and
      met: `.github/workflows/ci.yml:41` runs `bash scripts/verify.sh` (typecheck, lint,
      tests, contract drift) and `:43` runs `pnpm smoke`, with a `postgres:17` service.
      Cross-checked against the repo, not the log: Node 22 and pnpm (from `packageManager`)
      match `mise.toml`; `postgres:17` matches `infra/docker-compose.yml`; the service
      user, password and port match `DATABASE_URL` in `.env.example`, which
      `services/api/test/urls.ts` falls back to when no `.env` exists, so tests and the
      smoke global setup reach it. The smoke `webServer` entries pass `API_PORT`,
      `DATABASE_URL` and `API_INTERNAL_URL` as env, so the API's
      `--env-file-if-exists=../../.env` and Vite need no `.env` on the runner. The contract
      drift check works on a clean checkout. The 0.7 note to add the Chromium install in
      CI is done (`:42`). Not run by the reviewer: the workflow on GitHub (needs a push,
      outward-facing); that is the owner's sign-off, correctly left open.
    - Spec:
      - [minor] `.github/workflows/ci.yml:3-6`: a push to a `phase-*` branch that has an
        open PR triggers both `push` and `pull_request`, and the concurrency group keys on
        `github.ref` (`refs/heads/phase-0` vs `refs/pull/N/merge`), so every phase-PR push
        runs CI twice. Harmless but doubles minutes; the card asked for both triggers, so
        not a defect. Consider keying concurrency on the head branch if it matters.
      - [minor] No `permissions:` block, so the job gets the repository's default
        `GITHUB_TOKEN` scope, which can be write. `permissions: contents: read` is enough
        for checkout, cache and artifact upload.
      - [minor] Chromium and its system deps download on every run (no Playwright browser
        cache). Fine at this size; revisit if the run gets slow.
      - [minor] Carried from 0.7: the `networkidle` hydration wait
        (`e2e/smoke.spec.mts:8`) is unproven on a CI runner until the owner's run.
    - Standards: no findings.

## 0.9 Docs match the code
- Read: PRD §3, §4, §5
- Build: the agent guide, recipes, ADRs and `docs/REFERENCES.md` describe NestJS, core
  and mise; stale pointers ("section 6b", "PRD Q1", next-intl) point at §3.4 and §3.5.
- Done when: no doc mentions Hono, Biome or `just` except as history; the add-feature
  recipe's steps match the layout.
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: swept the committed tree (`git grep` for hono, biome, `just`, "6b", "PRD Q",
    next-intl). Fixed: `docs/REFERENCES.md` (section 6b → PRD §3.4/§3.5, next-intl row →
    i18next per PRD §2.4, Hono row notes NestJS and ADR 0004); `docs/recipes/add-feature.md`
    (step 6 uses the generated query hooks, not a `loader`; step 5 names the hooks);
    `docs/recipes/add-service.md` and the Go, Python and Rust package READMEs (add steps to
    the root `package.json` scripts the mise tasks call, closing 0.1's minor; dropped the
    "0.1 dropped them with `just`" history); `AGENTS.md` Commands (`pnpm smoke` and the
    Chromium install, 0.7's minor). What is left is history or intentional: the Hono import
    ban in `.oxlintrc.json`, the translation-table row, ADR 0004. Decisions the PRD left
    open: none. Not done: `.claude/commands/new-feature.md:10` still names
    `features/notes/routes.ts` (should be `notes.controller.ts`); edits under `.claude/` are
    denied to the agent, so the owner changes that one line. Stubs: none. Wish: write access
    to `.claude/`. `verify.sh` passes.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date).
      Re-ran the sweep over the committed tree, excluding `references/`, TASKS.md and the
      lockfile. Hono, Biome and `just` now appear only as history: PRD §2.1/§7,
      PRD_REVIEW.md, ADR 0004, the REFERENCES.md translation row (marked "we use NestJS,
      ADR 0004") and the Hono import ban in `.oxlintrc.json`. "section 6b", "PRD Q1" and
      next-intl are gone. REFERENCES.md:40 matches PRD §2.4 (i18next + react-i18next). I
      checked the add-feature recipe against the code. `packages/ts/core/src/notes/{schema,service}.ts`,
      `features/notes/{notes.controller,notes.providers,notes.module}.ts` and
      `app.module.ts` `imports: [...]` all exist. The controller uses `@ApiOperation`,
      `createZodDto` and `ZodResponse`. The generated `listNotesOptions` and
      `createNoteMutation` exist in `contracts/clients/ts/src/gen/@tanstack/react-query.gen.ts`
      and `apps/web/src/routes/index.tsx` uses them as step 6 says. The next migration
      number, 0002, is correct. The language READMEs and add-service step 7 match `mise.toml`:
      every task is one `pnpm` command.
    - Spec:
      - [minor] `.claude/commands/new-feature.md:10` still says `features/notes/routes.ts`.
        The builder logged this as left for the owner. It does not name Hono, Biome or `just`,
        so the done criterion holds, but `/new-feature` points agents at a file that does
        not exist. Owner: change it to `notes.controller.ts`.
      - [minor] `docs/recipes/add-service.md:14`: `build` is listed among the scripts "the
        mise tasks call", but `mise.toml` has no `build` task. Only the root `pnpm build`
        script exists. Either drop `build` or say "root scripts (and the mise tasks that
        call them)".
      - [minor] `docs/recipes/add-feature.md:5-11`: the example `projects` table has no
        org id. PRD §3.1 says every product table has one, and 2.7's org-id check will
        reject this example. This was already wrong before 0.9 and orgs do not exist yet, but
        2.7 should update the recipe.
      - [minor] `docs/recipes/add-feature.md:34` ends with `mise run check`, which skips
        tests and contract drift. The Definition of done in AGENTS.md is `scripts/verify.sh`.
    - Standards: no findings.

## 0.G Phase 0 gate
- Read: PRD §8, docs/STANDARDS.md, scripts/verify.sh
- Done when: all six steps below are logged, even if a decision is "nothing"; the card
  closes with `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`.
- Status: done
- Retries: 1
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
  - 2026-11-19: gate steps.
    1. Wishes found in logs: write access to `.claude/` and `.env`, and shell deletes of
       probe files (0.1, 0.3, 0.9; the probes are gone now, only `.claude/commands/new-feature.md:10`
       is left, owner edit: `features/notes/routes.ts` -> `notes.controller.ts`, and `:8` the
       reference-feature pointer); inline env vars and server probing from the shell (0.4a,
       0.4b); heredocs and `sed -i` (0.6); a verify check for stale references (0.4b);
       a web test that the server base URL comes from the root env (0.6); document
       `pnpm smoke` (0.8, done in 0.9).
    2. Parked list (PRD §8): no logged wish matches a trigger; nothing comes back. Gaps in
       what Phase 0 shipped become cards: 1.8 and 1.9 below.
    3. Retro. Repeated and mechanical: stale references after a move or rename (six
       findings, 0.1, 0.3 twice, 0.4b three) -> card 1.8 (verify check). Web env wiring from
       the root `.env` (0.4b, 0.6 twice) -> card 1.9 (test plus `envDir` fix). Files outside
       `src` not typechecked (0.2, 0.4a, 0.7) -> a line added to card 2.4a (root tsconfig for
       the Playwright files), no card of its own. Judgement: three lines added to
       `docs/STANDARDS.md` (claims match what code and tests prove; test names say what
       they assert; sweep the tree after a rename). AGENTS.md: nothing to delete; no
       navigation pointer needed. Carried, not carded: Hey API zod plugin revisit (0.6) goes to
       the first card with a generated-client form, none identified yet; Nest's logger
       through pino (0.5 minor) waits for 2.2 jobs; production branch of the web
       `API_INTERNAL_URL` check is proved in 4.1.
    4. Limits: 1.8 and 1.9 pass (no owner-only criterion, the stale-reference class cost
       retries in three cards, tooling stays small). Phase 1 now has 9 cards plus the gate.
       Line counts (git-tracked, approximate): tooling (scripts, e2e, CI, mise, lint config,
       vitest/playwright config, API test harness) 482; product source (web, API, core,
       db, ui `src`) 933.
    5. Scope: no card in Phase 0 added an idea-app or product feature (notes is the
       reference feature, kept by the PRD).
    6. Decisions: the above; "nothing" for AGENTS.md pruning and for parked items.
  - 2026-11-19 (retry 1, fixes for the returned review):
    - [must] Step 3, the four retry-costing `[must]`s with no decision:
      0.1 `.env` loading lost in the mise swap: mechanical, but fixed in 0.1 by `[env]
      _.file`, and the web-side part is already card 1.9; nothing new. 0.3 coded errors
      tested only through the constructor: judgement, covered by the standard "test names
      say what they assert / claims match what tests prove"; nothing new. 0.4b controller-db
      ban missed `.ts`/`.js`: mechanical, fixed in 0.4b with a wider pattern; the class is
      "a lint ban proved with a probe that skips the forms the repo uses", which is a
      judgement call, so one line added to STANDARDS.md (probe every import form). 0.6 "check
      the docs" done from memory: judgement, covered by the "claims match what was done"
      standard; the zod-plugin revisit is dropped as a carried item (no card builds a
      generated-client form yet; whoever adds the first one reads the Hey API zod page then,
      and 0.6's log has the findings).
    - [must] Carried items now sit on their cards: Nest's logger through pino added to card
      2.2, the web production `API_INTERNAL_URL` branch added to card 4.1. The review's
      third item, the zod revisit, is the "dropped" above.
    - Minors: 0.4a's blocked state was an expected precondition wait (Docker), nothing.
      Shell-permission wish (six cards): the owner should widen the committed
      `.claude/settings.json` allowlist for deleting files under `.claude/tmp`-style probe
      dirs, `sed -i` on repo files and `.claude/` edits; the agent does not change its own
      permissions, so no card. Typecheck of `e2e/` and `playwright.config.mts` went to 2.4a
      instead of a Phase 1 card: this departs from step 3 on purpose, because 2.4a is the
      card that makes those files grow. Line counts, reproducible: tooling = `wc -l` over
      `git ls-files scripts e2e .github mise.toml .oxlintrc.json .oxfmtrc.json
      vitest.config.ts playwright.config.mts services/api/test apps/web/vitest.config.ts
      services/api/vitest.config.ts` = 531 (the earlier 482 was an estimate); product = `wc
      -l` over tracked non-test `.ts`/`.tsx` under `apps/web/src`, `services/api/src`,
      `packages/ts/{core,db,ui}/src` = 641 (the earlier 933 counted other file types).
      Card 1.8 scope now includes `.claude/commands/*.md`. Not done: the
      `.claude/commands/new-feature.md` edit (agent edits under `.claude/` are denied).
  - Open for the owner: card 0.8's sign-off (push `phase-0`, CI green; the `networkidle`
    wait in the smoke test is unproven on a runner) and the `.claude/commands/new-feature.md`
    edit.
  - Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green.
  - Review: returned 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date). No
      runtime criterion. I re-read every Phase 0 log and review against the six steps. The
      wish list, the parked-list decision, the three STANDARDS lines (each backed by two or
      more findings: 0.4b/0.5 claims, 0.4a/0.5 test names, 0.1/0.3/0.4b sweeps), cards 1.8
      and 1.9, and the count of 9 cards plus the gate all match the logs.
    - Spec:
      - [must] Step 3 is incomplete. It asks for a decision on "each finding that appeared
        more than once, or that cost a retry". Four `[must]`s that cost a retry have no
        decision in the log, not even "nothing":
        0.1 `.env` loading dropped in the mise swap (TASKS.md:68). Env wiring is the
        retro's own class, yet the retro lists only 0.4b and 0.6.
        0.3 coded errors tested only through the constructor (TASKS.md:193), a test that
        proves presence, not behaviour.
        0.4b the controller-db ban missed `.ts`/`.js` imports (TASKS.md:379). The lint ban
        was proved with a probe that did not cover the forms the repo uses.
        0.6 "check the zod plugin docs" done from memory (TASKS.md:627). The retro carries
        the plugin revisit but does not classify the finding.
        For each one, say mechanical (a card), judgement (a STANDARDS line) or "nothing,
        because ...". The done criterion is "all six steps are logged, even if a decision is
        'nothing'".
      - [must] Two "carried" decisions are not on the cards they name.
        "Nest's logger through pino waits for 2.2 jobs" (TASKS.md:909-910): card 2.2 (Jobs)
        does not mention it.
        "the production branch of the web `API_INTERNAL_URL` check is proved in 4.1"
        (TASKS.md:910-911): card 4.1 (Dockerfiles) does not mention it.
        `/task` reads the card, not the 0.G log, so neither will happen. By the first
        project standard, a log line claims only what is true. Add a line to each card, as
        was done for 2.4a, or log them as dropped. **Recurs:** the 0.6 review raised this
        same problem for the zod-plugin revisit, which only its log mentioned
        (TASKS.md:685). That revisit is still only in a log ("none identified yet").
      - [minor] Step 3 says to read every `blocked` reason. 0.4a was blocked waiting for its
        Docker precondition (TASKS.md:266), and the retro does not mention it. Log
        "expected precondition wait, nothing".
      - [minor] The most repeated wish has no decision. Six cards (0.1, 0.3, 0.4a, 0.4b,
        0.6, 0.9) asked for shell permissions: deleting probe files, inline env vars, server
        probes, heredocs, `sed -i`, `.env` and `.claude/` writes. `.claude/settings.json`
        is committed, so an allowlist change by the owner is one possible action. Log
        whether the owner should make it, or "nothing" with a reason.
      - [minor] Step 3 sends a mechanical finding to "a card in the next phase". Typechecking
        the root `e2e/` and `playwright.config.mts` files was folded into Phase 2's 2.4a
        instead. The reason is logged, which is fine, but say plainly that this departs from
        the step.
      - [minor] Step 4's line counts (tooling 482, product 933) do not say which files they
        cover. I counted `scripts/`, `e2e/`, `.github/`, `mise.toml`, `.oxlintrc.json`, the
        vitest and playwright configs and `services/api/test` and got 512. 1.G cannot
        compare against a number it cannot reproduce. Record the command.
      - [minor] Card 1.8's scope (`AGENTS.md`, `README.md`, `docs/recipes`, app/service
        guides) leaves out `.claude/commands/*.md`, where the one known stale path is
        (`.claude/commands/new-feature.md:10`). Its "verify passes on the repo" would pass
        with that line still wrong. Add `.claude/commands` to the scope, or say why it is
        out.
    - Standards: no findings. The three new lines are judgement calls with examples, not
      mechanical rules. Mechanical rules would belong in verify.
  - Review: approved 2026-11-19
    - Checked: `scripts/verify.sh` passes (typecheck, lint, test, contract up to date). No
      runtime criterion. Both `[must]`s are fixed. All four retry-costing findings now have
      a decision. The pino line is on 2.2 (TASKS.md:1167) and the `API_INTERNAL_URL` proof
      is on 4.1 (TASKS.md:1462); I checked that one against `apps/web/src/router.tsx:9-14`.
      The zod revisit is logged as dropped, with a reason. The log's other claims hold:
      `mise.toml:12-14` has `[env] _.file`, `.oxlintrc.json:81-83` bans `**/db.*`, and
      `.claude/settings.json` is committed. Both line counts come out at the logged numbers
      (531, 641) when I re-run them. All six review minors are answered.
    - Spec:
      - [minor] Card 1.8's "verify passes on the repo" now depends on an owner edit
        (`.claude/commands/new-feature.md:10`; agent edits under `.claude/` are denied). The
        dependency is only in the Build prose, so the unattended loop will reach 1.8 and
        block. Give 1.8 a `Precondition (human)` line, as 1.1 has. Step 4 drops any card
        whose criteria only the owner can meet, and this edit came after step 4 ran.
      - [minor] TASKS.md:1121-1122 says `new-feature.md` `:8`, "the reference-feature
        pointer", is stale too. It is not. Lines 8-10 already point at the core folder plus
        the route. Only the `routes.ts` path on `:10` is wrong. A path-existence check would
        not fail on `:8`.
      - [minor] The 0.3 decision quotes "test names say what they assert / claims match what
        tests prove". That merges two standards, and neither one covers "a test that proves
        presence, not behaviour". The accurate decision is "nothing: `/review` already
        counts presence-only tests as missing".
      - [minor] The product count (641) includes the generated `routeTree.gen.ts` (68) and
        `test-setup.ts` (5), but the log says "non-test". 1.G should leave both out, or say
        it counts them.
      - [minor] The retry-1 entry was placed above the first `Review: returned`, not after
        it. Read by position, the card then has a Review line after its latest dated entry,
        which is the review selector's "already reviewed" signal. 0.4b and 0.6 put retries
        after the return. Do the same.
    - Standards: no findings. The new STANDARDS line is a judgement call with a concrete
      example (0.4b), and it is backed by a finding that cost a retry.
  - 2026-11-19 Raphael: signed off without CI. GitHub Actions is blocked by a billing
    lock on the account, so the workflow has not run. `scripts/verify.sh` and `pnpm smoke`
    pass locally on `phase-0`; the branch is pushed and PR #1 is open. Owner exception to
    the gate rule: 0.8 stays `Awaiting sign-off` until CI has run green once on GitHub,
    and Phase 1 starts with it open.

# Phase 1: UI kit in the web app

Ref: ui-kit (reuse).

## 1.1 Vet ui-kit
- Phase start: on `phase-1` (see the rules above).
- Precondition (human): the owner unpacks the finished UI project into the references
  folder. The card checks for the unpacked `src/` folder.
- Read: PRD §3.4, §3.5
- Done when: `/vet ui-kit` has written its report with keep, fix or reject per file, and
  no verdict needs an owner decision.
- Status: done
- Retries: 0
- Log:
  - 2026-11-19: blocked, waiting for: the owner unpacks the finished UI project into the
    references folder (no dated owner sign-off line in this Log). Owner: add
    `YYYY-MM-DD: owner: checked, passes.` and set the card back to `todo`.
  - 2026-11-20 Raphael: finished UI kit unpacked into `references/ui-kit/` (`src/` is
    there). Checked, passes.
  - 2026-11-20: vetted ui-kit; report in `docs/references/ui-kit.md`, `Vetted:` line set in
    `docs/REFERENCES.md`. Roughly: 27 UI primitives and the custom components are `keep`
    (adaptation only: imports, deps), 2 of them need token fixes (`separator`, `sidebar`
    use arbitrary `shadow-[...]`), `theme.css` and the docs are `fix`, shell, nav, layouts and
    screens are `fix` (rebuild per PRD §3.4), routes, guards, stores, mock API, axios, app
    config and stub pages are `reject`. No verdict needs an owner decision. Decisions the PRD
    left open: `src/theme.css` is canonical over the root `theme.css` (1.2 diffs them). Judged
    by reading only; nothing in `references/` was run, and the reference has no tests. Not
    every long class string in the smaller primitives was read; 1.4's check proves them.
    Findings that differ from the PRD: it says 24 components (27 files) and a shadow helper
    outside the components and two icon sets (neither found). Stubs: none. Wish: the scout's
    shell was denied, so no byte-diff of the two `theme.css` copies.
  - Review: approved 2026-11-20
    - Checked: `scripts/verify.sh` passes. Spot-checked against `references/ui-kit/`: 27
      files in `ui/` (correct), only `@tabler/icons-react` (correct), no hex, rgb, oklch or
      palette colour classes under `src/components` (correct), no shadow helper outside
      `cn.ts` (correct), no test script in the reference `package.json` (correct). The done
      criterion is met: every file has a verdict and none needs the owner.
    - Spec:
      - [minor] `docs/references/ui-kit.md` F1: the two `theme.css` copies are
        byte-identical (`git diff --no-index` prints nothing; both are 325 lines). The
        291-vs-325 claim is wrong, and the diff 1.2 is told to run has nothing to find. 1.2
        can take `src/theme.css` and skip the diff.
      - [minor] The `.gitignore` change (`!docs/references/`) is out of the card's scope and
        is explained only in the commit message, not in this Log.
    - Standards:
      - [minor] Log and report line "2 of them need token fixes" is right for `ui/` only.
        The report's F1 states a line count it did not check (see Spec). That runs close to
        the 0.4b/0.5 "claims only what was proved" standard.
    - Reference:
      - [minor] F5 lists `"use client"` only for `ui/sidebar.tsx:1`. It is also at line 1 of
        `ui/{checkbox,dropdown-menu,field,radio-group,separator,table,tooltip}.tsx`,
        `shared/header.tsx` and `layouts/layout-base.tsx`. Under `reuse`, 1.2 either keeps 9
        meaningless directives or removes them without a listed fix. Widen F5 before 1.2.
      - [minor] F4/F10 miss three arbitrary shadows:
        `layouts/app-layout/variants/collapsible-side.tsx:18`, `floating-side.tsx:16`
        (`shadow-[0_1px_0_0_var(--etched-edge)]` in `headerClassName`) and
        `navigation/app-stacked-side-nav.tsx:190`. F10 says "keep the variant markup
        unchanged", which would carry them into 1.5. 1.4's check would still catch them.
      - [minor] F9 names the hardcoded users in `app-top-nav.tsx` and `app-side-nav.tsx`
        only. `app-stacked-side-nav.tsx:40` also hardcodes "Jordyn Levin", and stacked-side
        is the shell 1.5 builds. F9's general rule (take the user from the session) covers
        it, but the file should be named.

## 1.2 Move the UI kit
- Read: PRD §2.5, §3.4, §3.5
- Ref: ui-kit
- Build: tokens, components and design rules into the UI package. No screens: a screen
  enters the web app only in the card that rebuilds it (auth in 2.4a to 2.4c, billing in
  3.2, settings in 3.3). One icon set (Tabler); one app alias; stubs left behind.
- Done when: the web app builds on the UI package; verify fails on a second icon
  dependency.
- Status: done
- Retries: 1
- Log:
  - 2026-11-20: built (reuse, per `docs/references/ui-kit.md`): the 27 primitives copied into
    `packages/ts/ui/src/components` (old stub Button/Input replaced), `cn.ts`, `use-mobile.ts`,
    `theme.css` (`src/theme.css`; the two copies are byte-identical, so no diff), `DESIGN.md`
    and `component-inventory.md`. Adaptation A1-A3: imports became relative (`../cn`,
    `./button`), `src/index.ts` re-exports every component, deps added (base-ui,
    tabler, cva, shadcn, tw-animate-css, instrument-sans font), `styles.css` is the CSS entry
    (tailwind, animate, shadcn, font, theme) exported as `@qlastakit/ui/styles.css`; the web
    `styles.css` imports it. Fixes: F4 arbitrary shadows in `separator` and `sidebar` became
    tokens `shadow-etched-h/-v`, `shadow-sidebar-ring(-hover)` (in `theme.css` and `cn.ts`);
    F5 `"use client"` removed from all 8 files (widened per the review); F2 font import is in
    the UI CSS entry; F3 doc paths and recipes updated. Verify: new `icons` step fails on any
    non-Tabler icon dependency in a tracked `package.json`; proved with a throwaway
    `lucide-react` package.json (failed, probe removed). Web builds on the package
    (`vite build` ok); `scripts/verify.sh` passes. Changes beyond the report, with reason:
    `use-mobile.ts` rewritten with `useSyncExternalStore` because oxlint
    `react/set-state-in-effect` fails verify on the original (same behaviour, false on the
    server); the notes page swapped `text-red-600`/`border-neutral-200` for `text-destructive`/
    `border-border` since the palette tokens no longer exist in the kit; oxfmt reformatted the
    copied files (the kit used no semicolons). Decisions the PRD left open: components live
    flat in `src/components` (no `shared/ui` nesting); the app alias is 1.5's job (no `@/`
    exists in the web app yet, so there is still one alias: none). Not moved: Logo (F6, needs
    the app name as a prop, rebuilt with the shell in 1.5), shell, nav, layouts, screens.
    Stubs: none. Wish: shell commands with `&&`, `sed` or redirects are denied, so file edits
    went through a throwaway Node script. `DESIGN.md` sections on Logo/`app.config` and
    inventory sections for shared/nav/layouts still describe the shell and are for 1.3/1.5/1.7.
  - Review: returned 2026-11-20
    - Checked: `scripts/verify.sh` passes. `pnpm --filter @qlastakit/web build` passes (client
      and SSR; the Instrument Sans woff2 files are in the output). No `"use client"`,
      `shadow-[` or `@/` left in `packages/ts/ui/src`. Every moved file was compared with
      `references/ui-kit/` after the A1 import rewrite, ignoring formatting: 19 primitives are
      identical; the other 8 differ only by F5 (`"use client"` removed) and F4 (shadows),
      `cn.ts` by the four new names, and `use-mobile.ts` by the rewrite the Log explains. `theme.css` differs from `src/theme.css` only by the four new shadow
      lines.
    - Spec:
      - [must] `scripts/verify.sh:28`: the icon check is a deny-list that misses
        `@hugeicons/react` and `@hugeicons/core-free-icons`. Hugeicons is one of the icon
        libraries of the `shadcn` CLI this card added as a dependency (installed
        `shadcn@4.23.0` has presets with `iconLibrary: "hugeicons"`). Running
        `shadcn add` with such a preset would add a second icon set and verify would still
        pass, so "verify fails on a second icon dependency" is not met. `@lucide/*` (for example
        `@lucide/lab`) is missed too, because the pattern needs `lucide` right after the
        quote. Fix: cover every shadcn `iconLibrary` (lucide, tabler, hugeicons, phosphor,
        remixicon) plus a general rule (for example any dependency whose name contains `icon`
        or `lucide`, except `@tabler/icons-react`). Probe each form and log the probes (project
        standard: one probe per form the repo uses).
      - [minor] The card's Build line asks for "one app alias". The Log defers it to 1.5,
        but the 1.5 card does not mention an alias, and PRD §3.5 names 1.2 as where it is
        checked ("One alias in the web app's TS config"). Either add it here or add it to the
        1.5 card's Build line, so the PRD's check has an owner.
      - [minor] `scripts/verify.sh:28` reads only tracked files (`git ls-files`). A new
        package's `package.json` that has not been added yet passes the `/task` verify run
        before its first commit. CI would catch it, but CI has not run yet (0.8 sign-off).
    - Standards:
      - [minor] The Log says `"use client"` was "removed from all 9 files". Eight moved files had
        it (`checkbox`, `dropdown-menu`, `field`, `radio-group`, `separator`, `sidebar`,
        `table`, `tooltip`). The other two the 1.1 review named (`shared/header.tsx`,
        `layouts/layout-base.tsx`) were not moved. This is the same kind of count error as
        1.1's 291-vs-325 line count, after 0.4b and 0.5. It keeps coming back under the
        "claims only what the code does" standard. The phase gate should make it a check.
      - [minor] `packages/ts/ui/DESIGN.md:106-114` (shadow table) and `:253` (token reference)
        do not list the four new shadows. `component-inventory.md:47,58,68` give
        `src/components/shared`, `.../navigation` and `src/components/layouts` as current
        paths, but none of them exist in the package. The Log mentions this, but the doc
        still states them as fact. Mark those sections "not moved yet (1.5)" so the 1.8
        stale-path check does not trip on them later.
    - Reference:
      - [must] `packages/ts/ui/src/theme.css:84-87`: F4 was applied in a different shape from
        the vet report, and the Log does not say so. F4 asks for theme tokens
        (`--etched-edge-shadow-x/-y`, `--sidebar-outline-shadow`) that the `shadow-*`
        utilities map to. Instead, the four `--shadow-*` entries put the literal geometry
        (`0 1px 0 0 var(--etched-edge)`, ...) in the `@theme inline` mapping section. That
        breaks the file's own rule (`theme.css:6-10`: "A theme is a set of token VALUES ...
        copy the two blocks ... change values. Nothing else") and the rule in the
        `DESIGN.md` this card moved (`DESIGN.md:237-238`: map as
        `--shadow-x: var(--x-shadow)`, value in sections 3 and 4). Every other kit shadow
        follows that pattern (`theme.css:76-83`). Because `@theme inline` copies the value
        into the utility, a theme block can override only the colour (`--etched-edge`), not
        the shadow. 1.4's throwaway-theme proof depends on this. Fix: add
        `--etched-h-shadow`, `--etched-v-shadow`, `--sidebar-ring-shadow` and
        `--sidebar-ring-hover-shadow` (or F4's names) to the light and dark blocks, and map
        them as `var(...)`.
  - 2026-11-20 (retry 1, fixes for the returned review; the builder stopped when running
    its probe was denied, and the owner's session finished the card):
    - [must] Icon check: `scripts/verify.sh` fails on any `package.json` key containing
      `icon`, `lucide`, `phosphor`, `remix`, `feather` or `fontawesome` (any case), except
      `@tabler/icons-react`. That covers every shadcn `iconLibrary` (lucide, hugeicons,
      phosphor, remixicon; tabler is the allowed one). Probed with
      `.potato/tmp/icon-probe.sh`, which runs the same pipeline as the check against one
      throwaway `packages/ts/_probe/package.json` per form: `@hugeicons/react`,
      `@hugeicons/core-free-icons`, `@lucide/lab`, `lucide-react`, `@phosphor-icons/react`,
      `@remixicon/react`, `remixicon` and `react-icons` are each caught; the clean tree and
      a Tabler-only package report nothing; probe removed. Trade-off: any other key
      containing `icon` (a script named `build:icons`, say) also fails; none exists.
    - [must] Shadows: the four new shadows follow the kit's pattern. `--etched-h-shadow`,
      `--etched-v-shadow`, `--sidebar-ring-shadow` and `--sidebar-ring-hover-shadow` hold
      the values in the light and dark blocks, and `@theme inline` maps them as
      `var(...)`, so a theme block can override the whole shadow. The names differ from
      F4's (`--etched-edge-shadow-x/-y`, `--sidebar-outline-shadow`): one value token per
      utility, named after the `shadow-*` utility the components already use.
    - [minor] The check also reads `package.json` files not yet added (`git ls-files
      --cached --others --exclude-standard`), so a new package fails verify before its
      first commit.
    - [minor] App alias: added to card 1.5's Build line. PRD §3.5 names 1.2, but the web
      app has no alias yet, so 1.5 sets it up with the shell.
    - [minor] Count: `"use client"` was removed from 8 files, not 9; the first entry is
      corrected.
    - [minor] Docs: the `DESIGN.md` shadow table and token reference list the four new
      shadows. `component-inventory.md` marks shared components, navigation and layouts
      "not moved yet (1.5)", names their reference-kit folders without backticks (they do
      not exist in this package), and lists the new shadow utilities.
    - `scripts/verify.sh` passes; `pnpm --filter @qlastakit/web build` passes. Wish: run
      scratch probes headless (`Bash(bash .potato/tmp/*)`, added by the owner in
      `0e895e3`).
  - Review: approved 2026-11-20
    - Checked: `scripts/verify.sh` passes. Runtime: `pnpm --filter @qlastakit/web build`
      passes (client and SSR), and the built CSS carries `var(--etched-h-shadow)` and
      `var(--sidebar-ring-hover-shadow)`, so the utilities read the value tokens. Icon
      check, run by the reviewer with a scratch script (deleted) that runs the same
      pipeline against an untracked `packages/ts/_probe/package.json`, one form at a time:
      `@hugeicons/react`, `@hugeicons/core-free-icons`, `@lucide/lab`, `lucide-react` (with
      and without a space after the colon), `@phosphor-icons/react`, `@remixicon/react`,
      `remixicon`, `react-icons`, `@heroicons/react`, `@radix-ui/react-icons` and
      `@tabler/icons` are each caught; `@tabler/icons-react` and the clean tree pass. The
      full `scripts/verify.sh` with an untracked `@hugeicons/react` probe exits 1 at the
      icons step and names the file and line, so the "not yet added" reading works too.
      Both previous [must]s are fixed.
    - Spec:
      - [minor] `scripts/verify.sh:33`: the check is still a name match, so an icon set
        with no listed word in its name passes. Probed: `@mdi/react`,
        `@material-symbols/svg-400` and an npm alias (`"glyphs": "npm:lucide-react@1"`)
        all pass. None is a shadcn icon library, so the done criterion holds; matching the
        value side as well would close the alias case.
      - [minor] `scripts/verify.sh:32-33`: `xargs` splits on spaces, so a `package.json`
        under a path with a space would be skipped or break the grep. No such path exists.
    - Standards: no findings. The log claims match what the probes show, and the
      `build:icons` trade-off is stated.
    - Reference: F4 is now applied in the kit's own pattern (`theme.css:84-87` map
      `var(...)`, values at `:179-182` and `:244-247`). The token names differ from F4's
      and the Log gives the reason. `cn.ts`, `separator.tsx` and `sidebar.tsx` use the same
      four utility names. `DESIGN.md:113-114,255` and `component-inventory.md` match.
    - Note: the reviewer's probe left an empty, untracked folder `packages/ts/_probe`
      (removing a folder is denied here). It holds no file and git does not see it; a
      human can delete it.

## 1.3 Component preview
- Read: PRD §2.5
- Build: a dev-only route rendering every component.
- Done when: runtime: it renders in dev and is absent from the production build.
- Status: done
- Retries: 1
- Log:
  - 2026-11-20: built `/dev/components` (`apps/web/src/routes/dev.components.tsx`), which
    lazy-loads `apps/web/src/dev/component-preview.tsx`, one labelled section
    (`data-preview`) per UI component (27, every file in `packages/ts/ui/src/components`).
    Gate: `import.meta.env.DEV ? lazy(import(...)) : null` plus a `beforeLoad` that throws
    `notFound()` outside dev. Runtime, dev: a throwaway Playwright script (in
    `.potato/tmp`, not committed) started `vite dev` on 3190, opened `/dev/components`: 200,
    27 sections, no console or page errors. Runtime, prod: `pnpm --filter @qlastakit/web
    build` emits only a 0.17 kB `dev.components` stub chunk; grep of `dist` for preview
    text finds nothing. Not run: requesting the route from a production server (the
    `notFound()` branch is read, not run). `verify.sh` passes. Decisions the PRD left open:
    the route stays in the route tree in prod (404) rather than being excluded from the
    generator; the sidebar is shown with `collapsible="none"` in a bordered box; no icons
    in the preview (Tabler is wired by 1.5). Stubs: none. Wish: a check that fails when a
    UI component is missing from the preview (today a new component must be added by hand;
    the file header says so).
  - Review: returned 2026-11-20
    - Checked: `scripts/verify.sh` passes. `pnpm --filter @qlastakit/web build` passes; the
      `dev.components` chunks are stubs (`() => null`, client 0.09 kB, server 0.17 kB), and
      a grep of `dist` for preview text (`data-preview`, `Component preview`, `Heads up`,
      `Hover me`) finds nothing. Runtime, prod (reviewer's throwaway Playwright script,
      deleted): `vite preview` serves `/` with 200 and `/dev/components` with 404 and no
      preview markup, and client-side navigation from `/` to `/dev/components` shows "Not
      Found", so the `notFound()` branch the Log did not run works. Runtime, dev: `vite dev`,
      `/dev/components` loads with 27 `data-preview` sections, one per file in
      `packages/ts/ui/src/components`, and no page errors on load. Then each overlay or
      toggle was opened on a fresh page: Sheet, Select, Tooltip, Collapsible and Tabs open
      and the page keeps its 27 sections.
    - Spec:
      - [must] `apps/web/src/dev/component-preview.tsx:191-196`: clicking "Open menu" crashes
        the whole preview. React throws `Base UI: MenuGroupContext is missing. Menu group
        parts must be used within <Menu.Group> or <Menu.RadioGroup>`, the error reaches no
        route error boundary ("wasn't caught by any route"), and the page drops from 27
        sections to 0. `DropdownMenuLabel` is `MenuPrimitive.GroupLabel`
        (`packages/ts/ui/src/components/dropdown-menu.tsx:54-62`), so it must sit inside a
        `DropdownMenuGroup`. The menu content only mounts when opened, which is why the
        load-only check missed it. So the DropdownMenu content (label, items, separator)
        never renders, and "a dev-only route rendering every component" is not met. 1.4's
        runtime proof also uses this page. Fix: wrap the label (and its items) in
        `DropdownMenuGroup`. Then open every overlay in the runtime check (dropdown, sheet,
        select, tooltip, collapsible, tabs) and log each one.
      - [minor] No committed test covers the preview. `apps/web` already has vitest, jsdom
        and Testing Library, so a test that renders `ComponentPreview`, checks there is one
        `data-preview` per file in `packages/ts/ui/src/components` (the Log's wish), and
        opens the dropdown would have caught this and would keep catching it.
    - Standards: no findings. The file headers and Log claim only what was run. The Log
      says the prod `notFound()` branch was read, not run, and "no console or page errors"
      is true for what was tested (load only).
    - Repeat across cards: a runtime criterion was proved only on the path the builder ran
      (here, page load and not interaction; 0.5 had a similar gap between the claim and
      the test). For the phase gate: a UI runtime check that says "renders" exercises every
      piece of the UI that mounts on interaction.
    - Note: the reviewer's dev and preview servers ran on ports 3191 to 3193 and were killed
      by `taskkill /t`. The reviewer could not confirm the ports are free (port listing
      was denied here).
  - 2026-11-20 (retry 2): fixed the [must] and the minor. `DropdownMenuLabel`, separator and
    items are now inside `DropdownMenuGroup` in `component-preview.tsx`. Added
    `component-preview.test.tsx`: one `data-preview` per `.tsx` file in
    `packages/ts/ui/src/components` (the Log's wish, now a test), and it opens the dropdown,
    sheet, select, tooltip, collapsible and tabs and checks the section count is unchanged.
    Proved red: on the old code the test fails with "MenuGroupContext is missing"; green on
    the fix. `test-setup.ts` gained a `matchMedia` stub (jsdom has none; the UI kit's
    `useIsMobile` needs it). Runtime, dev (throwaway Playwright script in `.potato/tmp`,
    deleted, vite dev on 3195): Open menu (Account), Open sheet, Select (option Two), Hover
    me (Tooltip), Toggle (Hidden content) and Tab B (Panel B), each on a fresh page: all
    worked, 27 sections each time, 0 page errors. `verify.sh` passes. Stubs: none. Wish: none.
  - Review: approved 2026-11-20
    - Checked: `scripts/verify.sh` passes. Runtime, prod: `pnpm --filter @qlastakit/web build`
      emits only stub `dev.components` chunks (client 0.09 kB, server 0.17 kB), and a grep of
      `dist` for `data-preview`, `Component preview`, `Hover me` and `Hidden content` finds
      nothing. Runtime, dev (reviewer's throwaway Playwright script in `.potato/tmp`, deleted;
      `vite dev` on 3197, stopped): load, dropdown (Account label and Profile item), sheet,
      select (picked Two), tooltip, collapsible and Tab B, each on a fresh page: 200, 27
      sections, 0 page or console errors. Test strength (probes deleted): before any
      interaction none of the texts the test waits for (Account, Sheet description, option
      Two, Tooltip, Hidden content, Panel B) is in the DOM, so each assertion proves the open
      worked; the pre-fix dropdown markup throws "MenuGroupContext is missing", so the red
      claim holds. `use-mobile.ts:7` does call `matchMedia`, so the stub's comment is true.
    - Spec: no findings. The returned [must] and [minor] are fixed.
      - [minor] `apps/web/src/dev/component-preview.test.tsx:10-14`: the test compares counts
        only, so a duplicated section would hide a missing component. Comparing the sorted
        `data-preview` names with the file names (kebab to Pascal) would close that.
    - Standards: no findings. Test names say what they assert; the Log claims only what was
      run.

## 1.4 Token purity
- Read: PRD §2.5, §3.5
- Build: no hardcoded color, shadow, border or surface in components; a verify check
  (`scripts/check-tokens.mjs`) with committed fixtures. Scope is a closed list (set by
  `/advise`, since "no hardcoded anything" cannot be proved by a pattern check):
  - Tailwind class strings in `.ts`/`.tsx` under `packages/ts/ui/src` and `apps/web/src`.
  - `.css` in those roots except `theme.css`: `@apply` lines, `box-shadow` and
    `text-shadow` declarations, hex colors and color functions.
  - Not this card: the helper section of `theme.css` and named colors in plain CSS (both
    1.4a); colors built in template strings or `style={{}}` objects (a wish for the gate).
- Done when:
  - verify's token-purity check passes on the repo.
  - The fixtures hold banned lines and allowed lines for both file types the check scans
    (class strings and CSS), with at least one line each for `@apply`, `cn(...)` and a
    variant prefix. Every form named in the two returns below has a line. That includes
    allowed CSS `box-shadow: var(--shadow-card);`, `box-shadow: none;`, `text-shadow: none;`
    and banned CSS `@apply shadow-md;`, `@apply !shadow-md;`.
  - The repo scan reads `.txt` only for the fixtures.
  - Runtime (a throwaway test theme changes the whole preview page without editing a
    component): proved by the first review, 237 of 237 elements. It holds while the diff
    touches no component and no theme file; run it again only if it does.
  - At review, a banned form outside the scope list that gets through is a note on 1.4a,
    not a return. A token form in scope that is wrongly flagged is still a return.
- Status: done
- Retries: 1
- Log:
  - 2026-11-20: built `scripts/check-tokens.mjs`, called from `scripts/verify.sh`: scans
    `packages/ts/ui/src/components` and `apps/web/src` (tests skipped) for hex colors,
    color functions (`rgb`, `hsl`, `oklch`...), palette and bare white/black colors,
    arbitrary-value colors, stock shadows (`shadow`, `shadow-sm..2xl`, `shadow-[..]`,
    `drop-shadow`), and `bg-gradient`/`bg-linear`; `shadow-none` and token shadows
    (`shadow-card`) pass. Components were already clean; the one hit was the web root
    `<body className="bg-white text-neutral-900">` (`routes/__root.tsx`), now
    `bg-background text-foreground`. Proved the check fails: a throwaway probe file
    (deleted) with `bg-white`, `shadow-md`, `text-[#fff]`, `bg-gradient-to-r` reported all
    of them, exit 1; the repo passes. Runtime: a throwaway Playwright script (in
    `.potato/tmp`, deleted; `vite dev` on 3196) opened `/dev/components`, added a test
    theme (`[data-theme='probe']`, token values only: colors, shadows, surface gradient)
    and set it on `<html>`. Body background went `oklch(1 0 0)` to `rgb(255, 0, 0)`; in
    all 27 sections every section had changed elements (e.g. Alert 11 of 11, Card 8 of 8,
    Button 11 of 13, Sidebar 13 of 13), and of the styled elements only one stayed the
    same: the `--solid` Button, because the probe did not set `--solid`. 0 page errors.
    `verify.sh` passes. Decisions the PRD left open: the check is a Node script, not an
    oxlint rule (no lint plugin covers Tailwind class strings); one hit reported per rule
    per line; scope is components plus the whole web app, not `theme.css` (that is where
    token values belong). Stubs: none. Wish: the check does not see colors built in
    template strings or `style={{}}` objects; extend it if a card needs that.
  - Review: returned 2026-11-20
    - Checked: `scripts/verify.sh` passes (`tokens: no hardcoded color, shadow or surface`).
      Runtime (reviewer's throwaway Playwright script in `.potato/tmp`, deleted; `vite dev` on
      3198, stopped): `/dev/components` 200. I overrode every color, shadow and gradient
      custom property on `:root` (54, read from the live stylesheets) in a
      `[data-theme='probe']` block and set it on `<html>`. After transitions settled (1 s),
      237 of 237 elements in all 27 sections changed color, background, border or shadow,
      body went `oklch(1 0 0)` to `rgb(255, 0, 0)`, and there were 0 page errors. The runtime
      criterion is met. The Log's one unchanged `--solid` Button and a Tabs trigger stay the
      same if you snapshot straight away, but both have `transition-all` and change once it
      ends.
      Probes (deleted) ran `node scripts/check-tokens.mjs <dir>` on a probe `.tsx` and
      `.css`. Caught: `ring-red-500`, `bg-red-500/50`, `hover:shadow-xl`,
      `data-[x=y]:bg-zinc-100`, `inset-shadow-sm`, `text-red-500`, `bg-radial`.
      Missed: see below.
    - Spec:
      - [must] `scripts/check-tokens.mjs:17-31,35`: the check misses forms the card names
        ("border", "the whole web app"):
        - `EXT` is JS/TS only, so CSS files are never read, even inside a scanned root.
          `apps/web/src/styles.css` is in the web app root. A probe `.css` with
          `body { box-shadow: 0 1px 2px #000; color: #333; }` passes.
        - Side borders are missed: `border-t-black`, `border-e-red-500`,
          `border-x-gray-200`. The palette rule needs `border-` directly before the color,
          and components use side borders (`border-e`, `border-s`, `border-t` in `card`,
          `input-group`, `sheet`, `sidebar`, `table`), so a side-border color is the next
          form a component writes.
        - Tailwind v4 shadow forms are missed: `shadow-lg/20` (opacity modifier),
          `shadow-lg!` and `!shadow-md` (important). The stock-shadow lookahead or prefix
          rejects `/` and `!`.
        - Also missed: `ring-offset-blue-500`, `text-[red]` (named color as an arbitrary
          value), `bg-[var(--color-red-500)]` (Tailwind palette variable).
        Fix: scan `.css` in the roots too (exclude `theme.css` by name, where token values
        belong), allow a side or offset part between the property and the color, accept
        `/NN` and `!` on shadows, and flag `--color-<palette>-` variables. Prove each form
        with a probe and log it.
      - [minor] Scope: `packages/ts/ui/src/*.ts` outside `components/` is not scanned. That
        is where PRD §3.5's defect ("shadows applied by a helper outside the components")
        would live. The vet found no such helper today. `cn.ts` already passes the rules
        (probe), so scanning all of `packages/ts/ui/src` costs nothing.
      - [minor] No committed test covers `check-tokens.mjs`. The proof was a throwaway
        probe, so nothing stops a later regex edit from silently dropping a form. A small
        fixture test (each banned form fails, each token form such as `shadow-card` or
        `shadow-none` passes) would keep the forms proven.
    - Standards:
      - [must] Line 4 ("a lint or verify ban is proved with a probe for every form the repo
        really uses"): the Log's probe was one file with four classes, and it missed the
        `.css` extension and side-border forms above, both used in the repo. Line 1: the
        Log's "scope is components plus the whole web app" claims more than the code does,
        since the web app's CSS is not scanned.
    - Repeat across cards: this is 0.4b's finding again (a ban proved for one form while
      another form the repo uses got through). Standards line 4 did not stop it. For the
      phase gate: make it a check. Each verify ban ships a committed fixture of banned and
      allowed forms that verify runs.
    - Note: the reviewer could not confirm port 3198 is free. The dev server was stopped
      with TaskStop, and the port check needed approval.
  - 2026-11-20 (retry 2): fixed both [must]s and both minors in `scripts/check-tokens.mjs`.
    Now scans all of `packages/ts/ui/src` (not just `components/`) and `apps/web/src`, and
    reads `.css` too; `theme.css` is skipped by name (token values belong there). New forms:
    side and offset parts (`border-t-black`, `border-e-red-500`, `border-x-gray-200`,
    `ring-offset-blue-500`), shadow `/NN` and `!` (`shadow-lg/20`, `shadow-lg!`,
    `!shadow-md`), `text-[red]`, `bg-[var(--color-red-500)]`, and a CSS rule for
    `box-shadow:`/`text-shadow:` that is not `none` or `var(...)`. Committed fixtures in
    `scripts/fixtures/tokens` (`banned.txt`, `banned.css`: one banned form per line, 31
    lines; `allowed.txt`: token forms such as `shadow-card`, `shadow-none`, `border-t`,
    `border-t-border`); the script runs them on every `verify.sh` and fails if a banned line
    is not reported or an allowed line is. Proved: scanning the banned fixtures directly
    gives 38 reports; the repo itself and the allowed fixture pass; `verify.sh` passes. The
    fixtures are `.txt` (and one `.css`) so typecheck and lint ignore them; `scripts/fixtures`
    added to oxfmt `ignorePatterns` so the CSS stays one form per line. Decisions the PRD
    left open: fixture self-test lives inside the script, not a Vitest test (verify runs it
    with no extra wiring). Stubs: none. Wish: still blind to named colors in plain CSS
    (`color: red`) and to colors built in template strings or `style={{}}` objects. For the
    0.G-style gate: the reviewer's "each verify ban ships a fixture" is now true for this
    check; the icons check in `verify.sh` has none.
  - Review: returned 2026-11-20
    - Checked: `scripts/verify.sh` passes (`tokens: no hardcoded color, shadow or surface`,
      fixtures included). This diff touches only `scripts/`, `.oxfmtrc.json` and the card, so
      the runtime theme result from the previous review (237 of 237 elements changed) still
      holds for the unchanged components. Every form from the first return is now caught
      (fixtures plus my own probes). Probes (in `.potato/tmp`, deleted) ran
      `node scripts/check-tokens.mjs <file>` on a `.css` and a `.tsx`. Also caught:
      `shadow-inner`, `md:shadow-md`, `[&>*]:shadow-sm`, `shadow-black/10`, `text-white/80`,
      `inset-ring-red-500`, `divide-x-gray-200`, `text-shadow-lg/20`, `bg-conic-180`,
      `outline-white`, `bg-[white]/50`, `cn("shadow-md", x)`, `@apply bg-white;`,
      `@apply border-t-gray-200;`, `@apply shadow-lg/20;`, `drop-shadow(...)` in CSS.
    - Spec:
      - [must] `scripts/check-tokens.mjs:37` (`css shadow`): the rule flags the token form
        it is meant to allow. `\s*` backtracks to zero characters, so `(?!none\b|var\()`
        looks at the space and always passes. `.c { box-shadow: var(--shadow-card); }` and
        `.c { box-shadow: none; }` both fail the check. Only `box-shadow:var(...)` with no
        space passes, and oxfmt writes the space. A web app stylesheet that uses a shadow
        token the right way cannot pass verify. Also `text-shadow: none` is flagged by
        `other shadow` (`\btext-shadow\b`, line 36) whatever the value is. Fix: put the
        whitespace inside the lookahead (`:(?!\s*(?:none\b|var\())`), and leave the CSS
        property `text-shadow:` out of `other shadow`. Add these lines to the allowed fixture as CSS
        (`box-shadow: var(--shadow-card);`, `box-shadow: none;`, `text-shadow: none;`).
      - [must] `scripts/check-tokens.mjs:34` (`stock shadow`): `@apply shadow-md;` and
        `@apply !shadow-md;` pass. The lookahead `(?=[\s"'`]|$)` does not accept `;`, so a
        stock shadow at the end of an `@apply` line gets through. Only `shadow-md }` and the
        `/NN` forms are caught, the second by luck (`[^\s"'`]+` eats the `;`). `@apply` is
        how this repo writes Tailwind in CSS (`theme.css:294-323`), and this card's point was
        to scan CSS. `banned.css` has no `@apply` line. Fix: accept `;` (and `,` and `)`) in
        the lookahead, and add `@apply shadow-md;` and `@apply !shadow-md;` to
        `banned.css`.
      - [minor] Plain-CSS named colors (`color: red`, `background: white`,
        `border: 1px solid black`, `linear-gradient(white, black)`) and
        `box-shadow: var(--x), 0 0 0 1px black` pass. The Log lists this as a wish, which is
        honest, and the scanned CSS files hold only `@import` today. Leave it for a later
        card or the gate.
      - [minor] `theme.css` is skipped as a whole file, but it also holds the `@utility`
        helpers and `@layer base` (`theme.css:260-325`). That is where PRD §3.5's "shadow
        applied by a helper outside the components" would live now. For example,
        `@utility lift { @apply shadow-md; }` there passes. Scanning `theme.css` from the
        `@utility` section on (after the token blocks) would close that gap. The first
        return asked for this skip, so it is not a `[must]`.
      - [minor] `EXT` now takes `.txt` in the repo scan too, not only in fixtures. This is
        harmless today, but it does more than the comment says.
    - Standards:
      - [must] Line 1: the Log says the CSS rule flags `box-shadow:`/`text-shadow:` "that
        is not `none` or `var(...)`", but the code flags both (see above). Line 4: the
        allowed fixture has no CSS line and `banned.css` has no `@apply` line, so the forms
        this retry added were not proved for the file type it added.
    - Repeat across cards: this is the third time (0.4b, 1.4 return 1, now) that a ban was
      proved for some forms while another form the repo uses got through. It is also the
      first time an allowed form was wrongly blocked. For the 1.G gate: a verify ban's
      fixtures must hold banned and allowed lines for every file type the ban scans, and each
      repo idiom (`@apply`, `cn(...)`, variant prefixes) must have a line.
  - Advised: 2026-11-20: split. The card was wrong, not the approach: "no hardcoded color,
    shadow, border or surface" has no end for a pattern check, so each return fixed the
    named forms and the next review found new ones (the runtime criterion passed at the
    first review). 1.4 now has a closed scope list and a fixture criterion that names the
    two open `[must]`s; the CSS gaps both returns left as minors (`theme.css` helpers,
    plain-CSS named colors) moved to 1.4a. Both returns stand; I do not disagree with either.
  - 2026-11-20 (after split): fixed the two open `[must]`s in `scripts/check-tokens.mjs`.
    (1) `css shadow` now has the whitespace inside the lookahead
    (`:(?!\s*(?:none\b|var\())`), so `box-shadow: var(--shadow-card);` and
    `box-shadow: none;` pass; the `other shadow` class rule no longer matches the CSS
    property `text-shadow:` (`text-shadow(?!:)`), so `text-shadow: none;` passes and
    `text-shadow: 0 1px black` is still caught by `css shadow`. (2) `stock shadow` accepts
    `;` after the class, so `@apply shadow-md;`, `@apply !shadow-md;` and
    `@apply shadow-lg/20;` are caught. Fixtures: `banned.css` gained those three `@apply`
    lines and a banned `text-shadow`; new `allowed.css` holds `box-shadow: var(--shadow-card);`,
    `box-shadow: none;`, `text-shadow: none;` and token `@apply` lines; the self-test scans
    it. `verify.sh` passes (fixtures included). Runtime criterion not re-run: the diff touches
    no component and no theme file. Decision the PRD left open: the lookahead takes `;` but
    not `,` or `)`, because `,` flagged the word "shadow," in a comment in `cn.ts`. Stubs:
    none. Wish: none.
  - Review: returned 2026-11-20
    - Checked: `scripts/verify.sh` passes (`tokens: no hardcoded color, shadow or surface`).
      The diff (`3c90d4d`, `7627a80`) touches only `scripts/check-tokens.mjs`, the token
      fixtures and this card, with no component or theme file, so the runtime result still
      holds. Both open `[must]`s are fixed in the code. Probes (in `.potato/tmp`, deleted)
      ran `node scripts/check-tokens.mjs <file>`. Caught: every "also caught" form from the
      second return, plus `@apply hover:shadow-md;` and `@apply md:bg-white;`. Passed:
      `box-shadow:var(--shadow-card);`, `box-shadow: var(--shadow-card) !important;`,
      `@apply hover:shadow-card;`, `cn("shadow-card", x)`. The regexes are right. The open
      items are the fixtures and one scan criterion.
    - Spec:
      - [must] Done when "at least one line each for `@apply`, `cn(...)` and a variant
        prefix": no fixture has a `cn(...)` line (`banned.txt`, `allowed.txt`,
        `banned.css`, `allowed.css`). `cn(...)` is how components write classes. The CSS
        fixtures also have no variant line (`@apply hover:shadow-md;` banned,
        `@apply hover:shadow-card;` allowed), though both file types are in scope. Fix: add
        banned `cn("shadow-md", x)` and `cn("bg-white", c)`, allowed
        `cn("shadow-card", c && "text-foreground")`, and a variant `@apply` line in each CSS
        fixture.
      - [must] Done when "every form named in the two returns below has a line": the second
        return's "also caught" list is not in the fixtures. Missing: `shadow-inner`,
        `md:shadow-md`, `[&>*]:shadow-sm`, `shadow-black/10`, `text-white/80`,
        `inset-ring-red-500`, `divide-x-gray-200`, `text-shadow-lg/20`, `bg-conic-180`,
        `outline-white`, `bg-[white]/50`, `cn("shadow-md", x)`, and in CSS `@apply bg-white;`,
        `@apply border-t-gray-200;`, `filter: drop-shadow(...)`. All of them are caught today
        (probe). Without a line, a later regex edit can drop any of them silently, and that
        is the risk this criterion exists to close. Add one line each.
      - [must] Done when "the repo scan reads `.txt` only for the fixtures":
        `scripts/check-tokens.mjs:43,62,89`. `EXT` includes `txt`, and the repo scan uses
        it, so any `.txt` under `packages/ts/ui/src` or `apps/web/src` is scanned. A probe
        folder holding `notes.txt` with `see #fff` failed `hex color`. The Log does not
        mention this criterion. Fix: give the repo scan an extension list without `txt`,
        and let only the fixture and probe calls take `.txt`.
    - Standards:
      - [must] Line 4 ("a verify ban is proved for every form the repo really uses"):
        `cn(...)` is the repo's main class idiom and has no fixture line on either side.
      - [minor] Line 1: `scripts/check-tokens.mjs:7-9` says "allowed.txt must pass". Since
        this diff, `allowed.css` must pass too (line 107).
    - Repeat across cards: this is the fourth time (0.4b, 1.4 return 1, 1.4 return 2, now)
      that a ban's proof missed forms the card or the repo names. This time the code is
      right and only the committed fixtures fall short. For the 1.G gate: make fixture
      coverage a check. For example, verify reads a list of required forms (one per line,
      from the card) and fails if a fixture has no line for one, so the builder cannot close
      the card on a partial list.
    - Note: `Retries` was 0 after two returns (`/advise` split the card and did not set it).
      I set it to 1 for this return.
  - 2026-11-20 (retry 2): fixed the three `[must]`s and the minor. Fixtures: `banned.txt`
    gained every "also caught" form from the second return (`shadow-inner`, `md:shadow-md`,
    `[&>*]:shadow-sm`, `shadow-black/10`, `text-white/80`, `inset-ring-red-500`,
    `divide-x-gray-200`, `text-shadow-lg/20`, `bg-conic-180`, `outline-white`,
    `bg-[white]/50`) plus `cn("shadow-md", x)` and `cn("bg-white", c)`; `banned.css` gained
    `@apply bg-white;`, `@apply border-t-gray-200;`, `filter: drop-shadow(...)` and the
    variant `@apply hover:shadow-md;`; `allowed.txt` gained two `cn(...)` lines (one with a
    variant and `shadow-none`); `allowed.css` gained `@apply hover:shadow-card;`. Every line
    is caught or passes (self-test in verify). Scan: split the extension list; the repo scan
    reads only `ts/tsx/js/css`, and `.txt` is read only for the fixtures and for paths given
    on the command line. Proved: a throwaway `apps/web/src/_probe_notes.txt` holding
    `see #fff` passes the repo scan (probe deleted). Header comment now says `allowed.css`
    must pass too. `verify.sh` passes. Runtime criterion not re-run: the diff touches no
    component or theme file. Decisions the PRD left open: none. Stubs: none. Wish: the
    reviewer's idea of a required-forms list that verify checks the fixtures against, for
    the 1.G gate.
  - Review: approved 2026-11-20
    - Checked: `scripts/verify.sh` passes (`tokens: no hardcoded color, shadow or surface`).
      The diff (`d0fc041`) touches only `scripts/check-tokens.mjs`, the token fixtures and
      this card, with no component or theme file, so the runtime result (237 of 237) holds.
      Spec: every form named in both returns has a fixture line (`banned.txt` 40 lines,
      `banned.css` 12, `allowed.txt` with two `cn(...)` lines and `hover:shadow-card`,
      `allowed.css` with the three CSS token forms and `@apply hover:shadow-card;`). `@apply`,
      `cn(...)` and a variant prefix each have banned and allowed lines in the file types they
      belong to. Repo scan: `REPO_EXT` has no `txt` (`check-tokens.mjs:43,91`).
      Probes (scratch tree in `.potato/tmp/r14`, files deleted; the script run with that as
      cwd): `apps/web/src/notes.txt` holding `see #fff` was not reported, while a `.css` with
      `#fff` next to it was (exit 1). The self-test is not tautological: an uncaught
      `bg-background` in `banned.txt` and `@apply shadow-md;` in `allowed.css` both failed it
      (`not caught`, `wrongly flagged`, exit 1).
      Standards: line 1, the Log and the header comment match the code. Line 4, `cn(...)` and
      `@apply` are now covered on both sides.
    - [minor] `banned.css:1` holds two banned forms (a hardcoded shadow layer and `#000`), so
      it would still pass if `css shadow` broke. Today `.c` and `.h` prove that rule alone,
      so nothing is lost. Keep it to one form per line as the header says.
    - [minor] Paths given on the command line read `.txt` too, so the card's "only for the
      fixtures" is really "fixtures and probes". The Log says so, and that is what the
      return asked for.
    - For the 1.G gate: four rounds on this card (0.4b before it) were about fixture coverage,
      not the regexes. The Log's wish (verify checks the fixtures against a required-forms
      list) is the check that would have stopped it.

## 1.4a Token check: theme helpers and plain CSS
- Read: PRD §3.5
- Build: extend `scripts/check-tokens.mjs` (split from 1.4 by `/advise`; these are the
  minors of 1.4's second return):
  - Scan `packages/ts/ui/src/theme.css` from its helper section on (`@utility`,
    `@layer base`); the token blocks stay skipped. This is where PRD §3.5's "shadows
    applied by a helper outside the components" would live now.
  - Flag named colors in plain CSS declarations (`color: red`, `background: white`,
    `border: 1px solid black`, `linear-gradient(white, black)`) and a hardcoded layer
    after a token in a shadow (`box-shadow: var(--x), 0 0 0 1px black`).
- Done when: verify passes on the repo; the fixtures hold a banned line for each form
  above and an allowed line for each token form the helper section of `theme.css` really
  uses; a throwaway `@utility lift { @apply shadow-md; }` added to `theme.css` fails
  verify (proved, probe removed).
- Status: todo
- Retries: 0
- Log:

## 1.5 Shell and routing
- Read: PRD §3.1, §3.4, §3.5
- Ref: ui-kit
- Build: the stacked-side app shell and the side auth layout (§2.5), config-driven
  navigation, access checks before render, layout derived from the route, the access
  denied screen, and one app alias in the web app's TS config (PRD §3.5; moved here
  from 1.2, since the web app has no alias yet). The session is a stub behind an
  interface until 2.4a; a placeholder
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

## 1.8 Stale-reference check
- Precondition (human): the owner fixes the stale path in `.claude/commands/new-feature.md`
  (agent edits under `.claude/` are denied).
- Read: PRD §6
- Build: a `scripts/verify.sh` check that fails on stale references in committed docs and
  config: backticked repo paths in `AGENTS.md`, `README.md`, `docs/recipes`, app/service
  agent guides and `.claude/commands/*.md` that do not exist (the known stale one was
  `.claude/commands/new-feature.md:10`, `features/notes/routes.ts`; the owner fixed it, see
  the precondition), and `localhost:8787` not followed by `/api` in `*.md`,
  `.env.example` and `*.toml`. (Added by the 0.G retro: six stale-reference findings in 0.1,
  0.3 and 0.4b.)
- Done when: verify passes on the repo and fails on a throwaway stale path and a bare
  `localhost:8787` (both proved, probes removed).
- Status: todo
- Retries: 0
- Log:
  - 2026-11-20 Raphael: `.claude/commands/new-feature.md` fixed; it now names
    `services/api/src/features/notes/notes.controller.ts`. Checked, passes.

## 1.9 Web env from the root file
- Read: PRD §2.6
- Build: resolve `envDir` in `apps/web/vite.config.ts` from `import.meta.url`, not the cwd;
  a web test that the server-side API base URL comes from the root env file, run from the
  repo root. (Added by the 0.G retro: three findings on this wiring in 0.4b and 0.6.)
- Done when: the test passes from the repo root and from `apps/web`; verify passes.
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
  so auth emails go through the queue from the first send and are never reworked. Also
  (0.G): route Nest's own logger and the boot `console.log` through pino (`bufferLogs` +
  `useLogger`), so there is one log shape (PRD §2.2; 0.5's minor).
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
  helper. Also (0.G): the root `playwright.config.mts` and `e2e/*.mts` get a tsconfig in
  the typecheck run, since this card makes the smoke test bigger.
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
  Also (0.G): prove the web container's production branch of the server-side base URL
  (`apps/web/src/router.tsx` throws when `API_INTERNAL_URL` is unset outside dev): start
  the web container without it and see the failure, then with it and see the page load.
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
