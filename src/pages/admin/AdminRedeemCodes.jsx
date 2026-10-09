import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Gift, Plus, Copy, Check, Trash2, Power, 
  Calendar, Users, Sparkles, X, Shuffle, AlertCircle
} from 'lucide-react';

const AdminRedeemCodes = () => {
  const { redeemCodes, createRedeemCode, toggleRedeemCode, deleteRedeemCode } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [viewingUsersCode, setViewingUsersCode] = useState(null);

  const [formData, setFormData] = useState({
    code: '',
    rewardType: 'coins',
    coins: 500,
    csTickets: 0,
    brTickets: 0,
    maxUses: 100,
    expiryDate: '2026-12-31',
    description: 'Special Stream Giveaway Code',
  });

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 6; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code: `XO${rand}` }));
  };

  const openCreateModal = () => {
    generateRandomCode();
    setShowModal(true);
  };

  const handleCreateCode = (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    createRedeemCode(formData);
    setShowModal(false);
  };

  const handleCopy = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="admin-codes-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>🎁 Redeem & Promo Codes Generator</h2>
          <p className="subpage-desc">Generate promo codes, grant free XO Coins and tournament tickets, manage usage limits, and track redemptions.</p>
        </div>
        <button className="admin-btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Generate New Redeem Code
        </button>
      </div>

      {/* Codes Table */}
      <div className="admin-card glass-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Reward Contents</th>
                <th>Redemptions / Limit</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {redeemCodes.map(codeItem => {
                const isExpired = new Date(codeItem.expiryDate) < new Date();
                return (
                  <tr key={codeItem.id}>
                    <td>
                      <div className="code-badge-wrap">
                        <code className="promo-code-text">{codeItem.code}</code>
                        <button 
                          className="copy-btn-sm" 
                          onClick={() => handleCopy(codeItem.code, codeItem.id)}
                          title="Copy to clipboard"
                        >
                          {copiedId === codeItem.id ? <Check size={13} className="text-emerald" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <span className="code-sub-desc">{codeItem.description}</span>
                    </td>
                    <td>
                      <div className="code-rewards-display">
                        {codeItem.coins > 0 && <span className="reward-tag coin">+{codeItem.coins} XO Coins</span>}
                        {codeItem.csTickets > 0 && <span className="reward-tag cs">+{codeItem.csTickets} CS Tickets</span>}
                        {codeItem.brTickets > 0 && <span className="reward-tag br">+{codeItem.brTickets} BR Tickets</span>}
                      </div>
                    </td>
                    <td>
                      <div className="usage-progress-box">
                        <span>{codeItem.usedCount} / {codeItem.maxUses} used</span>
                        <div className="progress-track sm">
                          <div 
                            className="progress-fill" 
                            style={{ width: `${Math.min(100, (codeItem.usedCount / codeItem.maxUses) * 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={isExpired ? 'text-danger font-semibold' : 'text-muted'}>
                        {codeItem.expiryDate} {isExpired && '(Expired)'}
                      </span>
                    </td>
                    <td>
                      <button 
                        className={`status-pill clickable ${codeItem.active && !isExpired ? 'status-open' : 'status-closed'}`}
                        onClick={() => toggleRedeemCode(codeItem.id)}
                        title="Click to toggle status"
                      >
                        <Power size={11} /> {codeItem.active && !isExpired ? 'ACTIVE' : 'DISABLED'}
                      </button>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="admin-btn btn-secondary btn-xs"
                          onClick={() => setViewingUsersCode(codeItem)}
                          title="View users who redeemed"
                        >
                          <Users size={12} /> Claimants ({codeItem.usedBy?.length || 0})
                        </button>
                        <button 
                          className="btn-danger-icon"
                          onClick={() => {
                            if (window.confirm(`Delete code "${codeItem.code}"?`)) {
                              deleteRedeemCode(codeItem.id);
                            }
                          }}
                          title="Delete code"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL 1: Generate Code ─────────────────────────────────────────── */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>🎁 Generate New Promo Code</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateCode} className="modal-form">
              <div className="form-group">
                <label>Code String *</label>
                <div className="input-with-button">
                  <input 
                    type="text" 
                    required
                    value={formData.code} 
                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g. XOBOOYAH2026"
                  />
                  <button type="button" className="admin-btn btn-secondary" onClick={generateRandomCode}>
                    <Shuffle size={14} /> Random
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Reward Type</label>
                <select 
                  value={formData.rewardType} 
                  onChange={e => setFormData({ ...formData, rewardType: e.target.value })}
                >
                  <option value="coins">XO Coins Only</option>
                  <option value="cs_tickets">Clash Squad Tickets</option>
                  <option value="br_tickets">Battle Royale Tickets</option>
                  <option value="combo">Combo (Coins + Tickets)</option>
                </select>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label>XO Coins Reward</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.coins} 
                    onChange={e => setFormData({ ...formData, coins: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>CS Tickets</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.csTickets} 
                    onChange={e => setFormData({ ...formData, csTickets: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>BR Tickets</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.brTickets} 
                    onChange={e => setFormData({ ...formData, brTickets: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Max Uses / Claim Limit</label>
                  <input 
                    type="number" 
                    min="1"
                    value={formData.maxUses} 
                    onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Expiration Date</label>
                  <input 
                    type="date" 
                    value={formData.expiryDate} 
                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Internal Note / Description</label>
                <input 
                  type="text" 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. YouTube 500k Special stream giveaway code"
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  Generate & Activate Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL 2: View Claimants ────────────────────────────────────────── */}
      {viewingUsersCode && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <div>
                <h3>👥 Users Who Redeemed Code</h3>
                <code className="promo-code-text">{viewingUsersCode.code}</code>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingUsersCode(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body-scroll">
              {(!viewingUsersCode.usedBy || viewingUsersCode.usedBy.length === 0) ? (
                <div className="empty-state-box">
                  <p>No users have redeemed this code yet.</p>
                </div>
              ) : (
                <ul className="claimants-list">
                  {viewingUsersCode.usedBy.map((uid, idx) => (
                    <li key={idx} className="claimant-item">
                      <span className="claimant-idx">#{idx + 1}</span>
                      <span className="claimant-uid">Free Fire UID: <strong>{uid}</strong></span>
                      <span className="claimant-badge">Verified Claim</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="modal-actions">
              <button className="admin-btn btn-secondary" onClick={() => setViewingUsersCode(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRedeemCodes;
