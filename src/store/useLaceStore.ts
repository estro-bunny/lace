import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AppMode, Card, DeckId, Profile, Tier } from "@/lib/types";

export type PassReason = "tonight" | "never" | "softer";

interface LaceState {
  profiles: Profile[];
  sharedTier: Tier;
  turn: 0 | 1;
  deckId: DeckId | null;
  sessionSkip: string[];
  extraHardTags: string[];
  mode: AppMode;
  /** cards dealt since this deck was opened — drives the cooldown nudge */
  dealt: number;
  /** cards dealt all session, across every deck — drives the knot */
  dealtTotal: number;
  houseRule: string;

  addProfile: (p: Omit<Profile, "id">) => void;
  clearProfiles: () => void;
  setCeiling: (profileIndex: 0 | 1, ceiling: Tier) => void;
  setSharedTier: (t: Tier) => void;
  toggleTurn: () => void;
  openDeck: (id: DeckId) => void;
  recordDeal: () => void;
  undoDeal: (prevTurn: 0 | 1) => void;
  applyPass: (card: Card, reason: PassReason) => void;
  enterAftercare: () => void;
  exitAftercare: () => void;
  setHouseRule: (s: string) => void;
  resetAll: () => void;
}

const initial = {
  profiles: [] as Profile[],
  sharedTier: 1 as Tier,
  turn: 0 as 0 | 1,
  deckId: null as DeckId | null,
  sessionSkip: [] as string[],
  extraHardTags: [] as string[],
  mode: "play" as AppMode,
  dealt: 0,
  dealtTotal: 0,
  houseRule: "",
};

export const useLaceStore = create<LaceState>()(
  persist(
    (set) => ({
      ...initial,

      addProfile: (p) =>
        set((s) => ({
          profiles: [...s.profiles, { ...p, id: `p${Date.now()}${Math.floor(Math.random() * 999)}` }],
        })),

      clearProfiles: () => set({ profiles: [] }),

      setCeiling: (profileIndex, ceiling) =>
        set((s) => ({
          profiles: s.profiles.map((p, i) => (i === profileIndex ? { ...p, ceiling } : p)),
        })),

      setSharedTier: (t) => set({ sharedTier: t }),

      toggleTurn: () => set((s) => ({ turn: s.turn === 0 ? 1 : 0 })),

      openDeck: (id) => set({ deckId: id, dealt: 0 }),

      recordDeal: () =>
        set((s) => ({
          turn: s.turn === 0 ? 1 : 0,
          dealt: s.dealt + 1,
          dealtTotal: s.dealtTotal + 1,
        })),

      undoDeal: (prevTurn) =>
        set((s) => ({
          turn: prevTurn,
          dealt: Math.max(0, s.dealt - 1),
          dealtTotal: Math.max(0, s.dealtTotal - 1),
        })),

      applyPass: (card, reason) => {
        if (reason === "never") {
          set((s) => ({ extraHardTags: [...s.extraHardTags, ...card.tags] }));
        } else if (reason === "tonight") {
          set((s) => ({ sessionSkip: [...s.sessionSkip, card.id] }));
        } else if (reason === "softer") {
          set((s) => ({ sharedTier: Math.max(0, s.sharedTier - 1) as Tier }));
        }
      },

      enterAftercare: () => set({ mode: "aftercare" }),
      exitAftercare: () => set({ mode: "play" }),

      setHouseRule: (houseRule) => set({ houseRule }),

      resetAll: () => {
        localStorage.removeItem("lace-store");
        set({ ...initial });
      },
    }),
    { name: "lace-store" },
  ),
);
