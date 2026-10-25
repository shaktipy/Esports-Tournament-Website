import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { 
  getTournamentTotalSlots, 
  assignRandomSlot, 
  getOccupiedSlotNumbers, 
  getAvailableSlots 
} from '../utils/tournamentSlots';
import { DEFAULT_MISSIONS } from '../utils/defaultMissions';

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
    slots: '4/4 Squads',
    maxSlots: 4,
    registeredCount: 4,
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop',
    description: 'Competitive 4v4 Clash Squad. Fast rounds, high stakes, master tier teams.',
    rules: 'No character skill abuse. Gun attributes ON. Emote after knock allowed.',
    status: 'closed', // open | closed | ongoing | completed | upcoming
    participants: [
      { 
        id: 'p1', 
        slotNumber: 1, 
        slot: 1, 
        type: 'squad',
        ign: 'XO_Thunder', 
        uid: '849204812', 
        leaderIgn: 'XO_Thunder',
        leaderUid: '849204812',
        teamName: 'Team Thunder', 
        phone: '9876543210',
        players: [
          { role: 'Captain (P1)', ign: 'XO_Thunder', uid: '849204812' },
          { role: 'Player 2', ign: 'Thunder_Viper', uid: '849204813' },
          { role: 'Player 3', ign: 'Thunder_Blaze', uid: '849204814' },
          { role: 'Player 4', ign: 'Thunder_Storm', uid: '849204815' }
        ],
        registeredAt: '2026-09-28 14:20', 
        ticketUsed: '4x CS Tickets', 
        status: 'confirmed' 
      },
      { 
        id: 'p2', 
        slotNumber: 2, 
        slot: 2, 
        type: 'squad',
        ign: 'Soul_Mortal99', 
        uid: '912384712', 
        leaderIgn: 'Soul_Mortal99',
        leaderUid: '912384712',
        teamName: 'Soul Army', 
        phone: '9876543211',
        players: [
          { role: 'Captain (P1)', ign: 'Soul_Mortal99', uid: '912384712' },
          { role: 'Player 2', ign: 'Soul_Viper', uid: '912384713' },
          { role: 'Player 3', ign: 'Soul_Regaltos', uid: '912384714' },
          { role: 'Player 4', ign: 'Soul_Aman', uid: '912384715' }
        ],
        registeredAt: '2026-09-28 15:10', 
        ticketUsed: '4x CS Tickets', 
        status: 'confirmed' 
      },
      { 
        id: 'p3', 
        slotNumber: 3, 
        slot: 3, 
        type: 'squad',
        ign: 'GodL_Shadow', 
        uid: '741289301', 
        leaderIgn: 'GodL_Shadow',
        leaderUid: '741289301',
        teamName: 'GodLike Esports', 
        phone: '9876543212',
        players: [
          { role: 'Captain (P1)', ign: 'GodL_Shadow', uid: '741289301' },
          { role: 'Player 2', ign: 'GodL_Jonathan', uid: '741289302' },
          { role: 'Player 3', ign: 'GodL_Neyoo', uid: '741289303' },
          { role: 'Player 4', ign: 'GodL_Zgod', uid: '741289304' }
        ],
        registeredAt: '2026-09-28 16:45', 
        ticketUsed: '4x CS Tickets', 
        status: 'confirmed' 
      },
      { 
        id: 'p4', 
        slotNumber: 4, 
        slot: 4, 
        type: 'squad',
        ign: 'Total_Ajay', 
        uid: '632194820', 
        leaderIgn: 'Total_Ajay',
        leaderUid: '632194820',
        teamName: 'Total Gaming B', 
        phone: '9876543213',
        players: [
          { role: 'Captain (P1)', ign: 'Total_Ajay', uid: '632194820' },
          { role: 'Player 2', ign: 'Total_Bala', uid: '632194821' },
          { role: 'Player 3', ign: 'Total_Fozy', uid: '632194822' },
          { role: 'Player 4', ign: 'Total_Mafia', uid: '632194823' }
        ],
        registeredAt: '2026-09-28 17:30', 
        ticketUsed: '4x CS Tickets', 
        status: 'confirmed' 
      },
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
    slots: '2/12 Squads',
    maxSlots: 12,
    registeredCount: 2,
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    description: 'Premier Battle Royale championship streamed live on HAARSH XO YouTube channel.',
    rules: 'Official FFWS points table. 12 Matches over 2 days. Hackers instantly banned.',
    status: 'open',
    participants: [
      { 
        id: 'p5', 
        slotNumber: 3, 
        slot: 3, 
        type: 'squad',
        ign: 'Hydra_Dynamo', 
        uid: '881290342', 
        leaderIgn: 'Hydra_Dynamo',
        leaderUid: '881290342',
        teamName: 'Hydra Clan', 
        phone: '9811223344',
        players: [
          { role: 'Captain (P1)', ign: 'Hydra_Dynamo', uid: '881290342' },
          { role: 'Player 2', ign: 'Hydra_Alpha', uid: '881290343' },
          { role: 'Player 3', ign: 'Hydra_Beta', uid: '881290344' },
          { role: 'Player 4', ign: 'Hydra_Delta', uid: '881290345' }
        ],
        registeredAt: '2026-09-27 18:00', 
        ticketUsed: '4x BR Tickets', 
        status: 'confirmed' 
      },
      { 
        id: 'p6', 
        slotNumber: 7, 
        slot: 7, 
        type: 'squad',
        ign: 'Blind_Joker', 
        uid: '445129381', 
        leaderIgn: 'Blind_Joker',
        leaderUid: '445129381',
        teamName: 'Blind Esports', 
        phone: '9822334455',
        players: [
          { role: 'Captain (P1)', ign: 'Blind_Joker', uid: '445129381' },
          { role: 'Player 2', ign: 'Blind_Rony', uid: '445129382' },
          { role: 'Player 3', ign: 'Blind_Spidey', uid: '445129383' },
          { role: 'Player 4', ign: 'Blind_Venom', uid: '445129384' }
        ],
        registeredAt: '2026-09-27 19:30', 
        ticketUsed: '4x BR Tickets', 
        status: 'confirmed' 
      },
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
    slots: '1/48 Players',
    maxSlots: 48,
    registeredCount: 1,
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    description: 'Pure 1v1 gun skill. Snipers, Desert Eagle, Shotguns only.',
    rules: 'Best of 7 rounds. Headshots only in round 3 and 7.',
    status: 'open',
    participants: [
      { id: 'p7', slotNumber: 8, slot: 8, ign: 'SniperKing_XO', uid: '229103948', teamName: 'Solo', registeredAt: '2026-09-28 10:15', ticketUsed: '1x BR Ticket', status: 'confirmed' },
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
    ticketImage: '/tokens/mascot-logo.png',
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
    status: 'open',
    participants: 0,
    participantsList: [],
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
    status: 'open',
    participants: 0,
    participantsList: [],
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
    status: 'open',
    participants: 0,
    participantsList: [],
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

export const AdminProvider = ({ children }) => {

  // Unique tab identifier to filter out self-broadcast messages
  const tabId = useRef(`tab_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`).current;
  const remoteSyncRef = useRef({});
  const lastLocalActionTime = useRef(0);
  // Tracks how many syncToBackend calls are currently in-flight.
  const pendingSyncCount = useRef(0);
  // Timestamp of the last time we successfully received & applied backend data.
  const lastAppliedRemoteTime = useRef(0);
  // Tracks whether we have successfully pulled authoritative state from the server.
  const hasLoadedBackendState = useRef(false);

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
      const list = saved ? JSON.parse(saved) : INITIAL_TOURNAMENTS;
      // Ensure all participants have unique valid slot numbers
      return list.map(t => {
        if (!Array.isArray(t.participants) || t.participants.length === 0) return t;
        const totalSlots = getTournamentTotalSlots(t);
        const used = new Set();
        const updatedParticipants = t.participants.map(p => {
          let s = Number(p.slotNumber || p.slot);
          if (isNaN(s) || s < 1 || s > totalSlots || used.has(s)) {
            // Find next available slot
            for (let next = 1; next <= totalSlots; next++) {
              if (!used.has(next)) {
                s = next;
                break;
              }
            }
          }
          if (s) used.add(s);
          return { ...p, slotNumber: s || 1, slot: s || 1 };
        });
        return { ...t, participants: updatedParticipants };
      });
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
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map(g => {
            const cleanList = (g.participantsList || []).filter(p => 
              p && p.uid && p.ign &&
              p.uid !== '849204812' && 
              p.ign !== 'HaarshFan_99' && 
              p.ign !== 'Soul_Mortal99' && 
              p.ign !== 'GodL_Shadow'
            );
            return {
              ...g,
              status: g.status || (g.winner ? 'completed' : 'open'),
              participantsList: cleanList,
              participants: cleanList.length
            };
          });
          try {
            localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(cleaned));
          } catch {}
          return cleaned;
        }
      }
      return INITIAL_GIVEAWAYS;
    } catch {
      return INITIAL_GIVEAWAYS;
    }
  });

  // Missions
  const [missions, setMissions] = useState(() => {
    try {
      const saved = localStorage.getItem('haarshxo_admin_missions');
      return saved ? JSON.parse(saved) : DEFAULT_MISSIONS;
    } catch {
      return DEFAULT_MISSIONS;
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

    if (Array.isArray(data.tournaments) && data.tournaments.length > 0) {
      remoteSyncRef.current['tournaments'] = true;
      setTournaments(data.tournaments);
      try { localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(data.tournaments)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: data.tournaments } }));
    }
    if (Array.isArray(data.passes) && data.passes.length > 0) {
      remoteSyncRef.current['passes'] = true;
      setPasses(data.passes);
      try { localStorage.setItem('haarshxo_admin_passes', JSON.stringify(data.passes)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: data.passes } }));
    }
    if (Array.isArray(data.redeemCodes) && data.redeemCodes.length > 0) {
      remoteSyncRef.current['codes'] = true;
      setRedeemCodes(data.redeemCodes);
      try { localStorage.setItem('haarshxo_admin_codes', JSON.stringify(data.redeemCodes)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redeemCodes', data: data.redeemCodes } }));
    }
    if (Array.isArray(data.transactions)) {
      remoteSyncRef.current['transactions'] = true;
      setTransactions(data.transactions);
      try { localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(data.transactions)); } catch {}
    }
    if (Array.isArray(data.redemptions)) {
      remoteSyncRef.current['redemptions'] = true;
      setRedemptions(data.redemptions);
      try { localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(data.redemptions)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'redemptions', data: data.redemptions } }));
    }
    const uList = Array.isArray(data.users)
      ? data.users
      : (Array.isArray(data.usersList) ? data.usersList : null);
    if (uList) {
      remoteSyncRef.current['users'] = true;
      setUsersList(uList);
      try { localStorage.setItem('haarshxo_admin_users', JSON.stringify(uList)); } catch {}
    }
    // FIXED: Removed `&& data.announcements.length > 0` — empty [] must ALSO be applied.
    // Previously, if all announcements were deleted, the second admin would never update
    // because length > 0 was false, leaving stale announcements in their state.
    if (Array.isArray(data.announcements)) {
      remoteSyncRef.current['announcements'] = true;
      setAnnouncements(data.announcements);
      try { localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(data.announcements)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: data.announcements } }));
    }
    const rawGList = Array.isArray(data.giveawaysList)
      ? data.giveawaysList
      : (Array.isArray(data.giveaways) ? data.giveaways : null);
    if (rawGList && rawGList.length > 0) {
      const gList = rawGList.map(item => {
        const cleanList = (item.participantsList || []).filter(p => 
          p && p.uid && p.ign &&
          p.uid !== '849204812' && 
          p.ign !== 'HaarshFan_99' && 
          p.ign !== 'Soul_Mortal99' && 
          p.ign !== 'GodL_Shadow'
        );
        return {
          ...item,
          status: item.status || (item.winner ? 'completed' : 'open'),
          participantsList: cleanList,
          participants: cleanList.length
        };
      });
      remoteSyncRef.current['giveaways'] = true;
      setGiveawaysList(gList);
      try { localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(gList)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: gList } }));
    }
    if (Array.isArray(data.missions) && data.missions.length > 0) {
      remoteSyncRef.current['missions'] = true;
      setMissions(data.missions);
      try { localStorage.setItem('haarshxo_admin_missions', JSON.stringify(data.missions)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'missions', data: data.missions } }));
    }
    if (Array.isArray(data.storeRewards) && data.storeRewards.length > 0) {
      remoteSyncRef.current['store'] = true;
      setStoreRewards(data.storeRewards);
      try { localStorage.setItem('haarshxo_admin_store', JSON.stringify(data.storeRewards)); } catch {}
      window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: data.storeRewards } }));
    }
    if (Array.isArray(data.auditLogs) && data.auditLogs.length > 0) {
      remoteSyncRef.current['logs'] = true;
      setAuditLogs(data.auditLogs);
      try { localStorage.setItem('haarshxo_admin_logs', JSON.stringify(data.auditLogs)); } catch {}
    }
    hasLoadedBackendState.current = true;
  }, []);

  const fetchFromBackend = useCallback(async (force = false) => {
    // Guard: If a local action happened within 10s and not forced, skip to avoid overwriting fresh saves.
    if (!force && Date.now() - lastLocalActionTime.current < 10000) return null;
    // Guard: Never poll while a save/sync is actively in-flight
    if (!force && pendingSyncCount.current > 0) {
      return null;
    }
    try {
      const baseUrl = getBackendBaseUrl();
      const primaryUrl = baseUrl ? `${baseUrl}/api/admin/data` : '/api/admin/data';
      let res;
      try {
        res = await fetch(primaryUrl);
      } catch {
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch('http://localhost:5001/api/admin/data').catch(() => null);
        }
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
    if (!payload || typeof payload !== 'object' || Object.keys(payload).length === 0) return false;

    // Safety Guard: Don't push empty arrays that would wipe populated catalogs.
    // NOTE: 'announcements' is intentionally EXCLUDED from this guard because
    // an admin CAN legitimately delete ALL announcements (empty list is valid).
    for (const [k, v] of Object.entries(payload)) {
      // Block empty arrays only for these catalogs (deleting all promo codes / rewards is intentional)
      if (['tournaments', 'storeRewards', 'giveawaysList'].includes(k)) {
        if (Array.isArray(v) && v.length === 0) {
          console.warn(`[AdminSync] Blocked attempt to sync empty array for ${k}`);
          return false;
        }
      }
    }

    const baseUrl = getBackendBaseUrl();
    const primaryUrl = baseUrl ? `${baseUrl}/api/admin/sync` : '/api/admin/sync';
    const fallbackUrl = 'http://localhost:5001/api/admin/sync';
    const body = JSON.stringify(payload);
    const opts = { method: 'POST', headers: { 'Content-Type': 'application/json' }, body };

    pendingSyncCount.current += 1;

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        let res;
        try {
          res = await fetch(primaryUrl, opts);
        } catch {
          if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            res = await fetch(fallbackUrl, opts).catch(() => null);
          }
        }
        if (res?.ok) {
          pendingSyncCount.current = Math.max(0, pendingSyncCount.current - 1);
          return true;
        }
      } catch (err) {
        console.warn(`[AdminSync] Sync attempt ${attempt} error:`, err);
      }
      if (attempt < 3) {
        await new Promise(r => setTimeout(r, attempt * 500));
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
        if (type === 'tournaments')       { setTournaments(data); try { localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(data)); } catch {} }
        else if (type === 'passes')       { setPasses(data); try { localStorage.setItem('haarshxo_admin_passes', JSON.stringify(data)); } catch {} }
        else if (type === 'codes')        { setRedeemCodes(data); try { localStorage.setItem('haarshxo_admin_codes', JSON.stringify(data)); } catch {} }
        else if (type === 'transactions') { setTransactions(data); try { localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(data)); } catch {} }
        else if (type === 'redemptions')  { setRedemptions(data); try { localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(data)); } catch {} }
        else if (type === 'users')        { setUsersList(data); try { localStorage.setItem('haarshxo_admin_users', JSON.stringify(data)); } catch {} }
        else if (type === 'announcements') { setAnnouncements(data); try { localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(data)); } catch {} }
        else if (type === 'giveaways')    { setGiveawaysList(data); try { localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(data)); } catch {} }
        else if (type === 'missions')     { setMissions(data); try { localStorage.setItem('haarshxo_admin_missions', JSON.stringify(data)); } catch {} }
        else if (type === 'store')        { setStoreRewards(data); try { localStorage.setItem('haarshxo_admin_store', JSON.stringify(data)); } catch {} }
        else if (type === 'logs')         { setAuditLogs(data); try { localStorage.setItem('haarshxo_admin_logs', JSON.stringify(data)); } catch {} }
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
        } else if (e.key === 'haarshxo_admin_missions') {
          remoteSyncRef.current['missions'] = true;
          setMissions(data);
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
        const m = tryParse('haarshxo_admin_missions');
        const s = tryParse('haarshxo_admin_store');
        const l = tryParse('haarshxo_admin_logs');

        // Use the remoteSyncRef flag so the persistence effects know to skip writing back
        if (t !== null) { remoteSyncRef.current['tournaments'] = true; setTournaments(t); }
        if (p !== null) { remoteSyncRef.current['passes'] = true; setPasses(p); }
        if (c !== null) { remoteSyncRef.current['codes'] = true; setRedeemCodes(c); }
        if (tx !== null) { remoteSyncRef.current['transactions'] = true; setTransactions(tx); }
        if (red !== null) { remoteSyncRef.current['redemptions'] = true; setRedemptions(red); }
        if (u !== null) { remoteSyncRef.current['users'] = true; setUsersList(u); }
        // FIXED: was `if (a)` — empty array [] is falsy so deleted announcements were never applied
        if (a !== null) { remoteSyncRef.current['announcements'] = true; setAnnouncements(a); }
        if (m !== null) { remoteSyncRef.current['missions'] = true; setMissions(m); }
        if (g) {
          const cleanedG = g.map(item => {
            const cleanList = (item.participantsList || []).filter(p => 
              p && p.uid && p.ign &&
              p.uid !== '849204812' && 
              p.ign !== 'HaarshFan_99' && 
              p.ign !== 'Soul_Mortal99' && 
              p.ign !== 'GodL_Shadow'
            );
            return {
              ...item,
              status: item.status || (item.winner ? 'completed' : 'open'),
              participantsList: cleanList,
              participants: cleanList.length
            };
          });
          remoteSyncRef.current['giveaways'] = true;
          setGiveawaysList(cleanedG);
        }
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

  // 3. Browser Cache (localStorage) persistence:
  // These effects ONLY mirror state into the browser's localStorage for fast local reloads.
  // They NEVER call syncToBackend or broadcastChange, preventing initial mount or StrictMode
  // from ever overwriting server data with uninitialized/default state.
  // All backend saves are driven EXCLUSIVELY by explicit user actions.
  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(tournaments)); } catch {}
  }, [tournaments]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_passes', JSON.stringify(passes)); } catch {}
  }, [passes]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_missions', JSON.stringify(missions)); } catch {}
  }, [missions]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_codes', JSON.stringify(redeemCodes)); } catch {}
  }, [redeemCodes]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_transactions', JSON.stringify(transactions)); } catch {}
  }, [transactions]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(redemptions)); } catch {}
  }, [redemptions]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_users', JSON.stringify(usersList)); } catch {}
  }, [usersList]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(announcements)); } catch {}
  }, [announcements]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(giveawaysList)); } catch {}
  }, [giveawaysList]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_store', JSON.stringify(storeRewards)); } catch {}
  }, [storeRewards]);

  useEffect(() => {
    try { localStorage.setItem('haarshxo_admin_logs', JSON.stringify(auditLogs)); } catch {}
  }, [auditLogs]);

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
    try {
      lastLocalActionTime.current = Date.now();
      const idStr = String(tourneyId);

      // Find current tournament object synchronously
      let currentTourney = (tournaments || []).find(t => String(t.id) === idStr);
      if (!currentTourney) {
        try {
          const stored = JSON.parse(localStorage.getItem('haarshxo_admin_tournaments') || '[]');
          currentTourney = stored.find(t => String(t.id) === idStr);
        } catch {}
      }

      const totalSlots = currentTourney ? getTournamentTotalSlots(currentTourney) : 12;
      const occupiedSlots = currentTourney ? getOccupiedSlotNumbers(currentTourney.participants) : new Set();

      // Determine random available slot number
      let assignedSlot = null;
      if (registrationData.slotNumber && !occupiedSlots.has(Number(registrationData.slotNumber))) {
        assignedSlot = Number(registrationData.slotNumber);
      } else if (currentTourney) {
        assignedSlot = assignRandomSlot(currentTourney);
      }
      if (!assignedSlot) {
        assignedSlot = registrationData.slotNumber || ((currentTourney?.participants?.length || 0) + 1);
      }

      const isSquad = (currentTourney?.mode || '').toLowerCase().includes('squad');
      const isDuo = (currentTourney?.mode || '').toLowerCase().includes('duo');
      const isSolo = (currentTourney?.mode || '').toLowerCase().includes('solo');
      const regType = registrationData.type || (isSquad ? 'squad' : isDuo ? 'duo' : 'solo');

      const newParticipant = {
        id: registrationData.id || `reg_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        tournamentId: currentTourney?.id || tourneyId,
        tournamentTitle: currentTourney?.title || registrationData.tournamentTitle || '',
        type: regType, // 'solo' | 'squad' | 'duo'
        mode: currentTourney?.mode || '',
        slotNumber: assignedSlot,
        slot: assignedSlot,
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
        ticketUsed: registrationData.ticketUsed || `${currentTourney?.ticketCost || 1}x ${currentTourney?.ticketType || 'CS'} Ticket`,
        status: 'confirmed'
      };

      setTournaments(prev => {
        const targetTourney = (prev || []).find(t => String(t.id) === idStr);
        if (!targetTourney) return prev;

        const targetTotalSlots = getTournamentTotalSlots(targetTourney);
        const updated = (prev || []).map(t => {
          if (String(t.id) !== idStr) return t;

          const updatedList = [newParticipant, ...(t.participants || []).filter(p => p.id !== newParticipant.id)];
          const newCount = updatedList.length;
          const maxSlotsNum = targetTotalSlots;

          return {
            ...t,
            participants: updatedList,
            registeredCount: newCount,
            slots: `${newCount}/${maxSlotsNum} ${isSolo ? 'Players' : isSquad ? 'Squads' : isDuo ? 'Duos' : 'Teams'}`,
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
      addAuditLog('PARTICIPANT_REGISTERED', 'TOURNAMENTS', `Registered ${displayIdentifier} in tournament ${tourneyId} (Assigned Slot #${newParticipant.slotNumber || '?'})`);
      return newParticipant;
    } catch (e) {
      console.error('addTournamentParticipant error:', e);
      return registrationData;
    }
  };

  const removeTournamentParticipant = (tourneyId, participantId, reason = '') => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(tourneyId);
    let disqualifiedRecord = null;
    let targetTourneyTitle = '';

    setTournaments(prev => {
      const targetTourney = prev.find(t => String(t.id) === idStr);
      if (!targetTourney) return prev;
      targetTourneyTitle = targetTourney.title;

      const participant = (targetTourney.participants || []).find(p => p.id === participantId);
      if (participant) {
        const pCopy = JSON.parse(JSON.stringify(participant));
        const isSquadMode = (targetTourney.mode || '').toLowerCase().includes('squad');
        const pPlayers = (Array.isArray(pCopy.players) && pCopy.players.length > 0)
          ? pCopy.players
          : (isSquadMode ? [
              { role: 'Captain (P1)', ign: pCopy.leaderIgn || pCopy.ign || 'Captain', uid: pCopy.leaderUid || pCopy.uid || 'UID1' },
              { role: 'Player 2', ign: `${pCopy.leaderIgn || pCopy.ign || 'Player'}_P2`, uid: `${pCopy.leaderUid || pCopy.uid || 'UID'}2` },
              { role: 'Player 3', ign: `${pCopy.leaderIgn || pCopy.ign || 'Player'}_P3`, uid: `${pCopy.leaderUid || pCopy.uid || 'UID'}3` },
              { role: 'Player 4', ign: `${pCopy.leaderIgn || pCopy.ign || 'Player'}_P4`, uid: `${pCopy.leaderUid || pCopy.uid || 'UID'}4` }
            ] : [
              { role: 'Player', ign: pCopy.ign || 'Player', uid: pCopy.uid || 'UID' }
            ]);

        disqualifiedRecord = {
          id: `disq_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          participantId: participant.id,
          originalParticipant: { ...pCopy, players: pPlayers },
          tournamentId: targetTourney.id,
          tournamentTitle: targetTourney.title,
          type: participant.type || (pPlayers.length > 1 ? 'squad' : 'solo'),
          slotNumber: participant.slotNumber || participant.slot,
          teamName: participant.teamName || participant.ign || 'Player',
          ign: participant.ign || participant.leaderIgn || 'Player',
          leaderIgn: participant.leaderIgn || participant.ign || 'Player',
          uid: participant.uid || participant.leaderUid || '',
          leaderUid: participant.leaderUid || participant.uid || '',
          phone: participant.phone || '',
          discord: participant.discord || '',
          ticketCost: participant.ticketCost,
          ticketUsed: participant.ticketUsed,
          players: pPlayers,
          uids: [participant.uid, participant.leaderUid, ...pPlayers.map(p => p.uid)].filter(Boolean),
          igns: [participant.ign, participant.leaderIgn, ...pPlayers.map(p => p.ign)].filter(Boolean),
          reason: reason || 'Fair-play regulation violation (Disqualified by Admin)',
          disqualifiedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
        };
      }

      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;
        const updatedList = (t.participants || []).filter(p => p.id !== participantId);
        const newCount = updatedList.length;
        const maxSlotsNum = getTournamentTotalSlots(t);
        const isSolo = (t.mode || '').toLowerCase().includes('solo');
        const isSquad = (t.mode || '').toLowerCase().includes('squad');
        const isDuo = (t.mode || '').toLowerCase().includes('duo');

        const existingDisq = t.disqualifiedParticipants || [];
        const newDisqList = disqualifiedRecord 
          ? [disqualifiedRecord, ...existingDisq.filter(d => d.participantId !== participantId)]
          : existingDisq;

        return {
          ...t,
          participants: updatedList,
          disqualifiedParticipants: newDisqList,
          registeredCount: newCount,
          slots: `${newCount}/${maxSlotsNum} ${isSolo ? 'Players' : isSquad ? 'Squads' : isDuo ? 'Duos' : 'Teams'}`,
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

    // 1. Dispatch custom event and cross-tab BroadcastChannel
    if (disqualifiedRecord) {
      const disqEventData = {
        tournamentId: idStr,
        tournamentTitle: targetTourneyTitle,
        disqRecord: disqualifiedRecord
      };
      window.dispatchEvent(new CustomEvent('haarshxo_tournament_disqualified', { detail: disqEventData }));
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type: 'tournament_disqualified', data: disqEventData });
      }

      // 2. Add high-priority in-app inbox notification for the player
      try {
        const inbox = JSON.parse(localStorage.getItem('haarshxo_notification_inbox') || '[]');
        const notifItem = {
          id: `notif_disq_${Date.now()}`,
          message: `🚫 Disqualified from ${targetTourneyTitle}`,
          subtitle: `Team "${disqualifiedRecord.teamName}" was disqualified by the tournament admin. Reason: ${disqualifiedRecord.reason}. Re-registration is locked.`,
          type: 'warning',
          time: 'Just now',
          read: false
        };
        const updatedInbox = [notifItem, ...inbox.filter(n => n.id !== notifItem.id).slice(0, 49)];
        localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updatedInbox));
        window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updatedInbox }));
        if (globalBroadcastChannel) {
          globalBroadcastChannel.postMessage({ type: 'inbox_updated', data: updatedInbox });
        }
      } catch (e) {}

      // 3. Remove tournament from user's registered list and record disqualification in local storage
      try {
        const regTourneys = JSON.parse(localStorage.getItem('harshxo_registeredTournaments') || '[]');
        const updatedReg = regTourneys.filter(id => String(id) !== idStr);
        localStorage.setItem('harshxo_registeredTournaments', JSON.stringify(updatedReg));

        const disqList = JSON.parse(localStorage.getItem('harshxo_disqualified_tournaments') || '[]');
        const updatedDisq = Array.from(new Set([...disqList, idStr]));
        localStorage.setItem('harshxo_disqualified_tournaments', JSON.stringify(updatedDisq));
      } catch (e) {}
    }

    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);

    const targetName = disqualifiedRecord?.teamName || participantId;
    addAuditLog('PARTICIPANT_DISQUALIFIED', 'TOURNAMENTS', `Disqualified "${targetName}" from tournament ${targetTourneyTitle} (${tourneyId}). Reason: ${disqualifiedRecord?.reason || reason}`);
  };

  const reinstateTournamentParticipant = (tourneyId, disqId) => {
    lastLocalActionTime.current = Date.now();
    const idStr = String(tourneyId);
    let targetTourneyTitle = '';
    let targetDisqRecord = null;
    let newlyAssignedSlot = 1;
    let restoredParticipant = null;

    setTournaments(prev => {
      const targetTourney = prev.find(t => String(t.id) === idStr);
      if (!targetTourney) return prev;
      targetTourneyTitle = targetTourney.title;

      const disqRecord = (targetTourney.disqualifiedParticipants || []).find(d => String(d.id) === String(disqId));
      if (!disqRecord) return prev;
      targetDisqRecord = disqRecord;

      // Assign an unoccupied random slot for the reinstated player
      newlyAssignedSlot = assignRandomSlot(targetTourney) || 1;

      // Robust recovery of full roster:
      let recoveredPlayers = [];
      if (Array.isArray(disqRecord.originalParticipant?.players) && disqRecord.originalParticipant.players.length > 0) {
        recoveredPlayers = JSON.parse(JSON.stringify(disqRecord.originalParticipant.players));
      } else if (Array.isArray(disqRecord.players) && disqRecord.players.length > 0) {
        recoveredPlayers = JSON.parse(JSON.stringify(disqRecord.players));
      } else if (Array.isArray(disqRecord.uids) && disqRecord.uids.length > 1) {
        recoveredPlayers = disqRecord.uids.map((uidVal, idx) => ({
          role: idx === 0 ? 'Captain (P1)' : `Player ${idx + 1}`,
          ign: disqRecord.igns?.[idx] || (idx === 0 ? disqRecord.leaderIgn || disqRecord.ign : `Player ${idx + 1}`),
          uid: String(uidVal)
        }));
      } else if ((targetTourney.mode || '').toLowerCase().includes('squad') || disqRecord.type === 'squad') {
        const capIgn = disqRecord.leaderIgn || disqRecord.ign || 'Captain';
        const capUid = disqRecord.leaderUid || disqRecord.uid || '10001';
        recoveredPlayers = [
          { role: 'Captain (P1)', ign: capIgn, uid: capUid },
          { role: 'Player 2', ign: `${capIgn}_P2`, uid: `${capUid}2` },
          { role: 'Player 3', ign: `${capIgn}_P3`, uid: `${capUid}3` },
          { role: 'Player 4', ign: `${capIgn}_P4`, uid: `${capUid}4` }
        ];
      } else {
        recoveredPlayers = [
          { role: 'Player', ign: disqRecord.leaderIgn || disqRecord.ign, uid: disqRecord.leaderUid || disqRecord.uid }
        ];
      }

      const isSquad = (targetTourney.mode || '').toLowerCase().includes('squad') || recoveredPlayers.length > 1;

      restoredParticipant = {
        ...(disqRecord.originalParticipant || {}),
        id: disqRecord.participantId || `reg_${Date.now()}`,
        tournamentId: targetTourney.id,
        tournamentTitle: targetTourney.title,
        type: disqRecord.originalParticipant?.type || disqRecord.type || (isSquad ? 'squad' : 'solo'),
        teamName: disqRecord.teamName || disqRecord.originalParticipant?.teamName || disqRecord.ign || 'Player / Squad',
        ign: disqRecord.ign || disqRecord.originalParticipant?.ign,
        leaderIgn: disqRecord.leaderIgn || disqRecord.ign || disqRecord.originalParticipant?.leaderIgn,
        uid: disqRecord.uid || disqRecord.originalParticipant?.uid,
        leaderUid: disqRecord.leaderUid || disqRecord.uid || disqRecord.originalParticipant?.leaderUid,
        phone: disqRecord.originalParticipant?.phone || disqRecord.phone || '',
        discord: disqRecord.originalParticipant?.discord || disqRecord.discord || '',
        ticketCost: disqRecord.originalParticipant?.ticketCost || disqRecord.ticketCost,
        ticketUsed: disqRecord.originalParticipant?.ticketUsed || disqRecord.ticketUsed || (isSquad ? '4x Tickets' : '1x Ticket'),
        players: recoveredPlayers,
        slotNumber: newlyAssignedSlot,
        slot: newlyAssignedSlot,
        status: 'confirmed',
        isUnbanned: true,
        unbannedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' }),
        registeredAt: disqRecord.originalParticipant?.registeredAt || disqRecord.registeredAt || new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      };

      const updated = prev.map(t => {
        if (String(t.id) !== idStr) return t;
        const updatedDisq = (t.disqualifiedParticipants || []).filter(d => String(d.id) !== String(disqId));
        const updatedParticipants = [...(t.participants || []).filter(p => p.id !== restoredParticipant.id), restoredParticipant];
        const newCount = updatedParticipants.length;
        const maxSlotsNum = getTournamentTotalSlots(t);
        const isSolo = (t.mode || '').toLowerCase().includes('solo');
        const isSquad = (t.mode || '').toLowerCase().includes('squad');
        const isDuo = (t.mode || '').toLowerCase().includes('duo');

        return {
          ...t,
          participants: updatedParticipants,
          disqualifiedParticipants: updatedDisq,
          registeredCount: newCount,
          slots: `${newCount}/${maxSlotsNum} ${isSolo ? 'Players' : isSquad ? 'Squads' : isDuo ? 'Duos' : 'Teams'}`,
          status: newCount >= maxSlotsNum ? 'closed' : t.status
        };
      });

      try {
        localStorage.setItem('haarshxo_admin_tournaments', JSON.stringify(updated));
        broadcastChange('tournaments', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'tournaments', data: updated } }));
      } catch (err) {}
      return updated;
    });

    // Notify reinstatement with new assigned slot
    if (targetDisqRecord && restoredParticipant) {
      const reinEventData = { 
        tournamentId: idStr, 
        tournamentTitle: targetTourneyTitle,
        newSlotNumber: newlyAssignedSlot,
        participant: restoredParticipant,
        uids: targetDisqRecord.uids || [targetDisqRecord.uid, targetDisqRecord.leaderUid].filter(Boolean),
        igns: targetDisqRecord.igns || [targetDisqRecord.ign, targetDisqRecord.leaderIgn].filter(Boolean),
        teamName: targetDisqRecord.teamName
      };

      window.dispatchEvent(new CustomEvent('haarshxo_tournament_reinstated', { detail: reinEventData }));
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({ type: 'tournament_reinstated', data: reinEventData });
      }

      // Add high-priority in-app inbox notification
      try {
        const inbox = JSON.parse(localStorage.getItem('haarshxo_notification_inbox') || '[]');
        const notifItem = {
          id: `notif_rein_${Date.now()}`,
          message: `🎉 Unbanned & Reinstated: ${targetTourneyTitle}`,
          subtitle: `You were unbanned by Admin. Your new assigned room slot is Slot #${newlyAssignedSlot}.`,
          type: 'success',
          time: 'Just now',
          read: false
        };
        const updatedInbox = [notifItem, ...inbox.filter(n => n.id !== notifItem.id).slice(0, 49)];
        localStorage.setItem('haarshxo_notification_inbox', JSON.stringify(updatedInbox));
        window.dispatchEvent(new CustomEvent('haarshxo_inbox_updated', { detail: updatedInbox }));
        if (globalBroadcastChannel) {
          globalBroadcastChannel.postMessage({ type: 'inbox_updated', data: updatedInbox });
        }
      } catch (e) {}

      // Remove from disqualified list and restore to registered tournaments in localStorage
      try {
        const disqList = JSON.parse(localStorage.getItem('harshxo_disqualified_tournaments') || '[]');
        const updatedDisq = disqList.filter(id => String(id) !== idStr);
        localStorage.setItem('harshxo_disqualified_tournaments', JSON.stringify(updatedDisq));

        const regList = JSON.parse(localStorage.getItem('harshxo_registeredTournaments') || '[]');
        const updatedReg = Array.from(new Set([...regList, idStr]));
        localStorage.setItem('harshxo_registeredTournaments', JSON.stringify(updatedReg));
      } catch (e) {}
    }

    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_tournaments');
      if (stored) syncToBackend({ tournaments: JSON.parse(stored) });
    }, 0);

    const targetName = targetDisqRecord?.teamName || disqId;
    addAuditLog('PARTICIPANT_REINSTATED', 'TOURNAMENTS', `Reinstated "${targetName}" in tournament ${targetTourneyTitle} (${tourneyId}). New slot assigned: Slot #${newlyAssignedSlot}`);

    return { slotNumber: newlyAssignedSlot, participant: restoredParticipant };
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
  const stripBase64Pass = (passItem) => {
    if (!passItem) return passItem;
    if (passItem.ticketImage && passItem.ticketImage.startsWith('data:image/')) {
      return { ...passItem, ticketImage: '/tokens/cs-ticket.png' };
    }
    return passItem;
  };

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
    // Build full updated array synchronously so we can close over it for backend sync
    const fullUpdated = [...passes, newPass];
    setPasses(() => {
      try {
        const safeForStorage = fullUpdated.map(stripBase64Pass);
        localStorage.setItem('haarshxo_admin_passes', JSON.stringify(safeForStorage));
        broadcastChange('passes', fullUpdated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: fullUpdated } }));
      } catch {}
      return fullUpdated;
    });
    // Sync FULL array to backend — never just the single new item
    setTimeout(() => {
      syncToBackend({ passes: fullUpdated.map(stripBase64Pass) });
    }, 0);
    addAuditLog('PASS_CREATED', 'PASSES', `Created new pass "${newPass.title}" (₹${newPass.inrPrice}, +${newPass.grantCs} CS, +${newPass.grantBr} BR, +${newPass.grantCoins} XO Coins)`);
    return newPass;
  };

  const updatePass = (id, updatedFields) => {
    lastLocalActionTime.current = Date.now();
    // Build full updated array synchronously so we can close over it for backend sync
    const fullUpdated = passes.map(p =>
      p.id !== id ? p : { ...p, ...updatedFields }
    );
    setPasses(() => {
      try {
        const safeForStorage = fullUpdated.map(stripBase64Pass);
        localStorage.setItem('haarshxo_admin_passes', JSON.stringify(safeForStorage));
        broadcastChange('passes', fullUpdated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'passes', data: fullUpdated } }));
      } catch {}
      return fullUpdated;
    });
    // Sync FULL array to backend — never just the single updated item
    setTimeout(() => {
      syncToBackend({ passes: fullUpdated.map(stripBase64Pass) });
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
      // Sync inside setState callback — no setTimeout race condition
      syncToBackend({ redeemCodes: updated });
      return updated;
    });
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
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch('http://localhost:5001/api/users').catch(() => null);
        }
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
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch(`http://localhost:5001/api/users/${encodeURIComponent(uid)}/update-balance`, opts).catch(() => null);
        }
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
        if (u.uid !== uid && u.id !== uid && u.supabaseId !== uid && u.email !== uid) return u;
        try {
          const savedUser = localStorage.getItem('harshxo_user');
          const activeUser = savedUser ? JSON.parse(savedUser) : null;
          if (activeUser && (activeUser.uid === uid || activeUser.id === uid || activeUser.supabaseId === uid || activeUser.email === uid)) {
            localStorage.setItem('harshxo_user_status', newStatus);
            localStorage.setItem('harshxo_user_status_reason', reason || '');
            window.dispatchEvent(new CustomEvent('haarshxo_player_sync', {
              detail: { uid, status: newStatus, statusReason: reason }
            }));
          }
        } catch (e) {}
        return { ...u, status: newStatus, notes: reason || u.notes, statusReason: reason || u.statusReason };
      });
      try {
        localStorage.setItem('haarshxo_admin_users', JSON.stringify(updated));
        broadcastChange('users', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'users', data: updated } }));
      } catch {}
      return updated;
    });

    // Broadcast ban / unban event across tabs and to GameContext
    try {
      if (globalBroadcastChannel) {
        globalBroadcastChannel.postMessage({
          type: newStatus === 'active' ? 'user_unbanned' : 'user_banned',
          data: { uid, newStatus, reason }
        });
      }
      window.dispatchEvent(new CustomEvent(newStatus === 'active' ? 'haarshxo_user_unbanned' : 'haarshxo_user_banned', {
        detail: { uid, newStatus, reason }
      }));
    } catch (e) {}

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
        if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
          res = await fetch(`http://localhost:5001/api/users/${encodeURIComponent(uid)}/update-status`, opts).catch(() => null);
        }
      }
      if (res && res.ok) {
        const json = await res.json();
        if (json.success && json.user) {
          setUsersList(prev => prev.map(u => (u.uid === uid || u.id === uid || u.supabaseId === uid || u.email === uid) ? { ...u, ...json.user } : u));
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

    // FIXED: Compute `updated` outside setAnnouncements so we can directly
    // pass it to syncToBackend — setState is async so we can't reliably
    // read localStorage immediately after calling setAnnouncements.
    setAnnouncements(prev => {
      const updated = prev.filter(a => String(a.id) !== idStr);
      try {
        localStorage.setItem('haarshxo_admin_announcements', JSON.stringify(updated));
        broadcastChange('announcements', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'announcements', data: updated } }));
      } catch {}
      // Sync to backend inside the callback so `updated` is definitely the filtered array
      syncToBackend({ announcements: updated });
      return updated;
    });
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
      status: data.status || 'open', // open | ongoing | closed | completed
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
      const updated = prev.map(g => String(g.id) === String(id) ? { ...g, ...data } : g);
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

  const toggleGiveawayStatus = (id, newStatus) => {
    lastLocalActionTime.current = Date.now();
    setGiveawaysList(prev => {
      const updated = prev.map(g => {
        if (String(g.id) !== String(id)) return g;
        return { ...g, status: newStatus };
      });
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch (err) {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_giveaways');
      if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
    }, 0);
    addAuditLog('GIVEAWAY_STATUS_CHANGE', 'GIVEAWAYS', `Changed giveaway status of ${id} to "${newStatus.toUpperCase()}"`);
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
    let hadParticipants = true;

    setGiveawaysList(prev => {
      const target = prev.find(g => String(g.id) === String(id));
      if (!target || !target.participantsList || target.participantsList.length === 0) {
        hadParticipants = false;
        return prev;
      }

      const pool = target.participantsList;
      const randomEntry = pool[Math.floor(Math.random() * pool.length)];
      pickedWinner = {
        ign: randomEntry.ign,
        uid: randomEntry.uid,
        drawnAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        prize: target.prize
      };

      const updated = prev.map(g => {
        if (String(g.id) !== String(id)) return g;
        return {
          ...g,
          winner: pickedWinner,
          status: 'completed'
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });

    if (!hadParticipants) {
      return { error: 'NO_PARTICIPANTS' };
    }

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
    let wasAdded = false;
    let blockReason = '';

    const cleanUid = String(uid || '').trim();
    const cleanIgn = String(ign || '').trim();

    if (!cleanUid || !cleanIgn) {
      return { success: false, reason: 'Valid user account required to enter giveaway.' };
    }
    if (cleanUid === '849204812' || cleanIgn === 'HaarshFan_99') {
      return { success: false, reason: 'Please login with your own real Free Fire account.' };
    }

    setGiveawaysList(prev => {
      const target = prev.find(g => String(g.id) === String(giveawayId));
      if (!target) return prev;

      const currentStatus = target.status || (target.winner ? 'completed' : 'open');
      if (currentStatus === 'completed' || target.winner) {
        blockReason = 'Giveaway concluded! Winner already announced.';
        return prev;
      }
      if (currentStatus === 'closed') {
        blockReason = 'Registrations are closed for this giveaway.';
        return prev;
      }
      if (currentStatus === 'ongoing' || currentStatus === 'live') {
        blockReason = 'Giveaway is currently live on stream! Entries are locked.';
        return prev;
      }

      const alreadyJoined = (target.participantsList || []).some(p => String(p.uid) === cleanUid);
      if (alreadyJoined) return prev;

      const newEntry = {
        id: `gp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        uid: cleanUid,
        ign: cleanIgn,
        time: new Date().toISOString().split('T')[0]
      };
      wasAdded = true;
      const updated = prev.map(g => {
        if (String(g.id) !== String(giveawayId)) return g;
        const updatedList = [newEntry, ...(g.participantsList || [])];
        return {
          ...g,
          participantsList: updatedList,
          participants: updatedList.length
        };
      });
      try {
        localStorage.setItem('haarshxo_admin_giveaways', JSON.stringify(updated));
        broadcastChange('giveaways', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'giveaways', data: updated } }));
      } catch {}
      return updated;
    });

    if (wasAdded) {
      setTimeout(() => {
        const stored = localStorage.getItem('haarshxo_admin_giveaways');
        if (stored) syncToBackend({ giveawaysList: JSON.parse(stored) });
      }, 50);
      addAuditLog('GIVEAWAY_ENTRY', 'GIVEAWAYS', `Player ${cleanIgn} (UID: ${cleanUid}) entered giveaway ID: ${giveawayId}`);
      return { success: true };
    }
    return { success: false, reason: blockReason };
  };

  // ─── Store Rewards CRUD ───────────────────────────────────────────────────
  const createReward = (data) => {
    lastLocalActionTime.current = Date.now();
    // Parse instantCodes if provided (array of {code, used} objects)
    const parsedInstantCodes = Array.isArray(data.instantCodes) ? data.instantCodes : [];
    const fType = data.fulfillmentType || 'manual';
    // Stock stays manual — admin sets it. Instant codes running out = auto out-of-stock
    // regardless of stock value (handled in isOutOfStock helper on frontend)
    const stockVal = Number(data.stock) || 0;
    const newReward = {
      id: Date.now(),
      storeType: data.storeType || 'main',
      title: data.title || 'New Reward Item',
      cost: Number(data.cost) || 1000,
      type: data.type || 'diamonds',
      description: data.description || 'Instant delivery to your Free Fire account via UID.',
      image: data.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
      tag: data.tag || 'NEW',
      fulfillmentType: fType,
      instantCodes: parsedInstantCodes,
      stock: stockVal,
      active: true
    };
    setStoreRewards(prev => {
      const updated = [newReward, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'storeRewards', data: updated } }));
      } catch {}
      syncToBackend({ storeRewards: updated });
      return updated;
    });
    addAuditLog('REWARD_CREATED', 'STORE', `Created store reward "${newReward.title}" (${newReward.cost} XO Coins, Store: ${newReward.storeType}, Fulfillment: ${fType})`);
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

    // ─── STEP 1: Pre-select instant delivery code synchronously ───────────────
    // Must be done BEFORE setState because we need the code value immediately.
    let deliveredCode = null;
    const isInstant = item.fulfillmentType === 'instant';

    if (isInstant) {
      const availableCodes = (item.instantCodes || []).filter(c => !c.used);
      if (availableCodes.length === 0) {
        // No codes left — block the redemption
        return { success: false, error: 'OUT_OF_CODES', message: 'No redemption codes available right now. Please contact admin.' };
      }
      const randomIdx = Math.floor(Math.random() * availableCodes.length);
      deliveredCode = availableCodes[randomIdx].code;
    }

    // ─── STEP 2: Decrement stock + mark code as used in storeRewards ──────────
    setStoreRewards(prev => {
      const updated = prev.map(r => {
        if (String(r.id) !== String(item.id)) return r;
        // FIXED: was `(r.stock || 10) - 1` which defaults to 10 when stock=0
        const newStock = Math.max(0, (Number(r.stock) || 0) - 1);
        let updatedInstantCodes = r.instantCodes || [];
        if (deliveredCode) {
          updatedInstantCodes = updatedInstantCodes.map(c =>
            c.code === deliveredCode ? { ...c, used: true } : c
          );
        }
        return { ...r, stock: newStock, instantCodes: updatedInstantCodes };
      });
      try {
        localStorage.setItem('haarshxo_admin_store', JSON.stringify(updated));
        broadcastChange('store', updated);
      } catch {}
      // Sync store (with updated stock + used codes) directly — no setTimeout race
      syncToBackend({ storeRewards: updated });
      return updated;
    });

    // ─── STEP 3: Record the redemption entry ──────────────────────────────────
    const newRedemption = {
      id: `red_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      rewardId: item.id,
      rewardTitle: item.title,
      rewardType: item.type || 'reward',
      cost: item.cost,
      userUid: user?.uid || '',
      userIgn: user?.inGameName || 'Player',
      userEmail: user?.email || '',
      fulfillmentType: item.fulfillmentType || 'manual',
      // Instant = auto-delivered; manual = admin must fulfill
      status: deliveredCode ? 'delivered' : 'pending',
      deliveryDetails: deliveredCode || '',
      createdAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      timestamp: Date.now()
    };

    setRedemptions(prev => {
      const updated = [newRedemption, ...prev];
      try {
        localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(updated));
        broadcastChange('redemptions', updated);
      } catch {}
      // Single source of truth — syncToBackend replaces entire array on server.
      // No separate /api/redemptions POST — that caused duplicate entries because
      // the endpoint APPENDS while syncToBackend REPLACES, creating 2 records.
      syncToBackend({ redemptions: updated });
      return updated;
    });

    // Also save to user's personal redemption history in localStorage (keyed by UID)
    // This lets the user view their history + codes without hitting the admin store
    try {
      const uid = user?.uid || 'guest';
      const userHistoryKey = `haarshxo_user_redemptions_${uid}`;
      const existing = JSON.parse(localStorage.getItem(userHistoryKey) || '[]');
      const userEntry = {
        id: newRedemption.id,
        rewardTitle: item.title,
        rewardType: item.type || 'reward',
        cost: item.cost,
        fulfillmentType: item.fulfillmentType || 'manual',
        status: deliveredCode ? 'delivered' : 'pending',
        code: deliveredCode || null, // stored for user to view later
        image: item.image || '',
        redeemedAt: newRedemption.createdAt,
      };
      localStorage.setItem(userHistoryKey, JSON.stringify([userEntry, ...existing.slice(0, 49)]));
    } catch {}

    addAuditLog('STORE_REDEMPTION', 'STORE',
      `Player ${user?.inGameName || 'Player'} (UID: ${user?.uid || 'N/A'}) redeemed "${item.title}" for ${item.cost} XO Coins${
        deliveredCode ? ` — Code delivered: ${deliveredCode}` : ' — Awaiting manual fulfillment'
      }`
    );

    return { success: true, deliveredCode, fulfillmentType: item.fulfillmentType || 'manual' };
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

  const deleteRedemption = (id) => {
    lastLocalActionTime.current = Date.now();
    const target = redemptions.find(r => r.id === id);
    setRedemptions(prev => {
      const updated = prev.filter(r => r.id !== id);
      try {
        localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(updated));
        broadcastChange('redemptions', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_redemptions');
      if (stored) syncToBackend({ redemptions: JSON.parse(stored) });
    }, 0);
    addAuditLog('REDEMPTION_DELETED', 'STORE', `Deleted redemption "${target?.rewardTitle || id}" by ${target?.userIgn || 'Player'}`);
  };

  const deleteRedemptions = (ids) => {
    lastLocalActionTime.current = Date.now();
    const idSet = new Set(ids.map(String));
    setRedemptions(prev => {
      const updated = prev.filter(r => !idSet.has(String(r.id)));
      try {
        localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify(updated));
        broadcastChange('redemptions', updated);
      } catch {}
      return updated;
    });
    setTimeout(() => {
      const stored = localStorage.getItem('haarshxo_admin_redemptions');
      if (stored) syncToBackend({ redemptions: JSON.parse(stored) });
    }, 0);
    addAuditLog('REDEMPTION_DELETED', 'STORE', `Bulk deleted ${ids.length} redemption record(s)`);
  };

  const clearAllRedemptions = () => {
    lastLocalActionTime.current = Date.now();
    const count = redemptions.length;
    setRedemptions([]);
    try {
      localStorage.setItem('haarshxo_admin_redemptions', JSON.stringify([]));
      broadcastChange('redemptions', []);
    } catch {}
    setTimeout(() => syncToBackend({ redemptions: [] }), 0);
    addAuditLog('REDEMPTIONS_CLEARED', 'STORE', `Cleared all ${count} redemption history records`);
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

  // ─── Missions ─────────────────────────────────────────────────────────────
  const createMission = (newMissionData) => {
    lastLocalActionTime.current = Date.now();
    const newMission = {
      id: newMissionData.id || `mission_${newMissionData.frequency || 'daily'}_${Date.now()}`,
      frequency: newMissionData.frequency || 'daily',
      category: newMissionData.category || (newMissionData.frequency === 'daily' ? 'Live Watch Missions' : newMissionData.frequency === 'weekly' ? 'Weekly Live Grinder' : 'Monthly Champions'),
      title: newMissionData.title || 'New Mission',
      description: newMissionData.description || '',
      target: Number(newMissionData.target) || 15,
      unit: newMissionData.unit || (newMissionData.frequency === 'daily' ? 'Minutes' : 'Hours'),
      displayTarget: newMissionData.displayTarget || `${newMissionData.target} ${newMissionData.frequency === 'daily' ? 'Minutes' : 'Hours'}`,
      type: newMissionData.type || 'live',
      reward: {
        coins: Number(newMissionData.reward?.coins) || 0,
        csTickets: Number(newMissionData.reward?.csTickets) || 0,
        brTickets: Number(newMissionData.reward?.brTickets) || 0,
      },
      active: newMissionData.active !== false,
      createdAt: new Date().toISOString(),
    };
    const fullUpdated = [...missions, newMission];
    setMissions(() => {
      try {
        localStorage.setItem('haarshxo_admin_missions', JSON.stringify(fullUpdated));
        broadcastChange('missions', fullUpdated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'missions', data: fullUpdated } }));
      } catch {}
      return fullUpdated;
    });
    setTimeout(() => syncToBackend({ missions: fullUpdated }), 0);
    addAuditLog('MISSION_CREATED', 'MISSIONS', `Created new ${newMission.frequency} mission "${newMission.title}"`);
    return newMission;
  };

  const updateMission = (missionId, updatedFields) => {
    lastLocalActionTime.current = Date.now();
    const fullUpdated = missions.map(m =>
      m.id !== missionId ? m : { ...m, ...updatedFields }
    );
    setMissions(() => {
      try {
        localStorage.setItem('haarshxo_admin_missions', JSON.stringify(fullUpdated));
        broadcastChange('missions', fullUpdated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'missions', data: fullUpdated } }));
      } catch {}
      return fullUpdated;
    });
    setTimeout(() => syncToBackend({ missions: fullUpdated }), 0);
    const m = missions.find(m => m.id === missionId);
    addAuditLog('MISSION_UPDATED', 'MISSIONS', `Updated mission "${m?.title || missionId}" (ID: ${missionId})`);
  };

  const deleteMission = (missionId) => {
    lastLocalActionTime.current = Date.now();
    const m = missions.find(item => item.id === missionId);
    const fullUpdated = missions.filter(item => item.id !== missionId);
    setMissions(() => {
      try {
        localStorage.setItem('haarshxo_admin_missions', JSON.stringify(fullUpdated));
        broadcastChange('missions', fullUpdated);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'missions', data: fullUpdated } }));
      } catch {}
      return fullUpdated;
    });
    setTimeout(() => syncToBackend({ missions: fullUpdated }), 0);
    addAuditLog('MISSION_DELETED', 'MISSIONS', `Deleted mission "${m?.title || missionId}" (ID: ${missionId})`);
  };

  const resetMissions = () => {
    lastLocalActionTime.current = Date.now();
    setMissions(() => {
      try {
        localStorage.setItem('haarshxo_admin_missions', JSON.stringify(DEFAULT_MISSIONS));
        broadcastChange('missions', DEFAULT_MISSIONS);
        window.dispatchEvent(new CustomEvent('haarshxo_admin_updated', { detail: { type: 'missions', data: DEFAULT_MISSIONS } }));
      } catch {}
      return DEFAULT_MISSIONS;
    });
    setTimeout(() => syncToBackend({ missions: DEFAULT_MISSIONS }), 0);
    addAuditLog('MISSIONS_RESET', 'MISSIONS', 'All missions reset to default configuration');
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
        reinstateTournamentParticipant,
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
        toggleGiveawayStatus,
        drawGiveawayWinner,
        addGiveawayParticipant,

        // Missions
        missions,
        createMission,
        updateMission,
        deleteMission,
        resetMissions,

        // Store Rewards
        storeRewards,
        createReward,
        updateReward,
        deleteReward,
        recordStoreRedemption,

        // XO Coins Reward Redemptions
        redemptions,
        updateRedemptionStatus,
        deleteRedemption,
        deleteRedemptions,
        clearAllRedemptions,

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
