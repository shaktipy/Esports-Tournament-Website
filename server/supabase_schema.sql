-- ============================================================
-- HAARSH XO Arena — Supabase PostgreSQL Schema
-- Run this in Supabase SQL Editor BEFORE switching the backend
-- ============================================================

-- ─── 1. Collections Table (stores all JSON blobs: tournaments, giveaways, etc.) ───
CREATE TABLE IF NOT EXISTS public.collections (
    key         TEXT        PRIMARY KEY,
    data        JSONB       NOT NULL DEFAULT '[]'::jsonb,
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 2. Users Table ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
    id              TEXT        PRIMARY KEY,
    supabase_id     TEXT        UNIQUE,
    email           TEXT,
    in_game_name    TEXT,
    game_uid        TEXT,
    coins           INTEGER     NOT NULL DEFAULT 0,
    cs_tickets      INTEGER     NOT NULL DEFAULT 0,
    br_tickets      INTEGER     NOT NULL DEFAULT 0,
    status          TEXT        NOT NULL DEFAULT 'active',
    status_reason   TEXT        NOT NULL DEFAULT '',
    role            TEXT        NOT NULL DEFAULT 'player',
    join_date       TEXT,
    last_seen       TEXT,
    notes           TEXT        NOT NULL DEFAULT ''
);

-- ─── 3. Contact Requests Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.contact_requests (
    id              TEXT        PRIMARY KEY,
    name            TEXT,
    email           TEXT,
    uid             TEXT,
    category        TEXT,
    priority        TEXT,
    message         TEXT,
    submitted_at    TEXT,
    status          TEXT        NOT NULL DEFAULT 'new'
);

-- ─── Indexes for performance ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_users_supabase_id   ON public.users(supabase_id);
CREATE INDEX IF NOT EXISTS idx_users_email         ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_game_uid      ON public.users(game_uid);
CREATE INDEX IF NOT EXISTS idx_contact_submitted   ON public.contact_requests(submitted_at DESC);

-- ─── Row Level Security (RLS) ─────────────────────────────────────────────────────
-- We use the service_role key in the backend so RLS is bypassed automatically.
ALTER TABLE public.collections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;

-- ─── Done! ────────────────────────────────────────────────────────────────────────
-- After running this schema, copy your existing SQLite data using the migration
-- script: python server/migrate_to_supabase.py
