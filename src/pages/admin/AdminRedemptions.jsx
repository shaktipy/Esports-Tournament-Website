import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Gift, Search, CheckCircle2, Clock, XCircle, 
  Copy, Check, Sparkles, X, Send, Eye, Trash2, Trash, AlertTriangle
} from 'lucide-react';

const AdminRedemptions = () => {
  const { 
    redemptions = [], 
    updateRedemptionStatus,
    deleteRedemption,
    deleteRedemptions,
    clearAllRedemptions,
  } = useAdmin();

  const [searchTerm, setSearchTerm]       = useState('');
  const [filterStatus, setFilterStatus]   = useState('all');
  const [statusModalItem, setStatusModalItem] = useState(null);
  const [modalStatus, setModalStatus]     = useState('delivered');
  const [deliveryDetails, setDeliveryDetails] = useState('');
  const [copiedUid, setCopiedUid]         = useState(null);

  // Selection state
  const [selectedIds, setSelectedIds] = useState(new Set());

  // Confirm modal state
  const [confirmModal, setConfirmModal] = useState(null); // { type: 'single'|'bulk'|'all', ids? }

  // ── Stats ────────────────────────────────────────────────────────────────────
  const totalCount       = redemptions.length;
  const pendingItems     = redemptions.filter(r => r.status === 'pending');
  const deliveredItems   = redemptions.filter(r => r.status === 'delivered');
  const totalCoinsSpent  = redemptions.reduce((sum, r) => sum + (Number(r.cost) || 0), 0);

  // ── Filtered List ────────────────────────────────────────────────────────────
  const filteredRedemptions = redemptions.filter(r => {
    const matchesSearch = 
      (r.userIgn    || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.userUid    || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.rewardTitle|| '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.id         || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const handleCopyUid = (uid) => {
    if (!uid) return;
    navigator.clipboard.writeText(uid);
    setCopiedUid(uid);
    setTimeout(() => setCopiedUid(null), 2000);
  };

  const handleOpenModal = (item, defaultStatus = 'delivered') => {
    setStatusModalItem(item);
    setModalStatus(defaultStatus);
    setDeliveryDetails(item.deliveryDetails || '');
  };

  const handleSubmitStatus = (e) => {
    e.preventDefault();
    if (!statusModalItem) return;
    updateRedemptionStatus(statusModalItem.id, modalStatus, deliveryDetails.trim());
    setStatusModalItem(null);
  };

  // ── Selection helpers ────────────────────────────────────────────────────────
  const allFilteredIds   = filteredRedemptions.map(r => r.id);
  const allSelected      = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedIds.has(id));
  const someSelected     = allFilteredIds.some(id => selectedIds.has(id));
  const selectedCount    = [...selectedIds].filter(id => allFilteredIds.includes(id)).length;

  const toggleSelectAll = () => {
    if (allSelected) {
      setSelectedIds(prev => { const s = new Set(prev); allFilteredIds.forEach(id => s.delete(id)); return s; });
    } else {
      setSelectedIds(prev => { const s = new Set(prev); allFilteredIds.forEach(id => s.add(id)); return s; });
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  // ── Confirm delete handlers ──────────────────────────────────────────────────
  const handleConfirmDelete = () => {
    if (!confirmModal) return;
    if (confirmModal.type === 'single') {
      deleteRedemption(confirmModal.id);
      setSelectedIds(prev => { const s = new Set(prev); s.delete(confirmModal.id); return s; });
    } else if (confirmModal.type === 'bulk') {
      deleteRedemptions([...selectedIds]);
      setSelectedIds(new Set());
    } else if (confirmModal.type === 'all') {
      clearAllRedemptions();
      setSelectedIds(new Set());
    }
    setConfirmModal(null);
  };

  return (
    <div className="admin-payments-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>🎁 XO Coins Reward Redemptions</h2>
          <p className="subpage-desc">
            Monitor and fulfill store rewards, Free Fire diamonds, and gift vouchers claimed by players using their earned XO Coins.
          </p>
        </div>
        {/* Clear All button */}
        {totalCount > 0 && (
          <button
            className="admin-btn btn-danger"
            onClick={() => setConfirmModal({ type: 'all' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', whiteSpace: 'nowrap' }}
          >
            <Trash size={15} /> Clear All History
          </button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="admin-kpi-grid">
        <div className="kpi-card glass-card">
          <span className="kpi-title">TOTAL REDEMPTIONS</span>
          <div className="kpi-value text-gold">{totalCount}</div>
          <div className="kpi-meta positive"><Gift size={13} /> Lifetime Rewards Claimed</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">PENDING FULFILLMENT</span>
          <div className="kpi-value text-amber" style={{ color: pendingItems.length > 0 ? '#f59e0b' : '#10b981' }}>
            {pendingItems.length}
          </div>
          <div className="kpi-meta"><Clock size={13} /> Requires Admin Delivery</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">DELIVERED TO PLAYERS</span>
          <div className="kpi-value text-success">{deliveredItems.length}</div>
          <div className="kpi-meta positive"><CheckCircle2 size={13} /> Completed Deliveries</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">TOTAL XO COINS REDEEMED</span>
          <div className="kpi-value text-cyan" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" style={{ width: 22, height: 22 }} />
            {totalCoinsSpent.toLocaleString()}
          </div>
          <div className="kpi-meta info">XO Coins Burned in Store</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar glass-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by player IGN, Game UID, reward name..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button className={`filter-tab ${filterStatus === 'all'       ? 'active' : ''}`} onClick={() => setFilterStatus('all')}>
            All ({totalCount})
          </button>
          <button className={`filter-tab ${filterStatus === 'pending'   ? 'active' : ''}`} onClick={() => setFilterStatus('pending')}>
            Pending ({pendingItems.length})
          </button>
          <button className={`filter-tab ${filterStatus === 'delivered' ? 'active' : ''}`} onClick={() => setFilterStatus('delivered')}>
            Delivered ({deliveredItems.length})
          </button>
          <button className={`filter-tab ${filterStatus === 'cancelled' ? 'active' : ''}`} onClick={() => setFilterStatus('cancelled')}>
            Cancelled ({redemptions.filter(r => r.status === 'cancelled').length})
          </button>
        </div>
      </div>

      {/* Bulk Action Bar — appears when items are selected */}
      {selectedCount > 0 && (
        <div className="glass-card" style={{
          display: 'flex', alignItems: 'center', gap: '12px',
          padding: '10px 18px', marginBottom: '12px',
          borderColor: 'rgba(239,68,68,0.35)', background: 'rgba(239,68,68,0.07)'
        }}>
          <span style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 600 }}>
            {selectedCount} record{selectedCount !== 1 ? 's' : ''} selected
          </span>
          <button
            className="admin-btn btn-danger btn-xs"
            onClick={() => setConfirmModal({ type: 'bulk' })}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}
          >
            <Trash2 size={13} /> Delete Selected
          </button>
          <button
            className="admin-btn btn-secondary btn-xs"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear Selection
          </button>
        </div>
      )}

      {/* Table */}
      <div className="admin-card glass-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}>
                  <input
                    type="checkbox"
                    checked={allSelected}
                    ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                    onChange={toggleSelectAll}
                    title="Select all visible"
                    style={{ cursor: 'pointer', accentColor: '#ef4444' }}
                  />
                </th>
                <th>Customer / Game UID</th>
                <th>Reward Item</th>
                <th>Type</th>
                <th>XO Coins Spent</th>
                <th>Redeemed At</th>
                <th>Status</th>
                <th>Delivery Note / Code</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRedemptions.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <Gift size={38} style={{ color: '#fbbf24', opacity: 0.6 }} />
                      <strong style={{ fontSize: '1.05rem', color: '#f1f5f9' }}>No Redemptions Found</strong>
                      <p style={{ margin: 0, fontSize: '0.875rem', maxWidth: '440px', lineHeight: '1.4' }}>
                        When users redeem Free Fire diamonds or rewards in the XO Rewards Store, their requests and UID details will show here immediately.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRedemptions.map(r => (
                  <tr
                    key={r.id}
                    style={{
                      background: selectedIds.has(r.id) ? 'rgba(239,68,68,0.07)' : undefined,
                      transition: 'background 0.15s'
                    }}
                  >
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={selectedIds.has(r.id)}
                        onChange={() => toggleSelect(r.id)}
                        style={{ cursor: 'pointer', accentColor: '#ef4444' }}
                      />
                    </td>

                    {/* Customer */}
                    <td>
                      <div className="tx-customer">
                        <span className="customer-ign" style={{ fontWeight: 600 }}>{r.userIgn || 'Player'}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <code className="customer-uid" style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px' }}>
                            UID: {r.userUid}
                          </code>
                          <button
                            type="button"
                            onClick={() => handleCopyUid(r.userUid)}
                            title="Copy Game UID to clipboard"
                            style={{
                              background: 'transparent', border: 'none',
                              color: copiedUid === r.userUid ? '#10b981' : '#94a3b8',
                              cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: '2px'
                            }}
                          >
                            {copiedUid === r.userUid ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>
                    </td>

                    {/* Reward */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.2rem' }}>
                          {r.rewardType === 'diamonds' ? '💎' : (r.rewardType === 'giftcard' ? '🎟️' : '🎁')}
                        </span>
                        <div>
                          <strong>{r.rewardTitle}</strong>
                          <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', textTransform: 'capitalize' }}>
                            {r.rewardType || 'Reward Item'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Fulfillment type */}
                    <td>
                      <span style={{
                        fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                        background: r.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                        color: r.fulfillmentType === 'instant' ? '#10b981' : '#94a3b8',
                        border: `1px solid ${r.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.2)'}`,
                        whiteSpace: 'nowrap'
                      }}>
                        {r.fulfillmentType === 'instant' ? '⚡ INSTANT' : '🔧 MANUAL'}
                      </span>
                    </td>

                    {/* Coins */}
                    <td>
                      <span style={{ 
                        display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700, color: '#c084fc',
                        background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)',
                        padding: '4px 9px', borderRadius: '6px'
                      }}>
                        <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-inline" style={{ width: 14, height: 14 }} />
                        {Number(r.cost).toLocaleString()} XO
                      </span>
                    </td>

                    {/* Date */}
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{r.createdAt}</td>

                    {/* Status */}
                    <td>
                      <span 
                        className={`status-pill ${
                          r.status === 'delivered' ? 'status-captured' : 
                          (r.status === 'pending' ? 'status-active' : 'status-failed')
                        }`}
                        style={{
                          textTransform: 'uppercase', fontWeight: 700, fontSize: '0.75rem',
                          padding: '4px 10px', display: 'inline-flex', alignItems: 'center', gap: '5px'
                        }}
                      >
                        {r.status === 'delivered'  && <CheckCircle2 size={12} />}
                        {r.status === 'pending'    && <Clock size={12} />}
                        {r.status === 'cancelled'  && <XCircle size={12} />}
                        {r.status || 'PENDING'}
                      </span>
                    </td>

                    {/* Delivery note */}
                    <td>
                      {r.deliveryDetails ? (
                        <code style={{ 
                          fontSize: '0.8rem', background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', 
                          padding: '3px 8px', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)'
                        }}>
                          {r.deliveryDetails}
                        </code>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td>
                      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                        {r.status === 'pending' ? (
                          <button
                            className="admin-btn btn-primary btn-xs"
                            onClick={() => handleOpenModal(r, 'delivered')}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Send size={12} /> Fulfill
                          </button>
                        ) : (
                          <button
                            className="admin-btn btn-secondary btn-xs"
                            onClick={() => handleOpenModal(r, r.status)}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Eye size={12} /> Edit
                          </button>
                        )}
                        {/* Single delete */}
                        <button
                          className="admin-btn btn-danger btn-xs"
                          onClick={() => setConfirmModal({ type: 'single', id: r.id, label: r.rewardTitle, ign: r.userIgn })}
                          title="Delete this record"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Fulfillment Modal ───────────────────────────────────────────────────── */}
      {statusModalItem && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>🎁 Fulfill Reward Redemption</h3>
              <button className="modal-close-btn" onClick={() => setStatusModalItem(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmitStatus} className="modal-form">
              <div className="refund-summary-box" style={{ background: 'rgba(255,255,255,0.03)', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
                <p style={{ margin: '4px 0' }}>Player: <strong>{statusModalItem.userIgn}</strong></p>
                <p style={{ margin: '4px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  Free Fire UID: <code style={{ color: '#fbbf24', fontSize: '0.95rem' }}>{statusModalItem.userUid}</code>
                  <button
                    type="button"
                    onClick={() => handleCopyUid(statusModalItem.userUid)}
                    style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
                    title="Copy UID"
                  >
                    {copiedUid === statusModalItem.userUid ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                  </button>
                </p>
                <p style={{ margin: '4px 0' }}>Reward: <strong>{statusModalItem.rewardTitle}</strong> ({statusModalItem.cost} XO Coins)</p>
                <p style={{ margin: '4px 0', fontSize: '0.8rem', color: '#94a3b8' }}>Redeemed: {statusModalItem.createdAt}</p>
              </div>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>Update Status</label>
                <select 
                  value={modalStatus} 
                  onChange={e => setModalStatus(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }}
                >
                  <option value="delivered">✅ Delivered / Fulfilled</option>
                  <option value="pending">⏳ Pending Fulfillment</option>
                  <option value="cancelled">❌ Cancelled / Rejected</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: '18px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.875rem' }}>
                  Delivery Note / Redeem Code / Top-up TxID
                </label>
                <input 
                  type="text"
                  placeholder="e.g. FF-TOPUP-992104 or Google Play Code"
                  value={deliveryDetails}
                  onChange={e => setDeliveryDetails(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '6px', background: '#0f172a', border: '1px solid rgba(255,255,255,0.15)', color: '#f8fafc' }}
                />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>
                  Optional reference number or redeem code delivered to this player.
                </span>
              </div>

              <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" className="admin-btn btn-secondary" onClick={() => setStatusModalItem(null)}>Cancel</button>
                <button type="submit" className="admin-btn btn-primary">Save &amp; Update</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Confirm Delete Modal ────────────────────────────────────────────────── */}
      {confirmModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                <AlertTriangle size={20} /> Confirm Delete
              </h3>
              <button className="modal-close-btn" onClick={() => setConfirmModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div style={{ padding: '8px 0 20px' }}>
              {confirmModal.type === 'single' && (
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Delete redemption record for <strong style={{ color: '#fbbf24' }}>{confirmModal.label}</strong> by{' '}
                  <strong>{confirmModal.ign || 'Player'}</strong>?
                  <br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>This action cannot be undone.</span>
                </p>
              )}
              {confirmModal.type === 'bulk' && (
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Delete <strong style={{ color: '#f87171' }}>{selectedCount} selected</strong> redemption record{selectedCount !== 1 ? 's' : ''}?
                  <br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>This action cannot be undone.</span>
                </p>
              )}
              {confirmModal.type === 'all' && (
                <p style={{ margin: 0, lineHeight: 1.6 }}>
                  Clear <strong style={{ color: '#f87171' }}>all {totalCount}</strong> redemption history records permanently?
                  <br /><span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>This will wipe the entire redemption log. This cannot be undone.</span>
                </p>
              )}
            </div>
            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button className="admin-btn btn-secondary" onClick={() => setConfirmModal(null)}>Cancel</button>
              <button
                className="admin-btn btn-danger"
                onClick={handleConfirmDelete}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              >
                <Trash2 size={14} /> Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRedemptions;
