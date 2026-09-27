import raw from "./decks.json";
import type { Card, DeckId, DeckMeta } from "./types";

/**
 * Real card content, ported from the original Lace prototype's
 * public/decks/*.json files. Aftercare cards are deduped into their own
 * bucket since the same handful repeat near-verbatim across decks.
 */
export const DECKS: Record<DeckId, Card[]> = {
  "truth-or-dare": raw["truth-or-dare"] as Card[],
  "would-you-rather": raw["would-you-rather"] as Card[],
  sapphic: raw["sapphic"] as Card[],
  "foreplay-roulette": raw["foreplay-roulette"] as Card[],
};

export const AFTERCARE_CARDS: Card[] = raw["__aftercare"] as Card[];

export const DECK_META: DeckMeta[] = [
  { id: "truth-or-dare", name: "Truth or Dare", emoji: "🔥", accentVar: "rgba(255,105,180,.22)", game: "tod" },
  { id: "would-you-rather", name: "Would You Rather", emoji: "🤔", accentVar: "rgba(91,192,235,.22)", game: "wyr" },
  { id: "sapphic", name: "Sapphic Intimacy", emoji: "💜", accentVar: "rgba(199,155,255,.24)", game: "dice" },
  { id: "foreplay-roulette", name: "Foreplay Roulette", emoji: "🎯", accentVar: "rgba(255,176,32,.20)", game: "roulette" },
];
