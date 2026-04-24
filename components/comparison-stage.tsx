import { useEffect, useRef, useState } from "react";
import { EntityCard } from "@/components/entity-card";
import { UncertaintyModal } from "@/components/uncertainty-modal";
import type { EntityPair } from "@/lib/types";

type PairStats = {
  leftCount: number;
  rightCount: number;
  totalCount: number;
};

type ComparisonStageProps = {
  pair: EntityPair;
  visitorId: string;
  onChoose: (winnerId: string, openedModal: boolean, responseTimeMs: number, leftPercent: number | null, rightPercent: number | null) => void;
  onSkip: (openedModal: boolean) => void;
  onInteract: () => void;
};

export function ComparisonStage({ pair, visitorId, onChoose, onSkip, onInteract }: ComparisonStageProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stats, setStats] = useState<PairStats | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalWasOpened, setModalWasOpened] = useState(false);
  const timeoutRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(Date.now());
  const statsRef = useRef<PairStats | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleChoose = async (winnerId: string) => {
    if (selectedId) return;

    onInteract();
    const responseTimeMs = Date.now() - startTimeRef.current;
    setSelectedId(winnerId);

    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          leftId: pair.left.id,
          rightId: pair.right.id,
          selectedId: winnerId,
          openedModal: modalWasOpened,
          responseTimeMs
        })
      });

      if (res.ok) {
        const data: PairStats = await res.json();
        setStats(data);
        statsRef.current = data;
      }
    } catch {
      // API unavailable — continue without percentages
    }

    timeoutRef.current = window.setTimeout(() => {
      const s = statsRef.current;
      const leftPct = s && s.totalCount > 0 ? (s.leftCount / s.totalCount) * 100 : null;
      const rightPct = s && s.totalCount > 0 ? (s.rightCount / s.totalCount) * 100 : null;
      onChoose(winnerId, modalWasOpened, responseTimeMs, leftPct, rightPct);
    }, 1350);
  };

  const handleUncertaintyClick = () => {
    if (selectedId) return;
    setShowModal(true);
    setModalWasOpened(true);
  };

  const handleGoBack = () => {
    setShowModal(false);
  };

  const handleSkip = async () => {
    setShowModal(false);
    onInteract();

    const responseTimeMs = Date.now() - startTimeRef.current;

    try {
      await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          visitorId,
          leftId: pair.left.id,
          rightId: pair.right.id,
          skipped: true,
          openedModal: true,
          responseTimeMs
        })
      });
    } catch {
      // API unavailable — continue
    }

    onSkip(true);
  };

  const leftPercentage = stats
    ? stats.totalCount > 0
      ? (stats.leftCount / stats.totalCount) * 100
      : 50
    : null;
  const rightPercentage = stats
    ? stats.totalCount > 0
      ? (stats.rightCount / stats.totalCount) * 100
      : 50
    : null;

  return (
    <section className="w-full max-w-6xl animate-rise">
      <div className="glass-panel rounded-[2rem] px-4 py-5 shadow-card sm:px-6 sm:py-6">
        <div className="mb-6 text-center sm:mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">Which is more aware?</h1>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:gap-6">
          <EntityCard
            entity={pair.left}
            isSelected={selectedId === pair.left.id}
            isDimmed={selectedId === pair.right.id}
            percentage={leftPercentage}
            onClick={() => handleChoose(pair.left.id)}
          />
          <div className="flex items-center justify-center py-1 md:py-0">
            <span className="rounded-full bg-white px-4 py-2 text-lg font-black tracking-[0.22em] text-slate-950 shadow-card">
              OR
            </span>
          </div>
          <EntityCard
            entity={pair.right}
            isSelected={selectedId === pair.right.id}
            isDimmed={selectedId === pair.left.id}
            percentage={rightPercentage}
            onClick={() => handleChoose(pair.right.id)}
          />
        </div>

        {!selectedId && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleUncertaintyClick}
              className="text-xs text-slate-400 transition hover:text-slate-500"
            >
              I really have no idea
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <UncertaintyModal onGoBack={handleGoBack} onSkip={handleSkip} />
      )}
    </section>
  );
}
