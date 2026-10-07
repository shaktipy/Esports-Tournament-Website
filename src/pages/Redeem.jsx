import { useState } from 'react';
import { Gift, CheckCircle, AlertCircle, Sparkles, Tag, ArrowRight } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin } from '../context/AdminContext';
import './Redeem.css';

const Redeem = ({ onLoginClick }) => {
  const [filter, setFilter] = useState('all');
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [redeemStatus, setRedeemStatus] = useState({ show: false, success: false, message: '' });

  const { coins, setCoins, setCsTickets, setBrTickets, user, showNotification, isBanned } = useGame();
  const { storeRewards, redeemPromoCode, recordStoreRedemption } = useAdmin();

  // Dynamic rewards from AdminContext (falling back to defaults if needed)
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

  const handleApplyPromoCode = (e) => {
    e.preventDefault();
    if (!promoCodeInput.trim()) return;

    if (!user) {
      onLoginClick();
      return;
    }

    const res = redeemPromoCode(promoCodeInput.trim(), user.uid || '849204812');
    if (res.success) {
      if (res.coins > 0) setCoins(prev => prev + res.coins);
      if (res.csTickets > 0) setCsTickets(prev => prev + res.csTickets);
      if (res.brTickets > 0) setBrTickets(prev => prev + res.brTickets);

      showNotification(
        '🎉 Code Redeemed Successfully!',
        'success',
        `Received: ${res.coins > 0 ? `+${res.coins} XO Coins ` : ''}${res.csTickets > 0 ? `+${res.csTickets} CS Tickets ` : ''}${res.brTickets > 0 ? `+${res.brTickets} BR Tickets` : ''}`
      );
      setRedeemStatus({
        show: true,
        success: true,
        message: `🎉 Code applied! ${res.description || 'Rewards added to your account.'}`
      });
      setPromoCodeInput('');
    } else {
      setRedeemStatus({
        show: true,
        success: false,
        message: res.error || 'Failed to redeem code.'
      });
    }
    setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4500);
  };

  const handleRedeem = (reward) => {
    if (!user) {
      onLoginClick();
      return;
    }

    if (isBanned) {
      setRedeemStatus({
        show: true,
        success: false,
        message: 'Account Restricted! You cannot redeem items while your account is restricted.'
      });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4000);
      return;
    }
    
    if (coins < reward.cost) {
      setRedeemStatus({
        show: true,
        success: false,
        message: `Not enough XO Coins! Need ${reward.cost - coins} more. Watch streams to earn.`
      });
      setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 3500);
      return;
    }

    // Process redemption
    setCoins(prev => prev - reward.cost);

    if (recordStoreRedemption) {
      recordStoreRedemption(reward, user);
    }

    setRedeemStatus({
      show: true,
      success: true,
      message: `🎉 Successfully redeemed ${reward.title}! Top-up queued for UID: ${user.uid || '123456789'}.`
    });
    setTimeout(() => setRedeemStatus({ show: false, success: false, message: '' }), 4500);
  };

  return (
    <div className="redeem-page fade-in">
      {redeemStatus.show && (
        <div className={`toast-message ${redeemStatus.success ? 'success' : 'error'}`}>
          {redeemStatus.success ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <span>{redeemStatus.message}</span>
        </div>
      )}

      {/* Unified Store Header, Balance & Filters Panel */}
      <div className="redeem-header-panel glass-panel">
        <div className="redeem-header-row">
          <div className="redeem-header-text">
            <h1 className="redeem-title">HAARSH XO REWARDS STORE</h1>
            <p className="redeem-subtitle">Spend your hard-earned XO Coins on Free Fire Diamonds, Play Store Codes, and Merch.</p>
          </div>

          <div className="current-balance">
            <span className="balance-label">Your Balance:</span>
            <div className="balance-amount">
              <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon-large" />
              <span>{coins}</span>
              <span className="balance-tag">XO COINS</span>
            </div>
          </div>
        </div>

        {/* Promo Code Box */}
        <div className="promo-box-banner">
          <div className="promo-box-left">
            <Gift size={20} className="text-amber" />
            <div>
              <strong>Have a Creator / Stream Promo Code?</strong>
              <p>Redeem official HAARSH XO promo codes for instant free XO Coins and tournament tickets.</p>
            </div>
          </div>
          <form onSubmit={handleApplyPromoCode} className="promo-box-form">
            <input 
              type="text" 
              placeholder="ENTER PROMO CODE (e.g. XOBOOYAH100)..."
              value={promoCodeInput}
              onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
            />
            <button type="submit" className="btn-claim-promo">
              CLAIM <ArrowRight size={14} />
            </button>
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
        {filteredRewards.map(reward => (
          <div key={reward.id} className="reward-card glass-panel group">
            <div className="reward-image-container">
              <img 
                src={reward.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop'} 
                alt={reward.title} 
                className="reward-image"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop';
                }}
              />
              <div className="reward-type-badge">{reward.type.toUpperCase()}</div>
              {reward.tag && <div className="reward-tag-badge">{reward.tag}</div>}
            </div>
            
            <div className="reward-info">
              <h3 className="reward-title">{reward.title}</h3>
              <p className="reward-desc">{reward.description}</p>
              
              <div className="reward-footer">
                <div className="reward-cost">
                  <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon" />
                  <span className={coins >= reward.cost ? 'text-gradient' : 'text-disabled'}>
                    {reward.cost} XO
                  </span>
                </div>
                
                <button 
                  className={`btn-primary btn-redeem ${coins < reward.cost ? 'disabled-btn' : ''}`}
                  onClick={() => handleRedeem(reward)}
                >
                  {coins >= reward.cost ? 'REDEEM' : 'LOCKED'}
                </button>
              </div>
              
              {coins < reward.cost && (
                <div className="progress-hint-wrap">
                  <span className="progress-hint-pill">
                    Need {reward.cost - coins} more XO Coins
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Redeem;
