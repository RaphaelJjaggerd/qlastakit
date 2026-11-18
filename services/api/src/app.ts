// Builds the API. Every feature registers its routes here, nothing else.
import { OpenAPIHono } from "@hono/zod-openapi";
import { CodedError } from "@qlastakit/core";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { healthRoutes } from "./features/health/routes";
import { notesRoutes } from "./features/notes/routes";

// Core throws codes; the HTTP status is decided here.
const STATUS: Record<string, ContentfulStatusCode> = { not_found: 404, validation_error: 400 };
const statusFor = (code: string): ContentfulStatusCode => STATUS[code] ?? 400;

export function createApp() {
  const app = new OpenAPIHono({
    // Invalid input -> 400 { error: { code, message, issues } }
    defaultHook: (result, c) => {
      if (!result.success) {
        return c.json(
          {
            error: {
              code: "validation_error",
              message: "Invalid request",
              issues: result.error.issues,
            },
          },
          400,
        );
      }
    },
  });

  app.use("*", cors());

  // Register features
  app.route("/", healthRoutes);
  app.route("/", notesRoutes);

  app.doc("/openapi.json", {
    openapi: "3.1.0",
    info: { title: "API", version: "0.1.0" },
  });

  // Every error leaves the API in the same JSON shape.
  app.onError((err, c) => {
    if (err instanceof CodedError) {
      return c.json({ error: { code: err.code, message: err.message } }, statusFor(err.code));
    }
    console.error(err);
    return c.json({ error: { code: "internal_error", message: "Something went wrong" } }, 500);
  });

  return app;
}
