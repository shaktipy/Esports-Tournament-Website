import os
import json
import base64
import uuid
import re
import sqlite3
from datetime import datetime

BASE_DIR = os.path.dirname(__file__)
DATA_DIR = os.path.join(BASE_DIR, 'data')
UPLOAD_DIR = os.path.join(BASE_DIR, 'uploads')
DB_PATH = os.path.join(DATA_DIR, 'arena.db')
STORE_JSON_PATH = os.path.join(DATA_DIR, 'admin_store.json')

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ─── Default Seed Data (with proper high-res images) ──────────────────────────
DEFAULT_TOURNAMENTS = [
    {
        "id": "tourney_cs_1",
        "title": "CLASH SQUAD SHOWDOWN (4v4)",
        "date": "Tomorrow, 7:00 PM IST",
        "prize": "₹25,000 + 5,000 Diamonds",
        "mode": "Squad (CS)",
        "map": "Kalahari / Bermuda CS",
        "slots": "14/16 Squads",
        "maxSlots": 16,
        "registeredCount": 14,
        "ticketType": "CS",
        "ticketCost": 1,
        "ticketImage": "/tokens/cs-ticket.png",
        "image": "https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop",
        "description": "Competitive 4v4 Clash Squad. Fast rounds, high stakes, master tier teams.",
        "rules": "No character skill abuse. Gun attributes ON. Emote after knock allowed.",
        "status": "open",
        "participants": [],
        "results": {
            "winnersDeclared": False,
            "firstPlace": {"ign": "", "uid": "", "prize": "₹15,000 + 3,000 Diamonds"},
            "secondPlace": {"ign": "", "uid": "", "prize": "₹7,000 + 1,500 Diamonds"},
            "thirdPlace": {"ign": "", "uid": "", "prize": "₹3,000 + 500 Diamonds"},
            "prizeDistributionStatus": "Pending"
        }
    },
    {
        "id": "tourney_br_1",
        "title": "HAARSH XO BATTLE ROYALE INVITATIONAL",
        "date": "Saturday, 8:30 PM IST",
        "prize": "₹50,000 + 10,000 Diamonds",
        "mode": "Squad (BR)",
        "map": "Bermuda Classic",
        "slots": "44/48 Teams",
        "maxSlots": 48,
        "registeredCount": 44,
        "ticketType": "BR",
        "ticketCost": 1,
        "ticketImage": "/tokens/br-ticket.png",
        "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        "description": "Premier Battle Royale championship streamed live on HAARSH XO YouTube channel.",
        "rules": "Official FFWS points table. 12 Matches over 2 days. Hackers instantly banned.",
        "status": "open",
        "participants": [],
        "results": {
            "winnersDeclared": False,
            "firstPlace": {"ign": "", "uid": "", "prize": "₹30,000 + 5,000 Diamonds"},
            "secondPlace": {"ign": "", "uid": "", "prize": "₹15,000 + 3,000 Diamonds"},
            "thirdPlace": {"ign": "", "uid": "", "prize": "₹5,000 + 2,000 Diamonds"},
            "prizeDistributionStatus": "Pending"
        }
    },
    {
        "id": "tourney_br_2",
        "title": "LONE WOLF 1v1 CHAMPIONSHIP",
        "date": "Sunday, 6:00 PM IST",
        "prize": "₹15,000 + 2,500 Diamonds",
        "mode": "Solo (1v1)",
        "map": "Iron Cage",
        "slots": "88/100 Players",
        "maxSlots": 100,
        "registeredCount": 88,
        "ticketType": "BR",
        "ticketCost": 1,
        "ticketImage": "/tokens/br-ticket.png",
        "image": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
        "description": "Pure 1v1 gun skill. Snipers, Desert Eagle, Shotguns only.",
        "rules": "Best of 7 rounds. Headshots only in round 3 and 7.",
        "status": "open",
        "participants": [],
        "results": {
            "winnersDeclared": False,
            "firstPlace": {"ign": "", "uid": "", "prize": "₹10,000 + 1,500 Diamonds"},
            "secondPlace": {"ign": "", "uid": "", "prize": "₹3,500 + 700 Diamonds"},
            "thirdPlace": {"ign": "", "uid": "", "prize": "₹1,500 + 300 Diamonds"},
            "prizeDistributionStatus": "Pending"
        }
    },
    {
        "id": "tourney_cs_2",
        "title": "CS WEEKEND PRO SCRIMS",
        "date": "Friday, 9:00 PM IST",
        "prize": "₹20,000 + Custom Title",
        "mode": "Squad (CS)",
        "map": "Alpine CS",
        "slots": "16/16 Squads",
        "maxSlots": 16,
        "registeredCount": 16,
        "ticketType": "CS",
        "ticketCost": 1,
        "ticketImage": "/tokens/cs-ticket.png",
        "image": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop",
        "description": "Official esports scrims for verified tournament rosters.",
        "rules": "Room ID & password shared 15 mins prior in tournament lobby.",
        "status": "closed",
        "participants": [],
        "results": {
            "winnersDeclared": False,
            "firstPlace": {"ign": "", "uid": "", "prize": "₹12,000"},
            "secondPlace": {"ign": "", "uid": "", "prize": "₹5,000"},
            "thirdPlace": {"ign": "", "uid": "", "prize": "₹3,000"},
            "prizeDistributionStatus": "Pending"
        }
    },
    {
        "id": "tourney_br_3",
        "title": "BERMUDA TRIANGLE DUO CUP",
        "date": "Next Monday, 8:00 PM IST",
        "prize": "₹30,000 + 7,500 Diamonds",
        "mode": "Duo (BR)",
        "map": "Bermuda Remastered",
        "slots": "22/24 Duos",
        "maxSlots": 24,
        "registeredCount": 22,
        "ticketType": "BR",
        "ticketCost": 1,
        "ticketImage": "/tokens/br-ticket.png",
        "image": "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop",
        "description": "Dynamic 2v2 Battle Royale survival cup. Coordinate with your duo partner.",
        "rules": "Standard duo BR rules. Revival points active until zone 4.",
        "status": "open",
        "participants": [],
        "results": {
            "winnersDeclared": False,
            "firstPlace": {"ign": "", "uid": "", "prize": "₹18,000 + 4,000 Diamonds"},
            "secondPlace": {"ign": "", "uid": "", "prize": "₹8,000 + 2,500 Diamonds"},
            "thirdPlace": {"ign": "", "uid": "", "prize": "₹4,000 + 1,000 Diamonds"},
            "prizeDistributionStatus": "Pending"
        }
    },
    {
        "id": "tourney_cs_3",
        "title": "CS GRAND MASTERS ALL-STARS",
        "date": "Completed Yesterday",
        "prize": "₹40,000 + Exclusive XO Jersey",
        "mode": "Squad (CS)",
        "map": "NeXTerra / Purgatory CS",
        "slots": "16/16 Squads",
        "maxSlots": 16,
        "registeredCount": 16,
        "ticketType": "CS",
        "ticketCost": 1,
        "ticketImage": "/tokens/cs-ticket.png",
        "image": "https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1974&auto=format&fit=crop",
        "description": "Elite tier CS tournament for top-ranking community squads and streamers.",
        "rules": "Stream sniping forbidden. Delay stream by 120s.",
        "status": "completed",
        "participants": [
            {"id": "p8", "ign": "Team_Vampires", "uid": "901238475", "teamName": "Vampire Elites", "registeredAt": "2026-09-25 12:00", "ticketUsed": "1x CS Ticket", "status": "confirmed"}
        ],
        "results": {
            "winnersDeclared": True,
            "firstPlace": {"ign": "Team_Vampires", "uid": "901238475", "prize": "₹25,000 + Exclusive XO Jersey"},
            "secondPlace": {"ign": "Soul_Reapers", "uid": "887123901", "prize": "₹10,000"},
            "thirdPlace": {"ign": "NightRiders", "uid": "671238490", "prize": "₹5,000"},
            "prizeDistributionStatus": "Distributed"
        }
    }
]

DEFAULT_GIVEAWAYS = [
    {
        "id": 1,
        "category": "main",
        "title": "Monthly Mega Diamond Giveaway",
        "prize": "10,000 Free Fire Diamonds",
        "daysLeft": 14,
        "status": "open",
        "participants": 0,
        "participantsList": [],
        "requirements": [
            {"id": "req1", "text": "Subscribe to HAARSH XO on YouTube", "completed": True},
            {"id": "req2", "text": "Follow @haarsh_xo on Instagram", "completed": False},
            {"id": "req3", "text": "Share this live stream giveaway", "completed": False}
        ],
        "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        "active": True,
        "winner": None
    },
    {
        "id": 2,
        "category": "main",
        "title": "Weekend Special: Booyah Pass Giveaway",
        "prize": "5x Booyah Passes + 1,000 Diamonds",
        "daysLeft": 3,
        "status": "open",
        "participants": 0,
        "participantsList": [],
        "requirements": [
            {"id": "req4", "text": "Watch today's live stream for 15 mins", "completed": True},
            {"id": "req5", "text": "Comment your Free Fire UID in chat", "completed": True}
        ],
        "image": "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop",
        "active": True,
        "winner": None
    },
    {
        "id": 3,
        "category": "esports",
        "title": "10x CS TOURNAMENT TICKETS GIVEAWAY",
        "prize": "10x Free CS Registration Tickets",
        "daysLeft": 1,
        "status": "open",
        "participants": 0,
        "participantsList": [],
        "requirements": [
            {"id": "req_esp_1", "text": "Active esports registered player", "completed": True},
            {"id": "req_esp_2", "text": "Watch live finals this weekend", "completed": True}
        ],
        "image": "/tokens/cs-ticket.png",
        "active": True,
        "winner": None
    }
]

DEFAULT_PASSES = [
    {
        "id": 1,
        "title": "CLASH SQUAD TICKET PACK",
        "subtitle": "5x CS Tournament Tickets",
        "inrPrice": 39,
        "grantCs": 5,
        "grantBr": 0,
        "grantCoins": 100,
        "ticketImage": "/tokens/cs-ticket.png",
        "ticketType": "CS",
        "features": [
            "5x CS Tournament Registration Tickets",
            "+100 Free XO Bonus Coins",
            "Entry to Master Tier 4v4 Cups",
            "Priority Slot Confirmation in Scrims"
        ],
        "color": "linear-gradient(135deg, #10b981 0%, #059669 100%)",
        "accentColor": "#10b981",
        "active": True,
        "badge": "POPULAR"
    },
    {
        "id": 2,
        "title": "BATTLE ROYALE TICKET PACK",
        "subtitle": "5x BR Tournament Tickets",
        "inrPrice": 59,
        "grantCs": 0,
        "grantBr": 5,
        "grantCoins": 150,
        "ticketImage": "/tokens/br-ticket.png",
        "ticketType": "BR",
        "features": [
            "5x BR Tournament Registration Tickets",
            "+150 Free XO Bonus Coins",
            "Entry to Invitational & Lone Wolf Cups",
            "Squad Slot Reservation in Bermuda Scrims"
        ],
        "color": "linear-gradient(135deg, #94a3b8 0%, #475569 100%)",
        "accentColor": "#94a3b8",
        "active": True,
        "badge": "BEST VALUE"
    },
    {
        "id": 3,
        "title": "HAARSH XO ALL-STAR COMBO",
        "subtitle": "5x CS Tickets + 5x BR Tickets",
        "inrPrice": 99,
        "grantCs": 5,
        "grantBr": 5,
        "grantCoins": 300,
        "ticketImage": "https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop",
        "ticketType": "COMBO",
        "features": [
            "10 Total Tournament Tickets (5 CS + 5 BR)",
            "+300 Free XO Bonus Coins",
            "Unlimited Entry into Weekly Practice Scrims",
            "Direct Eligibility for Diamond Prize Pools"
        ],
        "color": "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
        "accentColor": "#f59e0b",
        "active": True,
        "badge": "MEGA PACK"
    }
]

DEFAULT_STORE_REWARDS = [
    {
        "id": 1,
        "storeType": "main",
        "title": "100 Free Fire Diamonds",
        "cost": 1000,
        "type": "diamonds",
        "description": "Instant direct top-up to your Free Fire account via UID.",
        "image": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop",
        "tag": "INSTANT UID",
        "stock": 999,
        "active": True
    },
    {
        "id": 2,
        "storeType": "main",
        "title": "₹10 Google Play Code",
        "cost": 500,
        "type": "giftcard",
        "description": "Instant ₹10 Google Play redeem code delivered to your registered email.",
        "image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
        "tag": "HOT",
        "stock": 150,
        "active": True
    },
    {
        "id": 3,
        "storeType": "main",
        "title": "₹30 Google Play Code",
        "cost": 1400,
        "type": "giftcard",
        "description": "Instant ₹30 Google Play redeem code for special air drops and gun crates.",
        "image": "https://images.unsplash.com/photo-1606144042871-2ed4a9aacf39?q=80&w=2070&auto=format&fit=crop",
        "tag": "POPULAR",
        "stock": 200,
        "active": True
    },
    {
        "id": 4,
        "storeType": "main",
        "title": "Weekly Free Fire Membership",
        "cost": 3000,
        "type": "membership",
        "description": "Get 450 Diamonds + weekly perks in Free Fire with UID top-up.",
        "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        "tag": "MEMBERSHIP",
        "stock": 50,
        "active": True
    },
    {
        "id": 5,
        "storeType": "main",
        "title": "₹50 Google Play Gift Card",
        "cost": 2200,
        "type": "giftcard",
        "description": "Instant ₹50 redeem code for in-game purchases and Level Up Pass.",
        "image": "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop",
        "tag": "BEST VALUE",
        "stock": 80,
        "active": True
    },
    {
        "id": 6,
        "storeType": "arena",
        "title": "100 FREE FIRE DIAMONDS",
        "type": "diamonds",
        "cost": 1000,
        "image": "https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop",
        "description": "Instant direct top-up to your Free Fire account via UID.",
        "tag": "INSTANT UID TOPUP",
        "stock": 500,
        "active": True
    },
    {
        "id": 7,
        "storeType": "arena",
        "title": "₹50 GOOGLE PLAY REDEEM CODE",
        "type": "giftcard",
        "cost": 2200,
        "image": "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop",
        "description": "Instant ₹50 Google Play Store redeem code for in-game purchases.",
        "tag": "HOT REWARD",
        "stock": 120,
        "active": True
    },
    {
        "id": 8,
        "storeType": "arena",
        "title": "310 FF DIAMONDS BUNDLE",
        "type": "diamonds",
        "cost": 2900,
        "image": "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop",
        "description": "Special tournament winners diamond top-up bundle.",
        "tag": "BEST VALUE",
        "stock": 45,
        "active": True
    },
    {
        "id": 9,
        "storeType": "arena",
        "title": "HAARSH XO OFFICIAL PRO JERSEY",
        "type": "merch",
        "cost": 8500,
        "tag": "LIMITED EDITION",
        "image": "https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a31f?q=80&w=2069&auto=format&fit=crop",
        "description": "Official HAARSH XO Esports tournament player jersey with customized gamertag.",
        "stock": 15,
        "active": True
    }
]

DEFAULT_ANNOUNCEMENTS = [
    {
        "id": "ann_1",
        "title": "🔥 ₹50,000 Battle Royale Invitational Registration is NOW OPEN!",
        "message": "Grab your BR Tournament Pass and register your 4-man squad before slots fill up! Live streamed on HAARSH XO channel.",
        "type": "tournament",
        "active": True,
        "showMarquee": True,
        "createdAt": "2026-09-28"
    },
    {
        "id": "ann_2",
        "title": '🎁 Use Promo Code "XOBOOYAH100" for +500 Free XO Coins!',
        "message": "Head over to the Redeem section, enter the code and claim your coins instantly.",
        "type": "reward",
        "active": True,
        "showMarquee": True,
        "createdAt": "2026-09-27"
    }
]

DEFAULT_REDEEM_CODES = [
    {
        "id": "code_1",
        "code": "XOBOOYAH100",
        "rewardType": "coins",
        "coins": 500,
        "csTickets": 0,
        "brTickets": 0,
        "maxUses": 500,
        "usedCount": 142,
        "usedBy": ["849204812"],
        "expiryDate": "2026-12-31",
        "active": True,
        "createdAt": "2026-09-01",
        "description": "Launch celebration code: +500 XO Coins"
    },
    {
        "id": "code_2",
        "code": "FREECSTICKET",
        "rewardType": "cs_tickets",
        "coins": 0,
        "csTickets": 2,
        "brTickets": 0,
        "maxUses": 200,
        "usedCount": 78,
        "usedBy": [],
        "expiryDate": "2026-10-15",
        "active": True,
        "createdAt": "2026-09-15",
        "description": "Weekend Scrims Gift: +2 Free CS Tickets"
    }
]

# ─── SQLite Storage Operations ────────────────────────────────────────────────
def get_db():
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes tables and seeds default data if empty."""
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS collections (
                key TEXT PRIMARY KEY,
                data TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """)
        conn.commit()

        # Load saved json backup if present
        saved_backup = {}
        if os.path.exists(STORE_JSON_PATH):
            try:
                with open(STORE_JSON_PATH, 'r', encoding='utf-8') as f:
                    saved_backup = json.load(f)
            except Exception:
                saved_backup = {}

        # Seed defaults if not present
        # IMPORTANT: Use 'key in saved_backup' instead of 'or' to handle empty lists [].
        # Python evaluates `[] or DEFAULT_X` as DEFAULT_X because [] is falsy.
        # This was causing deleted announcements to be resurrected on server restart.
        defaults = {
            "tournaments":   saved_backup["tournaments"]   if "tournaments"   in saved_backup else DEFAULT_TOURNAMENTS,
            "passes":        saved_backup["passes"]        if "passes"        in saved_backup else DEFAULT_PASSES,
            "storeRewards":  saved_backup["storeRewards"]  if "storeRewards"  in saved_backup else DEFAULT_STORE_REWARDS,
            "announcements": saved_backup["announcements"] if "announcements" in saved_backup else DEFAULT_ANNOUNCEMENTS,
            "redeemCodes":   saved_backup["redeemCodes"]   if "redeemCodes"   in saved_backup else DEFAULT_REDEEM_CODES,
            "giveawaysList": saved_backup["giveawaysList"] if "giveawaysList" in saved_backup else DEFAULT_GIVEAWAYS,
            "transactions":  saved_backup.get("transactions", []),
            "redemptions":   saved_backup.get("redemptions", []),
            "users":         saved_backup.get("users", []),
            "auditLogs":     saved_backup.get("auditLogs", [])
        }

        for key, default_val in defaults.items():
            row = conn.execute("SELECT data FROM collections WHERE key = ?", (key,)).fetchone()
            if not row:
                conn.execute(
                    "INSERT INTO collections (key, data, updated_at) VALUES (?, ?, ?)",
                    (key, json.dumps(default_val, ensure_ascii=False), datetime.now().isoformat())
                )
        conn.commit()

def save_base64_image(data_url):
    """
    Decodes base64 data URI and saves it as a real physical image file in UPLOAD_DIR.
    Returns the web URL '/api/uploads/<filename>'.
    """
    if not isinstance(data_url, str) or not data_url.startswith('data:image/'):
        return data_url

    try:
        header, encoded = data_url.split(',', 1)
        match = re.search(r'data:image/(\w+);base64', header)
        ext = match.group(1) if match else 'png'
        if ext == 'jpeg':
            ext = 'jpg'
        elif ext not in ('png', 'jpg', 'jpeg', 'webp', 'gif'):
            ext = 'png'

        filename = f"img_{uuid.uuid4().hex[:12]}.{ext}"
        filepath = os.path.join(UPLOAD_DIR, filename)

        image_bytes = base64.b64decode(encoded)
        with open(filepath, 'wb') as f:
            f.write(image_bytes)

        return f"/api/uploads/{filename}"
    except Exception as e:
        print(f"[UPLOAD] Failed to save base64 image: {e}")
        return data_url

def process_images_recursive(data):
    """Recursively processes any dictionary/list to convert base64 image strings to file URLs."""
    if isinstance(data, dict):
        new_dict = {}
        for k, v in data.items():
            if k in ('image', 'ticketImage', 'banner') and isinstance(v, str) and v.startswith('data:image/'):
                new_dict[k] = save_base64_image(v)
            else:
                new_dict[k] = process_images_recursive(v)
        return new_dict
    elif isinstance(data, list):
        return [process_images_recursive(item) for item in data]
    return data

def get_all_collections():
    """Returns a dictionary containing all collections from SQLite."""
    init_db()
    result = {}
    with get_db() as conn:
        rows = conn.execute("SELECT key, data FROM collections").fetchall()
        for r in rows:
            try:
                result[r["key"]] = json.loads(r["data"])
            except Exception:
                result[r["key"]] = []
    result["lastSyncedAt"] = datetime.now().isoformat()
    return result

def update_collections(payload):
    """
    Updates collections in SQLite. Converts any base64 images to physical files on disk first.
    """
    if not isinstance(payload, dict):
        return False

    init_db()
    # Process base64 images into physical files
    clean_payload = process_images_recursive(payload)

    with get_db() as conn:
        for key, val in clean_payload.items():
            if key == 'lastSyncedAt':
                continue
            conn.execute(
                """
                INSERT INTO collections (key, data, updated_at) 
                VALUES (?, ?, ?)
                ON CONFLICT(key) DO UPDATE SET 
                    data = excluded.data, 
                    updated_at = excluded.updated_at
                """,
                (key, json.dumps(val, ensure_ascii=False), datetime.now().isoformat())
            )
        conn.commit()

    # Also maintain atomic JSON file backup on disk
    try:
        current_store = {}
        if os.path.exists(STORE_JSON_PATH):
            try:
                with open(STORE_JSON_PATH, 'r', encoding='utf-8') as f:
                    current_store = json.load(f)
            except Exception:
                current_store = {}
        for k, v in clean_payload.items():
            if k != 'lastSyncedAt':
                current_store[k] = v
        current_store['lastSyncedAt'] = datetime.now().isoformat()
        with open(STORE_JSON_PATH, 'w', encoding='utf-8') as f:
            json.dump(current_store, f, ensure_ascii=False, indent=2)
    except Exception as err:
        print(f"[STORAGE] JSON snapshot write warning: {err}")

    return True

