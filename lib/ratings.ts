/**
 * Elo-like online rating module for Awareometer.
 *
 * This is an approximate live-serving system. Final analysis should refit
 * raw comparison data offline with a proper statistical model (Bradley-Terry,
 * Thurstone, TrueSkill, etc.). Keep this module isolated so it can be
 * swapped out without touching the rest of the codebase.
 */

// ── Configuration ──────────────────────────────────────────────────────────

export const RATING_CONFIG = {
  /** Starting Elo rating for all entities */
  initialRating: 1500,
  /** Starting uncertainty value */
  initialUncertainty: 350,
  /** K-factor for Elo updates (higher = faster convergence, more noise) */
  kFactor: 32,
  /** Minimum uncertainty floor */
  uncertaintyFloor: 50,
  /** Uncertainty decay rate per appearance (simple monotone shrink) */
  uncertaintyDecayRate: 0.97,
} as const;

// ── Types ──────────────────────────────────────────────────────────────────

export type EntityStats = {
  entityId: string;
  rating: number;
  uncertainty: number;
  appearances: number;
  wins: number;
  losses: number;
  ties: number;
  updatedAt: string;
};

export type RatingUpdate = {
  winner: EntityStats;
  loser: EntityStats;
};

// ── Core functions ─────────────────────────────────────────────────────────

/**
 * Compute expected score for entity A against entity B.
 * EA = 1 / (1 + 10^((RB - RA) / 400))
 */
export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

/**
 * Update ratings after a completed comparison.
 * Returns new stats for both entities.
 *
 * actualScoreA: 1 for win, 0 for loss, 0.5 for tie
 */
export function updateRatings(
  entityA: EntityStats,
  entityB: EntityStats,
  actualScoreA: number
): { updatedA: EntityStats; updatedB: EntityStats } {
  const K = RATING_CONFIG.kFactor;
  const eA = expectedScore(entityA.rating, entityB.rating);
  const eB = 1 - eA;
  const actualScoreB = 1 - actualScoreA;

  const now = new Date().toISOString();

  const updatedA: EntityStats = {
    ...entityA,
    rating: entityA.rating + K * (actualScoreA - eA),
    uncertainty: shrinkUncertainty(entityA.uncertainty, entityA.appearances + 1),
    appearances: entityA.appearances + 1,
    wins: entityA.wins + (actualScoreA === 1 ? 1 : 0),
    losses: entityA.losses + (actualScoreA === 0 ? 1 : 0),
    ties: entityA.ties + (actualScoreA === 0.5 ? 1 : 0),
    updatedAt: now,
  };

  const updatedB: EntityStats = {
    ...entityB,
    rating: entityB.rating + K * (actualScoreB - eB),
    uncertainty: shrinkUncertainty(entityB.uncertainty, entityB.appearances + 1),
    appearances: entityB.appearances + 1,
    wins: entityB.wins + (actualScoreB === 1 ? 1 : 0),
    losses: entityB.losses + (actualScoreB === 0 ? 1 : 0),
    ties: entityB.ties + (actualScoreB === 0.5 ? 1 : 0),
    updatedAt: now,
  };

  return { updatedA, updatedB };
}

/**
 * Process a win: entityA beat entityB.
 */
export function processWin(
  winner: EntityStats,
  loser: EntityStats
): { updatedA: EntityStats; updatedB: EntityStats } {
  return updateRatings(winner, loser, 1);
}

/**
 * Process a tie (not exposed in UI, but supported for future use).
 */
export function processTie(
  entityA: EntityStats,
  entityB: EntityStats
): { updatedA: EntityStats; updatedB: EntityStats } {
  return updateRatings(entityA, entityB, 0.5);
}

/**
 * Simple monotone uncertainty shrink based on appearances.
 * Decays exponentially toward the floor.
 */
function shrinkUncertainty(currentUncertainty: number, newAppearances: number): number {
  const { uncertaintyFloor, uncertaintyDecayRate, initialUncertainty } = RATING_CONFIG;
  // Exponential decay from initial toward floor
  const decayed = uncertaintyFloor + (initialUncertainty - uncertaintyFloor) * Math.pow(uncertaintyDecayRate, newAppearances);
  return Math.max(uncertaintyFloor, Math.min(decayed, currentUncertainty));
}

/**
 * Create initial stats for a new entity.
 */
export function createInitialEntityStats(entityId: string): EntityStats {
  return {
    entityId,
    rating: RATING_CONFIG.initialRating,
    uncertainty: RATING_CONFIG.initialUncertainty,
    appearances: 0,
    wins: 0,
    losses: 0,
    ties: 0,
    updatedAt: new Date().toISOString(),
  };
}
