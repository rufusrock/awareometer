import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  const dbPath = process.env.DB_PATH ?? path.join(process.cwd(), "awareometer.db");
  const exists = fs.existsSync(dbPath);
  const size = exists ? fs.statSync(dbPath).size : null;

  return NextResponse.json({ dbPath, exists, sizeBytes: size, cwd: process.cwd() });
}
