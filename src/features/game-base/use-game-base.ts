import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { filterCards, getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { useSessionStore } from "@/sessions/session-store";

interface UseGameBaseOptions {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

export function useGameBase({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: UseGameBaseOptions) {
  const { session, drawCard } = useSessionStore();
  const [currentCard, setCurrentCard] = useState<DeckCard | null>(null);

  const eligibleCards = filterCards(
    getCardsWithinLimits(deck.cards, profiles, sharedHardLimits, sharedSoftLimits),
    {
      categories: [],
      intensities: [],
      bodyConfigurations: profiles.flatMap((p) => p.bodyConfigurations),
      genderNeutralOnly: false,
      tags: [],
    }
  );

  const drawNextCard = useCallback(() => {
    const drawn = session?.drawnCards ?? [];
    const card = getRandomCard(eligibleCards, drawn as ReturnType<typeof crypto.randomUUID> extends string ? never : never);
    if (card) {
      setCurrentCard(card);
      drawCard(card);
    }
  }, [eligibleCards, session?.drawnCards, drawCard]);

  const resetGame = useCallback(() => {
    setCurrentCard(null);
  }, []);

  return {
    currentCard,
    eligibleCards,
    drawnCount: session?.drawnCards.length ?? 0,
    drawNextCard,
    resetGame,
  };
}
