// Business logic lives here. No HTTP concerns: plain functions in, plain data out.
import { notes } from "@kit/db";
import { desc } from "drizzle-orm";
import { getDb } from "../../db";
import type { CreateNote, Note } from "./schema";

function toNote(row: typeof notes.$inferSelect): Note {
  return { ...row, createdAt: row.createdAt.toISOString() };
}

export async function listNotes(): Promise<Note[]> {
  const rows = await getDb().select().from(notes).orderBy(desc(notes.createdAt)).limit(100);
  return rows.map(toNote);
}

export async function createNote(input: CreateNote): Promise<Note> {
  const [row] = await getDb().insert(notes).values(input).returning();
  if (!row) throw new Error("insert returned no row");
  return toNote(row);
}
