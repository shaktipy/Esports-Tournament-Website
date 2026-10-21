import os
import sys
import json
import hmac
import hashlib
from datetime import datetime
import razorpay
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
from supabase import create_client, Client

# Ensure local server directory is on sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from storage import (
    get_all_collections,
    update_collections,
    save_base64_image,
    UPLOAD_DIR,
    DATA_DIR,
)

# Load .env from the server/ folder
load_dotenv(os.path.join(BASE_DIR, '.env'))

app = Flask(__name__)

# Allow requests from all origins (localhost, LAN IP, mobile devices, etc.)
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# ─── Razorpay Client ──────────────────────────────────────────────────────────
RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
razorpay_client     = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))

# ─── Supabase Client (service_role — backend only) ───────────────────────────
SUPABASE_URL         = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY", "")
supabase: Client     = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# ─── User Helpers ─────────────────────────────────────────────────────────────

def user_row_to_dict(row: dict) -> dict:
    return {
        "id":           row.get("id", ""),
        "supabaseId":   row.get("supabase_id", ""),
        "email":        row.get("email", ""),
        "inGameName":   row.get("in_game_name", "Player"),
        "uid":          row.get("game_uid", ""),
        "coins":        int(row.get("coins", 0) or 0),
        "csTickets":    int(row.get("cs_tickets", 0) or 0),
        "brTickets":    int(row.get("br_tickets", 0) or 0),
        "status":       row.get("status", "active") or "active",
        "statusReason": row.get("status_reason", "") or "",
        "role":         row.get("role", "player") or "player",
        "joinDate":     row.get("join_date", ""),
        "lastSeen":     row.get("last_seen", ""),
        "notes":        row.get("notes", "") or "",
    }


def find_user_by_identifier(identifier: str) -> dict | None:
    """Finds user by supabase_id, game_uid, internal id, or email."""
    if not identifier:
        return None
    ident = str(identifier).strip()
    try:
        # Try supabase_id first (most common)
        res = supabase.table("users").select("*").eq("supabase_id", ident).maybe_single().execute()
        if res.data:
            return res.data
        # Try game_uid
        res = supabase.table("users").select("*").eq("game_uid", ident).maybe_single().execute()
        if res.data:
            return res.data
        # Try internal id
        res = supabase.table("users").select("*").eq("id", ident).maybe_single().execute()
        if res.data:
            return res.data
        # Try email (case-insensitive via ilike)
        res = supabase.table("users").select("*").ilike("email", ident).maybe_single().execute()
        if res.data:
            return res.data
    except Exception as e:
        print(f"[find_user] Error: {e}")
    return None


# ─── Users API Endpoints ───────────────────────────────────────────────────────

@app.route("/api/users", methods=["GET"])
def list_users():
    """Return all registered users (for admin panel)."""
    try:
        res = supabase.table("users").select("*").order("join_date", desc=True).execute()
        return jsonify([user_row_to_dict(r) for r in (res.data or [])]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/upsert", methods=["POST"])
def upsert_user():
    """
    Called by frontend on login/register to ensure user exists in our DB.
    Creates a new record if not found, updates inGameName/email/lastSeen if found.
    Also returns the user's current balance from our DB.
    """
    data         = request.get_json() or {}
    supabase_id  = data.get("supabaseId", "")
    email        = data.get("email", "")
    in_game_name = data.get("inGameName", "Player")
    game_uid     = data.get("uid", "")
    now          = datetime.now().isoformat()

    if not supabase_id:
        return jsonify({"error": "supabaseId is required"}), 400

    try:
        # Check if user exists
        existing = None
        res = supabase.table("users").select("*").eq("supabase_id", supabase_id).maybe_single().execute()
        if res.data:
            existing = res.data
        elif email:
            res2 = supabase.table("users").select("*").eq("email", email).maybe_single().execute()
            if res2.data:
                existing = res2.data

        if existing:
            # Check ban status
            if existing.get("status") in ["banned", "suspended"]:
                return jsonify({
                    "success": False,
                    "banned": True,
                    "status": existing["status"],
                    "statusReason": existing.get("status_reason") or "Banned by admin",
                    "user": user_row_to_dict(existing)
                }), 403

            # Update existing user
            supabase.table("users").update({
                "email":        email,
                "in_game_name": in_game_name,
                "last_seen":    now,
            }).eq("id", existing["id"]).execute()

            row_res = supabase.table("users").select("*").eq("id", existing["id"]).single().execute()
            return jsonify({"success": True, "user": user_row_to_dict(row_res.data)}), 200

        else:
            # Create new user
            user_id = f"u_{supabase_id[:12]}_{datetime.now().strftime('%f')}"
            new_user = {
                "id":            user_id,
                "supabase_id":   supabase_id,
                "email":         email,
                "in_game_name":  in_game_name,
                "game_uid":      game_uid,
                "coins":         0,
                "cs_tickets":    0,
                "br_tickets":    0,
                "status":        "active",
                "status_reason": "",
                "role":          "player",
                "join_date":     now[:10],
                "last_seen":     now,
                "notes":         "",
            }
            supabase.table("users").insert(new_user).execute()
            row_res = supabase.table("users").select("*").eq("supabase_id", supabase_id).single().execute()
            return jsonify({"success": True, "user": user_row_to_dict(row_res.data)}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_identifier>/check-status", methods=["GET"])
def check_user_status(user_identifier):
    """Returns the ban/suspension status for a specific user."""
    row = find_user_by_identifier(user_identifier)
    if not row:
        return jsonify({"status": "active", "banned": False}), 200
    is_banned = row.get("status") in ["banned", "suspended"]
    return jsonify({
        "status":       row.get("status") or "active",
        "statusReason": row.get("status_reason") or "",
        "banned":       is_banned,
        "user":         user_row_to_dict(row)
    }), 200


@app.route("/api/users/<user_identifier>/balance", methods=["GET"])
def get_user_balance(user_identifier):
    """Returns the server-side balance for a specific user."""
    row = find_user_by_identifier(user_identifier)
    if not row:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user_row_to_dict(row)), 200


@app.route("/api/users/<user_identifier>/update-balance", methods=["POST"])
def update_user_balance(user_identifier):
    """Admin endpoint: adjust coins, csTickets, brTickets by delta values."""
    data       = request.get_json() or {}
    coin_delta = int(data.get("coinDelta", 0))
    cs_delta   = int(data.get("csDelta", 0))
    br_delta   = int(data.get("brDelta", 0))
    reason     = data.get("reason", "Admin Adjustment")

    try:
        row = find_user_by_identifier(user_identifier)
        if not row:
            return jsonify({"error": "User not found"}), 404

        new_coins = max(0, int(row.get("coins", 0) or 0) + coin_delta)
        new_cs    = max(0, int(row.get("cs_tickets", 0) or 0) + cs_delta)
        new_br    = max(0, int(row.get("br_tickets", 0) or 0) + br_delta)

        supabase.table("users").update({
            "coins":      new_coins,
            "cs_tickets": new_cs,
            "br_tickets": new_br,
        }).eq("id", row["id"]).execute()

        updated = supabase.table("users").select("*").eq("id", row["id"]).single().execute()

        # Audit log
        try:
            store      = get_all_collections()
            audit_logs = store.get("auditLogs", [])
            audit_logs.insert(0, {
                "id":        f"log_{os.urandom(4).hex()}",
                "action":    "USER_BALANCE_ADJUSTED",
                "category":  "USERS",
                "details":   f"Admin adjusted balance for {row.get('in_game_name')} (UID: {row.get('game_uid')}): {'+' if coin_delta>=0 else ''}{coin_delta} Coins, {'+' if cs_delta>=0 else ''}{cs_delta} CS, {'+' if br_delta>=0 else ''}{br_delta} BR. Reason: {reason}",
                "timestamp": datetime.now().isoformat(),
                "adminUser": "ADMIN",
            })
            store["auditLogs"] = audit_logs[:300]
            update_collections({"auditLogs": store["auditLogs"]})
        except Exception:
            pass

        return jsonify({"success": True, "user": user_row_to_dict(updated.data)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_identifier>/update-status", methods=["POST"])
def update_user_status(user_identifier):
    """Admin endpoint: ban, suspend, or unban a user."""
    data       = request.get_json() or {}
    new_status = data.get("status", "active")
    reason     = data.get("reason", "")

    valid_statuses = ["active", "suspended", "banned"]
    if new_status not in valid_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {valid_statuses}"}), 400

    try:
        row = find_user_by_identifier(user_identifier)
        if not row:
            return jsonify({"error": "User not found"}), 404

        supabase.table("users").update({
            "status":        new_status,
            "status_reason": reason,
        }).eq("id", row["id"]).execute()

        updated = supabase.table("users").select("*").eq("id", row["id"]).single().execute()

        # Audit log
        try:
            store      = get_all_collections()
            audit_logs = store.get("auditLogs", [])
            audit_logs.insert(0, {
                "id":        f"log_{os.urandom(4).hex()}",
                "action":    "USER_STATUS_CHANGE",
                "category":  "USERS",
                "details":   f"Changed status for {row.get('in_game_name')} (UID: {row.get('game_uid')}) to {new_status.upper()}. Reason: {reason or 'N/A'}",
                "timestamp": datetime.now().isoformat(),
                "adminUser": "ADMIN",
            })
            store["auditLogs"] = audit_logs[:300]
            update_collections({"auditLogs": store["auditLogs"]})
        except Exception:
            pass

        return jsonify({"success": True, "user": user_row_to_dict(updated.data)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/users/<user_identifier>/sync-balance", methods=["POST"])
def sync_user_balance(user_identifier):
    """Called by GameContext to push local balance updates to the server."""
    data       = request.get_json() or {}
    coins      = data.get("coins")
    cs_tickets = data.get("csTickets")
    br_tickets = data.get("brTickets")

    if coins is None and cs_tickets is None and br_tickets is None:
        return jsonify({"error": "No balance fields provided"}), 400

    try:
        row = find_user_by_identifier(user_identifier)
        if not row:
            return jsonify({"error": "User not found"}), 404

        new_coins = max(0, int(coins)      if coins      is not None else int(row.get("coins", 0) or 0))
        new_cs    = max(0, int(cs_tickets) if cs_tickets is not None else int(row.get("cs_tickets", 0) or 0))
        new_br    = max(0, int(br_tickets) if br_tickets is not None else int(row.get("br_tickets", 0) or 0))

        supabase.table("users").update({
            "coins":      new_coins,
            "cs_tickets": new_cs,
            "br_tickets": new_br,
            "last_seen":  datetime.now().isoformat(),
        }).eq("id", row["id"]).execute()

        updated = supabase.table("users").select("*").eq("id", row["id"]).single().execute()
        return jsonify({"success": True, "user": user_row_to_dict(updated.data)}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ─── Data Storage Operations (Supabase) ───────────────────────────────────────
def load_store():
    return get_all_collections()

def save_store(data):
    return update_collections(data)

# Dynamic passes dictionary — seeded with defaults, updated from store
_DEFAULT_PASSES_DICT = {
    1: {"name": "CLASH SQUAD TICKET PACK",   "amount": 3900,  "grantCs": 5, "grantBr": 0, "grantCoins": 100},
    2: {"name": "BATTLE ROYALE TICKET PACK", "amount": 5900,  "grantCs": 0, "grantBr": 5, "grantCoins": 150},
    3: {"name": "HAARSH XO ALL-STAR COMBO",  "amount": 9900,  "grantCs": 5, "grantBr": 5, "grantCoins": 300},
}

def get_current_passes():
    store  = load_store()
    passes = dict(_DEFAULT_PASSES_DICT)
    if "passes" in store and isinstance(store["passes"], list):
        for p in store["passes"]:
            pid = int(p.get("id", 0))
            if pid > 0:
                amount_paise = int(float(p.get("inrPrice", 39)) * 100)
                passes[pid] = {
                    "name":       p.get("title", f"Pass #{pid}"),
                    "amount":     amount_paise,
                    "grantCs":    int(p.get("grantCs", 0)),
                    "grantBr":    int(p.get("grantBr", 0)),
                    "grantCoins": int(p.get("grantCoins", 0)),
                }
    return passes


# ─── Health Check ─────────────────────────────────────────────────────────────
@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status":  "ok",
        "service": "HAARSH XO Backend",
        "db":      "supabase",
        "port":    int(os.getenv("PORT", 5001))
    }), 200


# ─── Create Razorpay Order ────────────────────────────────────────────────────
@app.route("/api/create-order", methods=["POST"])
def create_order():
    try:
        data    = request.get_json() or {}
        pass_id = int(data.get("pass_id", 0))

        valid_passes = get_current_passes()
        if pass_id not in valid_passes:
            return jsonify({"error": f"Invalid pass ID: {pass_id}"}), 400

        pass_info = valid_passes[pass_id]
        order = razorpay_client.order.create({
            "amount":   pass_info["amount"],
            "currency": "INR",
            "receipt":  f"pass_{pass_id}_{os.urandom(4).hex()}",
            "notes": {
                "pass_id":   str(pass_id),
                "pass_name": pass_info["name"],
                "grant_cs":  str(pass_info["grantCs"]),
                "grant_br":  str(pass_info["grantBr"]),
            }
        })

        return jsonify({
            "order_id":    order["id"],
            "amount":      order["amount"],
            "currency":    order["currency"],
            "key_id":      RAZORPAY_KEY_ID,
            "pass_id":     pass_id,
            "grant_cs":    pass_info["grantCs"],
            "grant_br":    pass_info["grantBr"],
            "grant_coins": pass_info.get("grantCoins", 0),
            "pass_name":   pass_info["name"],
        }), 200

    except razorpay.errors.BadRequestError as e:
        return jsonify({"error": f"Razorpay error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Server error: {str(e)}"}), 500


# ─── Verify Payment Signature ─────────────────────────────────────────────────
@app.route("/api/verify-payment", methods=["POST"])
def verify_payment():
    try:
        data = request.get_json() or {}

        razorpay_order_id   = data.get("razorpay_order_id", "")
        razorpay_payment_id = data.get("razorpay_payment_id", "")
        razorpay_signature  = data.get("razorpay_signature", "")
        pass_id             = int(data.get("pass_id", 0))
        user_uid            = data.get("user_uid", "Unknown")
        user_ign            = data.get("user_ign", "Player")
        supabase_id         = data.get("supabase_id", "")

        if not all([razorpay_order_id, razorpay_payment_id, razorpay_signature]):
            return jsonify({"success": False, "error": "Missing payment fields"}), 400

        valid_passes = get_current_passes()
        if pass_id not in valid_passes:
            return jsonify({"success": False, "error": "Invalid pass ID"}), 400

        # ── HMAC-SHA256 Signature Verification ──
        message = f"{razorpay_order_id}|{razorpay_payment_id}"
        mac = hmac.new(
            RAZORPAY_KEY_SECRET.encode("utf-8"),
            message.encode("utf-8"),
            hashlib.sha256
        )
        expected_signature = mac.hexdigest()

        if not hmac.compare_digest(expected_signature, razorpay_signature):
            return jsonify({"success": False, "error": "Payment signature invalid — possible fraud attempt"}), 400

        # ── Fetch payment details from Razorpay ──
        payment = razorpay_client.payment.fetch(razorpay_payment_id)
        if payment.get("status") not in ["captured", "authorized"]:
            return jsonify({"success": False, "error": f"Payment not captured (status: {payment.get('status')})"}), 400

        pass_info = valid_passes[pass_id]

        # ── Credit tickets & coins to user in Supabase ──
        if supabase_id:
            try:
                row = find_user_by_identifier(supabase_id)
                if row:
                    new_coins = int(row.get("coins", 0) or 0) + pass_info.get("grantCoins", 0)
                    new_cs    = int(row.get("cs_tickets", 0) or 0) + pass_info["grantCs"]
                    new_br    = int(row.get("br_tickets", 0) or 0) + pass_info["grantBr"]
                    supabase.table("users").update({
                        "coins":      new_coins,
                        "cs_tickets": new_cs,
                        "br_tickets": new_br,
                    }).eq("supabase_id", supabase_id).execute()
            except Exception as e:
                print(f"[PAYMENT] Failed to credit balance to user {supabase_id}: {e}")

        # ── Record transaction in store ──
        store        = load_store()
        transactions = store.get("transactions", [])
        new_tx = {
            "id":        f"tx_{os.urandom(4).hex()}",
            "paymentId": razorpay_payment_id,
            "orderId":   razorpay_order_id,
            "passId":    pass_id,
            "passTitle": pass_info["name"],
            "amount":    pass_info["amount"] / 100,
            "currency":  "INR",
            "userUid":   user_uid,
            "userIgn":   user_ign,
            "status":    "captured",
            "createdAt": datetime.now().isoformat(),
        }
        transactions.insert(0, new_tx)
        store["transactions"] = transactions[:200]

        # Audit log
        audit_logs = store.get("auditLogs", [])
        audit_logs.insert(0, {
            "id":        f"log_{os.urandom(4).hex()}",
            "action":    "PAYMENT_CAPTURED",
            "category":  "PAYMENTS",
            "details":   f"Payment ₹{pass_info['amount']/100} captured for {pass_info['name']} by {user_ign} (UID: {user_uid}). ID: {razorpay_payment_id}",
            "timestamp": datetime.now().isoformat(),
            "adminUser": "SYSTEM / RAZORPAY",
        })
        store["auditLogs"] = audit_logs[:300]
        save_store(store)

        return jsonify({
            "success":     True,
            "payment_id":  razorpay_payment_id,
            "pass_id":     pass_id,
            "grant_cs":    pass_info["grantCs"],
            "grant_br":    pass_info["grantBr"],
            "grant_coins": pass_info.get("grantCoins", 0),
            "pass_name":   pass_info["name"],
            "transaction": new_tx,
        }), 200

    except razorpay.errors.BadRequestError as e:
        return jsonify({"success": False, "error": f"Razorpay API error: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": f"Server error: {str(e)}"}), 500


# ─── Admin Sync Endpoints ─────────────────────────────────────────────────────
@app.route("/api/admin/data", methods=["GET"])
def get_admin_data():
    """Fetch stored admin state with authoritative real users from Supabase."""
    store = load_store()
    try:
        res = supabase.table("users").select("*").order("join_date", desc=True).execute()
        store["users"] = [user_row_to_dict(r) for r in (res.data or [])]
    except Exception as e:
        print(f"[ADMIN_DATA] Error fetching users from Supabase: {e}")
    return jsonify(store), 200


@app.route("/api/admin/sync", methods=["POST"])
def sync_admin_data():
    """
    Update and persist admin data from the frontend dashboard into Supabase.
    Any uploaded base64 images are automatically decoded and saved as physical
    image files on disk in server/uploads/, and replaced with lightweight URL paths.

    IMPORTANT: 'transactions' and 'users' are NEVER accepted from this endpoint.
    - transactions: written exclusively by verify_payment (Razorpay webhook-style)
    - users: managed via /api/users/* dedicated endpoints
    Allowing the frontend to overwrite these would cause real payment/user records
    to be wiped by a stale empty-array from localStorage on cache clear.
    """
    try:
        payload = request.get_json() or {}
        # Strip backend-owned fields — these must NEVER be overwritten from the frontend
        payload.pop("transactions", None)
        payload.pop("users", None)
        payload.pop("usersList", None)
        update_collections(payload)
        return jsonify({"success": True, "message": "Admin data synchronized successfully"}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Image Upload & Static File Serving ───────────────────────────────────────
@app.route("/api/uploads/<path:filename>", methods=["GET"])
def serve_upload(filename):
    """Serve uploaded tournament and reward images from disk."""
    return send_from_directory(UPLOAD_DIR, filename)


@app.route("/api/upload", methods=["POST"])
def upload_file():
    """Upload image file (multipart or base64) and get persistent image URL."""
    try:
        # Multipart form file upload
        if 'file' in request.files:
            f = request.files['file']
            if f.filename:
                import uuid
                ext      = f.filename.rsplit('.', 1)[-1].lower() if '.' in f.filename else 'png'
                filename = f"img_{uuid.uuid4().hex[:12]}.{ext}"
                filepath = os.path.join(UPLOAD_DIR, filename)
                f.save(filepath)
                return jsonify({"success": True, "url": f"/api/uploads/{filename}"}), 200

        # Base64 JSON upload
        body     = request.get_json() or {}
        img_data = body.get('image') or body.get('data')
        if img_data and isinstance(img_data, str) and img_data.startswith('data:image/'):
            url = save_base64_image(img_data)
            return jsonify({"success": True, "url": url}), 200

        return jsonify({"success": False, "error": "No valid file or image data provided"}), 400
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Reward Redemptions (XO Coins) Endpoints ─────────────────────────────────
@app.route("/api/redemptions", methods=["GET"])
def get_redemptions():
    """Fetch all store/reward redemptions made with XO coins."""
    try:
        store = load_store()
        return jsonify(store.get("redemptions", [])), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/redemptions", methods=["POST"])
def create_redemption():
    """Record a new reward redemption by a user."""
    try:
        data         = request.get_json() or {}
        store        = load_store()
        redemptions  = store.get("redemptions", [])

        user_uid     = str(data.get("userUid", "")).strip()
        user_ign     = str(data.get("userIgn", "")).strip() or "Player"
        reward_id    = data.get("rewardId")
        reward_title = data.get("rewardTitle", "Reward")
        reward_type  = data.get("rewardType", "general")
        cost         = int(data.get("cost", 0))

        new_redemption = {
            "id":              f"red_{int(datetime.now().timestamp()*1000)}_{os.urandom(3).hex()}",
            "rewardId":        reward_id,
            "rewardTitle":     reward_title,
            "rewardType":      reward_type,
            "cost":            cost,
            "userUid":         user_uid,
            "userIgn":         user_ign,
            "userEmail":       data.get("userEmail", ""),
            "status":          "pending",
            "deliveryDetails": "",
            "createdAt":       datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p"),
            "timestamp":       int(datetime.now().timestamp() * 1000),
        }

        redemptions.insert(0, new_redemption)
        store["redemptions"] = redemptions[:300]

        # Log in audit
        audit_logs = store.get("auditLogs", [])
        audit_logs.insert(0, {
            "id":        f"log_{os.urandom(4).hex()}",
            "action":    "REWARD_REDEEMED",
            "category":  "STORE",
            "details":   f"User {user_ign} (UID: {user_uid}) redeemed '{reward_title}' for {cost} XO Coins.",
            "timestamp": datetime.now().isoformat(),
            "adminUser": "SYSTEM",
        })
        store["auditLogs"] = audit_logs[:300]

        save_store(store)
        return jsonify({"success": True, "redemption": new_redemption}), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/redemptions/<redemption_id>/status", methods=["PUT", "POST"])
def update_redemption_status(redemption_id):
    """Admin updates redemption status (pending / delivered / cancelled) and optional delivery details."""
    try:
        data             = request.get_json() or {}
        new_status       = data.get("status", "delivered")
        delivery_details = data.get("deliveryDetails", "")

        store       = load_store()
        redemptions = store.get("redemptions", [])

        updated = False
        target  = None
        for r in redemptions:
            if r.get("id") == redemption_id:
                r["status"] = new_status
                if delivery_details is not None:
                    r["deliveryDetails"] = delivery_details
                r["updatedAt"] = datetime.now().strftime("%d/%m/%Y, %I:%M:%S %p")
                target  = r
                updated = True
                break

        if not updated:
            return jsonify({"success": False, "error": "Redemption not found"}), 404

        store["redemptions"] = redemptions

        audit_logs = store.get("auditLogs", [])
        audit_logs.insert(0, {
            "id":        f"log_{os.urandom(4).hex()}",
            "action":    "REDEMPTION_UPDATED",
            "category":  "STORE",
            "details":   f"Redemption {redemption_id} for {target.get('rewardTitle')} marked '{new_status}' (UID: {target.get('userUid')}). Note: {delivery_details}",
            "timestamp": datetime.now().isoformat(),
            "adminUser": data.get("adminUser", "ADMIN"),
        })
        store["auditLogs"] = audit_logs[:300]

        save_store(store)
        return jsonify({"success": True, "redemption": target}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Contact & Support Requests Endpoints ─────────────────────────────────────
@app.route('/api/contact-requests', methods=['GET', 'POST'])
def handle_contact_requests():
    try:
        if request.method == 'POST':
            data   = request.json or {}
            req_id = data.get('id') or f"req_{int(datetime.now().timestamp() * 1000)}"
            supabase.table("contact_requests").upsert({
                "id":           req_id,
                "name":         data.get('name', ''),
                "email":        data.get('email', ''),
                "uid":          data.get('uid', 'N/A'),
                "category":     data.get('category', 'General Inquiry'),
                "priority":     data.get('priority', 'Normal'),
                "message":      data.get('message', ''),
                "submitted_at": data.get('submittedAt') or datetime.now().isoformat(),
                "status":       data.get('status', 'new'),
            }, on_conflict="id").execute()
            return jsonify({"success": True, "id": req_id}), 201

        else:
            res   = supabase.table("contact_requests").select("*").order("submitted_at", desc=True).execute()
            items = []
            for r in (res.data or []):
                items.append({
                    "id":          r["id"],
                    "name":        r["name"],
                    "email":       r["email"],
                    "uid":         r["uid"],
                    "category":    r["category"],
                    "priority":    r["priority"],
                    "message":     r["message"],
                    "submittedAt": r["submitted_at"],
                    "status":      r["status"],
                })
            return jsonify({"success": True, "requests": items}), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route('/api/contact-requests/<req_id>', methods=['DELETE', 'PATCH'])
def manage_contact_request(req_id):
    try:
        if request.method == 'DELETE':
            supabase.table("contact_requests").delete().eq("id", req_id).execute()
            return jsonify({"success": True, "deleted": req_id}), 200
        elif request.method == 'PATCH':
            data       = request.json or {}
            new_status = data.get('status', 'resolved')
            supabase.table("contact_requests").update({"status": new_status}).eq("id", req_id).execute()
            return jsonify({"success": True, "updated": req_id, "status": new_status}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ─── Run ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    if sys.stdout.encoding != 'utf-8':
        try:
            sys.stdout.reconfigure(encoding='utf-8')
        except Exception:
            pass

    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        print("\n[WARNING] Razorpay keys not set in server/.env")
        print("   Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to enable payments.\n")
    else:
        print(f"\n[OK] Razorpay connected: {RAZORPAY_KEY_ID[:12]}...")

    if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
        print("\n[ERROR] SUPABASE_URL and SUPABASE_SERVICE_KEY not set in server/.env!")
        print("   The server cannot function without a database connection.\n")
    else:
        print(f"[OK] Supabase connected: {SUPABASE_URL}")

    port = int(os.getenv("PORT", 5001))
    print(f"[OK] Flask backend running on port {port}")
    app.run(debug=True, host="0.0.0.0", port=port)
