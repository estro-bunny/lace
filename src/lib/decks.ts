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
  { id: "truth-or-dare", name: "Truth or Dare", emoji: "🔥", accentVar: "rgba(255,77,157,.20)", game: "tod" },
  { id: "would-you-rather", name: "Would You Rather", emoji: "🤔", accentVar: "rgba(143,194,255,.20)", game: "wyr" },
  { id: "sapphic", name: "Sapphic Intimacy", emoji: "💜", accentVar: "rgba(199,155,255,.22)", game: "dice" },
  { id: "foreplay-roulette", name: "Foreplay Roulette", emoji: "🎯", accentVar: "rgba(255,176,32,.18)", game: "roulette" },
];
