# 0002: Plain SQL migrations at the root

**Decision.** `db/migrations/*.sql` is the schema's source of truth, applied by
`db/migrate.sh`. ORMs (Drizzle in TS) only mirror it; they never generate migrations.

**Why.** A Rust, Go or Python service must be able to use the same database without
depending on a TypeScript tool.

**Consequence.** Write SQL by hand, then update `packages/ts/db/src/schema.ts`
(or regenerate it with `pnpm --filter @qlastakit/db pull`).
