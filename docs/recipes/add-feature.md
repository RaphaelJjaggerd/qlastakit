# Recipe: add a feature end to end

Example: a `projects` feature with list and create.

1. **Migration.** Create `db/migrations/0002_projects.sql`:
   ```sql
   create table if not exists projects (
     id uuid primary key default gen_random_uuid(),
     name text not null,
     created_at timestamptz not null default now()
   );
   ```
   Run `mise run db-migrate`.

2. **TS table.** Add the matching `pgTable` to `packages/ts/db/src/schema.ts`.

3. **Core + API feature.** Copy `packages/ts/core/src/notes` to `projects` (adapt
   `schema.ts` and `service.ts`, export from `packages/ts/core/src/index.ts`), then copy
   the `services/api/src/features/notes` folder (controller, providers, module) to
   `features/projects` and adapt it: the controller is a thin adapter over one core function
   and never imports the db (verify fails if it does); the providers file binds the db into
   core. Give each route a unique `operationId` with `@ApiOperation`, and use
   `createZodDto` + `@ZodResponse` with core's schemas.

4. **Register** the module in `services/api/src/app.module.ts` (`imports: [...]`).

5. **Regenerate the contract:** `mise run contract`. New functions and hooks such as
   `listProjects()` and `listProjectsOptions()` now exist in `@qlastakit/api-client`.

6. **UI.** Add `apps/web/src/routes/projects.tsx`, fetch data with the generated query
   hooks (`useQuery(listProjectsOptions())`, `useMutation(createProjectMutation())`), build
   the page with `@qlastakit/ui` components.

7. **Check:** `mise run check`.
