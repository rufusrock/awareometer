import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export async function GET() {
  const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), "awareometer.db");
  const exists = fs.existsSync(dbPath);
  const sizeBytes = exists ? fs.statSync(dbPath).size : null;

  if (!exists) {
    return NextResponse.json({ dbPath, exists, sizeBytes, cwd: process.cwd() });
  }

  const db = new Database(dbPath, { readonly: true });
  const responses = db.prepare("SELECT * FROM responses ORDER BY id DESC LIMIT 50").all();
  const entityStats = db.prepare("SELECT * FROM entity_stats WHERE appearances > 0 ORDER BY rating DESC").all();
  const pairStats = db.prepare("SELECT * FROM pair_stats ORDER BY exposure_count DESC LIMIT 20").all();
  db.close();

  return NextResponse.json({ dbPath, exists, sizeBytes, cwd: process.cwd(), responses, entityStats, pairStats });
}
