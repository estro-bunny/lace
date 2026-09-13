import type { DeckId, DeckCard, CardId } from "./deck";
import type { ProfileId } from "./profile";
import type { RelationshipId } from "./relationship";

export type SessionId = string & { readonly __brand: unique symbol };
export type SessionStatus = "setup" | "active" | "paused" | "aftercare" | "ended";

export interface Session {
  id: SessionId;
  relationshipId: RelationshipId;
  deckId: DeckId;
  participants: ProfileId[];
  status: SessionStatus;
  activeCard: DeckCard | null;
  activeCardIndex: number;
  drawnCards: CardId[];
  safewordTriggered: boolean;
  safewordLevel: "none" | "slow-down" | "stop" | "emergency" | null;
  consentState: ConsentState;
  startedAt: string;
  endedAt: string | null;
  lastActivityAt: string;
}

export interface ConsentState {
  partnerA: boolean;
  partnerB: boolean;
  currentActivity: string | null;
  explicitConsentGiven: boolean;
}
