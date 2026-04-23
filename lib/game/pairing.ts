import type { Entity, EntityPair } from "@/lib/types";

const ONBOARDING_PAIR_IDS: [string, string][] = [
  ["chimpanzee", "rock"],
  ["bee", "chatgpt"]
];

function toPairKey(leftId: string, rightId: string) {
  return [leftId, rightId].sort().join("__");
}

export function buildPair(left: Entity, right: Entity): EntityPair {
  return {
    key: toPairKey(left.id, right.id),
    left,
    right
  };
}

export function getOnboardingPair(
  entities: Entity[],
  roundIndex: number
): EntityPair | null {
  if (roundIndex >= ONBOARDING_PAIR_IDS.length) {
    return null;
  }

  const [leftId, rightId] = ONBOARDING_PAIR_IDS[roundIndex];
  const left = entities.find((e) => e.id === leftId);
  const right = entities.find((e) => e.id === rightId);

  if (!left || !right) {
    return null;
  }

  return buildPair(left, right);
}

export const ONBOARDING_COUNT = ONBOARDING_PAIR_IDS.length;

export function getRandomPair(entities: Entity[], excludedPairKeys: string[] = []): EntityPair {
  const excluded = new Set(excludedPairKeys);
  const availablePairs: EntityPair[] = [];

  for (let leftIndex = 0; leftIndex < entities.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < entities.length; rightIndex += 1) {
      const pair = buildPair(entities[leftIndex], entities[rightIndex]);

      if (!excluded.has(pair.key)) {
        availablePairs.push(pair);
      }
    }
  }

  const candidatePool = availablePairs.length > 0 ? availablePairs : [];
  const fallbackPool =
    candidatePool.length > 0
      ? candidatePool
      : entities.flatMap((left, leftIndex) =>
          entities
            .slice(leftIndex + 1)
            .map((right) => buildPair(left, right))
        );

  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}
