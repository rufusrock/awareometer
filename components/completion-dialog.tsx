"use client";

import { useEffect, useState } from "react";
import type { ResponseRecord, Entity, EntityCategory } from "@/lib/types";

type Props = {
  responses: ResponseRecord[];
  entities: Entity[];
  onKeepMatching: () => void;
};

const CATEGORY_LABELS: Record<EntityCategory, string> = {
  human_states: "humans",
  animals: "animals",
  plants_fungi_microbes: "plants & fungi",
  machines_ai: "machines & AI",
  collectives_systems: "collectives",
  planetary_cosmic: "cosmic entities",
  named_humans: "historical figures",
};

// Higher = most people expect this category to be more aware.
// Used to detect when a user's tendencies are genuinely surprising.
const EXPECTED_RANK: Record<EntityCategory, number> = {
  named_humans: 6,
  human_states: 5,
  animals: 4,
  machines_ai: 3,
  plants_fungi_microbes: 2,
  collectives_systems: 2,
  planetary_cosmic: 1,
};

function formatMs(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function computeStats(responses: ResponseRecord[], entities: Entity[]) {
  const entityById = new Map(entities.map((e) => [e.id, e]));
  const nonSkips = responses.filter((r) => r.selectedId !== null);

  // --- Most controversial pick ---
  // Find the response where the user most strongly went against the crowd,
  // i.e. chose the entity with the lowest crowd percentage.
  let mostControversial: ResponseRecord | null = null;
  let maxContraScore = -Infinity;
  for (const r of nonSkips) {
    if (r.leftPercent == null || r.rightPercent == null || !r.selectedId) continue;
    const winnerPct = r.selectedId === r.leftId ? r.leftPercent : r.rightPercent;
    const contraScore = 50 - winnerPct; // positive = went against majority
    if (contraScore > maxContraScore) {
      maxContraScore = contraScore;
      mostControversial = r;
    }
  }
  // Only surface if the user actually picked the underdog at least once
  if (maxContraScore <= 0) mostControversial = null;

  // --- Slowest decision ---
  let slowest: ResponseRecord | null = null;
  let maxMs = -Infinity;
  for (const r of nonSkips) {
    if (r.responseTimeMs != null && r.responseTimeMs > maxMs) {
      maxMs = r.responseTimeMs;
      slowest = r;
    }
  }

  // --- Transitivity violations ---
  // wins.get(A) = set of entities that A beat
  const wins = new Map<string, Set<string>>();
  for (const r of nonSkips) {
    if (!r.selectedId) continue;
    const loserId = r.selectedId === r.leftId ? r.rightId : r.leftId;
    if (!wins.has(r.selectedId)) wins.set(r.selectedId, new Set());
    wins.get(r.selectedId)!.add(loserId);
  }
  let violations = 0;
  let exampleCycle: [string, string, string] | null = null;
  for (const [a, aBeat] of wins) {
    for (const b of aBeat) {
      for (const c of wins.get(b) ?? []) {
        if (wins.get(c)?.has(a)) {
          violations++;
          if (!exampleCycle) exampleCycle = [a, b, c];
        }
      }
    }
  }
  violations = Math.round(violations / 3);

  // --- Surprising category tendencies ---
  // Only count cross-category matchups where the user picked the lower-expected-rank
  // category over the higher-expected-rank category. Avoids confounding from matchup luck
  // (e.g. animals only facing rocks inflating the animal win rate).
  const surprisingWins = new Map<EntityCategory, number>();

  for (const r of nonSkips) {
    if (!r.selectedId) continue;
    const loserId = r.selectedId === r.leftId ? r.rightId : r.leftId;
    const winner = entityById.get(r.selectedId);
    const loser = entityById.get(loserId);
    if (!winner || !loser || winner.category === loser.category) continue;

    if (EXPECTED_RANK[winner.category] < EXPECTED_RANK[loser.category]) {
      surprisingWins.set(winner.category, (surprisingWins.get(winner.category) ?? 0) + 1);
    }
  }

  let surprisingCategory: { category: EntityCategory; count: number } | null = null;
  for (const [cat, count] of surprisingWins) {
    if (!surprisingCategory || count > surprisingCategory.count) {
      surprisingCategory = { category: cat, count };
    }
  }

  return { mostControversial, slowest, maxMs, violations, exampleCycle, surprisingCategory, entityById };
}

export function CompletionDialog({ responses, entities, onKeepMatching }: Props) {
  const [entityRatings, setEntityRatings] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    let cancelled = false;

    import("canvas-confetti").then(({ default: confetti }) => {
      if (cancelled) return;
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.55 } });
      setTimeout(() => {
        if (!cancelled) confetti({ particleCount: 60, spread: 100, origin: { y: 0.4 } });
      }, 400);
    });

    fetch("/api/entity-stats")
      .then((r) => r.json())
      .then((data: { entityId: string; rating: number }[]) => {
        if (cancelled) return;
        const map = new Map<string, number>();
        for (const s of data) map.set(s.entityId, s.rating);
        setEntityRatings(map);
      })
      .catch(() => {});

    return () => { cancelled = true; };
  }, []);

  const { mostControversial, slowest, maxMs, violations, exampleCycle, surprisingCategory, entityById } = computeStats(responses, entities);

  // Elo-controlled AI insight: for each ChatGPT matchup the user judged, check
  // whether their choice went against or with the crowd (as reflected by Elo).
  const aiInsight: "more" | "less" | null = (() => {
    if (!entityRatings) return null;
    const chatGptRating = entityRatings.get("chatgpt");
    if (chatGptRating == null) return null;

    let proAI = 0;   // user picked ChatGPT over a higher-Elo opponent
    let antiAI = 0;  // user rejected ChatGPT in favour of a lower-Elo opponent

    for (const r of responses) {
      if (!r.selectedId) continue;
      if (r.leftId !== "chatgpt" && r.rightId !== "chatgpt") continue;
      const opponentId = r.leftId === "chatgpt" ? r.rightId : r.leftId;
      const opponentRating = entityRatings.get(opponentId);
      if (opponentRating == null) continue;

      if (r.selectedId === "chatgpt" && opponentRating > chatGptRating) proAI++;
      if (r.selectedId !== "chatgpt" && opponentRating < chatGptRating) antiAI++;
    }

    if (proAI === antiAI) return null;
    return proAI > antiAI ? "more" : "less";
  })();
  const matchCount = responses.filter((r) => r.selectedId !== null).length;
  const skipCount = responses.filter((r) => r.selectedId === null).length;

  const shareUrl = typeof window !== "undefined" ? window.location.origin : "https://awareometer.up.railway.app";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg animate-rise rounded-[2rem] px-6 py-8 shadow-card">

        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">🎉</div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
            25 comparisons done!
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Here's what your choices reveal…
          </p>
          <div className="mt-3 flex justify-center gap-4 text-xs text-slate-400">
            <span><strong className="text-slate-600">{matchCount}</strong> matches</span>
            <span><strong className="text-slate-600">{skipCount}</strong> skips</span>
          </div>
        </div>

        <div className="space-y-3">

          {aiInsight && (
            <StatCard emoji="🤖" title="Your view on AI">
              {aiInsight === "more"
                ? "You think AI is more aware than most people do."
                : "You think AI is less aware than most people do."
              }
            </StatCard>
          )}

          {mostControversial && (() => {
            const left = entityById.get(mostControversial.leftId);
            const right = entityById.get(mostControversial.rightId);
            const winner = entityById.get(mostControversial.selectedId!);
            const winnerPct = mostControversial.selectedId === mostControversial.leftId
              ? mostControversial.leftPercent
              : mostControversial.rightPercent;
            const loserLabel = winner?.id === left?.id ? right?.label : left?.label;
            return (
              <StatCard emoji="⚖️" title="Most contrarian pick">
                You chose <strong>{winner?.label}</strong> over <strong>{loserLabel}</strong>,
                but only {Math.round(winnerPct ?? 0)}% of participants agreed with you.
              </StatCard>
            );
          })()}

          {slowest && (() => {
            const left = entityById.get(slowest.leftId);
            const right = entityById.get(slowest.rightId);
            return (
              <StatCard emoji="🤔" title="Hardest decision">
                You spent <strong>{formatMs(maxMs)}</strong> deciding between{" "}
                <strong>{left?.label}</strong> and <strong>{right?.label}</strong>.
              </StatCard>
            );
          })()}

          <StatCard emoji="🔄" title="Transitivity violations">
            {violations === 0
              ? "Your choices were perfectly consistent — no circular contradictions!"
              : (() => {
                  const [a, b, c] = exampleCycle!;
                  const aL = entityById.get(a)?.label ?? a;
                  const bL = entityById.get(b)?.label ?? b;
                  const cL = entityById.get(c)?.label ?? c;
                  return (
                    <>
                      You had <strong>{violations}</strong> circular contradiction{violations === 1 ? "" : "s"}.
                      {" "}You rated <strong>{aL}</strong> above <strong>{bL}</strong>,{" "}
                      <strong>{bL}</strong> above <strong>{cL}</strong>, but <strong>{cL}</strong> above <strong>{aL}</strong>.
                    </>
                  );
                })()}
          </StatCard>

          {surprisingCategory && (
            <StatCard emoji="📊" title="Your tendencies">
              You rated <strong>{CATEGORY_LABELS[surprisingCategory.category]}</strong> as more
              aware even when facing entities the crowd rates higher —{" "}
              {surprisingCategory.count === 1 ? "once" : <><strong>{surprisingCategory.count}</strong> times</>}.
              That's a surprising tendency.
            </StatCard>
          )}

        </div>

        <div className="mt-6 space-y-3">
          <div className="text-center">
            <p className="mb-2 text-xs text-slate-500">Know someone who'd find this interesting?</p>
            <button
              type="button"
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: "Aware-o-meter", url: shareUrl });
                } else {
                  navigator.clipboard.writeText(shareUrl);
                }
              }}
              className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Share Aware-o-meter
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={onKeepMatching}
              className="text-sm text-slate-400 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-600"
            >
              Keep matching →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-white/60 px-4 py-3 shadow-sm">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {emoji} {title}
      </p>
      <p className="text-sm leading-relaxed text-slate-700">{children}</p>
    </div>
  );
}
