// @vitest-environment node
import { existsSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadRootEnv, rootEnvDir } from "../root-env";

// Mode-specific root env file: loadEnv reads `.env.<mode>` from the root. Not a real
// mode, so it never touches the developer's own .env.
const mode = "rootenvtest";
const file = join(rootEnvDir, `.env.${mode}`);

describe("web server-side API base URL from the root env file", () => {
  let saved: string | undefined;

  beforeEach(() => {
    saved = process.env.API_INTERNAL_URL;
    delete process.env.API_INTERNAL_URL;
  });

  afterEach(() => {
    if (existsSync(file)) rmSync(file);
    if (saved === undefined) delete process.env.API_INTERNAL_URL;
    else process.env.API_INTERNAL_URL = saved;
  });

  it("resolves the root from this file, whatever the cwd", () => {
    expect(existsSync(join(rootEnvDir, "pnpm-workspace.yaml"))).toBe(true);
  });

  it("copies API_INTERNAL_URL from the root file into process.env", () => {
    writeFileSync(
      file,
      "API_INTERNAL_URL=http://root-file.example/api\nROOT_ENV_TEST_KEY=from-file\n",
    );
    const env = loadRootEnv(mode);
    expect(process.env.API_INTERNAL_URL).toBe("http://root-file.example/api");
    expect(env.ROOT_ENV_TEST_KEY).toBe("from-file");
  });

  it("lets a real env var win over the file", () => {
    writeFileSync(file, "API_INTERNAL_URL=http://root-file.example/api\n");
    process.env.API_INTERNAL_URL = "http://real.example/api";
    loadRootEnv(mode);
    expect(process.env.API_INTERNAL_URL).toBe("http://real.example/api");
  });
});
