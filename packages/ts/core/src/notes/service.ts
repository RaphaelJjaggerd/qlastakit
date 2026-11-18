// Notes logic. Plain functions: the database comes in as an argument.
import { notes, type Db } from "@qlastakit/db";
import { desc } from "drizzle-orm";
import { CodedError } from "../errors";
import { CreateNote, type Note } from "./schema";

function toNote(row: typeof notes.$inferSelect): Note {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export async function listNotes(db: Db): Promise<Note[]> {
  const rows = await db.select().from(notes).orderBy(desc(notes.createdAt)).limit(100);
  return rows.map(toNote);
}

export async function createNote(db: Db, input: unknown): Promise<Note> {
  const parsed = CreateNote.safeParse(input);
  if (!parsed.success) throw new CodedError("validation_error", "Invalid note");
  const [row] = await db.insert(notes).values(parsed.data).returning();
  if (!row) throw new Error("insert returned no row");
  return toNote(row);
}
