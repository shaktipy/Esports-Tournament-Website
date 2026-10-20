// Monthly Rewards generator based on month and year

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

export const BASE_DAILY_REWARDS = [
  // Week 1 (Days 1 - 7)
  { day: 1,  coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 2,  coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 3,  coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 4,  coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 5,  coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '💰', type: 'coins' },
  { day: 6,  coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 7,  coins: 50, label: '50 XO Coins', shortLabel: '+50 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🏆', type: 'milestone' },

  // Week 2 (Days 8 - 14)
  { day: 8,  coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 9,  coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 10, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 11, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 12, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 13, coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '💰', type: 'coins' },
  { day: 14, csTickets: 1, label: '1 CS Ticket', shortLabel: '1 CS Ticket', tokenImage: '/tokens/cs-ticket.png', icon: '🎫', type: 'milestone' },

  // Week 3 (Days 15 - 21)
  { day: 15, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 16, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 17, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 18, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 19, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 20, coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '💰', type: 'coins' },
  { day: 21, coins: 50, label: '50 XO Coins', shortLabel: '+50 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🏆', type: 'milestone' },

  // Week 4 (Days 22 - 28)
  { day: 22, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 23, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 24, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 25, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 26, coins: 10, label: '10 XO Coins', shortLabel: '+10 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 27, coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '💰', type: 'coins' },
  { day: 28, brTickets: 1, label: '1 BR Ticket', shortLabel: '1 BR Ticket', tokenImage: '/tokens/br-ticket.png', icon: '🎟️', type: 'milestone' },

  // Month End (Days 29 - 31)
  { day: 29, coins: 15, label: '15 XO Coins', shortLabel: '+15 Coins', tokenImage: '/tokens/xo-coin.png', icon: '🪙', type: 'coins' },
  { day: 30, coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '💰', type: 'coins' },
  { day: 31, coins: 20, label: '20 XO Coins', shortLabel: '+20 Coins', tokenImage: '/tokens/xo-coin.png', icon: '👑', type: 'grand' },
];

export const getMonthlyRewards = (year, monthIndex) => {
  const totalDays = getDaysInMonth(year, monthIndex);
  return BASE_DAILY_REWARDS.slice(0, totalDays);
};
