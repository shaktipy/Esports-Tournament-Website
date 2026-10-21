"""
migrate_to_supabase.py
======================
One-time migration script — reads ALL data from the local SQLite files
(arena.db / users.db) and uploads it to Supabase PostgreSQL.

Run ONCE, AFTER:
  1. Creating tables in Supabase using supabase_schema.sql
  2. Adding SUPABASE_SERVICE_KEY to server/.env

Usage:
    cd server
    python migrate_to_supabase.py
"""

import os
import sys
import json
import sqlite3
from datetime import datetime

from dotenv import load_dotenv

# Load server/.env
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

try:
    from supabase import create_client, Client
except ImportError:
    print("[ERROR] supabase-py not installed. Run: pip install supabase")
    sys.exit(1)

SUPABASE_URL         = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("[ERROR] Set SUPABASE_URL and SUPABASE_SERVICE_KEY in server/.env")
    print("  SUPABASE_URL        = https://xxxx.supabase.co")
    print("  SUPABASE_SERVICE_KEY = your service_role secret key (NOT anon key)")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

DATA_DIR     = os.path.join(BASE_DIR, 'data')
ARENA_DB     = os.path.join(DATA_DIR, 'arena.db')
USERS_DB     = os.path.join(DATA_DIR, 'users.db')
STORE_JSON   = os.path.join(DATA_DIR, 'admin_store.json')

# ─── Helpers ──────────────────────────────────────────────────────────────────
def get_sqlite(path):
    conn = sqlite3.connect(path, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def log(msg):
    print(f"[{datetime.now().strftime('%H:%M:%S')}] {msg}")

# ─── 1. Migrate Collections (arena.db → collections table) ───────────────────
def migrate_collections():
    log("=== Migrating collections (arena.db) ===")

    rows = []

    # Try arena.db first
    if os.path.exists(ARENA_DB):
        with get_sqlite(ARENA_DB) as conn:
            db_rows = conn.execute("SELECT key, data, updated_at FROM collections").fetchall()
            for r in db_rows:
                rows.append({
                    "key":        r["key"],
                    "data":       json.loads(r["data"]),
                    "updated_at": r["updated_at"]
                })
        log(f"  Found {len(rows)} collections in arena.db")
    else:
        log("  arena.db not found, trying admin_store.json...")

    # Fallback to JSON backup if DB is missing or empty
    if not rows and os.path.exists(STORE_JSON):
        with open(STORE_JSON, 'r', encoding='utf-8') as f:
            store = json.load(f)
        for key, val in store.items():
            if key == 'lastSyncedAt':
                continue
            rows.append({
                "key":        key,
                "data":       val,
                "updated_at": datetime.now().isoformat()
            })
        log(f"  Found {len(rows)} collections in admin_store.json")

    if not rows:
        log("  [WARN] No collections data found to migrate!")
        return

    # Upsert to Supabase
    ok = 0
    for row in rows:
        try:
            supabase.table("collections").upsert({
                "key":        row["key"],
                "data":       row["data"],
                "updated_at": row["updated_at"]
            }, on_conflict="key").execute()
            log(f"  ✓ collections['{row['key']}']")
            ok += 1
        except Exception as e:
            log(f"  ✗ collections['{row['key']}'] FAILED: {e}")

    log(f"  Migrated {ok}/{len(rows)} collections.")

# ─── 2. Migrate Users (users.db → users table) ───────────────────────────────
def migrate_users():
    log("=== Migrating users (users.db) ===")

    if not os.path.exists(USERS_DB):
        log("  [WARN] users.db not found, skipping.")
        return

    with get_sqlite(USERS_DB) as conn:
        rows = conn.execute("SELECT * FROM users").fetchall()

    log(f"  Found {len(rows)} users in users.db")
    ok = 0
    for r in rows:
        try:
            supabase.table("users").upsert({
                "id":            r["id"],
                "supabase_id":   r["supabase_id"],
                "email":         r["email"]         or "",
                "in_game_name":  r["in_game_name"]  or "Player",
                "game_uid":      r["game_uid"]       or "",
                "coins":         int(r["coins"]      or 0),
                "cs_tickets":    int(r["cs_tickets"] or 0),
                "br_tickets":    int(r["br_tickets"] or 0),
                "status":        r["status"]         or "active",
                "status_reason": r["status_reason"]  or "",
                "role":          r["role"]            or "player",
                "join_date":     r["join_date"]       or "",
                "last_seen":     r["last_seen"]       or "",
                "notes":         r["notes"]           or "",
            }, on_conflict="id").execute()
            log(f"  ✓ user: {r['in_game_name']} ({r['email']})")
            ok += 1
        except Exception as e:
            log(f"  ✗ user {r['id']} FAILED: {e}")

    log(f"  Migrated {ok}/{len(rows)} users.")

# ─── 3. Migrate Contact Requests (users.db → contact_requests table) ─────────
def migrate_contact_requests():
    log("=== Migrating contact_requests (users.db) ===")

    if not os.path.exists(USERS_DB):
        log("  [WARN] users.db not found, skipping.")
        return

    with get_sqlite(USERS_DB) as conn:
        # Check if table exists
        tbl = conn.execute(
            "SELECT name FROM sqlite_master WHERE type='table' AND name='contact_requests'"
        ).fetchone()
        if not tbl:
            log("  contact_requests table not found in users.db, skipping.")
            return
        rows = conn.execute("SELECT * FROM contact_requests").fetchall()

    log(f"  Found {len(rows)} contact requests in users.db")
    ok = 0
    for r in rows:
        try:
            supabase.table("contact_requests").upsert({
                "id":           r["id"],
                "name":         r["name"]         or "",
                "email":        r["email"]        or "",
                "uid":          r["uid"]           or "N/A",
                "category":     r["category"]     or "General Inquiry",
                "priority":     r["priority"]     or "Normal",
                "message":      r["message"]      or "",
                "submitted_at": r["submitted_at"] or datetime.now().isoformat(),
                "status":       r["status"]       or "new",
            }, on_conflict="id").execute()
            log(f"  ✓ contact request: {r['id']} ({r['name']})")
            ok += 1
        except Exception as e:
            log(f"  ✗ contact request {r['id']} FAILED: {e}")

    log(f"  Migrated {ok}/{len(rows)} contact requests.")

# ─── Verify Migration ─────────────────────────────────────────────────────────
def verify():
    log("=== Verification ===")
    try:
        colls = supabase.table("collections").select("key").execute()
        log(f"  collections: {len(colls.data)} rows in Supabase")
    except Exception as e:
        log(f"  collections verify FAILED: {e}")
    try:
        users = supabase.table("users").select("id").execute()
        log(f"  users: {len(users.data)} rows in Supabase")
    except Exception as e:
        log(f"  users verify FAILED: {e}")
    try:
        contacts = supabase.table("contact_requests").select("id").execute()
        log(f"  contact_requests: {len(contacts.data)} rows in Supabase")
    except Exception as e:
        log(f"  contact_requests verify FAILED: {e}")

# ─── Main ─────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    log("╔══════════════════════════════════════════════════════╗")
    log("║  HAARSH XO Arena — SQLite → Supabase Migration      ║")
    log("╚══════════════════════════════════════════════════════╝")
    log(f"  Supabase URL: {SUPABASE_URL}")
    log("")

    migrate_collections()
    log("")
    migrate_users()
    log("")
    migrate_contact_requests()
    log("")
    verify()

    log("")
    log("✅ Migration complete! Now update server/.env with SUPABASE_URL")
    log("   and SUPABASE_SERVICE_KEY, then restart the Flask server.")
