import type { GenderIdentity, BodyConfiguration } from "./deck";

export type ProfileId = string & { readonly __brand: unique symbol };

export interface PartnerProfile {
  id: ProfileId;
  name: string;
  pronouns: string;
  genderIdentity: GenderIdentity;
  bodyConfigurations: BodyConfiguration[];
  hardLimits: string[];
  softLimits: string[];
  preferences: string[];
  createdAt: string;
  updatedAt: string;
}
