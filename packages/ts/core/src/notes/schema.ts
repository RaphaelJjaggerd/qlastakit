// Input and output shapes for notes: the single source for validation, the OpenAPI
// spec and the generated client.
import { z } from "zod";

export const Note = z
  .object({
    id: z.string().uuid(),
    title: z.string(),
    body: z.string(),
    createdAt: z.string().datetime(),
  })
  .meta({ id: "Note" });

export const CreateNote = z
  .object({
    title: z.string().min(1).max(200),
    body: z.string().max(10_000).default(""),
  })
  .meta({ id: "CreateNote" });

export type Note = z.infer<typeof Note>;
export type CreateNote = z.input<typeof CreateNote>;
