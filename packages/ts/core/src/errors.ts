/**
 * Expected failures. Clients translate `code`, never `message`.
 * Core knows nothing about HTTP; the API maps a code to a status.
 *   throw new CodedError("not_found", "Note not found")
 */
export class CodedError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "CodedError";
  }
}
