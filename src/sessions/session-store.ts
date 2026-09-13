import { create } from "zustand";
import type { Session, ConsentState } from "@/types/session";
import type { DeckCard } from "@/types/deck";
import { persistSession, loadSession, loadActiveSession } from "@/app/actions";

interface SessionStore {
  session: Session | null;
  loading: boolean;

  createSession: (session: Session) => Promise<void>;
  drawCard: (card: DeckCard) => Promise<void>;
  updateConsent: (state: ConsentState) => Promise<void>;
  triggerSafeword: (level: "slow-down" | "stop" | "emergency") => Promise<void>;
  pauseSession: () => Promise<void>;
  resumeSession: () => Promise<void>;
  endSession: () => Promise<void>;
  loadFromDb: (sessionId: string) => Promise<void>;
  loadActive: (relationshipId: string) => Promise<void>;
}

export const useSessionStore = create<SessionStore>((set, get) => ({
  session: null,
  loading: false,

  createSession: async (session) => {
    set({ session });
    await persistSession(session);
  },

  drawCard: async (card) => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      activeCard: card,
      activeCardIndex: prev.activeCardIndex + 1,
      drawnCards: [...prev.drawnCards, card.id],
      lastActivityAt: new Date().toISOString(),
      status: "active",
    };
    set({ session: next });
    await persistSession(next);
  },

  updateConsent: async (consentState) => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      consentState,
      lastActivityAt: new Date().toISOString(),
    };
    set({ session: next });
    await persistSession(next);
  },

  triggerSafeword: async (level) => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      safewordTriggered: true,
      safewordLevel: level,
      status: level === "emergency" ? "aftercare" : "paused",
      lastActivityAt: new Date().toISOString(),
    };
    set({ session: next });
    await persistSession(next);
  },

  pauseSession: async () => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      status: "paused",
      lastActivityAt: new Date().toISOString(),
    };
    set({ session: next });
    await persistSession(next);
  },

  resumeSession: async () => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      status: "active",
      lastActivityAt: new Date().toISOString(),
    };
    set({ session: next });
    await persistSession(next);
  },

  endSession: async () => {
    const prev = get().session;
    if (!prev) return;
    const next: Session = {
      ...prev,
      status: "ended",
      endedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    set({ session: next });
    await persistSession(next);
  },

  loadFromDb: async (sessionId) => {
    set({ loading: true });
    const session = await loadSession(sessionId);
    set({ session, loading: false });
  },

  loadActive: async (relationshipId) => {
    set({ loading: true });
    const session = await loadActiveSession(relationshipId);
    set({ session, loading: false });
  },
}));
