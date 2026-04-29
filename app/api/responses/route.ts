import { NextResponse } from "next/server";
import { getEntityStats, getPairStats, recordComparisonAtomic, getVisitorCompletedCount } from "@/lib/db";
import { processWin, visitorWeight } from "@/lib/ratings";

export async function POST(request: Request) {
  const body = await request.json();
  const { visitorId, leftId, rightId, selectedId, skipped, openedModal, responseTimeMs, referrer } = body;

  if (!visitorId || !leftId || !rightId) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  if (!skipped && !selectedId) {
    return NextResponse.json({ error: "Must provide selectedId or mark as skipped" }, { status: 400 });
  }

  const ref = typeof referrer === "string" && referrer ? referrer : null;

  if (skipped) {
    // Skips: record raw data + pair exposure, but do NOT update Elo ratings
    recordComparisonAtomic(visitorId, leftId, rightId, null, true, !!openedModal, undefined, undefined, responseTimeMs ?? null, ref);
    return NextResponse.json({ skipped: true });
  }

  // Non-skip: compute Elo update, then write atomically
  const winnerId = selectedId;
  const loserId = winnerId === leftId ? rightId : leftId;

  const weight = visitorWeight(getVisitorCompletedCount(visitorId));
  const winnerStats = getEntityStats(winnerId);
  const loserStats = getEntityStats(loserId);
  const { updatedA: updatedWinner, updatedB: updatedLoser } = processWin(winnerStats, loserStats, weight);

  recordComparisonAtomic(
    visitorId,
    leftId,
    rightId,
    selectedId,
    false,
    !!openedModal,
    updatedWinner,
    updatedLoser,
    responseTimeMs ?? null,
    ref
  );

  // Return crowd stats for percentage reveal
  const stats = getPairStats(leftId, rightId);
  return NextResponse.json(stats);
}
