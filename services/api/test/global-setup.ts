// Creates the test database if missing and migrates it, once per run.
import { migrate } from "@qlastakit/db/migrate";
import postgres from "postgres";
import { adminUrl, testDbName, testUrl } from "./urls";

export default async function setup() {
  const admin = postgres(adminUrl, { max: 1, connect_timeout: 5, onnotice: () => {} });
  try {
    let exists;
    try {
      [exists] = await admin`select 1 from pg_database where datname = ${testDbName}`;
    } catch (err) {
      const reason = (err as { code?: string }).code ?? (err as Error).message;
      throw new Error(
        `API tests need Postgres at ${new URL(adminUrl).host} and it is not reachable (${reason}). ` +
          "Start it with: mise run db-up",
        { cause: err },
      );
    }
    if (!exists) await admin.unsafe(`create database "${testDbName.replaceAll('"', '""')}"`);
  } finally {
    await admin.end();
  }
  await migrate(testUrl);
}
