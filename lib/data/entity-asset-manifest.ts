import downloadedPhotoMetadata from "@/lib/data/downloaded-photo-metadata.json";
import { entityImageManifest } from "@/lib/data/entity-image-manifest";
import manualPhotoMetadata from "@/lib/data/manual-photo-metadata.json";
import { photoBackedEntityIds } from "@/lib/data/photo-backed-slugs";

type EntityAssetRecord = {
  slug: string;
  label: string;
  localImagePath: string;
  altText: string;
  sourcePageUrl: string | null;
  directFileUrl: string | null;
  license: string;
  attribution: string;
  notes?: string;
};

const photoBackedSet = new Set<string>(photoBackedEntityIds as readonly string[]);
const photoMetadataBySlug = new Map([...downloadedPhotoMetadata, ...manualPhotoMetadata].map((entry) => [entry.slug, entry]));

const labels: Record<string, string> = {
  "you": "You",
  "human": "A human",
  "you-asleep": "An asleep human",
  "you-dreaming": "A dreaming human",
  "you-very-drunk": "An intoxicated human",
  "you-under-anesthesia": "A human under anaesthesia",
  "newborn-baby": "A Newborn Baby",
  "chimpanzee": "A Chimpanzee",
  "crow": "A Crow",
  "octopus": "An Octopus",
  "jellyfish": "A Jellyfish",
  "bee": "A Bee",
  "ant-colony": "An Ant Colony",
  "oak-tree": "An Oak Tree",
  "venus-flytrap": "A Venus Flytrap",
  "carrot": "A Carrot",
  "mushroom": "A Mushroom",
  "slime-mold": "A Slime Mold",
  "bacterium": "A Bacterium",
  "chatgpt": "ChatGPT",
  "humanoid-robot": "A Humanoid Robot",
  "corporation": "A Corporation",
  "city": "A City",
  "internet": "The Internet",
  "coral-polyp": "A Coral Polyp",
  "coral-reef": "A Coral Reef",
  "earth": "The Earth",
  "universe": "The Universe",
  "rock": "A Rock"
};

export const entityAssetManifest: EntityAssetRecord[] = Object.entries(labels).map(([slug, label]) => {
  if (photoBackedSet.has(slug)) {
    const photo = photoMetadataBySlug.get(slug);

    if (!photo) {
      throw new Error(`Missing photo metadata for ${slug}`);
    }

    return {
      slug,
      label,
      localImagePath: photo.localImagePath,
      altText: entityImageManifest[slug as keyof typeof entityImageManifest].alt,
      sourcePageUrl: photo.sourcePageUrl,
      directFileUrl: photo.directFileUrl,
      license: photo.license,
      attribution: photo.attribution,
      notes: "Local copyrighted-safe photo downloaded from Wikimedia Commons."
    };
  }

  const fallback = entityImageManifest[slug as keyof typeof entityImageManifest] as {
    image_path: string;
    alt: string;
    source_reference: string;
    notes?: string;
  };

  return {
    slug,
    label,
    localImagePath: fallback.image_path,
    altText: fallback.alt,
    sourcePageUrl: null,
    directFileUrl: null,
    license: "Original in-project illustration",
    attribution: "Awareometer project",
    notes: fallback.notes ?? "Fallback illustration kept because a stronger copyright-safe sourced image has not yet been selected."
  };
});
