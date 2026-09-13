"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Logo from "@/components/ui/Logo";
import SexyDice from "@/features/sexy-dice/SexyDice";
import TruthOrDare from "@/features/truth-or-dare/TruthOrDare";
import WouldYouRather from "@/features/would-you-rather/WouldYouRather";
import ForeplayRoulette from "@/features/foreplay-roulette/ForeplayRoulette";
import { loadDeck } from "@/lib/engine/deck-loader";
import { getProfiles } from "../../actions";
import type { Deck } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";

const GAME_COMPONENTS: Record<string, React.ComponentType<{
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}>> = {
  sapphic: SexyDice,
  "truth-or-dare": TruthOrDare,
  "would-you-rather": WouldYouRather,
  "foreplay-roulette": ForeplayRoulette,
};

export default function GamePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [deck, setDeck] = useState<Deck | null>(null);
  const [profiles, setProfiles] = useState<PartnerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([loadDeck(slug), getProfiles()])
      .then(([loadedDeck, loadedProfiles]) => {
        if (!loadedDeck) {
          setError("Deck not found");
        } else if (loadedProfiles.length < 2) {
          setError("Create both partner profiles first");
        } else {
          setDeck(loadedDeck);
          setProfiles(loadedProfiles);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError("Could not load data. Is PostgreSQL running?");
        setLoading(false);
        console.error(err);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center relative z-10">
        <div className="inline-flex items-center gap-3 text-on-surface-variant">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="animate-pulse">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !deck) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 relative z-10">
        <p className="text-error animate-fade-in">{error || "Something went wrong"}</p>
        <Link href="/games" className="text-secondary hover:underline animate-fade-in stagger-1">
          Back to games
        </Link>
      </div>
    );
  }

  const sharedHardLimits = [
    ...profiles[0].hardLimits,
    ...profiles[1].hardLimits,
  ];
  const sharedSoftLimits = [
    ...profiles[0].softLimits,
    ...profiles[1].softLimits,
  ];

  const GameComponent = GAME_COMPONENTS[slug] ?? SexyDice;

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <header className="px-8 py-6 flex items-center justify-between">
        <Logo size="sm" />
        <Link
          href="/games"
          className="text-on-surface-variant hover:text-primary transition-colors text-sm"
        >
          Change deck
        </Link>
      </header>

      <main className="flex-1 px-8 pb-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4 animate-fade-in-up">
            <h1 className="text-4xl md:text-5xl font-headline font-black tracking-tight gradient-text">
              {deck.name}
            </h1>
            <p className="text-on-surface-variant">
              {deck.cards.length} cards &middot; Filtered through your limits
            </p>
          </div>

          <GameComponent
            deck={deck}
            profiles={profiles}
            sharedHardLimits={sharedHardLimits}
            sharedSoftLimits={sharedSoftLimits}
          />
        </div>
      </main>
    </div>
  );
}
