import type { Db } from "@qlastakit/db";
import { describe, expect, it } from "vitest";
import { CodedError } from "../errors";
import { createNote } from "./service";

// Validation runs before the database is touched, so a stub that throws is enough.
const db = new Proxy(
  {},
  {
    get: () => {
      throw new Error("db must not be reached");
    },
  },
) as Db;

describe("createNote", () => {
  it.each([{}, { title: "" }, null, "text"])(
    "rejects bad input %j with validation_error",
    async (input) => {
      const err = await createNote(db, input).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(CodedError);
      expect((err as CodedError).code).toBe("validation_error");
    },
  );
});
