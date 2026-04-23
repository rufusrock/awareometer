import { NextResponse } from "next/server";
import { getLeaderboard } from "@/lib/db";

export async function GET() {
  const rankings = getLeaderboard();
  return NextResponse.json(rankings);
}
