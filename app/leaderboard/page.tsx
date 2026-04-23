"use client";

import { useEffect, useState } from "react";
import { Leaderboard } from "@/components/leaderboard";
import { mockEntities } from "@/lib/data/entities";
import type { Entity } from "@/lib/types";

type RankingEntry = {
  entityId: string;
  wins: number;
  comparisons: number;
  winRate: number;
};

const entityMap = new Map<string, Entity>(mockEntities.map((e) => [e.id, e]));

export default function LeaderboardPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/leaderboard")
      .then((res) => res.json())
      .then((data: RankingEntry[]) => {
        setRankings(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto w-full max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            Awareness Rankings
          </h1>
          <a
            href="/"
            className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
          >
            Back to game
          </a>
        </div>
        <p className="mb-8 text-sm text-slate-500">
          Ranked by win rate across all comparisons. Higher means more people chose this as &ldquo;more aware.&rdquo;
        </p>
        {loading ? (
          <div className="py-16 text-center text-slate-400">Loading rankings...</div>
        ) : (
          <Leaderboard rankings={rankings} entityMap={entityMap} />
        )}
      </div>
    </main>
  );
}
