export type EntityCategory =
  | "human_states"
  | "animals"
  | "plants_fungi_microbes"
  | "machines_ai"
  | "collectives_systems"
  | "planetary_cosmic"
  | "named_humans";

export type EntityImageStyle = "generated_editorial_placeholder" | "curated_photo" | "curated_illustration";

export type Entity = {
  id: string;
  slug: string;
  label: string;
  image_url: string;
  image_alt: string;
  image_source: string;
  image_credit: string;
  image_style: EntityImageStyle;
  category: EntityCategory;
  is_active: boolean;
};

export type EntityPair = {
  key: string;
  left: Entity;
  right: Entity;
};

export type ResponseRecord = {
  pairKey: string;
  leftId: string;
  rightId: string;
  selectedId: string | null;
  createdAt: string;
};

export type SessionState = {
  entities: Entity[];
  currentPair: EntityPair | null;
  responses: ResponseRecord[];
  seenPairKeys: string[];
  roundComparisons: number;
};
