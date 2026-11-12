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

`just setup` and `just check` pick up Go automatically once `go.work` exists.
Suggested libs: gin or chi, pgx + sqlc, golang-jwt, huma (OpenAPI).
