# packages/go

Shared Go modules, one folder per module (`auth/`, `mail/`, `payments/`, `db/`).

## Adding the first module

```sh
mkdir -p packages/go/auth && cd packages/go/auth && go mod init <module-path>/auth
```

Then from the repo root:

```sh
go work init ./packages/go/auth ./services/api-go
```

`mise run setup` and `mise run check` do not cover Go yet. Once `go.work` exists, add the
Go steps (`go work sync`, `go vet`) to the root `package.json` scripts the mise tasks call.
Suggested libs: gin or chi, pgx + sqlc, golang-jwt, huma (OpenAPI).
