import { describe, expect, it } from "vitest";
import { CreateNote, Note } from "./schema";

describe("CreateNote", () => {
  it("defaults the body to empty", () => {
    expect(CreateNote.parse({ title: "a" })).toEqual({ title: "a", body: "" });
  });

  it("rejects an empty or oversize title and an oversize body", () => {
    expect(CreateNote.safeParse({ title: "" }).success).toBe(false);
    expect(CreateNote.safeParse({ title: "x".repeat(201) }).success).toBe(false);
    expect(CreateNote.safeParse({ title: "a", body: "x".repeat(10_001) }).success).toBe(false);
  });
});

describe("Note", () => {
  const valid = {
    id: "3f2b8c1e-9d4a-4b6e-8a1f-2c7d5e9a0b13",
    title: "t",
    body: "",
    createdAt: new Date().toISOString(),
  };

  it("accepts a well-formed note", () => {
    expect(Note.safeParse(valid).success).toBe(true);
  });

  it("rejects a non-uuid id and a non-ISO date", () => {
    expect(Note.safeParse({ ...valid, id: "1" }).success).toBe(false);
    expect(Note.safeParse({ ...valid, createdAt: "yesterday" }).success).toBe(false);
  });
});
