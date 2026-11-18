import { defineConfig } from "vitest/config";

// 0.4a adds the Postgres setup and turns file parallelism off for this project.
export default defineConfig({
  test: {
    name: "api",
    environment: "node",
    include: ["src/**/*.test.ts"],
    passWithNoTests: true,
  },
});
