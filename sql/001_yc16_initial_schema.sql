-- YC-16 initial PostgreSQL migration draft
CREATE TABLE organizations (
  id TEXT PRIMARY KEY,
  legal_name TEXT,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE companies (
  id TEXT PRIMARY KEY,
  organization_id TEXT REFERENCES organizations(id),
  display_name TEXT NOT NULL,
  legal_name TEXT,
  country_code TEXT NOT NULL DEFAULT 'BG',
  verification_state TEXT NOT NULL DEFAULT 'unverified',
  claim_state TEXT NOT NULL DEFAULT 'unclaimed',
  visibility_state TEXT NOT NULL DEFAULT 'public',
  correction_route TEXT NOT NULL,
  dispute_route TEXT NOT NULL,
  data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE nbil_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  actor_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  target_object_id TEXT NOT NULL,
  target_object_type TEXT NOT NULL,
  evidence_refs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  policy_refs TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  status TEXT NOT NULL DEFAULT 'accepted',
  jurisdiction TEXT NOT NULL DEFAULT 'BG',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
