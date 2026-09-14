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
  const [isSpinning, setIsSpinning] = useState(false);
  const [drawKey, setDrawKey] = useState(0);

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => c.category !== "aftercare"),
    profiles,
    sharedHardLimits,
    sharedSoftLimits
  );

  const spin = useCallback(() => {
    if (isSpinning) return;
    setIsSpinning(true);

    setTimeout(() => {
      const card = getRandomCard(eligibleCards);
      if (card) {
        setCurrentCard(card);
        setSpinCount((n) => n + 1);
        setDrawKey((k) => k + 1);
      }
      setIsSpinning(false);
    }, 800);
  }, [eligibleCards, isSpinning]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setSpinCount(0);
    setDrawKey(0);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <p className="text-on-surface-variant text-sm">
          {spinCount > 0 ? (
            <span className="animate-bounce-in inline-block">
              🎰 Spins this round: <span className="text-chaos-pink font-bold">{spinCount}</span>
            </span>
          ) : (
            "Spin the wheel of pleasure 🎰"
          )}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className={`rounded-xl min-w-[180px] ${isSpinning ? "animate-roulette-spin" : "animate-pulse-glow"}`}
          onClick={spin}
          disabled={eligibleCards.length === 0 || isSpinning}
        >
          {isSpinning ? "🎰 SPINNING..." : currentCard ? "🔄 SPIN AGAIN" : "🎰 SPIN"}
        </Button>
        {currentCard && !isSpinning && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={reset}>
            RESET
          </Button>
        )}
      </div>

      {currentCard && !isSpinning && (
        <div key={drawKey} className="animate-spin-in">
          <CardRenderer
            card={{
              ...currentCard,
              text: renderCardText(currentCard.text, profiles),
            }}
          />
        </div>
      )}

      {isSpinning && (
        <div className="text-center py-6">
          <p className="text-xl text-on-surface-variant animate-pulse">
            🎰 Rolling the wheel... 🎰
          </p>
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
