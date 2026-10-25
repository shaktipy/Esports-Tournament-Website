import os
import sys

# ─── Ensure server directory is on sys.path ───────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
SERVER_DIR = os.path.join(BASE_DIR, "server")
DIST_DIR = os.path.join(BASE_DIR, "dist")

if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from dotenv import load_dotenv
# Load environment variables from .env in root or server if present
load_dotenv(os.path.join(BASE_DIR, ".env"))
load_dotenv(os.path.join(SERVER_DIR, ".env"))

# Import Flask app instance from server.app
from server.app import app
from flask import send_from_directory

# ─── Serve React Production Build (dist) ──────────────────────────────────────
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_spa(path):
    # If the request is for an existing file inside dist/ (e.g., assets, favicon, tokens)
    if path:
        target_file = os.path.join(DIST_DIR, path)
        if os.path.isfile(target_file):
            return send_from_directory(DIST_DIR, path)

    # For all SPA client-side routes (or index), serve dist/index.html
    index_file = os.path.join(DIST_DIR, "index.html")
    if os.path.isfile(index_file):
        return send_from_directory(DIST_DIR, "index.html")

    return (
        "<h3>Frontend build (dist) not found. Run 'npm run build' before deployment.</h3>",
        404,
    )

if __name__ == "__main__":
    port = int(os.getenv("PORT", 5001))
    app.run(host="0.0.0.0", port=port)
