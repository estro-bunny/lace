import { useState, useCallback, useRef } from "react";
import type { DeckCard } from "@/types/deck";

const ROLL_DURATION = 1500;
const TICK_INTERVAL = 100;

interface DiceRollState {
  dice1: number | null;
  dice2: number | null;
  isRolling: boolean;
  hasRolled: boolean;
}

export function useDiceRoll() {
  const [state, setState] = useState<DiceRollState>({
    dice1: null,
    dice2: null,
    isRolling: false,
    hasRolled: false,
  });

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const roll = useCallback(() => {
    if (state.isRolling) return;

    setState((prev) => ({
      ...prev,
      isRolling: true,
    }));

    intervalRef.current = setInterval(() => {
      setState((prev) => ({
        ...prev,
        dice1: Math.floor(Math.random() * 6) + 1,
        dice2: Math.floor(Math.random() * 6) + 1,
      }));
    }, TICK_INTERVAL);

    timeoutRef.current = setTimeout(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);

      const final1 = Math.floor(Math.random() * 6) + 1;
      const final2 = Math.floor(Math.random() * 6) + 1;

      setState({
        dice1: final1,
        dice2: final2,
        isRolling: false,
        hasRolled: true,
      });
    }, ROLL_DURATION);
  }, [state.isRolling]);

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setState({
      dice1: null,
      dice2: null,
      isRolling: false,
      hasRolled: false,
    });
  }, []);

  return { ...state, roll, reset };
}
