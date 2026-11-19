// Builds the API: everything under /api, the spec at /api/openapi.json, docs at /api/docs.
// Decorator metadata: this API uses explicit @Inject() tokens and never relies on
// emitDecoratorMetadata, so dev (tsx), Vitest and the spec export all behave the same.
import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import type { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule, type OpenAPIObject } from "@nestjs/swagger";
import { cleanupOpenApiDoc } from "nestjs-zod";
import { AppModule } from "./app.module";

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule, { logger: ["error", "warn"] });
  app.setGlobalPrefix("api");
  // Open CORS, as the Hono API had it. 0.5 replaces this with the allowlist.
  app.enableCors();
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
