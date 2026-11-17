# Brief: qlastakit v1 open questions

## Concept
qlastakit is the monorepo every project starts from (see `docs/PRD.md` sections 1-3).
This grill closes PRD section 4 (open questions Q1-Q7) and whatever branches off them.

## Settled
- Q7b Domain: the owner holds a domain. Only subdomains are used: one for the reference deploy, one dedicated sending subdomain for Resend. Never the bare domain.
- Q7b Domain placement: the domain lives only in env vars and deploy settings. It never appears in kit code or kit docs, not even as a default or an example.
- Q7b Branding: the kit carries no company brand.
- Email adapters: `sendEmail` has two adapters. `console` is the default in local dev and tests: it prints or saves the email and needs no account. `resend` is used in deploys.
- Email precondition: verifying the sending subdomain on Resend is a hands-on precondition (owner sign-off) on the email card.
- Q1 i18n: i18next + react-i18next, as in the UI kit. One message file per language, English only shipped.
- Q2 Polar: payout check leaves v1. It is a hands-on precondition on the first Polar card: the owner confirms in Polar onboarding that the owning entity can be paid out.
- Q3 Tokens: v1 uses Better Auth cookie sessions only. JWT/JWKS and bearer tokens wait for the first non-TS service or the Expo app.
- Q4 VPS: chosen in Phase 3 by a card that measures latency from Nairobi to three candidates (a Nairobi provider, a Johannesburg region, Hetzner EU). Cheapest one that is fast enough wins.
- Q5 Kit updates: manual in v1. Each project records the kit commit it was copied from as one line in its `AGENTS.md`.
- Q6 First idea app: name, scope and PRD live in its own repo. See the scope change below.
- Q7a DNS host: Cloudflare.
- Q8 Glossary: seeded in `GLOSSARY.md`, plus Theme, Tactile, App, Service, Full shape, Light shape.
- Q9 Console adapter output: prints a one-line summary (to, subject, every link) and saves the full email as an `.html` file in a gitignored folder. Humans open it in a browser; tests read the newest file.
- Q10 Console adapter in production: the API refuses to boot in production with the `console` email adapter.
- Scope: this repo builds the kit only. The idea app is never built here. No task card may contain idea-app features.
- Kit proof: like supastarter, the kit ships every kit feature working end to end in its own screens, with no product features: sign up, email verification and reset, org create/invite/switch, billing with Stripe checkout and subscription management, avatar and org logo upload in settings, one small AI chat demo page.
- v1 done: all of the kit proof works on the live reference deploy. Tag v1.0 then.
- Roadmap: Phase 4 is removed from the PRD and replaced by one line: "The idea app is built afterwards in its own repo, with its own PRD. Problems it finds come back here as kit v1.x tasks."
- Reference feature: `notes` stays small. It is only the example new features copy their shape from.
- VISION: "Two shapes of project" section added to `docs/VISION.md` (Full and Light, same core, manifest `"api": "nestjs" | "none"`, only Full in v1). Nothing in v1 changes.
- Q11 Demo-only screens: only the AI chat page, under a `/demo/` route prefix. The kit's `AGENTS.md` says "delete `/demo/*` in a project". Every other screen is a project's real shell.
- Q12 Stripe on the reference deploy: test mode. Proof is a test-card checkout plus managing that subscription in the customer portal. Live keys are a per-project setting.
- Q13 Plans: Free, Pro (monthly and yearly), one one-time purchase. Plans in a typed config file, Stripe price IDs in env vars.
- Q14 AI chat demo: no persistence (streaming only), signed-in users only, per-user daily message cap set by env, cheap model by default.
- Q15 Signup: open on the reference deploy, no invitation-only switch in v1. Harm is capped by auth rate limits, Stripe test mode and the AI cap.
- Q15 Email abuse cap: the auth rate limits also cap how many verification and password reset emails a single email address and a single IP can trigger, so the public deploy cannot spam people from the sending subdomain.
- Q16 Avatar and org logo: PNG, JPEG or WebP, max 2 MB, no server-side resizing. Signed-URL upload, public-URL read.
- Q17 VISION stage 1: now "proven by its live reference deploy, then hardened by real projects built from it".
- Q18 Email abuse cap limits: per email address, at most 3 verification and 3 reset emails per hour (counted per type); per IP, at most 10 auth emails per hour of any type. Both are env vars with these defaults. Counters live in Postgres.
- Q18 Email abuse cap behaviour: an address cap hit returns the normal success response and logs the suppressed send (no account enumeration). An IP cap hit returns 429 with error code `rate_limited`. The card checks whether Better Auth's limiter can count per address; if not, the cap sits in core in front of `sendEmail`, so it covers every auth email.

## Open
(none)
