import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "node:path";

export async function GET() {
  const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), "awareometer.db");
  const db = new Database(dbPath, { readonly: true });

  const responses = db.prepare("SELECT * FROM responses ORDER BY id ASC").all();
  const entityStats = db.prepare("SELECT * FROM entity_stats ORDER BY rating DESC").all();
  const pairStats = db.prepare("SELECT * FROM pair_stats ORDER BY exposure_count DESC").all();
  db.close();

  return NextResponse.json({ responses, entityStats, pairStats });
}
