import type { ConsentState } from "@/types/session";
import type { PartnerProfile } from "@/types/profile";
import type { DeckCard } from "@/types/deck";
import { checkLimits } from "./limits";

export type ConsentDecision = "allowed" | "requires-discussion" | "denied";

export function evaluateConsent(
  card: DeckCard,
  profiles: PartnerProfile[],
  consentState: ConsentState,
  sharedHardLimits: string[],
  sharedSoftLimits: string[]
): ConsentDecision {
  if (!consentState.explicitConsentGiven) return "requires-discussion";

  const limitCheck = checkLimits(card, profiles, sharedHardLimits, sharedSoftLimits);
  if (limitCheck === "denied") return "denied";

  return "allowed";
}

export function createInitialConsentState(): ConsentState {
  return {
    partnerA: false,
    partnerB: false,
    currentActivity: null,
    explicitConsentGiven: false,
  };
}

export function updateConsent(
  state: ConsentState,
  partner: "A" | "B",
  consented: boolean
): ConsentState {
  const partnerKey = partner === "A" ? "partnerA" : "partnerB";
  const otherKey = partner === "A" ? "partnerB" : "partnerA";
  return {
    ...state,
    [partnerKey]: consented,
    explicitConsentGiven: consented && state[otherKey],
  };
}
