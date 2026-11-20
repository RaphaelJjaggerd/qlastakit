# services/api

NestJS on Express + `nestjs-zod`. Everything is served under `/api`; the OpenAPI spec is
generated from the controllers (`/api/openapi.json`, docs UI at `/api/docs`).

## Feature shape (copy `src/features/notes`)

```
src/features/<name>/
  <name>.controller.ts  thin adapter: parse, call one core function, map the result
  <name>.providers.ts   binds the db into core's functions (only file that imports db)
  <name>.module.ts      Module({ controllers, providers })
```

Register the module in `src/app.module.ts`.

## Rules

- No decorator metadata: inject with explicit `@Inject(TOKEN)`, never by constructor type.
  Do not turn on `emitDecoratorMetadata`. Take `@Body() body: unknown` and let core validate.
- A controller never imports the db (`*.controller.ts` is lint-banned from it).
- Every route needs a unique `@ApiOperation({ operationId })`; it becomes the client
  function name. Responses use `@ZodResponse({ type: Dto })` with `createZodDto(coreSchema)`.
- Business logic and zod schemas live in `@qlastakit/core`. Core throws
  `CodedError(code, message)`; `src/errors.filter.ts` maps the code to a status and every
  error leaves as `{ error: { code, message } }`.
- Spec paths exclude `/api` (server URL is `/api`); the spec export needs no database.
- Run `mise run contract` after changing any route or schema.
