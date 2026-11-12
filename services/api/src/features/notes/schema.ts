// Request/response shapes for this feature. These become the public contract.
import { z } from "@hono/zod-openapi";

export const Note = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    body: z.string(),
    createdAt: z.string().datetime(),
  })
  .openapi("Note");

export const CreateNote = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().max(10_000).default(""),
  })
  .openapi("CreateNote");

export type Note = z.infer<typeof Note>;
export type CreateNote = z.infer<typeof CreateNote>;
