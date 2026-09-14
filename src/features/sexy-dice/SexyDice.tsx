"use client";

import { useCallback, useState } from "react";
import { motion, useAnimation } from "framer-motion";
import Button from "@/components/ui/Button";
import CardRenderer from "@/components/ui/CardRenderer";
import SparkleEffects from "@/components/ui/SparkleEffects";
import { renderCardText } from "@/lib/text-renderer";
import { useDiceRoll } from "./useDiceRoll";
import { useGameBase } from "../game-base/use-game-base";
import type { Deck } from "@/types/deck";
import type { PartnerProfile } from "@/types/profile";

const ROLL_DURATION = 1500;

const DOT_POSITIONS: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [[25, 25], [75, 75]],
  3: [[25, 25], [50, 50], [75, 75]],
  4: [[25, 25], [75, 25], [25, 75], [75, 75]],
  5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
  6: [[25, 25], [75, 25], [25, 50], [75, 50], [25, 75], [75, 75]],
};

interface SexyDiceProps {
  deck: Deck;
  profiles: PartnerProfile[];
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
}

function AnimatedDice({ value, isRolling, label }: { value: number | null; isRolling: boolean; label: string }) {
  const controls = useAnimation();
  const dots = value ? DOT_POSITIONS[value] : [];

  const rollAnimation = async () => {
    await controls.start({
      rotateX: [0, 360, 720],
      rotateY: [0, 360, 720],
      scale: [1, 1.15, 1],
      transition: { duration: 1.5, ease: "easeInOut" },
    });
  };

  const landAnimation = async () => {
    await controls.start({
      scale: [0.5, 1.2, 0.95, 1.05, 1],
      rotate: [0, -8, 8, -4, 0],
      transition: { duration: 0.6, ease: "easeOut" },
    });
  };

  useState(() => {
    if (isRolling) rollAnimation();
  });

  return (
    <div className="flex flex-col items-center gap-3">
      <span className="text-sm font-bold uppercase tracking-widest text-on-surface-variant">
        {label}
      </span>
      <motion.div
        animate={controls}
        className={`
          relative w-24 h-24 md:w-28 md:h-28 rounded-2xl cursor-pointer
          bg-gradient-to-br from-surface-container-high to-surface-container
          border ${isRolling ? "border-chaos-pink/60" : value ? "border-chaos-blue/40" : "border-outline-variant/40"}
          ${isRolling
            ? "shadow-[0_0_30px_rgba(255,105,180,0.4)]"
            : value
            ? "shadow-[0_0_25px_rgba(96,165,250,0.3)]"
            : "shadow-[0_0_20px_rgba(255,105,180,0.15)]"
          }
          flex items-center justify-center
          transition-colors duration-300
        `}
        whileHover={!isRolling ? { scale: 1.08, rotate: 5 } : undefined}
        whileTap={!isRolling ? { scale: 0.95 } : undefined}
      >
        <svg viewBox="0 0 100 100" className="w-16 h-16 md:w-20 md:h-20">
          {dots.map(([cx, cy], i) => (
            <motion.circle
              key={i}
              cx={cx}
              cy={cy}
              r="10"
              className={isRolling ? "fill-chaos-pink" : "fill-chaos-blue"}
              initial={value ? { scale: 0 } : undefined}
              animate={value ? { scale: 1 } : undefined}
              transition={{ delay: i * 0.05, type: "spring", stiffness: 300 }}
            />
          ))}
        </svg>
        {!value && !isRolling && (
          <span className="absolute text-3xl text-on-surface-variant/40 select-none animate-breathe">?</span>
        )}
      </motion.div>
      {value && !isRolling && (
        <motion.span
          className="text-2xl font-black font-headline text-chaos-blue"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          {value}
        </motion.span>
      )}
    </div>
  );
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
  const [showSparkles, setShowSparkles] = useState(false);
  const [diceKey, setDiceKey] = useState(0);

  const handleRoll = useCallback(() => {
    setShowSparkles(false);
    setDiceKey((k) => k + 1);
    roll();
    setTimeout(() => {
      drawNextCard();
      setShowSparkles(true);
      setTimeout(() => setShowSparkles(false), 2000);
    }, ROLL_DURATION + 100);
  }, [roll, drawNextCard]);

  const handleReset = useCallback(() => {
    reset();
    resetGame();
    setShowSparkles(false);
  }, [reset, resetGame]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-10">
      <div className="flex justify-center items-center gap-10 md:gap-16">
        <AnimatedDice value={dice1} isRolling={isRolling} label="Card Draw" />
        <motion.span
          className="text-3xl"
          animate={isRolling ? { rotate: 360, scale: [1, 1.3, 1] } : {}}
          transition={isRolling ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
        >
          🎲
        </motion.span>
        <AnimatedDice value={dice2} isRolling={isRolling} label="Intensity" />
      </div>

      <div className="flex justify-center gap-4">
        <Button
          size="lg"
          className={`rounded-xl min-w-[180px] ${isRolling ? "opacity-50 cursor-not-allowed" : "animate-pulse-glow"}`}
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

      <div className="relative">
        <SparkleEffects active={showSparkles} count={18} />
        {currentCard && !isRolling && (
          <motion.div
            key={diceKey}
            initial={{ scale: 0.5, opacity: 0, rotateY: -90 }}
            animate={{ scale: 1, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 12, delay: 0.2 }}
          >
            <CardRenderer
              card={{ ...currentCard, text: renderCardText(currentCard.text, profiles) }}
              showFlip={false}
            />
          </motion.div>
        )}
      </div>

      {isRolling && (
        <motion.div
          className="text-center py-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-xl text-on-surface-variant">
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            >
              🎲 Rolling the dice... 🎲
            </motion.span>
          </p>
        </motion.div>
      )}
    </div>
  );
}
