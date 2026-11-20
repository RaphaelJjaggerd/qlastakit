// Every error leaves the API in the same JSON shape: { error: { code, message } }.
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";
import { CodedError } from "@qlastakit/core";
import type { Request, Response } from "express";

// Core throws codes; the HTTP status is decided here.
const STATUS: Record<string, number> = { not_found: 404, validation_error: 400 };

// 4xx statuses that have their own code; any other 4xx is `bad_request`.
const CLIENT_CODE: Record<number, string> = { 404: "not_found", 413: "payload_too_large" };

const INTERNAL = { code: "internal_error", message: "Something went wrong" };

// Express's body parser throws plain http-errors errors (no Nest class) with a status.
function clientStatus(err: unknown): number | undefined {
  const status = (err as { status?: unknown; statusCode?: unknown } | null)?.status;
  const code = (err as { statusCode?: unknown } | null)?.statusCode;
  const n = typeof status === "number" ? status : code;
  return typeof n === "number" && n >= 400 && n < 500 ? n : undefined;
}

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const http = host.switchToHttp();
    const res = http.getResponse<Response>();
    const log = http.getRequest<Request>().log;

    if (err instanceof CodedError) {
      res.status(STATUS[err.code] ?? 400).json({ error: { code: err.code, message: err.message } });
      return;
    }
    const status = err instanceof HttpException ? err.getStatus() : clientStatus(err);
    if (status !== undefined && status < 500) {
      const message = err instanceof Error ? err.message : "Bad request";
      res.status(status).json({ error: { code: CLIENT_CODE[status] ?? "bad_request", message } });
      return;
    }
    // Anything else is a server error: log it, never show its message to the client.
    log?.error({ err }, "unhandled error");
    res.status(status ?? 500).json({ error: INTERNAL });
  }
}
