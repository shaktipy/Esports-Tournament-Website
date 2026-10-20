import { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useGame } from '../../context/GameContext';
import { 
  Users, Search, ShieldAlert, ShieldCheck, 
  Coins, Ticket, Plus, Minus, Edit, X, AlertTriangle, RotateCw 
} from 'lucide-react';

const AdminUsers = () => {
  const { usersList, updateUserBalance, updateUserStatus, fetchUsers } = useAdmin();
  const { user: currentLoggedUser, setCoins, setCsTickets, setBrTickets } = useGame();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auto-fetch real users from backend on component mount
  useEffect(() => {
    if (fetchUsers) {
      fetchUsers();
    }
  }, [fetchUsers]);

  const handleRefresh = async () => {
    if (isRefreshing || !fetchUsers) return;
    setIsRefreshing(true);
    await fetchUsers();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Adjust Balance Modal
  const [adjustModalUser, setAdjustModalUser] = useState(null);
  const [adjustData, setAdjustData] = useState({
    coinDelta: 0,
    csDelta: 0,
    brDelta: 0,
    reason: 'Admin Manual Grant',
  });

  // Status Modal (Ban/Suspend)
  const [statusModalUser, setStatusModalUser] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [targetStatus, setTargetStatus] = useState('banned');

  // Unban Confirmation Modal
  const [unbanConfirmUser, setUnbanConfirmUser] = useState(null);
  const [unbanReason, setUnbanReason] = useState('Admin reinstated account');

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      (u.inGameName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.uid || '').includes(searchTerm) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || u.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleApplyBalance = async (e) => {
    e.preventDefault();
    if (!adjustModalUser) return;

    const coinDelta = Number(adjustData.coinDelta) || 0;
    const csDelta = Number(adjustData.csDelta) || 0;
    const brDelta = Number(adjustData.brDelta) || 0;
    const targetIdentifier = adjustModalUser.uid || adjustModalUser.supabaseId || adjustModalUser.id;

    await updateUserBalance(
      targetIdentifier,
      coinDelta,
      csDelta,
      brDelta,
      adjustData.reason || 'Admin Balance Adjustment'
    );

    // If the adjusted user is the current active player in GameContext, update their local balance instantly!
    if (currentLoggedUser?.uid === adjustModalUser.uid || currentLoggedUser?.id === adjustModalUser.supabaseId) {
      if (coinDelta !== 0) setCoins(prev => Math.max(0, prev + coinDelta));
      if (csDelta !== 0) setCsTickets(prev => Math.max(0, prev + csDelta));
      if (brDelta !== 0) setBrTickets(prev => Math.max(0, prev + brDelta));
    }

    setAdjustModalUser(null);
  };

  const handleApplyStatus = async (e) => {
    e.preventDefault();
    if (!statusModalUser) return;
    const targetIdentifier = statusModalUser.supabaseId || statusModalUser.uid || statusModalUser.id || statusModalUser.email;
    await updateUserStatus(targetIdentifier, targetStatus, statusReason || 'Admin Action');
    setStatusModalUser(null);
    setStatusReason('');
  };

  const handleConfirmUnban = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!unbanConfirmUser) return;
    const targetIdentifier = unbanConfirmUser.supabaseId || unbanConfirmUser.uid || unbanConfirmUser.id || unbanConfirmUser.email;
    await updateUserStatus(targetIdentifier, 'active', unbanReason || 'Admin reinstated account');
    setUnbanConfirmUser(null);
    setUnbanReason('Admin reinstated account');
  };

  return (
    <div className="admin-users-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>👥 Player & Account Management</h2>
          <p className="subpage-desc">Inspect registered accounts, manually grant or deduct XO coins and tournament tickets, and manage bans or suspensions.</p>
        </div>
        <button 
          className="admin-btn btn-secondary btn-sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          title="Reload users list from database"
        >
          <RotateCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Users'}</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar glass-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by In-Game Name, Free Fire UID, or Email..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All Players ({usersList.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'active' ? 'active' : ''}`}
            onClick={() => setFilterStatus('active')}
          >
            Active ({usersList.filter(u => u.status === 'active').length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'banned' ? 'active' : ''}`}
            onClick={() => setFilterStatus('banned')}
          >
            Banned / Suspended ({usersList.filter(u => u.status === 'banned' || u.status === 'suspended').length})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card glass-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Player Profile</th>
                <th>Free Fire UID</th>
                <th>XO Coins</th>
                <th>CS Tickets</th>
                <th>BR Tickets</th>
                <th>Account Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)' }}>
                    <Users size={36} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600, fontSize: '1rem', color: '#fff', marginBottom: '4px' }}>
                      {searchTerm ? 'No matching players found' : 'No registered players yet'}
                    </p>
                    <p style={{ fontSize: '0.85rem' }}>
                      {searchTerm 
                        ? 'Try searching with a different UID, IGN, or email.' 
                        : 'Real players will appear here automatically when they register or log in via Supabase Auth.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map(userItem => {
                  const isCurrent = currentLoggedUser?.uid === userItem.uid || currentLoggedUser?.id === userItem.supabaseId;
                  return (
                  <tr key={userItem.id || userItem.uid} className={isCurrent ? 'highlight-row' : ''}>
                    <td>
                      <div className="user-profile-cell">
                        <div className="user-avatar-sm">
                          {userItem.inGameName?.charAt(0).toUpperCase() || 'P'}
                        </div>
                        <div>
                          <strong>{userItem.inGameName}</strong>
                          {isCurrent && <span className="current-user-badge">CURRENT YOU</span>}
                          <span className="user-email-sub">{userItem.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <code className="uid-badge">{userItem.uid}</code>
                    </td>
                    <td>
                      <span className="balance-badge coin font-bold">
                        <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" />
                        {(userItem.coins || 0).toLocaleString()} XO
                      </span>
                    </td>
                    <td>
                      <span className="balance-badge cs">
                        🎫 {userItem.csTickets || 0}
                      </span>
                    </td>
                    <td>
                      <span className="balance-badge br">
                        🎫 {userItem.brTickets || 0}
                      </span>
                    </td>
                    <td>
                      <span className={`status-pill status-${userItem.status}`}>
                        {userItem.status.toUpperCase()}
                      </span>
                      {userItem.notes && <span className="user-notes-sub">{userItem.notes}</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="admin-btn btn-primary btn-xs"
                          onClick={() => {
                            setAdjustModalUser(userItem);
                            setAdjustData({ coinDelta: 0, csDelta: 0, brDelta: 0, reason: 'Admin Manual Grant' });
                          }}
                          title="Add or remove XO coins & tickets"
                        >
                          <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" style={{ width: 13, height: 13 }} /> Adjust Balance
                        </button>

                        {userItem.status === 'active' ? (
                          <button 
                            className="admin-btn btn-danger btn-xs"
                            onClick={() => {
                              setStatusModalUser(userItem);
                              setTargetStatus('banned');
                              setStatusReason('');
                            }}
                            title="Ban or Suspend Player"
                          >
                            <ShieldAlert size={12} /> Ban
                          </button>
                        ) : (
                          <button 
                            className="admin-btn btn-secondary btn-xs"
                            onClick={() => {
                              setUnbanConfirmUser(userItem);
                              setUnbanReason('Admin reinstated account');
                            }}
                            title="Unban player"
                          >
                            <ShieldCheck size={12} /> Unban
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL 1: Balance Adjustment ────────────────────────────────────── */}
      {adjustModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" style={{ width: 22, height: 22 }} />
                Adjust Player Balance
              </h3>
              <button className="modal-close-btn" onClick={() => setAdjustModalUser(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApplyBalance} className="modal-form">
              <div className="adjust-user-summary">
                <p>Player: <strong>{adjustModalUser.inGameName}</strong> (UID: {adjustModalUser.uid})</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  Current: <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" /> <strong>{adjustModalUser.coins} XO Coins</strong> | 🎫 <strong>{adjustModalUser.csTickets} CS</strong> | 🎫 <strong>{adjustModalUser.brTickets} BR</strong>
                </p>
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" />
                  Add / Deduct XO Coins (Positive to Add, Negative to Remove)
                </label>
                <div className="quick-amount-buttons">
                  <button type="button" onClick={() => setAdjustData(p => ({ ...p, coinDelta: 100 }))}>+100</button>
                  <button type="button" onClick={() => setAdjustData(p => ({ ...p, coinDelta: 500 }))}>+500</button>
                  <button type="button" onClick={() => setAdjustData(p => ({ ...p, coinDelta: 1000 }))}>+1000</button>
                  <button type="button" onClick={() => setAdjustData(p => ({ ...p, coinDelta: -500 }))}>-500</button>
                </div>
                <input 
                  type="number" 
                  value={adjustData.coinDelta}
                  onChange={e => setAdjustData({ ...adjustData, coinDelta: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>CS Tickets Delta</label>
                  <input 
                    type="number" 
                    value={adjustData.csDelta}
                    onChange={e => setAdjustData({ ...adjustData, csDelta: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>BR Tickets Delta</label>
                  <input 
                    type="number" 
                    value={adjustData.brDelta}
                    onChange={e => setAdjustData({ ...adjustData, brDelta: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Reason / Audit Note *</label>
                <input 
                  type="text" 
                  required
                  value={adjustData.reason}
                  onChange={e => setAdjustData({ ...adjustData, reason: e.target.value })}
                  placeholder="e.g. Scrims winner prize distribution / manual compensation"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setAdjustModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  Apply Balance Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: Ban / Suspend ────────────────────────────────────────── */}
      {statusModalUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>🛡️ Player Account Enforcement</h3>
              <button className="modal-close-btn" onClick={() => setStatusModalUser(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleApplyStatus} className="modal-form">
              <div className="adjust-user-summary">
                <p>Enforcing action on: <strong>{statusModalUser.inGameName}</strong> (UID: {statusModalUser.uid})</p>
              </div>

              <div className="form-group">
                <label>Action</label>
                <select value={targetStatus} onChange={e => setTargetStatus(e.target.value)}>
                  <option value="banned">Permanent Ban</option>
                  <option value="suspended">7-Day Tournament Suspension</option>
                  <option value="active">Active (Normal)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reason for Ban / Suspension *</label>
                <textarea 
                  required
                  rows="3"
                  value={statusReason}
                  onChange={e => setStatusReason(e.target.value)}
                  placeholder="e.g. Exploiting glitches, abusive chat, or toxic behavior in live custom rooms..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setStatusModalUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-danger">
                  Confirm Enforcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 3: Unban Confirmation ─────────────────────────────────── */}
      {unbanConfirmUser && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card" style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={20} style={{ color: '#2ed573' }} /> 
                <span>Confirm Account Unban</span>
              </h3>
              <button className="modal-close-btn" onClick={() => setUnbanConfirmUser(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmUnban} className="modal-form">
              <div className="adjust-user-summary" style={{ borderLeft: '3px solid #2ed573' }}>
                <p style={{ color: '#a4b0be', fontSize: '0.88rem' }}>Are you sure you want to unban and reinstate:</p>
                <p style={{ marginTop: 5 }}>
                  <strong style={{ fontSize: '1.1rem', color: '#fff' }}>{unbanConfirmUser.inGameName}</strong> 
                  <span style={{ color: '#00f2fe', marginLeft: 8, fontWeight: 600 }}>(UID: {unbanConfirmUser.uid})</span>
                </p>
                {(unbanConfirmUser.notes || unbanConfirmUser.statusReason) && (
                  <p style={{ fontSize: '0.8rem', color: '#ff6b81', marginTop: 8, background: 'rgba(255, 107, 129, 0.1)', padding: '6px 10px', borderRadius: 6 }}>
                    <strong>Previous Ban Reason:</strong> "{unbanConfirmUser.notes || unbanConfirmUser.statusReason}"
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Pardon / Reinstatement Note (Optional)</label>
                <input 
                  type="text"
                  value={unbanReason}
                  onChange={e => setUnbanReason(e.target.value)}
                  placeholder="e.g. Admin reinstated account, Appeal accepted, False report..."
                />
              </div>

              <p style={{ fontSize: '0.82rem', color: '#2ed573', background: 'rgba(46, 213, 115, 0.08)', border: '1px solid rgba(46, 213, 115, 0.2)', padding: '8px 12px', borderRadius: 8, margin: '0.5rem 0 1.25rem' }}>
                ✓ This player will immediately be able to log in, join tournaments, and use their XO Coins &amp; tickets normally.
              </p>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setUnbanConfirmUser(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-success">
                  <ShieldCheck size={14} /> Confirm &amp; Unban Player
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
