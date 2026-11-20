import { describe, expect, it } from "vitest";
import { CodedError } from "./errors";

describe("CodedError", () => {
  it("carries a code and a message and is an Error", () => {
    const err = new CodedError("not_found", "Note not found");
    expect(err).toBeInstanceOf(Error);
    expect(err.code).toBe("not_found");
    expect(err.message).toBe("Note not found");
  });
});
