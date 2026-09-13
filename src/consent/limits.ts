import type { DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";

export type LimitCheckResult = "allowed" | "soft-limit" | "denied";

export function checkLimits(
  card: DeckCard,
  profiles: PartnerProfile[],
  sharedHardLimits: string[],
  sharedSoftLimits: string[]
): LimitCheckResult {
  const cardTags = card.tags.map((t) => t.toLowerCase());

  for (const limit of sharedHardLimits) {
    if (cardTags.includes(limit.toLowerCase())) return "denied";
  }

  for (const limit of sharedSoftLimits) {
    if (cardTags.includes(limit.toLowerCase())) return "soft-limit";
  }

  for (const profile of profiles) {
    for (const limit of profile.hardLimits) {
      if (cardTags.includes(limit.toLowerCase())) return "denied";
    }
  }

  return "allowed";
}

export function getCardsWithinLimits(
  cards: DeckCard[],
  profiles: PartnerProfile[],
  sharedHardLimits: string[],
  sharedSoftLimits: string[]
): DeckCard[] {
  return cards.filter((card) => {
    const result = checkLimits(card, profiles, sharedHardLimits, sharedSoftLimits);
    return result !== "denied";
  });
}
