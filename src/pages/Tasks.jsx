import { useState } from 'react';
import { 
  CheckCircle2, 
  CircleDashed, 
  Clock, 
  Gift, 
  Trophy, 
  Sparkles, 
  Flame, 
  Ticket, 
  Radio, 
  Video, 
  CheckCheck
} from 'lucide-react';
import { 
  useGame, 
  DAILY_MISSIONS, 
  WEEKLY_MISSIONS, 
  MONTHLY_MISSIONS, 
  EXTRA_REWARD_TARGET 
} from '../context/GameContext';
import './Tasks.css';

const Tasks = () => {
  const [activeTab, setActiveTab] = useState('daily');
  const [showExtraRewardModal, setShowExtraRewardModal] = useState(false);

  const { 
    coins, 
    csTickets, 
    brTickets, 
    watchStats, 
    claimedMissions, 
    claimMission, 
    completedMissionsCount,
    extraRewardClaimed,
    claimExtraReward 
  } = useGame();

  const getMissionsForTab = () => {
    switch (activeTab) {
      case 'weekly':
        return WEEKLY_MISSIONS;
      case 'monthly':
        return MONTHLY_MISSIONS;
      case 'daily':
      default:
        return DAILY_MISSIONS;
    }
  };

  const currentMissions = getMissionsForTab();

  const getProgressForMission = (mission) => {
    if (mission.type === 'live') {
      return watchStats.liveMinutes || 0;
    }
    if (mission.type === 'video') {
      return watchStats.videoMinutes || 0;
    }
    if (mission.type === 'totalLive') {
      return watchStats.totalLiveMinutes || 0;
    }
    return 0;
  };

  const handleClaimExtra = () => {
    claimExtraReward();
    setShowExtraRewardModal(true);
  };

  return (
    <div className="tasks-page fade-in">
      <div className="page-header">
        <h1 className="page-title">HAARSH XO MISSIONS</h1>
        <p className="page-subtitle">
          Watch YouTube streams & videos daily, weekly, and monthly to earn XO Coins, Diamond vouchers & tournament tickets!
        </p>
      </div>

      {/* 🎯 EXTRA REWARD CARD - Placed at the very top as per line 36 of missions.txt */}
      <div className={`extra-reward-card glass-panel ${completedMissionsCount >= EXTRA_REWARD_TARGET ? 'ready-glow' : ''}`}>
        <div className="extra-reward-content">
          <div className="extra-reward-header">
            <div className="gift-icon-badge">
              <Gift size={24} className="pulsing-gift" />
            </div>
            <div>
              <div className="extra-reward-tag">SPECIAL MILESTONE BONUS</div>
              <h2 className="extra-reward-title">🎯 Complete 5 Missions</h2>
              <p className="extra-reward-desc">
                Complete any 5 missions and get an Extra Reward! Extra reward includes <strong>500 XO Coins</strong>, <strong>Free Fire Diamond Vouchers</strong>, <strong>CS & BR Tournament Registration Tickets</strong>!
              </p>
            </div>
          </div>

          <div className="extra-reward-progress-block">
            <div className="reward-progress-info">
              <span className="reward-progress-label">Missions Completed:</span>
              <span className="reward-progress-count">
                <strong>{Math.min(completedMissionsCount, EXTRA_REWARD_TARGET)}</strong> / {EXTRA_REWARD_TARGET}
              </span>
            </div>
            <div className="progress-bar-bg extra-bar">
              <div 
                className="progress-bar-fill gold-fill"
                style={{ width: `${Math.min((completedMissionsCount / EXTRA_REWARD_TARGET) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="extra-reward-action">
          {extraRewardClaimed ? (
            <div className="claimed-badge-extra">
              <CheckCheck size={20} />
              <span>EXTRA REWARD CLAIMED</span>
            </div>
          ) : completedMissionsCount >= EXTRA_REWARD_TARGET ? (
            <button className="btn-claim-extra" onClick={handleClaimExtra}>
              <Sparkles size={18} />
              CLAIM EXTRA REWARD!
            </button>
          ) : (
            <button className="btn-locked-extra" disabled>
              LOCKED ({completedMissionsCount}/{EXTRA_REWARD_TARGET})
            </button>
          )}
        </div>
      </div>

      {/* 3 Main Tabs: Daily, Weekly, Monthly */}
      <div className="tasks-tabs-container">
        <div className="tasks-tabs glass-panel">
          <button 
            className={`tab-btn daily-tab ${activeTab === 'daily' ? 'active' : ''}`}
            onClick={() => setActiveTab('daily')}
          >
            <span className="tab-dot daily-dot"></span>
            🟣 Daily Missions
          </button>
          <button 
            className={`tab-btn weekly-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <span className="tab-dot weekly-dot"></span>
            🔵 Weekly Missions
          </button>
          <button 
            className={`tab-btn monthly-tab ${activeTab === 'monthly' ? 'active' : ''}`}
            onClick={() => setActiveTab('monthly')}
          >
            <span className="tab-dot monthly-dot"></span>
            🟡 Monthly Missions
          </button>
        </div>
      </div>

      {/* Unified Missions Section Panel */}
      <div className="missions-unified-panel glass-panel">
        {/* Missions Info Banner */}
        <div className="missions-status-banner">
          <div className="status-item">
            <Radio size={18} color="#ef4444" />
            <span>Today's Live Watch: <strong>{watchStats.liveMinutes || 0} mins</strong></span>
          </div>
          <div className="status-item">
            <Video size={18} color="#3b82f6" />
            <span>Today's Video Watch: <strong>{watchStats.videoMinutes || 0} mins</strong></span>
          </div>
          <div className="status-item">
            <Clock size={18} color="#fbbf24" />
            <span>Total Accumulated Live: <strong>{Math.floor((watchStats.totalLiveMinutes || 0) / 60)}h {(watchStats.totalLiveMinutes || 0) % 60}m</strong></span>
          </div>
        </div>

        {/* Elegant Glowing Separator Line */}
        <div className="missions-panel-divider"></div>

        {/* Missions List */}
        <div className="tasks-list">
          {currentMissions.map((task) => {
            const currentProgress = getProgressForMission(task);
            const isCompleted = currentProgress >= task.target;
            const isClaimed = claimedMissions[task.id];
            const progressPercent = Math.min((currentProgress / task.target) * 100, 100);

            return (
              <div 
                key={task.id} 
                className={`task-card ${isCompleted && !isClaimed ? 'completed-ready' : ''} ${isClaimed ? 'is-claimed' : ''}`}
              >
                <div className="task-icon-container">
                  {isClaimed ? (
                    <CheckCheck className="task-icon claimed" size={28} />
                  ) : isCompleted ? (
                    <CheckCircle2 className="task-icon ready" size={28} />
                  ) : (
                    <CircleDashed className="task-icon pending" size={28} />
                  )}
                </div>
                
                <div className="task-content">
                  <div className="task-meta-tag">
                    {task.category || (task.type === 'live' ? 'Live Stream' : 'Video')}
                  </div>
                  <h3 className="task-title">{task.title}</h3>
                  <p className="task-desc">{task.description}</p>
                  
                  <div className="task-progress-container">
                    <div className="progress-bar-bg">
                      <div 
                        className={`progress-bar-fill ${isCompleted ? 'success-fill' : 'active-fill'}`} 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {task.unit === 'Hours' ? (
                        `${(currentProgress / 60).toFixed(1)}h / ${(task.target / 60)}h`
                      ) : (
                        `${currentProgress}m / ${task.target}m`
                      )}
                    </span>
                  </div>
                </div>

                <div className="task-action">
                  <div className="task-rewards-group">
                    {task.reward.coins > 0 && (
                      <div className="task-reward-pill coin-pill">
                        <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon" />
                        <span>+{task.reward.coins}</span>
                      </div>
                    )}
                    {task.reward.csTickets > 0 && (
                      <div className="task-reward-pill cs-pill">
                        <Ticket size={14} />
                        <span>+{task.reward.csTickets} CS Ticket</span>
                      </div>
                    )}
                    {task.reward.brTickets > 0 && (
                      <div className="task-reward-pill br-pill">
                        <Ticket size={14} />
                        <span>+{task.reward.brTickets} BR Ticket</span>
                      </div>
                    )}
                    {task.reward.badge && (
                      <div className="task-reward-pill badge-pill">
                        <Trophy size={14} />
                        <span>{task.reward.badge}</span>
                      </div>
                    )}
                  </div>
                  
                  {isClaimed ? (
                    <button className="btn-task claimed" disabled>
                      CLAIMED ✅
                    </button>
                  ) : isCompleted ? (
                    <button 
                      className="btn-task claim-ready"
                      onClick={() => claimMission(task.id)}
                    >
                      CLAIM REWARD
                    </button>
                  ) : (
                    <button className="btn-task in-progress" disabled>
                      IN PROGRESS
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Extra Reward Modal Celebration */}
      {showExtraRewardModal && (
        <div className="modal-overlay" onClick={() => setShowExtraRewardModal(false)}>
          <div className="modal-content extra-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-confetti-header">
              <Sparkles size={48} color="#fbbf24" />
              <h2>🎉 CONGRATULATIONS!</h2>
              <p>You completed 5 Missions and claimed the Grand Extra Reward!</p>
            </div>

            <div className="modal-reward-prizes">
              <div className="prize-item">
                <img src="/tokens/xo-coin.png" alt="XO Coins" className="prize-coin-img" />
                <span className="prize-val">+500 XO Coins</span>
              </div>
              <div className="prize-item">
                <img src="/tokens/cs-ticket.png" alt="CS Ticket" className="prize-ticket-img" />
                <span className="prize-val">+1 CS Tournament Ticket</span>
              </div>
              <div className="prize-item">
                <img src="/tokens/br-ticket.png" alt="BR Ticket" className="prize-ticket-img" />
                <span className="prize-val">+1 BR Tournament Ticket</span>
              </div>
              <div className="prize-item redeem-code-box">
                <span className="code-label">Free Fire 100 Diamond Code:</span>
                <span className="code-val">XO-FF-7729-CLAIM</span>
              </div>
            </div>

            <button className="btn-primary w-full" onClick={() => setShowExtraRewardModal(false)}>
              AWESOME! LET'S GO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
