import pool from "./pool";
import type { Session, SessionId, SessionStatus, ConsentState } from "@/types/session";
import type { RelationshipId } from "@/types/relationship";
import type { ProfileId } from "@/types/profile";
import type { DeckId, DeckCard, CardId } from "@/types/deck";

interface SessionRow {
  id: string;
  relationship_id: string;
  deck_id: string;
  participants: string[];
  status: string;
  active_card: DeckCard | null;
  active_card_index: number;
  drawn_cards: string[];
  safeword_triggered: boolean;
  safeword_level: string | null;
  consent_state: { partnerA: boolean; partnerB: boolean; currentActivity: string | null; explicitConsentGiven: boolean };
  started_at: string;
  ended_at: string | null;
  last_activity_at: string;
}

function rowToSession(row: SessionRow): Session {
  return {
    id: row.id as SessionId,
    relationshipId: row.relationship_id as RelationshipId,
    deckId: row.deck_id as DeckId,
    participants: row.participants as ProfileId[],
    status: row.status as Session["status"],
    activeCard: row.active_card,
    activeCardIndex: row.active_card_index,
    drawnCards: row.drawn_cards as CardId[],
    safewordTriggered: row.safeword_triggered,
    safewordLevel: row.safeword_level as Session["safewordLevel"],
    consentState: row.consent_state,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    lastActivityAt: row.last_activity_at,
  };
}

export async function createSession(session: Session): Promise<void> {
  await pool.query(
    `INSERT INTO sessions (id, relationship_id, deck_id, participants, status, active_card, active_card_index, drawn_cards, safeword_triggered, safeword_level, consent_state, started_at, ended_at, last_activity_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
    [
      session.id,
      session.relationshipId,
      session.deckId,
      JSON.stringify(session.participants),
      session.status,
      session.activeCard ? JSON.stringify(session.activeCard) : null,
      session.activeCardIndex,
      JSON.stringify(session.drawnCards),
      session.safewordTriggered,
      session.safewordLevel,
      JSON.stringify(session.consentState),
      session.startedAt,
      session.endedAt,
      session.lastActivityAt,
    ]
  );
}

export async function updateSession(session: Session): Promise<void> {
  await pool.query(
    `UPDATE sessions SET
       status = $2,
       active_card = $3,
       active_card_index = $4,
       drawn_cards = $5,
       safeword_triggered = $6,
       safeword_level = $7,
       consent_state = $8,
       ended_at = $9,
       last_activity_at = $10
     WHERE id = $1`,
    [
      session.id,
      session.status,
      session.activeCard ? JSON.stringify(session.activeCard) : null,
      session.activeCardIndex,
      JSON.stringify(session.drawnCards),
      session.safewordTriggered,
      session.safewordLevel,
      JSON.stringify(session.consentState),
      session.endedAt,
      session.lastActivityAt,
    ]
  );
}

export async function getSession(id: string): Promise<Session | null> {
  const result = await pool.query<SessionRow>(
    "SELECT * FROM sessions WHERE id = $1",
    [id]
  );
  return result.rows.length > 0 ? rowToSession(result.rows[0]) : null;
}

export async function getActiveSessionForRelationship(relationshipId: string): Promise<Session | null> {
  const result = await pool.query<SessionRow>(
    `SELECT * FROM sessions WHERE relationship_id = $1 AND status NOT IN ('ended') ORDER BY last_activity_at DESC LIMIT 1`,
    [relationshipId]
  );
  return result.rows.length > 0 ? rowToSession(result.rows[0]) : null;
}

export async function getRecentSessions(relationshipId: string, limit = 10): Promise<Session[]> {
  const result = await pool.query<SessionRow>(
    `SELECT * FROM sessions WHERE relationship_id = $1 ORDER BY started_at DESC LIMIT $2`,
    [relationshipId, limit]
  );
  return result.rows.map(rowToSession);
}
