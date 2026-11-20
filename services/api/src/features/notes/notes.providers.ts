// Binds the database into core's notes functions. This file is the only place in the
// notes feature that touches the db; the controller sees the result through NOTES.
import { createNote, listNotes, type Note } from "@qlastakit/core";
import { getDb } from "../../db";

export const NOTES = Symbol("NOTES");

export interface Notes {
  list(): Promise<Note[]>;
  create(input: unknown): Promise<Note>;
}

export const notesProvider = {
  provide: NOTES,
  // getDb() runs per call, so building the app (and the spec export) needs no database.
  useFactory: (): Notes => ({
    list: () => listNotes(getDb()),
    create: (input) => createNote(getDb(), input),
  }),
};
