import type { Entity } from "@/lib/types";

type RankingEntry = {
  entityId: string;
  wins: number;
  comparisons: number;
  winRate: number;
};

type LeaderboardProps = {
  rankings: RankingEntry[];
  entityMap: Map<string, Entity>;
};

export function Leaderboard({ rankings, entityMap }: LeaderboardProps) {
  if (rankings.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="text-lg">No rankings yet.</p>
        <p className="mt-2 text-sm">Complete some comparisons to see results here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {rankings.map((entry, index) => {
        const entity = entityMap.get(entry.entityId);
        if (!entity) return null;

        const percentage = Math.round(entry.winRate * 100);

        return (
          <div
            key={entry.entityId}
            className="glass-panel flex items-center gap-4 rounded-2xl px-4 py-3 shadow-card sm:gap-5 sm:px-5 sm:py-4"
          >
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
              {index + 1}
            </div>
            <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100 sm:h-14 sm:w-14">
              <img
                src={entity.image_url}
                alt={entity.image_alt}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">{entity.label}</h3>
              <div className="mt-1 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-900 transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="flex-shrink-0 text-sm font-semibold tabular-nums text-slate-700">
                  {percentage}%
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-400">
                {entry.wins} wins / {entry.comparisons} comparisons
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
