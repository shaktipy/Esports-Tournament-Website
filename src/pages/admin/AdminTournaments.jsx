import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import ImageUploadField from '../../components/ImageUploadField';
import { 
  Trophy, Plus, Edit, Trash2, Users, CheckCircle, 
  XCircle, Clock, Award, Shield, AlertTriangle, X, Search, ChevronRight,
  Copy, Check, Phone, MessageSquare, ExternalLink, Filter, Flame, MapPin
} from 'lucide-react';

const AdminTournaments = () => {
  const { 
    tournaments, 
    createTournament, 
    updateTournament, 
    deleteTournament, 
    toggleTournamentStatus,
    removeTournamentParticipant,
    declareTournamentResults,
  } = useAdmin();

  // Top Subtab State: 'tournaments' | 'registrations'
  const [adminTab, setAdminTab] = useState('tournaments');

  // Tournaments tab state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all');

  // Registrations view state: selected tournament ID or 'all_grouped'
  const [selectedTourneyId, setSelectedTourneyId] = useState(() => {
    const withParticipants = tournaments.find(t => (t.participants || []).length > 0);
    return withParticipants ? withParticipants.id : (tournaments[0]?.id || 'all_grouped');
  });

  const [regFormatFilter, setRegFormatFilter] = useState('all');
  const [regSearchTerm, setRegSearchTerm] = useState('');
  const [copiedToast, setCopiedToast] = useState('');
  
  // Modals state
  const [editingTourney, setEditingTourney] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingParticipantsTourney, setViewingParticipantsTourney] = useState(null);
  const [resultsTourney, setResultsTourney] = useState(null);
  const [deletingTourney, setDeletingTourney] = useState(null);

  // Form state for Create / Edit
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    prize: '',
    mode: 'Squad (CS)',
    map: 'Bermuda',
    maxSlots: 16,
    ticketType: 'CS',
    ticketCost: 4,
    image: '',
    description: '',
    rules: '',
    status: 'open',
  });

  // Results form state
  const [resultsForm, setResultsForm] = useState({
    firstIgn: '',
    firstUid: '',
    firstPrize: '',
    secondIgn: '',
    secondUid: '',
    secondPrize: '',
    thirdIgn: '',
    thirdUid: '',
    thirdPrize: '',
    prizeDistributionStatus: 'Pending',
  });

  // Flat list of all registrations across all tournaments
  const allRegistrations = tournaments.flatMap(t => 
    (t.participants || []).map(p => ({
      ...p,
      tournamentId: t.id,
      tournamentTitle: t.title,
      tournamentMode: t.mode,
      ticketType: t.ticketType,
    }))
  );

  // Copy UIDs Helper
  const copyUidsList = (list) => {
    const uids = [];
    list.forEach(item => {
      if (Array.isArray(item.players) && item.players.length > 0) {
        item.players.forEach(p => p.uid && uids.push(p.uid));
      } else if (item.uid) {
        uids.push(item.uid);
      }
    });

    if (uids.length === 0) {
      alert('No player UIDs found to copy.');
      return;
    }

    const uniqueUids = [...new Set(uids)].join('\n');
    navigator.clipboard.writeText(uniqueUids);
    setCopiedToast(`Copied ${uids.length} Free Fire UIDs to clipboard!`);
    setTimeout(() => setCopiedToast(''), 3000);
  };

  const openCreateModal = () => {
    setFormData({
      title: '',
      date: 'This Sunday, 7:00 PM IST',
      prize: '₹20,000 + 5,000 Diamonds',
      mode: 'Squad (CS)',
      map: 'Bermuda CS',
      maxSlots: 16,
      ticketType: 'CS',
      ticketCost: 4,
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
      description: 'Official HAARSH XO Championship Tournament. Streamed live.',
      rules: 'Standard esports tournament rules. Hackers banned immediately.',
      status: 'open',
    });
    setEditingTourney(null);
    setShowCreateModal(true);
  };

  const openEditModal = (tourney) => {
    setEditingTourney(tourney);
    setFormData({
      title: tourney.title,
      date: tourney.date,
      prize: tourney.prize,
      mode: tourney.mode,
      map: tourney.map,
      maxSlots: tourney.maxSlots || 16,
      ticketType: tourney.ticketType,
      ticketCost: tourney.ticketCost || ((tourney.mode || '').toLowerCase().includes('squad') ? 4 : 1),
      image: tourney.image,
      description: tourney.description,
      rules: tourney.rules || '',
      status: tourney.status,
    });
    setShowCreateModal(true);
  };

  const handleSaveTournament = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingTourney) {
      updateTournament(editingTourney.id, {
        ...formData,
        ticketImage: formData.ticketType === 'BR' ? '/tokens/br-ticket.png' : '/tokens/cs-ticket.png',
        slots: `${editingTourney.registeredCount || 0}/${formData.maxSlots} ${formData.mode.includes('Solo') ? 'Players' : 'Squads'}`
      });
    } else {
      createTournament(formData);
    }
    setShowCreateModal(false);
    setEditingTourney(null);
  };

  const openResultsModal = (tourney) => {
    setResultsTourney(tourney);
    const r = tourney.results || {};
    setResultsForm({
      firstIgn: r.firstPlace?.ign || '',
      firstUid: r.firstPlace?.uid || '',
      firstPrize: r.firstPlace?.prize || '₹15,000 + 3,000 Diamonds',
      secondIgn: r.secondPlace?.ign || '',
      secondUid: r.secondPlace?.uid || '',
      secondPrize: r.secondPlace?.prize || '₹7,000 + 1,500 Diamonds',
      thirdIgn: r.thirdPlace?.ign || '',
      thirdUid: r.thirdPlace?.uid || '',
      thirdPrize: r.thirdPlace?.prize || '₹3,000 + 500 Diamonds',
      prizeDistributionStatus: r.prizeDistributionStatus || 'Pending',
    });
  };

  const handleSaveResults = (e) => {
    e.preventDefault();
    if (!resultsTourney) return;
    declareTournamentResults(resultsTourney.id, {
      winnersDeclared: true,
      firstPlace: { ign: resultsForm.firstIgn, uid: resultsForm.firstUid, prize: resultsForm.firstPrize },
      secondPlace: { ign: resultsForm.secondIgn, uid: resultsForm.secondUid, prize: resultsForm.secondPrize },
      thirdPlace: { ign: resultsForm.thirdIgn, uid: resultsForm.thirdUid, prize: resultsForm.thirdPrize },
      prizeDistributionStatus: resultsForm.prizeDistributionStatus,
    });
    setResultsTourney(null);
  };

  const filteredTournaments = tournaments.filter(t => {
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.map.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          t.mode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMode = filterMode === 'all' || 
                        (filterMode === 'cs' && t.ticketType === 'CS') ||
                        (filterMode === 'br' && t.ticketType === 'BR');
    return matchesSearch && matchesMode;
  });

  // Filter a specific list of participants by search and format
  const filterParticipantList = (participants = []) => {
    return participants.filter(r => {
      const matchesFormat = regFormatFilter === 'all' || r.type === regFormatFilter;
      const searchLower = regSearchTerm.toLowerCase();
      const matchesSearch = !regSearchTerm || 
        (r.teamName && r.teamName.toLowerCase().includes(searchLower)) ||
        (r.ign && r.ign.toLowerCase().includes(searchLower)) ||
        (r.uid && String(r.uid).includes(searchLower)) ||
        (r.leaderIgn && r.leaderIgn.toLowerCase().includes(searchLower)) ||
        (r.phone && String(r.phone).includes(searchLower)) ||
        (Array.isArray(r.players) && r.players.some(p => p.ign?.toLowerCase().includes(searchLower) || String(p.uid).includes(searchLower)));
      return matchesFormat && matchesSearch;
    });
  };

  // Render Table Component for Registrations
  const renderRegistrationsTable = (list, tourneyContextId = null) => {
    if (!list || list.length === 0) {
      return (
        <div className="empty-state-box" style={{ padding: '36px 20px', textAlign: 'center' }}>
          <Users size={36} className="text-muted" style={{ display: 'block', margin: '0 auto 8px' }} />
          <p style={{ margin: 0, color: '#94a3b8' }}>No players or teams registered under this criteria.</p>
        </div>
      );
    }

    return (
      <div className="table-responsive">
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Format</th>
              <th>Team / Player Name</th>
              <th>Captain / Leader</th>
              <th>Roster (Squad Members)</th>
              <th>WhatsApp Phone</th>
              <th>Registered At</th>
              <th>Ticket Cost</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((p, idx) => {
              const isSquad = p.type === 'squad';
              const isDuo = p.type === 'duo';
              const cleanPhone = (p.phone || '').replace(/\D/g, '');

              return (
                <tr key={p.id}>
                  <td>{idx + 1}</td>
                  <td>
                    <span className={`format-badge ${isSquad ? 'format-squad' : isDuo ? 'format-duo' : 'format-solo'}`}>
                      {isSquad ? '⚔️ SQUAD' : isDuo ? '👥 DUO' : '🏆 SOLO'}
                    </span>
                  </td>
                  <td>
                    <strong>{p.teamName || p.ign || 'Solo Player'}</strong>
                    {p.discord && <div className="text-muted text-xs">Tag: {p.discord}</div>}
                  </td>
                  <td>
                    <div><strong>{p.leaderIgn || p.ign}</strong></div>
                    <code className="uid-badge">{p.leaderUid || p.uid}</code>
                  </td>
                  <td>
                    {Array.isArray(p.players) && p.players.length > 1 ? (
                      <div className="roster-pills-wrap">
                        {p.players.map((mem, mIdx) => (
                          <div key={mIdx} className="roster-pill">
                            <span>
                              <span className="rp-role">{mem.role || `P${mIdx + 1}`}:</span> {mem.ign}
                            </span>
                            <span className="rp-uid">{mem.uid}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-muted text-xs">Single Player (UID: {p.uid})</span>
                    )}
                  </td>
                  <td>
                    {cleanPhone ? (
                      <a 
                        href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(p.leaderIgn || p.ign)}!%20Here%20is%20your%20Tournament%20Custom%20Room%20ID%20%26%20Password:`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="wa-contact-btn"
                        title="Send Room ID & Password via WhatsApp"
                      >
                        <MessageSquare size={13} />
                        <span>+91 {cleanPhone}</span>
                      </a>
                    ) : (
                      <span className="text-muted text-xs">N/A</span>
                    )}
                  </td>
                  <td className="text-muted text-xs">{p.registeredAt}</td>
                  <td><span className="ticket-pill">{p.ticketUsed || (isSquad ? '4x Tickets' : '1x Ticket')}</span></td>
                  <td>
                    <button 
                      className="btn-danger-sm"
                      onClick={() => {
                        const targetTourneyId = tourneyContextId || p.tournamentId;
                        const targetName = p.teamName || p.ign;
                        if (window.confirm(`Disqualify/Remove "${targetName}" from tournament?`)) {
                          removeTournamentParticipant(targetTourneyId, p.id);
                          if (viewingParticipantsTourney) {
                            setViewingParticipantsTourney({
                              ...viewingParticipantsTourney,
                              participants: viewingParticipantsTourney.participants.filter(item => item.id !== p.id)
                            });
                          }
                        }
                      }}
                      title="Disqualify or remove from bracket"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const activeTourneyForRegistrations = tournaments.find(t => String(t.id) === String(selectedTourneyId)) || tournaments[0];

  return (
    <div className="admin-tournaments-page fade-in">
      {/* Copied UIDs Toast notification */}
      {copiedToast && (
        <div className="winner-announcement-banner glass-card" style={{ borderColor: '#6366f1', background: 'rgba(99, 102, 241, 0.15)' }}>
          <div className="w-icon-wrap" style={{ background: 'rgba(99, 102, 241, 0.25)' }}>
            <Check size={24} color="#818cf8" />
          </div>
          <div className="w-info">
            <h4 style={{ color: '#818cf8' }}>📋 UIDs Copied!</h4>
            <p>{copiedToast}</p>
          </div>
          <button className="modal-close-btn" onClick={() => setCopiedToast('')}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Action Bar */}
      <div className="admin-subpage-header">
        <div>
          <h2>🏆 Tournament Operations Manager</h2>
          <p className="subpage-desc">Create custom tournaments, view participant rosters &amp; registrations tournament-by-tournament, and declare winners.</p>
        </div>
        <button className="admin-btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Create New Tournament
        </button>
      </div>

      {/* Main Switcher: Tournaments vs Master Registrations */}
      <div className="admin-subtabs-nav">
        <button 
          className={`subtab-btn ${adminTab === 'tournaments' ? 'active' : ''}`}
          onClick={() => setAdminTab('tournaments')}
        >
          <Trophy size={16} /> Tournaments Manager ({tournaments.length})
        </button>
        <button 
          className={`subtab-btn ${adminTab === 'registrations' ? 'active' : ''}`}
          onClick={() => setAdminTab('registrations')}
        >
          <Users size={16} /> Tournament Registrations &amp; Rosters ({allRegistrations.length})
        </button>
      </div>

      {/* ════════════ VIEW 1: TOURNAMENTS MANAGER ════════════ */}
      {adminTab === 'tournaments' && (
        <div className="fade-in">
          {/* Filter and Search Bar */}
          <div className="admin-toolbar glass-card">
            <div className="search-box">
              <Search size={16} className="search-icon" />
              <input 
                type="text" 
                placeholder="Search tournament title, map, or mode..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <button 
                className={`filter-tab ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                All Tournaments ({tournaments.length})
              </button>
              <button 
                className={`filter-tab ${filterMode === 'cs' ? 'active' : ''}`}
                onClick={() => setFilterMode('cs')}
              >
                Clash Squad (CS)
              </button>
              <button 
                className={`filter-tab ${filterMode === 'br' ? 'active' : ''}`}
                onClick={() => setFilterMode('br')}
              >
                Battle Royale (BR)
              </button>
            </div>
          </div>

          {/* Tournaments Grid */}
          <div className="admin-tourney-grid">
            {filteredTournaments.map(tourney => {
              const participantCount = tourney.participants?.length || 0;
              const isSquad = (tourney.mode || '').toLowerCase().includes('squad');

              return (
                <div key={tourney.id} className={`admin-tourney-card glass-card status-border-${tourney.status}`}>
                  <div className="at-card-banner">
                    <img 
                      src={tourney.image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop'} 
                      alt={tourney.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop';
                      }}
                    />
                    <div className="at-banner-overlay"></div>
                    <div className="at-banner-badges">
                      <span className={`status-pill status-${tourney.status}`}>
                        {tourney.status.toUpperCase()}
                      </span>
                      <span className="mode-pill">{tourney.mode}</span>
                    </div>
                    <div className="at-banner-prize">{tourney.prize}</div>
                  </div>

                  <div className="at-card-body">
                    <h3 className="at-title">{tourney.title}</h3>
                    <div className="at-meta-row">
                      <span>📅 {tourney.date}</span>
                      <span>🗺️ {tourney.map}</span>
                    </div>

                    <div className="at-slots-bar">
                      <div className="at-slots-info">
                        <span>Registration Slots</span>
                        <strong>{tourney.slots}</strong>
                      </div>
                      <div className="progress-track">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${Math.min(100, ((participantCount) / (tourney.maxSlots || 16)) * 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Entry fee preview */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '8px 0', fontSize: '0.78rem', color: '#94a3b8' }}>
                      <span>Entry Fee:</span>
                      <span className="ticket-pill">
                        {isSquad ? `4x ${tourney.ticketType} Tickets (Squad)` : `${tourney.ticketCost || 1}x ${tourney.ticketType} Ticket`}
                      </span>
                    </div>

                    {/* Quick Status Toggle Row */}
                    <div className="at-status-toggle-bar">
                      <span className="status-label">Status:</span>
                      <div className="status-btn-group">
                        <button 
                          className={`status-toggle-btn ${tourney.status === 'open' ? 'selected open' : ''}`}
                          onClick={() => toggleTournamentStatus(tourney.id, 'open')}
                          title="Open Registration"
                        >
                          Open
                        </button>
                        <button 
                          className={`status-toggle-btn ${tourney.status === 'closed' ? 'selected closed' : ''}`}
                          onClick={() => toggleTournamentStatus(tourney.id, 'closed')}
                          title="Close Registration"
                        >
                          Close
                        </button>
                        <button 
                          className={`status-toggle-btn ${tourney.status === 'ongoing' ? 'selected ongoing' : ''}`}
                          onClick={() => toggleTournamentStatus(tourney.id, 'ongoing')}
                          title="Mark as Ongoing"
                        >
                          Live
                        </button>
                        <button 
                          className={`status-toggle-btn ${tourney.status === 'completed' ? 'selected completed' : ''}`}
                          onClick={() => toggleTournamentStatus(tourney.id, 'completed')}
                          title="Mark as Completed"
                        >
                          Done
                        </button>
                      </div>
                    </div>

                    {/* Winners preview if declared */}
                    {tourney.results?.winnersDeclared && (
                      <div className="winner-declared-box">
                        <Award size={15} className="text-gold" />
                        <span>Winner: <strong>{tourney.results.firstPlace?.ign || 'Declared'}</strong> ({tourney.results.prizeDistributionStatus})</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="at-card-footer">
                    <button 
                      className="at-action-btn view-participants"
                      onClick={() => setViewingParticipantsTourney(tourney)}
                      title="View registered player/squad details for this tournament"
                    >
                      <Users size={14} /> Registrations ({participantCount})
                    </button>
                    <button 
                      className="at-action-btn results"
                      onClick={() => openResultsModal(tourney)}
                      title="Manage Winners &amp; Prize Distribution"
                    >
                      <Award size={14} /> Results
                    </button>
                    <button 
                      className="at-action-btn edit"
                      onClick={() => openEditModal(tourney)}
                      title="Edit details"
                    >
                      <Edit size={14} />
                    </button>
                    <button 
                      className="at-action-btn delete"
                      onClick={() => setDeletingTourney(tourney)}
                      title="Delete tournament"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ════════════ VIEW 2: TOURNAMENT-BY-TOURNAMENT REGISTRATIONS ════════════ */}
      {adminTab === 'registrations' && (
        <div className="fade-in">
          {/* Summary Stats Cards */}
          <div className="reg-stats-grid">
            <div className="reg-stat-card">
              <div className="reg-stat-icon icon-teams">
                <Users size={22} />
              </div>
              <div className="reg-stat-info">
                <h4>{allRegistrations.length}</h4>
                <span>Total Registrations</span>
              </div>
            </div>

            <div className="reg-stat-card">
              <div className="reg-stat-icon icon-squads">
                <Shield size={22} />
              </div>
              <div className="reg-stat-info">
                <h4>{allRegistrations.filter(r => r.type === 'squad').length}</h4>
                <span>Squad Teams (4-Player)</span>
              </div>
            </div>

            <div className="reg-stat-card">
              <div className="reg-stat-icon icon-solos">
                <Trophy size={22} />
              </div>
              <div className="reg-stat-info">
                <h4>{allRegistrations.filter(r => r.type === 'solo').length}</h4>
                <span>Solo Players</span>
              </div>
            </div>

            <div className="reg-stat-card">
              <div className="reg-stat-icon icon-tourneys">
                <Flame size={22} />
              </div>
              <div className="reg-stat-info">
                <h4>{tournaments.filter(t => (t.participants || []).length > 0).length}</h4>
                <span>Tournaments with Teams</span>
              </div>
            </div>
          </div>

          {/* Tournament Selection Scroller Tabs (Select One Tournament at a Time) */}
          <div style={{ marginBottom: '12px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Select Tournament:
            </span>
          </div>

          <div className="tourney-tabs-scroller">
            {tournaments.map(t => {
              const pCount = t.participants?.length || 0;
              const isActive = String(selectedTourneyId) === String(t.id);
              return (
                <button
                  key={t.id}
                  className={`tourney-tab-item ${isActive ? 'active' : ''}`}
                  onClick={() => setSelectedTourneyId(t.id)}
                >
                  <Trophy size={15} />
                  <span>{t.title}</span>
                  <span className="tourney-tab-badge">{pCount}</span>
                </button>
              );
            })}
            <button
              className={`tourney-tab-item ${selectedTourneyId === 'all_grouped' ? 'active' : ''}`}
              onClick={() => setSelectedTourneyId('all_grouped')}
            >
              <Users size={15} />
              <span>📂 View All (Grouped)</span>
              <span className="tourney-tab-badge">{allRegistrations.length}</span>
            </button>
          </div>

          {/* MODE A: Single Isolated Tournament Dashboard */}
          {selectedTourneyId !== 'all_grouped' && activeTourneyForRegistrations && (
            <div className="single-tourney-dashboard fade-in">
              <div className="std-header">
                <div className="std-header-left">
                  <img 
                    src={activeTourneyForRegistrations.image || 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop'} 
                    alt="Tournament" 
                    className="std-thumb"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?q=80&w=1470&auto=format&fit=crop';
                    }}
                  />
                  <div>
                    <h3 className="std-title">{activeTourneyForRegistrations.title}</h3>
                    <div className="std-meta">
                      <span className="mode-pill">{activeTourneyForRegistrations.mode}</span>
                      <span>📅 {activeTourneyForRegistrations.date}</span>
                      <span>🗺️ {activeTourneyForRegistrations.map}</span>
                      <span className="text-gold font-bold">🏆 {activeTourneyForRegistrations.prize}</span>
                      <span>🎟️ Entry: {activeTourneyForRegistrations.mode.includes('Squad') ? `4x ${activeTourneyForRegistrations.ticketType} Tickets` : `${activeTourneyForRegistrations.ticketCost || 1}x ${activeTourneyForRegistrations.ticketType}`}</span>
                    </div>
                  </div>
                </div>

                <div className="std-header-actions">
                  <button 
                    className="copy-uids-btn"
                    onClick={() => copyUidsList(activeTourneyForRegistrations.participants || [])}
                    title="Copy all player Free Fire UIDs for this tournament"
                  >
                    <Copy size={13} /> Copy UIDs ({activeTourneyForRegistrations.participants?.length || 0})
                  </button>
                  <button 
                    className="admin-btn btn-secondary btn-xs"
                    onClick={() => openEditModal(activeTourneyForRegistrations)}
                  >
                    <Edit size={13} /> Edit Tourney
                  </button>
                </div>
              </div>

              <div className="std-body">
                {/* Search & format filter row inside this tournament */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px', flexWrap: 'wrap' }}>
                  <div className="search-box" style={{ maxWidth: '420px', margin: 0 }}>
                    <Search size={15} className="search-icon" />
                    <input 
                      type="text" 
                      placeholder="Search player IGN, Free Fire UID, Team Name, Phone in this tournament..."
                      value={regSearchTerm}
                      onChange={e => setRegSearchTerm(e.target.value)}
                    />
                  </div>

                  <div className="section-filter-bar" style={{ margin: 0 }}>
                    <button 
                      className={`filter-chip ${regFormatFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setRegFormatFilter('all')}
                    >
                      All ({activeTourneyForRegistrations.participants?.length || 0})
                    </button>
                    <button 
                      className={`filter-chip ${regFormatFilter === 'squad' ? 'active' : ''}`}
                      onClick={() => setRegFormatFilter('squad')}
                    >
                      ⚔️ Squads
                    </button>
                    <button 
                      className={`filter-chip ${regFormatFilter === 'solo' ? 'active' : ''}`}
                      onClick={() => setRegFormatFilter('solo')}
                    >
                      🏆 Solo
                    </button>
                  </div>
                </div>

                {/* Table for this isolated tournament */}
                {renderRegistrationsTable(
                  filterParticipantList(activeTourneyForRegistrations.participants || []),
                  activeTourneyForRegistrations.id
                )}
              </div>
            </div>
          )}

          {/* MODE B: Grouped View (Every tournament in its own separate box, never mixed) */}
          {selectedTourneyId === 'all_grouped' && (
            <div className="fade-in">
              {tournaments.map(tourney => {
                const tourneyParticipants = filterParticipantList(tourney.participants || []);
                return (
                  <div key={tourney.id} className="grouped-tourney-box">
                    <div className="std-header">
                      <div className="std-header-left">
                        <img src={tourney.image} alt="Tournament" className="std-thumb" />
                        <div>
                          <h3 className="std-title">{tourney.title}</h3>
                          <div className="std-meta">
                            <span className="mode-pill">{tourney.mode}</span>
                            <span>📅 {tourney.date}</span>
                            <span className="text-gold font-bold">🏆 {tourney.prize}</span>
                            <span className="text-muted">Slots: {tourney.slots}</span>
                          </div>
                        </div>
                      </div>

                      <div className="std-header-actions">
                        <button 
                          className="copy-uids-btn"
                          onClick={() => copyUidsList(tourney.participants || [])}
                          title="Copy all player Free Fire UIDs for this tournament"
                        >
                          <Copy size={13} /> Copy UIDs ({tourney.participants?.length || 0})
                        </button>
                        <button 
                          className="admin-btn btn-secondary btn-xs"
                          onClick={() => setSelectedTourneyId(tourney.id)}
                        >
                          View Only This Tourney →
                        </button>
                      </div>
                    </div>

                    <div className="std-body">
                      {renderRegistrationsTable(tourneyParticipants, tourney.id)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL 1: Create / Edit Tournament ──────────────────────────────── */}
      {showCreateModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>{editingTourney ? '✏️ Edit Tournament Details' : '🏆 Create New Tournament'}</h3>
              <button className="modal-close-btn" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveTournament} className="modal-form">
              <div className="form-group">
                <label>Tournament Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  placeholder="e.g. CLASH SQUAD WEEKEND CUP"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Date &amp; Time Schedule</label>
                  <input 
                    type="text" 
                    value={formData.date} 
                    onChange={e => setFormData({ ...formData, date: e.target.value })} 
                    placeholder="e.g. Sunday, 8:00 PM IST"
                  />
                </div>
                <div className="form-group">
                  <label>Prize Pool Description *</label>
                  <input 
                    type="text" 
                    required
                    value={formData.prize} 
                    onChange={e => setFormData({ ...formData, prize: e.target.value })} 
                    placeholder="e.g. ₹25,000 + 5,000 Diamonds"
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Tournament Mode</label>
                  <select 
                    value={formData.mode} 
                    onChange={e => {
                      const newMode = e.target.value;
                      const isSq = newMode.toLowerCase().includes('squad') || newMode.toLowerCase().includes('cs');
                      setFormData({ 
                        ...formData, 
                        mode: newMode,
                        ticketCost: isSq ? 4 : 1
                      });
                    }}
                  >
                    <option value="Squad (CS)">Squad (CS 4v4) — 4 Tickets</option>
                    <option value="Squad (BR)">Squad (BR 48 Teams) — 4 Tickets</option>
                    <option value="Solo (CS)">Solo (CS 1v1) — 1 Ticket</option>
                    <option value="Solo (BR)">Solo (BR 48 Players) — 1 Ticket</option>
                    <option value="Duo (BR)">Duo (BR 2v2) — 2 Tickets</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Map</label>
                  <input 
                    type="text" 
                    value={formData.map} 
                    onChange={e => setFormData({ ...formData, map: e.target.value })} 
                    placeholder="e.g. Bermuda / Kalahari"
                  />
                </div>
                <div className="form-group">
                  <label>Max Slots (Teams/Players)</label>
                  <input 
                    type="number" 
                    min="2"
                    max="100"
                    value={formData.maxSlots} 
                    onChange={e => setFormData({ ...formData, maxSlots: e.target.value })} 
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                  >
                    <option value="open">Open for Registration</option>
                    <option value="closed">Closed</option>
                    <option value="ongoing">Live / In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Ticket Type</label>
                  <select 
                    value={formData.ticketType} 
                    onChange={e => setFormData({ ...formData, ticketType: e.target.value })}
                  >
                    <option value="CS">Clash Squad (CS Ticket)</option>
                    <option value="BR">Battle Royale (BR Ticket)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Tickets Required {formData.mode.includes('Squad') ? '(4 Tickets for Squad)' : ''}</label>
                  <input 
                    type="number" 
                    min="1"
                    max="10"
                    value={formData.ticketCost} 
                    onChange={e => setFormData({ ...formData, ticketCost: e.target.value })} 
                  />
                </div>
              </div>

              <ImageUploadField
                label="Banner Image"
                value={formData.image}
                onChange={(val) => setFormData({ ...formData, image: val })}
              />

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows="2"
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>

              <div className="form-group">
                <label>Rules &amp; Regulations</label>
                <textarea 
                  rows="2"
                  value={formData.rules} 
                  onChange={e => setFormData({ ...formData, rules: e.target.value })} 
                  placeholder="e.g. Gun properties OFF, PC/Emulators allowed or banned, No character skills..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingTourney ? 'Update Tournament' : 'Create Tournament'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Participants Viewer Drawer ────────────────────────────── */}
      {viewingParticipantsTourney && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card participants-modal">
            <div className="modal-header">
              <div>
                <h3>👥 Registered Participants &amp; Teams</h3>
                <p className="modal-sub">
                  {viewingParticipantsTourney.title} ({viewingParticipantsTourney.mode})
                </p>
              </div>
              <div className="modal-header-actions">
                <button 
                  className="copy-uids-btn"
                  onClick={() => copyUidsList(viewingParticipantsTourney.participants || [])}
                  title="Copy all player UIDs for custom room invite"
                >
                  <Copy size={13} /> Copy All Free Fire UIDs
                </button>
                <button 
                  className="admin-btn btn-secondary btn-xs"
                  onClick={() => {
                    setSelectedTourneyId(viewingParticipantsTourney.id);
                    setViewingParticipantsTourney(null);
                    setAdminTab('registrations');
                  }}
                  title="Open in full dashboard"
                >
                  <ExternalLink size={12} /> Full Page View
                </button>
                <button className="modal-close-btn" onClick={() => setViewingParticipantsTourney(null)}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="participants-content" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
              {renderRegistrationsTable(viewingParticipantsTourney.participants || [], viewingParticipantsTourney.id)}
            </div>

            <div className="modal-actions">
              <button className="admin-btn btn-secondary" onClick={() => setViewingParticipantsTourney(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Results & Prize Distribution ──────────────────────────── */}
      {resultsTourney && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <div>
                <h3>🏆 Declare Winners &amp; Prize Distribution</h3>
                <p className="modal-sub">{resultsTourney.title}</p>
              </div>
              <button className="modal-close-btn" onClick={() => setResultsTourney(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveResults} className="modal-form">
              {/* 1st Place */}
              <div className="results-rank-box gold">
                <h4>🥇 1st Place (Champion)</h4>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Player / Team IGN</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Total_Gaming"
                      value={resultsForm.firstIgn}
                      onChange={e => setResultsForm({ ...resultsForm, firstIgn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Fire UID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 849204812"
                      value={resultsForm.firstUid}
                      onChange={e => setResultsForm({ ...resultsForm, firstUid: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prize Rewarded</label>
                    <input 
                      type="text" 
                      value={resultsForm.firstPrize}
                      onChange={e => setResultsForm({ ...resultsForm, firstPrize: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 2nd Place */}
              <div className="results-rank-box silver">
                <h4>🥈 2nd Place (Runner Up)</h4>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Player / Team IGN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. GodL_Shadow"
                      value={resultsForm.secondIgn}
                      onChange={e => setResultsForm({ ...resultsForm, secondIgn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Fire UID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 741289301"
                      value={resultsForm.secondUid}
                      onChange={e => setResultsForm({ ...resultsForm, secondUid: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prize Rewarded</label>
                    <input 
                      type="text" 
                      value={resultsForm.secondPrize}
                      onChange={e => setResultsForm({ ...resultsForm, secondPrize: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* 3rd Place */}
              <div className="results-rank-box bronze">
                <h4>🥉 3rd Place</h4>
                <div className="form-row-3">
                  <div className="form-group">
                    <label>Player / Team IGN</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Soul_Army"
                      value={resultsForm.thirdIgn}
                      onChange={e => setResultsForm({ ...resultsForm, thirdIgn: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Free Fire UID</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 912384712"
                      value={resultsForm.thirdUid}
                      onChange={e => setResultsForm({ ...resultsForm, thirdUid: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Prize Rewarded</label>
                    <input 
                      type="text" 
                      value={resultsForm.thirdPrize}
                      onChange={e => setResultsForm({ ...resultsForm, thirdPrize: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Prize Distribution Status */}
              <div className="form-group">
                <label>Prize Distribution Status</label>
                <select 
                  value={resultsForm.prizeDistributionStatus}
                  onChange={e => setResultsForm({ ...resultsForm, prizeDistributionStatus: e.target.value })}
                >
                  <option value="Pending">Pending Verification</option>
                  <option value="Processing">Processing via UID Top-Up / UPI</option>
                  <option value="Distributed">Distributed (Completed)</option>
                </select>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setResultsTourney(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  Publish Results &amp; Complete Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 4: Custom In-App Delete Confirmation Modal ──────────────── */}
      {deletingTourney && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card" style={{ maxWidth: '440px', padding: '24px' }}>
            <div className="modal-header" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ color: '#ef4444', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', margin: 0 }}>
                <AlertTriangle size={20} color="#ef4444" /> Delete Tournament
              </h3>
              <button 
                type="button" 
                className="modal-close-btn" 
                onClick={() => setDeletingTourney(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>
            
            <div style={{ color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '20px' }}>
              Are you sure you want to delete <strong>"{deletingTourney.title}"</strong>?
              <div style={{ 
                marginTop: '12px', 
                padding: '10px 14px', 
                background: 'rgba(239, 68, 68, 0.1)', 
                border: '1px solid rgba(239, 68, 68, 0.3)', 
                borderRadius: '8px', 
                color: '#f87171', 
                fontSize: '0.85rem' 
              }}>
                ⚠️ This will permanently remove this tournament from both the Admin Panel and the public Esports website.
              </div>
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                type="button" 
                className="admin-btn btn-secondary" 
                onClick={() => setDeletingTourney(null)}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="admin-btn btn-danger" 
                style={{ 
                  background: '#ef4444', 
                  color: '#ffffff', 
                  border: 'none', 
                  padding: '9px 18px', 
                  borderRadius: '8px', 
                  cursor: 'pointer', 
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onClick={() => {
                  deleteTournament(deletingTourney.id);
                  setDeletingTourney(null);
                }}
              >
                <Trash2 size={16} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournaments;
