import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Play, 
  TrendingUp, 
  Filter, 
  Trophy, 
  Swords, 
  Radio, 
  Clock, 
  ExternalLink,
  Youtube,
  Ticket,
  RefreshCw,
  Settings,
  Key,
  X,
  Coins,
  Flame,
  Gift,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Lock,
  Star,
  CalendarCheck
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { 
  DEFAULT_FEED, 
  getStoredCredentials, 
  saveCredentials, 
  fetchRealtimeChannelVideos 
} from '../services/youtube';
import DailyLogin from '../components/DailyLogin';
import RewardWheel from '../components/RewardWheel';
import { MONTH_NAMES, getDaysInMonth } from '../utils/monthlyRewards';
import { Sparkles } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import './Home.css';

const Home = () => {
  const { tournaments } = useAdmin();
  const [filter, setFilter] = useState('all');
  const [videos, setVideos] = useState(DEFAULT_FEED);
  const [activeVideoModal, setActiveVideoModal] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  
  // YouTube API configuration modal
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [apiCredentials, setApiCredentials] = useState(getStoredCredentials());

  // Screen pop-up modals for Daily Login & Fortune Wheel
  const [showDailyLoginModal, setShowDailyLoginModal] = useState(false);
  const [showRewardWheelModal, setShowRewardWheelModal] = useState(false);

  const ytPlayerInstance = useRef(null);
  const navigate = useNavigate();

  const { 
    addWatchTime, 
    completedMissionsCount,
    showNotification,
    loginStreak,
    wheelSpinData,
    coins,
  } = useGame();

  const now = new Date();
  const currentMonthName = MONTH_NAMES[now.getMonth()];
  const currentYear = now.getFullYear();
  const todayDateNum = now.getDate();
  const totalDaysInMonth = getDaysInMonth(currentYear, now.getMonth());
  const today = now.toDateString();
  const dailyAvailable = !loginStreak.claimedToday || loginStreak.lastLoginDate !== today;
  const wheelAvailable = wheelSpinData.lastSpinDate !== today;
  const claimedThisMonthCount = (loginStreak.claimedDaysThisMonth || []).length;

  // Load channel videos on mount (real-time sync if credentials exist)
  useEffect(() => {
    const creds = getStoredCredentials();
    if (creds.apiKey && creds.channelId) {
      handleSyncChannel(creds.apiKey, creds.channelId, false);
    }
  }, []);

  // Sync real-time YouTube Channel Feed
  const handleSyncChannel = async (key, chId, notify = true) => {
    setIsSyncing(true);
    const result = await fetchRealtimeChannelVideos(key, chId);
    setIsSyncing(false);
    
    if (result.videos && result.videos.length > 0) {
      setVideos(result.videos);
    }

    setSyncStatus({
      connected: result.connected,
      message: result.message
    });

    if (notify) {
      showNotification(result.connected ? '✅ Synced real-time YouTube channel feed!' : result.message);
    }
  };

  // Initialize YouTube IFrame Player API when a video modal is opened
  useEffect(() => {
    if (!activeVideoModal) {
      if (ytPlayerInstance.current && ytPlayerInstance.current.destroy) {
        try {
          ytPlayerInstance.current.destroy();
        } catch (e) {}
      }
      setIsPlaying(false);
      setSessionSeconds(0);
      return;
    }

    // Load YouTube API script if not present
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    let isMounted = true;

    const setupPlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      const playerContainer = document.getElementById('haarshxo-yt-modal-player');
      if (!playerContainer) return;

      try {
        ytPlayerInstance.current = new window.YT.Player('haarshxo-yt-modal-player', {
          videoId: activeVideoModal.videoId,
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            rel: 0,
            modestbranding: 1
          },
          events: {
            onStateChange: (event) => {
              if (!isMounted) return;
              // 1 = PLAYING, 2 = PAUSED, 0 = ENDED, 3 = BUFFERING
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              } else {
                setIsPlaying(false);
              }
            },
            onError: (e) => {
              console.warn('YouTube Player error:', e);
            }
          }
        });
      } catch (err) {
        console.warn('Failed to initialize YouTube IFrame Player:', err);
      }
    };

    const timer = setTimeout(() => {
      if (window.YT && window.YT.Player) {
        setupPlayer();
      } else {
        window.onYouTubeIframeAPIReady = () => {
          setupPlayer();
        };
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      if (ytPlayerInstance.current && ytPlayerInstance.current.destroy) {
        try {
          ytPlayerInstance.current.destroy();
        } catch (e) {}
      }
    };
  }, [activeVideoModal]);

  // Real-time Watch Time Tracking: Only counts seconds while video is ACTUALLY PLAYING in modal
  useEffect(() => {
    let interval = null;
    if (isPlaying && activeVideoModal) {
      interval = setInterval(() => {
        setSessionSeconds(prev => {
          const next = prev + 1;
          // Every 60 real seconds, award 1 minute of watch time & update missions
          if (next % 60 === 0) {
            addWatchTime(activeVideoModal.type === 'live' ? 'live' : 'video', 1);
            showNotification(`🎁 +1 Minute Watch Time recorded! Missions updated.`);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, activeVideoModal, addWatchTime, showNotification]);

  const filteredVideos = videos.filter(v => filter === 'all' || v.type === filter);

  const formatSessionTime = (totalSec) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  const handleSaveApiSettings = (e) => {
    e.preventDefault();
    saveCredentials(apiCredentials.apiKey, apiCredentials.channelId);
    setShowConfigModal(false);
    handleSyncChannel(apiCredentials.apiKey, apiCredentials.channelId, true);
  };

  const handleCloseVideoModal = () => {
    if (ytPlayerInstance.current && ytPlayerInstance.current.destroy) {
      try {
        ytPlayerInstance.current.destroy();
      } catch (e) {}
    }
    setActiveVideoModal(null);
    setIsPlaying(false);
    setSessionSeconds(0);
  };

  return (
    <div className="home-page fade-in">
      {/* 1. Hero Section (Compact & Space-Efficient) */}
      <section className="hero-section glass-panel">
        <div className="hero-content">
          <div className="hero-left">
            <img 
              src="/tokens/harsh-avatar.png" 
              alt="HAARSH XO Official Logo" 
              className="hero-mascot-logo" 
            />
            <div className="hero-brand-info">
              <div className="hero-title-row">
                <h1 className="hero-title">
                  <span className="text-gradient">HAARSH XO</span>
                </h1>
                <div className="hero-schedule-bar">
                  <span className="pulsing-live-pill"></span>
                  <span className="schedule-text">LIVE DAILY 9:00 PM – 12:00 AM</span>
                  <span className="schedule-badge-ist">IST</span>
                </div>
              </div>

              <p className="hero-subtitle">
                Watch Streams & Videos. Complete Daily & Weekly Missions. Win Diamonds, XO Coins & Tournament Tickets.
              </p>
            </div>
          </div>

          <div className="hero-right">
            <div className="hero-stats">
              <div className="stat-card">
                <TrendingUp className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">1.54K+</div>
                  <div className="stat-label">Subscribers</div>
                </div>
              </div>
              <div className="stat-card">
                <Play className="stat-icon" />
                <div className="stat-info">
                  <div className="stat-value">214.3K+</div>
                  <div className="stat-label">Total Views</div>
                </div>
              </div>
              <div className="stat-card">
                <Radio className="stat-icon live-color" />
                <div className="stat-info">
                  <div className="stat-value">9 PM - 12 AM</div>
                  <div className="stat-label">Daily Stream</div>
                </div>
              </div>
            </div>

            <div className="hero-cta-group">
              <a 
                href="https://www.youtube.com/@HaarshXO" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn-youtube-sub"
              >
                <Youtube size={17} />
                <span>SUBSCRIBE ON YOUTUBE</span>
                <ExternalLink size={13} />
              </a>
              <button className="btn-secondary hero-missions-btn" onClick={() => navigate('/tasks')}>
                VIEW MISSIONS ({completedMissionsCount}/5)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Official Tournament Arena Banner */}
      <section className="esports-banner-section">
        <div className="esports-card glass-panel" onClick={() => navigate('/esports')}>
          <div className="esports-card-bg"></div>
          <div className="esports-card-content">
            <div className="esports-icon-container">
              <Trophy className="esports-icon trophy-icon" size={48} />
              <Swords className="esports-icon swords-icon" size={32} />
            </div>
            <div className="esports-info">
              <div className="esports-badge-row">
                <span className="esports-tag">OFFICIAL TOURNAMENT ARENA</span>
                {tournaments?.filter(t => t.status === 'open').length > 0 && (
                  <span className="esports-tag" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
                    🔴 {tournaments.filter(t => t.status === 'open').length} CUPS LIVE
                  </span>
                )}
              </div>
              <h2 className="esports-title">HAARSH XO ESPORTS ARENA</h2>
              <p className="esports-desc">
                {tournaments?.filter(t => t.status === 'open').length > 0 
                  ? `🔥 ${tournaments.filter(t => t.status === 'open').length} Active Tournaments Open • Top Prize Pool: ${tournaments.find(t => t.status === 'open')?.prize || '₹50,000'}`
                  : 'Register for Clash Squad & Battle Royale Tournaments with CS & BR Tickets'}
              </p>
            </div>
            <button className="esports-btn">ENTER ARENA</button>
          </div>
        </div>
      </section>

      {/* 3. REWARD CARDS — Click to open full-screen pop-up modals */}
      <section className="reward-cards-section">
        {/* ── Daily Login Streak Card ── */}
        <div 
          className="reward-launch-card glass-panel daily-launch-card"
          onClick={() => setShowDailyLoginModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowDailyLoginModal(true); }}
        >
          <div className="rlc-content">
            <div className={`rlc-icon-wrap daily-icon-wrap ${dailyAvailable ? 'available-glow' : ''}`}>
              <Flame size={28} />
            </div>
            <div className="rlc-meta">
              <h3 className="rlc-title">Daily Login Rewards</h3>
              <p className="rlc-sub">
                Day {todayDateNum} of {totalDaysInMonth} • {loginStreak.streak || 0} Day Streak • {claimedThisMonthCount}/{totalDaysInMonth} Claimed
              </p>
            </div>
          </div>
          <div className="rlc-action">
            <button className="rlc-btn daily" onClick={(e) => { e.stopPropagation(); setShowDailyLoginModal(true); }}>
              <span>OPEN CALENDAR</span>
              <Sparkles size={16} />
            </button>
            <span className="rlc-tag daily-tag rlc-tag-action">{dailyAvailable ? '🔴 CLAIM NOW' : '✅ CLAIMED TODAY'}</span>
          </div>
        </div>

        {/* ── Fortune Wheel Card ── */}
        <div 
          className="reward-launch-card glass-panel wheel-launch-card"
          onClick={() => setShowRewardWheelModal(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter') setShowRewardWheelModal(true); }}
        >
          <div className="rlc-content">
            <div className={`rlc-icon-wrap wheel-icon-wrap ${wheelAvailable ? 'wheel-available-glow' : ''}`}>
              <Gift size={28} />
            </div>
            <div className="rlc-meta">
              <h3 className="rlc-title">Fortune Reward Wheel</h3>
              <p className="rlc-sub">
                Win up to 500 Coins, CS/BR Tournament Tickets & Grand Jackpots! ({wheelSpinData.totalSpins || 0} spins)
              </p>
            </div>
          </div>
          <div className="rlc-action">
            <button className="rlc-btn wheel" onClick={(e) => { e.stopPropagation(); setShowRewardWheelModal(true); }}>
              <span>SPIN WHEEL</span>
              <Sparkles size={16} />
            </button>
            <span className="rlc-tag wheel-tag rlc-tag-action">{wheelAvailable ? '🎡 SPIN AVAILABLE' : '✅ SPUN TODAY'}</span>
          </div>
        </div>
      </section>

      {/* 3. Official HAARSH XO Channel Content (Directly below Arena!) */}
      <section className="channel-hub-section glass-panel">
        <div className="hub-top-header">
          <div>
            <div className="hub-eyebrow">
              <Youtube size={18} className="yt-red-icon" />
              <span>OFFICIAL YOUTUBE BROADCAST & CONTENT</span>
            </div>
            <h2 className="hub-main-title">HAARSH XO Channel Content</h2>
            <p className="hub-subtitle">
              Watch live streams and videos to earn XO Coins, accumulate watch time, and complete missions.
            </p>
          </div>
        </div>

        {/* Sync Status Banner if connected or cached */}
        {syncStatus && (
          <div className={`sync-status-alert ${syncStatus.connected ? 'connected' : 'cached'}`}>
            <span className="sync-dot"></span>
            <span>{syncStatus.message}</span>
          </div>
        )}

        {/* Video Filter Bar */}
        <div className="feed-header-bar">
          <div className="feed-header-left">
            <h3 className="section-title">All Channel Videos & Streams</h3>
            <span className="video-count-badge">{filteredVideos.length} items</span>
          </div>

          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All</button>
            <button className={`filter-btn ${filter === 'live' ? 'active' : ''}`} onClick={() => setFilter('live')}>Live Streams</button>
            <button className={`filter-btn ${filter === 'video' ? 'active' : ''}`} onClick={() => setFilter('video')}>Videos</button>
          </div>
        </div>

        {/* Channel Video Grid */}
        <div className="video-grid">
          {filteredVideos.map((video) => (
            <div 
              key={video.id} 
              className="video-card glass-panel group"
              onClick={() => {
                setActiveVideoModal(video);
                setSessionSeconds(0);
                setIsPlaying(false);
              }}
            >
              <div className="video-thumb-container">
                <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                <div className={`video-duration ${video.type === 'live' ? 'live-badge' : ''}`}>
                  {video.type === 'live' ? <span className="pulsing-dot"></span> : null}
                  {video.duration}
                </div>
                
                <div className="video-overlay">
                  <Play className="play-icon" size={44} />
                  <span className="watch-prompt">
                    Click to Play & Earn
                  </span>
                </div>
              </div>

              <div className="video-info">
                <h3 className="video-title">{video.title}</h3>
                <p className="video-desc-small">{video.description}</p>
                <div className="video-meta">
                  <span className="video-type">{video.type.toUpperCase()}</span>
                  <div className="video-reward-badge">
                    <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon" />
                    <span>Earns Watch Time</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Video Player Modal with Live Watch-Time Tracking */}
      {activeVideoModal && (
        <div className="modal-overlay fade-in" onClick={handleCloseVideoModal}>
          <div className="video-player-modal glass-panel" onClick={e => e.stopPropagation()}>
            <div className="player-modal-top-bar">
              <div className="player-modal-title-group">
                <div className="live-status-indicator">
                  {activeVideoModal.type === 'live' ? (
                    <span className="badge-live-stream">🔴 LIVE STREAMING</span>
                  ) : (
                    <span className="badge-video-stream">📹 VIDEO PLAYER</span>
                  )}
                </div>
                <h3 className="player-modal-title">{activeVideoModal.title}</h3>
              </div>
              <button className="close-btn" onClick={handleCloseVideoModal}>
                <X size={22} />
              </button>
            </div>

            {/* Embedded YouTube Iframe Player */}
            <div className="modal-video-wrapper">
              <div id="haarshxo-yt-modal-player" className="youtube-iframe"></div>
            </div>

            {/* Live Watch Time Progress Bar inside Modal */}
            <div className="modal-watch-tracker-bar">
              <div className="modal-timer-group">
                <Clock className="tracker-clock-icon" size={20} />
                <div className="modal-timer-text">
                  <span className="modal-timer-label">SESSION WATCH TIME:</span>
                  <span className="modal-timer-counter">{formatSessionTime(sessionSeconds)}</span>
                </div>
                <span className={`tracker-status-tag ${isPlaying ? 'active' : 'paused'}`}>
                  {isPlaying ? '● Actively Tracking' : '⏸ Paused (Start video to track)'}
                </span>
              </div>

              <div className="modal-rate-note">
                <Flame size={14} color="#f97316" />
                <span>Earns XO Coins & Updates Missions every 1 min of play</span>
              </div>

              <button 
                className="btn-modal-missions"
                onClick={() => {
                  handleCloseVideoModal();
                  navigate('/tasks');
                }}
              >
                Missions ({completedMissionsCount}/5) →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube API Configuration Modal */}
      {showConfigModal && (
        <div className="modal-overlay fade-in" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content extra-modal glass-panel" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setShowConfigModal(false)}>
              <X size={20} />
            </button>

            <div className="modal-header-icon-box">
              <Youtube size={36} color="#ef4444" />
            </div>

            <h2 className="modal-title text-gradient">YOUTUBE CHANNEL INTEGRATION</h2>
            <p className="modal-subtitle">
              Connect the official HAARSH XO YouTube channel to automatically sync real-time live streams and video uploads.
            </p>

            <form onSubmit={handleSaveApiSettings} className="yt-config-form">
              <div className="config-field">
                <label className="config-label">
                  <Key size={16} />
                  <span>YouTube Data API v3 Key:</span>
                </label>
                <input 
                  type="text"
                  placeholder="AIzaSy..."
                  value={apiCredentials.apiKey}
                  onChange={(e) => setApiCredentials(prev => ({ ...prev, apiKey: e.target.value }))}
                  className="config-input"
                />
                <span className="config-hint">Created from Google Cloud Console (YouTube Data API v3).</span>
              </div>

              <div className="config-field">
                <label className="config-label">
                  <Youtube size={16} />
                  <span>YouTube Channel ID:</span>
                </label>
                <input 
                  type="text"
                  placeholder="UCxxxxxxxxxxxxxxxxxxxx"
                  value={apiCredentials.channelId}
                  onChange={(e) => setApiCredentials(prev => ({ ...prev, channelId: e.target.value }))}
                  className="config-input"
                />
                <span className="config-hint">Your YouTube Channel ID (starts with "UC...").</span>
              </div>

              <div className="config-actions">
                <button type="submit" className="btn-primary w-full">
                  SAVE & SYNC REAL-TIME CHANNEL
                </button>
                <button 
                  type="button" 
                  className="btn-secondary w-full"
                  onClick={() => {
                    saveCredentials('', '');
                    setApiCredentials({ apiKey: '', channelId: '' });
                    setVideos(DEFAULT_FEED);
                    setShowConfigModal(false);
                    showNotification('Reset to default HAARSH XO feed.');
                  }}
                >
                  Reset to Default Feed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Screen Pop-up Modals for Daily Login & Fortune Wheel */}
      {showDailyLoginModal && (
        <DailyLogin onClose={() => setShowDailyLoginModal(false)} />
      )}
      {showRewardWheelModal && (
        <RewardWheel onClose={() => setShowRewardWheelModal(false)} />
      )}
    </div>
  );
};

export default Home;
