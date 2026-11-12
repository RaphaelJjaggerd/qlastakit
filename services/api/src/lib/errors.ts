import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Throw from any service to return a clean error to the client:
 *   throw new AppError("not_found", "Note not found", 404)
 */
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: ContentfulStatusCode = 400,
  ) {
    super(message);
  }
}
