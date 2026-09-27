import type { Card, DeckId, Profile, Tier } from "./types";
import { TIER_OF } from "./types";
import { DECKS } from "./decks";

export interface ConsentContext {
  profiles: Profile[];
  /** Shared session ceiling set by the ribbon or the ritual, 0-3. */
  sharedTier: Tier;
  /** Extra hard-limit tags added this session via "not ever" passes. */
  extraHardTags: string[];
  /** Card ids skipped this session via "not tonight" passes. */
  sessionSkip: string[];
}

export function hardTagSet(ctx: ConsentContext): Set<string> {
  const s = new Set(ctx.extraHardTags.map((t) => t.toLowerCase()));
  ctx.profiles.forEach((p) => p.hardLimits.forEach((t) => s.add(t.toLowerCase())));
  return s;
}

export function softTagSet(ctx: ConsentContext): Set<string> {
  const s = new Set<string>();
  ctx.profiles.forEach((p) => p.softLimits.forEach((t) => s.add(t.toLowerCase())));
  return s;
}

/**
 * The effective ceiling for a round is the lowest of: the shared session
 * tier, and either partner's personal ceiling. A personal ceiling is a
 * real cap — it can only ever pull the ceiling down, never up, regardless
 * of whose turn it is. This is a deliberate choice: both partners live
 * through every card, so both partners' caps apply on every turn.
 */
export function effectiveCeiling(ctx: ConsentContext): Tier {
  let t = ctx.sharedTier;
  ctx.profiles.forEach((p) => {
    if (p.ceiling < t) t = p.ceiling;
  });
  return t;
}

export function softBadge(card: Card, ctx: ConsentContext): boolean {
  const soft = softTagSet(ctx);
  return card.tags.some((t) => soft.has(t.toLowerCase()));
}

export interface EligibleOptions {
  categories?: Card["category"][];
  /** Override the computed ceiling (used by the dice game's own tier gate). */
  tierOverride?: Tier;
}

export interface EligibleResult {
  /** Every card that passes the hard-limit and intensity filter, ignoring session skips. */
  pool: Card[];
  /** Pool minus cards skipped this session — falls back to the full pool once exhausted. */
  available: Card[];
}

export function eligiblePool(deckId: DeckId, ctx: ConsentContext, opts: EligibleOptions = {}): EligibleResult {
  const cards = DECKS[deckId].filter((c) => c.category !== "aftercare");
  const hard = hardTagSet(ctx);
  const maxTier = opts.tierOverride ?? effectiveCeiling(ctx);
  const skip = new Set(ctx.sessionSkip);

  let pool = cards.filter(
    (c) => TIER_OF[c.intensity] <= maxTier && !c.tags.some((t) => hard.has(t.toLowerCase())),
  );
  if (opts.categories) pool = pool.filter((c) => opts.categories!.includes(c.category));

  let available = pool.filter((c) => !skip.has(c.id));
  if (!available.length && pool.length) available = pool.slice(); // session exhausted: recycle

  return { pool, available };
}

export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
