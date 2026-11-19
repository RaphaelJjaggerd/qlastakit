// Every error leaves the API in the same JSON shape: { error: { code, message } }.
import { type ArgumentsHost, Catch, type ExceptionFilter, HttpException } from "@nestjs/common";
import { CodedError } from "@qlastakit/core";
import type { Response } from "express";

// Core throws codes; the HTTP status is decided here.
const STATUS: Record<string, number> = { not_found: 404, validation_error: 400 };

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(err: unknown, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    if (err instanceof CodedError) {
      res.status(STATUS[err.code] ?? 400).json({ error: { code: err.code, message: err.message } });
    } else if (err instanceof HttpException) {
      const status = err.getStatus();
      const code = status === 404 ? "not_found" : "bad_request";
      res.status(status).json({ error: { code, message: err.message } });
    } else {
      console.error(err);
      res.status(500).json({ error: { code: "internal_error", message: "Something went wrong" } });
    }
  }
}
