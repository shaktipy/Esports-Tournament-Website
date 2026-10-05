# 🎮 XO Esports — Free Fire Fan Rewards Platform

<div align="center">

**A feature-rich gaming rewards & esports platform for Free Fire fans**

Watch streams · Complete missions · Earn coins · Join tournaments · Win rewards

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Flask](https://img.shields.io/badge/Flask-3.0-000000?style=for-the-badge&logo=flask)](https://flask.palletsprojects.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-002970?style=for-the-badge)](https://razorpay.com/)

</div>

---

## 📋 Table of Contents

- [About the Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Pages & Routes](#-pages--routes)
- [Admin Panel](#-admin-panel)
- [Esports Mode](#-esports-mode)
- [Reward System](#-reward-system)

---

## 🕹️ About the Project

**XO Esports** is a full-stack fan engagement platform built specifically for the Free Fire gaming community. It rewards users for watching live streams and videos, completing daily/weekly/monthly missions, and participating in esports tournaments and giveaways.

The platform has **three distinct modes**:
1. **Main Platform** — Coin-based rewards, tasks, redeem codes, giveaways
2. **Esports Mode** — Tournament registration, passes, esports-specific giveaways
3. **Admin Panel** — Full backend management for admins

---

## ✨ Features

### 🪙 Rewards & Coins
- Earn **XO Coins** by watching live streams and YouTube videos
- **Daily Login Bonus** with streak tracking
- **Spin the Reward Wheel** for random prizes
- **Monthly Reward Calendar** with progressive unlocks
- Real-time coin balance updates

### 📋 Mission System
- **Daily Missions** — Watch live/video content (15, 30, 60, 90, 120, 150 min)
- **Weekly Missions** — Accumulate 5, 10, 15, 20 hours of watch time
- **Monthly Missions** — Long-form engagement (45, 50, 54, 72 hours)
- **Extra Reward** — Complete any 5 missions to unlock a bonus reward
- Missions support Coins, Diamond Vouchers, Top-up Tokens, and Redeem Codes

### 🎟️ Redeem System
- Redeem XO Coins for **CS Tickets**, **BR Tickets**, and exclusive rewards
- Admin-managed redeem codes with quantity & expiry controls
- Full redemption history tracking per user

### 🎁 Giveaways
- Active & upcoming giveaway listings
- Entry tracking per user
- Admin-controlled prize pool management

### 🔔 Notifications
- Real-time sliding toast notifications
- Notification center with read/unread state
- Global announcement marquee ticker

### 🛡️ Authentication
- Supabase-powered email/password authentication
- User profile with **In-Game Name** and **Game UID**
- Role-based access control (Player / Admin)

---

## 🏆 Esports Mode

A dedicated section for competitive players:

| Page | Description |
|------|-------------|
| 🏠 Esports Home | Tournament listings, featured matches |
| 🎫 Passes | Purchase CS/BR tournament passes via Razorpay |
| 🎁 Giveaways | Esports-exclusive prize giveaways |
| 🔓 Redeem | Redeem esports rewards & codes |

- **Razorpay Integration** — Secure online payment for tournament passes
- **Dedicated Esports Navbar** — Separate navigation with user profile
- **Tournament Registration Modal** — Full form with team info, UID, payment

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
| SQLite | Built-in | Users & Data Persistence |

---

## 📁 Project Structure

```
FF Project/
├── index.html                 # HTML entry point
├── package.json               # Frontend dependencies
├── vite.config.js             # Vite configuration
├── eslint.config.js           # ESLint configuration
├── .env                       # Frontend environment variables
├── .gitignore                 # Git ignore rules
│
├── public/                    # Static assets
│   ├── favicon.svg
│   ├── icons.svg
│   └── tokens/                # Game token images
│       ├── xo-coin.png
│       ├── cs-ticket.png
│       ├── br-ticket.png
│       ├── mascot-logo.png
│       ├── harsh-avatar.png
│       └── harsh-mascot.png
│
├── src/                       # Frontend source code
│   ├── main.jsx               # React app entry point
│   ├── App.jsx                # Root component & routing
│   ├── App.css                # Global app styles
│   ├── index.css              # Base CSS variables & resets
│   │
│   ├── context/               # Global state management
│   │   ├── GameContext.jsx    # User, coins, notifications, rewards
│   │   └── AdminContext.jsx   # All admin data & operations
│   │
│   ├── components/            # Reusable UI components
│   │   ├── Navbar.jsx/.css              # Main navigation bar
│   │   ├── EsportsNavbar.jsx/.css       # Esports-specific navbar
│   │   ├── AuthModal.jsx/.css           # Login/Register modal
│   │   ├── AnnouncementBar.jsx/.css     # Marquee announcement ticker
│   │   ├── DailyLogin.jsx/.css          # Daily login bonus popup
│   │   ├── RewardWheel.jsx/.css         # Spin-the-wheel component
│   │   ├── NotificationCenter.jsx/.css  # Notification bell & panel
│   │   ├── SlidingToast.jsx/.css        # Slide-in toast notifications
│   │   ├── TournamentRegisterModal.jsx/.css  # Tournament registration
│   │   └── ImageUploadField.jsx         # Image upload with preview
│   │
│   ├── pages/                 # Page-level components
│   │   ├── Home.jsx/.css               # Main dashboard
│   │   ├── Tasks.jsx/.css              # Mission board
│   │   ├── Redeem.jsx/.css             # Coin redemption
│   │   ├── Giveaways.jsx/.css          # Giveaway listings
│   │   │
│   │   ├── admin/             # Admin panel pages
│   │   │   ├── AdminDashboard.jsx/.css  # Admin shell & sidebar
│   │   │   ├── AdminOverview.jsx        # Stats dashboard
│   │   │   ├── AdminUsers.jsx           # User management
│   │   │   ├── AdminTournaments.jsx     # Tournament management
│   │   │   ├── AdminGiveawaysStore.jsx  # Giveaways & store mgmt
│   │   │   ├── AdminRedeemCodes.jsx     # Redeem code management
│   │   │   ├── AdminRedemptions.jsx     # Redemption requests
│   │   │   ├── AdminPayments.jsx        # Payment records
│   │   │   ├── AdminPasses.jsx          # Pass management
│   │   │   ├── AdminAnnouncements.jsx   # Announcement manager
│   │   │   └── AdminAuditLogs.jsx       # Activity audit logs
│   │   │
│   │   └── esports/           # Esports mode pages
│   │       ├── EsportsHome.jsx/.css     # Esports hub
│   │       ├── EsportsPasses.jsx/.css   # Tournament passes
│   │       ├── EsportsGiveaways.jsx/.css # Esports giveaways
│   │       └── EsportsRedeem.jsx/.css   # Esports redemption
│   │
│   ├── layouts/               # Layout wrappers
│   │   └── EsportsLayout.jsx/.css  # Esports section layout
│   │
│   ├── services/              # External service integrations
│   │   └── youtube.js         # YouTube watch-time tracking
│   │
│   ├── utils/                 # Utility helpers
│   │   └── monthlyRewards.js  # Monthly reward calendar logic
│   │
│   └── lib/                   # Library configurations
│       └── supabase.js        # Supabase client initialization
│
└── server/                    # Python Flask backend
    ├── app.py                 # Main Flask app & all API routes
    ├── storage.py             # JSON/file-based data storage layer
    ├── requirements.txt       # Python dependencies
    ├── .env                   # Server environment variables
    ├── data/                  # SQLite DBs & JSON data files
    └── uploads/               # User-uploaded images
```

---

## 🚀 Getting Started

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
# Create .env file with:
# VITE_SUPABASE_URL=your_supabase_project_url
# VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
# VITE_SERVER_URL=http://localhost:5000
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

# 4. Configure environment variables in server/.env:
# RAZORPAY_KEY_ID=your_razorpay_key_id
# RAZORPAY_KEY_SECRET=your_razorpay_key_secret

# 5. Run the Flask server
python app.py
```

Backend API available at: `http://localhost:5000`

---

## 🗺️ Pages & Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | `Home` | Main dashboard with hero, missions, rewards |
| `/tasks` | `Tasks` | Daily/Weekly/Monthly mission board |
| `/redeem` | `Redeem` | Redeem coins for tickets & codes |
| `/giveaways` | `Giveaways` | Browse & enter giveaways |
| `/esports` | `EsportsHome` | Esports hub & tournament browser |
| `/esports/passes` | `EsportsPasses` | Buy tournament passes |
| `/esports/giveaways` | `EsportsGiveaways` | Esports exclusive giveaways |
| `/esports/redeem` | `EsportsRedeem` | Redeem esports rewards |
| `/admin/*` | `AdminDashboard` | Protected admin panel |

---

## 🛡️ Admin Panel

Accessible at `/admin`, the admin panel provides complete platform control:

| Section | Features |
|---------|----------|
| 📊 **Overview** | Platform stats, active users, revenue |
| 👥 **Users** | View, ban, edit accounts & coin balances |
| 🏆 **Tournaments** | Create/edit tournaments, manage registrations |
| 🎁 **Giveaways & Store** | Manage giveaway items and reward store |
| 🔑 **Redeem Codes** | Generate & manage redemption codes |
| 📨 **Redemptions** | Process pending coin redemption requests |
| 💳 **Payments** | View & manage payment records |
| 🎫 **Passes** | Manage tournament pass sales |
| 📢 **Announcements** | Broadcast platform-wide announcements |
| 📋 **Audit Logs** | Full activity trail of all admin actions |

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
| 🪙 XO Coins | Primary platform currency |
| 🎟️ CS Ticket | Clash Squad tournament entry |
| 🎟️ BR Ticket | Battle Royale tournament entry |

---

## 📄 License

This project is private. All rights reserved.

---

<div align="center">

**Made with ❤️ for the Free Fire community**

</div>
