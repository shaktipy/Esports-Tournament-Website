import { useState, useEffect } from 'react';
import { 
  Trophy, Users, Shield, CheckCircle2, AlertCircle, 
  X, Phone, User, Hash, Ticket, MessageSquare, Flame
} from 'lucide-react';
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
  const isSquad = modeLower.includes('squad') || modeLower.includes('4v4') || modeLower.includes('cs') && !modeLower.includes('solo');
  const isDuo = modeLower.includes('duo') || modeLower.includes('2v2');
  const isSolo = !isSquad && !isDuo || modeLower.includes('solo') || modeLower.includes('1v1');

  // Solo Form State
  const [soloForm, setSoloForm] = useState({
    ign: user?.inGameName || '',
    uid: user?.uid || '',
    phone: user?.phone || '',
    discord: ''
  });

  // Squad Form State
  const [squadForm, setSquadForm] = useState({
    teamName: '',
    leaderIgn: user?.inGameName || '',
    leaderUid: user?.uid || '',
    leaderPhone: user?.phone || '',
    player2Ign: '',
    player2Uid: '',
    player3Ign: '',
    player3Uid: '',
    player4Ign: '',
    player4Uid: '',
    subIgn: '',
    subUid: ''
  });

  // Duo Form State
  const [duoForm, setDuoForm] = useState({
    teamName: '',
    leaderIgn: user?.inGameName || '',
    leaderUid: user?.uid || '',
    leaderPhone: user?.phone || '',
    player2Ign: '',
    player2Uid: ''
  });

  const [agreedToRules, setAgreedToRules] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);

  // Squad = 4 tickets (4 players), Duo = 2 tickets, Solo = 1 ticket
  const requiredTickets = isSquad ? 4 : (isDuo ? 2 : (Number(tournament.ticketCost) || 1));
  const ticketType = tournament.ticketType || 'CS';
  const hasEnoughTickets = userTickets >= requiredTickets;

  // Reset when tournament changes
  useEffect(() => {
    if (tournament) {
      setRegisteredSuccess(false);
      setSubmittedData(null);
      setErrorMsg('');
      setAgreedToRules(false);
    }
  }, [tournament]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!hasEnoughTickets) {
      setErrorMsg(`Insufficient tickets! You need ${requiredTickets}x ${ticketType} Tickets (${isSquad ? '4 tickets for 4 players' : isDuo ? '2 tickets for 2 players' : '1 ticket'}) to register.`);
      return;
    }

    if (!agreedToRules) {
      setErrorMsg('Please read and accept the tournament fair-play rules.');
      return;
    }

    let payload = {};

    if (isSolo) {
      if (!soloForm.ign.trim()) {
        setErrorMsg('Please enter your Free Fire In-Game Name (IGN).');
        return;
      }
      if (!soloForm.uid.trim() || soloForm.uid.trim().length < 6) {
        setErrorMsg('Please enter a valid Free Fire UID (minimum 6 digits).');
        return;
      }
      if (!soloForm.phone.trim() || soloForm.phone.trim().length < 10) {
        setErrorMsg('Please enter a valid 10-digit WhatsApp number for match room ID delivery.');
        return;
      }

      payload = {
        type: 'solo',
        teamName: soloForm.ign.trim(),
        ign: soloForm.ign.trim(),
        uid: soloForm.uid.trim(),
        leaderIgn: soloForm.ign.trim(),
        leaderUid: soloForm.uid.trim(),
        phone: soloForm.phone.trim(),
        discord: soloForm.discord.trim(),
        players: [
          { role: 'Solo Player', ign: soloForm.ign.trim(), uid: soloForm.uid.trim() }
        ],
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Ticket`
      };
    } else if (isDuo) {
      if (!duoForm.teamName.trim()) {
        setErrorMsg('Please enter your Duo Team Name.');
        return;
      }
      if (!duoForm.leaderIgn.trim() || !duoForm.leaderUid.trim()) {
        setErrorMsg('Player 1 (Captain) IGN and UID are required.');
        return;
      }
      if (!duoForm.leaderPhone.trim() || duoForm.leaderPhone.trim().length < 10) {
        setErrorMsg('Captain WhatsApp number is required for room ID delivery.');
        return;
      }
      if (!duoForm.player2Ign.trim() || !duoForm.player2Uid.trim()) {
        setErrorMsg('Player 2 IGN and UID are required.');
        return;
      }

      payload = {
        type: 'duo',
        teamName: duoForm.teamName.trim(),
        ign: duoForm.leaderIgn.trim(),
        uid: duoForm.leaderUid.trim(),
        leaderIgn: duoForm.leaderIgn.trim(),
        leaderUid: duoForm.leaderUid.trim(),
        phone: duoForm.leaderPhone.trim(),
        players: [
          { role: 'Captain / P1', ign: duoForm.leaderIgn.trim(), uid: duoForm.leaderUid.trim() },
          { role: 'Player 2', ign: duoForm.player2Ign.trim(), uid: duoForm.player2Uid.trim() }
        ],
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Tickets (2 Players)`
      };
    } else {
      // Squad
      if (!squadForm.teamName.trim()) {
        setErrorMsg('Please enter your Squad Team Name.');
        return;
      }
      if (!squadForm.leaderIgn.trim() || !squadForm.leaderUid.trim()) {
        setErrorMsg('Team Captain (Player 1) IGN and UID are required.');
        return;
      }
      if (!squadForm.leaderPhone.trim() || squadForm.leaderPhone.trim().length < 10) {
        setErrorMsg('Captain 10-digit WhatsApp number is required for room ID/password delivery.');
        return;
      }
      if (!squadForm.player2Ign.trim() || !squadForm.player2Uid.trim()) {
        setErrorMsg('Player 2 IGN and Free Fire UID are required.');
        return;
      }
      if (!squadForm.player3Ign.trim() || !squadForm.player3Uid.trim()) {
        setErrorMsg('Player 3 IGN and Free Fire UID are required.');
        return;
      }
      if (!squadForm.player4Ign.trim() || !squadForm.player4Uid.trim()) {
        setErrorMsg('Player 4 IGN and Free Fire UID are required.');
        return;
      }

      const roster = [
        { role: 'Captain (P1)', ign: squadForm.leaderIgn.trim(), uid: squadForm.leaderUid.trim() },
        { role: 'Player 2', ign: squadForm.player2Ign.trim(), uid: squadForm.player2Uid.trim() },
        { role: 'Player 3', ign: squadForm.player3Ign.trim(), uid: squadForm.player3Uid.trim() },
        { role: 'Player 4', ign: squadForm.player4Ign.trim(), uid: squadForm.player4Uid.trim() },
      ];

      if (squadForm.subIgn.trim() && squadForm.subUid.trim()) {
        roster.push({ role: 'Substitute', ign: squadForm.subIgn.trim(), uid: squadForm.subUid.trim() });
      }

      payload = {
        type: 'squad',
        teamName: squadForm.teamName.trim(),
        ign: squadForm.leaderIgn.trim(),
        uid: squadForm.leaderUid.trim(),
        leaderIgn: squadForm.leaderIgn.trim(),
        leaderUid: squadForm.leaderUid.trim(),
        phone: squadForm.leaderPhone.trim(),
        players: roster,
        ticketCost: requiredTickets,
        ticketUsed: `${requiredTickets}x ${ticketType} Tickets (4 Players)`
      };
    }

    setSubmittedData(payload);
    if (onSuccessRegister) {
      onSuccessRegister(payload);
    }
    setRegisteredSuccess(true);
  };

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
              Your slot has been successfully registered for <strong>{tournament.title}</strong>.
            </p>

            <div className="treg-success-summary-box">
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
                <strong>Important Notice:</strong> Custom Room ID and Password will be sent to your WhatsApp number (<code>{submittedData?.phone}</code>) 15 minutes before the match start time. Make sure your team is ready!
              </p>
            </div>

            <button className="treg-btn-primary" onClick={onClose}>
              Done & View Esports Arena
            </button>
          </div>
        ) : (
          /* Registration Form View */
          <form onSubmit={handleSubmit} className="treg-form-scroll">
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
                <div className="treg-field-grid-3">
                  <div className="treg-form-group">
                    <label>Leader IGN *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Player 1 IGN"
                      value={duoForm.leaderIgn}
                      onChange={e => setDuoForm({ ...duoForm, leaderIgn: e.target.value })}
                    />
                  </div>
                  <div className="treg-form-group">
                    <label>Leader UID *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Player 1 UID"
                      value={duoForm.leaderUid}
                      onChange={e => setDuoForm({ ...duoForm, leaderUid: e.target.value.replace(/\D/g, '') })}
                    />
                  </div>
                  <div className="treg-form-group">
                    <label>WhatsApp Number *</label>
                    <input 
                      type="tel" 
                      required
                      maxLength={10}
                      placeholder="10-digit phone"
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
                  <div className="treg-field-grid-3">
                    <div className="treg-form-group">
                      <label>Captain IGN *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Leader IGN"
                        value={squadForm.leaderIgn}
                        onChange={e => setSquadForm({ ...squadForm, leaderIgn: e.target.value })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Captain Free Fire UID *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Leader UID"
                        value={squadForm.leaderUid}
                        onChange={e => setSquadForm({ ...squadForm, leaderUid: e.target.value.replace(/\D/g, '') })}
                      />
                    </div>
                    <div className="treg-form-group">
                      <label>Captain WhatsApp Number *</label>
                      <div className="input-with-prefix">
                        <span className="prefix">+91</span>
                        <input 
                          type="tel" 
                          required
                          maxLength={10}
                          placeholder="10-digit number"
                          value={squadForm.leaderPhone}
                          onChange={e => setSquadForm({ ...squadForm, leaderPhone: e.target.value.replace(/\D/g, '') })}
                        />
                      </div>
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
            <div className="treg-actions">
              <button type="button" className="treg-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                type="submit" 
                className="treg-btn-submit"
                disabled={!hasEnoughTickets}
              >
                <Flame size={16} /> Confirm &amp; Register ({requiredTickets}x {ticketType} Tickets)
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default TournamentRegisterModal;
