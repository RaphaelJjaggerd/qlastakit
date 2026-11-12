// HTTP layer only: declare routes, validate input, call the service.
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateNote, Note } from "./schema";
import { createNote, listNotes } from "./service";

const list = createRoute({
  method: "get",
  path: "/notes",
  operationId: "listNotes",
  tags: ["notes"],
  responses: {
    200: {
      description: "Latest notes",
      content: { "application/json": { schema: z.array(Note) } },
    },
  },
});

const create = createRoute({
  method: "post",
  path: "/notes",
  operationId: "createNote",
  tags: ["notes"],
  request: { body: { content: { "application/json": { schema: CreateNote } } } },
  responses: {
    201: {
      description: "Created note",
      content: { "application/json": { schema: Note } },
    },
  },
});

export const notesRoutes = new OpenAPIHono()
  .openapi(list, async (c) => c.json(await listNotes(), 200))
  .openapi(create, async (c) => c.json(await createNote(c.req.valid("json")), 201));
