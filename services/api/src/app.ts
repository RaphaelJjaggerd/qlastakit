// Builds the API: everything under /api, the spec at /api/openapi.json, docs at /api/docs.
// Decorator metadata: this API uses explicit @Inject() tokens and never relies on
// emitDecoratorMetadata, so dev (tsx), Vitest and the spec export all behave the same.
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";
import { randomUUID } from "node:crypto";
import helmet from "helmet";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { pino } from "pino";
import { pinoHttp } from "pino-http";
import { AppModule } from "./app.module";
import { type Env, loadEnv } from "./env";

type Options = {
  env?: Env;
  // Where log lines go; tests pass their own to read them.
  logStream?: { write(line: string): void };
};

// Validates the env first (a bad env throws before anything boots), then builds the app.
export async function createApp(options: Options = {}): Promise<INestApplication> {
  const env = options.env ?? loadEnv();
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn"] });
  app.setGlobalPrefix("api");
  app.use(helmet());
  // One JSON line per request, tagged with a request id that is also sent back as
  // `x-request-id` (an incoming id is reused, so a proxy's id carries through).
  app.use(
    pinoHttp({
      logger: pino({ level: env.LOG_LEVEL }, options.logStream),
      genReqId: (req, res) => {
        const incoming = req.headers["x-request-id"];
        const id = typeof incoming === "string" && incoming.length <= 128 ? incoming : randomUUID();
        res.setHeader("x-request-id", id);
        return id;
      },
    }),
  );
  // CORS allowlist; empty by default, so no cross-origin caller is allowed.
  app.enableCors({ origin: env.CORS_ORIGINS });
  SwaggerModule.setup("api/docs", app, () => buildSpec(app), {
    jsonDocumentUrl: "api/openapi.json",
  });
  return app;
}

// Paths in the spec are relative to the server URL "/api", so the generated client's
// base URL is "/api" in every environment (PRD 2.6) and operations stay "/notes".
export function buildSpec(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle("API")
    .setVersion("0.1.0")
    .setOpenAPIVersion("3.1.0")
    .addServer("/api")
    .build();
  const doc = cleanupOpenApiDoc(SwaggerModule.createDocument(app, config), { version: "3.1" });
  doc.paths = Object.fromEntries(
    Object.entries(doc.paths).map(([path, item]) => [path.replace(/^\/api(?=\/)/, ""), item]),
  );
  return doc;
}
