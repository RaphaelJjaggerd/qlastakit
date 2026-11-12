# @kit/auth (planned)

Not built yet. Plan: Better Auth inside `services/api`, issuing JWTs that any language
can verify through a JWKS endpoint (`/auth/jwks`). This package will hold shared TS
helpers (session types, a `requireUser` middleware). Build it with the first project
that needs login.
