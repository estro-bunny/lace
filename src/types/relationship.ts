import type { ProfileId } from "./profile";

export type RelationshipId = string & { readonly __brand: unique symbol };

export interface Relationship {
  id: RelationshipId;
  partnerA: ProfileId;
  partnerB: ProfileId;
  sharedHardLimits: string[];
  sharedSoftLimits: string[];
  safewords: Safeword[];
  createdAt: string;
  updatedAt: string;
}

export interface Safeword {
  word: string;
  level: "slow-down" | "stop" | "emergency";
}
