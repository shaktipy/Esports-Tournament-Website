import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Clock, Trophy, Map, Ticket, CheckCircle2, AlertCircle, Sparkles, XCircle } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAdmin } from '../../context/AdminContext';
import TournamentRegisterModal from '../../components/TournamentRegisterModal';
import Footer from '../../components/Footer';
import './EsportsHome.css';

const TOURNAMENTS = [
  { 
    id: 'tourney_cs_1', 
    title: 'CLASH SQUAD SHOWDOWN (4v4)', 
    date: 'Starts Tomorrow, 7:00 PM',
    prize: '₹25,000 + 5,000 Diamonds',
    mode: 'Squad (CS)',
    map: 'Kalahari / Bermuda CS',
    slots: '14/16 Squads',
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop',
    description: 'Competitive 4v4 Clash Squad. Fast rounds, high stakes, master tier teams.'
  },
  { 
    id: 'tourney_br_1', 
    title: 'HAARSH XO BATTLE ROYALE INVITATIONAL', 
    date: 'Starts Saturday, 8:30 PM',
    prize: '₹50,000 + 10,000 Diamonds',
    mode: 'Squad (BR)',
    map: 'Bermuda Classic',
    slots: '44/48 Teams',
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    description: 'Premier Battle Royale championship streamed live on HAARSH XO YouTube channel.'
  },
  { 
    id: 'tourney_br_2', 
    title: 'LONE WOLF 1v1 CHAMPIONSHIP', 
    date: 'Starts Sunday, 6:00 PM',
    prize: '₹15,000 + 2,500 Diamonds',
    mode: 'Solo (1v1)',
    map: 'Iron Cage',
    slots: '88/100 Players',
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    description: 'Pure 1v1 gun skill. Snipers, Desert Eagle, Shotguns only.'
  },
  { 
    id: 'tourney_cs_2', 
    title: 'CS WEEKEND PRO SCRIMS', 
    date: 'Starts Friday, 9:00 PM',
    prize: '₹20,000 + Custom Title',
    mode: 'Squad (CS)',
    map: 'Alpine CS',
    slots: '10/16 Squads',
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    description: 'Official esports scrims for verified tournament rosters.'
  },
  { 
    id: 'tourney_br_3', 
    title: 'BERMUDA TRIANGLE DUO CUP', 
    date: 'Starts Next Monday, 8:00 PM',
    prize: '₹30,000 + 7,500 Diamonds',
    mode: 'Duo (BR)',
    map: 'Bermuda Remastered',
    slots: '22/24 Duos',
    ticketType: 'BR',
    ticketCost: 1,
    ticketImage: '/tokens/br-ticket.png',
    image: 'https://images.unsplash.com/photo-1560253023-3ec5d502959f?q=80&w=2070&auto=format&fit=crop',
    description: 'Dynamic 2v2 Battle Royale survival cup. Coordinate with your duo partner.'
  },
  { 
    id: 'tourney_cs_3', 
    title: 'CS GRAND MASTERS ALL-STARS', 
    date: 'Starts Next Wednesday, 7:30 PM',
    prize: '₹40,000 + Exclusive XO Jersey',
    mode: 'Squad (CS)',
    map: 'NeXTerra / Purgatory CS',
    slots: '12/16 Squads',
    ticketType: 'CS',
    ticketCost: 1,
    ticketImage: '/tokens/cs-ticket.png',
    image: 'https://images.unsplash.com/photo-1579373903781-fd5c0c30c4cd?q=80&w=1974&auto=format&fit=crop',
    description: 'Elite tier CS tournament for top-ranking community squads and streamers.'
  }
];

const EsportsHome = () => {
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  const { 
    csTickets, 
    brTickets, 
    registeredTournaments, 
    disqualifiedTournaments = [],
    registerTournament,
    showNotification,
    user 
  } = useGame();

  const { tournaments: adminTournaments, addTournamentParticipant } = useAdmin();
  const currentTournaments = Array.isArray(adminTournaments) ? adminTournaments : TOURNAMENTS;

  const filteredTournaments = currentTournaments.filter(t => {
    if (!t) return false;
    const ticketUpper = (t.ticketType || '').toUpperCase();
    if (filter === 'all') return true;
    if (filter === 'cs') return ticketUpper === 'CS';
    if (filter === 'br') return ticketUpper === 'BR';
    if (filter === 'solo') return t.mode?.toLowerCase().includes('solo');
    if (filter === 'squad') return t.mode?.toLowerCase().includes('squad');
    return true;
  });

  const [selectedTourneyForRegister, setSelectedTourneyForRegister] = useState(null);

  const checkIsDisqualified = (tourney) => {
    if (!tourney) return false;
    const isIdDisq = (disqualifiedTournaments || []).includes(tourney.id);
    if (isIdDisq) return true;
    const disqList = tourney.disqualifiedParticipants || [];
    return disqList.some(d => {
      const uids = d.uids || [d.uid, d.leaderUid];
      const igns = d.igns || [d.ign, d.leaderIgn];
      const userUidMatch = user?.uid && uids.some(u => String(u) === String(user.uid));
      const userIgnMatch = user?.inGameName && igns.some(i => i?.toLowerCase() === user.inGameName.toLowerCase());
      return userUidMatch || userIgnMatch;
    });
  };

  const handleRegisterClick = (tournament) => {
    if (checkIsDisqualified(tournament)) {
      if (showNotification) {
        showNotification(
          'Registration Blocked!',
          'error',
          'Cannot register: You have been disqualified from this tournament by the admin.'
        );
      } else {
        alert('Cannot register: You have been disqualified from this tournament by the admin.');
      }
      return;
    }
    setSelectedTourneyForRegister(tournament);
  };

  const handleConfirmRegister = (payload) => {
    if (!selectedTourneyForRegister) return;
    const isSquad = (selectedTourneyForRegister.mode || '').toLowerCase().includes('squad') || 
                    (selectedTourneyForRegister.mode || '').toLowerCase().includes('4v4') ||
                    ((selectedTourneyForRegister.mode || '').toLowerCase().includes('cs') && !(selectedTourneyForRegister.mode || '').toLowerCase().includes('solo'));
    const isDuo = (selectedTourneyForRegister.mode || '').toLowerCase().includes('duo') || 
                  (selectedTourneyForRegister.mode || '').toLowerCase().includes('2v2');
    const requiredTickets = payload.ticketCost || (isSquad ? 4 : isDuo ? 2 : (Number(selectedTourneyForRegister.ticketCost) || 1));

    const success = registerTournament(
      selectedTourneyForRegister.id, 
      selectedTourneyForRegister.ticketType, 
      requiredTickets, 
      selectedTourneyForRegister.title
    );
    if (success !== false && addTournamentParticipant) {
      const reg = addTournamentParticipant(selectedTourneyForRegister.id, {
        ...payload,
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${selectedTourneyForRegister.ticketType} Tickets`
      });
      return reg;
    }
    return null;
  };

  return (
    <div className="esports-home fade-in">
      {/* Tickets Showcase Hero Banner */}
      <div className="tickets-showcase-banner glass-panel">
        <div className="tickets-banner-text">
          <span className="tickets-tag">OFFICIAL TOURNAMENT REGISTRATION TOKENS</span>
          <h2 className="tickets-banner-title">ENTER TOURNAMENTS WITH CS & BR TICKETS</h2>
          <p className="tickets-banner-desc">
            Earn tickets by watching live streams, completing weekly and monthly missions, or claim ticket bundles to enter competitive cups.
          </p>
          <div className="tickets-balance-summary">
            <div className="summary-pill cs">
              <img src="/tokens/cs-ticket.png" alt="CS Ticket" className="pill-img" />
              <span>Your CS Tickets:&nbsp; <strong>{csTickets}</strong></span>
            </div>
            <div className="summary-pill br">
              <img src="/tokens/br-ticket.png" alt="BR Ticket" className="pill-img" />
              <span>Your BR Tickets:&nbsp; <strong>{brTickets}</strong></span>
            </div>
            <button className="btn-get-tickets" onClick={() => navigate('/esports/passes')}>
              Get Ticket Passes →
            </button>
          </div>
        </div>

        <div className="tickets-cards-preview">
          <div className="ticket-preview-item cs-tilt">
            <img src="/tokens/cs-ticket.png" alt="CS Tournament Registration Ticket" className="ticket-full-img" />
          </div>
          <div className="ticket-preview-item br-tilt">
            <img src="/tokens/br-ticket.png" alt="BR Tournament Registration Ticket" className="ticket-full-img" />
          </div>
        </div>
      </div>

      <div className="esports-header">
        <div>
          <h1 className="esports-page-title">ACTIVE TOURNAMENTS</h1>
          <p className="esports-page-subtitle">Select a tournament, register with your CS or BR Ticket, and battle for the crown.</p>
        </div>
        <div className="esports-filters">
          <button 
            className={`esports-filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL
          </button>
          <button 
            className={`esports-filter-btn ${filter === 'cs' ? 'active' : ''}`}
            onClick={() => setFilter('cs')}
          >
            CS
          </button>
          <button 
            className={`esports-filter-btn ${filter === 'br' ? 'active' : ''}`}
            onClick={() => setFilter('br')}
          >
            BR
          </button>
        </div>
      </div>

      <div className="tournaments-grid">
        {filteredTournaments.map(tournament => {
          const isDisqualified = checkIsDisqualified(tournament);
          const disqRecord = (tournament.disqualifiedParticipants || []).find(d => {
            const uids = d.uids || [d.uid, d.leaderUid];
            const igns = d.igns || [d.ign, d.leaderIgn];
            return (user?.uid && uids.some(u => String(u) === String(user.uid))) ||
                   (user?.inGameName && igns.some(i => i?.toLowerCase() === user.inGameName.toLowerCase()));
          });
          const isRegistered = registeredTournaments.includes(tournament.id);
          const isSquad = (tournament.mode || '').toLowerCase().includes('squad') || 
                          (tournament.mode || '').toLowerCase().includes('4v4') ||
                          ((tournament.mode || '').toLowerCase().includes('cs') && !(tournament.mode || '').toLowerCase().includes('solo'));
          const isDuo = (tournament.mode || '').toLowerCase().includes('duo') || 
                        (tournament.mode || '').toLowerCase().includes('2v2');
          const requiredTickets = isSquad ? 4 : (isDuo ? 2 : (Number(tournament.ticketCost) || 1));

          const userTicketBalance = tournament.ticketType === 'CS' ? csTickets : brTickets;
          const hasTicket = userTicketBalance >= requiredTickets;

          return (
            <div key={tournament.id} className="tournament-card glass-panel">
              <div className="tournament-image-wrapper">
                <img 
                  src={tournament.image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop'} 
                  alt={tournament.title} 
                  className="tournament-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop';
                  }}
                />
                <div className="tournament-prize-badge">
                  <Trophy size={16} />
                  <span>{tournament.prize}</span>
                </div>
                <div className={`tournament-mode-badge ${(tournament.ticketType || 'CS').toLowerCase()}`}>
                  {tournament.ticketType || 'CS'} MODE
                </div>
              </div>
              
              <div className="tournament-details">
                <h3 className="tournament-title">{tournament.title}</h3>
                <p className="tournament-desc">{tournament.description}</p>
                
                <div className="tournament-info-grid">
                  <div className="t-info-item">
                    <Clock size={16} className="t-icon" />
                    <span>{tournament.date}</span>
                  </div>
                  <div className="t-info-item">
                    <Map size={16} className="t-icon" />
                    <span>{tournament.map}</span>
                  </div>
                  <div className="t-info-item">
                    <Users size={16} className="t-icon" />
                    <span>{tournament.mode} ({tournament.slots})</span>
                  </div>
                </div>

                {/* Entry Requirement: CS / BR Ticket */}
                <div className="tournament-ticket-cost-box">
                  <div className="ticket-req-left">
                    <span className="req-label">Entry Fee:</span>
                    <div className="req-token-badge">
                      <img 
                        src={tournament.ticketType === 'CS' ? '/tokens/cs-ticket.png' : '/tokens/br-ticket.png'} 
                        alt="Ticket" 
                        className="req-token-img" 
                      />
                      <span className="req-token-text">
                        {requiredTickets}x {tournament.ticketType} Tickets {isSquad ? '(4 Players - 1 per player)' : isDuo ? '(2 Players)' : ''}
                      </span>
                    </div>
                  </div>
                  <div className="ticket-req-right">
                    <span className="user-avail-tickets">
                      (You have:&nbsp; {userTicketBalance})
                    </span>
                  </div>
                </div>

                {tournament.results?.winnersDeclared && (
                  <div style={{
                    margin: '10px 0',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.12)',
                    border: '1px solid rgba(245, 158, 11, 0.35)',
                    color: '#fbbf24',
                    fontSize: '0.82rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <Trophy size={14} color="#f59e0b" />
                      <span>OFFICIAL WINNERS & PRIZES</span>
                    </div>
                    <div>🥇 1st: <strong>{tournament.results.firstPlace?.ign || 'Champion'}</strong> ({tournament.results.firstPlace?.prize || tournament.prize})</div>
                    {tournament.results.secondPlace?.ign && (
                      <div style={{ opacity: 0.9 }}>🥈 2nd: <strong>{tournament.results.secondPlace.ign}</strong> ({tournament.results.secondPlace.prize || 'Runner Up'})</div>
                    )}
                    {tournament.results.thirdPlace?.ign && (
                      <div style={{ opacity: 0.8 }}>🥉 3rd: <strong>{tournament.results.thirdPlace.ign}</strong> ({tournament.results.thirdPlace.prize || '3rd Place'})</div>
                    )}
                  </div>
                )}

                {isDisqualified ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <button 
                      className="join-tournament-btn need-ticket" 
                      disabled 
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))',
                        border: '1px solid rgba(239, 68, 68, 0.6)',
                        color: '#fca5a5',
                        cursor: 'not-allowed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px'
                      }}
                    >
                      <XCircle size={18} /> DISQUALIFIED 🚫
                    </button>
                    <div style={{
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px dashed rgba(239, 68, 68, 0.4)',
                      borderRadius: '8px',
                      padding: '8px 12px',
                      textAlign: 'center',
                      fontSize: '0.78rem',
                      color: '#f87171',
                      lineHeight: '1.4'
                    }}>
                      ⚠️ You were disqualified from this tournament by Admin and cannot re-register.
                      {disqRecord?.reason && (
                        <div style={{ marginTop: '3px', color: '#fca5a5', fontWeight: '600' }}>
                          Reason: {disqRecord.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ) : isRegistered ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
                    <button className="join-tournament-btn registered" disabled>
                      <CheckCircle2 size={18} /> REGISTERED ✅
                    </button>
                    {(() => {
                      const myReg = (tournament.participants || []).find(p => 
                        (user?.uid && (String(p.uid) === String(user.uid) || String(p.leaderUid) === String(user.uid) || (Array.isArray(p.players) && p.players.some(m => String(m.uid) === String(user.uid))))) ||
                        (user?.inGameName && (p.ign?.toLowerCase() === user.inGameName.toLowerCase() || p.leaderIgn?.toLowerCase() === user.inGameName.toLowerCase()))
                      );
                      const sNum = myReg?.slotNumber || myReg?.slot;
                      const isUnbanned = myReg?.isUnbanned;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
                          {isUnbanned && (
                            <div style={{
                              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.22), rgba(16, 185, 129, 0.28))',
                              border: '1px solid rgba(34, 197, 94, 0.55)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: '#4ade80',
                              letterSpacing: '0.02em',
                              boxShadow: '0 2px 10px rgba(34, 197, 94, 0.15)'
                            }}>
                              🎉 You are unbanned by Admin. New slot - #{sNum}
                            </div>
                          )}
                          {sNum ? (
                            <div style={{
                              background: isUnbanned
                                ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(99, 102, 241, 0.2))'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))',
                              border: isUnbanned
                                ? '1px solid rgba(52, 211, 153, 0.45)'
                                : '1px solid rgba(168, 85, 247, 0.4)',
                              borderRadius: '8px',
                              padding: '6px 12px',
                              textAlign: 'center',
                              fontSize: '0.8rem',
                              fontWeight: '700',
                              color: '#e0e7ff',
                              letterSpacing: '0.03em'
                            }}>
                              🎯 YOUR ASSIGNED ROOM SLOT: <span style={{ color: '#facc15', fontSize: '0.88rem' }}>SLOT #{sNum}</span>
                            </div>
                          ) : null}

                          {Array.isArray(myReg?.players) && myReg.players.length > 1 && (
                            <div style={{
                              background: 'rgba(15, 23, 42, 0.45)',
                              border: '1px solid rgba(255, 255, 255, 0.08)',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              fontSize: '0.75rem',
                              color: '#cbd5e1'
                            }}>
                              <div style={{ fontWeight: 700, color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                                👥 Squad Roster ({myReg.players.length} Players):
                              </div>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {myReg.players.map((pMem, pIdx) => (
                                  <span key={pIdx} style={{
                                    background: 'rgba(255, 255, 255, 0.06)',
                                    borderRadius: '4px',
                                    padding: '2px 6px',
                                    fontSize: '0.73rem'
                                  }}>
                                    <strong>{pMem.ign}</strong> <span style={{ opacity: 0.65 }}>({pMem.uid})</span>
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                ) : tournament.status === 'closed' ? (
                  <button className="join-tournament-btn need-ticket" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                    🔒 REGISTRATION CLOSED
                  </button>
                ) : tournament.status === 'completed' ? (
                  <button className="join-tournament-btn need-ticket" disabled style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                    🏆 TOURNAMENT CONCLUDED
                  </button>
                ) : tournament.status === 'ongoing' ? (
                  <button className="join-tournament-btn need-ticket" disabled style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', cursor: 'not-allowed' }}>
                    🔴 LIVE MATCH IN PROGRESS
                  </button>
                ) : hasTicket ? (
                  <button 
                    className="join-tournament-btn ready"
                    onClick={() => handleRegisterClick(tournament)}
                  >
                    {isSquad 
                      ? `REGISTER SQUAD (${requiredTickets} ${tournament.ticketType} TICKETS)` 
                      : `REGISTER WITH ${requiredTickets} ${tournament.ticketType} TICKET`}
                  </button>
                ) : (
                  <button 
                    className="join-tournament-btn need-ticket"
                    onClick={() => navigate('/esports/passes')}
                  >
                    NEED {requiredTickets} {tournament.ticketType} TICKETS (GET PASS)
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {filteredTournaments.length === 0 && (
          <div className="glass-panel" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
            <Trophy size={48} style={{ opacity: 0.35, margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '8px' }}>No Tournaments Found</h3>
            <p style={{ fontSize: '0.9rem' }}>No active tournaments matching this category. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Tournament Registration Modal */}
      {selectedTourneyForRegister && (
        <TournamentRegisterModal
          tournament={selectedTourneyForRegister}
          isOpen={!!selectedTourneyForRegister}
          onClose={() => setSelectedTourneyForRegister(null)}
          onSuccessRegister={handleConfirmRegister}
          user={user}
          userTickets={selectedTourneyForRegister.ticketType === 'BR' ? brTickets : csTickets}
        />
      )}

      {/* Site Footer - Esports Arena */}
      <Footer />
    </div>
  );
};

export default EsportsHome;
