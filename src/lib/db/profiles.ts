import { query } from "./pool";
import type { PartnerProfile } from "@/types/profile";
import type { ProfileId } from "@/types/profile";

interface ProfileRow {
  id: string;
  name: string;
  pronouns: string;
  gender_identity: string;
  body_configurations: string[];
  hard_limits: string[];
  soft_limits: string[];
  preferences: string[];
  created_at: string;
  updated_at: string;
}

function rowToProfile(row: ProfileRow): PartnerProfile {
  return {
    id: row.id as ProfileId,
    name: row.name,
    pronouns: row.pronouns,
    genderIdentity: row.gender_identity as PartnerProfile["genderIdentity"],
    bodyConfigurations: row.body_configurations as PartnerProfile["bodyConfigurations"],
    hardLimits: row.hard_limits,
    softLimits: row.soft_limits,
    preferences: row.preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfiles(): Promise<PartnerProfile[]> {
  const { rows } = await query<ProfileRow>(
    "SELECT * FROM profiles ORDER BY created_at"
  );
  return rows.map(rowToProfile);
}

export async function getProfile(id: string): Promise<PartnerProfile | null> {
  const { rows } = await query<ProfileRow>(
    "SELECT * FROM profiles WHERE id = $1",
    [id]
  );
  return rows.length > 0 ? rowToProfile(rows[0]) : null;
}

export async function upsertProfile(profile: PartnerProfile): Promise<void> {
  await query(
    `INSERT INTO profiles (id, name, pronouns, gender_identity, body_configurations, hard_limits, soft_limits, preferences, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
     ON CONFLICT (id) DO UPDATE SET
       name = EXCLUDED.name,
       pronouns = EXCLUDED.pronouns,
       gender_identity = EXCLUDED.gender_identity,
       body_configurations = EXCLUDED.body_configurations,
       hard_limits = EXCLUDED.hard_limits,
       soft_limits = EXCLUDED.soft_limits,
       preferences = EXCLUDED.preferences,
       updated_at = EXCLUDED.updated_at`,
    [
      profile.id,
      profile.name,
      profile.pronouns,
      profile.genderIdentity,
      JSON.stringify(profile.bodyConfigurations),
      JSON.stringify(profile.hardLimits),
      JSON.stringify(profile.softLimits),
      JSON.stringify(profile.preferences),
      profile.createdAt,
      profile.updatedAt,
    ]
  );
}

export async function deleteProfile(id: string): Promise<void> {
  await query("DELETE FROM profiles WHERE id = $1", [id]);
}
