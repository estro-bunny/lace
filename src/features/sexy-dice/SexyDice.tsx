"use client";

import { useCallback } from "react";
import Dice from "@/components/games/sexy-dice/Dice";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";
import { renderCardText } from "@/lib/text-renderer";
import { useDiceRoll } from "./useDiceRoll";
import { useGameBase } from "../game-base/use-game-base";
import type { Deck } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";

const ROLL_DURATION = 1500;

interface SexyDiceProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

export default function SexyDice({
  deck,
  profiles,
  sharedHardLimits,
  sharedSoftLimits,
}: SexyDiceProps) {
  const { currentCard, drawNextCard, resetGame } = useGameBase({
    deck,
    profiles,
    sharedHardLimits,
    sharedSoftLimits,
  });

  const { dice1, dice2, isRolling, hasRolled, roll, reset } = useDiceRoll();

  const handleRoll = useCallback(() => {
    roll();
    setTimeout(() => {
      drawNextCard();
    }, ROLL_DURATION + 100);
  }, [roll, drawNextCard]);

  const handleReset = useCallback(() => {
    reset();
    resetGame();
  }, [reset, resetGame]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center items-center gap-10 md:gap-16">
        <Dice value={dice1} isRolling={isRolling} label="Card Draw" />
        <span className="text-3xl animate-breathe">🎲</span>
        <Dice value={dice2} isRolling={isRolling} label="Intensity" />
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className={`rounded-xl min-w-[180px] ${isRolling ? "animate-dice-shake" : "animate-pulse-glow"}`}
          onClick={handleRoll}
          disabled={isRolling}
        >
          {isRolling ? "🎲 ROLLING..." : hasRolled ? "🔄 ROLL AGAIN" : "🎲 ROLL"}
        </Button>
        {hasRolled && !isRolling && (
          <Button variant="outline" size="lg" className="rounded-xl" onClick={handleReset}>
            RESET
          </Button>
        )}
      </div>

      {currentCard && !isRolling && (
        <div className="animate-celebration">
          <CardRenderer card={{ ...currentCard, text: renderCardText(currentCard.text, profiles) }} />
        </div>
      )}

      {isRolling && (
        <div className="text-center py-6">
          <p className="text-xl text-on-surface-variant animate-pulse">
            🎲 Rolling the dice... 🎲
          </p>
        </div>
      )}
    </div>
  );
}
