import { useEffect } from "react";
import { HEAT, HUE, TIERS, type Tier } from "@/lib/types";

/**
 * Sets --accent, --thread-lit, and --heat on the document root from a
 * tier (0-3), optionally as a float so the ritual's rope-pull can ease
 * continuously between tiers rather than snapping.
 */
export function useAccent(tierFloat: number) {
  useEffect(() => {
    const t = Math.max(0, Math.min(3, Math.round(tierFloat))) as Tier;
    const name = TIERS[t];
    const c = HUE[name];
    const root = document.documentElement.style;
    root.setProperty("--accent", c);
    root.setProperty("--thread-lit", `color-mix(in srgb, ${c} 42%, transparent)`);
    root.setProperty("--heat", String(HEAT[name]));
  }, [tierFloat]);
}
