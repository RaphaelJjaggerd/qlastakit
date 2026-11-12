# services/api

Hono + `@hono/zod-openapi`. The routes ARE the contract: the OpenAPI spec is generated
from them.

## Feature shape (copy `src/features/notes`)

```
src/features/<name>/
  schema.ts   zod shapes for requests/responses, each with .openapi("Name")
  service.ts  business logic: plain async functions, no Hono, no HTTP
  routes.ts   createRoute(...) + handlers that validate and call the service
```

Register the feature in `src/app.ts` with `app.route("/", <name>Routes)`.

## Rules

- Every route needs a unique `operationId`. It becomes the client function name
  (`operationId: "listNotes"` -> `listNotes()` in `@kit/api-client`).
- Throw `new AppError(code, message, status)` from services for expected failures.
  Validation errors and crashes are already turned into JSON by `src/app.ts`.
- Get the database with `getDb()` from `src/db.ts`.
- Run `just contract` after changing any route or schema.
