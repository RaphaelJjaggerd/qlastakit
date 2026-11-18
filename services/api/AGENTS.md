# services/api

Hono + `@hono/zod-openapi`. The routes ARE the contract: the OpenAPI spec is generated
from them.

## Feature shape (copy `src/features/notes`)

```
src/features/<name>/
  routes.ts   createRoute(...) + handlers that call a core function
```

Register the feature in `src/app.ts` with `app.route("/", <name>Routes)`.

## Rules

- Every route needs a unique `operationId`. It becomes the client function name
  (`operationId: "listNotes"` -> `listNotes()` in `@qlastakit/api-client`).
- Business logic and zod schemas live in `@qlastakit/core` (`packages/ts/core`). Routes
  name a core schema with `.openapi("Name")`. Core throws `CodedError(code, message)`;
  `src/app.ts` maps the code to a status.
  Validation errors and crashes are already turned into JSON by `src/app.ts`.
- Get the database with `getDb()` from `src/db.ts`.
- Run `mise run contract` after changing any route or schema.
