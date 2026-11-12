import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

const health = createRoute({
  method: "get",
  path: "/health",
  operationId: "getHealth",
  tags: ["system"],
  responses: {
    200: {
      description: "Service is up",
      content: { "application/json": { schema: z.object({ ok: z.boolean() }) } },
    },
  },
});

export const healthRoutes = new OpenAPIHono().openapi(health, (c) => c.json({ ok: true }, 200));
