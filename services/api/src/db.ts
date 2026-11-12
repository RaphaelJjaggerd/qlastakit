import { createDb, type Db } from "@kit/db";

// Created lazily so the API (and openapi export) works without a database.
let db: Db | undefined;

export function getDb(): Db {
  if (!db) {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    db = createDb(url);
  }
  return db;
}
