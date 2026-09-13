import type { Deck, DeckMeta, DeckFilter, DeckCard, CardId, DeckId } from "@/types/deck";
import { validateDeck } from "./deck-validator";

export async function loadDeck(deckId: string): Promise<Deck | null> {
  try {
    const response = await fetch(`/decks/${deckId}.json`);
    if (!response.ok) return null;
    const data = await response.json();
    const validated = validateDeck(data);
    if (!validated) return null;
    return validated as unknown as Deck;
  } catch {
    return null;
  }
}

export async function listDecks(): Promise<DeckMeta[]> {
  try {
    const manifest = await fetch("/decks/manifest.json");
    if (!manifest.ok) return [];
    return manifest.json();
  } catch {
    return [];
  }
}

export function filterCards(cards: DeckCard[], filter: DeckFilter): DeckCard[] {
  return cards.filter((card) => {
    if (filter.categories.length > 0 && !filter.categories.includes(card.category)) return false;
    if (filter.intensities.length > 0 && !filter.intensities.includes(card.intensity)) return false;
    if (filter.genderNeutralOnly && !card.genderNeutral) return false;
    if (filter.tags.length > 0 && !filter.tags.some((t) => card.tags.includes(t))) return false;
    if (
      filter.bodyConfigurations.length > 0 &&
      !filter.bodyConfigurations.some(
        (b) => card.bodyConfigurations.includes(b) || card.bodyConfigurations.includes("any")
      )
    )
      return false;
    return true;
  });
}

export function getRandomCard(cards: DeckCard[], exclude: CardId[] = []): DeckCard | null {
  const available = cards.filter((c) => !exclude.includes(c.id as CardId));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}
