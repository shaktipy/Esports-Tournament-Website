import { useState, useEffect } from 'react';
import { ShoppingBag, Tag, CheckCircle2, Copy, Check, AlertCircle, History, ChevronRight, X, Clock, Package } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAdmin } from '../../context/AdminContext';
import './EsportsRedeem.css';

const REDEEM_ITEMS = [
  {
    id: 1,
    title: '100 FREE FIRE DIAMONDS',
    type: 'diamonds',
    cost: 1000,
    image: 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
    description: 'Instant direct top-up to your Free Fire account via UID.',
    tag: 'INSTANT UID TOPUP'
  },
  {
    id: 2,
    title: '₹50 GOOGLE PLAY REDEEM CODE',
    type: 'giftcard',
    cost: 2200,
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    description: 'Instant ₹50 Google Play Store redeem code for in-game purchases.',
    tag: 'HOT REWARD'
  },
  {
    id: 3,
    title: '310 FF DIAMONDS BUNDLE',
    type: 'diamonds',
    cost: 2900,
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    description: 'Special tournament winners diamond top-up bundle.',
    tag: 'BEST VALUE'
  },
  {
    id: 4,
    title: 'WEEKLY FF MEMBERSHIP',
    type: 'diamonds',
    cost: 3000,
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=2071&auto=format&fit=crop',
    description: 'Receive 450 total diamonds over 7 days + exclusive weekly icons.',
    tag: 'MEMBERSHIP'
  },
  {
    id: 5,
    title: 'HAARSH XO OFFICIAL PRO JERSEY',
    type: 'merch',
    cost: 8500,
    tag: 'LIMITED EDITION',
    image: 'https://plus.unsplash.com/premium_photo-1673356302067-aac3b545a31f?q=80&w=2069&auto=format&fit=crop',
    description: 'Official HAARSH XO Esports tournament player jersey with customized gamertag.'
  },
  {
    id: 6,
    title: 'PRO ESPORTS FINGER SLEEVES (PAIR)',
    type: 'merch',
    cost: 1500,
    tag: 'GAMING GEAR',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2070&auto=format&fit=crop',
    description: 'Ultra-sensitive breathable fiber finger sleeves for smooth drag shots.'
  },
  {
    id: 7,
    title: '520 FF DIAMONDS MEGA PACK',
    type: 'diamonds',
    cost: 4800,
    tag: 'MEGA TOPUP',
    image: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?q=80&w=2165&auto=format&fit=crop',
    description: 'Direct top-up of 520 FF Diamonds for Elite pass & weapon spins.'
  },
  {
    id: 8,
    title: '₹100 GOOGLE PLAY GIFT CARD',
    type: 'giftcard',
    cost: 4500,
    tag: 'GIFT CARD',
    image: 'https://images.unsplash.com/photo-1606144042871-2ed4a9aacf39?q=80&w=2070&auto=format&fit=crop',
    description: 'Instant ₹100 Google Play digital code delivered to your registered email.'
  }
];

const EsportsRedeem = () => {
  const [filter, setFilter] = useState('all');
  const [confirmingItem, setConfirmingItem] = useState(null);  // confirmation modal
  const [deliveredCode, setDeliveredCode] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState(null);
  const [userHistory, setUserHistory] = useState([]);
  const { coins, setCoins, showNotification, user, isBanned } = useGame();
  const { storeRewards, recordStoreRedemption } = useAdmin();

  useEffect(() => {
    if (!user?.uid) return;
    try {
      const key = `haarshxo_user_redemptions_${user.uid}`;
      const saved = localStorage.getItem(key);
      if (saved) setUserHistory(JSON.parse(saved));
    } catch {}
  }, [user?.uid, deliveredCode]);

  const currentItems = (storeRewards && storeRewards.length > 0)
    ? storeRewards.filter(r => (r.storeType || 'arena') === 'arena' && r.active !== false)
    : REDEEM_ITEMS;

  const filteredItems = currentItems.filter(item => {
    if (filter === 'all') return true;
    return item.type === filter;
  });

  const isOutOfStock = (item) => {
    if (Number(item.stock) <= 0) return true;
    if (item.fulfillmentType === 'instant') {
      const available = (item.instantCodes || []).filter(c => !c.used).length;
      return available <= 0;
    }
    return false;
  };

  const getStatusBadge = (item) => {
    if (item.status === 'delivered') return { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: '✅ Delivered' };
    if (item.status === 'cancelled') return { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', label: '❌ Cancelled' };
    return { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', label: '⏳ Pending (24-48 hrs)' };
  };

  // Step 1: show confirmation
  const handleRedeemClick = (item) => {
    if (isBanned) { showNotification('Account Restricted', 'error', 'Restricted.'); return; }
    if (isOutOfStock(item)) { showNotification('Out of Stock', 'warning', `"${item.title}" is out of stock.`); return; }
    if (coins < item.cost) { showNotification('Not enough XO Coins!', 'warning', `Need ${item.cost - coins} more.`); return; }
    setConfirmingItem(item);
  };

  // Step 2: confirmed
  const handleConfirmRedeem = () => {
    if (!confirmingItem) return;
    const item = confirmingItem;
    setConfirmingItem(null);

    setCoins(prev => prev - item.cost);
    const result = recordStoreRedemption ? recordStoreRedemption(item, user) : null;

    if (result && !result.success) {
      setCoins(prev => prev + item.cost);
      showNotification('Redemption Failed', 'error', result.message || 'Please try again.');
      return;
    }

    if (result?.deliveredCode) {
      setDeliveredCode({ code: result.deliveredCode, rewardTitle: item.title });
      showNotification('⚡ Code Delivered!', 'success', `Your ${item.title} code is ready.`);
    } else {
      showNotification(`🎁 Redeemed: ${item.title}!`, 'success', 'Admin will deliver within 24-48 hours.');
    }
  };

  const handleCopyCode = () => {
    if (deliveredCode?.code) {
      navigator.clipboard.writeText(deliveredCode.code);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  return (
    <div className="esports-redeem fade-in">

      {/* ─── CONFIRMATION MODAL ─── */}
      {confirmingItem && (
        <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h3>🛒 Confirm Redemption</h3>
              <button className="modal-close-btn" onClick={() => setConfirmingItem(null)}><X size={18} /></button>
            </div>
            <div style={{ padding: '0 4px 4px' }}>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
                <img src={confirmingItem.image || ''} alt={confirmingItem.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover' }}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=400'; }}
                />
                <div>
                  <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{confirmingItem.title}</p>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    background: confirmingItem.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                    color: confirmingItem.fulfillmentType === 'instant' ? '#10b981' : '#94a3b8',
                    border: `1px solid ${confirmingItem.fulfillmentType === 'instant' ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.15)'}`,
                  }}>{confirmingItem.fulfillmentType === 'instant' ? '⚡ INSTANT DELIVERY' : '🔧 MANUAL (24-48 Hours)'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '12px 14px', background: 'rgba(251,191,36,0.07)', borderRadius: '8px', border: '1px solid rgba(251,191,36,0.15)' }}>
                <span style={{ color: '#94a3b8' }}>Cost</span>
                <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>🪙 {confirmingItem.cost.toLocaleString()} XO Coins</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="admin-btn btn-secondary" style={{ flex: 1 }} onClick={() => setConfirmingItem(null)}>Cancel</button>
                <button className="admin-btn btn-primary" style={{ flex: 2 }} onClick={handleConfirmRedeem}>✅ Confirm &amp; Redeem</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── CODE DELIVERY MODAL ─── */}
      {deliveredCode && (
        <div className="admin-modal-overlay" style={{ zIndex: 9999 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '420px', textAlign: 'center' }}>
            <div style={{ padding: '32px 24px' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🎉</div>
              <h3 style={{ color: '#10b981', marginBottom: '8px', fontSize: '1.3rem' }}>Redemption Successful!</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Your <strong style={{ color: '#f1f5f9' }}>{deliveredCode.rewardTitle}</strong> code is ready.</p>
              <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.35)', borderRadius: '12px', padding: '20px 16px', marginBottom: '20px' }}>
                <p style={{ fontSize: '0.75rem', color: '#10b981', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>⚡ Your Redeem Code</p>
                <code style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '3px', color: '#fff', display: 'block', marginBottom: '12px', wordBreak: 'break-all' }}>{deliveredCode.code}</code>
                <button onClick={handleCopyCode} style={{ background: copiedCode ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', border: `1px solid ${copiedCode ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'}`, color: copiedCode ? '#10b981' : '#94a3b8', padding: '8px 20px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 600 }}>
                  {copiedCode ? <Check size={14} /> : <Copy size={14} />}{copiedCode ? 'Copied!' : 'Copy Code'}
                </button>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '20px' }}>📋 This code is saved in your Redemption History.</p>
              <button onClick={() => { setDeliveredCode(null); setCopiedCode(false); }} className="admin-btn btn-primary" style={{ width: '100%' }}>Done ✓</button>
            </div>
          </div>
        </div>
      )}

      {/* ─── HISTORY MODAL ─── */}
      {showHistory && (
        <div className="admin-modal-overlay" style={{ zIndex: 9998 }}>
          <div className="admin-modal glass-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div><h3>📋 My Redemption History</h3><p style={{ fontSize: '0.8rem', color: '#64748b', margin: '3px 0 0' }}>Click item to view code</p></div>
              <button className="modal-close-btn" onClick={() => { setShowHistory(false); setSelectedHistoryItem(null); }}><X size={18} /></button>
            </div>
            {selectedHistoryItem ? (
              <div style={{ padding: '4px 4px 8px' }}>
                <button onClick={() => setSelectedHistoryItem(null)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '0.85rem', marginBottom: '12px' }}>← Back</button>
                <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: '4px' }}>{selectedHistoryItem.rewardTitle}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748b', marginBottom: '14px' }}>{selectedHistoryItem.redeemedAt}</p>
                {selectedHistoryItem.code ? (
                  <div style={{ background: 'rgba(16,185,129,0.08)', border: '2px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '16px', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.72rem', color: '#10b981', marginBottom: '8px', textTransform: 'uppercase' }}>⚡ Delivered Code</p>
                    <code style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', letterSpacing: '2px', wordBreak: 'break-all', display: 'block', marginBottom: '10px' }}>{selectedHistoryItem.code}</code>
                    <button onClick={() => navigator.clipboard.writeText(selectedHistoryItem.code)} style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', color: '#94a3b8', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}><Copy size={12} /> Copy</button>
                  </div>
                ) : (
                  <div style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
                    <Clock size={20} style={{ color: '#f59e0b', marginBottom: '6px' }} />
                    <p style={{ color: '#f59e0b', fontWeight: 600 }}>Pending — Admin delivers in 24-48 hrs</p>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxHeight: '340px', overflowY: 'auto', padding: '4px 4px 8px' }}>
                {userHistory.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '36px 20px', color: '#64748b' }}><Package size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} /><p>No redemptions yet</p></div>
                ) : userHistory.map(item => {
                  const badge = getStatusBadge(item);
                  return (
                    <div key={item.id} onClick={() => setSelectedHistoryItem(item)}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '8px', marginBottom: '6px', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.06)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                    >
                      <div style={{ fontSize: '1.4rem' }}>{item.rewardType === 'diamonds' ? '💎' : item.rewardType === 'giftcard' ? '🎟️' : '🎁'}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: 600, color: '#f1f5f9', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.rewardTitle}</p>
                        <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>{item.redeemedAt}</p>
                      </div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', background: badge.bg, color: badge.color, flexShrink: 0 }}>{badge.label}</span>
                      <ChevronRight size={14} style={{ color: '#475569', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── STORE HEADER ─── */}
      <div className="redeem-header-panel glass-panel">
        <div className="redeem-header-row">
          <div className="redeem-header-text">
            <h1 className="redeem-title">XO REWARDS STORE</h1>
            <p className="redeem-subtitle">Exchange your hard-earned XO Coins for Free Fire Diamonds, Google Play Codes, and Official HAARSH XO Merch.</p>
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
              <button onClick={() => setShowHistory(true)} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                <History size={14} /> My Redemptions {userHistory.length > 0 && `(${userHistory.length})`}
              </button>
            )}
          </div>
        </div>

        <div className="redeem-panel-divider"></div>

        <div className="filter-group redeem-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            ALL ITEMS
          </button>
          <button 
            className={`filter-btn ${filter === 'diamonds' ? 'active' : ''}`}
            onClick={() => setFilter('diamonds')}
          >
            FF DIAMONDS
          </button>
          <button 
            className={`filter-btn ${filter === 'giftcard' ? 'active' : ''}`}
            onClick={() => setFilter('giftcard')}
          >
            PLAY CODES
          </button>
          <button 
            className={`filter-btn ${filter === 'merch' ? 'active' : ''}`}
            onClick={() => setFilter('merch')}
          >
            MERCHANDISE
          </button>
        </div>
      </div>

      <div className="redeem-grid">
        {filteredItems.map(item => {
          const outOfStock = isOutOfStock(item);
          const canAfford = coins >= item.cost;
          const canRedeem = canAfford && !outOfStock;
          const isInstant = item.fulfillmentType === 'instant';

          return (
            <div key={item.id} className="redeem-card glass-panel" style={{ opacity: outOfStock ? 0.72 : 1 }}>
              <div className="r-image-container">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop'} 
                  alt={item.title} 
                  className="r-item-image"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop';
                  }}
                />
                {item.tag && <div className="r-type-badge">{item.tag}</div>}
                {outOfStock && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'inherit'
                  }}>
                    <span style={{ background: '#ef4444', color: '#fff', fontWeight: 800, fontSize: '0.8rem', padding: '5px 12px', borderRadius: '6px', letterSpacing: '1px' }}>
                      OUT OF STOCK
                    </span>
                  </div>
                )}
              </div>

              <div className="r-item-details">
                <h3 className="r-item-title">{item.title}</h3>
                <p className="r-item-desc">{item.description}</p>

                {/* Fulfillment badge */}
                <div style={{ marginBottom: '8px' }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700, padding: '2px 7px', borderRadius: '4px',
                    background: isInstant ? 'rgba(16,185,129,0.12)' : 'rgba(148,163,184,0.12)',
                    color: isInstant ? '#10b981' : '#94a3b8',
                    border: `1px solid ${isInstant ? 'rgba(16,185,129,0.25)' : 'rgba(148,163,184,0.15)'}`,
                  }}>
                    {isInstant ? '⚡ INSTANT DELIVERY' : '🔧 MANUAL (24-48 Hours)'}
                  </span>
                </div>

                <div className="r-reward-footer">
                  <div className="r-reward-cost">
                    <img src="/tokens/xo-coin.png" alt="XO Coin" className="r-coin-icon" />
                    <span className={canAfford ? 'r-cost-affordable' : 'r-cost-locked'}>
                      {item.cost} XO
                    </span>
                  </div>
                  <button
                    className={`r-redeem-btn ${canRedeem ? 'affordable' : 'locked'}`}
                    onClick={() => handleRedeemClick(item)}
                    disabled={!canRedeem}
                  >
                    {outOfStock ? 'OUT OF STOCK' : (canAfford ? 'REDEEM' : 'LOCKED')}
                  </button>
                </div>

                {!outOfStock && !canAfford && (
                  <div className="r-progress-hint-wrap">
                    <span className="r-progress-hint-pill">
                      Need {item.cost - coins} more XO Coins
                    </span>
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

export default EsportsRedeem;
