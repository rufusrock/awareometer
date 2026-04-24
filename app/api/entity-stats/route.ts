import { NextResponse } from "next/server";
import { getEntityStats } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const stats = getEntityStats(id);
  const total = stats.wins + stats.losses;
  const winRate = total > 0 ? stats.wins / total : null;

  return NextResponse.json({ entityId: id, wins: stats.wins, losses: stats.losses, winRate });
}
