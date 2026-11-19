// Runs in each test file: tables are emptied between tests.
import postgres from "postgres";
import { afterAll, beforeEach } from "vitest";
import { testUrl } from "./urls";

const sql = postgres(testUrl, { max: 1, onnotice: () => {} });

beforeEach(async () => {
  const tables = await sql<{ tablename: string }[]>`
    select tablename from pg_tables
    where schemaname = 'public' and tablename <> 'schema_migrations'`;
  if (tables.length > 0) {
    const list = tables.map((t) => `"${t.tablename.replaceAll('"', '""')}"`).join(", ");
    await sql.unsafe(`truncate ${list} restart identity cascade`);
  }
});

afterAll(async () => {
  await sql.end();
});
