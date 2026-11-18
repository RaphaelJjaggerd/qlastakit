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

3. **API feature.** Copy `services/api/src/features/notes` to `features/projects` and
   adapt `schema.ts`, `service.ts`, `routes.ts`. Give each route a unique `operationId`.

4. **Register** it in `services/api/src/app.ts`:
   `app.route("/", projectsRoutes);`

5. **Regenerate the contract:** `mise run contract`. New functions such as `listProjects()`
   now exist in `@qlastakit/api-client`.

6. **UI.** Add `apps/web/src/routes/projects.tsx`, load data in `loader` with the new
   client function, build the page with `@qlastakit/ui` components.

7. **Check:** `mise run check`.
