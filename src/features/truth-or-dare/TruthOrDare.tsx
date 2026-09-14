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
  const [drawKey, setDrawKey] = useState(0);

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
      setDrawKey((k) => k + 1);
    }
  }, [eligibleCards]);

  const reset = useCallback(() => {
    setCurrentCard(null);
    setDrawKey(0);
  }, []);

  const filterButtons = [
    { key: "all" as const, label: "All", color: "chaos-pink" },
    { key: "question" as const, label: "Truth", color: "chaos-blue" },
    { key: "action" as const, label: "Dare", color: "error" },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center gap-4">
        {filterButtons.map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => { setFilter(key); setCurrentCard(null); }}
            className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
              filter === key
                ? `bg-${color} text-white shadow-lg shadow-${color}/30 animate-pulse-glow`
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
            style={filter === key ? {
              backgroundColor: key === "all" ? "#ff69b4" : key === "question" ? "#60a5fa" : "#ff6b6b",
              boxShadow: key === "all"
                ? "0 4px 20px rgba(255,105,180,0.3)"
                : key === "question"
                ? "0 4px 20px rgba(96,165,250,0.3)"
                : "0 4px 20px rgba(255,107,107,0.3)"
            } : undefined}
          >
            {key === "question" ? "❓ " : key === "action" ? "🔥 " : "✨ "}
            {label}
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

      {currentCard && (
        <div key={drawKey} className="animate-fade-in">
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
