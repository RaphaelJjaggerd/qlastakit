import { migrate } from "./migrate";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("migrate: DATABASE_URL is not set (copy .env.example to .env)");
  process.exit(1);
}
try {
  await migrate(url, console.log);
  console.log("migrations up to date");
} catch (err) {
  console.error(`migrate: failed: ${err instanceof Error ? err.message : String(err)}`);
  console.error("migrate: is Postgres running? (mise run db-up)");
  process.exit(1);
}
