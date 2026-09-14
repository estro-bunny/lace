"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import DeckPicker from "@/components/ui/DeckPicker";
import type { DeckMeta } from "@/types/deck";
import { listDecks } from "@/lib/engine/deck-loader";

export default function GamesPage() {
  const [decks, setDecks] = useState<DeckMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listDecks().then((d) => {
      setDecks(d);
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header className="px-8 py-6">
        <Logo size="sm" />
      </header>

      <main className="flex-1 px-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4 animate-fade-in-up">
            <h1 className="text-5xl font-headline font-black tracking-tight gradient-text">
              Choose a Deck
            </h1>
            <p className="text-on-surface-variant text-lg">
              Pick a card deck to play with. Cards are filtered through both partners&apos; limits. 🐰
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 text-on-surface-variant">
                <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span className="animate-pulse">Loading decks...</span>
              </div>
            </div>
          ) : (
            <DeckPicker
              decks={decks}
              onSelect={(id) => {
                window.location.href = `/games/${id}`;
              }}
            />
          )}

          <div className="text-center animate-fade-in stagger-4">
            <Link
              href="/"
              className="text-on-surface-variant hover:text-primary transition-colors text-sm"
            >
              Back to profiles
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
