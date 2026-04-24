import { NextResponse } from "next/server";
import { getAllEntityStats } from "@/lib/db";

export async function GET() {
  const stats = getAllEntityStats();
  return NextResponse.json(
    stats.map((s) => ({ entityId: s.entityId, rating: s.rating }))
  );
}
