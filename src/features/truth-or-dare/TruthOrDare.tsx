"use client";

import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";

interface TruthOrDareProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

export default function TruthOrDare({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: TruthOrDareProps) {
  const [currentCard, setCurrentCard] = useState<DeckCard | null>(null);
  const [filter, setFilter] = useState<"all" | "question" | "action">("all");

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => {
      if (filter === "all") return c.category !== "aftercare";
      return c.category === filter;
    }),
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

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => { setFilter("all"); setCurrentCard(null); }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            filter === "all" ? "bg-primary text-on-primary" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          All
        </button>
        <button
          onClick={() => { setFilter("question"); setCurrentCard(null); }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            filter === "question" ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          Truth
        </button>
        <button
          onClick={() => { setFilter("action"); setCurrentCard(null); }}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-colors ${
            filter === "action" ? "bg-error text-on-error" : "bg-surface-container-high text-on-surface-variant"
          }`}
        >
          Dare
        </button>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="rounded-xl min-w-[180px]"
          onClick={draw}
          disabled={eligibleCards.length === 0}
        >
          {currentCard ? "DRAW AGAIN" : "DRAW"}
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
          No cards available for this filter with your current limits.
        </p>
      )}
    </div>
  );
}
