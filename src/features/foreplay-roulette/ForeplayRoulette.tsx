"use client";

import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";

interface ForeplayRouletteProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

export default function ForeplayRoulette({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: ForeplayRouletteProps) {
  const [currentCard, setCurrentCard] = useState<DeckCard | null>(null);
  const [spinCount, setSpinCount] = useState(0);

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => c.category !== "aftercare"),
    profiles,
    sharedHardLimits,
    sharedSoftLimits
  );

  const spin = useCallback(() => {
    const card = getRandomCard(eligibleCards);
    if (card) {
      setCurrentCard(card);
      setSpinCount((n) => n + 1);
    }
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setSpinCount(0);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <p className="text-on-surface-variant text-sm">
          {spinCount > 0 ? `Spins this round: ${spinCount}` : "Spin the wheel of pleasure"}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="rounded-xl min-w-[180px]"
          onClick={spin}
          disabled={eligibleCards.length === 0}
        >
          {currentCard ? "SPIN AGAIN" : "SPIN"}
        </Button>
        {currentCard && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={reset}>
            RESET
          </Button>
        )}
      </div>

      {currentCard && (
        <div className="animate-fade-in">
          <CardRenderer
            card={{
              ...currentCard,
              text: renderCardText(currentCard.text, profiles),
            }}
          />
        </div>
      )}

      {eligibleCards.length === 0 && (
        <p className="text-center text-on-surface-variant">
          No cards available with your current limits.
        </p>
      )}
    </div>
  );
}
