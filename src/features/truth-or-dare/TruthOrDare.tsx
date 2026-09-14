"use client";

import { useState, useCallback } from "react";
import type { Deck, DeckCard } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";
import { getRandomCard } from "@/lib/engine/deck-loader";
import { getCardsWithinLimits } from "@/consent/limits";
import { renderCardText } from "@/lib/text-renderer";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";
import SparkleEffects from "@/components/ui/SparkleEffects";

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
  const [cardKey, setCardKey] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

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
    if (card) {
      setCurrentCard(card);
      setCardKey((k) => k + 1);
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 1500);
    }
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setCardKey(0);
    setShowSparkles(false);
  }, []);

  const filterButtons = [
    { key: "all" as const, label: "All", emoji: "✨", color: "#ff69b4" },
    { key: "question" as const, label: "Truth", emoji: "❓", color: "#60a5fa" },
    { key: "action" as const, label: "Dare", emoji: "🔥", color: "#ff6b6b" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center gap-4">
        {filterButtons.map(({ key, label, emoji, color }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setCurrentCard(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              filter === key
                ? "text-white shadow-lg"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            style={filter === key ? {
              backgroundColor: color,
              boxShadow: `0 4px 20px ${color}50`,
            } : undefined}
          >
            {emoji} {label}
          </button>
        ))}
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className="rounded-xl min-w-[180px] animate-pulse-glow"
          onClick={draw}
          disabled={eligibleCards.length === 0}
        >
          {currentCard ? "🔄 DRAW AGAIN" : "🎴 DRAW"}
        </Button>
        {currentCard && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={reset}>
            RESET
          </Button>
        )}
      </div>

      <div className="relative">
        <SparkleEffects active={showSparkles} count={14} />
        {currentCard && (
          <CardRenderer
            key={cardKey}
            card={{
              ...currentCard,
              text: renderCardText(currentCard.text, profiles),
            }}
          />
        )}
      </div>

      {eligibleCards.length === 0 && (
        <p className="text-center text-on-surface-variant">
          No cards available for this filter with your current limits.
        </p>
      )}
    </div>
  );
}
