/**
 * Adaptive pair selection module for Awareometer.
 *
 * Hybrid policy:
 *   40% closeness (near-neighbor by Elo rating)
 *   40% uncertainty (high-uncertainty entities)
 *   20% underexposure (low-exposure pairs/entities)
 *
 * Low-data bootstrap: when entities have few appearances, bias toward
 * random/underexposed pairs. Adaptive weighting increases gradually.
 *
 * Keeps all weights/thresholds configurable for future tuning.
 */

import type { EntityStats } from "@/lib/ratings";
import type { PairExposure } from "@/lib/db";

// ── Configuration ──────────────────────────────────────────────────────────

export const SELECTION_CONFIG = {
  /** Weight for rating-closeness scoring */
  closenessWeight: 0.4,
  /** Weight for uncertainty scoring */
  uncertaintyWeight: 0.4,
  /** Weight for underexposure scoring */
  underexposureWeight: 0.2,
  /** Minimum appearances per entity before adaptive weighting kicks in */
  bootstrapThreshold: 20,
  /** Penalty multiplier for pairs seen recently in this session (0 = no penalty) */
  recentSessionPenalty: 0.02,
  /** How many top candidates to sample from (probabilistic selection) */
  topCandidatePoolSize: 10,
  /** Rating scale factor for closeness normalization */
  closenessScale: 400,
  /** Maximum pair exposure count used for normalization */
  maxExposureNorm: 50,
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

export type CandidatePair = {
  leftId: string;
  rightId: string;
  pairKey: string;
  score: number;
};

export type SelectionContext = {
  /** All active entity IDs */
  entityIds: string[];
  /** Current entity stats indexed by entity ID */
  entityStatsMap: Map<string, EntityStats>;
  /** Pair exposure data indexed by canonical pair key */
  pairExposures: Map<string, PairExposure>;
  /** Pair keys seen recently in this visitor's session */
  recentSessionPairs: Set<string>;
  /** All pairs this visitor has ever seen */
  visitorSeenPairs: Set<string>;
};

// ── Core selection ─────────────────────────────────────────────────────────

/**
 * Select the next pair to show. Returns { leftId, rightId } with randomized
 * left/right placement.
 */
export function selectNextPair(ctx: SelectionContext): { leftId: string; rightId: string } | null {
  const { entityIds, entityStatsMap } = ctx;

  if (entityIds.length < 2) return null;

  // Check if we're in bootstrap mode (most entities have low appearances)
  const avgAppearances = meanAppearances(entityIds, entityStatsMap);
  const isBootstrap = avgAppearances < SELECTION_CONFIG.bootstrapThreshold;

  // Generate all candidate pairs
  const candidates: CandidatePair[] = [];

  for (let i = 0; i < entityIds.length; i++) {
    for (let j = i + 1; j < entityIds.length; j++) {
      const leftId = entityIds[i];
      const rightId = entityIds[j];
      const pairKey = canonicalPairKey(leftId, rightId);

      // Never show the same pair twice to the same visitor
      if (ctx.visitorSeenPairs.has(pairKey)) continue;

      // Never show "You" vs "A human" — too on the nose
      if ((leftId === "you" && rightId === "human") || (leftId === "human" && rightId === "you")) continue;

      const score = isBootstrap
        ? scoreBootstrapPair(leftId, rightId, pairKey, ctx)
        : scoreAdaptivePair(leftId, rightId, pairKey, ctx);

      candidates.push({ leftId, rightId, pairKey, score });
    }
  }

  if (candidates.length === 0) return null;

  // Probabilistic selection from top candidates
  const selected = sampleFromTopCandidates(candidates);

  // Randomize left/right placement
  if (Math.random() < 0.5) {
    return { leftId: selected.leftId, rightId: selected.rightId };
  }
  return { leftId: selected.rightId, rightId: selected.leftId };
}

// ── Scoring functions ──────────────────────────────────────────────────────

/**
 * Bootstrap scoring: heavily favor random/underexposed pairs.
 */
function scoreBootstrapPair(
  leftId: string,
  rightId: string,
  pairKey: string,
  ctx: SelectionContext
): number {
  const underexposure = underexposureScore(leftId, rightId, pairKey, ctx);
  const randomJitter = Math.random() * 0.5;

  let score = 0.6 * underexposure + 0.4 * randomJitter;

  // Apply session dedupe penalty
  score *= sessionDedupeFactor(pairKey, ctx);

  return score;
}

/**
 * Adaptive scoring: balanced closeness + uncertainty + underexposure.
 */
function scoreAdaptivePair(
  leftId: string,
  rightId: string,
  pairKey: string,
  ctx: SelectionContext
): number {
  const { closenessWeight, uncertaintyWeight, underexposureWeight } = SELECTION_CONFIG;

  const closeness = closenessScore(leftId, rightId, ctx);
  const uncertainty = uncertaintyScore(leftId, rightId, ctx);
  const underexposure = underexposureScore(leftId, rightId, pairKey, ctx);

  let score =
    closenessWeight * closeness +
    uncertaintyWeight * uncertainty +
    underexposureWeight * underexposure;

  // Add small random jitter to prevent determinism
  score += Math.random() * 0.05;

  // Apply session dedupe penalty
  score *= sessionDedupeFactor(pairKey, ctx);

  return score;
}

/**
 * Higher when ratings are closer.
 * Uses a Gaussian-like decay: exp(-(diff^2) / (2 * scale^2))
 */
function closenessScore(leftId: string, rightId: string, ctx: SelectionContext): number {
  const leftStats = ctx.entityStatsMap.get(leftId);
  const rightStats = ctx.entityStatsMap.get(rightId);
  if (!leftStats || !rightStats) return 0.5;

  const diff = Math.abs(leftStats.rating - rightStats.rating);
  const scale = SELECTION_CONFIG.closenessScale;
  return Math.exp(-(diff * diff) / (2 * scale * scale));
}

/**
 * Higher when one or both entities have high uncertainty.
 * Returns the average of both entities' normalized uncertainty.
 */
function uncertaintyScore(leftId: string, rightId: string, ctx: SelectionContext): number {
  const leftStats = ctx.entityStatsMap.get(leftId);
  const rightStats = ctx.entityStatsMap.get(rightId);
  if (!leftStats || !rightStats) return 0.5;

  // Normalize uncertainty to [0, 1] using initial uncertainty as max
  const maxU = 350;
  const leftNorm = Math.min(leftStats.uncertainty / maxU, 1);
  const rightNorm = Math.min(rightStats.uncertainty / maxU, 1);
  return (leftNorm + rightNorm) / 2;
}

/**
 * Higher when entities or the pair have low exposure.
 * Combines entity-level and pair-level underexposure.
 */
function underexposureScore(
  leftId: string,
  rightId: string,
  pairKey: string,
  ctx: SelectionContext
): number {
  const leftStats = ctx.entityStatsMap.get(leftId);
  const rightStats = ctx.entityStatsMap.get(rightId);
  const pairExp = ctx.pairExposures.get(pairKey);

  // Entity underexposure: fewer appearances = higher score
  const maxApp = SELECTION_CONFIG.maxExposureNorm;
  const leftApp = leftStats ? Math.min(leftStats.appearances / maxApp, 1) : 0;
  const rightApp = rightStats ? Math.min(rightStats.appearances / maxApp, 1) : 0;
  const entityUnderexposure = 1 - (leftApp + rightApp) / 2;

  // Pair underexposure: never-seen pairs get max score
  const pairCount = pairExp ? pairExp.exposureCount : 0;
  const pairUnderexposure = 1 - Math.min(pairCount / SELECTION_CONFIG.maxExposureNorm, 1);

  return (entityUnderexposure + pairUnderexposure) / 2;
}

/**
 * Penalty factor for pairs recently shown in this session.
 * Returns a multiplier in (0, 1] — recent pairs get heavily penalized.
 */
function sessionDedupeFactor(pairKey: string, ctx: SelectionContext): number {
  if (ctx.recentSessionPairs.has(pairKey)) {
    return SELECTION_CONFIG.recentSessionPenalty;
  }
  return 1;
}

// ── Sampling ───────────────────────────────────────────────────────────────

/**
 * Probabilistic sampling from the top-scored candidates.
 * Uses softmax-like weighting so higher-scored pairs are more likely
 * but not guaranteed.
 */
function sampleFromTopCandidates(candidates: CandidatePair[]): CandidatePair {
  // Sort descending by score
  candidates.sort((a, b) => b.score - a.score);

  // Take top N
  const pool = candidates.slice(0, SELECTION_CONFIG.topCandidatePoolSize);

  if (pool.length === 1) return pool[0];

  // Weighted random sampling using scores as weights
  const totalWeight = pool.reduce((sum, c) => sum + Math.max(c.score, 0.001), 0);
  let roll = Math.random() * totalWeight;

  for (const candidate of pool) {
    roll -= Math.max(candidate.score, 0.001);
    if (roll <= 0) return candidate;
  }

  return pool[pool.length - 1];
}

// ── Helpers ────────────────────────────────────────────────────────────────

function canonicalPairKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

function meanAppearances(entityIds: string[], statsMap: Map<string, EntityStats>): number {
  if (entityIds.length === 0) return 0;
  let total = 0;
  for (const id of entityIds) {
    const stats = statsMap.get(id);
    if (stats) total += stats.appearances;
  }
  return total / entityIds.length;
}
