import { useState, useMemo } from 'react';
import { useGame } from '../context/GameContext';
import { 
  Flame, 
  Gift, 
  CalendarCheck, 
  Star, 
  CheckCircle, 
  Lock, 
  X,
  Sparkles,
  Trophy,
  Award
} from 'lucide-react';
import { getDaysInMonth, getMonthlyRewards, MONTH_NAMES } from '../utils/monthlyRewards';
import './DailyLogin.css';

const DailyLogin = ({ onClose }) => {
  const { loginStreak, claimDailyLogin, showNotification } = useGame();
  const [isAnimating, setIsAnimating] = useState(false);
  const [localClaimedDays, setLocalClaimedDays] = useState([]);

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonthIndex = now.getMonth();
  const currentMonthName = MONTH_NAMES[currentMonthIndex];
  const todayDateNum = now.getDate();
  const totalDaysInMonth = getDaysInMonth(currentYear, currentMonthIndex);

  const monthlyRewards = useMemo(() => {
    return getMonthlyRewards(currentYear, currentMonthIndex);
  }, [currentYear, currentMonthIndex]);

  const todayStr = now.toDateString();
  const currentMonthKey = `${currentYear}-${currentMonthIndex + 1}`;
  const claimedDaysThisMonth = [
    ...((loginStreak.monthKey === currentMonthKey && loginStreak.claimedDaysThisMonth)
      ? loginStreak.claimedDaysThisMonth
      : []),
    ...localClaimedDays,
  ];
  // deduplicate
  const claimedDaysSet = [...new Set(claimedDaysThisMonth)];

  const alreadyClaimedToday = (loginStreak.claimedToday && loginStreak.lastLoginDate === todayStr)
    || localClaimedDays.includes(todayDateNum);

  // Determine state for a given day (1 to totalDaysInMonth)
  const getDayStatus = (day) => {
    if (claimedDaysSet.includes(day)) {
      return 'claimed';
    }
    if (day === todayDateNum) {
      return alreadyClaimedToday ? 'claimed' : 'available';
    }
    if (day < todayDateNum) {
      return 'missed';
    }
    return 'locked';
  };

  const handleClaim = () => {
    if (alreadyClaimedToday) {
      showNotification("Already Claimed Today!", 'waiting', "Come back tomorrow to continue your streak and claim Day " + (todayDateNum + 1) + "!");
      return;
    }

    if (isAnimating) return;
    setIsAnimating(true);

    setTimeout(() => {
      const result = claimDailyLogin(todayDateNum);
      if (result) {
        // Instantly reflect claimed day in local state so UI updates immediately
        setLocalClaimedDays(prev => [...new Set([...prev, todayDateNum])]);
        showNotification(`🎉 Day ${result.dayNumber} Claimed Successfully!`, 'special', `Added ${result.reward.label} to your account balance.`);
      }
      setIsAnimating(false);
      // DO NOT call onClose here — user should close manually
    }, 600);
  };

  const handleAlreadyClaimedClick = () => {
    showNotification("Today's Reward Already Claimed!", 'tomorrow', "Come back tomorrow to claim the next day's rewards!");
  };

  const todayReward = monthlyRewards[todayDateNum - 1] || monthlyRewards[0];

  return (
    <div className="daily-login-overlay" onClick={onClose}>

      <div className="daily-login-modal glass-panel" onClick={e => e.stopPropagation()}>
        {/* Top Close Button (Cross) */}
        <button className="dl-close-x-btn" onClick={onClose} aria-label="Close Daily Rewards modal">
          <X size={26} />
        </button>

        {/* Modal Header */}
        <div className="dl-header">
          <div className="dl-header-left">
            <div className="dl-fire-icon">
              <Flame size={32} color="#f97316" />
            </div>
            <div>
              <div className="dl-month-tag">
                <Sparkles size={14} />
                <span>{currentMonthName.toUpperCase()} {currentYear} • {totalDaysInMonth} DAYS CALENDAR</span>
              </div>
              <h2 className="dl-title text-gradient">DAILY LOGIN REWARDS</h2>
              <p className="dl-subtitle">
                Log in every day during {currentMonthName} to unlock massive Free Fire diamonds, tickets & XO Coins!
              </p>
            </div>
          </div>

          {/* Quick Streak Stats */}
          <div className="dl-streak-pills">
            <div className="dl-streak-pill streak">
              <Flame size={18} color="#f97316" />
              <div>
                <span className="dl-pill-val">{loginStreak.streak || 0}</span>
                <span className="dl-pill-lbl">Day Streak</span>
              </div>
            </div>
            <div className="dl-streak-pill total">
              <CalendarCheck size={18} color="#66fcf1" />
              <div>
                <span className="dl-pill-val">{claimedDaysThisMonth.length}/{totalDaysInMonth}</span>
                <span className="dl-pill-lbl">Claimed</span>
              </div>
            </div>
            <div className="dl-streak-pill today">
              <Star size={18} color="#fbbf24" />
              <div>
                <span className="dl-pill-val">Day {todayDateNum}</span>
                <span className="dl-pill-lbl">{alreadyClaimedToday ? 'Claimed' : 'Today'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Full Month Calendar Grid (1 to 28/30/31) */}
        <div className="dl-calendar-container custom-scrollbar">
          <div className="dl-calendar-month-grid">
            {monthlyRewards.map((reward) => {
              const status = getDayStatus(reward.day);
              const isToday = reward.day === todayDateNum;
              const isMilestone = reward.type === 'milestone' || reward.type === 'grand';

              return (
                <div 
                  key={reward.day} 
                  className={`dl-month-day-card ${status} ${reward.type} ${isToday ? 'is-today' : ''}`}
                  title={`Day ${reward.day}: ${reward.label}`}
                >
                  <div className="dl-day-header">
                    <span className="dl-day-number">DAY {reward.day}</span>
                    {isToday && <span className="dl-today-indicator">TODAY</span>}
                    {isMilestone && <Trophy size={13} className="dl-milestone-trophy" />}
                  </div>

                  <div className="dl-day-icon-wrap">
                    <span className="dl-day-emoji">{reward.icon}</span>
                  </div>

                  <div className="dl-day-reward-info">
                    <span className="dl-day-coins">+{reward.coins}</span>
                    {reward.csTickets && <span className="dl-ticket-pill cs">{reward.csTickets} CS</span>}
                    {reward.brTickets && <span className="dl-ticket-pill br">{reward.brTickets} BR</span>}
                    {reward.diamonds && <span className="dl-ticket-pill diamond">{reward.diamonds} 💎</span>}
                  </div>

                  <div className="dl-day-footer-status">
                    {status === 'claimed' && (
                      <span className="dl-status-badge claimed">
                        <CheckCircle size={14} /> Claimed
                      </span>
                    )}
                    {status === 'available' && (
                      <button className="dl-status-badge available" onClick={handleClaim}>
                        <Gift size={13} /> CLAIM!
                      </button>
                    )}
                    {status === 'locked' && (
                      <span className="dl-status-badge locked">
                        <Lock size={12} /> Locked
                      </span>
                    )}
                    {status === 'missed' && (
                      <span className="dl-status-badge missed">
                        Missed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="dl-modal-footer">
          <div className="dl-footer-left">
            <Award size={20} color="#fbbf24" />
            <span>
              {alreadyClaimedToday 
                ? `You've already claimed Day ${todayDateNum}! Return tomorrow for Day ${Math.min(todayDateNum + 1, totalDaysInMonth)}.` 
                : `Day ${todayDateNum} is ready: +${todayReward.coins} Coins ${todayReward.csTickets ? '+ CS Ticket' : ''} ${todayReward.brTickets ? '+ BR Ticket' : ''}!`}
            </span>
          </div>

          <div className="dl-footer-right">
            {alreadyClaimedToday ? (
              <button 
                className="dl-action-btn claimed" 
                onClick={handleAlreadyClaimedClick}
              >
                <CheckCircle size={18} />
                <span>CLAIMED TODAY • COME BACK TOMORROW</span>
              </button>
            ) : (
              <button 
                className={`dl-action-btn primary ${isAnimating ? 'animating' : ''}`}
                onClick={handleClaim}
                disabled={isAnimating}
              >
                <Gift size={20} />
                <span>{isAnimating ? 'CLAIMING REWARD...' : `CLAIM DAY ${todayDateNum} REWARD`}</span>
              </button>
            )}

            <button className="dl-action-btn secondary" onClick={onClose}>
              CLOSE
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogin;
