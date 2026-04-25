import { getRandomPair, buildPair } from "@/lib/game/pairing";
import type { Entity, ResponseRecord, SessionState } from "@/lib/types";

const STORAGE_KEY = "awareometer-session";

function isValidSession(value: unknown): value is SessionState {
  if (!value || typeof value !== "object") return false;
  const session = value as SessionState;
  return Array.isArray(session.entities) && Array.isArray(session.responses) && Array.isArray(session.seenPairKeys);
}

export async function fetchNextPair(entities: Entity[], visitorId: string) {
  try {
    const res = await fetch(`/api/next-pair?visitorId=${encodeURIComponent(visitorId)}`);
    if (res.ok) {
      const data = await res.json();
      const left = entities.find((e) => e.id === data.leftId);
      const right = entities.find((e) => e.id === data.rightId);
      if (left && right) return buildPair(left, right);
    }
  } catch {
    // API unavailable — fall back to local random
  }

  return getRandomPair(entities, []);
}

export function createInitialSession(
  entities: Entity[],
  fromStorage = false
): SessionState {
  if (fromStorage && typeof window !== "undefined") {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        if (isValidSession(parsed) && parsed.currentPair) {
          return { ...parsed, entities };
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }
  }

  return {
    entities,
    currentPair: getRandomPair(entities),
    responses: [],
    seenPairKeys: [],
    roundComparisons: 0
  };
}

export function createResponseRecord(session: SessionState, selectedId: string | null): ResponseRecord {
  const pair = session.currentPair;
  if (!pair) throw new Error("Cannot record a response without an active pair.");

  return {
    pairKey: pair.key,
    leftId: pair.left.id,
    rightId: pair.right.id,
    selectedId,
    createdAt: new Date().toISOString()
  };
}

export function recordResponseWithPair(
  session: SessionState,
  selectedId: string | null,
  nextPair: SessionState["currentPair"],
  meta?: { responseTimeMs?: number | null; leftPercent?: number | null; rightPercent?: number | null }
): SessionState {
  const response = createResponseRecord(session, selectedId);
  const enriched = meta ? { ...response, ...meta } : response;
  const seenPairKeys = [...session.seenPairKeys, response.pairKey];

  return {
    ...session,
    responses: [...session.responses, enriched],
    seenPairKeys,
    roundComparisons: session.roundComparisons + 1,
    currentPair: nextPair
  };
}
