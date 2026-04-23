import { NextResponse } from "next/server";
import { getVisitorResponses, getVisitorCompletedCount, getCrowdPairResults } from "@/lib/db";
import { mockEntities } from "@/lib/data/entities";

type CategoryId = string;

const entityMap = new Map(mockEntities.map((e) => [e.id, e]));

function normalizePairKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const visitorId = searchParams.get("visitorId");

  if (!visitorId) {
    return NextResponse.json({ error: "Missing visitorId" }, { status: 400 });
  }

  const responses = getVisitorResponses(visitorId);
  const completedCount = getVisitorCompletedCount(visitorId);
  const choices = responses.filter((r) => !r.skipped && r.selected_id);
  const skipCount = responses.filter((r) => r.skipped).length;

  if (choices.length === 0) {
    return NextResponse.json({ error: "Not enough data" }, { status: 400 });
  }

  // Build crowd majority map: for each normalized pair, what did the crowd pick most?
  const crowdResults = getCrowdPairResults();
  const crowdPairTotals = new Map<string, Map<string, number>>();

  for (const row of crowdResults) {
    const key = normalizePairKey(row.left_id, row.right_id);
    if (!crowdPairTotals.has(key)) crowdPairTotals.set(key, new Map());
    const pairMap = crowdPairTotals.get(key)!;
    pairMap.set(row.selected_id, (pairMap.get(row.selected_id) ?? 0) + row.count);
  }

  function getCrowdMajority(leftId: string, rightId: string): string | null {
    const key = normalizePairKey(leftId, rightId);
    const pairMap = crowdPairTotals.get(key);
    if (!pairMap) return null;
    let best: string | null = null;
    let bestCount = 0;
    for (const [id, count] of pairMap) {
      if (count > bestCount) { best = id; bestCount = count; }
    }
    return best;
  }

  function getCrowdTotal(leftId: string, rightId: string): number {
    const key = normalizePairKey(leftId, rightId);
    const pairMap = crowdPairTotals.get(key);
    if (!pairMap) return 0;
    let total = 0;
    for (const count of pairMap.values()) total += count;
    return total;
  }

  function getCrowdMinorityRate(leftId: string, rightId: string, selectedId: string): number {
    const key = normalizePairKey(leftId, rightId);
    const pairMap = crowdPairTotals.get(key);
    if (!pairMap) return 0.5;
    const total = getCrowdTotal(leftId, rightId);
    if (total === 0) return 0.5;
    const selectedCount = pairMap.get(selectedId) ?? 0;
    return selectedCount / total;
  }

  // 1. Crowd agreement rate
  let agreements = 0;
  for (const choice of choices) {
    const majority = getCrowdMajority(choice.left_id, choice.right_id);
    if (majority === choice.selected_id) agreements++;
  }
  const crowdAgreementRate = Math.round((agreements / choices.length) * 100);

  // 2. Most controversial choice (where user's pick had lowest crowd support)
  let mostControversial: { leftLabel: string; rightLabel: string; chosenLabel: string; crowdPercent: number } | null = null;
  let lowestSupport = 1;

  for (const choice of choices) {
    const rate = getCrowdMinorityRate(choice.left_id, choice.right_id, choice.selected_id!);
    const total = getCrowdTotal(choice.left_id, choice.right_id);
    if (total >= 3 && rate < lowestSupport) {
      lowestSupport = rate;
      const leftEntity = entityMap.get(choice.left_id);
      const rightEntity = entityMap.get(choice.right_id);
      const chosenEntity = entityMap.get(choice.selected_id!);
      if (leftEntity && rightEntity && chosenEntity) {
        mostControversial = {
          leftLabel: leftEntity.label,
          rightLabel: rightEntity.label,
          chosenLabel: chosenEntity.label,
          crowdPercent: Math.round(rate * 100)
        };
      }
    }
  }

  // 3. Category preference tendencies — only surface if user diverges from crowd
  // Build both user and crowd category-vs-category win rates, then find biggest gap
  type CatPairStats = Map<string, Map<string, { wins: number; total: number }>>;

  function buildCategoryStats(data: { left_id: string; right_id: string; selected_id: string }[]): CatPairStats {
    const stats: CatPairStats = new Map();
    for (const row of data) {
      const leftEntity = entityMap.get(row.left_id);
      const rightEntity = entityMap.get(row.right_id);
      if (!leftEntity || !rightEntity) continue;
      const leftCat = leftEntity.category;
      const rightCat = rightEntity.category;
      if (leftCat === rightCat) continue;

      const winnerCat = row.selected_id === row.left_id ? leftCat : rightCat;
      const loserCat = row.selected_id === row.left_id ? rightCat : leftCat;

      if (!stats.has(winnerCat)) stats.set(winnerCat, new Map());
      if (!stats.has(loserCat)) stats.set(loserCat, new Map());
      const winnerMap = stats.get(winnerCat)!;
      if (!winnerMap.has(loserCat)) winnerMap.set(loserCat, { wins: 0, total: 0 });
      winnerMap.get(loserCat)!.wins++;
      winnerMap.get(loserCat)!.total++;
      const loserMap = stats.get(loserCat)!;
      if (!loserMap.has(winnerCat)) loserMap.set(winnerCat, { wins: 0, total: 0 });
      loserMap.get(winnerCat)!.total++;
    }
    return stats;
  }

  const userCatStats = buildCategoryStats(
    choices.map((c) => ({ left_id: c.left_id, right_id: c.right_id, selected_id: c.selected_id! }))
  );

  // Build crowd category stats from all crowd data
  const crowdCatChoices: { left_id: string; right_id: string; selected_id: string }[] = [];
  for (const row of crowdResults) {
    for (let i = 0; i < row.count; i++) {
      crowdCatChoices.push({ left_id: row.left_id, right_id: row.right_id, selected_id: row.selected_id });
    }
  }
  const crowdCatStats = buildCategoryStats(crowdCatChoices);

  function getCatRate(stats: CatPairStats, cat: string, opponent: string): number | null {
    const catMap = stats.get(cat);
    if (!catMap) return null;
    const entry = catMap.get(opponent);
    if (!entry || entry.total < 3) return null;
    return entry.wins / entry.total;
  }

  const categoryLabels: Record<string, string> = {
    human_states: "humans",
    animals: "animals",
    plants_fungi_microbes: "plants & microbes",
    machines_ai: "machines & AI",
    collectives_systems: "collectives",
    planetary_cosmic: "cosmic entities",
    named_humans: "notable people"
  };

  // Find the category preference where user diverges most from crowd
  let categoryInsight: { highCategory: string; lowCategory: string; rate: number; qualifier: string } | null = null;
  let bestDivergence = 0;

  for (const [cat, opponents] of userCatStats) {
    for (const [opponent, { wins, total }] of opponents) {
      if (total < 3) continue;
      const userRate = wins / total;
      const crowdRate = getCatRate(crowdCatStats, cat, opponent) ?? 0.5;
      const divergence = Math.abs(userRate - crowdRate);
      // Only surface if there's meaningful divergence (>15 percentage points)
      if (divergence > 0.15 && divergence > bestDivergence) {
        bestDivergence = divergence;
        const qualifier = userRate > crowdRate ? "more than most people" : "less than most people";
        categoryInsight = {
          highCategory: categoryLabels[cat] ?? cat,
          lowCategory: categoryLabels[opponent] ?? opponent,
          rate: Math.round(userRate * 100),
          qualifier
        };
      }
    }
  }

  // 4. Transitivity cycle detection
  // Build a directed graph of user preferences, look for A > B > C > A cycles
  const prefGraph = new Map<string, Set<string>>();

  for (const choice of choices) {
    const winner = choice.selected_id!;
    const loser = choice.selected_id === choice.left_id ? choice.right_id : choice.left_id;
    if (!prefGraph.has(winner)) prefGraph.set(winner, new Set());
    prefGraph.get(winner)!.add(loser);
  }

  let cycle: { a: string; b: string; c: string } | null = null;

  outer:
  for (const [a, aBeats] of prefGraph) {
    for (const b of aBeats) {
      const bBeats = prefGraph.get(b);
      if (!bBeats) continue;
      for (const c of bBeats) {
        const cBeats = prefGraph.get(c);
        if (cBeats?.has(a)) {
          const aEntity = entityMap.get(a);
          const bEntity = entityMap.get(b);
          const cEntity = entityMap.get(c);
          if (aEntity && bEntity && cEntity) {
            cycle = {
              a: aEntity.label,
              b: bEntity.label,
              c: cEntity.label
            };
            break outer;
          }
        }
      }
    }
  }

  // 5. Mini ranking snapshot (top 5 by user's own win rate)
  const entityWins = new Map<string, { wins: number; appearances: number }>();
  for (const choice of choices) {
    const winner = choice.selected_id!;
    const loser = choice.selected_id === choice.left_id ? choice.right_id : choice.left_id;

    if (!entityWins.has(winner)) entityWins.set(winner, { wins: 0, appearances: 0 });
    if (!entityWins.has(loser)) entityWins.set(loser, { wins: 0, appearances: 0 });

    entityWins.get(winner)!.wins++;
    entityWins.get(winner)!.appearances++;
    entityWins.get(loser)!.appearances++;
  }

  const personalRanking = Array.from(entityWins.entries())
    .filter(([, stats]) => stats.appearances >= 2)
    .map(([id, stats]) => ({
      id,
      label: entityMap.get(id)?.label ?? id,
      winRate: Math.round((stats.wins / stats.appearances) * 100)
    }))
    .sort((a, b) => b.winRate - a.winRate)
    .slice(0, 5);

  return NextResponse.json({
    completedCount,
    skipCount,
    crowdAgreementRate,
    mostControversial,
    categoryInsight,
    cycle,
    personalRanking
  });
}
