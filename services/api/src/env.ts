// Env vars are validated with zod once, at boot. A bad env refuses to boot with one
// message naming every problem. A provider's keys (Resend, Stripe, ...) become required
// only when that provider's adapter is selected: each module card adds its own rule here
// and its names to .env.example, so tests, CI and the spec export boot from .env.example.
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().min(0).max(65535).default(8787),
  DATABASE_URL: z.string().min(1),
  // Comma-separated origins allowed to call the API cross-origin. Empty in v1: the
  // browser sees one origin through the proxy (PRD 2.6).
  CORS_ORIGINS: z
    .string()
    .default("")
    .transform((v) =>
      v
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const problems = parsed.error.issues.map((i) => `  ${i.path.join(".")}: ${i.message}`);
    throw new Error(`Invalid environment, refusing to boot:\n${problems.join("\n")}`);
  }
  return parsed.data;
}
