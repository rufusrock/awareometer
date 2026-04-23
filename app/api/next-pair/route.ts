import { NextResponse } from "next/server";
import { getAllEntityStats, getAllPairExposures, getVisitorSeenPairs, getVisitorRecentPairs, incrementPairExposure } from "@/lib/db";
import { mockEntities } from "@/lib/data/entities";
import { selectNextPair, type SelectionContext } from "@/lib/pair-selection";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");

  if (!visitorId) {
    return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
  }

  const activeEntities = mockEntities.filter((e) => e.is_active);
  const entityIds = activeEntities.map((e) => e.id);

  // Gather all context for pair selection
  const allStats = getAllEntityStats();
  const entityStatsMap = new Map(allStats.map((s) => [s.entityId, s]));
  const pairExposures = getAllPairExposures();
  const visitorSeen = new Set(getVisitorSeenPairs(visitorId));
  const recentPairs = new Set(getVisitorRecentPairs(visitorId, 15));

  const ctx: SelectionContext = {
    entityIds,
    entityStatsMap,
    pairExposures,
    recentSessionPairs: recentPairs,
    visitorSeenPairs: visitorSeen,
  };

  const result = selectNextPair(ctx);

  if (!result) {
    // Fallback: random pair
    const i = Math.floor(Math.random() * entityIds.length);
    let j = Math.floor(Math.random() * (entityIds.length - 1));
    if (j >= i) j++;
    return NextResponse.json({ leftId: entityIds[i], rightId: entityIds[j] });
  }

  // Record the exposure for this pair
  incrementPairExposure(result.leftId, result.rightId);

  return NextResponse.json({ leftId: result.leftId, rightId: result.rightId });
}
