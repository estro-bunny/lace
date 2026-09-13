export type DeckId = string & { readonly __brand: unique symbol };
export type CardId = string & { readonly __brand: unique symbol };

export type CardCategory =
  | "question"
  | "action"
  | "challenge"
  | "permission"
  | "aftercare";

export type IntensityLevel = "gentle" | "moderate" | "steamy" | "intense";

export type GenderIdentity =
  | "woman"
  | "man"
  | "nonbinary"
  | "genderqueer"
  | "agender"
  | "bigender"
  | "two-spirit"
  | "questioning"
  | "other"
  | "prefer-not-to-say";

export type BodyConfiguration =
  | "any"
  | "has-penis"
  | "has-vulva"
  | "has-chest"
  | "has-breasts"
  | "has-any-genitalia"
  | "post-op"
  | "pre-op"
  | "non-op"
  | "hrt"
  | "other";

export interface DeckCard {
  id: CardId;
  category: CardCategory;
  intensity: IntensityLevel;
  text: string;
  bodyConfigurations: BodyConfiguration[];
  genderNeutral: boolean;
  requiresTwo: boolean;
  aftercare: boolean;
  tags: string[];
}

export interface Deck {
  id: DeckId;
  name: string;
  version: number;
  author: string;
  license: string;
  language: string;
  tags: string[];
  cardCount: number;
  createdAt: string;
  updatedAt: string;
  cards: DeckCard[];
}

export interface DeckMeta {
  id: DeckId;
  name: string;
  version: number;
  author: string;
  tags: string[];
  cardCount: number;
}

export interface DeckFilter {
  categories: CardCategory[];
  intensities: IntensityLevel[];
  bodyConfigurations: BodyConfiguration[];
  genderNeutralOnly: boolean;
  tags: string[];
}
