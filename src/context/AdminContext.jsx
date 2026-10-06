import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AdminContext = createContext();

export const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL;
  if (envUrl) return envUrl.replace(/\/$/, '');
  // Using relative path ('') allows both localhost and LAN devices (phones, other PCs)
  // to seamlessly communicate via Vite's /api proxy to Flask on port 5001 without port blocking.
  return '';
};

// Single persistent BroadcastChannel across the entire browser session
let globalBroadcastChannel = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    globalBroadcastChannel = new BroadcastChannel('haarshxo_admin_sync');
  } catch (e) {
    console.warn('[AdminSync] BroadcastChannel unavailable:', e);
  }
}

// ─── Initial Mock Data ────────────────────────────────────────────────────────
export const INITIAL_TOURNAMENTS = [
  { 
    id: 'tourney_cs_1', 
    title: 'CLASH SQUAD SHOWDOWN (4v4)', 
    date: 'Tomorrow, 7:00 PM IST',
    prize: '₹25,000 + 5,000 Diamonds',
    mode: 'Squad (CS)',
    map: 'Kalahari / Bermuda CS',
    slots: '14/16 Squads',
    maxSlots: 16,
    registeredCount: 14,
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop',
    description: 'Competitive 4v4 Clash Squad. Fast rounds, high stakes, master tier teams.',
    rules: 'No character skill abuse. Gun attributes ON. Emote after knock allowed.',
    status: 'open', // open | closed | ongoing | completed | upcoming
    participants: [
      { id: 'p1', ign: 'XO_Thunder', uid: '849204812', teamName: 'Team Thunder', registeredAt: '2026-09-28 14:20', ticketUsed: '1x CS Ticket', status: 'confirmed' },
      { id: 'p2', ign: 'Soul_Mortal99', uid: '912384712', teamName: 'Soul Army', registeredAt: '2026-09-28 15:10', ticketUsed: '1x CS Ticket', status: 'confirmed' },
      { id: 'p3', ign: 'GodL_Shadow', uid: '741289301', teamName: 'GodLike Esports', registeredAt: '2026-09-28 16:45', ticketUsed: '1x CS Ticket', status: 'confirmed' },
      { id: 'p4', ign: 'Total_Ajay', uid: '632194820', teamName: 'Total Gaming B', registeredAt: '2026-09-28 17:30', ticketUsed: '1x CS Ticket', status: 'confirmed' },
    ],
    results: {
      winnersDeclared: false,
      firstPlace: { ign: '', uid: '', prize: '₹15,000 + 3,000 Diamonds' },
      secondPlace: { ign: '', uid: '', prize: '₹7,000 + 1,500 Diamonds' },
      thirdPlace: { ign: '', uid: '', prize: '₹3,000 + 500 Diamonds' },
      prizeDistributionStatus: 'Pending',
    }
  },
  { 
    id: 'tourney_br_1', 
    title: 'HAARSH XO BATTLE ROYALE INVITATIONAL', 
    date: 'Saturday, 8:30 PM IST',
    prize: '₹50,000 + 10,000 Diamonds',
    mode: 'Squad (BR)',
    map: 'Bermuda Classic',
    slots: '44/48 Teams',
    maxSlots: 48,
    registeredCount: 44,
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    description: 'Premier Battle Royale championship streamed live on HAARSH XO YouTube channel.',
    rules: 'Official FFWS points table. 12 Matches over 2 days. Hackers instantly banned.',
    status: 'open',
    participants: [
      { id: 'p5', ign: 'Hydra_Dynamo', uid: '881290342', teamName: 'Hydra Clan', registeredAt: '2026-09-27 18:00', ticketUsed: '1x BR Ticket', status: 'confirmed' },
      { id: 'p6', ign: 'Blind_Joker', uid: '445129381', teamName: 'Blind Esports', registeredAt: '2026-09-27 19:30', ticketUsed: '1x BR Ticket', status: 'confirmed' },
    ],
    results: {
      winnersDeclared: false,
      firstPlace: { ign: '', uid: '', prize: '₹30,000 + 5,000 Diamonds' },
      secondPlace: { ign: '', uid: '', prize: '₹15,000 + 3,000 Diamonds' },
      thirdPlace: { ign: '', uid: '', prize: '₹5,000 + 2,000 Diamonds' },
      prizeDistributionStatus: 'Pending',
    }
  },
  { 
    id: 'tourney_br_2', 
    title: 'LONE WOLF 1v1 CHAMPIONSHIP', 
    date: 'Sunday, 6:00 PM IST',
    prize: '₹15,000 + 2,500 Diamonds',
    mode: 'Solo (1v1)',
    map: 'Iron Cage',
    slots: '88/100 Players',
    maxSlots: 100,
    registeredCount: 88,
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    description: 'Pure 1v1 gun skill. Snipers, Desert Eagle, Shotguns only.',
    rules: 'Best of 7 rounds. Headshots only in round 3 and 7.',
    status: 'open',
    participants: [
      { id: 'p7', ign: 'SniperKing_XO', uid: '229103948', teamName: 'Solo', registeredAt: '2026-09-28 10:15', ticketUsed: '1x BR Ticket', status: 'confirmed' },
    ],
    results: {
      winnersDeclared: false,
      firstPlace: { ign: '', uid: '', prize: '₹10,000 + 1,500 Diamonds' },
      secondPlace: { ign: '', uid: '', prize: '₹3,500 + 700 Diamonds' },
      thirdPlace: { ign: '', uid: '', prize: '₹1,500 + 300 Diamonds' },
      prizeDistributionStatus: 'Pending',
    }
  },
  { 
    id: 'tourney_cs_2', 
    title: 'CS WEEKEND PRO SCRIMS', 
    date: 'Friday, 9:00 PM IST',
    prize: '₹20,000 + Custom Title',
    mode: 'Squad (CS)',
    map: 'Alpine CS',
    slots: '16/16 Squads',
    maxSlots: 16,
    registeredCount: 16,
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    description: 'Official esports scrims for verified tournament rosters.',
    rules: 'Room ID & password shared 15 mins prior in tournament lobby.',
    status: 'closed', // Slot full
    participants: [],
    results: {
      winnersDeclared: false,
      firstPlace: { ign: '', uid: '', prize: '₹12,000' },
      secondPlace: { ign: '', uid: '', prize: '₹5,000' },
      thirdPlace: { ign: '', uid: '', prize: '₹3,000' },
      prizeDistributionStatus: 'Pending',
    }
  },
  { 
    id: 'tourney_br_3', 
    title: 'BERMUDA TRIANGLE DUO CUP', 
    date: 'Next Monday, 8:00 PM IST',
    prize: '₹30,000 + 7,500 Diamonds',
    mode: 'Duo (BR)',
    map: 'Bermuda Remastered',
    slots: '22/24 Duos',
    maxSlots: 24,
    registeredCount: 22,
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop',
    description: 'Dynamic 2v2 Battle Royale survival cup. Coordinate with your duo partner.',
    rules: 'Standard duo BR rules. Revival points active until zone 4.',
    status: 'open',
    participants: [],
    results: {
      winnersDeclared: false,
      firstPlace: { ign: '', uid: '', prize: '₹18,000 + 4,000 Diamonds' },
      secondPlace: { ign: '', uid: '', prize: '₹8,000 + 2,500 Diamonds' },
      thirdPlace: { ign: '', uid: '', prize: '₹4,000 + 1,000 Diamonds' },
      prizeDistributionStatus: 'Pending',
    }
  },
  { 
    id: 'tourney_cs_3', 
    title: 'CS GRAND MASTERS ALL-STARS', 
    date: 'Completed Yesterday',
    prize: '₹40,000 + Exclusive XO Jersey',
    mode: 'Squad (CS)',
    map: 'NeXTerra / Purgatory CS',
    slots: '16/16 Squads',
    maxSlots: 16,
    registeredCount: 16,
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1974&auto=format&fit=crop',
    description: 'Elite tier CS tournament for top-ranking community squads and streamers.',
    rules: 'Stream sniping forbidden. Delay stream by 120s.',
    status: 'completed',
    participants: [
      { id: 'p8', ign: 'Team_Vampires', uid: '901238475', teamName: 'Vampire Elites', registeredAt: '2026-09-25 12:00', ticketUsed: '1x CS Ticket', status: 'confirmed' }
    ],
    results: {
      winnersDeclared: true,
      firstPlace: { ign: 'Team_Vampires', uid: '901238475', prize: '₹25,000 + Exclusive XO Jersey' },
      secondPlace: { ign: 'Soul_Reapers', uid: '887123901', prize: '₹10,000' },
      thirdPlace: { ign: 'NightRiders', uid: '671238490', prize: '₹5,000' },
      prizeDistributionStatus: 'Distributed',
    }
  }
];

export const INITIAL_PASSES = [
  {
    id: 1,
    title: 'CLASH SQUAD TICKET PACK',
    subtitle: '5x CS Tournament Tickets',
    inrPrice: 39,
    grantCs: 5,
    grantBr: 0,
    grantCoins: 100,
    ticketImage: '/tokens/cs-ticket.png',
    ticketType: 'CS',
    features: [
      '5x CS Tournament Registration Tickets',
      '+100 Free XO Bonus Coins',
      'Entry to Master Tier 4v4 Cups',
      'Priority Slot Confirmation in Scrims',
      'Instant Auto-Approval in Custom Rooms',
    ],
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    accentColor: '#10b981',
    active: true,
    badge: 'POPULAR'
  },
  {
    id: 2,
    title: 'BATTLE ROYALE TICKET PACK',
    subtitle: '5x BR Tournament Tickets',
    inrPrice: 59,
    grantCs: 0,
    grantBr: 5,
    grantCoins: 150,
    ticketImage: '/tokens/br-ticket.png',
    ticketType: 'BR',
    features: [
      '5x BR Tournament Registration Tickets',
      '+150 Free XO Bonus Coins',
      'Entry to Invitational & Lone Wolf Cups',
      'Squad Slot Reservation in Bermuda Scrims',
      'Live Stream Shoutout during Finals',
    ],
    color: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    accentColor: '#94a3b8',
    popular: true,
    active: true,
    badge: 'BEST VALUE'
  },
  {
    id: 3,
    title: 'HAARSH XO ALL-STAR COMBO',
    subtitle: '5x CS Tickets + 5x BR Tickets',
    inrPrice: 99,
    grantCs: 5,
    grantBr: 5,
    grantCoins: 300,
    ticketImage: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop',
    ticketType: 'COMBO',
    features: [
      '10 Total Tournament Tickets (5 CS + 5 BR)',
      '+300 Free XO Bonus Coins',
      'Unlimited Entry into Weekly Practice Scrims',
      'Verified Competitor Role in Discord',
      'Direct Eligibility for Diamond Prize Pools',
    ],
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    accentColor: '#f59e0b',
    active: true,
    badge: 'MEGA PACK'
  }
];

export const INITIAL_REDEEM_CODES = [
  {
    id: 'code_1',
    code: 'XOBOOYAH100',
    rewardType: 'coins', // coins | cs_tickets | br_tickets | combo
    coins: 500,
    csTickets: 0,
    brTickets: 0,
    maxUses: 500,
    usedCount: 142,
    usedBy: ['849204812'],
    expiryDate: '2026-12-31',
    active: true,
    createdAt: '2026-09-01',
    description: 'Launch celebration code: +500 XO Coins',
  },
  {
    id: 'code_2',
    code: 'FREECSTICKET',
    rewardType: 'cs_tickets',
    coins: 0,
    csTickets: 2,
    brTickets: 0,
    maxUses: 200,
    usedCount: 78,
    usedBy: [],
    expiryDate: '2026-10-15',
    active: true,
    createdAt: '2026-09-15',
    description: 'Weekend Scrims Gift: +2 Free CS Tickets',
  },
  {
    id: 'code_3',
    code: 'HAARSHVIP2026',
    rewardType: 'combo',
    coins: 1000,
    csTickets: 2,
    brTickets: 2,
    maxUses: 50,
    usedCount: 49,
    usedBy: [],
    expiryDate: '2026-11-01',
    active: true,
    createdAt: '2026-09-20',
    description: 'VIP Super Pack: +1,000 Coins + 2 CS + 2 BR Tickets',
  },
  {
    id: 'code_4',
    code: 'EXPIREDTEST',
    rewardType: 'coins',
    coins: 100,
    csTickets: 0,
    brTickets: 0,
    maxUses: 10,
    usedCount: 10,
    usedBy: [],
    expiryDate: '2026-08-01',
    active: false,
    createdAt: '2026-07-01',
    description: 'Old test code (Inactive)',
  }
];

export const INITIAL_TRANSACTIONS = [];

export const INITIAL_REDEMPTIONS = [];

export const INITIAL_USERS = [];

export const INITIAL_ANNOUNCEMENTS = [
  {
    id: 'ann_1',
    title: '🔥 ₹50,000 Battle Royale Invitational Registration is NOW OPEN!',
    message: 'Grab your BR Tournament Pass and register your 4-man squad before slots fill up! Live streamed on HAARSH XO channel.',
    type: 'tournament', // urgent | tournament | giveaway | reward | system
    active: true,
    showMarquee: true,
    createdAt: '2026-09-28'
  },
  {
    id: 'ann_2',
    title: '🎁 Use Promo Code "XOBOOYAH100" for +500 Free XO Coins!',
    message: 'Head over to the Redeem section, enter the code and claim your coins instantly.',
    type: 'reward',
    active: true,
    showMarquee: true,
    createdAt: '2026-09-27'
  }
];

export const INITIAL_GIVEAWAYS = [
  { 
    id: 1, 
    category: 'main', // main | esports
    title: 'Monthly Mega Diamond Giveaway', 
    prize: '10,000 Free Fire Diamonds', 
    daysLeft: 14,
    participants: 18420,
    participantsList: [
      { uid: '849204812', ign: 'HaarshFan_99', time: '2026-09-28' },
      { uid: '912384712', ign: 'Soul_Mortal99', time: '2026-09-27' },
      { uid: '741289301', ign: 'GodL_Shadow', time: '2026-09-26' },
    ],
    requirements: [
      { id: 'req1', text: 'Subscribe to HAARSH XO on YouTube', completed: true },
      { id: 'req2', text: 'Follow @haarsh_xo on Instagram', completed: false },
      { id: 'req3', text: 'Share this live stream giveaway', completed: false }
    ],
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    active: true,
    winner: null
  },
  { 
    id: 2, 
    category: 'main',
    title: 'Weekend Special: Booyah Pass Giveaway', 
    prize: '5x Booyah Passes + 1,000 Diamonds', 
    daysLeft: 3,
    participants: 5850,
    participantsList: [
      { uid: '849204812', ign: 'HaarshFan_99', time: '2026-09-28' },
    ],
    requirements: [
      { id: 'req4', text: 'Watch today\'s live stream for 15 mins', completed: true },
      { id: 'req5', text: 'Comment your Free Fire UID in chat', completed: true }
    ],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    active: true,
    winner: null
  },
  {
    id: 3,
    category: 'esports',
    title: '10x CS TOURNAMENT TICKETS GIVEAWAY',
    prize: '10x Free CS Registration Tickets',
    daysLeft: 1,
    participants: 4120,
    participantsList: [
      { uid: '849204812', ign: 'HaarshFan_99', time: '2026-09-28' },
    ],
    requirements: [
      { id: 'req_esp_1', text: 'Active esports registered player', completed: true },
      { id: 'req_esp_2', text: 'Watch live finals this weekend', completed: true }
    ],
    image: '/tokens/cs-ticket.png',
    active: true,
    winner: null
  }
];

export const INITIAL_STORE_REWARDS = [
  // Main Store (XO Coins)
  { 
    id: 1, 
    storeType: 'main',
    title: '100 Free Fire Diamonds', 
    cost: 1000, 
    type: 'diamonds', 
    description: 'Instant direct top-up to your Free Fire account via UID.', 
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
    tag: 'INSTANT UID',
    stock: 999,
    active: true
  },
  { 
    id: 2, 
    storeType: 'main',
    title: '₹10 Google Play Code', 
    cost: 500, 
    type: 'giftcard', 
    description: 'Instant ₹10 Google Play redeem code delivered to your registered email.', 
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    tag: 'HOT',
    stock: 150,
    active: true
  },
  { 
    id: 3, 
    storeType: 'main',
    title: '₹30 Google Play Code', 
    cost: 1400, 
    type: 'giftcard', 
    description: 'Instant ₹30 Google Play redeem code for special air drops and gun crates.', 
    image: 'https://images.unsplash.com/photo-1606144042871-2ed4a9aacf39?q=80&w=2070&auto=format&fit=crop',
    tag: 'POPULAR',
    stock: 200,
    active: true
  },
  { 
    id: 4, 
    storeType: 'main',
    title: 'Weekly Free Fire Membership', 
    cost: 3000, 
    type: 'membership', 
    description: 'Get 450 Diamonds + weekly perks in Free Fire with UID top-up.', 
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    tag: 'MEMBERSHIP',
    stock: 50,
    active: true
  },
  { 
    id: 5, 
    storeType: 'main',
    title: '₹50 Google Play Gift Card', 
    cost: 2200, 
    type: 'giftcard', 
    description: 'Instant ₹50 redeem code for in-game purchases and Level Up Pass.', 
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    tag: 'BEST VALUE',
    stock: 80,
    active: true
  },
  // Arena Store (XO Coins)
  {
    id: 6,
    storeType: 'arena',
    title: '100 FREE FIRE DIAMONDS',
    type: 'diamonds',
    cost: 1000,
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
    description: 'Instant direct top-up to your Free Fire account via UID.',
    tag: 'INSTANT UID TOPUP',
    stock: 500,
    active: true
  },
  {
    id: 7,
    storeType: 'arena',
    title: '₹50 GOOGLE PLAY REDEEM CODE',
    type: 'giftcard',
    cost: 2200,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    description: 'Instant ₹50 Google Play Store redeem code for in-game purchases.',
    tag: 'HOT REWARD',
    stock: 120,
    active: true
  },
  {
    id: 8,
    storeType: 'arena',
    title: '310 FF DIAMONDS BUNDLE',
    type: 'diamonds',
    cost: 2900,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    description: 'Special tournament winners diamond top-up bundle.',
    tag: 'BEST VALUE',
    stock: 45,
    active: true
  },
  {
    id: 9,
    storeType: 'arena',
    title: 'HAARSH XO OFFICIAL PRO JERSEY',
    type: 'merch',
    cost: 8500,
    tag: 'LIMITED EDITION',
    image: 'https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a31f?q=80&w=2069&auto=format&fit=crop',
    description: 'Official HAARSH XO Esports tournament player jersey with customized gamertag.',
    stock: 15,
    active: true
  },
];

export const INITIAL_AUDIT_LOGS = [
  {
    id: 'log_1',
    action: 'SYSTEM_BOOT',
    category: 'SYSTEM',
    details: 'HAARSH XO Admin System initialized with verified Razorpay test keys.',
    timestamp: '2026-09-28 22:45:00',
    adminUser: 'SYSTEM'
  },
  {
    id: 'log_2',
    action: 'TOURNAMENT_UPDATED',
    category: 'TOURNAMENTS',
    details: 'CS Weekend Pro Scrims marked as registration closed (Slots Full: 16/16).',
    timestamp: '2026-09-28 21:00:00',
    adminUser: 'HAARSH_ADMIN'
  },
  {
    id: 'log_3',
    action: 'PROMO_CODE_CREATED',
    category: 'CODES',
    details: 'Generated promo code "XOBOOYAH100" (+500 XO Coins, Limit: 500 uses).',
    timestamp: '2026-09-28 20:15:00',
    adminUser: 'HAARSH_ADMIN'
  }
];

// ─── Master Admin Credentials ────────────────────────────────────────────────
export const AUTHORIZED_ADMINS = [
  {
    email: 'shaktivardhans9@gmail.com',
    password: 'Shakti01.#',
    name: 'Shakti Vardhan',
    role: 'Super Admin'
  },
  {
    email: 'opharsh6956@gmail.com',
    password: 'Harsh6956.#',
    name: 'Haarsh (OP Harsh)',
    role: 'Master Admin'
  }
];

export const isAuthorizedAdminEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  return AUTHORIZED_ADMINS.some(admin => admin.email.toLowerCase() === email.trim().toLowerCase());
};

// Legacy fallback pin
export const ADMIN_MASTER_PIN = 'XOADMIN2026';

// ─── LocalStorage Cache Busting ───────────────────────────────────────────────
// Bump this version string whenever a schema change requires fresh data from the server
const LS_SCHEMA_VERSION = 'v7';
const LS_VERSION_KEY = 'haarshxo_ls_schema';
const ADMIN_LS_KEYS = [
  'haarshxo_admin_tournaments', 'haarshxo_admin_passes', 'haarshxo_admin_codes',
  'haarshxo_admin_transactions', 'haarshxo_admin_redemptions', 'haarshxo_admin_users', 'haarshxo_admin_announcements',
  'haarshxo_admin_giveaways', 'haarshxo_admin_store', 'haarshxo_admin_logs',
];

const clearAdminLocalStorage = () => {
  try {
    ADMIN_LS_KEYS.forEach(k => localStorage.removeItem(k));
    console.log('[AdminSync] localStorage cache cleared');
  } catch {}
};

// Auto-clear if schema version mismatch
try {
  const storedVersion = localStorage.getItem(LS_VERSION_KEY);
  if (storedVersion !== LS_SCHEMA_VERSION) {
    clearAdminLocalStorage();
    localStorage.setItem(LS_VERSION_KEY, LS_SCHEMA_VERSION);
    console.log(`[AdminSync] Schema version updated to ${LS_SCHEMA_VERSION}, cache cleared`);
  }
} catch {}

export const AdminProvider = ({ children }) => {

  // Unique tab identifier to filter out self-broadcast messages
  const tabId = useRef(`tab_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`).current;
  const remoteSyncRef = useRef({});
  const lastLocalActionTime = useRef(0);
  // Tracks how many syncToBackend calls are currently in-flight.
  // fetchFromBackend will NOT run while this is > 0 to prevent stale data overwrites.
  const pendingSyncCount = useRef(0);
  // Timestamp of the last time we successfully received & applied backend data.
  // Used to avoid applying older backend snapshots that would overwrite fresh local data.
  const lastAppliedRemoteTime = useRef(0);
  // Prevents pushing initial/stale local state up to the server on initial mount
  const isInitialMountRef = useRef({
    tournaments: true,
    passes: true,
    codes: true,
    transactions: true,
    redemptions: true,
    users: true,
    announcements: true,
    giveaways: true,
    store: true,
    logs: true,
  });

  // Auth state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    try {
      return sessionStorage.getItem('haarshxo_admin_auth') === 'true';
    } catch {
      return false;
    }
  });

  const [currentAdmin, setCurrentAdmin] = useState(() => {
    try {
      const saved = sessionStorage.getItem('haarshxo_admin_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Tournaments
  const [tournaments, setTournaments] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_tournaments');
      return saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  });

  // Passes
  const [passes, setPasses] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_passes');
      return saved ? JSON.parse(saved) : INITIAL_PASSES;
    } catch {
      return INITIAL_PASSES;
    }
  });

  // Redeem Codes
  const [redeemCodes, setRedeemCodes] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_codes');
      return saved ? JSON.parse(saved) : INITIAL_REDEEM_CODES;
    } catch {
      return INITIAL_REDEEM_CODES;
    }
  });

  // Transactions
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  // Reward Redemptions (XO Coins)
  const [redemptions, setRedemptions] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_redemptions');
      return saved ? JSON.parse(saved) : INITIAL_REDEMPTIONS;
    } catch {
      return INITIAL_REDEMPTIONS;
    }
  });

  // Users
  const [usersList, setUsersList] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_users');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(u => u.uid === '849204812' || u.inGameName === 'HaarshFan_99')) {
          localStorage.removeItem('haarshxo_admin_users');
          return [];
        }
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch {
      return [];
    }
  });

  // Announcements
  const [announcements, setAnnouncements] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_announcements');
      return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
    } catch {
      return INITIAL_ANNOUNCEMENTS;
    }
  });

  // Giveaways
  const [giveawaysList, setGiveawaysList] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_giveaways');
      return saved ? JSON.parse(saved) : INITIAL_GIVEAWAYS;
    } catch {
      return INITIAL_GIVEAWAYS;
    }
  });

  // Store Rewards
  const [storeRewards, setStoreRewards] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_store');
      return saved ? JSON.parse(saved) : INITIAL_STORE_REWARDS;
    } catch {
      return INITIAL_STORE_REWARDS;
    }
  });

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_logs');
      return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    } catch {
      return INITIAL_AUDIT_LOGS;
    }
  });

  // ─── Backend & Cross-Tab Persistence Sync ─────────────────────────────────
  // IMPORTANT: applyRemoteState does NOT write back to localStorage.
  // localStorage is the responsibility of the persistence useEffects below.
  // Writing here would create a race-condition where the poll overwrites
  // a fresh local save with stale backend data.
  const applyRemoteState = useCallback((data) => {
    if (!data || typeof data !== 'object') return;
    lastAppliedRemoteTime.current = Date.now();

    if (Array.isArray(data.tournaments)) {
      remoteSyncRef.current['tournaments'] = true;
      setTournaments(data.tournaments);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: data.tournaments } }));
    }
    if (Array.isArray(data.passes)) {
      remoteSyncRef.current['passes'] = true;
      setPasses(data.passes);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: data.passes } }));
    }
    if (Array.isArray(data.redeemCodes)) {
      remoteSyncRef.current['codes'] = true;
      setRedeemCodes(data.redeemCodes);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: data.redeemCodes } }));
    }
    if (Array.isArray(data.transactions)) {
      remoteSyncRef.current['transactions'] = true;
      setTransactions(data.transactions);
    }
    if (Array.isArray(data.redemptions)) {
      remoteSyncRef.current['redemptions'] = true;
      setRedemptions(data.redemptions);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redemptions', data: data.redemptions } }));
    }
    const uList = Array.isArray(data.users)
      ? data.users
      : (Array.isArray(data.usersList) ? data.usersList : null);
    if (uList) {
      remoteSyncRef.current['users'] = true;
      setUsersList(uList);
    }
    if (Array.isArray(data.announcements)) {
      remoteSyncRef.current['announcements'] = true;
      setAnnouncements(data.announcements);
      // Informs GameContext to immediately sync announcements into the Notification Center
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: data.announcements } }));
    }
    const gList = Array.isArray(data.giveawaysList)
      ? data.giveawaysList
      : (Array.isArray(data.giveaways) ? data.giveaways : null);
    if (gList) {
      remoteSyncRef.current['giveaways'] = true;
      setGiveawaysList(gList);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: gList } }));
    }
    if (Array.isArray(data.storeRewards)) {
      remoteSyncRef.current['store'] = true;
      setStoreRewards(data.storeRewards);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: data.storeRewards } }));
    }
    if (Array.isArray(data.auditLogs)) {
      remoteSyncRef.current['logs'] = true;
      setAuditLogs(data.auditLogs);
    }
  }, []);

  const fetchFromBackend = useCallback(async (force = false) => {
    // Guard 1: If a local action happened within 30s, skip to avoid overwriting fresh saves.
    // 30s gives syncToBackend enough time to complete even on slow/mobile networks.
    if (!force && Date.now() - lastLocalActionTime.current < 30000) return null;
    // Guard 2: Never poll while a save/sync is actively in-flight — this is the main race-condition fix.
    if (!force && pendingSyncCount.current > 0) {
      console.log('[AdminSync] Skipping poll — sync in-flight');
      return null;
    }
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/admin/data` : '/api/admin/data';
      let res;
      try {
        res = await fetch(primaryUrl);
      } catch {
        res = await fetch('http://localhost:5001/api/admin/data');
      }
      if (res && res.ok) {
        const data = await res.json();
        applyRemoteState(data);
        return data;
      }
    } catch (err) {
      console.warn('[AdminSync] fetchFromBackend error:', err);
    }
    return null;
  }, [applyRemoteState]);

  const syncToBackend = useCallback(async (payload) => {
    const baseUrl = getBackendBaseUrl();
    const primaryUrl = baseUrl ? `${baseUrl}/api/admin/sync` : '/api/admin/sync';
    const fallbackUrl = 'http://localhost:5001/api/admin/sync';
    const body = JSON.stringify(payload);
    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

    // Mark sync as in-flight so polls don't interrupt it
    pendingSyncCount.current += 1;

    // Retry up to 3 times with exponential backoff
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let res;
        try {
          res = await fetch(primaryUrl, opts);
        } catch {
          res = await fetch(fallbackUrl, opts);
        }
        if (res?.ok) {
          console.log(`[AdminSync] Sync succeeded on attempt ${attempt}`);
          pendingSyncCount.current = Math.max(0, pendingSyncCount.current - 1);
          // After a successful save, do NOT immediately re-fetch — the data we have IS the source of truth.
          // The next scheduled poll will confirm consistency.
          return true;
        }
        console.warn(`[AdminSync] Sync attempt ${attempt} failed (status: ${res?.status})`);
      } catch (err) {
        console.warn(`[AdminSync] Sync attempt ${attempt} error:`, err);
      }
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 500)); // 500ms, 1000ms backoff
      }
    }
    pendingSyncCount.current = Math.max(0, pendingSyncCount.current - 1);
    console.error('[AdminSync] syncToBackend failed after 3 attempts');
    return false;
  }, []);

  // 1. Initial Load: Fetch authoritative state from backend server immediately on mount
  useEffect(() => {
    fetchFromBackend(true);
  }, [fetchFromBackend]);

  // 2. Real-time Cross-Device Polling:
  // Authenticated admins poll every 6s, regular site visitors poll every 10s.
  // The 15s guard in fetchFromBackend ensures polls don't overwrite fresh saves.
  useEffect(() => {
    const intervalMs = isAdminAuthenticated ? 6000 : 10000;
    const interval = setInterval(() => {
      fetchFromBackend(false);
    }, intervalMs);
    return () => clearInterval(interval);
  }, [isAdminAuthenticated, fetchFromBackend]);

  // Helper to broadcast a change to all other tabs
  const broadcastChange = useCallback((type, data) => {
    try {
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type, data, senderId: tabId });
      }
    } catch (e) {
      console.warn('[AdminSync] Broadcast send failed:', e);
    }
  }, [tabId]);

  // 2. Real-time Cross-Tab Sync via permanent BroadcastChannel + storage event + focus listener
  useEffect(() => {
    // A. BroadcastChannel receiver
    const handleChannelMessage = (e) => {
      const { type, data, senderId } = e.data || {};
      if (!type || !data || senderId === tabId) return;
      try {
        remoteSyncRef.current[type] = true;
        if (type === 'tournaments')       setTournaments(data);
        else if (type === 'passes')       setPasses(data);
        else if (type === 'codes')        setRedeemCodes(data);
        else if (type === 'transactions') setTransactions(data);
        else if (type === 'redemptions')  setRedemptions(data);
        else if (type === 'users')        setUsersList(data);
        else if (type === 'announcements') setAnnouncements(data);
        else if (type === 'giveaways')    setGiveawaysList(data);
        else if (type === 'store')        setStoreRewards(data);
        else if (type === 'logs')         setAuditLogs(data);
      } catch (err) {
        console.warn('[AdminSync] BroadcastChannel error:', err);
      }
    };

    if (globalBroadcastChannel) {
      globalBroadcastChannel.addEventListener('message', handleChannelMessage);
    }

    // B. Fallback: storage event for cross-tab updates
    const handleStorageChange = (e) => {
      if (!e.key || !e.newValue) return;
      try {
        const data = JSON.parse(e.newValue);
        if (e.key === 'haarshxo_admin_tournaments') {
          remoteSyncRef.current['tournaments'] = true;
          setTournaments(data);
        } else if (e.key === 'haarshxo_admin_passes') {
          remoteSyncRef.current['passes'] = true;
          setPasses(data);
        } else if (e.key === 'haarshxo_admin_codes') {
          remoteSyncRef.current['codes'] = true;
          setRedeemCodes(data);
        } else if (e.key === 'haarshxo_admin_transactions') {
          remoteSyncRef.current['transactions'] = true;
          setTransactions(data);
        } else if (e.key === 'haarshxo_admin_redemptions') {
          remoteSyncRef.current['redemptions'] = true;
          setRedemptions(data);
        } else if (e.key === 'haarshxo_admin_users') {
          remoteSyncRef.current['users'] = true;
          setUsersList(data);
        } else if (e.key === 'haarshxo_admin_announcements') {
          remoteSyncRef.current['announcements'] = true;
          setAnnouncements(data);
        } else if (e.key === 'haarshxo_admin_giveaways') {
          remoteSyncRef.current['giveaways'] = true;
          setGiveawaysList(data);
        } else if (e.key === 'haarshxo_admin_store') {
          remoteSyncRef.current['store'] = true;
          setStoreRewards(data);
        } else if (e.key === 'haarshxo_admin_logs') {
          remoteSyncRef.current['logs'] = true;
          setAuditLogs(data);
        }
      } catch (err) {
        console.warn('[AdminSync] Storage event error:', err);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // C. Window Focus & Visibility: when switching back to this tab, re-read ALL keys from localStorage
    const refreshAllFromStorage = () => {
      // If user performed an action in this tab within the last 30 seconds, do not overwrite with stale read
      if (Date.now() - lastLocalActionTime.current < 30000) return;
      try {
        const tryParse = (key) => {
          const v = localStorage.getItem(key);
          return v ? JSON.parse(v) : null;
        };
        const t = tryParse('haarshxo_admin_tournaments');
        const p = tryParse('haarshxo_admin_passes');
        const c = tryParse('haarshxo_admin_codes');
        const tx = tryParse('haarshxo_admin_transactions');
        const red = tryParse('haarshxo_admin_redemptions');
        const u = tryParse('haarshxo_admin_users');
        const a = tryParse('haarshxo_admin_announcements');
        const g = tryParse('haarshxo_admin_giveaways');
        const s = tryParse('haarshxo_admin_store');
        const l = tryParse('haarshxo_admin_logs');

        // Use the remoteSyncRef flag so the persistence effects know to skip writing back
        if (t) { remoteSyncRef.current['tournaments'] = true; setTournaments(t); }
        if (p) { remoteSyncRef.current['passes'] = true; setPasses(p); }
        if (c) { remoteSyncRef.current['codes'] = true; setRedeemCodes(c); }
        if (tx) { remoteSyncRef.current['transactions'] = true; setTransactions(tx); }
        if (red) { remoteSyncRef.current['redemptions'] = true; setRedemptions(red); }
        if (u) { remoteSyncRef.current['users'] = true; setUsersList(u); }
        if (a) { remoteSyncRef.current['announcements'] = true; setAnnouncements(a); }
        if (g) { remoteSyncRef.current['giveaways'] = true; setGiveawaysList(g); }
        if (s) { remoteSyncRef.current['store'] = true; setStoreRewards(s); }
        if (l) { remoteSyncRef.current['logs'] = true; setAuditLogs(l); }

        // Also fetch from remote backend for any cross-device updates that occurred while tab was inactive
        fetchFromBackend(false);
      } catch (err) {
        console.warn('[AdminSync] refreshAllFromStorage error:', err);
      }
    };
    // Expose so loginAdmin can call it
    window.__haarshxo_refreshAdminData = refreshAllFromStorage;

    window.addEventListener('focus', refreshAllFromStorage);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshAllFromStorage();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      if (globalBroadcastChannel) {
        globalBroadcastChannel.removeEventListener('message', handleChannelMessage);
      }
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', refreshAllFromStorage);
      document.removeEventListener('visibilitychange', handleVisibility);
      delete window.__haarshxo_refreshAdminData;
    };
  }, [tabId, fetchFromBackend]);

  // 3. State persistence effects — save to localStorage + broadcast to other tabs + sync backend
  // NOTE: The CRUD functions already write directly inside setTournaments() callbacks for immediate
  // persistence. These effects serve as a safety-net for any state changes that bypass the CRUD path.
  // When remoteSyncRef flag is true it means this state change came from a remote tab/storage event,
  // so we skip writing back to avoid a ping-pong loop — but we always clear the flag.
  useEffect(() => {
    try {
      if (isInitialMountRef.current['tournaments']) {
        isInitialMountRef.current['tournaments'] = false;
        return;
      }
      const skip = remoteSyncRef.current['tournaments'];
      remoteSyncRef.current['tournaments'] = false;
      if (skip) {
        // Remote state was applied — write it to localStorage so the browser cache is up-to-date
        try { localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(tournaments)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(tournaments));
      broadcastChange('tournaments', tournaments);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: tournaments } }));
      syncToBackend({ tournaments });
    } catch {}
  }, [tournaments, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['passes']) {
        isInitialMountRef.current['passes'] = false;
        return;
      }
      const skip = remoteSyncRef.current['passes'];
      remoteSyncRef.current['passes'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_passes', JSON.stringify(passes)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_passes', JSON.stringify(passes));
      broadcastChange('passes', passes);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: passes } }));
      syncToBackend({ passes });
    } catch {}
  }, [passes, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['codes']) {
        isInitialMountRef.current['codes'] = false;
        return;
      }
      const skip = remoteSyncRef.current['codes'];
      remoteSyncRef.current['codes'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_codes', JSON.stringify(redeemCodes)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_codes', JSON.stringify(redeemCodes));
      broadcastChange('codes', redeemCodes);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: redeemCodes } }));
      syncToBackend({ redeemCodes });
    } catch {}
  }, [redeemCodes, syncToBackend, broadcastChange]);

  // NOTE: transactions are READ-ONLY from the frontend — they are written exclusively by
  // the backend's verify_payment endpoint. Never push transactions to /api/admin/sync or
  // they will overwrite real Razorpay records with a stale empty array from localStorage.
  useEffect(() => {
    try {
      if (isInitialMountRef.current['transactions']) {
        isInitialMountRef.current['transactions'] = false;
        return;
      }
      // Always clear the remote flag
      remoteSyncRef.current['transactions'] = false;
      // Only cache to localStorage for cross-tab broadcast — never push to backend
      try { localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(transactions)); } catch {}
      broadcastChange('transactions', transactions);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'transactions', data: transactions } }));
      // ⚠️ DO NOT call syncToBackend({ transactions }) here — transactions are backend-owned!
    } catch {}
  }, [transactions, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['redemptions']) {
        isInitialMountRef.current['redemptions'] = false;
        return;
      }
      const skip = remoteSyncRef.current['redemptions'];
      remoteSyncRef.current['redemptions'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(redemptions)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(redemptions));
      broadcastChange('redemptions', redemptions);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redemptions', data: redemptions } }));
      syncToBackend({ redemptions });
    } catch {}
  }, [redemptions, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['users']) {
        isInitialMountRef.current['users'] = false;
        return;
      }
      const skip = remoteSyncRef.current['users'];
      remoteSyncRef.current['users'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_users', JSON.stringify(usersList)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_users', JSON.stringify(usersList));
      broadcastChange('users', usersList);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'users', data: usersList } }));
      // Note: user balance changes go through /api/users/:id/update-balance, not admin/sync
    } catch {}
  }, [usersList, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['announcements']) {
        isInitialMountRef.current['announcements'] = false;
        return;
      }
      const skip = remoteSyncRef.current['announcements'];
      remoteSyncRef.current['announcements'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(announcements)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(announcements));
      broadcastChange('announcements', announcements);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: announcements } }));
      syncToBackend({ announcements });
    } catch {}
  }, [announcements, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['giveaways']) {
        isInitialMountRef.current['giveaways'] = false;
        return;
      }
      const skip = remoteSyncRef.current['giveaways'];
      remoteSyncRef.current['giveaways'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(giveawaysList)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(giveawaysList));
      broadcastChange('giveaways', giveawaysList);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: giveawaysList } }));
      syncToBackend({ giveawaysList });
    } catch {}
  }, [giveawaysList, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['store']) {
        isInitialMountRef.current['store'] = false;
        return;
      }
      const skip = remoteSyncRef.current['store'];
      remoteSyncRef.current['store'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_store', JSON.stringify(storeRewards)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_store', JSON.stringify(storeRewards));
      broadcastChange('store', storeRewards);
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: storeRewards } }));
      syncToBackend({ storeRewards });
    } catch {}
  }, [storeRewards, syncToBackend, broadcastChange]);

  useEffect(() => {
    try {
      if (isInitialMountRef.current['logs']) {
        isInitialMountRef.current['logs'] = false;
        return;
      }
      const skip = remoteSyncRef.current['logs'];
      remoteSyncRef.current['logs'] = false;
      if (skip) {
        try { localStorage.setItem('haarshxo_admin_logs', JSON.stringify(auditLogs)); } catch {}
        return;
      }
      lastLocalActionTime.current = Date.now();
      localStorage.setItem('haarshxo_admin_logs', JSON.stringify(auditLogs));
      broadcastChange('logs', auditLogs);
      syncToBackend({ auditLogs });
    } catch {}
  }, [auditLogs, syncToBackend, broadcastChange]);

  // ─── Audit Logger ─────────────────────────────────────────────────────────
  const addAuditLog = useCallback((action, category, details, overrideAdmin) => {
    let adminName = overrideAdmin;
    if (!adminName) {
      try {
        const saved = sessionStorage.getItem('haarshxo_admin_user');
        if (saved) {
          const u = JSON.parse(saved);
          adminName = u?.name || u?.email;
        }
      } catch {}
    }
    const newLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      action,
      category,
      details,
      timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      adminUser: adminName || 'HAARSH_ADMIN'
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 300)]);
  }, []);

  // ─── Authentication ───────────────────────────────────────────────────────
  const loginAdmin = (emailOrPin, maybePassword) => {
    // If called with email and password:
    if (maybePassword !== undefined) {
      const cleanEmail = (emailOrPin || '').trim().toLowerCase();
      const cleanPass = (maybePassword || '').trim();

      const matched = AUTHORIZED_ADMINS.find(
        a => a.email.toLowerCase() === cleanEmail && a.password === cleanPass
      );

      if (matched) {
        setIsAdminAuthenticated(true);
        setCurrentAdmin(matched);
        sessionStorage.setItem('haarshxo_admin_auth', 'true');
        sessionStorage.setItem('haarshxo_admin_user', JSON.stringify({
          email: matched.email,
          name: matched.name,
          role: matched.role
        }));
        lastLocalActionTime.current = 0;
        // ✅ Immediately fetch latest remote state from server so any admin on any device gets newest data
        fetchFromBackend(true);
        addAuditLog('ADMIN_LOGIN', 'AUTH', `${matched.name} (${matched.email}) authenticated as ${matched.role}.`);
        return { success: true, admin: matched };
      }
      return { success: false, error: 'Access Denied: Invalid Admin Email or Password.' };
    }

    // Direct auth if verified admin object passed
    if (typeof emailOrPin === 'object' && emailOrPin?.email && isAuthorizedAdminEmail(emailOrPin.email)) {
      setIsAdminAuthenticated(true);
      setCurrentAdmin(emailOrPin);
      sessionStorage.setItem('haarshxo_admin_auth', 'true');
      sessionStorage.setItem('haarshxo_admin_user', JSON.stringify(emailOrPin));
      fetchFromBackend(true);
      addAuditLog('ADMIN_LOGIN', 'AUTH', `${emailOrPin.name || emailOrPin.email} authenticated via verified session.`);
      return { success: true, admin: emailOrPin };
    }

    return { success: false, error: 'Access Denied: Please provide valid Admin Credentials.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentAdmin(null);
    sessionStorage.removeItem('haarshxo_admin_auth');
    sessionStorage.removeItem('haarshxo_admin_user');
    addAuditLog('ADMIN_LOGOUT', 'AUTH', 'Admin signed out.');
  };

  // ─── Tournaments CRUD & Operations ────────────────────────────────────────
  const createTournament = (data) => {
    lastLocalActionTime.current = Date.now();
    const id = `tourney_${Date.now()}`;
    const newTourney = {
      id,
      title: data.title || 'NEW TOURNAMENT',
      date: data.date || 'TBA',
      prize: data.prize || '₹10,000',
      mode: data.mode || 'Squad (CS)',
      map: data.map || 'Bermuda',
      slots: `0/${data.maxSlots || 16} Teams`,
      maxSlots: Number(data.maxSlots) || 16,
      registeredCount: 0,
      ticketType: data.ticketType || 'CS',
      ticketCost: Number(data.ticketCost) || 1,
      ticketImage: data.ticketType === 'BR' ? '/tokens/br-ticket.png' : '/tokens/cs-ticket.png',
      image: data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      description: data.description || 'HAARSH XO Championship Tournament.',
      rules: data.rules || 'Standard tournament rules apply.',
      status: data.status || 'open',
      participants: [],
      results: {
        winnersDeclared: false,
        firstPlace: { ign: '', uid: '', prize: data.prize ? `${data.prize} (1st)` : '1st Prize' },
        secondPlace: { ign: '', uid: '', prize: '2nd Prize' },
        thirdPlace: { ign: '', uid: '', prize: '3rd Prize' },
        prizeDistributionStatus: 'Pending',
      }
    };
    // Compute new state, persist locally, dispatch events, then sync to backend
    setTournaments(prev => {
      const updated = [newTourney, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch {}
      return updated;
    });
    // Direct backend sync outside the updater to avoid React Strict Mode double-run issues
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);
    addAuditLog('TOURNAMENT_CREATED', 'TOURNAMENTS', `Created tournament "${newTourney.title}" (Prize: ${newTourney.prize}, Mode: ${newTourney.mode})`);
    return newTourney;
  };

  const updateTournament = (id, updatedFields) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    setTournaments(prev => {
      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;
        return { ...t, ...updatedFields };
      });
      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch {}
      return updated;
    });
    // Direct backend sync outside the updater (avoids remoteSyncRef race + React Strict Mode double-run)
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);
    addAuditLog('TOURNAMENT_UPDATED', 'TOURNAMENTS', `Edited tournament ID: ${id}`);
  };

  const deleteTournament = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    const tourney = tournaments.find(t => String(t.id) === idStr);
    setTournaments(prev => {
      const updated = prev.filter(t => String(t.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);
    addAuditLog('TOURNAMENT_DELETED', 'TOURNAMENTS', `Deleted tournament "${tourney?.title || id}"`);
  };

  const toggleTournamentStatus = (id, newStatus) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    setTournaments(prev => {
      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;
        return { ...t, status: newStatus };
      });
      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);
    addAuditLog('TOURNAMENT_STATUS_CHANGE', 'TOURNAMENTS', `Changed tournament status of ${id} to "${newStatus.toUpperCase()}"`);
  };

  const addTournamentParticipant = (tourneyId, registrationData = {}) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(tourneyId);
    let registeredParticipant = null;

    setTournaments(prev => {
      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;

        const isSquad = (t.mode || '').toLowerCase().includes('squad');
        const isDuo = (t.mode || '').toLowerCase().includes('duo');
        const regType = registrationData.type || (isSquad ? 'squad' : isDuo ? 'duo' : 'solo');

        const newParticipant = {
          id: `reg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          tournamentId: t.id,
          tournamentTitle: t.title,
          type: regType, // 'solo' | 'squad' | 'duo'
          mode: t.mode,
          teamName: registrationData.teamName || (regType === 'solo' ? (registrationData.ign || 'Solo Player') : 'Team Squad'),
          ign: registrationData.ign || registrationData.leaderIgn || 'Player',
          uid: registrationData.uid || registrationData.leaderUid || 'Unknown',
          leaderIgn: registrationData.leaderIgn || registrationData.ign || 'Player',
          leaderUid: registrationData.leaderUid || registrationData.uid || 'Unknown',
          phone: registrationData.phone || '',
          discord: registrationData.discord || '',
          players: Array.isArray(registrationData.players) && registrationData.players.length > 0 
            ? registrationData.players 
            : [
                { role: regType === 'solo' ? 'Player' : 'Leader', ign: registrationData.ign || 'Player', uid: registrationData.uid || 'Unknown' }
              ],
          registeredAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
          ticketUsed: registrationData.ticketUsed || `${t.ticketCost}x ${t.ticketType} Ticket`,
          status: 'confirmed'
        };

        registeredParticipant = newParticipant;
        const updatedList = [newParticipant, ...(t.participants || [])];
        const newCount = updatedList.length;
        const maxSlotsNum = Number(t.maxSlots) || 16;
        const isSolo = (t.mode || '').toLowerCase().includes('solo');

        return {
          ...t,
          participants: updatedList,
          registeredCount: newCount,
          slots: `${newCount}/${maxSlotsNum} ${isSolo ? 'Players' : 'Teams'}`,
          status: newCount >= maxSlotsNum ? 'closed' : t.status
        };
      });

      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch (err) {
        console.error('Failed to persist tournament participant:', err);
      }
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);

    const displayIdentifier = registrationData.teamName || registrationData.ign || 'Player';
    addAuditLog('PARTICIPANT_REGISTERED', 'TOURNAMENTS', `Registered ${displayIdentifier} in tournament ${tourneyId}`);
    return registeredParticipant;
  };

  const removeTournamentParticipant = (tourneyId, participantId) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(tourneyId);

    setTournaments(prev => {
      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;
        const updatedList = (t.participants || []).filter(p => p.id !== participantId);
        const newCount = updatedList.length;
        const maxSlotsNum = Number(t.maxSlots) || 16;
        const isSolo = (t.mode || '').toLowerCase().includes('solo');

        return {
          ...t,
          participants: updatedList,
          registeredCount: newCount,
          slots: `${newCount}/${maxSlotsNum} ${isSolo ? 'Players' : 'Teams'}`,
          status: (t.status === 'closed' && newCount < maxSlotsNum) ? 'open' : t.status
        };
      });

      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch (err) {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);

    addAuditLog('PARTICIPANT_REMOVED', 'TOURNAMENTS', `Disqualified/Removed participant ${participantId} from tournament ${tourneyId}`);
  };

  const declareTournamentResults = (tourneyId, resultsData) => {
    lastLocalActionTime.current = Date.now();
    setTournaments(prev => {
      const updated = prev.map(t => {
        if (t.id !== tourneyId) return t;
        return {
          ...t,
          status: 'completed',
          results: { ...t.results, ...resultsData }
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 50);
    addAuditLog('RESULTS_DECLARED', 'TOURNAMENTS', `Updated winners & prize distribution for tournament ${tourneyId} (1st: ${resultsData.firstPlace?.ign || 'Declared'})`);
  };

  // ─── Passes CRUD ──────────────────────────────────────────────────────────
  const createPass = (data) => {
    lastLocalActionTime.current = Date.now();
    const id = Date.now();
    const newPass = {
      id,
      title: data.title || 'CUSTOM ESPORTS PASS',
      subtitle: data.subtitle || 'Tournament Ticket Pack',
      inrPrice: Number(data.inrPrice) || 49,
      grantCs: Number(data.grantCs) || 0,
      grantBr: Number(data.grantBr) || 0,
      grantCoins: Number(data.grantCoins) || 0,
      ticketImage: data.ticketImage || '/tokens/cs-ticket.png',
      ticketType: data.ticketType || 'COMBO',
      features: Array.isArray(data.features) ? data.features : (data.features || '').split('\n').filter(Boolean),
      color: data.color || 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
      accentColor: data.accentColor || '#6366f1',
      popular: !!data.popular,
      active: true,
      badge: data.badge || 'SPECIAL'
    };
    setPasses(prev => {
      const updated = [...prev, newPass];
      try {
        localStorage.setItem('haarshxo_admin_passes', JSON.stringify(updated));
        broadcastChange('passes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_passes');
      if (stored) syncToBackend({ passes: JSON.parse(stored) });
    }, 0);
    addAuditLog('PASS_CREATED', 'PASSES', `Created new pass "${newPass.title}" (₹${newPass.inrPrice}, +${newPass.grantCs} CS, +${newPass.grantBr} BR, +${newPass.grantCoins} Coins)`);
    return newPass;
  };

  const updatePass = (id, updatedFields) => {
    lastLocalActionTime.current = Date.now();
    setPasses(prev => {
      const updated = prev.map(p => {
        if (p.id !== id) return p;
        return { ...p, ...updatedFields };
      });
      try {
        localStorage.setItem('haarshxo_admin_passes', JSON.stringify(updated));
        broadcastChange('passes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_passes');
      if (stored) syncToBackend({ passes: JSON.parse(stored) });
    }, 0);
    addAuditLog('PASS_UPDATED', 'PASSES', `Updated pass ID: ${id}`);
  };

  const deletePass = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    const p = passes.find(item => String(item.id) === idStr);
    setPasses(prev => {
      const updated = prev.filter(item => String(item.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_passes', JSON.stringify(updated));
        broadcastChange('passes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_passes');
      if (stored) syncToBackend({ passes: JSON.parse(stored) });
    }, 0);
    addAuditLog('PASS_DELETED', 'PASSES', `Deleted pass "${p?.title || id}"`);
  };

  // ─── Redeem Codes ─────────────────────────────────────────────────────────
  const createRedeemCode = (data) => {
    lastLocalActionTime.current = Date.now();
    const newCode = {
      id: `code_${Date.now()}`,
      code: (data.code || `XO${Math.random().toString(36).substr(2, 6).toUpperCase()}`).trim().toUpperCase(),
      rewardType: data.rewardType || 'coins',
      coins: Number(data.coins) || 0,
      csTickets: Number(data.csTickets) || 0,
      brTickets: Number(data.brTickets) || 0,
      maxUses: Number(data.maxUses) || 100,
      usedCount: 0,
      usedBy: [],
      expiryDate: data.expiryDate || '2026-12-31',
      active: true,
      createdAt: new Date().toISOString().split('T')[0],
      description: data.description || 'Promotional reward code',
    };
    setRedeemCodes(prev => {
      const updated = [newCode, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_codes', JSON.stringify(updated));
        broadcastChange('codes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_codes');
      if (stored) syncToBackend({ redeemCodes: JSON.parse(stored) });
    }, 0);
    addAuditLog('CODE_GENERATED', 'CODES', `Generated code "${newCode.code}" (${newCode.rewardType}, max uses: ${newCode.maxUses})`);
    return newCode;
  };

  const toggleRedeemCode = (id) => {
    lastLocalActionTime.current = Date.now();
    setRedeemCodes(prev => {
      const updated = prev.map(c => {
        if (c.id !== id) return c;
        const newActive = !c.active;
        addAuditLog('CODE_STATUS_CHANGE', 'CODES', `Code "${c.code}" is now ${newActive ? 'ENABLED' : 'DISABLED'}`);
        return { ...c, active: newActive };
      });
      try {
        localStorage.setItem('haarshxo_admin_codes', JSON.stringify(updated));
        broadcastChange('codes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_codes');
      if (stored) syncToBackend({ redeemCodes: JSON.parse(stored) });
    }, 0);
  };

  const deleteRedeemCode = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    const c = redeemCodes.find(item => String(item.id) === idStr);
    setRedeemCodes(prev => {
      const updated = prev.filter(item => String(item.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_codes', JSON.stringify(updated));
        broadcastChange('codes', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_codes');
      if (stored) syncToBackend({ redeemCodes: JSON.parse(stored) });
    }, 0);
    addAuditLog('CODE_DELETED', 'CODES', `Deleted redeem code "${c?.code || id}"`);
  };

  // Called when user redeems code on site
  const redeemPromoCode = (codeStr, userUid) => {
    const cleanCode = (codeStr || '').trim().toUpperCase();
    const found = redeemCodes.find(c => c.code.toUpperCase() === cleanCode);

    if (!found) {
      return { success: false, error: 'Invalid redeem code! Please double-check spelling.' };
    }
    if (!found.active) {
      return { success: false, error: 'This redeem code has been disabled by the admin.' };
    }
    if (new Date(found.expiryDate) < new Date()) {
      return { success: false, error: 'This redeem code has expired!' };
    }
    if (found.usedCount >= found.maxUses) {
      return { success: false, error: 'Redeem code limit reached! All slots have been claimed.' };
    }
    if (found.usedBy && found.usedBy.includes(userUid)) {
      return { success: false, error: 'You have already redeemed this code on your account!' };
    }

    // Mark as used and sync immediately
    lastLocalActionTime.current = Date.now();
    setRedeemCodes(prev => {
      const updated = prev.map(c => {
        if (c.id !== found.id) return c;
        return {
          ...c,
          usedCount: c.usedCount + 1,
          usedBy: [...(c.usedBy || []), userUid]
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_codes', JSON.stringify(updated));
        broadcastChange('codes', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_codes');
      if (stored) syncToBackend({ redeemCodes: JSON.parse(stored) });
    }, 0);

    addAuditLog('CODE_REDEEMED', 'CODES', `User (UID: ${userUid}) redeemed code "${found.code}" (+${found.coins} Coins, +${found.csTickets} CS, +${found.brTickets} BR)`);

    return {
      success: true,
      coins: found.coins,
      csTickets: found.csTickets,
      brTickets: found.brTickets,
      rewardType: found.rewardType,
      description: found.description
    };
  };

  // ─── Payments & Transactions Tracker ──────────────────────────────────────
  const recordPayment = (txData) => {
    lastLocalActionTime.current = Date.now();
    const newTx = {
      id: `tx_${Date.now()}`,
      paymentId: txData.paymentId,
      orderId: txData.orderId,
      passId: txData.passId,
      passTitle: txData.passTitle,
      amount: txData.amount,
      currency: txData.currency || 'INR',
      userUid: txData.userUid,
      userIgn: txData.userIgn,
      status: 'captured',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      refundReason: ''
    };
    setTransactions(prev => {
      const updated = [newTx, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(updated));
        broadcastChange('transactions', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_transactions');
      if (stored) syncToBackend({ transactions: JSON.parse(stored) });
    }, 0);
    addAuditLog('PAYMENT_RECORDED', 'PAYMENTS', `Payment ₹${txData.amount} captured for ${txData.passTitle} (ID: ${txData.paymentId})`);
  };

  const updatePaymentStatus = (id, newStatus, reason = '') => {
    lastLocalActionTime.current = Date.now();
    setTransactions(prev => {
      const updated = prev.map(tx => {
        if (tx.id !== id && tx.paymentId !== id) return tx;
        return { ...tx, status: newStatus, refundReason: reason || tx.refundReason };
      });
      try {
        localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(updated));
        broadcastChange('transactions', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_transactions');
      if (stored) syncToBackend({ transactions: JSON.parse(stored) });
    }, 0);
    addAuditLog('PAYMENT_STATUS_UPDATED', 'PAYMENTS', `Updated transaction ${id} status to ${newStatus.toUpperCase()}${reason ? ` (Reason: ${reason})` : ''}`);
  };

  // ─── Users Management ─────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/users` : '/api/users';
      let res;
      try {
        res = await fetch(primaryUrl);
      } catch {
        res = await fetch('http://localhost:5001/api/users');
      }
      if (res && res.ok) {
        const list = await res.json();
        if (Array.isArray(list)) {
          setUsersList(list);
          try { localStorage.setItem('haarshxo_admin_users', JSON.stringify(list)); } catch {}
          return list;
        }
      }
    } catch (e) {
      console.warn('[AdminSync] fetchUsers error:', e);
    }
    return [];
  }, []);

  const updateUserBalance = async (uid, coinDelta = 0, csDelta = 0, brDelta = 0, reason = 'Admin Adjustment') => {
    lastLocalActionTime.current = Date.now();
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.uid !== uid && u.id !== uid && u.supabaseId !== uid) return u;
        const newCoins = Math.max(0, (u.coins || 0) + coinDelta);
        const newCs = Math.max(0, (u.csTickets || 0) + csDelta);
        const newBr = Math.max(0, (u.brTickets || 0) + brDelta);

        // Check if this is the active user in localStorage and sync immediately
        try {
          const savedUser = localStorage.getItem('harshxo_user');
          const activeUser = savedUser ? JSON.parse(savedUser) : null;
          if (activeUser && (activeUser.uid === uid || activeUser.id === uid || activeUser.supabaseId === uid)) {
            localStorage.setItem('harshxo_coins', String(newCoins));
            localStorage.setItem('harshxo_csTickets', String(newCs));
            localStorage.setItem('harshxo_brTickets', String(newBr));
            window.dispatchEvent(new CustomEvent('haarshxo_player_sync', {
              detail: { uid, coins: newCoins, csTickets: newCs, brTickets: newBr }
            }));
          }
        } catch (e) {}

        return { ...u, coins: newCoins, csTickets: newCs, brTickets: newBr };
      });
      try {
        localStorage.setItem('haarshxo_admin_users', JSON.stringify(updated));
        broadcastChange('users', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'users', data: updated } }));
      } catch {}
      return updated;
    });

    // Dedicated backend balance update call
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/users/${encodeURIComponent(uid)}/update-balance` : `/api/users/${encodeURIComponent(uid)}/update-balance`;
      const body = JSON.stringify({ coinDelta, csDelta, brDelta, reason });
      const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
      let res;
      try {
        res = await fetch(primaryUrl, opts);
      } catch {
        res = await fetch(`http://localhost:5001/api/users/${encodeURIComponent(uid)}/update-balance`, opts);
      }
      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUsersList(prev => prev.map(u => (u.uid === uid || u.id === uid || u.supabaseId === uid) ? { ...u, ...json.user } : u));
        }
      }
    } catch (err) {
      console.warn('[AdminContext] updateUserBalance backend call failed:', err);
    }

    addAuditLog('USER_BALANCE_ADJUSTED', 'USERS', `Modified balance for UID ${uid}: ${coinDelta >= 0 ? '+' : ''}${coinDelta} Coins, ${csDelta >= 0 ? '+' : ''}${csDelta} CS, ${brDelta >= 0 ? '+' : ''}${brDelta} BR (${reason})`);
  };

  const updateUserStatus = async (uid, newStatus, reason = '') => {
    lastLocalActionTime.current = Date.now();
    setUsersList(prev => {
      const updated = prev.map(u => {
        if (u.uid !== uid && u.id !== uid && u.supabaseId !== uid) return u;
        try {
          const savedUser = localStorage.getItem('harshxo_user');
          const activeUser = savedUser ? JSON.parse(savedUser) : null;
          if (activeUser && (activeUser.uid === uid || activeUser.id === uid || activeUser.supabaseId === uid)) {
            localStorage.setItem('harshxo_user_status', newStatus);
            localStorage.setItem('harshxo_user_status_reason', reason || '');
            window.dispatchEvent(new CustomEvent('haarshxo_player_sync', {
              detail: { uid, status: newStatus, statusReason: reason }
            }));
          }
        } catch (e) {}
        return { ...u, status: newStatus, notes: reason || u.notes };
      });
      try {
        localStorage.setItem('haarshxo_admin_users', JSON.stringify(updated));
        broadcastChange('users', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'users', data: updated } }));
      } catch {}
      return updated;
    });

    // Dedicated backend status update call
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/users/${encodeURIComponent(uid)}/update-status` : `/api/users/${encodeURIComponent(uid)}/update-status`;
      const body = JSON.stringify({ status: newStatus, reason });
      const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };
      let res;
      try {
        res = await fetch(primaryUrl, opts);
      } catch {
        res = await fetch(`http://localhost:5001/api/users/${encodeURIComponent(uid)}/update-status`, opts);
      }
      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUsersList(prev => prev.map(u => (u.uid === uid || u.id === uid || u.supabaseId === uid) ? { ...u, ...json.user } : u));
        }
      }
    } catch (err) {
      console.warn('[AdminContext] updateUserStatus backend call failed:', err);
    }

    addAuditLog('USER_STATUS_CHANGE', 'USERS', `Changed user UID ${uid} status to "${newStatus.toUpperCase()}" (${reason || 'No reason specified'})`);
  };

  const syncUserFromGame = useCallback((gameUserData) => {
    if (!gameUserData?.uid) return;
    setUsersList(prev => {
      const exists = prev.some(u => u.uid === gameUserData.uid);
      let updated;
      if (exists) {
        updated = prev.map(u => {
          if (u.uid !== gameUserData.uid) return u;
          return {
            ...u,
            coins: typeof gameUserData.coins !== 'undefined' ? gameUserData.coins : u.coins,
            csTickets: typeof gameUserData.csTickets !== 'undefined' ? gameUserData.csTickets : u.csTickets,
            brTickets: typeof gameUserData.brTickets !== 'undefined' ? gameUserData.brTickets : u.brTickets,
            inGameName: gameUserData.inGameName || u.inGameName,
          };
        });
      } else {
        const newUser = {
          id: `u_${Date.now()}`,
          uid: gameUserData.uid,
          inGameName: gameUserData.inGameName || 'New Player',
          email: `${gameUserData.inGameName?.toLowerCase().replace(/\s+/g, '') || 'player'}@haarshxo.gg`,
          coins: gameUserData.coins || 0,
          csTickets: gameUserData.csTickets || 0,
          brTickets: gameUserData.brTickets || 0,
          role: 'player',
          status: 'active',
          joinDate: new Date().toISOString().split('T')[0],
          notes: 'Registered player on Haarsh XO Portal'
        };
        updated = [newUser, ...prev];
      }
      try {
        localStorage.setItem('haarshxo_admin_users', JSON.stringify(updated));
        broadcastChange('users', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_users');
      if (stored) syncToBackend({ users: JSON.parse(stored) });
    }, 500);
  }, [broadcastChange, syncToBackend]);

  // ─── Announcements ────────────────────────────────────────────────────────
  const createAnnouncement = (data) => {
    lastLocalActionTime.current = Date.now();
    const newAnn = {
      id: `ann_${Date.now()}`,
      title: data.title,
      message: data.message || '',
      type: data.type || 'tournament',
      active: true,
      showMarquee: data.showMarquee !== false,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => {
      const updated = [newAnn, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(updated));
        broadcastChange('announcements', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_announcements');
      if (stored) syncToBackend({ announcements: JSON.parse(stored) });
    }, 0);
    addAuditLog('ANNOUNCEMENT_POSTED', 'ANNOUNCEMENTS', `Posted announcement: "${newAnn.title}"`);

    // Synchronize to Notification Center Inbox
    try {
      const rawInbox = localStorage.getItem('haarshxo_notification_inbox');
      const inbox = rawInbox ? JSON.parse(rawInbox) : [];
      const notifItem = {
        id: `ann_notif_${newAnn.id}`,
        message: newAnn.title,
        subtitle: newAnn.message || 'Global broadcast announcement from HAARSH XO Operations.',
        type: newAnn.type === 'tournament' ? 'trophy' : (newAnn.type === 'reward' ? 'gift' : (newAnn.type === 'alert' ? 'warning' : 'info')),
        time: 'Just now',
        read: false
      };
      const updatedInbox = [notifItem, ...inbox.filter(n => n.id !== notifItem.id).slice(0, 49)];
      localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updatedInbox));
      window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updatedInbox }));
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type: 'inbox_updated', data: updatedInbox });
      }
    } catch (e) {
      console.warn('Sync to notification inbox error:', e);
    }

    return newAnn;
  };

  const updateAnnouncement = (id, data) => {
    lastLocalActionTime.current = Date.now();
    setAnnouncements(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, ...data } : a);
      try {
        localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(updated));
        broadcastChange('announcements', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_announcements');
      if (stored) syncToBackend({ announcements: JSON.parse(stored) });
    }, 0);
    addAuditLog('ANNOUNCEMENT_UPDATED', 'ANNOUNCEMENTS', `Updated announcement ID: ${id}`);

    try {
      const rawInbox = localStorage.getItem('haarshxo_notification_inbox');
      const inbox = rawInbox ? JSON.parse(rawInbox) : [];
      const updatedInbox = inbox.map(n => {
        if (n.id === `ann_notif_${id}`) {
          return {
            ...n,
            message: data.title !== undefined ? data.title : n.message,
            subtitle: data.message !== undefined ? data.message : n.subtitle,
            type: data.type === 'tournament' ? 'trophy' : (data.type === 'reward' ? 'gift' : (data.type === 'alert' ? 'warning' : n.type))
          };
        }
        return n;
      });
      localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updatedInbox));
      window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updatedInbox }));
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type: 'inbox_updated', data: updatedInbox });
      }
    } catch (e) {}
  };

  const deleteAnnouncement = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    setAnnouncements(prev => {
      const updated = prev.filter(a => String(a.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(updated));
        broadcastChange('announcements', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_announcements');
      if (stored !== null) syncToBackend({ announcements: JSON.parse(stored) });
    }, 0);
    addAuditLog('ANNOUNCEMENT_DELETED', 'ANNOUNCEMENTS', `Deleted announcement ID: ${id}`);

    // Clean up from Notification Center inbox
    try {
      const rawInbox = localStorage.getItem('haarshxo_notification_inbox');
      const inbox = rawInbox ? JSON.parse(rawInbox) : [];
      const updatedInbox = inbox.filter(n => n.id !== `ann_notif_${id}` && n.id !== `ann_notif_${idStr}`);
      localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updatedInbox));
      window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updatedInbox }));
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type: 'inbox_updated', data: updatedInbox });
      }
    } catch (e) {}
  };

  const toggleAnnouncement = (id) => {
    lastLocalActionTime.current = Date.now();
    setAnnouncements(prev => {
      const updated = prev.map(a => a.id === id ? { ...a, active: !a.active } : a);
      try {
        localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(updated));
        broadcastChange('announcements', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_announcements');
      if (stored) syncToBackend({ announcements: JSON.parse(stored) });
    }, 0);
  };

  // ─── Giveaways ────────────────────────────────────────────────────────────
  const createGiveaway = (data) => {
    lastLocalActionTime.current = Date.now();
    const newG = {
      id: Date.now(),
      category: data.category || 'main',
      title: data.title || 'Exclusive Free Fire Giveaway',
      prize: data.prize || 'Diamonds / Passes',
      daysLeft: Number(data.daysLeft) || 7,
      participants: 0,
      participantsList: [],
      requirements: data.requirements || [
        { id: 'r1', text: 'Subscribe to HAARSH XO on YouTube', completed: false }
      ],
      image: data.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      active: true,
      winner: null
    };
    setGiveawaysList(prev => {
      const updated = [newG, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 0);
    addAuditLog('GIVEAWAY_CREATED', 'GIVEAWAYS', `Created giveaway "${newG.title}" (Prize: ${newG.prize})`);
    return newG;
  };

  const updateGiveaway = (id, data) => {
    lastLocalActionTime.current = Date.now();
    setGiveawaysList(prev => {
      const updated = prev.map(g => g.id === id ? { ...g, ...data } : g);
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 0);
    addAuditLog('GIVEAWAY_UPDATED', 'GIVEAWAYS', `Updated giveaway ID: ${id}`);
  };

  const deleteGiveaway = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    setGiveawaysList(prev => {
      const updated = prev.filter(g => String(g.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 0);
    addAuditLog('GIVEAWAY_DELETED', 'GIVEAWAYS', `Deleted giveaway ID: ${id}`);
  };

  const drawGiveawayWinner = (id) => {
    lastLocalActionTime.current = Date.now();
    let pickedWinner = null;
    setGiveawaysList(prev => {
      const updated = prev.map(g => {
        if (g.id !== id) return g;
        const pool = g.participantsList && g.participantsList.length > 0
          ? g.participantsList
          : [{ ign: 'Lucky_Winner_XO', uid: '782910481' }, { ign: 'Thunder_Strike', uid: '661902847' }, { ign: 'Pro_Booyah_99', uid: '849204812' }];
        
        const randomEntry = pool[Math.floor(Math.random() * pool.length)];
        pickedWinner = {
          ign: randomEntry.ign,
          uid: randomEntry.uid,
          drawnAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
          prize: g.prize
        };
        return {
          ...g,
          winner: pickedWinner
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });

    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 50);
    if (pickedWinner) {
      addAuditLog('GIVEAWAY_WINNER_DRAWN', 'GIVEAWAYS', `Drew winner for giveaway ${id}: ${pickedWinner.ign} (UID: ${pickedWinner.uid}) — Prize: ${pickedWinner.prize}`);
    }
    return pickedWinner;
  };

  const addGiveawayParticipant = (giveawayId, { uid, ign }) => {
    lastLocalActionTime.current = Date.now();
    setGiveawaysList(prev => {
      const updated = prev.map(g => {
        if (g.id !== giveawayId) return g;
        const alreadyJoined = (g.participantsList || []).some(p => p.uid === uid);
        if (alreadyJoined) return g;

        const newEntry = {
          id: `gp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          uid: uid || '849204812',
          ign: ign || 'HaarshFan_99',
          time: new Date().toISOString().split('T')[0]
        };
        const updatedList = [newEntry, ...(g.participantsList || [])];
        return {
          ...g,
          participantsList: updatedList,
          participants: (g.participants || 0) + 1
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 50);
    addAuditLog('GIVEAWAY_ENTRY', 'GIVEAWAYS', `Player ${ign} (UID: ${uid}) entered giveaway ID: ${giveawayId}`);
  };

  // ─── Store Rewards CRUD ───────────────────────────────────────────────────
  const createReward = (data) => {
    lastLocalActionTime.current = Date.now();
    const newReward = {
      id: Date.now(),
      storeType: data.storeType || 'main',
      title: data.title || 'New Reward Item',
      cost: Number(data.cost) || 1000,
      type: data.type || 'diamonds',
      description: data.description || 'Instant delivery to your Free Fire account via UID.',
      image: data.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
      tag: data.tag || 'NEW',
      stock: Number(data.stock) || 100,
      active: true
    };
    setStoreRewards(prev => {
      const updated = [newReward, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_store');
      if (stored) syncToBackend({ storeRewards: JSON.parse(stored) });
    }, 0);
    addAuditLog('REWARD_CREATED', 'STORE', `Created store reward "${newReward.title}" (${newReward.cost} XO Coins, Store: ${newReward.storeType})`);
    return newReward;
  };

  const updateReward = (id, data) => {
    lastLocalActionTime.current = Date.now();
    setStoreRewards(prev => {
      const updated = prev.map(r => r.id === id ? { ...r, ...data } : r);
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_store');
      if (stored) syncToBackend({ storeRewards: JSON.parse(stored) });
    }, 0);
    addAuditLog('REWARD_UPDATED', 'STORE', `Updated store reward ID: ${id}`);
  };

  const deleteReward = (id) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(id);
    setStoreRewards(prev => {
      const updated = prev.filter(r => String(r.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: updated } }));
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_store');
      if (stored) syncToBackend({ storeRewards: JSON.parse(stored) });
    }, 0);
    addAuditLog('REWARD_DELETED', 'STORE', `Deleted reward item ID: ${id}`);
  };

  const recordStoreRedemption = (item, user) => {
    lastLocalActionTime.current = Date.now();
    // 1. Decrement stock and sync
    setStoreRewards(prev => {
      const updated = prev.map(r => {
        if (r.id !== item.id) return r;
        return { ...r, stock: Math.max(0, (r.stock || 10) - 1) };
      });
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
      } catch {}
      return updated;
    });

    // 2. Add redemption record (separately from Razorpay payments ledger!)
    const newRedemption = {
      id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rewardId: item.id,
      rewardTitle: item.title,
      rewardType: item.type || 'reward',
      cost: item.cost,
      userUid: user?.uid || '849204812',
      userIgn: user?.inGameName || 'HaarshFan_99',
      userEmail: user?.email || '',
      status: 'pending', // 'pending' | 'delivered' | 'cancelled'
      deliveryDetails: '',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: Date.now()
    };

    setRedemptions(prev => {
      const updated = [newRedemption, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(updated));
        broadcastChange('redemptions', updated);
      } catch {}
      return updated;
    });

    // Also send directly to backend /api/redemptions endpoint for instant sync
    try {
      const baseUrl = getBackendBaseUrl();
      const redUrl = baseUrl ? `${baseUrl}/api/redemptions` : '/api/redemptions';
      fetch(redUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRedemption)
      }).catch(err => console.warn('[AdminSync] /api/redemptions post error:', err));
    } catch {}

    setTimeout(() => {
      const storedStore = localStorage.getItem('haarshxo_admin_store');
      const storedRed = localStorage.getItem('haarshxo_admin_redemptions');
      const payload = {};
      if (storedStore) payload.storeRewards = JSON.parse(storedStore);
      if (storedRed) payload.redemptions = JSON.parse(storedRed);
      if (Object.keys(payload).length) syncToBackend(payload);
    }, 0);

    addAuditLog('STORE_REDEMPTION', 'STORE', `Player ${user?.inGameName || 'Player'} (UID: ${user?.uid || 'N/A'}) redeemed "${item.title}" for ${item.cost} XO Coins`);
  };

  const updateRedemptionStatus = (id, newStatus, deliveryDetails = '') => {
    lastLocalActionTime.current = Date.now();
    setRedemptions(prev => {
      const updated = prev.map(r => {
        if (r.id !== id) return r;
        return { 
          ...r, 
          status: newStatus, 
          deliveryDetails: deliveryDetails !== undefined ? deliveryDetails : r.deliveryDetails,
          updatedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) 
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(updated));
        broadcastChange('redemptions', updated);
      } catch {}
      return updated;
    });

    try {
      const baseUrl = getBackendBaseUrl();
      const statusUrl = baseUrl ? `${baseUrl}/api/redemptions/${id}/status` : `/api/redemptions/${id}/status`;
      fetch(statusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, deliveryDetails, adminUser: 'ADMIN' })
      }).catch(err => console.warn('[AdminSync] /api/redemptions status error:', err));
    } catch {}

    setTimeout(() => {
      const storedRed = localStorage.getItem('haarshxo_admin_redemptions');
      if (storedRed) syncToBackend({ redemptions: JSON.parse(storedRed) });
    }, 0);

    addAuditLog('REDEMPTION_UPDATED', 'STORE', `Redemption ${id} status updated to "${newStatus}"`);
  };

  const clearAuditLogs = () => {
    lastLocalActionTime.current = Date.now();
    setAuditLogs([]);
    try {
      localStorage.setItem('haarshxo_admin_logs', JSON.stringify([]));
      broadcastChange('logs', []);
    } catch {}
    setTimeout(() => syncToBackend({ auditLogs: [] }), 0);
  };

  return (
    <AdminContext.Provider
      value={{
        // Auth
        isAdminAuthenticated,
        currentAdmin,
        loginAdmin,
        logoutAdmin,
        AUTHORIZED_ADMINS,
        isAuthorizedAdminEmail,

        // Tournaments
        tournaments,
        createTournament,
        updateTournament,
        deleteTournament,
        toggleTournamentStatus,
        addTournamentParticipant,
        removeTournamentParticipant,
        declareTournamentResults,

        // Passes
        passes,
        createPass,
        updatePass,
        deletePass,

        // Redeem Codes
        redeemCodes,
        createRedeemCode,
        toggleRedeemCode,
        deleteRedeemCode,
        redeemPromoCode,

        // Payments & Refunds
        transactions,
        recordPayment,
        updatePaymentStatus,

        // Users
        usersList,
        fetchUsers,
        updateUserBalance,
        updateUserStatus,
        syncUserFromGame,

        // Announcements
        announcements,
        createAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        toggleAnnouncement,

        // Giveaways
        giveawaysList,
        createGiveaway,
        updateGiveaway,
        deleteGiveaway,
        drawGiveawayWinner,
        addGiveawayParticipant,

        // Store Rewards
        storeRewards,
        createReward,
        updateReward,
        deleteReward,
        recordStoreRedemption,

        // XO Coins Reward Redemptions
        redemptions,
        updateRedemptionStatus,

        // Audit Logs
        auditLogs,
        addAuditLog,
        clearAuditLogs,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => useContext(AdminContext);
