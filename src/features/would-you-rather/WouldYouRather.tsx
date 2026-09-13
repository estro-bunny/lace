"use client";

import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";

interface WouldYouRatherProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

export default function WouldYouRather({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: WouldYouRatherProps) {
  const [currentCard, setCurrentCard] = useState<DeckCard | null>(null);

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => c.category !== "aftercare"),
    profiles,
    sharedHardLimits,
    sharedSoftLimits
  );

  const draw = useCallback(() => {
    const card = getRandomCard(eligibleCards);
    if (card) setCurrentCard(card);
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
  }, []);

  const renderedText = currentCard
    ? renderCardText(currentCard.text, profiles)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="rounded-xl min-w-[180px]"
          onClick={draw}
          disabled={eligibleCards.length === 0}
        >
          {currentCard ? "ASK AGAIN" : "ASK"}
        </Button>
        {currentCard && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={reset}>
            RESET
          </Button>
        )}
      </div>

      {currentCard && renderedText && (
        <div className="animate-fade-in text-center space-y-6">
          <div className="glass-card rounded-2xl border border-outline-variant/20 p-8 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-4 block">
              Would you rather...
            </span>
            <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-snug">
              {renderedText}
            </p>
          </div>
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
