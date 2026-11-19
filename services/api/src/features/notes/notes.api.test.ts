import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { startApp } from "../../../test/harness";

let app: Awaited<ReturnType<typeof startApp>>;
beforeAll(async () => {
  app = await startApp();
});
afterAll(() => app.close());

const post = (body: unknown) =>
  fetch(`${app.baseUrl}/notes`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });

describe("notes API on real Postgres", () => {
  it("starts empty", async () => {
    const res = await fetch(`${app.baseUrl}/notes`);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual([]);
  });

  it("creates a note and lists it", async () => {
    const created = await post({ title: "first", body: "hello" });
    expect(created.status).toBe(201);
    const note = (await created.json()) as { id: string };
    expect(note).toMatchObject({ title: "first", body: "hello" });

    const listed = (await (await fetch(`${app.baseUrl}/notes`)).json()) as { id: string }[];
    expect(listed).toHaveLength(1);
    expect(listed[0]?.id).toBe(note.id);
  });

  it("rejects an invalid note with the coded error shape", async () => {
    const res = await post({ title: "" });
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe("validation_error");
  });

  it("starts from empty tables in every test", async () => {
    await post({ title: "leftover" });
  });

  it("does not see the previous test's note", async () => {
    const listed = await (await fetch(`${app.baseUrl}/notes`)).json();
    expect(listed).toEqual([]);
  });
});
