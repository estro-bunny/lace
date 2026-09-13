import type { DeckCard } from "@/types/deck";

const DEFAULT_AFTERCARE_PROMPTS = [
  "Hold each other quietly for a moment.",
  "Tell your partner one thing you appreciated about what just happened.",
  "Drink water together.",
  "Check in: how are you feeling right now?",
  "Wrap up in a blanket together.",
];

export function getAftercarePrompts(cards: DeckCard[], maxCount: number = 3): string[] {
  const aftercareCards = cards
    .filter((c) => c.aftercare || c.category === "aftercare")
    .map((c) => c.text);

  const prompts = [...aftercareCards, ...DEFAULT_AFTERCARE_PROMPTS];
  const unique = [...new Set(prompts)];
  return unique.slice(0, maxCount);
}

export function isAftercareNeeded(
  sessionDurationMinutes: number,
  intensityReached: string,
  safewordTriggered: boolean
): boolean {
  if (safewordTriggered) return true;
  if (intensityReached === "intense") return true;
  if (sessionDurationMinutes > 45) return true;
  return false;
}
