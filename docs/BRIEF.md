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

## Open
- Q1 i18n library: i18next + react-i18next, as in the UI kit?
- Q2 Polar payouts: move the check out of v1, as a hands-on precondition on the first Polar card?
- Q3 Tokens for other languages: cookie sessions only in v1; JWT/JWKS and bearer tokens wait for the first non-TS service or Expo?
- Q4 VPS: defer to a Phase 3 card that measures latency from Nairobi to three candidates?
- Q5 Kit updates: manual; each project records its kit commit in its AGENTS.md?
- Q6 First idea app: name, scope and PRD in its own repo at Phase 4?
- Q7a DNS host: Cloudflare?
- Q8 Glossary seed (Kit, Project, Idea app, Module, Org, Personal org, Reference feature)?
- Q9 Console adapter output: where does a "sent" email go so a human and a test can read it?
- Q10 Console adapter in production: allowed, or a boot error?
