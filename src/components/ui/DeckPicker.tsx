"use client";

import type { DeckMeta } from "@/types/deck";

interface DeckPickerProps {
  decks: DeckMeta[];
  onSelect: (deckId: string) => void;
  selectedDeckId?: string;
}

const deckEmojis: Record<string, string> = {
  sapphic: "💜",
  "truth-or-dare": "🔥",
  "would-you-rather": "🤔",
  "foreplay-roulette": "🎯",
};

const deckColors: Record<string, string> = {
  sapphic: "from-chaos-pink/25 to-chaos-purple/15",
  "truth-or-dare": "from-error/20 to-chaos-pink/15",
  "would-you-rather": "from-chaos-blue/25 to-chaos-purple/15",
  "foreplay-roulette": "from-chaos-purple/20 to-chaos-blue/15",
};

export default function DeckPicker({ decks, onSelect, selectedDeckId }: DeckPickerProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant">
        <p>No decks available. Add a deck JSON file to /public/decks/.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {decks.map((deck, i) => (
        <button
          key={deck.id}
          onClick={() => onSelect(deck.id)}
          className={`animate-fade-in-up stagger-${Math.min(i + 1, 5)} group relative text-left transition-all duration-300 ${
            selectedDeckId === deck.id
              ? "scale-[1.02]"
              : "hover:scale-[1.01]"
          }`}
          style={{ animationFillMode: "both" }}
        >
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-chaos-pink/25 via-chaos-blue/15 to-chaos-purple/15 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

          <div className={`relative glass-card rounded-2xl border p-6 overflow-hidden ${
            selectedDeckId === deck.id
              ? "border-chaos-blue/40 bg-chaos-blue/5"
              : "border-outline-variant/20 group-hover:border-chaos-pink/30"
          }`}>
            <div className={`absolute inset-0 bg-gradient-to-br ${deckColors[deck.id] || "from-chaos-pink/15 to-chaos-blue/10"} opacity-40 group-hover:opacity-70 transition-opacity duration-400`} />

            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-headline font-bold text-on-surface">
                  {deck.name}
                </h3>
                <span className="text-2xl group-hover:scale-125 group-hover:animate-wiggle transition-transform duration-300">
                  {deckEmojis[deck.id] || "🃏"}
                </span>
              </div>

              <p className="text-sm text-on-surface-variant">
                {deck.cardCount} cards
              </p>

              <div className="flex flex-wrap gap-1.5 mt-3">
                {deck.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs bg-surface-container-high/80 text-on-surface-variant px-2 py-0.5 rounded-full border border-outline-variant/10 group-hover:border-chaos-pink/25 group-hover:text-chaos-pink transition-all duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
