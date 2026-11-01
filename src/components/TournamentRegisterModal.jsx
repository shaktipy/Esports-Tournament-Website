import { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Users, Shield, CheckCircle2, AlertCircle, 
  X, Phone, User, Hash, Ticket, MessageSquare, Flame, Dices, XCircle
} from 'lucide-react';
import { 
  getTournamentTotalSlots, 
  getAvailableSlots, 
  getOccupiedSlotNumbers,
  assignRandomSlot
} from '../utils/tournamentSlots';
import './TournamentRegisterModal.css';

const TournamentRegisterModal = ({ 
  tournament, 
  isOpen, 
  onClose, 
  onSuccessRegister,
  user,
  userTickets = 0
}) => {
  if (!isOpen || !tournament) return null;

  const modeLower = (tournament.mode || '').toLowerCase();
  const isSquad = modeLower.includes('squad') || modeLower.includes('4v4') || (modeLower.includes('cs') && !modeLower.includes('solo'));
  const isDuo = modeLower.includes('duo') || modeLower.includes('2v2');
  const isSolo = (!isSquad && !isDuo) || modeLower.includes('solo') || modeLower.includes('1v1');

  // Disqualification check
  const isDisqualified = Array.isArray(tournament.disqualifiedParticipants) && tournament.disqualifiedParticipants.some(d => {
    const dUids = (d.uids || [d.uid, d.leaderUid]).filter(Boolean).map(String);
    const dIgns = (d.igns || [d.ign, d.leaderIgn]).filter(Boolean).map(i => i.toLowerCase());
    const userUidMatch = user?.uid && dUids.includes(String(user.uid));
    const userIgnMatch = user?.inGameName && dIgns.includes(user.inGameName.toLowerCase());
    return userUidMatch || userIgnMatch;
  });
  const disqRecord = isDisqualified ? (tournament.disqualifiedParticipants || []).find(d => {
    const dUids = (d.uids || [d.uid, d.leaderUid]).filter(Boolean).map(String);
    const dIgns = (d.igns || [d.ign, d.leaderIgn]).filter(Boolean).map(i => i.toLowerCase());
    return (user?.uid && dUids.includes(String(user.uid))) || (user?.inGameName && dIgns.includes(user.inGameName.toLowerCase()));
  }) : null;

  // Slot calculations
  const totalSlots = getTournamentTotalSlots(tournament);
  const availableSlots = getAvailableSlots(tournament);
  const occupiedSlots = getOccupiedSlotNumbers(tournament.participants);
  const isSlotsFull = availableSlots.length === 0;

  // Solo Form State - start empty with clean placeholders
  const [soloForm, setSoloForm] = useState({
    ign: '',
    uid: '',
    phone: '',
    discord: ''
  });

  // Squad Form State - start empty with clean placeholders
  const [squadForm, setSquadForm] = useState({
    teamName: '',
    leaderIgn: '',
    leaderUid: '',
    leaderPhone: '',
    player2Ign: '',
    player2Uid: '',
    player3Ign: '',
    player3Uid: '',
    player4Ign: '',
    player4Uid: '',
    subIgn: '',
    subUid: ''
  });

  // Duo Form State - start empty with clean placeholders
  const [duoForm, setDuoForm] = useState({
    teamName: '',
    leaderIgn: '',
    leaderUid: '',
    leaderPhone: '',
    player2Ign: '',
    player2Uid: ''
  });

  const [agreedToRules, setAgreedToRules] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Squad = 4 tickets (4 players), Duo = 2 tickets, Solo = 1 ticket
  const requiredTickets = isSquad ? 4 : (isDuo ? 2 : (Number(tournament.ticketCost) || 1));
  const ticketType = tournament.ticketType || 'CS';
  const hasEnoughTickets = Number(userTickets) >= requiredTickets;

  // Track tournament ID to ONLY reset form when switching to a different tournament
  const activeTourneyIdRef = useRef(null);

  useEffect(() => {
    if (tournament?.id && tournament.id !== activeTourneyIdRef.current) {
      activeTourneyIdRef.current = tournament.id;
      setRegisteredSuccess(false);
      setSubmittedData(null);
      setErrorMsg('');
      setAgreedToRules(true);
      setSoloForm({ 
        ign: '', 
        uid: '', 
        phone: '', 
        discord: '' 
      });
      setSquadForm({
        teamName: '',
        leaderIgn: '',
        leaderUid: '',
        leaderPhone: '',
        player2Ign: '',
        player2Uid: '',
        player3Ign: '',
        player3Uid: '',
        player4Ign: '',
        player4Uid: '',
        subIgn: '',
        subUid: ''
      });
      setDuoForm({
        teamName: '',
        leaderIgn: '',
        leaderUid: '',
        leaderPhone: '',
        player2Ign: '',
        player2Uid: ''
      });
    }
  }, [tournament?.id]);

  const handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setErrorMsg('');

    // 1. Slots availability check
    if (isSlotsFull || availableSlots.length === 0) {
      setErrorMsg('Cannot register: All tournament slots are currently full.');
      return;
    }

    // 2. Real ticket balance check
    if (!hasEnoughTickets) {
      setErrorMsg(`Insufficient tickets! You need ${requiredTickets} ${ticketType} tickets to register, but you currently have ${userTickets || 0}.`);
      return;
    }

    // 3. Fair play agreement check
    if (!agreedToRules) {
      setErrorMsg('You must agree to the tournament fair-play regulations before registering.');
      return;
    }

    // 4. Disqualification check
    if (isDisqualified) {
      setErrorMsg(`Cannot register: You were disqualified from this tournament by the admin. Reason: ${disqRecord?.reason || 'Fair-play regulation violation'}`);
      return;
    }

    // Helpers
    const isValidPhone = (p) => /^[6-9]\d{9}$/.test(p);
    const isValidUid = (u) => /^\d{6,14}$/.test(u);

    const existingParticipants = Array.isArray(tournament.participants) ? tournament.participants : [];
    const getTournamentRegisteredUids = () => {
      const uids = new Set();
      existingParticipants.forEach(p => {
        if (p.uid) uids.add(String(p.uid));
        if (p.leaderUid) uids.add(String(p.leaderUid));
        if (Array.isArray(p.players)) {
          p.players.forEach(m => {
            if (m.uid) uids.add(String(m.uid));
          });
        }
      });
      return uids;
    };
    const registeredUidsSet = getTournamentRegisteredUids();

    let payload = {};

    if (isSolo) {
      const playerIgn = soloForm.ign.trim();
      const playerUid = soloForm.uid.trim();
      const playerPhone = soloForm.phone.trim();

      if (!playerIgn) {
        setErrorMsg('Please enter your Free Fire In-Game Name (IGN).');
        return;
      }
      if (playerIgn.length < 3) {
        setErrorMsg('Free Fire IGN must be at least 3 characters long.');
        return;
      }
      if (!playerUid) {
        setErrorMsg('Please enter your Free Fire UID (Account ID).');
        return;
      }
      if (!isValidUid(playerUid)) {
        setErrorMsg('Free Fire UID must be a valid numeric ID (6 to 14 digits).');
        return;
      }
      if (!playerPhone) {
        setErrorMsg('Please enter your 10-digit WhatsApp number to receive room ID & password.');
        return;
      }
      if (!isValidPhone(playerPhone)) {
        setErrorMsg('Please enter a valid 10-digit WhatsApp mobile number (starting with 6, 7, 8, or 9).');
        return;
      }
      if (registeredUidsSet.has(playerUid)) {
        setErrorMsg(`Free Fire UID ${playerUid} is already registered in this tournament.`);
        return;
      }

      payload = {
        type: 'solo',
        teamName: playerIgn,
        ign: playerIgn,
        uid: playerUid,
        leaderIgn: playerIgn,
        leaderUid: playerUid,
        phone: playerPhone,
        discord: soloForm.discord.trim(),
        players: [
          { role: 'Solo Player', ign: playerIgn, uid: playerUid }
        ],
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Ticket`
      };
    } else if (isDuo) {
      const team = duoForm.teamName.trim();
      const capIgn = duoForm.leaderIgn.trim();
      const capUid = duoForm.leaderUid.trim();
      const capPhone = duoForm.leaderPhone.trim();
      const p2Ign = duoForm.player2Ign.trim();
      const p2Uid = duoForm.player2Uid.trim();

      if (!team) {
        setErrorMsg('Please enter your Duo Team Name.');
        return;
      }
      if (!capIgn || capIgn.length < 3) {
        setErrorMsg('Please enter Player 1 / Leader IGN (at least 3 characters).');
        return;
      }
      if (!capUid || !isValidUid(capUid)) {
        setErrorMsg('Please enter a valid numeric UID for Player 1 (6 to 14 digits).');
        return;
      }
      if (!capPhone || !isValidPhone(capPhone)) {
        setErrorMsg('Please enter a valid 10-digit WhatsApp number for Captain.');
        return;
      }
      if (!p2Ign || p2Ign.length < 3) {
        setErrorMsg('Please enter Player 2 IGN (at least 3 characters).');
        return;
      }
      if (!p2Uid || !isValidUid(p2Uid)) {
        setErrorMsg('Please enter a valid numeric UID for Player 2 (6 to 14 digits).');
        return;
      }
      if (capUid === p2Uid) {
        setErrorMsg('Player 1 UID and Player 2 UID cannot be the same! Each player must have a unique UID.');
        return;
      }
      if (registeredUidsSet.has(capUid)) {
        setErrorMsg(`Player 1 UID ${capUid} is already registered in this tournament.`);
        return;
      }
      if (registeredUidsSet.has(p2Uid)) {
        setErrorMsg(`Player 2 UID ${p2Uid} is already registered in this tournament.`);
        return;
      }

      payload = {
        type: 'duo',
        teamName: team,
        ign: capIgn,
        uid: capUid,
        leaderIgn: capIgn,
        leaderUid: capUid,
        phone: capPhone,
        players: [
          { role: 'Captain / P1', ign: capIgn, uid: capUid },
          { role: 'Player 2', ign: p2Ign, uid: p2Uid }
        ],
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Tickets (2 Players)`
      };
    } else {
      // Squad
      const team = squadForm.teamName.trim();
      const capIgn = squadForm.leaderIgn.trim();
      const capUid = squadForm.leaderUid.trim();
      const capPhone = squadForm.leaderPhone.trim();
      const p2Ign = squadForm.player2Ign.trim();
      const p2Uid = squadForm.player2Uid.trim();
      const p3Ign = squadForm.player3Ign.trim();
      const p3Uid = squadForm.player3Uid.trim();
      const p4Ign = squadForm.player4Ign.trim();
      const p4Uid = squadForm.player4Uid.trim();
      const subIgn = squadForm.subIgn.trim();
      const subUid = squadForm.subUid.trim();

      if (!team) {
        setErrorMsg('Please enter your Squad / Team Name.');
        return;
      }
      if (!capIgn || capIgn.length < 3) {
        setErrorMsg('Please enter Captain IGN (at least 3 characters).');
        return;
      }
      if (!capUid || !isValidUid(capUid)) {
        setErrorMsg('Please enter a valid numeric UID for Captain (6 to 14 digits).');
        return;
      }
      if (!capPhone || !isValidPhone(capPhone)) {
        setErrorMsg('Please enter a valid 10-digit WhatsApp number for Captain.');
        return;
      }
      if (!p2Ign) {
        setErrorMsg('Please enter Player 2 IGN.');
        return;
      }
      if (!p2Uid || !isValidUid(p2Uid)) {
        setErrorMsg('Please enter a valid numeric UID for Player 2 (6 to 14 digits).');
        return;
      }
      if (!p3Ign) {
        setErrorMsg('Please enter Player 3 IGN.');
        return;
      }
      if (!p3Uid || !isValidUid(p3Uid)) {
        setErrorMsg('Please enter a valid numeric UID for Player 3 (6 to 14 digits).');
        return;
      }
      if (!p4Ign) {
        setErrorMsg('Please enter Player 4 IGN.');
        return;
      }
      if (!p4Uid || !isValidUid(p4Uid)) {
        setErrorMsg('Please enter a valid numeric UID for Player 4 (6 to 14 digits).');
        return;
      }

      const squadUids = [capUid, p2Uid, p3Uid, p4Uid];
      if (new Set(squadUids).size !== squadUids.length) {
        setErrorMsg('All squad player UIDs must be distinct. Duplicate UID detected in squad roster.');
        return;
      }

      if (subIgn || subUid) {
        if (!subIgn) {
          setErrorMsg('Please enter Substitute Player IGN or clear the substitute fields.');
          return;
        }
        if (!subUid || !isValidUid(subUid)) {
          setErrorMsg('Please enter a valid numeric UID for Substitute Player (6 to 14 digits).');
          return;
        }
        if (squadUids.includes(subUid)) {
          setErrorMsg('Substitute player UID cannot match any main squad player UID.');
          return;
        }
      }

      const allSquadUids = [...squadUids, ...(subUid ? [subUid] : [])];
      for (const u of allSquadUids) {
        if (registeredUidsSet.has(u)) {
          setErrorMsg(`Player UID ${u} is already registered in this tournament.`);
          return;
        }
      }

      const roster = [
        { role: 'Captain (P1)', ign: capIgn, uid: capUid },
        { role: 'Player 2', ign: p2Ign, uid: p2Uid },
        { role: 'Player 3', ign: p3Ign, uid: p3Uid },
        { role: 'Player 4', ign: p4Ign, uid: p4Uid },
      ];

      if (subIgn && subUid) {
        roster.push({ 
          role: 'Substitute', 
          ign: subIgn, 
          uid: subUid 
        });
      }

      payload = {
        type: 'squad',
        teamName: team,
        ign: capIgn,
        uid: capUid,
        leaderIgn: capIgn,
        leaderUid: capUid,
        phone: capPhone,
        players: roster,
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Tickets (4 Players)`
      };
    }

    // Check blacklist / disqualification on roster members
    const disqList = tournament.disqualifiedParticipants || [];
    const payloadUids = [payload.uid, payload.leaderUid, ...(payload.players || []).map(p => p.uid)].filter(Boolean).map(String);
    const payloadIgns = [payload.ign, payload.leaderIgn, ...(payload.players || []).map(p => p.ign)].filter(Boolean).map(i => i.toLowerCase());
    const rosterDisq = disqList.find(d => {
      const dUids = (d.uids || [d.uid, d.leaderUid]).filter(Boolean).map(String);
      const dIgns = (d.igns || [d.ign, d.leaderIgn]).filter(Boolean).map(i => i.toLowerCase());
      return payloadUids.some(u => dUids.includes(u)) || payloadIgns.some(i => dIgns.includes(i));
    });

    if (rosterDisq) {
      setErrorMsg(`Cannot register: Player/roster member (${rosterDisq.teamName || rosterDisq.ign}) is disqualified by the admin. Reason: ${rosterDisq.reason}`);
      return;
    }

    // Assign a valid random available slot number for the tournament
    const assignedSlot = assignRandomSlot(tournament);
    if (!assignedSlot) {
      setErrorMsg('No match slots available. This tournament is completely full.');
      return;
    }
    payload.slotNumber = assignedSlot;
    payload.slot = assignedSlot;

    try {
      let regResult = null;
      if (onSuccessRegister) {
        regResult = onSuccessRegister(payload);
      }
      const confirmedSlot = Number(regResult?.slotNumber || regResult?.slot) || assignedSlot;
      const finalData = { 
        ...payload, 
        ...(regResult || {}),
        slotNumber: confirmedSlot,
        slot: confirmedSlot
      };
      setSubmittedData(finalData);
      setRegisteredSuccess(true);
    } catch (err) {
      console.error('Registration failed:', err);
      setErrorMsg(err.message || 'Registration failed. Please check your tickets and try again.');
    }
  };

  const assignedSlotNum = Number(submittedData?.slotNumber || submittedData?.slot) || 1;

  return (
    <div className="treg-modal-overlay">
      <div className="treg-modal glass-card">
        {/* Header */}
        <div className="treg-header">
          <div className="treg-header-info">
            <span className={`treg-mode-badge ${isSquad ? 'mode-squad' : isDuo ? 'mode-duo' : 'mode-solo'}`}>
              {isSquad ? '⚔️ SQUAD FORMAT' : isDuo ? '👥 DUO FORMAT' : '🏆 SOLO FORMAT'}
            </span>
            <h3>Tournament Registration</h3>
            <p className="treg-tourney-title">{tournament.title}</p>
          </div>
          <button className="treg-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Success Screen */}
        {registeredSuccess ? (
          <div className="treg-success-view fade-in">
            <div className="treg-success-icon">
              <CheckCircle2 size={56} className="text-success" />
            </div>
            <h2>Registration Confirmed! 🎉</h2>
            <p className="treg-success-sub">
              Your registration is complete for <strong>{tournament.title}</strong>.
            </p>

            {/* Prominent Slot Reveal Badge */}
            <div className="treg-assigned-slot-hero">
              <div className="slot-hero-badge-tag">
                <Dices size={15} /> RANDOM SLOT ASSIGNED
              </div>
              <div className="slot-hero-number">
                SLOT #{assignedSlotNum}
              </div>
              <p className="slot-hero-caption">
                Free Fire Custom Room Slot <strong>#{assignedSlotNum}</strong> is officially reserved for your team.
              </p>
            </div>

            <div className="treg-success-summary-box">
              <div className="summary-row highlight-slot-row">
                <span>🎯 Match Room Slot:</span>
                <strong className="text-slot-gold">SLOT #{assignedSlotNum}</strong>
              </div>
              <div className="summary-row">
                <span>Registration Mode:</span>
                <strong>{submittedData?.type?.toUpperCase()}</strong>
              </div>
              <div className="summary-row">
                <span>{submittedData?.type === 'solo' ? 'Player IGN' : 'Team Name'}:</span>
                <strong>{submittedData?.teamName}</strong>
              </div>
              <div className="summary-row">
                <span>Captain / Player UID:</span>
                <code>{submittedData?.leaderUid}</code>
              </div>
              <div className="summary-row">
                <span>WhatsApp Contact:</span>
                <strong>{submittedData?.phone}</strong>
              </div>
              <div className="summary-row">
                <span>Entry Ticket Deducted:</span>
                <span className="text-gold font-bold">{submittedData?.ticketUsed}</span>
              </div>
            </div>

            <div className="treg-room-instructions">
              <AlertCircle size={20} className="text-warning flex-shrink-0" />
              <p>
                <strong>Room Entry Rule:</strong> Custom Room ID and Password will be sent to your WhatsApp (<code>{submittedData?.phone}</code>) 15 minutes before match start. You and your squad <strong>MUST sit in Slot #{assignedSlotNum}</strong> in the custom room lobby!
              </p>
            </div>

            <button className="treg-btn-primary" onClick={onClose}>
              Done & View Esports Arena
            </button>
          </div>
        ) : (
          /* Registration Form View with Fixed Footer */
          <form onSubmit={handleSubmit} noValidate className="treg-modal-form">
            <div className="treg-form-scroll">
            {/* Quick Tourney Info Banner */}
            <div className="treg-info-strip">
              <div className="info-strip-item">
                <span className="info-label">Schedule</span>
                <span className="info-val">📅 {tournament.date}</span>
              </div>
              <div className="info-strip-item">
                <span className="info-label">Map / Mode</span>
                <span className="info-val">🗺️ {tournament.map} ({tournament.mode})</span>
              </div>
              <div className="info-strip-item">
                <span className="info-label">Prize Pool</span>
                <span className="info-val text-gold">🏆 {tournament.prize}</span>
              </div>
              <div className="info-strip-item">
                <span className="info-label">Entry Fee</span>
                <span className="info-val font-bold">
                  🎫 {requiredTickets}x {ticketType} Tickets {isSquad ? '(4 Players)' : isDuo ? '(2 Players)' : ''}
                </span>
              </div>
            </div>

            {/* Ticket balance check strip */}
            <div className={`treg-ticket-status-bar ${hasEnoughTickets ? 'sufficient' : 'insufficient'}`}>
              <div className="ticket-bar-left">
                <Ticket size={18} />
                <span>
                  Your Balance: <strong>{userTickets} {ticketType} Tickets</strong> (Required: {requiredTickets})
                </span>
              </div>
              {hasEnoughTickets ? (
                <span className="ticket-status-tag ok">✅ Sufficient Tickets</span>
              ) : (
                <span className="ticket-status-tag low">⚠️ Need {requiredTickets - userTickets} More</span>
              )}
            </div>

            {/* Match Slot Status Strip */}
            <div className={`treg-slot-strip ${isSlotsFull ? 'strip-full' : 'strip-open'}`}>
              <div className="slot-strip-info">
                <div className="slot-strip-badge">
                  <Dices size={14} /> RANDOM SLOT SYSTEM
                </div>
                <div className="slot-strip-desc">
                  {isSlotsFull ? (
                    <span className="text-danger font-bold">⚠️ All slots full (0/{totalSlots} available). Registration closed.</span>
                  ) : (
                    <span>
                      <strong>{availableSlots.length} of {totalSlots} Slots Available</strong> • 1 random unoccupied slot will be assigned to you
                    </span>
                  )}
                </div>
              </div>
              <span className={`slot-count-tag ${isSlotsFull ? 'tag-full' : 'tag-open'}`}>
                {isSlotsFull ? 'FULL' : `${availableSlots.length} AVAILABLE`}
              </span>
            </div>

            {isDisqualified && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.25))',
                border: '1px solid rgba(239, 68, 68, 0.6)',
                borderRadius: '10px',
                padding: '12px 16px',
                color: '#fca5a5',
                fontSize: '0.84rem',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15)'
              }}>
                <XCircle size={24} className="text-danger flex-shrink-0" style={{ color: '#ef4444' }} />
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '0.9rem', marginBottom: '2px' }}>
                    🚫 Disqualified by Tournament Admin
                  </div>
                  <div>You have been removed from this tournament and cannot re-register.</div>
                  {disqRecord?.reason && (
                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#fecaca', fontWeight: 600 }}>
                      Reason: {disqRecord.reason}
                    </div>
                  )}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="treg-error-box fade-in">
                <AlertCircle size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* ══════════ SOLO REGISTRATION FORM ══════════ */}
            {isSolo && (
              <div className="treg-form-section">
                <h4 className="section-title">
                  <User size={16} /> Solo Player Details
                </h4>

                <div className="treg-field-grid-2">
                  <div className="treg-form-group">
                    <label>Free Fire In-Game Name (IGN) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Soul_Mortal99"
                      value={soloForm.ign}
                      onChange={e => setSoloForm({ ...soloForm, ign: e.target.value })}
                    />
                  </div>

                  <div className="treg-form-group">
                    <label>Free Fire UID (Account ID) *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 849204812"
                      value={soloForm.uid}
                      onChange={e => setSoloForm({ ...soloForm, uid: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <div className="treg-field-grid-2">
                  <div className="treg-form-group">
                    <label>WhatsApp Number (For Room ID &amp; Password) *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">+91</span>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="10-digit WhatsApp number"
                        value={soloForm.phone}
                        onChange={e => setSoloForm({ ...soloForm, phone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>

                  <div className="treg-form-group">
                    <label>Discord Tag / Clan Tag (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Gamer#1234 or [TEAM_XO]"
                      value={soloForm.discord}
                      onChange={e => setSoloForm({ ...soloForm, discord: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ DUO REGISTRATION FORM ══════════ */}
            {isDuo && (
              <div className="treg-form-section">
                <div className="treg-form-group full-width">
                  <label>Duo Team Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Thunder Duo"
                    value={duoForm.teamName}
                    onChange={e => setDuoForm({ ...duoForm, teamName: e.target.value })}
                  />
                </div>

                <h4 className="section-title mt-3">
                  <User size={16} /> Player 1 (Leader / Contact)
                </h4>
                <div className="treg-field-grid-2">
                  <div className="treg-form-group">
                    <label>Leader Free Fire IGN *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Soul_Mortal99"
                      value={duoForm.leaderIgn}
                      onChange={e => setDuoForm({ ...duoForm, leaderIgn: e.target.value })}
                    />
                  </div>
                  <div className="treg-form-group">
                    <label>Leader Free Fire UID *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. 849204812"
                      value={duoForm.leaderUid}
                      onChange={e => setDuoForm({ ...duoForm, leaderUid: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>
                <div className="treg-form-group" style={{ marginTop: '8px' }}>
                  <label>Leader WhatsApp Number (For Room ID &amp; Password) *</label>
                  <div className="input-with-prefix">
                    <span className="prefix">+91</span>
                    <input 
                      type="tel" 
                      required
                      maxLength={10}
                      placeholder="10-digit WhatsApp number"
                      value={duoForm.leaderPhone}
                      onChange={e => setDuoForm({ ...duoForm, leaderPhone: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>

                <h4 className="section-title mt-3">
                  <User size={16} /> Player 2
                </h4>
                <div className="treg-field-grid-2">
                  <div className="treg-form-group">
                    <label>Player 2 IGN *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Player 2 IGN"
                      value={duoForm.player2Ign}
                      onChange={e => setDuoForm({ ...duoForm, player2Ign: e.target.value })}
                    />
                  </div>
                  <div className="treg-form-group">
                    <label>Player 2 UID *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Player 2 UID"
                      value={duoForm.player2Uid}
                      onChange={e => setDuoForm({ ...duoForm, player2Uid: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ SQUAD REGISTRATION FORM ══════════ */}
            {isSquad && (
              <div className="treg-form-section">
                {/* Team Name */}
                <div className="treg-form-group full-width">
                  <label>Squad / Team / Clan Name *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. TOTAL GAMING ESPORTS, GODLIKE, TEAM XO"
                    value={squadForm.teamName}
                    onChange={e => setSquadForm({ ...squadForm, teamName: e.target.value })}
                  />
                </div>

                {/* Team Captain */}
                <div className="roster-player-card captain-card">
                  <div className="rpc-header">
                    <span className="rpc-badge captain-badge">👑 Team Captain (Player 1)</span>
                    <span className="rpc-note">Room ID &amp; Password will be sent to captain</span>
                  </div>
                  <div className="treg-field-grid-2">
                    <div className="treg-form-group">
                      <label>Captain Free Fire IGN *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Soul_Mortal99"
                        value={squadForm.leaderIgn}
                        onChange={e => setSquadForm({ ...squadForm, leaderIgn: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Captain Free Fire UID *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. 849204812"
                        value={squadForm.leaderUid}
                        onChange={e => setSquadForm({ ...squadForm, leaderUid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                  <div className="treg-form-group" style={{ marginTop: '8px' }}>
                    <label>Captain WhatsApp Number (For Room ID &amp; Password) *</label>
                    <div className="input-with-prefix">
                      <span className="prefix">+91</span>
                      <input 
                        type="tel" 
                        required
                        maxLength={10}
                        placeholder="10-digit WhatsApp number"
                        value={squadForm.leaderPhone}
                        onChange={e => setSquadForm({ ...squadForm, leaderPhone: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="roster-player-card">
                  <div className="rpc-header">
                    <span className="rpc-badge">Player 2</span>
                  </div>
                  <div className="treg-field-grid-2">
                    <div className="treg-form-group">
                      <label>Player 2 IGN *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="In-game Name"
                        value={squadForm.player2Ign}
                        onChange={e => setSquadForm({ ...squadForm, player2Ign: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Player 2 UID *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Free Fire UID"
                        value={squadForm.player2Uid}
                        onChange={e => setSquadForm({ ...squadForm, player2Uid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                {/* Player 3 */}
                <div className="roster-player-card">
                  <div className="rpc-header">
                    <span className="rpc-badge">Player 3</span>
                  </div>
                  <div className="treg-field-grid-2">
                    <div className="treg-form-group">
                      <label>Player 3 IGN *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="In-game Name"
                        value={squadForm.player3Ign}
                        onChange={e => setSquadForm({ ...squadForm, player3Ign: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Player 3 UID *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Free Fire UID"
                        value={squadForm.player3Uid}
                        onChange={e => setSquadForm({ ...squadForm, player3Uid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                {/* Player 4 */}
                <div className="roster-player-card">
                  <div className="rpc-header">
                    <span className="rpc-badge">Player 4</span>
                  </div>
                  <div className="treg-field-grid-2">
                    <div className="treg-form-group">
                      <label>Player 4 IGN *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="In-game Name"
                        value={squadForm.player4Ign}
                        onChange={e => setSquadForm({ ...squadForm, player4Ign: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Player 4 UID *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Free Fire UID"
                        value={squadForm.player4Uid}
                        onChange={e => setSquadForm({ ...squadForm, player4Uid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>

                {/* Optional Substitute */}
                <div className="roster-player-card substitute-card">
                  <div className="rpc-header">
                    <span className="rpc-badge sub-badge">Substitute / 5th Player (Optional)</span>
                  </div>
                  <div className="treg-field-grid-2">
                    <div className="treg-form-group">
                      <label>Substitute IGN</label>
                      <input 
                        type="text" 
                        placeholder="Sub IGN (optional)"
                        value={squadForm.subIgn}
                        onChange={e => setSquadForm({ ...squadForm, subIgn: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Substitute UID</label>
                      <input 
                        type="text" 
                        placeholder="Sub UID (optional)"
                        value={squadForm.subUid}
                        onChange={e => setSquadForm({ ...squadForm, subUid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Fair play rules agreement */}
            <div className="treg-rules-box">
              <label className="checkbox-container">
                <input 
                  type="checkbox" 
                  checked={agreedToRules}
                  onChange={e => setAgreedToRules(e.target.checked)}
                />
                <span className="checkbox-label">
                  I agree to the tournament fair-play regulations: No hacks, third-party APKs, teaming, or emulator bypass. Violators will be permanently blacklisted.
                </span>
              </label>
            </div>

            {/* Actions */}
            </div>

            {/* Fixed Modal Footer - Always in Viewport */}
            <div className="treg-modal-footer">
              {errorMsg && (
                <div className="treg-footer-error fade-in">
                  <AlertCircle size={15} />
                  <span>{errorMsg}</span>
                </div>
              )}
              <div className="treg-footer-btns">
                <button type="button" className="treg-btn-cancel" onClick={onClose}>
                  Cancel
                </button>
                {!hasEnoughTickets ? (
                  <button 
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/esports/passes';
                    }}
                    className="treg-btn-submit"
                    style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
                  >
                    <Ticket size={16} /> Need {Math.max(0, requiredTickets - userTickets)} More Tickets (Get Pass)
                  </button>
                ) : (
                  <button 
                    type="submit"
                    className="treg-btn-submit"
                    disabled={isSlotsFull || isDisqualified}
                  >
                    <Flame size={16} /> Confirm &amp; Register ({requiredTickets}x {ticketType} Tickets)
                  </button>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TournamentRegisterModal;
