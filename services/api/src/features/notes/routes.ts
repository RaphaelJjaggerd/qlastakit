// HTTP layer only: declare routes, validate input, call core.
import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";
import { CreateNote, createNote, listNotes, Note } from "@qlastakit/core";
import { getDb } from "../../db";

const NoteSchema = Note.openapi("Note");
const CreateNoteSchema = CreateNote.openapi("CreateNote");

const list = createRoute({
  method: "get",
  path: "/notes",
  operationId: "listNotes",
  tags: ["notes"],
  responses: {
    200: {
      description: "Latest notes",
      content: { "application/json": { schema: z.array(NoteSchema) } },
    },
  },
});

const create = createRoute({
  method: "post",
  path: "/notes",
  operationId: "createNote",
  tags: ["notes"],
  request: { body: { content: { "application/json": { schema: CreateNoteSchema } } } },
  responses: {
    201: {
      description: "Created note",
      content: { "application/json": { schema: NoteSchema } },
    },
  },
});

export const notesRoutes = new OpenAPIHono()
  .openapi(list, async (c) => c.json(await listNotes(getDb()), 200))
  .openapi(create, async (c) => c.json(await createNote(getDb(), c.req.valid("json")), 201));
