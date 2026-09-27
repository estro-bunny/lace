import { useEffect, useRef } from "react";
import { HEAT, HUE, TIERS, type Tier } from "@/lib/types";

const SURGE_MS = 520;

/**
 * Sets --accent, --thread-lit, and --heat on the document root from a
 * tier (0-3), optionally as a float so the ritual's rope-pull can ease
 * continuously between tiers rather than snapping.
 *
 * When the rounded tier *increases*, fires a one-shot `heat-surge` class
 * on <html> so the lace bloom / lattice can flash without fighting the
 * continuous ambient loops.
 */
export function useAccent(tierFloat: number) {
  const prevTier = useRef<Tier | null>(null);
  const surgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const t = Math.max(0, Math.min(3, Math.round(tierFloat))) as Tier;
    const name = TIERS[t];
    const c = HUE[name];
    const root = document.documentElement;
    const style = root.style;

    style.setProperty("--accent", c);
    style.setProperty("--thread-lit", `color-mix(in srgb, ${c} 42%, transparent)`);
    style.setProperty("--heat", String(HEAT[name]));

    const prev = prevTier.current;
    prevTier.current = t;

    // Only surge on a real climb (not first paint, not stepping down)
    if (prev === null || t <= prev) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    root.classList.remove("heat-surge");
    // Force reflow so re-adding the class restarts the animation
    void root.offsetWidth;
    root.classList.add("heat-surge");

    if (surgeTimer.current) clearTimeout(surgeTimer.current);
    surgeTimer.current = setTimeout(() => {
      root.classList.remove("heat-surge");
      surgeTimer.current = null;
    }, SURGE_MS);

    return () => {
      if (surgeTimer.current) clearTimeout(surgeTimer.current);
    };
  }, [tierFloat]);
}
