import { useState } from 'react';
import { Trophy, Users, Clock, CheckCircle, Share2, Youtube, Instagram, ChevronRight, CheckCircle2, Award, Sparkles, Gift } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin } from '../context/AdminContext';
import './Giveaways.css';

const DEFAULT_REQUIREMENTS = [
  { id: 'req1', text: 'Subscribe to HAARSH XO on YouTube', completed: true, icon: <Youtube size={15} /> },
  { id: 'req2', text: 'Follow @haarsh_xo on Instagram', completed: false, icon: <Instagram size={15} /> },
  { id: 'req3', text: 'Share this live stream giveaway', completed: false, icon: <Share2 size={15} /> }
];

const MOCK_GIVEAWAYS = [
  { 
    id: 1, 
    category: 'main',
    title: 'Monthly Mega Diamond Giveaway', 
    prize: '10,000 Free Fire Diamonds', 
    daysLeft: 14,
    participants: 18420,
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
    participants: 5850,
    participantsList: [],
    requirements: [
      { id: 'req4', text: "Watch today's live stream for 15 mins", completed: true, icon: <Youtube size={15} /> },
      { id: 'req5', text: 'Comment your Free Fire UID in chat', completed: true, icon: <CheckCircle size={15} /> }
    ],
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    active: true,
    winner: null
  }
];

const Giveaways = () => {
  const { giveawaysList, addGiveawayParticipant } = useAdmin();
  const { showNotification, user, isBanned } = useGame();

  const activeMainGiveaways = (giveawaysList && giveawaysList.length > 0)
    ? giveawaysList.filter(g => (g.category || 'main') === 'main' && g.active !== false)
    : MOCK_GIVEAWAYS;

  const [taskCompletedOverrides, setTaskCompletedOverrides] = useState({});
  const [enteredGiveaways, setEnteredGiveaways] = useState({});

  const isTaskCompleted = (gId, reqId, defaultCompleted) => {
    if (taskCompletedOverrides[gId]?.[reqId] !== undefined) {
      return taskCompletedOverrides[gId][reqId];
    }
    return !!defaultCompleted;
  };

  const toggleRequirement = (gId, reqId) => {
    setTaskCompletedOverrides(prev => ({
      ...prev,
      [gId]: {
        ...(prev[gId] || {}),
        [reqId]: true
      }
    }));
    showNotification('✅ Requirement verified! Keep completing tasks to enter.');
  };

  const handleEnterGiveaway = (giveaway) => {
    if (!user) {
      showNotification('Please login to enter giveaways!', 'warning');
      return;
    }
    if (isBanned) {
      showNotification('Account Restricted', 'error', 'Your account has been restricted by Admin.');
      return;
    }

    setEnteredGiveaways(prev => ({ ...prev, [giveaway.id]: true }));

    if (addGiveawayParticipant) {
      addGiveawayParticipant(giveaway.id, {
        uid: user.uid,
        ign: user.inGameName
      });
    }

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
              ? giveaway.requirements
              : DEFAULT_REQUIREMENTS;

            const normalizedReqs = rawReqs.map((r, i) => {
              if (typeof r === 'string') return { id: `r_${i}`, text: r, completed: false };
              return r;
            });

            const allCompleted = normalizedReqs.every(r => isTaskCompleted(giveaway.id, r.id, r.completed));
            const hasUserJoined = giveaway.participantsList?.some(p => p.uid === user?.uid) || !!enteredGiveaways[giveaway.id];

            return (
              <div key={giveaway.id} className={`gw-card glass-panel ${idx === 0 ? 'gw-featured' : ''}`}>
                {/* Left: Image */}
                <div className="gw-image-wrap">
                  <img src={giveaway.image} alt={giveaway.title} className="gw-image" />
                  <div className="gw-live-badge">
                    {giveaway.winner ? '🏆 WINNER DRAWN' : '🔴 LIVE GIVEAWAY'}
                  </div>
                </div>

                {/* Right: Details */}
                <div className="gw-details">
                  {/* Prize pill */}
                  <div className="gw-prize-pill">
                    <Trophy size={14} />
                    {giveaway.prize}
                  </div>

                  <h2 className="gw-title">{giveaway.title}</h2>

                  {/* Winner banner */}
                  {giveaway.winner && (
                    <div className="gw-winner-banner">
                      <Award size={18} style={{ color: '#f59e0b', flexShrink: 0 }} />
                      <div>
                        <span className="gw-winner-label">OFFICIAL WINNER DRAWN</span>
                        <span>Winner: <strong>{giveaway.winner.ign}</strong> (UID: {giveaway.winner.uid})</span>
                      </div>
                    </div>
                  )}

                  {/* Stats row */}
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
                        <span className="gw-stat-label">Entries</span>
                        <span className="gw-stat-value">{(giveaway.participants || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Requirements */}
                  <div className="gw-reqs">
                    <p className="gw-reqs-title">How to Enter:</p>
                    <ul className="gw-reqs-list">
                      {normalizedReqs.map(req => {
                        const done = isTaskCompleted(giveaway.id, req.id, req.completed);
                        return (
                          <li
                            key={req.id}
                            className={`gw-req-item ${done ? 'done' : ''}`}
                            onClick={() => !done && toggleRequirement(giveaway.id, req.id)}
                          >
                            <span className="gw-req-icon">
                              {done ? <CheckCircle2 size={15} /> : (req.icon || <Sparkles size={15} />)}
                            </span>
                            <span className="gw-req-text">{req.text}</span>
                            {!done && <button className="gw-req-btn">VERIFY</button>}
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {/* CTA */}
                  {hasUserJoined ? (
                    <button className="gw-enter-btn entered" disabled>
                      <CheckCircle2 size={18} /> YOU ARE ENTERED ✅
                    </button>
                  ) : (
                    <button
                      className={`gw-enter-btn ${!allCompleted ? 'pending' : ''}`}
                      disabled={!allCompleted}
                      onClick={() => handleEnterGiveaway(giveaway)}
                    >
                      {allCompleted ? <>ENTER GIVEAWAY <ChevronRight size={20} /></> : 'COMPLETE TASKS TO ENTER'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Giveaways;
