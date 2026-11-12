# 0001: Contract-first boundaries between apps and services

**Decision.** Apps and services communicate only over HTTP, described by an OpenAPI spec
that is generated from the service code. Clients are generated from the spec.

**Why.** It keeps the repo language-agnostic at the seams. Any service can be rewritten in
Rust, Go or Python, and any app can go native (Kotlin, Swift), without changing the other
side, as long as the contract holds. TS-only coupling (tRPC, shared server imports) would
lock everything into TypeScript.

**Consequence.** One extra step after changing routes: `just contract`.
