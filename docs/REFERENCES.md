# Reference kits

Two existing SaaS kits are kept beside the repo as reading material. They are not
dependencies and nothing in qlastakit imports from them.

## Setup

Unpack them into a `references/` folder at the repo root. It is gitignored.

```
references/
  supastarter/   contents of supastarter-nextjs-main (the newest of the three copies)
  saasrock/      contents of the SaasRock folder
```

## Rules for agents

1. **Read only.** Never run `install`, a build or any script inside `references/`.
   These copies did not come straight from the vendors, so treat them as untrusted.
2. **Use a scout.** Send a scout agent to read the reference and return a short map.
   Do not load reference files into the builder's context wholesale.
3. **Learn the shape, write our own.** Take the interface design, the flow and the
   edge cases. Write the implementation in qlastakit's own structure. Never paste files
   or large blocks across.
4. **Current docs win.** The supastarter copy is from early 2025 (Next 15.1,
   better-auth 1.1, AI SDK 4, Tailwind 3). For how to call a library today, follow its
   current official docs. Use the reference for what to build, not for exact API calls.
5. **The PRD wins.** If a reference does something the PRD rejected (Prisma, logic in
   route handlers, Redis), do not follow it.

## Translation table: supastarter to qlastakit

| supastarter | qlastakit |
|---|---|
| Next.js App Router pages | TanStack Start routes |
| Hono routes with logic inside | `packages/ts/core` functions + thin NestJS controllers |
| Prisma schema | SQL migration in `db/migrations` + Drizzle mirror |
| `@repo/*` | `@qlastakit/*` |
| next-intl | Whatever PRD Q1 picks |
| Server components fetching data | TanStack Query + generated client |

## Where to look: supastarter (high value, same building blocks)

| qlastakit work | Read in `references/supastarter/` | Take from it |
|---|---|---|
| Better Auth setup | `packages/auth/auth.ts`, `packages/auth/client.ts` | Which plugins, how emails are triggered, session and account-linking settings |
| Organizations | `packages/auth/lib/organization.ts`, `packages/api/src/routes/organizations/`, `apps/web/modules/saas/organizations/` | Invites, membership checks, slug handling, org switcher behavior |
| Invitation-only signup | `packages/auth/plugins/invitation-only/` | How a custom Better Auth plugin is written |
| Payments interface | `packages/payments/types.ts`, `packages/payments/provider/index.ts` | The small provider contract: checkout link, customer portal, seats, invoices, webhook handler |
| Stripe adapter | `packages/payments/provider/stripe/index.ts` | Which webhook events matter and what each one writes |
| Purchases model | `packages/database/prisma/schema.prisma` (`Purchase`), `packages/api/src/routes/payments/` | One table covering subscriptions and one-time purchases, owned by a user or an org |
| Second and third adapters | `packages/payments/provider/lemonsqueezy/`, `creem/`, `chargebee/` | Proof the contract holds across providers. Model Paystack and Polar on this |
| Email | `packages/mail/src/provider/`, `packages/mail/src/util/`, `packages/mail/emails/` | Provider switch (Resend among them), template registry, translated emails |
| File storage | `packages/storage/provider/s3/index.ts`, `packages/api/src/routes/uploads.ts` | Signed upload and download URLs, bucket config |
| AI module | `packages/ai/`, `packages/api/src/routes/ai.ts`, `apps/web/modules/saas/ai/` | Streaming endpoint and chat persistence (`AiChat`). API calls are outdated |
| Org admin and settings UI | `apps/web/modules/saas/settings/`, `apps/web/modules/saas/organizations/` | Screen inventory: profile, security, members, billing |
| Super admin | `packages/api/src/routes/admin/`, `apps/web/modules/saas/admin/` | Minimal user and org management |
| Onboarding | `apps/web/modules/saas/onboarding/` | First-run flow after signup |
| App config | `config/index.ts` | One typed config object switching features on and off |
| Agent rules | `.cursorrules` | How another kit briefs agents. Compare with our `AGENTS.md` |

## Where to look: SaasRock (feature catalog only)

SaasRock is a 2023 Remix + Prisma app with hand-rolled auth and 129 database models.
Its structure is the opposite of this kit's KISS rule, so never copy its shape. It is
useful as a list of features and edge cases a mature SaaS ends up needing.

| qlastakit work | Read in `references/saasrock/` | Take from it |
|---|---|---|
| Super admin app (later phase) | `app/routes/admin/`, `app/utils/db/blacklist.db.server.ts`, `app/utils/db/appConfiguration.db.server.ts` | Feature list: accounts, bans, audit trails, site settings, SEO meta tags |
| Usage credits (later phase) | `prisma/schema.prisma` (subscription and usage models), `app/utils/services/subscriptionService.ts`, `app/utils/services/pricingService.ts` | How usage records, tiers and feature limits are modelled |
| Roles and permissions | `app/utils/db/permissions/`, `app/utils/services/rolesAndPermissionsService.ts` | What a full RBAC looks like, to decide how little of it we need |
| API keys | `app/utils/db/apiKeys.db.server.ts` | Per-tenant keys with usage logs |
| Feature flags | `app/modules/featureFlags/` | Flag and filter model |
| Engine and CLI (VISION stage 2) | `app/modules/codeGenerator/` | A working example of generating code from templates |

Ignore for qlastakit: the entity builder, CRM, email marketing, knowledge base, page
blocks and workflow modules. They are products, not kit plumbing.
