"use client";

import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";
import CardFlip from "@/components/ui/CardFlip";
import SparkleEffects from "@/components/ui/SparkleEffects";

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [cardKey, setCardKey] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => c.category !== "aftercare"),
    profiles,
    sharedHardLimits,
    sharedSoftLimits
  );

  const draw = useCallback(() => {
    setIsFlipped(false);
    setShowSparkles(false);
    const card = getRandomCard(eligibleCards);
    if (card) {
      setCurrentCard(card);
      setCardKey((k) => k + 1);
      setTimeout(() => setIsFlipped(true), 150);
      setTimeout(() => setShowSparkles(true), 900);
      setTimeout(() => setShowSparkles(false), 2500);
    }
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setIsFlipped(false);
    setCardKey(0);
    setShowSparkles(false);
  }, []);

  const renderedText = currentCard
    ? renderCardText(currentCard.text, profiles)
    : null;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="rounded-xl min-w-[180px] animate-pulse-glow"
          onClick={draw}
          disabled={eligibleCards.length === 0}
        >
          {currentCard ? "🤔 ASK AGAIN" : "🤔 ASK"}
        </Button>
        {currentCard && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={reset}>
            RESET
          </Button>
        )}
      </div>

      {currentCard && renderedText && (
        <div key={cardKey} className="relative">
          <SparkleEffects active={showSparkles} count={16} color="#c084fc" />
          <CardFlip
            isFlipped={isFlipped}
            front={
              <div className="relative w-full max-w-lg mx-auto">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-chaos-blue/25 via-chaos-pink/15 to-chaos-purple/25 blur-sm opacity-70" />
                <div className="relative glass-card rounded-2xl border border-chaos-purple/30 p-8 space-y-5 overflow-hidden min-h-[300px]">
                  <div className="absolute inset-0 bg-gradient-to-br from-chaos-blue/10 via-transparent to-chaos-purple/10 opacity-60" />
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-chaos-blue via-chaos-pink to-chaos-purple" />
                  <span className="text-xs font-bold uppercase tracking-widest text-chaos-blue block relative z-10">
                    ✨ Would you rather... ✨
                  </span>
                  <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-snug relative z-10">
                    {renderedText}
                  </p>
                </div>
              </div>
            }
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
