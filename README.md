# 🎮 XO Esports — Free Fire Fan Rewards & Esports Platform

<div align="center">

**A full-stack fan engagement & esports platform built for the Free Fire gaming community**

Watch streams · Complete missions · Earn coins · Join tournaments · Win rewards

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-002970?style=for-the-badge)](https://razorpay.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker)](https://www.docker.com/)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Running with Docker (Recommended)](#-running-with-docker-recommended)
- [Getting Started (Manual)](#-getting-started-manual)
- [Database Migration (SQLite → Supabase)](#-database-migration-sqlite--supabase)
- [Pages & Routes](#-pages--routes)
- [Admin Panel](#-admin-panel)
- [Esports Mode](#-esports-mode)
- [Reward System](#-reward-system)
- [Security & Auth](#-security--auth)

---

## 🕹️ About the Project

**XO Esports** is a full-stack fan engagement platform built specifically for the Free Fire gaming community. It rewards users for watching live streams and videos, completing daily/weekly/monthly missions, and participating in esports tournaments and giveaways.

The platform has **three distinct modes**:
1. **Main Platform** — Coin-based rewards, tasks, redeem codes, giveaways
2. **Esports Mode** — Tournament registration, passes, esports-specific giveaways
3. **Admin Panel** — Full backend management for admins

> Built and launched in **2026** — all policies and terms reflect the current year.

---

## ✨ Features

### 🔒 Authentication & Security
- **Auth Wall** — All routes are protected; unauthenticated users are redirected to a full-screen login page
- Supabase-powered email/password authentication
- `/login` auto-redirects logged-in users away
- Legal pages (`/privacy`, `/terms`, `/refund`, `/cookies`) are publicly accessible without login
- Role-based access control: **Player** vs **Admin**
- **Banned/Suspended account detection** — banned users see a dedicated modal and cannot access the platform

### 🪙 Rewards & Coins
- Earn **XO Coins** by watching live streams and YouTube videos
- **Daily Login Bonus** with streak tracking
- **Spin the Reward Wheel** for random prizes
- **Monthly Reward Calendar** with progressive day-by-day unlocks
- Real-time coin balance displayed in the navbar

### 📋 Mission System
- **Daily Missions** — Watch live/video content (15, 30, 60, 90, 120, 150 min)
- **Weekly Missions** — Accumulate 5, 10, 15, 20 hours of watch time
- **Monthly Missions** — Long-form engagement (45, 50, 54, 72 hours)
- **Extra Reward** — Complete any 5 missions to unlock a bonus reward
- Mission rewards support Coins, Diamond Vouchers, Top-up Tokens, and Redeem Codes
- Admin-controlled **Giveaway Missions Builder** — create custom watch-time–based giveaway tasks

### 🎟️ Redeem System
- Redeem XO Coins for **CS Tickets**, **BR Tickets**, and exclusive rewards
- Admin-managed redeem codes with quantity & expiry controls
- Full redemption history tracking per user

### 🎁 Giveaways
- Active & upcoming giveaway listings (main platform + esports-exclusive)
- **Watch-time verification** — interactive proof-of-watch flow before entry is counted
- Entry tracking per user
- Admin-controlled prize pool management

### 🔔 Notifications
- Real-time sliding toast notifications
- Notification center with read/unread state
- Confirmation dialog before clearing all notifications
- Global announcement marquee ticker
- Admin can send push notifications to individual users (e.g. unregistration alerts)

### 🏆 Tournament Registration
- **Strict ticket balance enforcement** — users must hold enough CS/BR tickets to register
- **Slot limit enforcement** — registration is blocked when all match slots are full
- Supports **Solo**, **Duo**, and **Squad (4-player + optional sub)** modes
- Full form validation: IGN (min 3 chars), UID (6–14 digits), valid 10-digit WhatsApp number
- **Duplicate UID detection** — prevents the same player from registering twice
- **Disqualification checks** — disqualified players cannot re-register under any roster
- Random slot assignment from available pool
- Empty form state on open — no pre-filled defaults or hardcoded placeholder data
- Squad WhatsApp field is fully contained within the modal viewport

---

## 🏆 Esports Mode

A dedicated section for competitive players:

| Page | Description |
|------|-------------|
| 🏠 Esports Home | Tournament listings with live slot counts & registration |
| 🎫 Passes | Purchase CS/BR tournament passes via Razorpay |
| 🎁 Giveaways | Esports-exclusive prize giveaways with watch-time verification |
| 🔓 Redeem | Redeem esports rewards & codes |

- **Razorpay Integration** — Secure online payment for tournament passes
- **Dedicated Esports Navbar** — Separate navigation with live ticket balance display
- **Tournament Registration Modal** — Full validated form (team info, UID, phone, slot assignment)
- **Ticket-gated registration** — users without sufficient tickets are blocked from registering

---

## 🔧 Tech Stack

### Frontend
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 19.x | UI Framework |
| Vite | 8.x | Build Tool & Dev Server |
| React Router DOM | 7.x | Client-side Routing |
| Lucide React | 0.577+ | Icon Library |
| Supabase JS | 2.x | Auth & Database Client |
| Vanilla CSS | — | Styling (no framework) |

### Backend
| Technology | Version | Purpose |
|-----------|---------|---------|
| Flask | 3.0+ | Python Web Server |
| Flask-CORS | 4.0+ | Cross-Origin Resource Sharing |
| Razorpay SDK | 1.4+ | Payment Processing |
| Python-dotenv | 1.0+ | Environment Variables |
| Supabase Python | 2.x | PostgreSQL Data Layer |

### Infrastructure
| Tool | Purpose |
|------|---------|
| Supabase PostgreSQL | Primary database (users, collections) |
| Docker + Nginx Alpine | Production container setup |
| Azure App Service | Cloud deployment target |
| GitHub Actions | CI/CD pipeline |

---

## 📁 Project Structure

```
FF Project/
├── index.html                  # HTML entry point
├── package.json                # Frontend dependencies
├── vite.config.js              # Vite configuration
├── eslint.config.js            # ESLint configuration
├── .env                        # Frontend environment variables
├── .env.example                # Frontend env template
├── Dockerfile                  # Multi-stage Docker build
├── docker-compose.yml          # Full-stack Docker orchestration
├── nginx.conf                  # Nginx config for production serving
├── requirements.txt            # Python dependencies (root-level alias)
├── .gitignore                  # Git ignore rules
│
├── .github/                    # GitHub Actions CI/CD workflows
│
├── public/                     # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   └── tokens/                 # Game token images
│       ├── xo-coin.png
│       ├── cs-ticket.png
│       ├── br-ticket.png
│       ├── mascot-logo.png
│       ├── harsh-avatar.png
│       └── harsh-mascot.png
│
├── src/                        # Frontend source code
│   ├── main.jsx                # React app entry point
│   ├── App.jsx                 # Root component & routing
│   ├── App.css                 # Global app styles
│   ├── index.css               # Base CSS variables & resets
│   │
│   ├── context/                # Global state management
│   │   ├── GameContext.jsx     # User, coins, notifications, rewards, tournament registration
│   │   └── AdminContext.jsx    # All admin data & operations (incl. unregister from tournament)
│   │
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.jsx/.css               # Main navigation bar (coin + ticket balances)
│   │   ├── EsportsNavbar.jsx/.css        # Esports-specific navbar
│   │   ├── AuthModal.jsx/.css            # Login/Register modal
│   │   ├── BannedModal.jsx/.css          # Banned/suspended account notice
│   │   ├── CookieConsent.jsx/.css        # GDPR-style cookie consent banner
│   │   ├── AnnouncementBar.jsx/.css      # Marquee announcement ticker
│   │   ├── DailyLogin.jsx/.css           # Daily login bonus popup
│   │   ├── RewardWheel.jsx/.css          # Spin-the-wheel component
│   │   ├── NotificationCenter.jsx/.css   # Notification bell & panel
│   │   ├── SlidingToast.jsx/.css         # Slide-in toast notifications
│   │   ├── TournamentRegisterModal.jsx/.css  # Tournament registration (strict validation)
│   │   ├── ProtectedRoute.jsx            # Auth guard wrapper for all private routes
│   │   ├── Footer.jsx/.css               # Site-wide footer
│   │   └── ImageUploadField.jsx          # Image upload with preview
│   │
│   ├── pages/                  # Page-level components
│   │   ├── Home.jsx/.css                # Main dashboard
│   │   ├── Tasks.jsx/.css               # Mission board
│   │   ├── Redeem.jsx/.css              # Coin redemption
│   │   ├── Giveaways.jsx/.css           # Giveaway listings
│   │   │
│   │   ├── admin/              # Admin panel pages
│   │   │   ├── AdminDashboard.jsx/.css  # Admin shell & sidebar
│   │   │   ├── AdminOverview.jsx        # Platform stats & KPIs
│   │   │   ├── AdminUsers.jsx           # User management (ban, edit, coins)
│   │   │   ├── AdminTournaments.jsx     # Tournament management (create/edit/disqualify/unregister)
│   │   │   ├── AdminGiveawaysStore.jsx  # Giveaways, missions builder & reward store
│   │   │   ├── AdminMissions.jsx/.css   # Mission configuration panel
│   │   │   ├── AdminRedeemCodes.jsx     # Redeem code generation & management
│   │   │   ├── AdminRedemptions.jsx     # Redemption request processing
│   │   │   ├── AdminPayments.jsx        # Payment record viewer
│   │   │   ├── AdminPasses.jsx          # Tournament pass sales management
│   │   │   ├── AdminAnnouncements.jsx   # Platform-wide announcement manager
│   │   │   ├── AdminContacts.jsx        # Contact/support request management
│   │   │   └── AdminAuditLogs.jsx       # Full activity audit trail
│   │   │
│   │   ├── esports/            # Esports mode pages
│   │   │   ├── EsportsHome.jsx/.css     # Esports hub & tournament browser
│   │   │   ├── EsportsPasses.jsx/.css   # Buy tournament passes
│   │   │   ├── EsportsGiveaways.jsx/.css # Esports-exclusive giveaways
│   │   │   └── EsportsRedeem.jsx/.css   # Esports reward redemption
│   │   │
│   │   └── legal/              # Legal & policy pages (public — no auth required)
│   │       ├── PrivacyPolicy.jsx        # Privacy Policy (effective 2026)
│   │       ├── TermsConditions.jsx      # Terms & Conditions (effective 2026)
│   │       ├── RefundPolicy.jsx         # Refund & Cancellation Policy (2026)
│   │       ├── CookiesPolicy.jsx        # Cookie Policy (2026)
│   │       └── LegalPage.css            # Shared legal page styles
│   │
│   ├── layouts/                # Layout wrappers
│   │   └── EsportsLayout.jsx/.css  # Esports section layout
│   │
│   ├── services/               # External service integrations
│   │   └── youtube.js          # YouTube watch-time tracking (cached via backend)
│   │
│   ├── utils/                  # Utility helpers
│   │   ├── tournamentSlots.js  # Slot calculation, availability & random assignment
│   │   ├── defaultMissions.js  # Default mission definitions
│   │   └── monthlyRewards.js   # Monthly reward calendar logic
│   │
│   └── lib/                    # Library configurations
│       └── supabase.js         # Supabase client initialization
│
└── server/                     # Python Flask backend
    ├── app.py                  # Main Flask app & all API routes
    ├── storage.py              # Supabase-backed data storage layer
    ├── requirements.txt        # Python dependencies
    ├── .env                    # Server environment variables (git-ignored)
    ├── .env.example            # Environment variable template
    ├── supabase_schema.sql     # PostgreSQL schema for Supabase setup
    ├── migrate_to_supabase.py  # One-time SQLite → Supabase migration script
    └── data/                   # Legacy SQLite files (pre-migration)
```

---

## 🐳 Running with Docker (Recommended)

Run the full stack (Frontend + Backend) with a single command:

```bash
# 1. Start Docker Desktop, then run:
docker compose up --build -d
```

- **Frontend (Web App):** [http://localhost:3000](http://localhost:3000) — served via optimized Nginx Alpine
- **Backend API:** [http://localhost:5001](http://localhost:5001) — Flask + Supabase PostgreSQL
- **API Health Check:** [http://localhost:5001/api/health](http://localhost:5001/api/health)

```bash
# View live container logs
docker compose logs -f

# Stop containers
docker compose down
```

---

## 🚀 Getting Started (Manual)

### Prerequisites

- **Node.js** v18+ and **npm**
- **Python** 3.10+
- **Supabase** account (free tier works)
- **Razorpay** account (for payment features)

### Frontend Setup

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd "FF Project"

# 2. Install dependencies
npm install

# 3. Configure environment variables
# Copy .env.example → .env and fill in:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_SERVER_URL=http://localhost:5001
# VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# 4. Start development server
npm run dev
```

Frontend available at: `http://localhost:5173`

### Backend Setup

```bash
# 1. Navigate to server directory
cd server

# 2. Create & activate virtual environment
python -m venv venv
venv\Scripts\activate       # Windows
# source venv/bin/activate  # macOS/Linux

# 3. Install Python dependencies
pip install -r requirements.txt

# 4. Configure environment variables
# Copy .env.example → .env and fill in:
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_SERVICE_KEY=your_service_role_key
# RAZORPAY_KEY_ID=rzp_live_xxxxx
# RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxx

# 5. Run the Flask server
python app.py
```

Backend API available at: `http://localhost:5001`

---

## 🗄️ Database Migration (SQLite → Supabase)

The backend was migrated from local SQLite to **Supabase PostgreSQL** for production reliability and persistence across deployments.

### Step 1 — Create tables in Supabase

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Open **SQL Editor**
3. Run the contents of [`server/supabase_schema.sql`](server/supabase_schema.sql)

### Step 2 — Set environment variables

Copy [`server/.env.example`](server/.env.example) → `server/.env` and fill in:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key   # From Project Settings → API
RAZORPAY_KEY_ID=rzp_live_xxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxx
```

> ⚠️ Use the **service_role** key (NOT the anon key) — this is backend-only and bypasses RLS.

### Step 3 — Migrate existing data (optional)

If migrating from SQLite, run once:

```bash
cd server
python migrate_to_supabase.py
```

Migrates:
- `arena.db` → `collections` table (tournaments, giveaways, store, missions, etc.)
- `users.db` → `users` table (player accounts, coins, tickets)
- `users.db` → `contact_requests` table (support tickets)

---

## 🗺️ Pages & Routes

| Route | Component | Auth Required | Description |
|-------|-----------|:---:|-------------|
| `/login` | `LoginPage` | ❌ | Full-screen login/register page |
| `/` | `Home` | ✅ | Main dashboard with hero, missions, rewards |
| `/tasks` | `Tasks` | ✅ | Daily/Weekly/Monthly mission board |
| `/redeem` | `Redeem` | ✅ | Redeem coins for tickets & codes |
| `/giveaways` | `Giveaways` | ✅ | Browse & enter giveaways |
| `/esports` | `EsportsHome` | ✅ | Esports hub & tournament browser |
| `/esports/passes` | `EsportsPasses` | ✅ | Buy tournament passes via Razorpay |
| `/esports/giveaways` | `EsportsGiveaways` | ✅ | Esports-exclusive giveaways |
| `/esports/redeem` | `EsportsRedeem` | ✅ | Redeem esports rewards |
| `/admin/*` | `AdminDashboard` | ✅ Admin | Protected admin panel |
| `/privacy` | `PrivacyPolicy` | ❌ | Privacy Policy |
| `/terms` | `TermsConditions` | ❌ | Terms & Conditions |
| `/refund` | `RefundPolicy` | ❌ | Refund Policy |
| `/cookies` | `CookiesPolicy` | ❌ | Cookie Policy |

---

## 🛡️ Admin Panel

Accessible at `/admin`, the admin panel provides complete platform control:

| Section | Features |
|---------|----------|
| 📊 **Overview** | Platform stats, active users, revenue KPIs |
| 👥 **Users** | View, ban/unban, edit accounts & coin balances |
| 🏆 **Tournaments** | Create/edit tournaments, view registrations, disqualify players, **unregister participants** |
| 🎁 **Giveaways & Store** | Manage giveaway items, reward store, and **Giveaway Missions Builder** |
| 📋 **Missions** | Configure daily/weekly/monthly mission rewards |
| 🔑 **Redeem Codes** | Generate & manage redemption codes with expiry & quantity |
| 📨 **Redemptions** | Process pending coin redemption requests |
| 💳 **Payments** | View & manage Razorpay payment records |
| 🎫 **Passes** | Manage tournament pass sales |
| 📢 **Announcements** | Broadcast platform-wide announcements & marquee text |
| 💬 **Contacts** | Handle user support/contact requests |
| 📋 **Audit Logs** | Full activity trail of all admin actions |

### Admin Tournament Controls

- **Disqualify** — removes a participant and records a reason; blocks re-registration
- **Unregister** — cleanly removes a participant without a penalty, sends them a notification

---

## 🎯 Reward System

```
XO Coins ──► Redeem for Tickets / Codes / Items
     ▲
     │
Watch Streams ──► Earn coins per minute watched
     │
Complete Missions ──► Bonus coin rewards
     │
Daily Login ──► Streak-based bonus coins
     │
Spin Wheel ──► Random coin/reward prizes
```

### Currency Types

| Token | Description |
|-------|-------------|
| 🪙 XO Coins | Primary platform currency, earned by engagement |
| 🎟️ CS Ticket | Clash Squad tournament entry pass |
| 🎟️ BR Ticket | Battle Royale tournament entry pass |

CS and BR Tickets are shown in the navbar and are consumed during tournament registration (1 ticket per player in the roster).

---

## 🔒 Security & Auth

- **All routes protected** by a `ProtectedRoute` component — unauthenticated users always land on `/login`
- **Banned account detection** — banned/suspended users are shown a `BannedModal` and blocked from all actions
- **Tournament anti-abuse**:
  - Ticket balance verified before registration — insufficient tickets block the form submission
  - Slot availability checked in real-time; no over-booking possible
  - Duplicate UID detection prevents the same player registering twice in one tournament
  - Disqualified players cannot re-enter under any roster
- **Admin actions are audit-logged** — every admin operation (ban, disqualify, unregister, code generation, etc.) is recorded with timestamp and acting admin

---

## 📄 License

This project is private. All rights reserved.
© 2026 XO Esports. All rights reserved.

---

<div align="center">

**Made with ❤️ for the Free Fire community**

</div>
