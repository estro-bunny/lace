"use client";

import { useState, useEffect } from "react";
import type { DeckCard } from "@/types/deck";
import CardFlip from "./CardFlip";
import SparkleEffects from "./SparkleEffects";

interface CardRendererProps {
  card: DeckCard;
  className?: string;
  showFlip?: boolean;
}

const categoryLabels: Record<string, string> = {
  question: "Question",
  action: "Action",
  challenge: "Challenge",
  permission: "Permission",
  aftercare: "Aftercare",
};

const categoryIcons: Record<string, string> = {
  question: "❓",
  action: "🔥",
  challenge: "⚡",
  permission: "🔓",
  aftercare: "💜",
};

const intensityStyles: Record<string, string> = {
  gentle: "bg-chaos-blue/20 text-chaos-blue border-chaos-blue/30",
  moderate: "bg-chaos-pink/20 text-chaos-pink border-chaos-pink/30",
  steamy: "bg-chaos-purple/20 text-chaos-purple border-chaos-purple/30",
  intense: "bg-error/20 text-error border-error/30",
};

function CardContent({ card }: { card: DeckCard }) {
  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-chaos-pink/25 via-chaos-blue/15 to-chaos-purple/25 blur-sm opacity-70" />
      <div className="relative glass-card rounded-2xl border border-outline-variant/20 p-8 space-y-5 overflow-hidden min-h-[300px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-chaos-pink/15 to-transparent rounded-bl-full" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-chaos-blue/10 to-transparent rounded-tr-full" />

        <div className="flex items-center gap-3 relative z-10">
          <span className="text-lg">{categoryIcons[card.category] || "✨"}</span>
          <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${intensityStyles[card.intensity]}`}>
            {card.intensity}
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
            {categoryLabels[card.category]}
          </span>
        </div>

        <p className="text-2xl md:text-3xl font-headline font-bold text-on-surface leading-snug relative z-10">
          {card.text}
        </p>

        <div className="flex flex-wrap gap-2 pt-2 relative z-10">
          {card.tags.map((tag, i) => (
            <span
              key={tag}
              className={`text-xs bg-surface-container-high text-on-surface-variant px-3 py-1 rounded-full border border-outline-variant/10 hover:border-chaos-pink/40 hover:text-chaos-pink transition-all duration-200 hover:scale-105 stagger-${Math.min(i + 1, 5)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CardRenderer({ card, className = "", showFlip = true }: CardRendererProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    if (showFlip) {
      setIsFlipped(false);
      setShowSparkles(false);
      const flipTimer = setTimeout(() => setIsFlipped(true), 100);
      const sparkleTimer = setTimeout(() => setShowSparkles(true), 800);
      return () => {
        clearTimeout(flipTimer);
        clearTimeout(sparkleTimer);
      };
    }
  }, [card, showFlip]);

  if (!showFlip) {
    return (
      <div className={`${className}`}>
        <CardContent card={card} />
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <SparkleEffects active={showSparkles} count={16} />
      <CardFlip
        isFlipped={isFlipped}
        front={<CardContent card={card} />}
      />
    </div>
  );
}
