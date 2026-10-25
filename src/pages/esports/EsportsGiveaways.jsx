import { useState } from 'react';
import { Gift, Clock, Users, ChevronRight, CheckCircle2, Ticket, Award, Sparkles, Youtube, Instagram, Share2, XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAdmin } from '../../context/AdminContext';
import './EsportsGiveaways.css';

const DEFAULT_ESPORTS_REQUIREMENTS = [
  { id: 'er1', text: 'Subscribe to HAARSH XO on YouTube', completed: false, icon: <Youtube size={15} /> },
  { id: 'er2', text: 'Follow @haarshxo on Instagram', completed: false, icon: <Instagram size={15} /> },
  { id: 'er3', text: 'Share this giveaway post', completed: false, icon: <Share2 size={15} /> }
];

const DEFAULT_ESPORTS_GIVEAWAYS = [
  {
    id: 'eg_1',
    category: 'esports',
    title: '10x CS TOURNAMENT TICKETS GIVEAWAY',
    prize: '10x Clash Squad Tickets',
    daysLeft: 1,
    status: 'open',
    participants: 0,
    participantsList: [],
    requirements: DEFAULT_ESPORTS_REQUIREMENTS,
    image: '/tokens/cs-ticket.png',
    ticketType: 'CS',
    active: true,
    winner: null
  },
  {
    id: 'eg_2',
    category: 'esports',
    title: '10x BATTLE ROYALE TOURNAMENT TICKETS',
    prize: '10x Battle Royale Tickets',
    daysLeft: 2,
    status: 'open',
    participants: 0,
    participantsList: [],
    requirements: DEFAULT_ESPORTS_REQUIREMENTS,
    image: '/tokens/br-ticket.png',
    ticketType: 'BR',
    active: true,
    winner: null
  }
];

const EsportsGiveaways = () => {
  const { giveawaysList, addGiveawayParticipant } = useAdmin();
  const { showNotification, user, isBanned } = useGame();
  const [entered, setEntered] = useState({});
  const [taskCompletedOverrides, setTaskCompletedOverrides] = useState({});

  const activeEsportsGiveaways = (giveawaysList && giveawaysList.length > 0)
    ? giveawaysList.filter(g => g.category === 'esports' && g.active !== false)
    : DEFAULT_ESPORTS_GIVEAWAYS;

  const currentList = activeEsportsGiveaways.length > 0 ? activeEsportsGiveaways : DEFAULT_ESPORTS_GIVEAWAYS;

  const isTaskCompleted = (gId, reqId, defaultCompleted) => {
    if (taskCompletedOverrides[gId]?.[reqId] !== undefined) return taskCompletedOverrides[gId][reqId];
    return !!defaultCompleted;
  };

  const toggleRequirement = (gId, req) => {
    const reqId = req.id || req;
    if (req.type === 'youtube_subscribe') {
      window.open(req.url || 'https://www.youtube.com/@HaarshXO?sub_confirmation=1', '_blank');
    } else if (req.type === 'instagram_follow') {
      window.open(req.url || 'https://www.instagram.com/haarshxo?stkn=dnJza2k1cHVoMzFw', '_blank');
    } else if (req.type === 'share') {
      if (navigator.share) {
        navigator.share({ title: 'HAARSH XO Esports Giveaway', url: window.location.href }).catch(() => {});
      }
    } else if (req.url) {
      window.open(req.url, '_blank');
    }

    setTaskCompletedOverrides(prev => ({
      ...prev,
      [gId]: { ...(prev[gId] || {}), [reqId]: true }
    }));
    showNotification('✅ Requirement verified! Keep completing tasks to enter.');
  };

  const handleEnter = (giveaway) => {
    if (!user) {
      showNotification('Please login to enter giveaways!', 'warning');
      return;
    }
    if (isBanned) {
      showNotification('Account Restricted', 'error', 'Your account has been restricted by Admin.');
      return;
    }

    const currentStatus = giveaway.status || (giveaway.winner ? 'completed' : 'open');
    if (currentStatus !== 'open' || giveaway.winner) {
      if (currentStatus === 'completed' || giveaway.winner) {
        showNotification('Giveaway Concluded', 'warning', 'Winner has already been announced. Entries are closed.');
      } else if (currentStatus === 'closed') {
        showNotification('Registrations Closed', 'warning', 'Registrations are currently closed for this giveaway.');
      } else {
        showNotification('Giveaway Live', 'warning', 'Giveaway is currently live on stream! Entries are locked.');
      }
      return;
    }

    if (addGiveawayParticipant) {
      const res = addGiveawayParticipant(giveaway.id, {
        uid: user.uid,
        ign: user.inGameName
      });
      if (res && res.success === false) {
        showNotification(res.reason || 'Cannot enter this giveaway right now', 'warning');
        return;
      }
    }

    setEntered(prev => ({ ...prev, [giveaway.id]: true }));
    showNotification(`🎉 Successfully entered ${giveaway.title}! Winners drawn live on stream.`);
  };

  return (
    <div className="esports-giveaways fade-in">
      <div className="giveaway-header">
        <h1 className="giveaways-page-title">TOURNAMENT TICKET GIVEAWAYS</h1>
        <p className="giveaways-page-subtitle">
          Enter now for a chance to win Free CS &amp; BR Tournament Registration Tickets sponsored by HAARSH XO!
        </p>
      </div>

      <div className="giveaways-container">
        {currentList.map((giveaway, idx) => {
          const isCs = (giveaway.ticketType || giveaway.title || '').toUpperCase().includes('CS');
          const isEntered = giveaway.participantsList?.some(p => p.uid === user?.uid) || !!entered[giveaway.id];
          const badgeClass = isCs ? 'cs-badge' : 'br-badge';
          const pillClass = isCs ? 'cs' : 'br';

          const rawReqs = (giveaway.requirements && giveaway.requirements.length > 0)
            ? giveaway.requirements
            : DEFAULT_ESPORTS_REQUIREMENTS;

          const normalizedReqs = rawReqs.map((r, i) => {
            if (typeof r === 'string') return { id: `er_${i}`, text: r, completed: false };
            return r;
          });

          const allCompleted = normalizedReqs.every(r => isTaskCompleted(giveaway.id, r.id, r.completed));

          const currentStatus = giveaway.status || (giveaway.winner ? 'completed' : 'open');
          const realCount = (giveaway.participantsList || []).length;

          return (
            <div
              key={giveaway.id}
              className={`giveaway-card ${idx === 0 ? 'featured' : 'secondary'} glass-panel`}
            >
              {/* Left: Image */}
              <div className="giveaway-image-container">
                <img
                  src={giveaway.image || (isCs ? '/tokens/cs-ticket.png' : '/tokens/br-ticket.png')}
                  alt={giveaway.title}
                  className="giveaway-ticket-preview"
                />
                <div className={`giveaway-badge eg-status-${currentStatus} ${badgeClass}`}>
                  {(currentStatus === 'completed' || giveaway.winner) && '🏆 WINNER ANNOUNCED'}
                  {currentStatus === 'closed' && '🔒 REGISTRATIONS CLOSED'}
                  {(currentStatus === 'ongoing' || currentStatus === 'live') && '🔴 LIVE ON STREAM'}
                  {currentStatus === 'open' && !giveaway.winner && (isCs ? 'CLASH SQUAD SPECIAL' : 'BATTLE ROYALE SPECIAL')}
                </div>
              </div>

              {/* Right: Details */}
              <div className="giveaway-details">
                {/* Prize pill */}
                <div className={`giveaway-type-pill ${pillClass}`}>
                  <Ticket size={14} /> {giveaway.prize || 'TOURNAMENT TICKETS'}
                </div>

                <h2 className="giveaway-title">{giveaway.title}</h2>

                {/* Winner banner */}
                {giveaway.winner && (
                  <div className="eg-winner-banner">
                    <Award size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                    <div>
                      <span className="eg-winner-label">OFFICIAL WINNER DRAWN</span>
                      <span>Winner: <strong>{giveaway.winner.ign}</strong> (UID: {giveaway.winner.uid})</span>
                    </div>
                  </div>
                )}

                {/* Stats */}
                <div className="giveaway-stats">
                  <div className="g-stat">
                    <Clock size={20} className="g-icon time-icon" />
                    <div className="g-stat-info">
                      <span className="g-stat-label">Ends In</span>
                      <span className="g-stat-value timer">
                        {giveaway.daysLeft ? `${giveaway.daysLeft} Days` : '48 Hours'}
                      </span>
                    </div>
                  </div>
                  <div className="g-stat">
                    <Users size={20} className="g-icon users-icon" />
                    <div className="g-stat-info">
                      <span className="g-stat-label">Verified Entries</span>
                      <span className="g-stat-value">
                        {realCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="eg-reqs">
                  <p className="eg-reqs-title">How to Enter:</p>
                  <ul className="eg-reqs-list">
                    {normalizedReqs.map(req => {
                      const done = isTaskCompleted(giveaway.id, req.id, req.completed);
                      return (
                        <li
                          key={req.id}
                          className={`eg-req-item ${done ? 'done' : ''}`}
                          onClick={() => !done && toggleRequirement(giveaway.id, req)}
                        >
                          <span className="eg-req-icon">
                            {done ? <CheckCircle2 size={15} /> : (req.icon || <Sparkles size={15} />)}
                          </span>
                          <span className="eg-req-text">{req.text}</span>
                          {!done && <button className="eg-req-btn">VERIFY</button>}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* CTA */}
                {isEntered ? (
                  <button className="enter-giveaway-btn entered" disabled>
                    <CheckCircle2 size={18} /> YOU ARE ENTERED ✅
                  </button>
                ) : (currentStatus === 'completed' || giveaway.winner) ? (
                  <button className="enter-giveaway-btn concluded" disabled>
                    <Award size={18} /> GIVEAWAY CONCLUDED (ENTRIES CLOSED)
                  </button>
                ) : currentStatus === 'closed' ? (
                  <button className="enter-giveaway-btn closed" disabled>
                    <XCircle size={18} /> REGISTRATIONS CLOSED
                  </button>
                ) : (currentStatus === 'ongoing' || currentStatus === 'live') ? (
                  <button className="enter-giveaway-btn live-locked" disabled>
                    <Clock size={18} /> LIVE ON STREAM — ENTRIES LOCKED
                  </button>
                ) : (
                  <button
                    className={`enter-giveaway-btn ${!allCompleted ? 'pending-btn' : (!isCs ? 'secondary-btn' : '')}`}
                    disabled={!allCompleted}
                    onClick={() => handleEnter(giveaway)}
                  >
                    {allCompleted
                      ? <><span>ENTER FOR FREE</span> <ChevronRight size={20} /></>
                      : 'COMPLETE TASKS TO ENTER'
                    }
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EsportsGiveaways;
