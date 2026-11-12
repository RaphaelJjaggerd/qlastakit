# 0003: Shared packages grouped by language

**Decision.** Shared code lives in `packages/<language>/<name>`: `ts`, `rust`, `go`,
`python`. Apps and services are grouped by purpose, not language.

**Why.** A package can only be imported by code in the same language, so grouping by
language makes that boundary obvious. Each language uses its native workspace tool
(pnpm, Cargo, Go workspaces, uv), and they ignore each other.

**Consequence.** Auth, mail and payments are implemented once per language that needs
them. Non-TS versions are usually small: they verify tokens and call provider APIs, they
do not reimplement full flows.
