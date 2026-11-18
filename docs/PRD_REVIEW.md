# PRD review log

Rounds on `docs/PRD.md`, newest last. Written by `/prd-review`.

## Round 1 (reviewer, 2026-11-18)

Read: the PRD whole, the brief, `docs/REFERENCES.md`, `scripts/verify.sh`, the skeleton's
manifests and `references/ui-kit/*.md`. Facts were checked on the web where marked
(sources at the end). npm lookups were not permitted in this session, so package
versions are from the web only.

### Must

1. `[must]` **The smoke test cannot run where the PRD says it runs.** §6 has the smoke
   test read the verification link from the console email, and §1 item 9, 4.1 and 4.7
   run it against production-like containers and the reference deploy. §2.4 makes the
   API refuse to boot in production with the `console` adapter, so there is no console
   email to read there. Fix: give the smoke test two modes in §6. Local and CI: full
   flow with the console email. Deploy (4.7): sign in with an already verified test
   account whose credentials come from env, then create a note; signup and
   verification on the deploy are covered by the owner's sign-off on §1 item 1. Say in
   4.1 that the container run uses the `console` adapter with a non-production env, and
   name the env var that means "production" for the boot refusal.

2. `[must]` **0.4 needs a real Postgres three tasks before the plan provides one.**
   0.4's done criterion is API tests on real Postgres. The Docker precondition and the
   first Compose run are in 0.7, and Phase 0 says Compose has never been run. From 0.4
   on, verify also needs a database. Fix: move "Precondition (human): Docker Desktop
   running" and "Compose Postgres starts and `db/migrate.sh` applies" to 0.4 (or a new
   card before it). 0.7 keeps only the smoke test. State in §6 that verify fails with a
   clear message when Postgres is not reachable, and pick the clean-state mechanism
   (recommended: one test database migrated once, tables truncated between tests).

3. `[must]` **Where the web app and the API sit relative to each other is not
   decided, and cookie sessions depend on it.** §2.3 locks cookie sessions, §3.4 runs
   access checks on the server before render, §2.6 gives the reference deploy "a
   subdomain" (the brief says one). Two origins need a cross-subdomain cookie, CORS
   with credentials and a cookie-forwarding rule for server-side checks; one origin
   needs none of that. 1.5, 2.3 and 4.3 would each guess. Fix: add a §2.6 row. One
   origin: the reference deploy serves the web app and routes `/api/*` on the same
   subdomain to the API (proxy rule in Coolify). Locally the two ports stay and the
   CORS allowlist covers them. Add to §3.3: a server-side before-load check forwards
   the browser's cookie to Better Auth's session endpoint.

4. `[must]` **Better Auth and pg-boss create their own tables, which contradicts
   §2.2 as written.** "Schema source of truth: plain SQL migrations", "Drizzle never
   generates migrations" and "UUID primary keys" are locked. Better Auth's CLI
   generates its schema and its default ids are not UUIDs; pg-boss installs its own
   schema at start. 2.3, 2.6 and 3.1 need the rule first. Fix: add to §2.2: Better
   Auth's tables (core and organization plugin) are hand-written SQL migrations, with
   the CLI output used only as a reference, mirrored in Drizzle, with Better Auth set
   to generate UUID ids. pg-boss's own schema is the one exemption, created by pg-boss.
   Product tables reference the Better Auth organization table for their org id.

5. `[must]` **MinIO, locked in §2.4 and §4, is no longer published.** The community
   edition lost its official Docker images in late 2025 and the repository was archived
   in early 2026 (web sources below; third-party, but consistent). 0.7 and 3.4 cannot
   pull the image the PRD names. Fix: change §2.4, §3.2 and §4 to "a local S3-compatible
   container", and have 3.4 pick a maintained one from current docs that supports
   presigned PUT and bucket CORS (candidates to check: RustFS, Garage, SeaweedFS).
   Remove it from 0.7: nothing needs object storage before 3.4 (principle 1).

### Should

6. `[should]` **2.3 is too big for one session.** It mounts Better Auth in NestJS, adds
   the auth tables, builds sign up, verification, sign in, sign out and reset, adds rate
   limits, rebuilds the auth screens, replaces the session stub and extends the smoke
   test. Fix: 2.3a mount, tables, sign up, verification, sign in and out, those screens,
   the session replaces the stub, smoke test. 2.3b password reset and its screens,
   rate limits on auth routes, the no-axios-or-zustand check.

7. `[should]` **2.8 and 3.2 are each two slices, and 3.2's runtime proof has no page
   to click.** Fix: 2.8a invite by email and accept; 2.8b members screen, role changes,
   role limits in the API. 3.2a payments interface, Stripe adapter, purchases table,
   checkout endpoint (API tests); 3.2b webhooks as jobs with signed fixtures. Move "a
   test-card checkout records a subscription" to 3.3, where the button exists.

8. `[should]` **Stripe's hands-on steps are missing.** Add to 3.2b: Precondition
   (human), the Stripe CLI is installed to forward webhooks locally. Add to 3.3:
   Precondition (human), the test-mode customer portal is configured to allow switching
   between the two Pro prices and cancelling. Add to 4.3: the webhook endpoint is
   registered in Stripe and its signing secret is in the production env.

9. `[should]` **The vet tasks do not match the phases.** 2.1 vets "every supastarter
   path the references doc lists", which includes super admin, onboarding,
   invitation-only signup and three other payment adapters that no v1 task uses, and
   is too much for one session. Phase 3 uses payments, storage and AI with no vet
   task. Fix: 2.1 vets the auth, mail, organizations and settings paths. Add 3.0 for
   payments types, the Stripe adapter, the purchases model, storage and AI.

10. `[should]` **§6 has no test kind for the web app, but 1.5 and 1.6 are "done" by
    web tests.** Fix: add a row. Web routes and shell: Vitest with a DOM environment
    and Testing Library, rendering the router in memory. 0.2 installs it. Name it in
    1.5 (protected route, first-render layout) and 1.6 (pseudo-locale).

11. `[should]` **1.7's done criterion cannot be checked by the reviewer.** `/review`
    never edits code, so it cannot follow a recipe that adds a page. Fix: "Done: the
    builder adds a throwaway page using only the recipe, in two steps, and removes it;
    the task log lists the two steps taken."

12. `[should]` **Email sending has two paths and the worker has no home.** §3.3 says
    the send runs as a job "in deploys"; §3.1 says email sending runs as a job. Tests
    read the newest console file straight after signup, so the path matters. Fix: one
    path from 3.1 on: every send is a job, everywhere. The pg-boss worker runs inside
    the API process in v1 (no second service or Dockerfile). Tests wait for the file
    rather than assume it exists.

13. `[should]` **The per-IP email cap will count the proxy, not the visitor.** Behind
    Cloudflare and Coolify's proxy, every request arrives from the proxy's address, so
    10 auth emails per hour becomes the limit for the whole deploy. Fix: add to §2.3
    that the client IP is read from a trusted forwarded header set by env, and add to
    4.3's done: the API logs the real client IP for a request through the public URL.

14. `[should]` **The upload size limit cannot be enforced the way 3.4 implies.** A
    signed PUT URL cannot carry a size range, and R2 does not support signed POST
    forms, which is the S3 feature that does (Cloudflare docs, below). Fix: reword
    §2.4 and 3.4: the API refuses to sign when the declared type or size is outside
    the limits and signs the content type into the URL; after upload it reads the
    object's size and deletes an oversize object before saving the URL. The API tests
    cover both. Add to 4.3's precondition: the R2 bucket has public read on its own
    subdomain and a CORS rule for the web origin.

15. `[should]` **The org-id verify check needs a list of tables that are not product
    tables.** §3.1 says every product table has an org id; the auth email counters
    (2.4), the AI daily counter (3.6, per user), Better Auth's tables and the migration
    table have none. 2.4 lands before the check in 2.7. Fix: the check reads an
    explicit allowlist with one reason per table, kept beside the migrations. Say the
    same for the error shape: Better Auth's own endpoints keep Better Auth's error
    shape, and state which shape the IP-cap 429 uses, since it is raised inside a
    Better Auth route.

16. `[should]` **§4 does not say where adapters live, and the skeleton has packages
    the layout omits.** §3.1 puts module interfaces in core; §4 lists `email/` as
    templates only. `packages/ts/auth` and `packages/ts/payments` exist as README-only
    placeholders (the auth one still plans JWT/JWKS, which §2.3 defers). Fix: say in
    §4 that adapters (Resend, Stripe, S3, AI) live in the API service under one
    adapters folder and are passed into core; core holds only the interfaces. 0.3
    deletes the two placeholder packages.

17. `[should]` **0.4 leaves choices open that decide whether it fits a session.**
    Add to the card: NestJS on Express (the Better Auth adapter's Fastify support is
    beta and it needs Nest's body parser off); nestjs-zod v5 for zod 4, which the
    skeleton already uses, with its `cleanupOpenApiDoc` step; the spec export must
    not need a database; NestJS needs decorator metadata, which the skeleton's `tsx`
    runner does not emit, so the task picks a runner that does and logs it. NestJS
    replacing Hono is also hard to reverse: write ADR 0004 in 0.4.

18. `[should]` **mise and the lint stack need two lines each.** mise: add
    Precondition (human) to 0.1, mise is installed. On Windows mise runs tasks with
    `cmd /c` by default, so each task is one `pnpm` command and nothing
    shell-specific. oxlint: type-aware linting is now stable but runs on tsgolint,
    which tracks TypeScript 7; the repo is on 5.9. Add a §9 risk: if type-aware
    oxlint does not accept this workspace, 0.1 ships oxlint without it and logs why.
    oxfmt is still pre-1.0 (beta since February 2026), as §2.1 says.

19. `[should]` **"Provider set by env" invites a provider registry.** Fix in §2.4:
    one OpenAI-compatible provider configured by base URL, key and model env vars.
    That covers OpenRouter. More providers come when a project asks.

20. `[should]` **Several UI-kit screens belong to no task.** §3.4 lists OTP, settings
    notifications, settings integrations, roles and permissions, and access denied.
    Only auth screens (2.3), profile and security (2.9) and billing (3.3) are
    assigned. Fix: add OTP, notifications, integrations and the roles-and-permissions
    screen to §3.5 as not moved (no v1 feature behind them); put access denied in
    1.5. Also correct the count: the kit's inventory lists three auth layouts
    (simple, split, side), not four.

21. `[should]` **Sign-offs have no home.** §1 and §7 rely on "the owner's dated
    sign-off" about a dozen times, and the task loop is unattended. Fix: one line in
    §7. A sign-off is a dated line the owner adds to the card in `docs/TASKS.md`; a
    card whose precondition is unsigned is set `blocked` with the step the owner must
    do, and the loop moves on or stops.

22. `[should]` **The active org's location is not stated.** 2.6 and 2.7 need it.
    Fix in §3.2: the active org is stored on the Better Auth session; the controller
    builds the org context from it and core checks membership. No org slug in URLs.

23. `[should]` **Phase 4 has machinery and a missing step.** 4.2: a wizard for three
    pings is more than the job; make it a recipe with the commands and a results
    table, and have the card look up one test endpoint per candidate. 4.4: Coolify
    schedules Postgres backups to S3-compatible storage itself; say 4.4 configures
    that and writes the restore recipe, with no backup code. 4.1 or 4.3 must say how
    migrations run on the deploy: `db/migrate.sh` needs `psql`, which an API image
    will not have.

24. `[should]` **Plans gate nothing, and the PRD should say so.** §2.4 defines Free
    and Pro but no v1 feature differs by plan. Fix: core exposes one function that
    returns an org's current plan; v1 gates nothing with it. Otherwise 3.2 or 3.3
    invents an entitlement layer.

25. `[should]` **OQ1's recommendation claims something that is not true by default.**
    Better Auth's routes do not appear in the NestJS-generated spec; its own OpenAPI
    plugin serves a separate reference. If they were merged into
    `contracts/openapi.json` the generated client would include them, which OQ1
    rejects. Fix: reword to "its routes are documented by Better Auth's own
    reference page and are not part of the contract".

26. `[should]` **`docs/REFERENCES.md` points at PRD sections that no longer exist**
    ("section 6b", "PRD Q1", next-intl). 1.2 and 1.5 are `reuse` cards that read it.
    Fix: add it to 0.9's list, pointing at §3.4 and §3.5.

### Minor

27. `[minor]` §2.1 "Current Node LTS": name the major. `package.json` says `>=22`.
28. `[minor]` 0.8: §2.1 says CI runs on the PR, 0.8 says the owner pushes the branch
    and CI runs. Say the workflow triggers on pushes to phase branches and on PRs.
29. `[minor]` 2.4: restore the brief's hint. Check whether Better Auth's limiter can
    count per address; if not, the cap sits in core in front of `sendEmail`.
30. `[minor]` 3.6: say the daily cap resets at 00:00 UTC.
31. `[minor]` 1.1: `references/ui-kit/` currently holds three loose files and a zip
    that is not yet unpacked. The precondition is still open; the card should check for
    the unpacked `src/` folder, not for the folder.
32. `[minor]` The status line still says "Not yet through PRD review".

### Owner

OQ1 to OQ4 are restated here so they are collected with the new ones.

`[owner]` ❓ Q1 - Auth calls from the web app (OQ1, needed by 2.3): is Better Auth's own client the
one allowed exception to "apps call the API only through the generated client"?
➡️ Yes. Wrapping its endpoints would mean rebuilding its session handling.

`[owner]` ❓ Q2 - AI chat transport (needed by 3.5): is the AI SDK's chat hook, which makes its
own streaming request to the API's SSE endpoint, a second allowed exception to the
generated-client rule, limited to `/demo/*`?
➡️ Yes. It is deleted with the demo, and streaming chat through the generated client
means rewriting what the hook already does.

`[owner]` ❓ Q3 - Icon set (OQ2, needed by 1.2): keep Tabler and remove Lucide?
➡️ Yes. The UI kit's `DESIGN.md` already says Tabler only.

`[owner]` ❓ Q4 - Default shell and auth layout (OQ3, needed by 1.5): move the collapsible-side
shell and the `simple` auth layout first? The PRD's plan to pick the auth layout from
the preview page cannot work: 1.3 previews components, and layouts only exist in the
web app after 1.5.
➡️ Yes. Collapsible-side is the most common SaaS layout and `simple` is the least to
port; the others move when a project wants them.

`[owner]` ❓ Q5 - Roles (OQ4, needed by 2.8, 3.3): owner does everything; admin manages members,
invites and billing; member uses the product. And v1 builds no screens for deleting an
org, transferring ownership or deleting an account?
➡️ Yes. The split is the usual one, and none of the three destructive flows is in the
v1 done list.

`[owner]` ❓ Q6 - The notes page (needed by 0.6, 4.6): notes stays in the kit's real routes as the
reference feature, not under `/demo/`, and the start-a-project recipe tells a project
to delete it once its own first feature exists?
➡️ Yes. The smoke test and the add-feature recipe both lean on it, so it has to
survive the `/demo/*` deletion.

`[owner]` ❓ Q7 - "Fast enough" for the VPS (needed by 4.2): a candidate passes if its median
round trip from Nairobi is 200 ms or less?
➡️ Yes. It gives 4.2 a number to check, and it is loose enough that the cheapest host
can win for a reference deploy.

### Sources

- MinIO status: https://linuxiac.com/minio-ends-active-development/ ,
  https://glukhov.org/data-infrastructure/object-storage/minio-dead/
- oxlint type-aware stable: https://oxc.rs/blog/2026-07-22-type-aware-linting-stable
- oxfmt beta: https://oxc.rs/blog/2026-02-24-oxfmt-beta
- Better Auth NestJS integration: https://better-auth.com/docs/1.6/integrations/nestjs.md
- nestjs-zod v5: https://github.com/BenLorantfy/nestjs-zod
- R2 presigned URLs: https://developers.cloudflare.com/r2/data-access/s3-api/presigned-urls/
- mise tasks on Windows: https://mise.jdx.dev/tasks/toml-tasks.html

must: 5, should: 21, minor: 6, owner: 7

## Round 1 (author, 2026-11-18)

Applied to `docs/PRD.md`. No `[must]` disputed.

1. applied: §6 smoke test has local/CI and deploy modes; 4.1 uses `console` with a non-production `NODE_ENV`; §2.4 names `NODE_ENV=production` for the boot refusal.
2. applied: Docker precondition and the first Compose run moved to 0.4; 0.7 keeps only the smoke test; §6 states the clean-state mechanism and the clear failure when Postgres is down.
3. applied: §2.6 Origins row (one origin on the deploy); §3.3 cookie forwarding in before-load.
4. applied: §2.2 "Tables from libraries" row.
5. applied: MinIO replaced by "a local S3-compatible container" in §2.4, §3.2, §4; 3.4 picks one; removed from 0.7.
6. applied: 2.3 split into 2.3a and 2.3b.
7. applied: 2.8 split into 2.8a and 2.8b; 3.2 split into 3.2a and 3.2b; the test-card checkout moved to 3.3.
8. applied: Stripe CLI precondition in 3.2b, portal precondition in 3.3, webhook endpoint registration in 4.3.
9. applied: 2.1 narrowed to auth, mail, organizations, settings; new 3.0 vets payments, storage and AI.
10. applied: §6 web test row; 0.2 installs it; named in 1.5 and 1.6.
11. applied: 1.7 done criterion rewritten.
12. applied: §2.4 sending path row; §3.3 and 3.1 reworded; worker in the API process.
13. applied: trusted forwarded header in §2.3; real-IP log check and header env in 4.3.
14. applied: §2.4 upload row and 3.4 reworded; R2 public read and CORS in 4.3.
15. applied: org-id check allowlist in §5; Better Auth error shape and IP-cap 429 in §3.3.
16. applied: adapters in the API (§2.4, §4); 0.3 deletes the placeholder packages.
17. applied: 0.4 card carries Express, nestjs-zod v5, no-database spec export, decorator-metadata runner, ADR 0004.
18. applied: mise precondition in 0.1 and one-pnpm-command rule in §2.1; oxlint risk in §9 and the fallback in 0.1.
19. applied: one OpenAI-compatible provider in §2.4.
20. applied: unmoved screens row in §3.5; access denied in 1.5; auth layout count corrected to three.
21. applied: sign-off definition in §7.
22. applied: active org row in §3.2.
23. applied: 4.2 is a recipe; 4.4 uses Coolify's backups; 4.1 chooses a migrate step without `psql`.
24. applied: plan-lookup function in §2.4, built in 3.2a; nothing gated.
25. applied: OQ1 reworded.
26. applied: 0.9 covers `docs/REFERENCES.md`.
27. applied (trivial): Node 22 named.
28. applied (trivial): CI triggers stated in 0.8.
29. applied (trivial): 2.4 restores the limiter check.
30. applied (trivial): 3.6 cap resets at 00:00 UTC.
31. applied (trivial): 1.1 checks for the unpacked `src/` folder.
32. applied (trivial): status line updated.

Owner questions Q1 to Q7 left untouched for the owner (OQ1 to OQ4 in the PRD still await answers).

## Round 2 (reviewer, 2026-11-18)

Read: the PRD whole (v2, round 1 applied), round 1, `scripts/verify.sh`,
`db/migrate.sh`, `infra/docker-compose.yml`, the root `package.json`. Facts checked on
the web where marked (sources at the end). Round 1's findings were all applied and are
not repeated. Round 1's Q2 to Q7 are still open; Q1 is re-asked wider below.

### Must

1. `[must]` **The API's path prefix and base URLs are not decided, and the contract
   depends on them from 0.4.** §2.6 routes `/api/*` on the deploy to the API, but does
   not say whether the proxy strips the prefix. Locally the API is on its own port with
   no prefix. Better Auth's default base path is `/api/auth`. So every path in
   `contracts/openapi.json`, the generated client's base URL, Better Auth's base URL
   and the Google redirect URI differ between local and deploy unless one rule is
   stated, and 0.4, 0.6, 2.3a, 2.5 and 4.3 would each guess. Changing it later changes
   every path in the contract. Fix, in §2.6 and §3.3: the API serves everything under
   `/api` in every environment (Nest global prefix; Better Auth at `/api/auth`; the
   proxy never strips). Locally the web dev server proxies `/api` to the API port, so
   the browser sees one origin locally too and the client's base URL is always `/api`.
   Server-side code in the web app (the before-load session check) reaches the API
   through a separate internal URL env var. The CORS allowlist stays as a default but
   is empty in v1. 0.4 sets the prefix; 0.6 adds the dev proxy.

### Should

2. `[should]` **`db/migrate.sh` needs `psql` on the host, and three tasks lean on it.**
   0.4's precondition is "`db/migrate.sh` applies"; a Windows machine with only Docker
   Desktop has no `psql`. §6's "migrated once" test database and CI need a runner too,
   and 4.1 is told to choose a second one for the deploy. Fix: choose once, in 0.4: a
   small Node migrate script with the same behaviour (ordered files, the
   `schema_migrations` table, one transaction per file), used by local dev, the test
   setup, CI and the deploy. Delete `db/migrate.sh` in 0.4 and drop the choice from 4.1.

3. `[should]` **The agent guide is wrong from 0.1 until 0.9.** `AGENTS.md` tells every
   session to use `just`, Hono and Biome. After 0.1 `just` is gone; after 0.4 Hono is
   gone; cards 0.2 to 0.8 read a guide that names commands that no longer exist. Fix:
   one line in §7: a card that removes or renames something the agent guide names
   fixes those lines in the same task. 0.9 becomes the sweep (recipes, ADRs,
   `docs/REFERENCES.md`), not the first correction.

4. `[should]` **0.7's "Compose stack" has only Postgres in it.** Dockerfiles arrive in
   4.1, so there are no app containers to test against in Phase 0. Fix: 0.7 says the
   smoke script starts Compose Postgres, migrates, starts the API and web app with
   `pnpm`, runs Playwright and stops them. 0.8 runs the same script. In 4.1 the
   production-like run mounts the console email folder as a volume so the smoke test
   can read the verification link from the API container.

5. `[should]` **API tests share one database but nothing says they run one at a time.**
   §6 truncates tables between tests. Vitest runs test files in parallel by default,
   so two files truncate under each other. Fix in §6: API test files run serially (file
   parallelism off for the API project). Core and web tests stay parallel.

6. `[should]` **§6 does not say which adapters tests use, so CI may need provider
   accounts.** 3.2a "API tests for checkout", 3.4 "delete an oversize object after
   upload" and 3.6 "an API test proves the cap" each touch a provider. CI has only a
   Postgres service. Fix in §6: verify and CI use the `console` email adapter and
   in-memory fakes for payments, storage and AI, so they need no keys and no S3
   container. The real Stripe, S3 and AI adapters are proven by the runtime criteria
   (3.3, 3.4, 3.5). The local S3 container is needed for dev and for 3.4's runtime
   check only.

7. `[should]` **3.1's "a job running twice sends once" needs a mechanism the card
   would invent.** Fix in §2.4: `sendEmail` takes an idempotency key (the job id); the
   `resend` adapter passes it as Resend's `Idempotency-Key` header (supported, 24-hour
   window, checked below); the `console` adapter names the saved file by the key, so a
   second run overwrites. No sent-emails table.

8. `[should]` **`sendEmail`'s shape crosses the core boundary and is not stated.**
   Core may not import React (§4), and templates are React Email components in
   `packages/ts/email`. Fix in §2.4: core calls `sendEmail` with a template name and
   typed data; the adapter in the API renders the template. Core never imports the
   email package.

9. `[should]` **Auth rate limits (2.3b) need three facts the card would have to
   find.** Better Auth's limiter stores in memory by default; §2.2 locks counters in
   Postgres, so it must be set to database storage, and its `rateLimit` table is one
   more hand-written migration (§2.2 "Tables from libraries"). It limits by IP, so the
   trusted-header setting from §2.3 is needed in 2.3b, not first in 2.4. And sources
   disagree on whether the limiter is on outside production, so 2.3b enables it
   explicitly and its tests do not depend on the default. Add these to the 2.3b card.

10. `[should]` **Which org is active on a new session is not stated.** §3.2 puts the
    active org on the session; Better Auth leaves it empty at sign-in unless a hook
    sets it. 2.6 and every org-scoped controller need a rule. Fix in §3.2: a new
    session starts in the user's personal org; v1 does not remember the last org used.
    A request with no active org gets a coded error, not a guess.

11. `[should]` **The org logo has no screen to live on.** §1 item 5 uploads "an org
    logo in settings"; §2.3 lists org admin routes as members, invites, roles and
    billing; no task builds an org settings page. Fix: 2.6 adds an org general page
    (rename the org), limited to owner and admin; 3.4 adds the logo to it. Add
    "general" to the §2.3 org admin row.

12. `[should]` **Web forms have no stated validation source.** §3.1 makes core's zod
    schemas the single source; §4 forbids apps importing core. Fix in §3.1 (web
    feature row): forms validate with zod schemas generated into the TS client by Hey
    API's zod plugin (it exists; check the current docs in 0.6), or rely on the API's
    coded errors. Never a hand-copied schema.

13. `[should]` **3.3's runtime proof is a hosted Stripe page and a live webhook
    forward.** A test-card checkout and a portal round trip run on Stripe's pages with
    the Stripe CLI forwarding; that is the owner's hands, like Google sign-in in 2.5.
    Fix: 3.3's done is API tests for the billing endpoints and role limits, plus the
    owner's sign-off that checkout, the interval switch and cancel update the page.

14. `[should]` **Uploads are the one open-signup harm §2.3 does not cap.** Any
    signed-up user can put unlimited 2 MB objects in a public bucket on the owner's
    account. Fix in §2.4: one fixed object key per user avatar and per org logo, so a
    new upload replaces the old one and storage is bounded by accounts; the saved URL
    carries a version query so caches refresh. Add uploads to the abuse risk row in §9.

15. `[should]` **The Phase 4 branch cannot reach the reference deploy under §2.1's git
    flow.** One PR per phase merges at the gate, but 4.3 and 4.7 must run against the
    live deploy before 4.G. Fix in 4.3: Coolify deploys the Phase 4 branch until the
    gate; at 4.G the owner switches it to `main`, and v1.0 is tagged on `main` after
    the merge (move the tag from 4.7 to 4.G). Add to 4.3's precondition: Coolify has
    read access to the private GitHub repo.

16. `[should]` **4.4 assumes Coolify can back up this Postgres.** Coolify's scheduled
    backups cover standalone database resources and databases inside its Services; a
    database inside a git-deployed Compose application is not confirmed (below). Fix
    in 4.3: Postgres is created as a Coolify database resource, not as part of the
    app's Compose file.

17. `[should]` **4.7's deploy-mode smoke test needs things no card provides.** Fix:
    add to 4.7's precondition that the owner creates and verifies the test account on
    the deploy and puts its credentials and the deploy's base URL in the local env; the
    smoke test runs from the owner's machine or the builder's session, not CI. Also
    align 4.7 with §1: the owner signs off the items a test does not prove (1 to 6,
    10); 7 to 9 are proven by green tests.

18. `[should]` **Sentry's TanStack Start SDK is alpha.** Sentry's docs mark
    `@sentry/tanstackstart-react` as alpha with possible breaking changes. Fix: add a
    §9 risk checked in 4.5: if it does not work with the installed TanStack Start,
    use `@sentry/react` in the browser and `@sentry/node` on the server, and log why.

19. `[should]` **Two smaller gaps in Phase 2 cards.** 2.2's runtime send needs a
    Resend API key and a from address in the local env, not only the verified
    subdomain; add both to its precondition. 2.3a should say the notes endpoints
    require a session from here on, since the smoke test now signs in first.

### Minor

20. `[minor]` 3.0 is listed after 3.1. Put it first.
21. `[minor]` Stale card numbers after the round 1 splits: §3.5 (2.3), §5 (2.3), §9
    risks (2.3), OQ1 (2.3), OQ4 (2.8). Use 2.3a, 2.3b, 2.8b.
22. `[minor]` OQ3 still says "4 auth layouts"; §3.4 now says three.
23. `[minor]` §2.1 forbids domains "not even as examples"; §4 forbids "a real domain".
    Tests need addresses. Say reserved names (`example.com`, `localhost`) are allowed.
24. `[minor]` §9 lists OQ1 to OQ4 only. Add round 1's Q2, Q6 and Q7 and this round's
    questions so the PRD holds every open question in one place.

### Owner

`[owner]` ❓ Q1 - Better Auth's client, wider (replaces round 1 Q1; needed by 2.3a, 2.6,
2.8a, 2.8b): the web app calls Better Auth's own client for everything Better Auth
owns: sign-in and sessions, and also organizations, invites, members, roles and
switching the active org? Those routes stay outside the contract and outside core.
➡️ Yes. The organization plugin already ships these endpoints with role checks;
wrapping them in core functions and controllers rebuilds the plugin for no v1 gain.

`[owner]` ❓ Q8 - Invite emails (needed by 2.8a): invites get their own caps, by env:
at most 3 per recipient address per hour, and at most 20 per org per day, with a 429
and code `rate_limited` when the org cap is hit?
➡️ Yes. With open signup anyone can create an org and mail strangers from the sending
subdomain, which is the harm the auth email caps exist to stop.

`[owner]` ❓ Q9 - Changing email (needed by 2.9): v1 settings show the email read-only,
and 2.9 covers name and password change only?
➡️ Yes. Changing email adds a second verification flow, a template and a cap, and no
item in the v1 done list needs it.

### Sources

- Better Auth rate limit storage: https://better-auth.com/docs/concepts/rate-limit.md
- Coolify database backups: https://coolify.io/docs/databases/backups
- Sentry TanStack Start SDK: https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react
- Resend idempotency keys: https://resend.com/docs/dashboard/emails/idempotency-keys
- Hey API zod plugin: https://heyapi.dev/openapi-ts/plugins/zod

must: 1, should: 18, minor: 5, owner: 3

## Round 2 (author, 2026-11-18)

Applied to `docs/PRD.md`. No `[must]` disputed.

1. applied: §2.6 "Origins and paths" row (`/api` prefix everywhere, dev proxy, internal API URL env var, empty CORS allowlist); §3.3; 0.4 sets the prefix; 0.6 adds the dev proxy; 2.3a names `/api/auth`.
2. applied: 0.4 replaces `db/migrate.sh` with a Node migrate script; 4.1 uses it.
3. applied: §7 intro rule that a card fixes the agent-guide lines it breaks; 0.9 stays the sweep.
4. applied: 0.7 and 0.8 reworded around the smoke script; 4.1 mounts the console email folder.
5. applied: §6 API test files run serially.
6. applied: §6 "Adapters in tests" row.
7. applied: §2.4 Email row (idempotency key, Resend header, console file by key); 3.1 done criterion.
8. applied: §2.4 Email row (template name and typed data; adapter renders).
9. applied: 2.3b card (database storage, `rateLimit` migration, explicit enable, trusted-IP header).
10. applied: §3.2 active org row.
11. applied: §2.3 org admin row adds "general"; 2.6 adds the general page; 3.4 adds the logo.
12. applied: §3.1 web feature row (Hey API zod plugin); 0.6 checks its docs.
13. applied: 3.3 done is API tests plus owner sign-off.
14. applied: §2.4 upload row (fixed key, version query); §9 abuse row; 3.4.
15. applied: 4.3 deploys the phase branch until 4.G; 4.G switches to `main` and tags v1.0; read access precondition.
16. applied: 4.3 creates Postgres as a Coolify database resource.
17. applied: 4.7 precondition and sign-off split (1 to 6, 10 signed; 7 to 9 by tests).
18. applied: §9 Sentry risk row; 4.5 fallback.
19. applied: 2.2 precondition (Resend key, from address); 2.3a notes require a session.
20. applied: 3.0 listed before 3.1.
21. applied: stale card numbers updated (§3.5, §5, §9, OQ1, 2.8 to 2.8b in OQ4).
22. applied: OQ3 says three auth layouts.
23. applied: §2.1 allows reserved names (`example.com`, `localhost`).
24. skipped: left for the owner round; the round 2 questions are noted in 2.8a and 2.9 as pending. Q2, Q6 and Q7 are not added to §9.

Notes:
- OQ1 in §9 was reworded to the wider round 2 Q1 (which replaces round 1 Q1). Its recommendation is still unanswered; it awaits the owner.
- Q8 (invite caps) and Q9 (email read-only) are marked pending in 2.8a and 2.9; they are not locked.
- Round 1 Q2 to Q7, round 2 Q1, Q8, Q9 await the owner.

## Round 3 (reviewer, 2026-11-18)

Read: the PRD whole (rounds 1 and 2 applied), rounds 1 and 2, `scripts/verify.sh`,
the root `package.json`, `infra/docker-compose.yml`, the app and service manifests.
Better Auth facts were checked against its docs (sources at the end). Rounds 1 and 2
were all applied and are not repeated. `docs/TASKS.md` does not exist yet, as expected.

### Must

1. `[must]` **4.1's container run has nothing that makes one origin.** §2.6 locks one
   origin everywhere: a Coolify proxy rule on the deploy, the Vite dev proxy locally.
   The production-like Compose run in 4.1 has neither: the web container is a built
   server with no dev proxy and there is no Coolify. The smoke test's browser cannot
   reach `/api`, so 4.1's done criterion cannot be met without inventing a component,
   and the obvious guess (the web server proxies `/api`) changes the locked topology.
   Fix: 4.1's Compose file includes one small reverse-proxy container with the same
   rule as the deploy (`/api/*` to the API, everything else to the web app, no prefix
   stripping); the smoke test targets the proxy. Say in §2.6 that this is the third
   place the rule lives. Also say in 0.7 that the smoke script runs the dev servers
   (so the Vite proxy applies), not a build.

### Should

2. `[should]` **0.4 is too big for one session, and round 2 made it bigger.** It now
   holds: first Compose run, a Node migrate script, the API test harness on real
   Postgres, the Hono to NestJS swap, nestjs-zod, a runner choice, the `/api` prefix,
   ADR 0004, the contract regeneration and a new verify check. Fix: split it. 0.4a:
   Compose Postgres, the Node migrate script (delete `db/migrate.sh`), the API test
   harness, and API tests that create and list notes against the existing Hono API;
   carries the Docker precondition. 0.4b: the NestJS swap with everything else on the
   card; done when the same tests pass (paths updated for `/api`) and the client keeps
   its operations. The tests written before the swap prove the swap.

3. `[should]` **Core tests are told to fake the database, which a card cannot do
   sensibly.** §6 says core functions are unit-tested with "dependencies passed in as
   fakes"; §3.1 lists db as a dependency; principle 3 puts data access in core. Notes
   is pure data access, so 0.3's "notes core tests pass" means mocking Drizzle's query
   chain, and Postgres does not exist until 0.4. Fix in §6: core unit tests cover
   validation, coded errors and logic, with fake adapters and a fake clock; there is no
   fake database. Queries are proven by the API tests on real Postgres. 0.3's done
   becomes: tests for the notes schemas and coded errors pass; the data path is proven
   in 0.4a.

4. `[should]` **The test database is not separate from the dev database.**
   `infra/docker-compose.yml` has one database, `app`. §6 truncates tables between
   tests, so every verify run wipes local dev data, and the smoke test signs up on
   whatever is there. Fix in §6: tests and the smoke script use a second database in
   the same Compose Postgres (name by env), created and migrated by the test setup.
   The smoke test signs up with a unique address per run.

5. `[should]` **Auth rate limits will make the API tests and the smoke test flaky.**
   2.3b enables Better Auth's limiter explicitly. Its sign-in rule is 3 requests per
   10 seconds per IP (docs, below), and every test arrives from one IP. Any test file
   that signs in more than three users fails with 429. Fix in §6 and 2.3b: the limiter
   is on in the tests that prove the limits and off (by env) in the rest of the test
   run and in the local smoke run; the production-like run in 4.1 and the deploy keep
   it on.

6. `[should]` **The IP cap's 429 cannot come from where 2.4 puts it.** 2.4 says the
   caps "sit in core in front of `sendEmail`". Better Auth's docs say not to await the
   send inside its email callbacks (timing attacks), and after 3.1 the send is a queued
   job, so nothing thrown there reaches the response. Fix in 2.4: the per-IP cap is
   checked before the route runs (a Better Auth before-hook or a custom limiter rule on
   the email-sending paths) and returns the 429; the per-address cap is checked where
   the send is requested and suppresses silently. Both counters stay in Postgres.

7. `[should]` **Org creation is uncapped, which undoes two other caps.** Better Auth
   lets any user create unlimited orgs by default (`organizationLimit`, docs below).
   §2.4 says upload storage is "bounded by accounts"; with one logo per org and
   unlimited orgs it is not. Q8's invite cap is per org, so it is unbounded too. Fix
   in §2.3 and 2.6, once Q10 is answered: set `organizationLimit` from an env var. Add
   it to the abuse row in §9.

8. `[should]` **The personal org is not marked and can be deleted.** §2.3 and §3.2
   depend on every user having one, and a new session must find it. Better Auth has no
   notion of a personal org, creates none at signup, leaves the active org null at
   sign-in, and exposes org deletion to any owner (docs, below). Fix in §2.3 and 2.6:
   the organization table gets a `personal` boolean in the hand-written migration,
   declared to Better Auth as an additional field (its docs show a string example;
   2.6 confirms boolean works, else a text flag); a user-create hook makes the org and
   a session-create hook sets it active; `disableOrganizationDeletion` is on in v1
   (round 1 Q5 already recommends no delete screens). 2.6 gets an API test: a new user
   has exactly one personal org and a new session is active in it.

9. `[should]` **Human preconditions sit on cards whose done criteria do not need
   them, so the unattended loop blocks early.** 3.2a waits for Stripe keys and prices,
   3.2b for the Stripe CLI, but §6 says their tests run on fakes and signed fixtures.
   Fix: move both preconditions to 3.3, the first card with a real Stripe sign-off.
   Same shape in 2.2: keep the card unblocked by making the real `resend` send an owner
   sign-off line, not a precondition for starting.

10. `[should]` **Phase 4 gives the agent work only the owner can do.** 4.3 ("the live
    reference deploy") and 4.4 ("configure Coolify's scheduled backups") happen in
    Coolify's UI, which the builder cannot reach. "A backup file appears in R2" and
    "the API logs the real client IP" cannot be checked by the builder either. Fix:
    in 4.3 and 4.4 the card writes the recipe and any repo-side config; the owner
    performs the steps and signs off. The builder's own done checks are the ones it
    can run: the public URLs answer over HTTPS (4.3), the restore recipe exists and
    names every command (4.4). The client-IP log line and the backup file become
    sign-off lines.

11. `[should]` **4.3 does not say whether Cloudflare proxies the subdomain, and the
    trusted header depends on it.** Proxied: the client IP is in `CF-Connecting-IP`,
    SSL is terminated twice, and the origin must refuse non-Cloudflare traffic or the
    header can be forged. DNS only: Coolify's proxy issues the certificate and sets
    `X-Forwarded-For`. Fix in §2.6 and 4.3: DNS only for the app subdomain in v1, the
    trusted header is the one Coolify's proxy sets, and SSE needs no buffering
    exception. Proxying is a per-project choice later.

12. `[should]` **`sendEmail`'s idempotency key is "the job id", but there are no jobs
    until 3.1.** 2.2, 2.3a, 2.3b and 2.8a all send before then. Fix in §2.4: the caller
    always passes a key; before 3.1 it is a fresh UUID per send, from 3.1 on the job id.

13. `[should]` **Where the plan config lives decides whether 3.3 breaks a layout
    rule.** §2.4 puts plans "in a typed config file"; core's plan lookup needs it and
    the billing page shows it, but apps may not import core (§4). Fix in §2.4: the plan
    config lives in core and includes the display amount and currency; the billing page
    reads plans from a billing endpoint through the generated client. Stripe price IDs
    stay in env.

14. `[should]` **Nothing says where the Stripe customer id is kept.** 3.2a, 3.2b and
    3.3 (portal) all need it, and the org table belongs to Better Auth. Fix in §2.4:
    one customer per org, stored in a product table of ours keyed by org id (not a
    column added to Better Auth's organization table), created on first checkout.

15. `[should]` **How core touches Better Auth's data is not stated.** Core must check
    membership (§3.2) and save the avatar and logo URLs (3.4), which are columns on
    Better Auth's user and organization tables; the Better Auth instance lives in the
    API. Fix in §3.1 or §3.3: core reads and writes those tables through the Drizzle
    mirror where it must (membership, avatar URL, logo URL) and never imports Better
    Auth; add `better-auth` to the verify check's forbidden core imports.

16. `[should]` **The app-side import rule has no check.** §4's first rule (apps import
    only UI, the generated client and config) is the kit's main seam, and §5 lists
    checks for core and controllers but not for apps. Fix: add to §5 and 0.6 a verify
    check that the web app imports no core, db or service code.

17. `[should]` **0.7's smoke script is machinery Playwright already has.** Its
    `webServer` setting starts the API and web app, waits for them and stops them, on
    Windows and Linux alike. Fix: 0.7 uses `webServer` for both servers; the only
    pre-step is the migrate script. No start-and-stop shell script, which also keeps
    §2.1's "one `pnpm` command per task" true.

18. `[should]` **2.8a does not say what an invitee without an account does.** §1 item
    3 needs "the invitee joins". Fix in 2.8a: the invite link leads to sign in or sign
    up with the invited address, the normal email verification applies, then the
    invite is accepted; the API test covers an existing user and a new one.

19. `[should]` **3.5 has no automated check.** Its only done criterion is a runtime
    stream with a real key. Fix: add an API test with the fake AI adapter: the endpoint
    refuses a request with no session and streams the fake's reply as SSE.

### Minor

20. `[minor]` §2.2 says the docs UI is at `/docs`; §2.6 says everything is under
    `/api`. Say `/api/docs` and `/api/openapi.json` in §2.2 and 0.4.
21. `[minor]` 2.7 adds a required org id to the existing notes table. Say the
    migration deletes existing notes rows (no deploy exists yet).
22. `[minor]` 3.4: with one fixed key, deleting an oversize object also removes the
    previous image. Say the saved URL is cleared in that case.
23. `[minor]` 4.3's precondition: the Google OAuth client lists the deploy's redirect
    URI, and the Better Auth secret and public base URL are in the production env.
24. `[minor]` §6 says payments use an in-memory fake in tests, and also that webhook
    tests use signed fixtures. Say the webhook tests run the real adapter's signature
    check offline with a test secret.
25. `[minor]` §2.6 Errors: say Sentry is off when no DSN is set (local, CI).
26. `[minor]` OQ3 still plans to pick the auth layout from the 1.3 preview page, which
    round 1 Q4 showed cannot work. Reword OQ3 to round 1 Q4.
27. `[minor]` §9 still holds only OQ1 to OQ4 (round 2 finding 24 was skipped). `/tasks`
    reads the PRD, not this log, and Q2 (3.5), Q6 (0.6, 4.6) and Q7 (4.2) are named on
    no card. Copy every open question into §9.

### Owner

Still open from earlier rounds, not re-asked: round 1 Q2 (AI chat transport), Q3 (icon
set), Q4 (shell and auth layout), Q5 (roles), Q6 (notes page), Q7 (VPS latency);
round 2 Q1 (Better Auth client, wider), Q8 (invite caps), Q9 (email read-only).

`[owner]` ❓ Q10 - Who can create orgs (needed by 2.6): any signed-in user can create
orgs, up to a per-user limit set by env, default 5?
➡️ Yes. §1 item 3 needs self-serve org creation, and a limit keeps open signup from
multiplying logos and invite quotas without end.

`[owner]` ❓ Q11 - Inviting into a personal org (needed by 2.8a): a personal org is an
ordinary org that happens to be created at signup, so its owner can invite members
into it, and it can be renamed?
➡️ Yes. A special single-member org needs extra rules in invites, members and billing;
treating it as ordinary keeps one code path, which is why the personal org exists.

`[owner]` ❓ Q12 - Google and password accounts with the same email (needed by 2.5):
signing in with Google on an address that already has a password account links the
two into one user, since Google verifies the address?
➡️ Yes. The other choice is an error telling the user to sign in with their password,
which most users read as a broken sign-in.

### Sources

- Better Auth organization plugin (`organizationLimit`, `disableOrganizationDeletion`,
  active org null at sign-in, session-create hook, additional fields):
  https://better-auth.com/docs/plugins/organization
- Better Auth rate limit (off in development by default, sign-in 3 per 10 seconds,
  `customRules`): https://better-auth.com/docs/concepts/rate-limit
- Better Auth email (request passed to callbacks, do not await the send):
  https://better-auth.com/docs/concepts/email

must: 1, should: 18, minor: 8, owner: 3

## Round 3 (author, 2026-11-18)

Applied to `docs/PRD.md`. No `[must]` disputed.

1. applied: §2.6 names the third place for the proxy rule; 4.1 adds the reverse-proxy container and targets it; 0.7 runs dev servers.
2. applied: 0.4 split into 0.4a (Compose Postgres, Node migrate script, API tests on Hono) and 0.4b (NestJS swap); references to 0.4 updated in §3.5, §5, §9.
3. applied: §6 core tests have no fake database; 0.3 done reworded, data path proven in 0.4a.
4. applied: §6 second test database in the same Postgres; unique smoke signup address.
5. applied: §6 and 2.3b limiter on only in the limit tests; 4.1 keeps it on.
6. applied: §2.3 "Where the caps are checked" and 2.4.
7. applied: §2.3 org creation limit row, §2.6, §9 abuse row, 2.6. Value still pending owner Q10.
8. applied: §2.3 personal org row and 2.6 (flag, hooks, deletion disabled, API test). Q11 noted as pending.
9. applied: 3.2a/3.2b preconditions moved to 3.3; 2.2 Resend steps are now an owner sign-off, not a precondition.
10. applied: 4.3 and 4.4 split into builder checks and owner sign-offs.
11. applied: §2.6 Cloudflare proxying row (DNS only, `X-Forwarded-For`); 4.3.
12. applied: §2.4 Email row (UUID before 3.1, job id after).
13. applied: §2.4 Plans row (config in core, billing endpoint); 3.3.
14. applied: §2.4 Stripe customer row; 3.2a.
15. applied: §2.2 "Core and Better Auth's data" row; 0.3 forbids `better-auth` in core.
16. applied: §5 and 0.6 add the web-app import check.
17. applied: 0.7 uses Playwright `webServer`; 0.8 runs the same command.
18. applied: 2.8a invitee flow.
19. applied: 3.5 API test with the fake AI adapter.
20. applied: `/api/docs` and `/api/openapi.json` in §2.2 and 0.4b.
21. applied: 2.7 deletes existing notes rows.
22. applied: 3.4 clears the saved URL on oversize delete.
23. applied: 4.3 precondition adds Google redirect URI, Better Auth secret and base URL.
24. applied: §6 webhook and adapters rows.
25. applied: §2.6 Errors row, Sentry off with no DSN.
26. applied: OQ3 reworded to round 1 Q4.
27. skipped: copying owner questions Q2 to Q12 into §9 would pre-empt the owner round; left until they are answered.

Open owner questions (untouched): round 1 Q2 to Q7, round 2 Q1, Q8, Q9, round 3 Q10 to Q12.

## Round 4 (reviewer, 2026-11-18)

Read: the PRD whole (rounds 1 to 3 applied), round 3, `scripts/verify.sh`,
`scripts/run-tasks.sh`, the root `package.json`, `mise.toml`, `docs/REFERENCES.md`.
Better Auth, Coolify and Traefik facts were checked against their docs and source
(sources at the end). Rounds 1 to 3 are not repeated. Round 3 finding 27 (copy the open
questions into §9) stays skipped by the author and is not re-raised; the questions are
collected in this log.

### Must

1. `[must]` **OQ4 lets the owner delete the org; §2.3 locks deletion off.** §9 OQ4
   says "Owner: everything, including deleting the org and transferring ownership".
   §2.3 (personal org row) sets `disableOrganizationDeletion` on in v1, and round 1 Q5
   recommends no delete, transfer or account-deletion screens. 2.8b's done is "API
   tests for each role's limits", so the card would have to guess which one holds.
   Fix in §9: reword OQ4 to round 1 Q5. Owner: everything v1 offers. V1 offers no org
   deletion (disabled in the API), no ownership transfer and no account deletion.

### Should

2. `[should]` **Browser runtime criteria have no stated method, and 0.6 needs a
   browser before one exists.** §7 says "Runtime" is "proven by running the thing".
   The builder is a headless session; 0.6 asks for "create and list a note in the
   browser" one card before Playwright arrives in 0.7. Later cards (1.3, 1.4, 2.6,
   2.8a, 2.8b, 2.9, 3.4, 3.5) have the same shape. Fix in §7: from 0.7 on, a browser
   runtime criterion is proven by a throwaway Playwright script run against the dev
   servers, not committed, with the steps and result written in the task log. Fix in
   0.6: drop its browser criterion; done is the import check, typecheck and the
   regenerated client in use, and 0.7's smoke test proves the page (the same pattern
   as 0.3 and 0.4a).

3. `[should]` **0.4a's tests only survive the swap if they speak HTTP.** 0.4b is done
   when "the 0.4a API tests pass unchanged apart from the `/api` paths". The natural
   Hono test calls `app.request()`, which does not exist on NestJS. Fix in 0.4a and §6:
   the API test harness starts the app in the test process on a free port and calls
   it with `fetch`; no framework test helper. Starting it in-process also lets later
   tests reach the fake adapters (finding 4).

4. `[should]` **Nothing says how a fake adapter is chosen, or whether the API boots
   without provider keys.** §3.1 says adapters are "selected by env at boot". §6 says
   tests use in-memory fakes for payments, storage and AI. The smoke test in CI boots
   the real dev servers with no keys, and local dev has none until 3.3, 3.4 and 3.5's
   preconditions. 3.2a, 3.4 and 3.5 would each invent an answer. Fix in §2.4 (Adapter
   choice row): every module follows the email pattern. Payments, storage and AI each
   have a `fake` adapter value, the default in local dev, tests and CI; the real one
   is chosen by env in deploys. The "Console in production" boot refusal covers every
   `fake` too. Fix in 0.5: the env schema requires a provider's keys only when that
   provider's adapter is selected, so tests, CI, the smoke run and the spec export
   boot from the committed `.env.example` values alone. Each card that adds an env
   var adds it to `.env.example`.

5. `[should]` **The IP cap's 429 cannot carry a code if it comes from the limiter.**
   §2.3 says the IP cap returns "429 with code `rate_limited`" and allows "a Better
   Auth before-hook or a custom limiter rule". The limiter's 429 body is fixed:
   `{"message": "Too many requests. Please try again later."}`, no `code`, and custom
   rules take only a window and a max (source below). Fix in §2.3 and 2.4: the per-IP
   cap is a before-hook that throws Better Auth's `APIError` with status 429 and code
   `rate_limited`; remove the limiter-rule option. Same for the org invite cap in 2.8a
   once Q8 is answered. 2.3b's own limiter tests assert status 429 and
   `X-Retry-After`, not a code.

6. `[should]` **2.3a is still the largest card in the plan.** It mounts Better Auth
   in NestJS, writes its tables and the Drizzle mirror, wires verification email,
   rebuilds three screens, replaces the session stub, adds the server-side
   before-load check, puts the notes endpoints behind a session, gives the API tests
   a signed-in helper and rewrites the smoke test. Fix: split it. First card: sign
   up, sign in, sign out, the session replaces the 1.5 stub, notes need a session,
   the API tests get a sign-in helper; done when the smoke test signs up, signs in
   and creates a note. Second card: email verification required, the verification
   template and screen; done when the smoke test follows the link from the console
   email before signing in. Update the card numbers that point at 2.3a (§3.5, §9,
   OQ1, 1.5, 2.3b).

7. `[should]` **`organizationLimit` counts memberships, and the personal org is one
   of them.** Better Auth compares the limit with every org the user is a member of,
   including the personal org and orgs joined by invitation, and applies it to
   server-side creation too (source below). With the recommended default of 5, a user
   can create 4 more orgs, and a user invited into 4 orgs can create none. Fix in
   §2.3 (org creation limit row): say the limit counts all memberships including the
   personal org, and that v1 accepts this rather than writing a custom count. 2.6's
   API test covers the limit.

8. `[should]` **Which Better Auth tables each card writes is not stated.** §2.2 says
   "core and organization plugin" tables are hand-written; 2.3a says "its tables as
   SQL migrations"; 2.6 mentions only the `personal` flag. Fix: 2.3a writes the core
   tables (user, session, account, verification). 2.6 writes the organization
   plugin's (organization, member, invitation, the active-org column on session) with
   the `personal` flag. 2.3b writes `rateLimit`.

9. `[should]` **A card that is built but not signed off has no state, so the loop
   stops at the first one.** `scripts/run-tasks.sh` stops whenever any card is
   `blocked`. 2.2's sign-off is "not a precondition for starting", and 2.5, 3.3, 4.3,
   4.4 and 4.5 are done only by a sign-off the builder cannot give. §7 defines the
   state for an unsigned precondition only. Fix in §7: a card whose builder checks
   pass but whose owner sign-off is missing is closed with a line
   `Awaiting sign-off: <what the owner does>`; the phase gate does not pass while any
   card in the phase has that line unsigned. Preconditions keep blocking as they do
   now.

10. `[should]` **The phase branch has no name and no card creates it.** §2.1 locks a
    branch per phase and 0.8's workflow triggers on "phase branches", but nothing
    names the pattern, and the repo is on `main` now. Fix in §2.1 and §7: branches
    are `phase-0` to `phase-4`. The first card of a phase creates the branch from
    `main` if it does not exist. The gate card's precondition: the owner pushes the
    branch, opens the PR, CI is green, the owner merges. 0.8's trigger is `phase-*`
    and pull requests.

11. `[should]` **Migrations on the deploy have no moment to run.** 4.1 says they
    "run the Node migrate script" and 4.3 leaves how to the recipe. Coolify's
    pre-deployment command runs in the old container (old migration files) and is
    skipped on the first deploy; its post-deployment command cannot fail a deploy
    (docs below). Fix in 4.1: the API container's start command runs the migrate
    script, then starts the API. One API instance in v1, so no lock is needed.

12. `[should]` **Coolify strips the path prefix by default.** §2.6 locks "no prefix
    stripping", but a Coolify path route (`https://<subdomain>/api`) forwards
    `/api/users` as `/users` unless "Path prefixes" is set to "Keep paths as-is"
    (docs below). Fix in 4.3: the recipe names that setting for the API resource, and
    says the web app and the API are two Coolify applications from the same repo
    (base directory at the repo root, one Dockerfile location each). The builder's
    HTTPS check requests `/api/openapi.json` through the public URL, which fails if
    the prefix was stripped.

13. `[should]` **`X-Forwarded-For` may not be safe to trust as 4.3 assumes.** §2.6
    says Coolify's proxy sets the header. Traefik's docs imply it appends the peer
    address to a header the client already sent, and Better Auth reads one address
    from the header unless `trustedProxies` is set (docs below; neither states the
    default outright). A client could then forge its IP and step around the per-IP
    cap. Fix in 4.3: the card checks current Traefik and Better Auth docs and sets
    `trustedProxies` if needed, by env. The owner's sign-off adds: a request sent
    with a forged `X-Forwarded-For` still logs the real client IP.

14. `[should]` **A non-production `NODE_ENV` makes the web container not
    production-like.** §2.4 has the production-like run use a non-production
    `NODE_ENV` so the `console` adapter may boot. For the built web server that
    selects React's development build. Fix in §2.4 and 4.1: the non-production
    `NODE_ENV` applies to the API container only; the web container runs with
    `NODE_ENV=production`.

15. `[should]` **§2.4 says the container run happens in CI; no card puts it there.**
    "Production-like container runs in CI" (Console in production row), but 0.8's CI
    runs the dev-server smoke and 4.1 is a local runtime check. Fix: 4.1 adds one CI
    job that builds both images, so a broken Dockerfile fails the PR; the container
    smoke stays one local `pnpm` command. Reword the §2.4 row to "production-like
    container runs".

16. `[should]` **The import checks do not say how they are written.** §5 adds five
    import rules to verify (core, controllers, web app, icons, axios and zustand).
    Fix in §5: an import rule is an oxlint `no-restricted-imports` override for its
    folder, so it runs in `pnpm lint` and in the editor. Verify gets a script only
    for what lint cannot see (dependency counts in a manifest, token purity, the
    org-id check).

### Minor

17. `[minor]` 3.3's sign-off lists checkout, the interval switch and cancel. §1 item
    4 also needs the one-time purchase. Add it.
18. `[minor]` §6 wants an isolation test "for every org-scoped feature". 3.2a's done
    does not name one for purchases. Add it.
19. `[minor]` 3.4 does not say where the avatar control lives. Say the 2.9 profile
    page.
20. `[minor]` The status line says rounds 1 to 3 applied; update it with each round.
21. `[minor]` §7 says a blocked card means "the loop moves on or stops".
    `scripts/run-tasks.sh` stops. Say "stops".
22. `[minor]` 4.3: Coolify's docs warn that every resource sharing a hostname must be
    running, or the root route changes what it serves. One line in the recipe.

### Owner

Still open from earlier rounds, not re-asked: round 1 Q2 (AI chat transport), Q3
(icon set), Q4 (shell and auth layout), Q5 (roles), Q6 (notes page), Q7 (VPS
latency); round 2 Q1 (Better Auth client, wider), Q8 (invite caps), Q9 (email
read-only); round 3 Q10 (org creation limit), Q11 (personal org is ordinary), Q12
(Google and password linking).

Waiting on Q11, not asked yet: what a new session does when the user is no longer a
member of their personal org.

`[owner]` ❓ Q13 - Undo for invites and members (needed by 2.8a, 2.8b): 2.8a includes
cancelling a pending invite, 2.8b includes removing a member, and v1 has no "leave
this org" action?
➡️ Yes. An admin who invites or adds the wrong person needs a way back, and Better
Auth ships both endpoints; leaving is not in the v1 done list and an owner can remove
the member instead.

### Sources

- Better Auth rate limiter response body and custom rules:
  https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/api/rate-limiter/index.ts ,
  https://better-auth.com/docs/concepts/rate-limit
- Better Auth `organizationLimit` check and `APIError` with a code:
  https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/organization/routes/crud-org.ts
- Better Auth hooks: https://better-auth.com/docs/concepts/hooks
- Coolify path routes and "Path prefixes": https://coolify.io/docs/core/networking/domains
- Coolify Dockerfile builds, pre and post deployment commands:
  https://coolify.io/docs/applications/builds/dockerfile
- Traefik forwarded headers:
  https://doc.traefik.io/traefik/reference/install-configuration/entrypoints/

must: 1, should: 15, minor: 6, owner: 1

## Round 4 (author, 2026-11-18)

1. Applied. OQ4 reworded to round 1 Q5: no org deletion, ownership transfer or account deletion in v1.
2. Applied. §7 gives the throwaway Playwright method from 0.7 on; 0.6 drops its browser criterion.
3. Applied. §6 and 0.4a: the harness starts the app in-process on a free port and calls it with `fetch`.
4. Applied. §2.4 Adapter choice: every module has a `fake` value, default outside deploys; the boot refusal covers `fake`. 0.5 carries the env schema rule and `.env.example`.
5. Applied. §2.3 and 2.4: the per-IP cap is a before-hook throwing `APIError` 429 `rate_limited`; limiter-rule option removed. 2.8a org cap the same. 2.3c's limiter tests assert 429 and `X-Retry-After`.
6. Applied. 2.3 split into 2.3a (sign up and in), 2.3b (verification), 2.3c (reset and limits). Card references updated (§3.5, §5, §9).
7. Applied. §2.3 org creation limit row says the limit counts all memberships; 2.6 test covers it.
8. Applied. Table ownership by card in §2.2: 2.3a core, 2.6 organization plugin, 2.3c `rateLimit`.
9. Applied. §7 defines `Awaiting sign-off:` and the gate rule; "moves on or stops" now "stops" (also minor 21).
10. Applied. Branches `phase-0` to `phase-4` in §2.1 and §7; 0.8 triggers on `phase-*`; gate precondition stated.
11. Applied. 4.1: the API container's start command runs the migrate script, then the API.
12. Applied. 4.3: two Coolify applications, "Keep paths as-is", HTTPS check on `/api/openapi.json` (also minor 22).
13. Applied. 4.3: check Traefik and Better Auth docs, set `trustedProxies` by env if needed; sign-off adds the forged-header check.
14. Applied. §2.4 and 4.1: non-production `NODE_ENV` on the API container only.
15. Applied. 4.1 adds a CI job that builds both images; §2.4 row reworded.
16. Applied. §5: import rules are oxlint `no-restricted-imports` overrides; verify scripts only for what lint cannot see.
17. Applied. 3.3 sign-off lists the one-time purchase.
18. Applied. 3.2a done names the purchases isolation test.
19. Applied. 3.4 puts the avatar control on the 2.9 profile page.
20. Applied. Status line says rounds 1 to 4.
21. Applied with 9.
22. Applied with 12.

Owner Q13: untouched.

## Owner answers (2026-11-18)

Applied to `docs/PRD.md` by hand. Settled; do not re-ask.

- Q1 (wider, round 2) Better Auth's client for everything Better Auth owns: yes.
- Q2 AI SDK chat hook as the second client exception, limited to `/demo/*`: yes.
- Q3 Tabler only: yes.
- Q4 Default shell and auth layout: **no**. The stacked-side shell and the `side` auth
  layout, the UI kit's theme config defaults and the owner's chosen look. Collapsible
  only if a project wants it.
- Q5 Roles: yes, plus: an org always has exactly one owner. Admins cannot remove or
  demote the owner, and the owner cannot remove themselves. Enforced in the API, with
  a test.
- Q6 to Q13: yes.
- Q14 (from the owner check) Google sign-in and settings move to Phase 3: yes. Phase 2
  is now 2.1 to 2.7b (10 cards), Phase 3 is 3.0 to 3.8 (10 cards). Old 2.6 to 2.8b
  became 2.5 to 2.7b; old 2.9 became 3.4; old 3.4 to 3.6 became 3.5 to 3.7; old 2.5
  became 3.8. Card numbers in earlier rounds use the old numbering.

## Round 5 (reviewer, 2026-11-18)

Read: the PRD whole (rounds 1 to 4 and the owner answers applied), round 4 and the
owner answers, `scripts/run-tasks.sh`, `scripts/verify.sh`, `mise.toml`,
`docs/REFERENCES.md`, the git remote. Better Auth facts were checked against its
source and docs (sources at the end). Rounds 1 to 4 are not repeated. Card numbers
are the current ones (after Q14's renumbering). The hand renumbering was checked
across §2 to §9: no stale card number found.

### Must

1. `[must]` **4.2 and 4.3 wait for the owner to follow a recipe the card has not
   written yet.** §7: a card whose precondition is unsigned is set `blocked` and the
   loop stops. 4.2's precondition is "the owner runs it from Nairobi and picks", and
   "it" is the recipe 4.2 writes. 4.3's precondition is the finished deploy (env set,
   Stripe webhook registered, R2 CORS, Google redirect URI), which are the steps of
   the recipe 4.3 writes; its done ("the public URLs answer over HTTPS") cannot be
   checked in the session that writes the recipe. Fix in 4.2: no precondition. Done:
   the recipe exists with one test endpoint per candidate and an empty results table.
   Owner sign-off: the measurements and the choice are logged. Fix in 4.3: the
   precondition shrinks to what must exist before a recipe can be written against it
   (none, or the 4.2 choice signed). Done: the recipe names every Coolify setting and
   every env var, and the repo-side config is committed. Everything now listed under
   "Precondition (human)" moves into the recipe as its steps and into the owner
   sign-off, together with the HTTPS check on `/api/openapi.json` and the two
   client-IP checks. 4.7 already requires the live deploy, so nothing downstream
   changes.

2. `[must]` **§2.3 says Google links to any password account; Better Auth refuses
   when that account is unverified, and the refusal is what stops an account
   takeover.** §2.3 (Login methods): "Google sign-in on an address that already has a
   password account links to that user". 2.3b makes verification required, so
   unverified password accounts exist. Better Auth's `handleOAuthUserInfo` refuses
   the link when the local user's `emailVerified` is false
   (`requireLocalEmailVerified`, default true, also with `trustedProviders`), and
   returns `account_not_linked`. Switching that off to match the PRD row lets anyone
   who signed up with a stranger's address keep a working password on the account
   after the real owner signs in with Google: the link sets `emailVerified` true and
   leaves the credential account in place. Fix in §2.3 and 3.8: linking applies to a
   verified password account only. On an unverified one the Better Auth default
   stays, sign-in fails with `account_not_linked`, and the sign-in screen shows a
   message for that code. 3.8 must not set `requireLocalEmailVerified: false`. Q16
   confirms the wording with the owner.

### Should

3. `[should]` **An owner can invite a second owner, and 2.7a ships before the
   one-owner test.** §2.3 locks "no one can be made owner in v1". Better Auth lets a
   member with the creator role invite with role `owner`, and lets an owner set
   another member's role to `owner`; neither path counts owners. 2.7b tests the role
   change; 2.7a does not mention roles on an invite. Fix in 2.7a: an invite accepts
   only `admin` and `member` (a `beforeCreateInvitation` organization hook), with an
   API test. Fix in 2.7b: name the hook (`beforeUpdateMemberRole`) so the rule is not
   rebuilt as a controller.

4. `[should]` **A removed member keeps the removed org as the active org.** Better
   Auth's `removeMember` clears `activeOrganizationId` only on the caller's own
   session. §3.2 says a request "with no active org gets a coded error" and core
   checks membership, but nothing says what the removed user's browser does next.
   Fix in 2.7b: an API test that a removed member's next request gets the coded
   not-a-member error; on that code the web app sets the personal org active and
   reloads. One line in §3.2.

5. `[should]` **Nothing says where the web app gets the org role for authority
   checks.** §3.4 changes "admin and user roles" to org roles, and access is
   "declared per route by authority". The Better Auth session carries the active org
   id, not the member's role. 2.5 has the first role-limited page (org general,
   owner and admin). Fix in 2.5 (2.5b after finding 6): the before-load step loads
   the active member's role with the session through Better Auth's client, and a
   route's authority is a list of org roles. Between 2.3a and 2.5 the only authority
   is "signed in".

6. `[should]` **2.5 is now the largest card.** It writes four tables and the mirror,
   the `personal` field, two hooks, two limits, the create-org screen, the switcher,
   the general page and (finding 5) the role source. Fix: split it. 2.5a Personal
   org: the organization plugin's tables, the `personal` flag, both hooks,
   `disableOrganizationDeletion`; done: the API test that a new user has exactly one
   personal org and a new session is active in it. 2.5b Create and switch:
   `organizationLimit`, create an org, the switcher, the general page with the role
   limit; done: the limit API test and the runtime criterion. Update §2.2 (tables
   in 2.5a), §9 and 3.5 (the logo goes on the 2.5b page).

7. `[should]` **The per-recipient invite cap has no stated response.** §2.3 gives
   the org cap a 429 with `rate_limited` and says nothing for "3 per recipient
   address per hour". 2.7a would guess between a 429 and the silent success the
   auth address cap uses. Fix in §2.3 and 2.7a: both invite caps return 429 with
   code `rate_limited` from the same before-hook; the inviter is a signed-in admin
   of the org, so there is no account to hide.

8. `[should]` **The first card of a phase branches from a stale `main`.** §2.1: the
   branch is created "from `main`". The gate's merge happens on GitHub (the owner
   merges the PR), so the local `main` still lacks the whole previous phase, and a
   squash merge makes the two diverge. Fix in §2.1 and §7: the first card runs
   `git fetch origin` and creates the branch from `origin/main`; it sets the card
   `blocked` if the previous phase's gate card is not signed.

9. `[should]` **4.4 can put database backups in the public bucket.** 4.3's
   precondition gives the R2 bucket "public read on its own subdomain"; 4.4's is
   "an R2 bucket and keys". Reusing the first one makes every backup file readable
   by URL. Fix in 4.4: a second, private bucket with its own keys, never the uploads
   bucket; the restore recipe says so.

10. `[should]` **The AI module does not fit the adapter shape, and 3.6 would guess
    how.** §2.4 and §3.1: the interface lives in core, core imports no framework, the
    adapter holds only provider calls, and there is a `fake`. The page uses the AI
    SDK's chat hook, which expects the AI SDK's own stream protocol. An interface in
    core that returns text chunks makes the controller re-encode that protocol by
    hand. Fix in §2.4 (AI row) and 3.6: the AI adapter is a function in the API that
    returns an AI SDK language model, chosen by env; the `fake` is the AI SDK's mock
    model from `ai/test` (3.6 confirms the export name in current docs); the
    controller calls `streamText` and pipes the SDK's stream response. Core holds no
    AI interface, only the daily-cap function from 3.7. Add this as the stated
    exception in the §2.4 Adapters row. The SSE endpoint is left out of the OpenAPI
    spec, since no generated client calls it.

11. `[should]` **Checkout and webhooks leave three cases to guess.** (a) An org that
    already has an active Pro subscription can start a second Pro checkout and end
    with two subscriptions. Fix in 3.2a: the checkout endpoint refuses with a coded
    error; the page sends that org to the portal. (b) The role limit on checkout is
    only tested in 3.3, one card after the endpoint ships. Fix: 3.2a's API tests
    include owner and admin allowed, member refused. (c) Stripe redelivers events
    and §3.1 says jobs are idempotent, but 3.2b's done has no test for it. Fix: add
    "the same event delivered twice changes nothing".

12. `[should]` **Settings screens now come after the no-axios check.** Q14 moved
    settings to 3.4; the verify check "no axios or zustand in the web app" lands in
    2.3c. If 1.2 or 1.5 copies the settings screens in with the mock API, 2.3c
    cannot pass without rebuilding them. Fix in 1.2: a screen enters the web app
    only in the card that rebuilds it (auth screens in 2.3a to 2.3c, settings in
    3.4, billing in 3.3); 1.2 moves tokens, components and design rules only.

### Minor

13. `[minor]` §2.3 (Org admin) lists a "roles" route. No card builds one and §3.5
    does not move the roles and permissions screen. Role changes live on the
    members screen (2.7b); drop "roles" from the row.
14. `[minor]` 3.4 has no `Ref:` though 2.1 vets the supastarter settings paths. Add
    `Ref: supastarter`.
15. `[minor]` Read lists: 2.5 writes migrations and cites §3.3, so add §2.2 and
    §3.3; 2.3c writes the `rateLimit` migration, so add §2.2.
16. `[minor]` §6 (Adapters in tests) says the webhook exception is "above"; the
    Webhooks row is below it.
17. `[minor]` §9 abuse row: add the invite caps and 2.7a.
18. `[minor]` `references/ui-kit/` holds the zip, `theme.css` and two docs, no
    `src/` yet. 1.1's precondition and its check already cover it. No PRD change.

### Owner

Closed without a question: round 4's waiting item (a new session when the user is no
longer a member of their personal org). It cannot happen. The user owns the personal
org, the one-owner rule forbids removing or demoting the owner, org deletion is off,
and Better Auth refuses `leave` for the only owner.

`[owner]` ❓ Q15 - One-time product (needed by 3.2a): an org can buy the one-time
product more than once, each purchase its own row on the billing page?
➡️ Yes. It is the simplest rule, it needs no "already bought" check, and a project
that sells a single lifetime licence adds that check itself.

`[owner]` ❓ Q16 - Google sign-in on an unverified password account (needed by 3.8;
narrows Q12): linking happens only when the password account's email is verified;
on an unverified one Google sign-in is refused with a message to verify the address
or reset the password first?
➡️ Yes. It is Better Auth's default, and the alternative lets someone who signed up
with another person's address keep a working password on that person's account.

### Sources

- Better Auth OAuth linking conditions (`requireLocalEmailVerified`, `emailVerified`
  set on link):
  https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/oauth2/link-account.ts ,
  https://better-auth.com/docs/concepts/users-accounts
- Better Auth invite role check, accept sets the active org:
  https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/organization/routes/crud-invites.ts
- Better Auth role update, leave and remove member:
  https://github.com/better-auth/better-auth/blob/main/packages/better-auth/src/plugins/organization/routes/crud-members.ts
- Better Auth organization hooks: https://better-auth.com/docs/plugins/organization

must: 2, should: 10, minor: 6, owner: 2

## Round 5 (author, 2026-11-18)

1. applied: 4.2 has no precondition; the recipe is the done, the measurements and choice are the owner sign-off. 4.3's human precondition moved into the recipe's owner steps and sign-off (HTTPS on `/api/openapi.json` and the client-IP checks included); precondition is none or the 4.2 choice.
2. applied: §2.3 Login methods links only a verified password account; unverified keeps `account_not_linked` with a screen message; 3.8 must not set `requireLocalEmailVerified: false`. Owner Q16 still open, applied as recommended because the finding is a `[must]`.
3. applied: 2.7a restricts invites to `admin` and `member` via `beforeCreateInvitation`; 2.7b names the organization hooks.
4. applied: 2.7b API test for the removed member's coded error; one line added to §3.2.
5. applied: 2.5b loads the active member's role with the session; authority is a list of org roles.
6. applied: 2.5 split into 2.5a (Personal org) and 2.5b (Create and switch); §2.2, §3.5 reference (3.5 now names 2.5b) and §9 updated.
7. applied: both invite caps return 429 `rate_limited` from one before-hook (§2.3, 2.7a).
8. applied: §2.1 and §7 branch from `origin/main` after `git fetch origin`, and block if the prior gate is unsigned.
9. applied: 4.4 uses a second, private bucket.
10. applied: §2.4 Adapters row and AI row, and 3.6, use an AI SDK language-model function, the SDK mock as `fake`, `streamText`, and the SSE endpoint left out of the spec.
11. applied: 3.2a refuses a second active Pro subscription and tests the role limits; 3.2b tests duplicate event delivery. Owner Q15 (one-time product) left open and untouched.
12. applied: 1.2 moves tokens, components and design rules only; screens enter in the card that rebuilds them.
13. applied: "roles" dropped from the Org admin row (members includes role changes).
14. applied: 3.4 has `Ref: supastarter`.
15. applied: Read lists extended for 2.3c and the 2.5a split.
16. applied: §6 now points to the Webhooks row below.
17. applied: §9 abuse row adds invite caps, 2.5b and 2.7a.
18. skipped: no PRD change required, as the reviewer said.

## Owner answers to round 5 (2026-11-18)

Applied to `docs/PRD.md` by hand. Settled; do not re-ask.

- Q15 One-time product can be bought more than once, each purchase its own row: yes.
  In §2.4 Plans, 3.2a (no already-bought check, tested) and 3.3.
- Q16 Google links only onto a verified password account; otherwise `account_not_linked`
  with a message to verify or reset first: yes. Already applied by the round 5 author.

## Round 6 (reviewer, 2026-11-18)

Read: the PRD whole (rounds 1 to 5 and the owner answers applied), round 5 and its
owner answers, `scripts/run-tasks.sh`, `scripts/verify.sh`, the `/task` and `/tasks`
commands, the gate card template, `.claude/hooks/block-dangerous-git.sh`, and
`git status` against `origin`. Rounds 1 to 5 are not repeated. The product design
held up on this read: the three musts are all about the order of owner steps and
branches in the loop, not about what gets built.

### Must

1. `[must]` **The gate card does its work after the merge, so none of it reaches
   `main`, and the next phase can never see a signed gate.** §7: "A gate card's
   precondition: the owner pushes the branch, opens the PR, CI is green, the owner
   merges." `/task` blocks on a precondition until its dated sign-off exists, so the
   gate card runs after the PR is merged. The gate template then commits to the phase
   branch: a line in `docs/STANDARDS.md`, new cards for the next phase, its own log
   and `done` status. The owner's sign-off lines (the gate's, and every
   `Awaiting sign-off` in the phase) are also edits to `docs/TASKS.md`. Anything
   committed after the merge is on a merged branch. §2.1 has the next phase's first
   card branch from `origin/main`, where the gate card is still `todo` and unsigned:
   the card blocks itself, or the loop runs the gate again. Fix in §2.1 and §7: a
   gate card has no precondition. It runs its steps and closes with
   `Awaiting sign-off: the owner pushes the branch, opens the PR, CI is green`. The
   owner adds the dated sign-off lines (the gate and every `Awaiting sign-off` in the
   phase) as the last commit on the phase branch, pushes, then merges. The first card
   of the next phase reads the gate's sign-off from `docs/TASKS.md` on `origin/main`
   after `git fetch origin`, before it creates its branch. 4.G: switching Coolify to
   `main` and tagging v1.0 stay after the merge and need no sign-off.

2. `[must]` **0.8 waits for a green CI run of a workflow it has not written.** 0.8:
   "Precondition (human): the owner pushes the phase branch and signs off that CI ran
   green." The card blocks until that line exists, and no workflow file exists until
   the card runs; the builder cannot push (the git hook blocks it). Same shape as
   round 5 finding 1. Fix in 0.8: no precondition. Done: the workflow file runs the
   verify steps and the 0.7 smoke command with a Postgres service, on pushes to
   `phase-*` and on PRs. Owner sign-off (the §7 `Awaiting sign-off` line): the owner
   pushed `phase-0` and the run was green.

3. `[must]` **`origin/main` does not have the plan, and 0.1 branches from it.** Local
   `main` is 20 commits ahead of `origin/main`; the remote has an older PRD, no
   `docs/PRD_REVIEW.md` and no `docs/TASKS.md`. §2.1: the first card of a phase
   creates its branch from `origin/main`. 0.1 would start on a tree without its own
   card. Fix in 0.1: add to its Precondition (human) that the owner has pushed `main`
   with the PRD and `docs/TASKS.md`. Fix in §2.1 and §7: the first card of a phase
   sets itself `blocked` when local `main` has commits `origin/main` lacks.

### Should

4. `[should]` **3.2a is done by purchase rows that only 3.2b writes.** 3.2a's done
   includes "a second one-time purchase by the same org succeeding as its own row"
   and "the already-subscribed refusal". A checkout endpoint returns a Stripe URL; the
   purchase or subscription row appears when the webhook arrives, and webhooks are
   3.2b. The builder must either pull the webhook handler into 3.2a or write rows
   from the checkout endpoint. Fix in 3.2a: the card ships the core function that
   records a completed purchase or a subscription change, with unit tests; the API
   tests seed rows through it. Done becomes: a second one-time checkout by the same
   org is not refused, and a Pro checkout is refused when a seeded active subscription
   exists. Fix in 3.2b: name the events (`checkout.session.completed`,
   `customer.subscription.updated`, `customer.subscription.deleted`; confirm in
   current Stripe docs) and move "two completed one-time checkouts make two rows"
   into its done.

5. `[should]` **The decorator-metadata problem 0.4b names for the dev runner also
   applies to the test process.** §6 starts the NestJS app inside the Vitest process.
   0.4b says `tsx` does not emit decorator metadata and tells the card to pick a
   runner that does, but says nothing about Vitest, whose transformer is not `tsc`
   either. Without metadata Nest injects `undefined`, and "the 0.4a API tests pass
   unchanged" fails for a reason the card does not mention. Not checked against
   current Vitest docs this round; the card must. Fix in 0.4b: the choice covers
   both. Check current Vitest docs for whether its transformer emits decorator
   metadata from the tsconfig; if not, use `unplugin-swc` in the API test project or
   explicit `@Inject()` tokens on every constructor parameter. One choice for dev,
   tests and the spec export, logged.

6. `[should]` **"Tests read the newest file" picks the wrong email once sends are
   asynchronous.** §2.4 (Console output): "tests read the newest file". Better Auth's
   callbacks do not await the send, and from 3.1 every send is a job, so a send
   started by one test can land during the next. Nearly every API test signs up a
   user (the sign-in helper), so each one produces a verification email. The newest
   file is then sometimes another user's, and the smoke test follows the wrong link.
   Fix in §2.4, §6 and 2.2: the test helper polls the folder for the newest file
   addressed to a given recipient, and every test uses its own address. The file
   stays named by the idempotency key.

### Minor

7. `[minor]` 1.5 tests "the first render has the right layout" and redirects a
   visitor without a session, but no auth screen exists until 2.3a. Say 1.5 adds a
   placeholder sign-in route in the side auth layout, replaced in 2.3a.
8. `[minor]` 3.5: the org logo sits on a page limited to owner and admin. Add to its
   done an API test that a member cannot sign or save an org logo.
9. `[minor]` 2.5a: Better Auth's organization needs a name and a unique slug. Say the
   personal org is named after the user and its slug is generated (§3.2: no slug in
   URLs), so the card does not invent a naming scheme.
10. `[minor]` §2.4 Plans: "one function returning an org's current plan" needs a
    rule for subscription status. Say Pro while the Stripe status is `active`,
    `trialing` or `past_due`, otherwise Free.
11. `[minor]` `/tasks` allows about 10 cards per phase, gate included, and splits a
    phase that needs more. Phase 0 has 11, Phase 2 has 12, Phase 3 has 11, and the
    branch names are fixed at `phase-0` to `phase-4`. Add one line to §7: these sizes
    are accepted; `/tasks` does not split a phase.
12. `[minor]` 0.5 says tests, CI and the smoke run "boot from the committed
    `.env.example` alone" but not how the file is read; the skeleton loads `.env`.
    Say the test setup, Playwright's `webServer` and the spec export load
    `.env.example`, and dev loads `.env`, which the setup task copies from it.
13. `[minor]` 2.3a and 2.5a: Better Auth's client is usually typed by importing the
    server's `auth` type (`inferAdditionalFields<typeof auth>`), which is service
    code the 0.6 rule forbids in the web app. Say the client declares the `personal`
    field by hand.

### Owner

No questions this round. Every finding has a technical fix. Finding 1 changes when
the owner writes sign-off lines (before the merge, as a commit on the phase branch),
which is the only way they reach `main` under one PR per phase.

must: 3, should: 3, minor: 7, owner: 0
