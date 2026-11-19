// The API baseline (0.5): env validation, error shape, security headers, CORS allowlist,
// and structured logs with request ids. Each one is proven through the running app.
import { type ArgumentsHost, HttpException } from "@nestjs/common";
import { afterEach, describe, expect, it, vi } from "vitest";
import { startApp } from "../test/harness";
import { loadEnv } from "./env";
import { ErrorsFilter } from "./errors.filter";

type App = Awaited<ReturnType<typeof startApp>>;
const open: App[] = [];
async function start(...args: Parameters<typeof startApp>) {
  const app = await startApp(...args);
  open.push(app);
  return app;
}
afterEach(async () => {
  vi.unstubAllEnvs();
  await Promise.all(open.splice(0).map((a) => a.close()));
});

describe("env validation", () => {
  it("refuses a bad env with every problem named", () => {
    expect(() => loadEnv({ API_PORT: "not-a-port", LOG_LEVEL: "loud" })).toThrow(
      /(?=[\s\S]*refusing to boot)(?=[\s\S]*DATABASE_URL)(?=[\s\S]*API_PORT)(?=[\s\S]*LOG_LEVEL)/,
    );
  });

  it("refuses to boot the app on a bad env", async () => {
    vi.stubEnv("DATABASE_URL", "");
    await expect(startApp()).rejects.toThrow(/refusing to boot[\s\S]*DATABASE_URL/);
  });

  it("boots from the committed .env.example values alone", async () => {
    // The vitest setup loads .env.example into the process env.
    expect(loadEnv().CORS_ORIGINS).toEqual([]);
    const app = await start();
    expect((await fetch(`${app.baseUrl}/health`)).status).toBe(200);
  });
});

describe("security headers", () => {
  it("sets helmet's headers", async () => {
    const app = await start();
    const res = await fetch(`${app.baseUrl}/health`);
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-powered-by")).toBeNull();
    expect(res.headers.get("strict-transport-security")).toBeTruthy();
  });
});

describe("CORS allowlist", () => {
  const env = (origins: string) => loadEnv({ ...process.env, CORS_ORIGINS: origins });
  const get = (app: App, origin: string) => fetch(`${app.baseUrl}/health`, { headers: { origin } });

  it("allows only listed origins", async () => {
    const app = await start({ env: env("https://app.example.com, https://b.example.com") });
    expect(
      (await get(app, "https://app.example.com")).headers.get("access-control-allow-origin"),
    ).toBe("https://app.example.com");
    expect(
      (await get(app, "https://evil.example.com")).headers.get("access-control-allow-origin"),
    ).toBeNull();
  });

  it("allows no origin by default", async () => {
    const app = await start();
    expect(
      (await get(app, "https://app.example.com")).headers.get("access-control-allow-origin"),
    ).toBeNull();
  });
});

describe("error shape", () => {
  it("gives a coded 404 for an unknown route", async () => {
    const app = await start();
    const res = await fetch(`${app.baseUrl}/nope`);
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("not_found");
  });

  it("gives a coded 400 for malformed JSON", async () => {
    const app = await start();
    const res = await fetch(`${app.baseUrl}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{nope",
    });
    expect(res.status).toBe(400);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe("bad_request");
  });

  it("gives a coded 413, not a 500, for an oversized body", async () => {
    const app = await start();
    const res = await fetch(`${app.baseUrl}/notes`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "x", body: "y".repeat(2_000_000) }),
    });
    expect(res.status).toBe(413);
    expect(((await res.json()) as { error: { code: string } }).error.code).toBe(
      "payload_too_large",
    );
  });

  it("hides the message of a server error, for any kind of throw", () => {
    const sent: { status?: number; body?: unknown } = {};
    const res = {
      status(s: number) {
        sent.status = s;
        return this;
      },
      json(b: unknown) {
        sent.body = b;
      },
    };
    const host = {
      switchToHttp: () => ({ getResponse: () => res, getRequest: () => ({ log: { error() {} } }) }),
    } as unknown as ArgumentsHost;
    const cases: [Error, number][] = [
      [new HttpException("db password is hunter2", 503), 503],
      [new Error("hunter2"), 500],
    ];
    for (const [err, status] of cases) {
      new ErrorsFilter().catch(err, host);
      expect(sent.status).toBe(status);
      expect(sent.body).toEqual({
        error: { code: "internal_error", message: "Something went wrong" },
      });
    }
  });
});

describe("logs and request ids", () => {
  const capture = () => {
    const lines: string[] = [];
    return { lines, logStream: { write: (l: string) => void lines.push(l) } };
  };
  const logged = (lines: string[]) => lines.map((l) => JSON.parse(l) as { req?: { id: string } });

  it("tags every request with a generated id, in the response and in the log", async () => {
    const { lines, logStream } = capture();
    const app = await start({ env: loadEnv({ ...process.env, LOG_LEVEL: "info" }), logStream });
    const res = await fetch(`${app.baseUrl}/health`);
    const id = res.headers.get("x-request-id");
    expect(id).toMatch(/^[0-9a-f-]{36}$/);
    await vi.waitFor(() => expect(logged(lines).some((l) => l.req?.id === id)).toBe(true));
  });

  it("reuses an incoming request id", async () => {
    const { lines, logStream } = capture();
    const app = await start({ env: loadEnv({ ...process.env, LOG_LEVEL: "info" }), logStream });
    const res = await fetch(`${app.baseUrl}/health`, {
      headers: { "x-request-id": "from-proxy-1" },
    });
    expect(res.headers.get("x-request-id")).toBe("from-proxy-1");
    await vi.waitFor(() =>
      expect(logged(lines).some((l) => l.req?.id === "from-proxy-1")).toBe(true),
    );
  });
});
