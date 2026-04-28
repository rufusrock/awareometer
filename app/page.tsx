"use client";

import { useEffect, useRef, useState } from "react";
import { ComparisonStage } from "@/components/comparison-stage";
import { CompletionDialog } from "@/components/completion-dialog";
import { mockEntities } from "@/lib/data/entities";
import { createInitialSession, recordResponseWithPair, fetchNextPair } from "@/lib/game/session";
import type { SessionState } from "@/lib/types";

const COMPLETION_THRESHOLD = 15;

function getOrCreateVisitorId(): string {
  const key = "awareometer-visitor-id";
  const existing = window.localStorage.getItem(key);
  if (existing) return existing;
  const id = crypto.randomUUID();
  window.localStorage.setItem(key, id);
  return id;
}

export default function Home() {
  const [isHydrated, setIsHydrated] = useState(false);
  const [session, setSession] = useState<SessionState>(() => createInitialSession(mockEntities));
  const [visitorId, setVisitorId] = useState("");
  const [showCompletion, setShowCompletion] = useState(false);
  const nextPairRef = useRef<ReturnType<typeof fetchNextPair> | null>(null);

  useEffect(() => {
    const restored = createInitialSession(mockEntities, true);
    setSession(restored);
    setVisitorId(getOrCreateVisitorId());
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    window.localStorage.setItem("awareometer-session", JSON.stringify(session));
  }, [isHydrated, session]);

  const choiceCount = session.responses.filter((r) => r.selectedId !== null).length;
  const hasReachedCompletion = choiceCount >= COMPLETION_THRESHOLD;

  const handleInteract = () => {
    nextPairRef.current = fetchNextPair(mockEntities, visitorId, session.currentPair?.key);
  };

  const handleChoice = async (
    winnerId: string,
    _openedModal: boolean,
    responseTimeMs: number,
    leftPercent: number | null,
    rightPercent: number | null
  ) => {
    const nextPair = await (nextPairRef.current ?? fetchNextPair(mockEntities, visitorId, session.currentPair?.key));
    nextPairRef.current = null;
    const updated = recordResponseWithPair(session, winnerId, nextPair, { responseTimeMs, leftPercent, rightPercent });
    setSession(updated);

    const newChoiceCount = updated.responses.filter((r) => r.selectedId !== null).length;
    if (newChoiceCount === COMPLETION_THRESHOLD) {
      setShowCompletion(true);
    }
  };

  const handleSkip = async () => {
    const nextPair = await (nextPairRef.current ?? fetchNextPair(mockEntities, visitorId, session.currentPair?.key));
    nextPairRef.current = null;
    const updated = recordResponseWithPair(session, null, nextPair);
    setSession(updated);
  };

  if (!isHydrated) {
    return <main className="min-h-screen" />;
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-between gap-8">
        <div className="flex flex-1 items-center justify-center">
          {session.currentPair && (
            <ComparisonStage
              key={session.currentPair.key}
              pair={session.currentPair}
              visitorId={visitorId}
              onChoose={handleChoice}
              onSkip={handleSkip}
              onInteract={handleInteract}
            />
          )}
        </div>

        <div className="mx-auto w-full max-w-3xl space-y-4 px-2 pb-2 text-center">
          <div>
            <button
              type="button"
              disabled={!hasReachedCompletion}
              onClick={() => setShowCompletion(true)}
              className={
                hasReachedCompletion
                  ? "rounded-full px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 transition hover:bg-white/60"
                  : "cursor-default rounded-full px-4 py-2 text-sm font-medium text-slate-300 ring-1 ring-slate-200"
              }
            >
              How do my intuitions compare?
            </button>
            {!hasReachedCompletion && (
              <p className="mt-1 text-xs text-slate-400">
                Unlocks after {COMPLETION_THRESHOLD} choices ({Math.max(0, COMPLETION_THRESHOLD - choiceCount)} to go)
              </p>
            )}
          </div>

          <div className="text-xs leading-5 text-slate-500 sm:text-sm">
            <p>
              <strong className="font-semibold text-slate-700">Aware-o-meter</strong> is a piece of research investigating intuitions about awareness. Thank you for participating!
            </p>
            <p className="mt-2">
              Get in touch:{" "}
              <a
                className="font-medium text-slate-700 underline decoration-slate-300 underline-offset-4"
                href="mailto:awareometer@gmail.com"
              >
                awareometer@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {showCompletion && (
        <CompletionDialog
          responses={session.responses}
          entities={session.entities}
          onKeepMatching={() => setShowCompletion(false)}
        />
      )}
    </main>
  );
}
