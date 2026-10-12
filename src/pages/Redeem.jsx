import { useState, useEffect } from 'react';
import { Gift, CheckCircle, AlertCircle, ArrowRight, Copy, Check, History, ChevronRight, X, Clock, Zap, Package } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin } from '../context/AdminContext';
import './Redeem.css';

const Redeem = ({ onLoginClick }) => {
  const [filter, setFilter] = useState('all');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState({ show: false, success: false, message: '' });
  const [confirmingReward, setConfirmingReward] = useState(null);  // reward to confirm
  const [deliveredCode, setDeliveredCode] = useState(null);        // { code, rewardTitle }
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [userHistory, setUserHistory] = useState([]);

  const { coins, setCoins, setCsTickets, setBrTickets, user, showNotification, isBanned } = useGame();
  const { storeRewards, redeemPromoCode, recordStoreRedemption } = useAdmin();

  // Load user's personal redemption history from localStorage
  useEffect(() => {
    if (!user?.uid) return;
    try {
      const key = `haarshxo_user_redemptions_${user.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) setUserHistory(JSON.parse(saved));
    } catch {}
  }, [user?.uid, deliveredCode]); // re-read after new redemption

  const currentStoreItems = storeRewards && storeRewards.length > 0 
    ? storeRewards.filter(r => (r.storeType || 'main') === 'main' && r.active !== false)
    : [];

  const filteredRewards = currentStoreItems.filter(r => {
    if (filter === 'all') return true;
    if (filter === 'diamonds' || filter === 'game') return r.type === 'diamonds' || r.type === 'game';
    if (filter === 'giftcard') return r.type === 'giftcard';
    if (filter === 'merch') return r.type === 'merch';
    return true;
  });

  const isOutOfStock = (reward) => {
    if (Number(reward.stock) <= 0) return true;
    if (reward.fulfillmentType === 'instant') {
      const available = (reward.instantCodes || []).filter(c => !c.used).length;
      return available <= 0;
    }
    return false;
  };

  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;
    if (!user) { onLoginClick(); return; }

    const res = redeemPromoCode(promoCodeInput.trim(), user.uid || '');
    if (res.success) {
      if (res.coins > 0) setCoins(prev => prev + res.coins);
      if (res.csTickets > 0) setCsTickets(prev => prev + res.csTickets);
      if (res.brTickets > 0) setBrTickets(prev => prev + res.brTickets);
      showNotification('🎉 Code Redeemed!', 'success', res.description || 'Rewards added!');
      setRedeemStatus({ show: true, success: true, message: `🎉 ${res.description || 'Rewards added!'}` });
      setPromoCodeInput('');
    } else {
      setRedeemStatus({ show: true, success: false, message: res.error || 'Invalid code.' });
    }
    setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4500);
  };

  // Step 1: User clicks REDEEM → show confirmation modal
  const handleRedeemClick = (reward) => {
    if (!user) { onLoginClick(); return; }
    if (isBanned) {
      setRedeemStatus({ show: true, success: false, message: 'Account Restricted! Cannot redeem while restricted.' });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4000);
      return;
    }
    if (isOutOfStock(reward)) {
      setRedeemStatus({ show: true, success: false, message: `"${reward.title}" is out of stock!` });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4000);
      return;
    }
    if (coins < reward.cost) {
      setRedeemStatus({ show: true, success: false, message: `Need ${reward.cost - coins} more XO Coins!` });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 3500);
      return;
    }
    setConfirmingReward(reward); // show confirmation modal
  };

  // Step 2: User confirms → process redemption
  const handleConfirmRedeem = () => {
    if (!confirmingReward) return;
    const reward = confirmingReward;
    setConfirmingReward(null);

    setCoins(prev => prev - reward.cost);
    const result = recordStoreRedemption ? recordStoreRedemption(reward, user) : null;

    if (result && !result.success) {
      setCoins(prev => prev + reward.cost); // refund
      setRedeemStatus({ show: true, success: false, message: result.message || 'Redemption failed. Please try again.' });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4500);
      return;
    }

    if (result?.deliveredCode) {
      setDeliveredCode({ code: result.deliveredCode, rewardTitle: reward.title });
      showNotification('⚡ Code Delivered!', 'success', `Your ${reward.title} code is ready.`);
    } else {
      setRedeemStatus({ show: true, success: true, message: `✅ Redemption submitted for "${reward.title}"! Admin will deliver within 24-48 hours.` });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 5000);
      showNotification('🎁 Redemption Submitted!', 'success', `${reward.title} — Admin delivers in 24-48 hrs.`);
    }
  };

  const handleCopyCode = () => {
    if (deliveredCode?.code) {
      navigator.clipboard.writeText(deliveredCode.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  const getStatusBadge = (item) => {
    if (item.status === 'delivered') return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '✅ Delivered', icon: <CheckCircle size={12} /> };
    if (item.status === 'cancelled') return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '❌ Cancelled', icon: null };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '⏳ Pending (24-48 hrs)', icon: <Clock size={12} /> };
  };

  return (
    <div className="redeem-page fade-in">
      {redeemStatus.show && (
        <div className={`toast-message ${redeemStatus.success ? 'success' : 'error'}`}>
          {redeemStatus.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span>{redeemStatus.message}</span>
        </div>
      )}

      {/* ─── CONFIRMATION MODAL ─── */}
      {confirmingReward && (
        <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>🛒 Confirm Redemption</h3>
              <button className="modal-close-btn" onClick={() => setConfirmingReward(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '0 4px 4px' }}>
              <div style={{
                display: 'flex', gap: '14px', alignItems: 'center',
                background: 'rgba(255,255,255,0.04)', borderRadius: '10px',
                padding: '14px', marginBottom: '16px'
              }}>
                <img src={confirmingReward.image} alt={confirmingReward.title}
                  style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400'; }}
                />
                <div>
                  <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{confirmingReward.title}</p>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    background: confirmingReward.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                    color: confirmingReward.fulfillmentType === 'instant' ? '#10b981' : '#94a3b8',
                    border: `1px solid ${confirmingReward.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.15)'}`,
                  }}>
                    {confirmingReward.fulfillmentType === 'instant' ? '⚡ INSTANT DELIVERY' : '🔧 MANUAL (24-48 Hours)'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '12px 14px', background: 'rgba(251,191,36,0.07)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.15)' }}>
                <span style={{ color: '#94a3b8' }}>Cost</span>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>
                  🪙 {confirmingReward.cost.toLocaleString()} XO Coins
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', padding: '10px 14px', background: 'rgba(16,185,129,0.06)', borderRadius: '8px' }}>
                <span style={{ color: '#94a3b8', fontSize: '0.9rem' }}>Balance after</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>
                  {(coins - confirmingReward.cost).toLocaleString()} XO Coins
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="admin-btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmingReward(null)}>Cancel</button>
                <button className="admin-btn btn-primary" style={{ flex: 2 }} onClick={handleConfirmRedeem}>
                  ✅ Confirm &amp; Redeem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── INSTANT CODE DELIVERY MODAL ─── */}
      {deliveredCode && (
        <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ padding: '32px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#10b981', marginBottom: '8px', fontSize: '1.3rem' }}>Redemption Successful!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>
                Your <strong style={{ color: '#f1f5f9' }}>{deliveredCode.rewardTitle}</strong> code is ready.
              </p>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.35)', borderRadius: '12px', padding: '20px 16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>⚡ Your Redeem Code</p>
                <code style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '3px', color: '#ffffff', display: 'block', marginBottom: '12px', wordBreak: 'break-all' }}>
                  {deliveredCode.code}
                </code>
                <button onClick={handleCopyCode} style={{
                  background: copiedCode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)',
                  border: `1px solid ${copiedCode ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  color: copiedCode ? '#10b981' : '#94a3b8', padding: '8px 20px', borderRadius: '6px',
                  cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600
                }}>
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '8px' }}>📋 This code is also saved in your Redemption History for future reference.</p>
              <button onClick={() => { setDeliveredCode(null); setCopiedCode(false); }} className="admin-btn btn-primary" style={{ width: '100%' }}>Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── USER REDEMPTION HISTORY MODAL ─── */}
      {showHistory && (
        <div className="admin-modal-overlay" style={{ zIndex: 9998 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '580px' }}>
            <div className="modal-header">
              <div>
                <h3>📋 My Redemption History</h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>
                  Click any item to view details and your code
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => { setShowHistory(false); setSelectedHistoryItem(null); }}><X size={18} /></button>
            </div>

            {selectedHistoryItem ? (
              /* ── Detail View ── */
              <div style={{ padding: '4px 4px 8px' }}>
                <button onClick={() => setSelectedHistoryItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  ← Back to history
                </button>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
                  {selectedHistoryItem.image && (
                    <img src={selectedHistoryItem.image} alt="" style={{ width: '56px', height: '56px', borderRadius: '8px', objectFit: 'cover' }}
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  )}
                  <div>
                    <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{selectedHistoryItem.rewardTitle}</p>
                    <p style={{ fontSize: '0.78rem', color: '#64748b' }}>Redeemed: {selectedHistoryItem.redeemedAt}</p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ background: 'rgba(251,191,36,0.07)', borderRadius: '8px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>COST</p>
                    <p style={{ fontWeight: 700, color: '#fbbf24' }}>🪙 {selectedHistoryItem.cost?.toLocaleString()} XO</p>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '8px', padding: '10px 14px' }}>
                    <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginBottom: '4px' }}>STATUS</p>
                    <p style={{ fontWeight: 700, color: getStatusBadge(selectedHistoryItem).color }}>{getStatusBadge(selectedHistoryItem).label}</p>
                  </div>
                </div>

                {selectedHistoryItem.code ? (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>⚡ Your Delivered Code</p>
                    <code style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '2px', wordBreak: 'break-all', display: 'block', marginBottom: '10px' }}>
                      {selectedHistoryItem.code}
                    </code>
                    <button
                      onClick={() => { navigator.clipboard.writeText(selectedHistoryItem.code); }}
                      style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '6px 16px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                      <Copy size={12} /> Copy Code
                    </button>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '14px', marginBottom: '16px', textAlign: 'center' }}>
                    <Clock size={20} style={{ color: '#f59e0b', marginBottom: '6px' }} />
                    <p style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.9rem' }}>Manual Fulfillment Pending</p>
                    <p style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '4px' }}>Admin will deliver your reward within 24-48 hours.</p>
                  </div>
                )}
              </div>
            ) : (
              /* ── List View ── */
              <div style={{ maxHeight: '420px', overflowY: 'auto', padding: '4px 4px 8px' }}>
                {userHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b' }}>
                    <Package size={40} style={{ margin: '0 auto 12px', opacity: 0.4 }} />
                    <p style={{ fontWeight: 600 }}>No redemptions yet</p>
                    <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>Your redeemed items will appear here.</p>
                  </div>
                ) : (
                  userHistory.map(item => {
                    const badge = getStatusBadge(item);
                    return (
                      <div key={item.id} onClick={() => setSelectedHistoryItem(item)} style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '12px 14px', borderRadius: '8px', marginBottom: '6px',
                        background: 'rgba(255,255,255,0.04)', cursor: 'pointer',
                        border: '1px solid rgba(255,255,255,0.06)',
                        transition: 'all 0.2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      >
                        <div style={{ fontSize: '1.5rem' }}>
                          {item.rewardType === 'diamonds' ? '💎' : item.rewardType === 'giftcard' ? '🎟️' : '🎁'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.rewardTitle}</p>
                          <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>{item.redeemedAt}</p>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0 }}>
                          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: badge.bg, color: badge.color, display: 'block', marginBottom: '4px' }}>
                            {badge.label}
                          </span>
                          {item.code && <span style={{ fontSize: '0.65rem', color: '#10b981' }}>⚡ Code available</span>}
                        </div>
                        <ChevronRight size={16} style={{ color: '#475569', flexShrink: 0 }} />
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── MAIN PAGE ─── */}
      <div className="redeem-header-panel glass-panel">
        <div className="redeem-header-row">
          <div className="redeem-header-text">
            <h1 className="redeem-title">HAARSH XO REWARDS STORE</h1>
            <p className="redeem-subtitle">Spend your hard-earned XO Coins on Free Fire Diamonds, Play Store Codes, and Merch.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
            <div className="current-balance">
              <span className="balance-label">Your Balance:</span>
              <div className="balance-amount">
                <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-large" />
                <span>{coins}</span>
                <span className="balance-tag">XO COINS</span>
              </div>
            </div>
            {user && (
              <button onClick={() => setShowHistory(true)} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600
              }}>
                <History size={14} /> My Redemptions {userHistory.length > 0 && `(${userHistory.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="promo-box-banner">
          <div className="promo-box-left">
            <Gift size={20} className="text-amber" />
            <div>
              <strong>Have a Creator / Stream Promo Code?</strong>
              <p>Redeem official HAARSH XO promo codes for instant free XO Coins and tournament tickets.</p>
            </div>
          </div>
          <form onSubmit={handleApplyPromoCode} className="promo-box-form">
            <input type="text" placeholder="ENTER PROMO CODE (e.g. XOBOOYAH100)..."
              value={promoCodeInput} onChange={e => setPromoCodeInput(e.target.value.toUpperCase())} />
            <button type="submit" className="btn-claim-promo">CLAIM <ArrowRight size={14} /></button>
          </form>
        </div>

        <div className="redeem-panel-divider"></div>
        <div className="filter-group redeem-filters">
          <button className={`filter-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>All Rewards</button>
          <button className={`filter-btn ${filter === 'diamonds' ? 'active' : ''}`} onClick={() => setFilter('diamonds')}>Free Fire Diamonds</button>
          <button className={`filter-btn ${filter === 'giftcard' ? 'active' : ''}`} onClick={() => setFilter('giftcard')}>Gift Cards</button>
          <button className={`filter-btn ${filter === 'merch' ? 'active' : ''}`} onClick={() => setFilter('merch')}>Exclusive Merch</button>
        </div>
      </div>

      <div className="rewards-grid">
        {filteredRewards.map(reward => {
          const outOfStock = isOutOfStock(reward);
          const canAffordAndAvailable = coins >= reward.cost && !outOfStock;
          const isInstant = reward.fulfillmentType === 'instant';

          return (
            <div key={reward.id} className="reward-card glass-panel group" style={{ opacity: outOfStock ? 0.72 : 1 }}>
              <div className="reward-image-container">
                <img src={reward.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop'}
                  alt={reward.title} className="reward-image"
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop'; }}
                />
                <div className="reward-type-badge">{reward.type.toUpperCase()}</div>
                {reward.tag && <div className="reward-tag-badge">{reward.tag}</div>}
                {outOfStock && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit' }}>
                    <span style={{ background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.85rem', padding: '6px 14px', borderRadius: '6px', letterSpacing: '1px' }}>OUT OF STOCK</span>
                  </div>
                )}
              </div>

              <div className="reward-info">
                <h3 className="reward-title">{reward.title}</h3>
                <p className="reward-desc">{reward.description}</p>

                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
                    background: isInstant ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                    color: isInstant ? '#10b981' : '#94a3b8',
                    border: `1px solid ${isInstant ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.15)'}`,
                  }}>
                    {isInstant ? '⚡ INSTANT DELIVERY' : '🔧 MANUAL (24-48 Hours)'}
                  </span>
                </div>

                <div className="reward-footer">
                  <div className="reward-cost">
                    <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon" />
                    <span className={coins >= reward.cost ? 'text-gradient' : 'text-disabled'}>{reward.cost} XO</span>
                  </div>
                  <button
                    className={`btn-primary btn-redeem ${!canAffordAndAvailable ? 'disabled-btn' : ''}`}
                    onClick={() => handleRedeemClick(reward)}
                    disabled={!canAffordAndAvailable}
                  >
                    {outOfStock ? 'OUT OF STOCK' : (coins >= reward.cost ? 'REDEEM' : 'LOCKED')}
                  </button>
                </div>

                {!outOfStock && coins < reward.cost && (
                  <div className="progress-hint-wrap">
                    <span className="progress-hint-pill">Need {reward.cost - coins} more XO Coins</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Redeem;
