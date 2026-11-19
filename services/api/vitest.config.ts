import { defineConfig } from "vitest/config";
import { exampleEnv, testUrl } from "./test/urls.ts";

// Real Postgres (second database, created and migrated by global-setup), tables
// truncated between tests, test files run one at a time.
export default defineConfig({
  test: {
    name: "api",
    environment: "node",
    include: ["src/**/*.test.ts"],
    globalSetup: ["./test/global-setup.ts"],
    setupFiles: ["./test/setup.ts"],
    env: { ...exampleEnv, NODE_ENV: "test", DATABASE_URL: testUrl, LOG_LEVEL: "silent" },
    fileParallelism: false,
    passWithNoTests: true,
  },
});
