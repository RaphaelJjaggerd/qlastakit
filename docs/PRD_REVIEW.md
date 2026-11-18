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
