import { entityImageManifest } from "@/lib/data/entity-image-manifest";
import { photoBackedEntityIds } from "@/lib/data/photo-backed-slugs";
import type { Entity } from "@/lib/types";

const IMAGE_VARIANT: "illustration" | "photo-first" = "photo-first";
const downloadedPhotoAssets = new Set<string>(photoBackedEntityIds as readonly string[]);
const customPhotoPaths: Record<string, string> = {
  "you": "/images/entities-photo/you-awake.jpg",
  "you-asleep": "/images/entities-photo/you-asleep.jpg",
  "you-dreaming": "/images/entities-photo/you-dreaming.jpg",
  "you-very-drunk": "/images/entities-photo/you-intoxicated.jpg",
  "you-under-anesthesia": "/images/entities-photo/you-under-anesthesia.jpg",
  "humanoid-robot": "/images/entities-photo/humanoid-robot.webp",
  "meditating-monk": "/images/entities-photo/meditating-monk.webp",
  "salmon": "/images/entities-photo/salmon.webp"
};

function buildEntity(entity: Omit<Entity, "image_url" | "image_alt" | "image_source" | "image_credit" | "image_style">): Entity {
  const image = entityImageManifest[entity.id as keyof typeof entityImageManifest];
  const usePhoto = IMAGE_VARIANT === "photo-first" && downloadedPhotoAssets.has(entity.id);
  const photoPath = customPhotoPaths[entity.id] ?? `/images/entities-photo/${entity.id}.jpg`;

  return {
    ...entity,
    image_url: usePhoto ? photoPath : image.image_path,
    image_alt: image.alt,
    image_source: usePhoto ? "See lib/data/entity-asset-manifest.ts for source details" : image.source_reference,
    image_credit: usePhoto ? "Local sourced asset with recorded license metadata" : "Awareometer original local illustration set",
    image_style: usePhoto ? "curated_photo" : "curated_illustration"
  };
}

// Centralized content model for future backend seeding.
export const mockEntities: Entity[] = [
  buildEntity({ id: "you", slug: "you", label: "You", category: "human_states", is_active: true }),
  buildEntity({ id: "human", slug: "human", label: "A human", category: "human_states", is_active: true }),
  buildEntity({ id: "you-asleep", slug: "youAsleep", label: "An asleep human", category: "human_states", is_active: true }),
  buildEntity({ id: "you-dreaming", slug: "youDreaming", label: "A dreaming human", category: "human_states", is_active: true }),
  buildEntity({ id: "you-very-drunk", slug: "youVeryDrunk", label: "An intoxicated human", category: "human_states", is_active: true }),
  buildEntity({ id: "you-under-anesthesia", slug: "youUnderAnesthesia", label: "A human under anaesthesia", category: "human_states", is_active: true }),
  buildEntity({ id: "newborn-baby", slug: "newbornBaby", label: "A Newborn Baby", category: "human_states", is_active: true }),
  buildEntity({ id: "chimpanzee", slug: "chimpanzee", label: "A Chimpanzee", category: "animals", is_active: true }),
  buildEntity({ id: "crow", slug: "crow", label: "A Crow", category: "animals", is_active: true }),
  buildEntity({ id: "octopus", slug: "octopus", label: "An Octopus", category: "animals", is_active: true }),
  buildEntity({ id: "jellyfish", slug: "jellyfish", label: "A Jellyfish", category: "animals", is_active: true }),
  buildEntity({ id: "bee", slug: "bee", label: "A Bee", category: "animals", is_active: true }),
  buildEntity({ id: "ant-colony", slug: "antColony", label: "An Ant Colony", category: "animals", is_active: true }),
  buildEntity({ id: "oak-tree", slug: "oakTree", label: "An Oak Tree", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "venus-flytrap", slug: "venusFlytrap", label: "A Venus Flytrap", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "carrot", slug: "carrot", label: "A Carrot", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "mushroom", slug: "mushroom", label: "A Mushroom", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "slime-mold", slug: "slimeMold", label: "A Slime Mold", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "bacterium", slug: "bacterium", label: "A Bacterium", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "chatgpt", slug: "chatgpt", label: "ChatGPT", category: "machines_ai", is_active: true }),
  buildEntity({ id: "humanoid-robot", slug: "humanoidRobot", label: "A Humanoid Robot", category: "machines_ai", is_active: true }),
  buildEntity({ id: "corporation", slug: "corporation", label: "A Corporation", category: "collectives_systems", is_active: true }),
  buildEntity({ id: "city", slug: "city", label: "A City", category: "collectives_systems", is_active: true }),
  buildEntity({ id: "internet", slug: "internet", label: "The Internet", category: "collectives_systems", is_active: true }),
  buildEntity({ id: "coral-polyp", slug: "coralPolyp", label: "A Coral Polyp", category: "animals", is_active: true }),
  buildEntity({ id: "coral-reef", slug: "coralReef", label: "A Coral Reef", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "earth", slug: "earth", label: "The Earth", category: "planetary_cosmic", is_active: true }),
  buildEntity({ id: "universe", slug: "universe", label: "The Universe", category: "planetary_cosmic", is_active: true }),
  buildEntity({ id: "rock", slug: "rock", label: "A Rock", category: "planetary_cosmic", is_active: true }),
  buildEntity({ id: "dog", slug: "dog", label: "A Dog", category: "animals", is_active: true }),
  buildEntity({ id: "dolphin", slug: "dolphin", label: "A Dolphin", category: "animals", is_active: true }),
  buildEntity({ id: "elephant", slug: "elephant", label: "An Elephant", category: "animals", is_active: true }),
  buildEntity({ id: "blue-whale", slug: "blueWhale", label: "A Blue Whale", category: "animals", is_active: true }),
  buildEntity({ id: "goldfish", slug: "goldfish", label: "A Goldfish", category: "animals", is_active: true }),
  buildEntity({ id: "salmon", slug: "salmon", label: "A Salmon", category: "animals", is_active: true }),
  buildEntity({ id: "spider", slug: "spider", label: "A Spider", category: "animals", is_active: true }),
  buildEntity({ id: "fruit-fly", slug: "fruitFly", label: "A Fruit Fly", category: "animals", is_active: true }),
  buildEntity({ id: "fetus", slug: "fetus", label: "A Fetus (7 Months)", category: "human_states", is_active: true }),
  buildEntity({ id: "person-in-coma", slug: "personInComa", label: "A Person in a Coma", category: "human_states", is_active: true }),
  buildEntity({ id: "meditating-monk", slug: "meditatingMonk", label: "A Meditating Monk", category: "human_states", is_active: true }),
  buildEntity({ id: "thermostat", slug: "thermostat", label: "A Thermostat", category: "machines_ai", is_active: true }),
  buildEntity({ id: "self-driving-car", slug: "selfDrivingCar", label: "A Self-Driving Car", category: "machines_ai", is_active: true }),
  buildEntity({ id: "picasso", slug: "picasso", label: "Picasso", category: "named_humans", is_active: true }),
  buildEntity({ id: "marie-curie", slug: "marieCurie", label: "Marie Curie", category: "named_humans", is_active: true }),
  buildEntity({ id: "beehive", slug: "beehive", label: "A Beehive", category: "collectives_systems", is_active: true }),
  buildEntity({ id: "virus", slug: "virus", label: "A Virus", category: "plants_fungi_microbes", is_active: true }),
  buildEntity({ id: "smartphone", slug: "smartphone", label: "A Smartphone", category: "machines_ai", is_active: true }),
  buildEntity({ id: "black-hole", slug: "blackHole", label: "A Black Hole", category: "planetary_cosmic", is_active: true }),
  buildEntity({ id: "ecosystem", slug: "ecosystem", label: "A Forest Ecosystem", category: "collectives_systems", is_active: true })
];
