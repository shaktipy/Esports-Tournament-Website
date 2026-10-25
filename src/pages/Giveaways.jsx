import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Trophy, Users, Clock, CheckCircle, Share2, Youtube, Instagram,
  ChevronRight, CheckCircle2, Award, Sparkles, Gift, XCircle,
  Loader2, ExternalLink, Timer, Link2, Radio, Video, Play, X, Flame
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin } from '../context/AdminContext';
import './Giveaways.css';

// ─── Constants ─────────────────────────────────────────────────────────────────
const YT_CHANNEL_ID = import.meta.env.VITE_YOUTUBE_CHANNEL_ID || 'UCn46HBkf6RSZTV9tj3cqVBg';
const INSTAGRAM_URL = 'https://www.instagram.com/haarshxo?stkn=dnJza2k1cHVoMzFw';
const YT_SUBSCRIBE_URL = `https://www.youtube.com/@HaarshXO?sub_confirmation=1`;
const VERIFY_DELAY_SECS = 30;

function getYouTubeId(url, defaultId = 'jfKfPfyJRdk') {
  if (!url) return defaultId;
  const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/live\/)([^&?/\s]+)/);
  if (match) return match[1];
  if (!url.includes('/') && url.length >= 6) return url;
  return defaultId;
}

// ─── Default Requirements ──────────────────────────────────────────────────────
const DEFAULT_REQUIREMENTS = [
  {
    id: 'req1',
    text: 'Subscribe to HAARSH XO on YouTube',
    type: 'youtube_subscribe',
    completed: false
  },
  {
    id: 'req2',
    text: 'Follow @haarshxo on Instagram',
    type: 'instagram_follow',
    completed: false
  },
  {
    id: 'req3',
    text: 'Share this giveaway with friends',
    type: 'share',
    completed: false
  }
];

const MOCK_GIVEAWAYS = [
  {
    id: 1,
    category: 'main',
    title: 'Monthly Mega Diamond Giveaway',
    prize: '10,000 Free Fire Diamonds',
    daysLeft: 14,
    status: 'open',
    participants: 0,
    participantsList: [],
    requirements: DEFAULT_REQUIREMENTS,
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
      { id: 'req4', text: "Watch today's live stream for 10 mins", type: 'watch_live', durationMinutes: 10, completed: false },
      { id: 'req5', text: 'Follow @haarshxo on Instagram', type: 'instagram_follow', completed: false }
    ],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    active: true,
    winner: null
  }
];

// ─── MissionItem Component ─────────────────────────────────────────────────────
function MissionItem({ req, giveawayId, giveawayShareUrl, done, onComplete, onOpenWatchModal, watchStats }) {
  // state: idle | loading | waiting | done | error
  const [state, setState] = useState('idle');
  const [countdown, setCountdown] = useState(VERIFY_DELAY_SECS);
  const [errorMsg, setErrorMsg] = useState('');
  const timerRef = useRef(null);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const startCountdown = useCallback((onFinish, customSecs = VERIFY_DELAY_SECS) => {
    setCountdown(customSecs);
    setState('waiting');
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setState('done');
          onFinish();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // ── YouTube Subscribe ───────────────────────────────────────────────────────
  const handleYouTube = useCallback(() => {
    window.open(req.url || YT_SUBSCRIBE_URL, '_blank');
    startCountdown(onComplete);
  }, [req.url, onComplete, startCountdown]);

  // ── Instagram Follow ────────────────────────────────────────────────────────
  const handleInstagram = useCallback(() => {
    window.open(req.url || INSTAGRAM_URL, '_blank');
    startCountdown(onComplete);
  }, [req.url, onComplete, startCountdown]);

  // ── Share (Native Apps Sheet / Clipboard Fallback) ─────────────────────────
  const handleShare = useCallback(async () => {
    const shareUrl = giveawayShareUrl || window.location.href;
    const shareData = {
      title: 'HAARSH XO Giveaway 🎁',
      text: '🔥 Win Free Fire Diamonds & Booyah Passes! Join the HAARSH XO Giveaway now! 🎮',
      url: shareUrl
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        let canShare = true;
        try {
          if (typeof navigator.canShare === 'function') {
            canShare = navigator.canShare(shareData);
          }
        } catch {
          canShare = true;
        }

        if (canShare) {
          await navigator.share(shareData);
          setState('done');
          onComplete();
          return;
        }
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setState('done');
      onComplete();
    } catch (err) {
      if (err.name === 'AbortError') {
        setState('idle');
      } else {
        try {
          if (navigator.clipboard) {
            await navigator.clipboard.writeText(shareUrl);
          }
          setState('done');
          onComplete();
        } catch {
          setState('error');
          setErrorMsg('Share nahi hua. Link copy karke share karo.');
        }
      }
    }
  }, [giveawayShareUrl, onComplete]);

  // Check if watch mission is already achieved via today's site watchStats
  const targetMins = req.durationMinutes || (req.type === 'watch_live' ? 10 : 5);
  const currentWatchedMins = req.type === 'watch_live' 
    ? (watchStats?.liveMinutes || 0) 
    : (watchStats?.videoMinutes || 0);
  const alreadyMetWatchTime = (req.type === 'watch_live' || req.type === 'watch_video') && currentWatchedMins >= targetMins;

  const handleVerify = useCallback(() => {
    if (done || state === 'done' || state === 'loading' || state === 'waiting') return;
    setErrorMsg('');

    if (req.type === 'youtube_subscribe') {
      handleYouTube();
    } else if (req.type === 'instagram_follow') {
      handleInstagram();
    } else if (req.type === 'share') {
      handleShare();
    } else if (req.type === 'watch_live' || req.type === 'watch_video') {
      if (alreadyMetWatchTime) {
        setState('done');
        onComplete();
      } else {
        onOpenWatchModal(req, giveawayId);
      }
    } else {
      if (req.url) window.open(req.url, '_blank');
      startCountdown(onComplete, 30);
    }
  }, [done, state, req, giveawayId, alreadyMetWatchTime, handleYouTube, handleInstagram, handleShare, onOpenWatchModal, onComplete, startCountdown]);

  const isReallyDone = done || state === 'done';

  const renderIcon = () => {
    if (isReallyDone) return <CheckCircle2 size={15} color="#4ade80" />;
    if (state === 'loading') return <Loader2 size={15} className="spin" />;
    if (req.type === 'youtube_subscribe') return <Youtube size={15} color="#ef4444" />;
    if (req.type === 'instagram_follow') return <Instagram size={15} color="#ec4899" />;
    if (req.type === 'watch_live') return <Radio size={15} color="#ef4444" />;
    if (req.type === 'watch_video') return <Video size={15} color="#f59e0b" />;
    if (req.type === 'share') return <Share2 size={15} color="#3b82f6" />;
    if (req.type === 'custom_link') return <Link2 size={15} color="#10b981" />;
    return <Sparkles size={15} color="#fbbf24" />;
  };

  const btnLabel = () => {
    if (req.type === 'share') return <><Share2 size={10} /> SHARE</>;
    if (req.type === 'instagram_follow') return <><ExternalLink size={10} /> FOLLOW</>;
    if (req.type === 'youtube_subscribe') return <><ExternalLink size={10} /> SUBSCRIBE</>;
    if (req.type === 'watch_live' || req.type === 'watch_video') {
      if (alreadyMetWatchTime) {
        return <><CheckCircle size={10} /> VERIFY ({currentWatchedMins}m)</>;
      }
      return <><Play size={10} /> WATCH ({targetMins}m)</>;
    }
    return <><ExternalLink size={10} /> VERIFY</>;
  };

  return (
    <li className={`gw-req-item ${isReallyDone ? 'done' : ''} ${state === 'waiting' ? 'gw-req-waiting' : ''} ${state === 'error' ? 'gw-req-errored' : ''}`}>
      <span className="gw-req-icon">
        {renderIcon()}
      </span>

      <span className="gw-req-text">
        {req.text}
        {(req.type === 'watch_live' || req.type === 'watch_video') && !isReallyDone && (
          <span className="gw-req-watch-hint"> (Required: {targetMins}m | Today: {currentWatchedMins}m)</span>
        )}
        {state === 'error' && errorMsg && (
          <span className="gw-req-error-msg"> — {errorMsg}</span>
        )}
      </span>

      {!isReallyDone && (
        <div className="gw-req-action">
          {state === 'idle' && (
            <button className={`gw-req-btn ${alreadyMetWatchTime ? 'btn-met' : ''}`} onClick={handleVerify}>
              {btnLabel()}
            </button>
          )}
          {state === 'loading' && (
            <button className="gw-req-btn gw-req-btn-loading" disabled>
              <Loader2 size={10} className="spin" /> Checking...
            </button>
          )}
          {state === 'waiting' && (
            <div className="gw-req-countdown">
              <Timer size={11} />
              <span>{countdown}s</span>
            </div>
          )}
          {state === 'error' && (
            <button className="gw-req-btn gw-req-btn-error" onClick={handleVerify}>
              Retry ↺
            </button>
          )}
        </div>
      )}
    </li>
  );
}

// ─── Main Giveaways Page ───────────────────────────────────────────────────────
const Giveaways = () => {
  const { giveawaysList, addGiveawayParticipant } = useAdmin();
  const { showNotification, user, isBanned, watchStats, addWatchTime } = useGame();

  const activeMainGiveaways = (giveawaysList && giveawaysList.length > 0)
    ? giveawaysList.filter(g => (g.category || 'main') === 'main' && g.active !== false)
    : MOCK_GIVEAWAYS;

  const [completedMissions, setCompletedMissions] = useState({});
  const [enteredGiveaways, setEnteredGiveaways] = useState({});

  // Active Interactive Watch Modal State
  const [activeWatchModal, setActiveWatchModal] = useState(null);
  const [watchSeconds, setWatchSeconds] = useState(0);

  const isMissionDone = (gId, reqId, defaultCompleted) => {
    if (completedMissions[gId]?.[reqId]) return true;
    return !!defaultCompleted;
  };

  const markMissionComplete = useCallback((gId, reqId) => {
    setCompletedMissions(prev => ({
      ...prev,
      [gId]: { ...(prev[gId] || {}), [reqId]: true }
    }));
    showNotification('✅ Mission verified! Keep going!');
  }, [showNotification]);

  // Open watch modal
  const handleOpenWatchModal = (req, giveawayId) => {
    setWatchSeconds(0);
    const targetMinutes = req.durationMinutes || (req.type === 'watch_live' ? 10 : 5);
    const defaultVid = req.type === 'watch_live' ? 'jfKfPfyJRdk' : '5qap5aO4i9A';
    const videoId = req.videoId || getYouTubeId(req.url, defaultVid);

    setActiveWatchModal({
      giveawayId,
      req,
      type: req.type,
      targetMinutes,
      videoId
    });
  };

  const handleCloseWatchModal = () => {
    setActiveWatchModal(null);
    setWatchSeconds(0);
  };

  // Real-time seconds timer while watch modal is open
  useEffect(() => {
    let interval = null;
    if (activeWatchModal) {
      interval = setInterval(() => {
        setWatchSeconds(prev => {
          const next = prev + 1;
          // Award 1 min of watch time to player's global account every 60s
          if (next % 60 === 0 && addWatchTime) {
            addWatchTime(activeWatchModal.type === 'watch_live' ? 'live' : 'video', 1);
          }
          // Check if target met
          if (next >= activeWatchModal.targetMinutes * 60) {
            markMissionComplete(activeWatchModal.giveawayId, activeWatchModal.req.id);
            showNotification(`🎉 Watch Mission Completed! ${activeWatchModal.targetMinutes} minutes watched.`);
          }
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWatchModal, addWatchTime, markMissionComplete, showNotification]);

  const isWatchTargetMet = activeWatchModal && watchSeconds >= (activeWatchModal.targetMinutes * 60);

  const handleEnterGiveaway = (giveaway) => {
    if (!user) { showNotification('Please login to enter giveaways!', 'warning'); return; }
    if (isBanned) { showNotification('Account Restricted', 'error', 'Your account has been restricted by Admin.'); return; }

    const currentStatus = giveaway.status || (giveaway.winner ? 'completed' : 'open');
    if (currentStatus !== 'open' || giveaway.winner) {
      if (currentStatus === 'completed' || giveaway.winner)
        showNotification('Giveaway Concluded', 'warning', 'Winner has already been announced. Entries are closed.');
      else if (currentStatus === 'closed')
        showNotification('Registrations Closed', 'warning', 'Registrations are currently closed for this giveaway.');
      else
        showNotification('Giveaway Live', 'warning', 'Giveaway is currently live on stream! Entries are locked.');
      return;
    }

    if (addGiveawayParticipant) {
      const res = addGiveawayParticipant(giveaway.id, { uid: user.uid, ign: user.inGameName });
      if (res && res.success === false) { showNotification(res.reason || 'Cannot enter this giveaway right now', 'warning'); return; }
    }

    setEnteredGiveaways(prev => ({ ...prev, [giveaway.id]: true }));
    showNotification('🎉 Registered Successfully!', 'special', `You have successfully entered the ${giveaway.title}!`);
  };

  return (
    <div className="giveaways-page fade-in">
      {/* Page Header */}
      <div className="gw-page-header">
        <h1 className="gw-page-title">HAARSH XO COMMUNITY GIVEAWAYS</h1>
        <p className="gw-page-subtitle">
          Participate in exclusive subscriber events to win Diamonds, Booyah Passes, and Cash Rewards directly from HAARSH XO!
        </p>
      </div>

      {activeMainGiveaways.length === 0 ? (
        <div className="empty-giveaways glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
          <Trophy size={48} style={{ opacity: 0.4, margin: '0 auto 16px' }} />
          <h3>No Active Giveaways At The Moment</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Check back soon or stay tuned to daily live streams for new giveaway announcements.</p>
        </div>
      ) : (
        <div className="gw-cards-container">
          {activeMainGiveaways.map((giveaway, idx) => {
            const rawReqs = (giveaway.requirements && giveaway.requirements.length > 0)
              ? giveaway.requirements : DEFAULT_REQUIREMENTS;

            const normalizedReqs = rawReqs.map((r, i) =>
              typeof r === 'string'
                ? { id: `r_${i}`, text: r, type: 'generic', completed: false }
                : { type: 'generic', ...r }
            );

            const allCompleted = normalizedReqs.every(r => isMissionDone(giveaway.id, r.id, r.completed));
            const hasUserJoined = giveaway.participantsList?.some(p => p.uid === user?.uid) || !!enteredGiveaways[giveaway.id];
            const currentStatus = giveaway.status || (giveaway.winner ? 'completed' : 'open');
            const realCount = (giveaway.participantsList || []).length;
            const shareUrl = giveaway.shareUrl || window.location.href;

            return (
              <div key={giveaway.id} className={`gw-card glass-panel ${idx === 0 ? 'gw-featured' : ''}`}>
                {/* Left: Image */}
                <div className="gw-image-wrap">
                  <img src={giveaway.image} alt={giveaway.title} className="gw-image" />
                  <div className={`gw-live-badge gw-status-${currentStatus}`}>
                    {(currentStatus === 'completed' || giveaway.winner) && '🏆 WINNER ANNOUNCED'}
                    {currentStatus === 'closed' && '🔒 REGISTRATION CLOSED'}
                    {(currentStatus === 'ongoing' || currentStatus === 'live') && '🔴 LIVE STREAM NOW'}
                    {currentStatus === 'open' && !giveaway.winner && '🟢 OPEN FOR REGISTRATION'}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="gw-details">
                  <div className="gw-prize-pill">
                    <Trophy size={14} />
                    {giveaway.prize}
                  </div>

                  <h2 className="gw-title">{giveaway.title}</h2>

                  {giveaway.winner && (
                    <div className="gw-winner-banner">
                      <Award size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div>
                        <span className="gw-winner-label">OFFICIAL WINNER DRAWN</span>
                        <span>Winner: <strong>{giveaway.winner.ign}</strong> (UID: {giveaway.winner.uid})</span>
                      </div>
                    </div>
                  )}

                  <div className="gw-stats-row">
                    <div className="gw-stat">
                      <Clock size={20} className="gw-stat-icon time" />
                      <div className="gw-stat-info">
                        <span className="gw-stat-label">Ends In</span>
                        <span className="gw-stat-value timer">{giveaway.daysLeft} Days</span>
                      </div>
                    </div>
                    <div className="gw-stat">
                      <Users size={20} className="gw-stat-icon users" />
                      <div className="gw-stat-info">
                        <span className="gw-stat-label">Verified Entries</span>
                        <span className="gw-stat-value">{realCount.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Missions */}
                  <div className="gw-reqs">
                    <p className="gw-reqs-title">
                      Complete All Missions to Enter:
                      {allCompleted && <span className="gw-reqs-all-done"> ✅ All Done!</span>}
                    </p>
                    <ul className="gw-reqs-list">
                      {normalizedReqs.map(req => (
                        <MissionItem
                          key={req.id}
                          req={req}
                          giveawayId={giveaway.id}
                          giveawayShareUrl={shareUrl}
                          done={isMissionDone(giveaway.id, req.id, req.completed)}
                          onComplete={() => markMissionComplete(giveaway.id, req.id)}
                          onOpenWatchModal={handleOpenWatchModal}
                          watchStats={watchStats}
                        />
                      ))}
                    </ul>
                  </div>

                  {/* CTA Button */}
                  {hasUserJoined ? (
                    <button className="gw-enter-btn entered" disabled>
                      <CheckCircle2 size={18} /> YOU ARE ENTERED ✅
                    </button>
                  ) : (currentStatus === 'completed' || giveaway.winner) ? (
                    <button className="gw-enter-btn concluded" disabled>
                      <Award size={18} /> GIVEAWAY CONCLUDED (ENTRIES CLOSED)
                    </button>
                  ) : currentStatus === 'closed' ? (
                    <button className="gw-enter-btn closed" disabled>
                      <XCircle size={18} /> REGISTRATIONS CLOSED
                    </button>
                  ) : (currentStatus === 'ongoing' || currentStatus === 'live') ? (
                    <button className="gw-enter-btn live-locked" disabled>
                      <Clock size={18} /> LIVE ON STREAM — ENTRIES LOCKED
                    </button>
                  ) : (
                    <button
                      className={`gw-enter-btn ${!allCompleted ? 'pending' : ''}`}
                      disabled={!allCompleted}
                      onClick={() => handleEnterGiveaway(giveaway)}
                    >
                      {allCompleted
                        ? <><span>ENTER GIVEAWAY</span> <ChevronRight size={20} /></>
                        : 'COMPLETE ALL MISSIONS TO ENTER'}
                    </button>
                  )}

                  <p style={{ fontSize: '0.75rem', color: '#64748b', textAlign: 'center', margin: '10px 0 0', lineHeight: '1.4' }}>
                    Missions are verified automatically. False claims result in disqualification.
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── Interactive Video / Live Stream Watch Modal ──────────────────────── */}
      {activeWatchModal && (
        <div className="gw-watch-modal-overlay fade-in" onClick={handleCloseWatchModal}>
          <div className="gw-watch-modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="gw-watch-modal-header">
              <div className="gw-watch-title-group">
                <span className={`gw-watch-badge ${activeWatchModal.type}`}>
                  {activeWatchModal.type === 'watch_live' ? '🔴 LIVE STREAM' : '📹 VIDEO PLAYER'}
                </span>
                <h3 className="gw-watch-modal-title">{activeWatchModal.req.text}</h3>
              </div>
              <button className="gw-watch-close-btn" onClick={handleCloseWatchModal} title="Close Player">
                <X size={20} />
              </button>
            </div>

            {/* Embedded YouTube Player */}
            <div className="gw-watch-player-frame">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${activeWatchModal.videoId || 'jfKfPfyJRdk'}?autoplay=1&rel=0`}
                title={activeWatchModal.req.text}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="gw-watch-iframe"
              />
            </div>

            {/* Tracker Bar */}
            <div className="gw-watch-tracker-panel">
              <div className="gw-tracker-row">
                <div className="gw-tracker-time-block">
                  <span className="gw-tracker-label">ACTIVE WATCH PROGRESS:</span>
                  <span className="gw-tracker-val">
                    {Math.floor(watchSeconds / 60)}m {watchSeconds % 60}s / {activeWatchModal.targetMinutes} Mins
                  </span>
                </div>
                <div className="gw-tracker-badge-block">
                  <span className={`gw-tracker-status ${isWatchTargetMet ? 'done' : 'active'}`}>
                    {isWatchTargetMet ? '✅ Mission Requirement Met!' : '● Actively Tracking Watch Time'}
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="gw-progress-bar-wrap">
                <div 
                  className="gw-progress-bar-fill" 
                  style={{ width: `${Math.min(100, Math.floor((watchSeconds / (activeWatchModal.targetMinutes * 60)) * 100))}%` }}
                />
              </div>

              <div className="gw-tracker-bottom-row">
                <span className="gw-tracker-subtext">
                  <Flame size={13} color="#f97316" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                  Keep player open to accumulate watch time. Awards XO Coins &amp; updates daily missions!
                </span>

                <div className="gw-tracker-actions">
                  {activeWatchModal.req.url && (
                    <a 
                      href={activeWatchModal.req.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="gw-btn-yt-link"
                    >
                      Watch on YouTube ↗
                    </a>
                  )}
                  {isWatchTargetMet ? (
                    <button className="gw-btn-complete-watch" onClick={handleCloseWatchModal}>
                      <CheckCircle2 size={16} /> Verified ✅ Done
                    </button>
                  ) : (
                    <button 
                      className="gw-btn-manual-verify"
                      onClick={() => {
                        markMissionComplete(activeWatchModal.giveawayId, activeWatchModal.req.id);
                        handleCloseWatchModal();
                      }}
                    >
                      Done Watching? Verify Now
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Giveaways;

