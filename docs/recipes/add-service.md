# Recipe: add a service in another language

Example: a Rust service with Rocket at `services/api-rs`.

1. Create the service as a normal project for that language:
   `services/api-rs/` (Rust), `services/api-go/` (Go), `services/api-py/` (Python).
2. Register it in that language's workspace (see `packages/<lang>/README.md`):
   root `Cargo.toml`, `go.work`, or root `pyproject.toml`.
3. Read config from the same env names as everything else (`DATABASE_URL`, a port var).
4. Use the existing tables. Schema changes still go in `db/migrations/*.sql`.
5. Expose an OpenAPI spec for its routes (utoipa for Rust, swag/huma for Go, FastAPI
   for Python) and write it to `contracts/<service>.openapi.json`.
6. Generate a TS client for it the same way `contracts/clients/ts` does, if apps call it.
7. Add its commands to the root `package.json` scripts that the mise tasks call (`dev`,
   `check`, `build`); each mise task stays one `pnpm` command.

Shared code used by two or more services of the same language goes in
`packages/<lang>/<name>`. Never import TS packages from another language.
