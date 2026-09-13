"use server";

import type { PartnerProfile } from "@/types/profile";
import type { Session } from "@/types/session";
import { getProfiles as dbGetProfiles, upsertProfile as dbUpsertProfile } from "@/lib/db/profiles";
import {
  createSession as dbCreateSession,
  updateSession as dbUpdateSession,
  getSession as dbGetSession,
  getActiveSessionForRelationship,
} from "@/lib/db/sessions";
import { migrate } from "@/lib/db/migrate";

export async function getProfiles(): Promise<PartnerProfile[]> {
  return dbGetProfiles();
}

export async function saveProfile(profile: PartnerProfile): Promise<void> {
  await dbUpsertProfile(profile);
}

export async function initializeDatabase(): Promise<void> {
  await migrate();
}

export async function persistSession(session: Session): Promise<void> {
  const existing = await dbGetSession(session.id);
  if (existing) {
    await dbUpdateSession(session);
  } else {
    await dbCreateSession(session);
  }
}

export async function loadSession(id: string): Promise<Session | null> {
  return dbGetSession(id);
}

export async function loadActiveSession(relationshipId: string): Promise<Session | null> {
  return getActiveSessionForRelationship(relationshipId);
}
