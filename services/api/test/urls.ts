// The test database lives in the same Postgres as dev, under another name (by env).
const base = process.env.DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/app";
export const testDbName = process.env.TEST_DB_NAME ?? "app_test";

export const adminUrl = base;
export const testUrl = (() => {
  const u = new URL(base);
  u.pathname = `/${testDbName}`;
  return u.toString();
})();
