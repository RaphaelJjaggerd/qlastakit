// Tests boot from the committed .env.example alone (PRD 2.4), so its values are the
// defaults; a real DATABASE_URL in the shell still wins.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { parseEnv } from "node:util";

export const exampleEnv = parseEnv(
  readFileSync(fileURLToPath(new URL("../../../.env.example", import.meta.url)), "utf8"),
) as Record<string, string>;

// The test database lives in the same Postgres as dev, under another name (by env).
const base = process.env.DATABASE_URL ?? exampleEnv.DATABASE_URL ?? "";
export const testDbName = process.env.TEST_DB_NAME ?? exampleEnv.TEST_DB_NAME ?? "app_test";

export const adminUrl = base;
export const testUrl = (() => {
  const u = new URL(base);
  u.pathname = `/${testDbName}`;
  return u.toString();
})();
