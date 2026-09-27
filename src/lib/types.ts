export type Tier = 0 | 1 | 2 | 3;
export const TIERS = ["gentle", "moderate", "steamy", "intense"] as const;
export type TierName = (typeof TIERS)[number];

export const TIER_OF: Record<TierName, Tier> = {
  gentle: 0,
  moderate: 1,
  steamy: 2,
  intense: 3,
};

/** Signature EstroBunny heat curve: powder blue → hot pink → soft violet → chaotic pink */
export const HUE: Record<TierName, string> = {
  gentle: "#5BC0EB",
  moderate: "#FF69B4",
  steamy: "#C79BFF",
  intense: "#FF4D9D",
};

export const HEAT: Record<TierName, number> = {
  gentle: 0.1,
  moderate: 0.26,
  steamy: 0.42,
  intense: 0.62,
};

export type Pronouns = "she/her" | "he/him" | "they/them" | "ze/zir" | "xe/xem";

export interface Profile {
  id: string;
  name: string;
  pronouns: Pronouns;
  hardLimits: string[];
  softLimits: string[];
  /** Personal intensity cap for cards dealt on this partner's turn, 0-3. Defaults to 3 (no extra cap). */
  ceiling: Tier;
}

export type CardCategory = "question" | "action" | "aftercare" | "challenge" | "permission";

export interface Card {
  id: string;
  category: CardCategory;
  intensity: TierName;
  text: string;
  tags: string[];
}

export type DeckId = "truth-or-dare" | "would-you-rather" | "sapphic" | "foreplay-roulette";

export interface DeckMeta {
  id: DeckId;
  name: string;
  emoji: string;
  accentVar: string;
  /** which game engine plays this deck */
  game: "tod" | "wyr" | "dice" | "roulette";
}

export type AppMode = "play" | "aftercare";
export type AppScreen = "onboard" | "home" | "ritual" | "decks" | "game";
