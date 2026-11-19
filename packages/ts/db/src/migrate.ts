// Applies db/migrations/*.sql once each, in filename order, one transaction per file.
// Applied files are recorded in schema_migrations. Used by local dev, the test setup,
// CI and the deploy. Never edit an applied migration.
import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import postgres from "postgres";

const migrationsDir = fileURLToPath(new URL("../../../../db/migrations/", import.meta.url));

export async function migrate(url: string, log: (line: string) => void = () => {}) {
  const sql = postgres(url, { max: 1, onnotice: () => {} });
  try {
    await sql`create table if not exists schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )`;
    const files = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();
    for (const file of files) {
      const [done] = await sql`select 1 from schema_migrations where name = ${file}`;
      if (done) continue;
      log(`applying ${file}`);
      const text = readFileSync(migrationsDir + file, "utf8");
      await sql.begin(async (tx) => {
        await tx.unsafe(text);
        await tx`insert into schema_migrations (name) values (${file})`;
      });
    }
  } finally {
    await sql.end();
  }
}
