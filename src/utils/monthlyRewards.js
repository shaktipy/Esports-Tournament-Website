// Monthly Rewards generator based on month and year

export const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const getDaysInMonth = (year, monthIndex) => {
  return new Date(year, monthIndex + 1, 0).getDate();
};

export const getMonthlyRewards = (year, monthIndex) => {
  const totalDays = getDaysInMonth(year, monthIndex);
  const rewards = [];

  for (let day = 1; day <= totalDays; day++) {
    const isFinalDay = day === totalDays;
    const isWeekMilestone = day % 7 === 0;

    if (isFinalDay) {
      // Grand monthly finale reward
      rewards.push({
        day,
        coins: 1500,
        csTickets: 3,
        brTickets: 3,
        diamonds: 100,
        label: `1,500 XO Coins + 3 CS & 3 BR Tickets + 100 Diamonds!`,
        shortLabel: '1,500 Coins + 6 Tickets + 100 💎',
        icon: '👑',
        type: 'grand',
      });
    } else if (isWeekMilestone) {
      const weekNum = day / 7;
      const coinReward = 300 + weekNum * 100;
      const cs = weekNum >= 2 ? 2 : 1;
      const br = weekNum >= 3 ? 2 : 1;
      rewards.push({
        day,
        coins: coinReward,
        csTickets: cs,
        brTickets: br,
        label: `${coinReward} Coins + ${cs} CS & ${br} BR Tickets`,
        shortLabel: `${coinReward} Coins + ${cs + br} Tickets`,
        icon: '🏆',
        type: 'milestone',
      });
    } else if (day % 4 === 0) {
      const coinReward = 80 + day * 5;
      rewards.push({
        day,
        coins: coinReward,
        csTickets: 1,
        label: `${coinReward} Coins + 1 CS Ticket`,
        shortLabel: `${coinReward} Coins + 1 CS`,
        icon: '🎫',
        type: 'mixed-cs',
      });
    } else if (day % 5 === 0) {
      const coinReward = 90 + day * 5;
      rewards.push({
        day,
        coins: coinReward,
        brTickets: 1,
        label: `${coinReward} Coins + 1 BR Ticket`,
        shortLabel: `${coinReward} Coins + 1 BR`,
        icon: '🎟️',
        type: 'mixed-br',
      });
    } else {
      const coinReward = 50 + day * 5;
      rewards.push({
        day,
        coins: coinReward,
        label: `${coinReward} XO Coins`,
        shortLabel: `+${coinReward} Coins`,
        icon: day % 2 === 0 ? '🪙' : '💰',
        type: 'coins',
      });
    }
  }

  return rewards;
};
