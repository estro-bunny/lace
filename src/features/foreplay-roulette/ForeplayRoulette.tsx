"use client";

import { useState, useCallback, useMemo } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";
import RouletteWheel from "@/components/ui/RouletteWheel";
import SparkleEffects from "@/components/ui/SparkleEffects";

interface ForeplayRouletteProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

const WHEEL_COLORS = [
  "#ff69b4", "#60a5fa", "#c084fc", "#ff6b6b",
  "#34d399", "#fbbf24", "#f472b6", "#818cf8",
  "#2dd4bf", "#fb923c", "#a78bfa", "#f87171",
];

export default function ForeplayRoulette({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: ForeplayRouletteProps) {
  const [currentCard, setCurrentCard] = useState<DeckCard | null>(null);
  const [spinCount, setSpinCount] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  const eligibleCards = getCardsWithinLimits(
    deck.cards.filter((c) => c.category !== "aftercare"),
    profiles,
    sharedHardLimits,
    sharedSoftLimits
  );

  const wheelSegments = useMemo(() => {
    const shuffled = [...eligibleCards].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, Math.min(12, shuffled.length)).map((c) => {
      const text = renderCardText(c.text, profiles);
      return text.length > 20 ? text.slice(0, 20) + "…" : text;
    });
  }, [eligibleCards, profiles]);

  const handleSpinComplete = useCallback(() => {
    const card = getRandomCard(eligibleCards);
    if (card) {
      setCurrentCard(card);
      setSpinCount((n) => n + 1);
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    }
    setIsSpinning(false);
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setSpinCount(0);
    setShowSparkles(false);
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="text-center">
        <p className="text-on-surface-variant text-sm">
          {spinCount > 0 ? (
            <span className="inline-flex items-center gap-1">
              🎰 Spins this round: <span className="text-chaos-pink font-bold">{spinCount}</span>
            </span>
          ) : (
            "Spin the wheel of pleasure 🎰"
          )}
        </p>
      </div>

      {/* Roulette Wheel */}
      <div className="relative flex justify-center">
        <SparkleEffects active={showSparkles} count={20} color="#ff69b4" />
        <RouletteWheel
          segments={wheelSegments}
          colors={WHEEL_COLORS}
          onSpinComplete={handleSpinComplete}
          isSpinning={isSpinning}
        />
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className={`rounded-xl min-w-[180px] ${isSpinning ? "opacity-50 cursor-not-allowed" : "animate-pulse-glow"}`}
          onClick={() => { if (!isSpinning) setIsSpinning(true); }}
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
        <CardRenderer
          card={{
            ...currentCard,
            text: renderCardText(currentCard.text, profiles),
          }}
        />
      )}

      {eligibleCards.length === 0 && (
        <p className="text-center text-on-surface-variant">
          No cards available with your current limits.
        </p>
      )}
    </div>
  );
}
