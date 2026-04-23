import Database from "better-sqlite3";
import path from "node:path";
import { createInitialEntityStats, type EntityStats } from "@/lib/ratings";
import { mockEntities } from "@/lib/data/entities";

const DB_PATH = process.env.DB_PATH ?? path.join(process.cwd(), "awareometer.db");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");

    // ── Raw comparison data (source of truth) ──────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS responses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        visitor_id TEXT NOT NULL,
        left_id TEXT NOT NULL,
        right_id TEXT NOT NULL,
        selected_id TEXT,
        skipped INTEGER NOT NULL DEFAULT 0,
        opened_modal INTEGER NOT NULL DEFAULT 0,
        response_time_ms INTEGER,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_responses_pair ON responses (left_id, right_id);
      CREATE INDEX IF NOT EXISTS idx_responses_visitor ON responses (visitor_id);
    `);

    // ── Online rating stats per entity ─────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS entity_stats (
        entity_id TEXT PRIMARY KEY,
        rating REAL NOT NULL DEFAULT 1500,
        uncertainty REAL NOT NULL DEFAULT 350,
        appearances INTEGER NOT NULL DEFAULT 0,
        wins INTEGER NOT NULL DEFAULT 0,
        losses INTEGER NOT NULL DEFAULT 0,
        ties INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // ── Pair-level exposure tracking ───────────────────────────────────
    db.exec(`
      CREATE TABLE IF NOT EXISTS pair_stats (
        pair_key TEXT PRIMARY KEY,
        left_id TEXT NOT NULL,
        right_id TEXT NOT NULL,
        exposure_count INTEGER NOT NULL DEFAULT 0,
        last_shown_at TEXT DEFAULT (datetime('now'))
      );
    `);

    // Migrate: add columns if missing (for existing DBs created before skip/modal)
    const cols = db.prepare("PRAGMA table_info(responses)").all() as { name: string }[];
    const colNames = new Set(cols.map((c) => c.name));
    if (!colNames.has("skipped")) {
      db.exec("ALTER TABLE responses ADD COLUMN skipped INTEGER NOT NULL DEFAULT 0");
    }
    if (!colNames.has("opened_modal")) {
      db.exec("ALTER TABLE responses ADD COLUMN opened_modal INTEGER NOT NULL DEFAULT 0");
    }
    if (!colNames.has("response_time_ms")) {
      db.exec("ALTER TABLE responses ADD COLUMN response_time_ms INTEGER");
    }

    // Seed entity_stats for any entities not yet present
    const insertEntityStat = db.prepare(
      `INSERT OR IGNORE INTO entity_stats (entity_id, rating, uncertainty, appearances, wins, losses, ties, updated_at)
       VALUES (?, ?, ?, 0, 0, 0, 0, datetime('now'))`
    );
    const seedTransaction = db.transaction(() => {
      for (const entity of mockEntities) {
        const initial = createInitialEntityStats(entity.id);
        insertEntityStat.run(entity.id, initial.rating, initial.uncertainty);
      }
    });
    seedTransaction();
  }
  return db;
}

// ── Raw response operations ────────────────────────────────────────────────

export function insertResponse(
  visitorId: string,
  leftId: string,
  rightId: string,
  selectedId: string | null,
  skipped: boolean = false,
  openedModal: boolean = false
) {
  const database = getDb();
  database
    .prepare("INSERT INTO responses (visitor_id, left_id, right_id, selected_id, skipped, opened_modal) VALUES (?, ?, ?, ?, ?, ?)")
    .run(visitorId, leftId, rightId, selectedId, skipped ? 1 : 0, openedModal ? 1 : 0);
}

export function getPairStats(leftId: string, rightId: string) {
  const database = getDb();
  const [sortedLeft, sortedRight] = [leftId, rightId].sort();

  const rows = database
    .prepare(
      `SELECT selected_id, COUNT(*) as count FROM responses
       WHERE ((left_id = ? AND right_id = ?) OR (left_id = ? AND right_id = ?))
         AND skipped = 0 AND selected_id IS NOT NULL
       GROUP BY selected_id`
    )
    .all(sortedLeft, sortedRight, sortedRight, sortedLeft) as { selected_id: string; count: number }[];

  let leftCount = 0;
  let rightCount = 0;

  for (const row of rows) {
    if (row.selected_id === leftId) leftCount = row.count;
    else if (row.selected_id === rightId) rightCount = row.count;
  }

  return { leftCount, rightCount, totalCount: leftCount + rightCount };
}

// ── Entity stats (Elo rating system) ───────────────────────────────────────

export function getEntityStats(entityId: string): EntityStats {
  const database = getDb();
  const row = database
    .prepare("SELECT * FROM entity_stats WHERE entity_id = ?")
    .get(entityId) as {
      entity_id: string;
      rating: number;
      uncertainty: number;
      appearances: number;
      wins: number;
      losses: number;
      ties: number;
      updated_at: string;
    } | undefined;

  if (!row) {
    const initial = createInitialEntityStats(entityId);
    database
      .prepare(
        `INSERT INTO entity_stats (entity_id, rating, uncertainty, appearances, wins, losses, ties, updated_at)
         VALUES (?, ?, ?, 0, 0, 0, 0, datetime('now'))`
      )
      .run(entityId, initial.rating, initial.uncertainty);
    return initial;
  }

  return {
    entityId: row.entity_id,
    rating: row.rating,
    uncertainty: row.uncertainty,
    appearances: row.appearances,
    wins: row.wins,
    losses: row.losses,
    ties: row.ties,
    updatedAt: row.updated_at,
  };
}

export function getAllEntityStats(): EntityStats[] {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM entity_stats")
    .all() as {
      entity_id: string;
      rating: number;
      uncertainty: number;
      appearances: number;
      wins: number;
      losses: number;
      ties: number;
      updated_at: string;
    }[];

  return rows.map((row) => ({
    entityId: row.entity_id,
    rating: row.rating,
    uncertainty: row.uncertainty,
    appearances: row.appearances,
    wins: row.wins,
    losses: row.losses,
    ties: row.ties,
    updatedAt: row.updated_at,
  }));
}

export function updateEntityStats(stats: EntityStats) {
  const database = getDb();
  database
    .prepare(
      `UPDATE entity_stats
       SET rating = ?, uncertainty = ?, appearances = ?, wins = ?, losses = ?, ties = ?, updated_at = ?
       WHERE entity_id = ?`
    )
    .run(stats.rating, stats.uncertainty, stats.appearances, stats.wins, stats.losses, stats.ties, stats.updatedAt, stats.entityId);
}

// ── Pair exposure tracking ─────────────────────────────────────────────────

function canonicalPairKey(a: string, b: string): string {
  return [a, b].sort().join("__");
}

export function incrementPairExposure(leftId: string, rightId: string) {
  const database = getDb();
  const key = canonicalPairKey(leftId, rightId);
  const [sortedLeft, sortedRight] = [leftId, rightId].sort();

  database
    .prepare(
      `INSERT INTO pair_stats (pair_key, left_id, right_id, exposure_count, last_shown_at)
       VALUES (?, ?, ?, 1, datetime('now'))
       ON CONFLICT(pair_key) DO UPDATE SET
         exposure_count = exposure_count + 1,
         last_shown_at = datetime('now')`
    )
    .run(key, sortedLeft, sortedRight);
}

export type PairExposure = {
  pairKey: string;
  leftId: string;
  rightId: string;
  exposureCount: number;
  lastShownAt: string;
};

export function getAllPairExposures(): Map<string, PairExposure> {
  const database = getDb();
  const rows = database
    .prepare("SELECT * FROM pair_stats")
    .all() as {
      pair_key: string;
      left_id: string;
      right_id: string;
      exposure_count: number;
      last_shown_at: string;
    }[];

  const map = new Map<string, PairExposure>();
  for (const row of rows) {
    map.set(row.pair_key, {
      pairKey: row.pair_key,
      leftId: row.left_id,
      rightId: row.right_id,
      exposureCount: row.exposure_count,
      lastShownAt: row.last_shown_at,
    });
  }
  return map;
}

// ── Visitor / session queries ──────────────────────────────────────────────

export function getVisitorSeenPairs(visitorId: string): string[] {
  const database = getDb();

  const rows = database
    .prepare(
      `SELECT DISTINCT
        CASE WHEN left_id < right_id THEN left_id || '__' || right_id
             ELSE right_id || '__' || left_id END as pair_key
      FROM responses
      WHERE visitor_id = ?`
    )
    .all(visitorId) as { pair_key: string }[];

  return rows.map((r) => r.pair_key);
}

export function getVisitorRecentPairs(visitorId: string, limit: number = 20): string[] {
  const database = getDb();

  const rows = database
    .prepare(
      `SELECT DISTINCT
        CASE WHEN left_id < right_id THEN left_id || '__' || right_id
             ELSE right_id || '__' || left_id END as pair_key
      FROM responses
      WHERE visitor_id = ?
      ORDER BY id DESC
      LIMIT ?`
    )
    .all(visitorId, limit) as { pair_key: string }[];

  return rows.map((r) => r.pair_key);
}

export function getVisitorSkipCount(visitorId: string): number {
  const database = getDb();
  const row = database
    .prepare("SELECT COUNT(*) as count FROM responses WHERE visitor_id = ? AND skipped = 1")
    .get(visitorId) as { count: number };
  return row.count;
}

export function getVisitorResponseCount(visitorId: string): number {
  const database = getDb();
  const row = database
    .prepare("SELECT COUNT(*) as count FROM responses WHERE visitor_id = ?")
    .get(visitorId) as { count: number };
  return row.count;
}

export function getVisitorCompletedCount(visitorId: string): number {
  const database = getDb();
  const row = database
    .prepare("SELECT COUNT(*) as count FROM responses WHERE visitor_id = ? AND skipped = 0 AND selected_id IS NOT NULL")
    .get(visitorId) as { count: number };
  return row.count;
}

export type VisitorResponse = {
  left_id: string;
  right_id: string;
  selected_id: string | null;
  skipped: number;
};

export function getVisitorResponses(visitorId: string): VisitorResponse[] {
  const database = getDb();
  return database
    .prepare("SELECT left_id, right_id, selected_id, skipped FROM responses WHERE visitor_id = ?")
    .all(visitorId) as VisitorResponse[];
}

export type CrowdPairResult = {
  left_id: string;
  right_id: string;
  selected_id: string;
  count: number;
};

export function getCrowdPairResults(): CrowdPairResult[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT left_id, right_id, selected_id, COUNT(*) as count
       FROM responses
       WHERE skipped = 0 AND selected_id IS NOT NULL
       GROUP BY left_id, right_id, selected_id`
    )
    .all() as CrowdPairResult[];
}

// ── Atomic comparison write ────────────────────────────────────────────────

/**
 * Atomically record a comparison: insert raw response, update entity stats,
 * and update pair exposure. Returns crowd stats for the pair.
 */
export function recordComparisonAtomic(
  visitorId: string,
  leftId: string,
  rightId: string,
  selectedId: string | null,
  skipped: boolean,
  openedModal: boolean,
  updatedWinner?: EntityStats,
  updatedLoser?: EntityStats,
  responseTimeMs: number | null = null
) {
  const database = getDb();

  const transaction = database.transaction(() => {
    // 1. Insert raw comparison row
    database
      .prepare("INSERT INTO responses (visitor_id, left_id, right_id, selected_id, skipped, opened_modal, response_time_ms) VALUES (?, ?, ?, ?, ?, ?, ?)")
      .run(visitorId, leftId, rightId, selectedId, skipped ? 1 : 0, openedModal ? 1 : 0, responseTimeMs);

    // 2. Update entity stats (only for non-skipped comparisons)
    if (!skipped && updatedWinner && updatedLoser) {
      const updateStmt = database.prepare(
        `UPDATE entity_stats
         SET rating = ?, uncertainty = ?, appearances = ?, wins = ?, losses = ?, ties = ?, updated_at = ?
         WHERE entity_id = ?`
      );
      updateStmt.run(updatedWinner.rating, updatedWinner.uncertainty, updatedWinner.appearances, updatedWinner.wins, updatedWinner.losses, updatedWinner.ties, updatedWinner.updatedAt, updatedWinner.entityId);
      updateStmt.run(updatedLoser.rating, updatedLoser.uncertainty, updatedLoser.appearances, updatedLoser.wins, updatedLoser.losses, updatedLoser.ties, updatedLoser.updatedAt, updatedLoser.entityId);
    }

    // 3. Update pair exposure
    const key = canonicalPairKey(leftId, rightId);
    const [sortedLeft, sortedRight] = [leftId, rightId].sort();
    database
      .prepare(
        `INSERT INTO pair_stats (pair_key, left_id, right_id, exposure_count, last_shown_at)
         VALUES (?, ?, ?, 1, datetime('now'))
         ON CONFLICT(pair_key) DO UPDATE SET
           exposure_count = exposure_count + 1,
           last_shown_at = datetime('now')`
      )
      .run(key, sortedLeft, sortedRight);
  });

  transaction();
}

// ── Legacy (keep for leaderboard if still used) ────────────────────────────

export function getLeaderboard() {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT entity_id, rating, appearances, wins, losses
       FROM entity_stats
       WHERE appearances > 0
       ORDER BY rating DESC`
    )
    .all() as { entity_id: string; rating: number; appearances: number; wins: number; losses: number }[];

  return rows.map((row) => ({
    entityId: row.entity_id,
    wins: row.wins,
    comparisons: row.appearances,
    winRate: row.appearances > 0 ? row.wins / row.appearances : 0
  }));
}
