-- Lace Database Schema
-- Local PostgreSQL for privacy-first intimacy platform

CREATE TABLE IF NOT EXISTS profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pronouns TEXT NOT NULL DEFAULT 'they/them',
  gender_identity TEXT NOT NULL DEFAULT 'other',
  body_configurations JSONB NOT NULL DEFAULT '["any"]',
  hard_limits JSONB NOT NULL DEFAULT '[]',
  soft_limits JSONB NOT NULL DEFAULT '[]',
  preferences JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS relationships (
  id TEXT PRIMARY KEY,
  partner_a TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  partner_b TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  shared_hard_limits JSONB NOT NULL DEFAULT '[]',
  shared_soft_limits JSONB NOT NULL DEFAULT '[]',
  safewords JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (partner_a <> partner_b)
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  relationship_id TEXT NOT NULL REFERENCES relationships(id) ON DELETE CASCADE,
  deck_id TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'setup',
  active_card JSONB,
  active_card_index INTEGER NOT NULL DEFAULT 0,
  drawn_cards JSONB NOT NULL DEFAULT '[]',
  safeword_triggered BOOLEAN NOT NULL DEFAULT FALSE,
  safeword_level TEXT,
  consent_state JSONB NOT NULL DEFAULT '{"partnerA":false,"partnerB":false,"currentActivity":null,"explicitConsentGiven":false}',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_relationship ON sessions(relationship_id);
CREATE INDEX IF NOT EXISTS idx_sessions_status ON sessions(status);
CREATE INDEX IF NOT EXISTS idx_profiles_name ON profiles(name);
