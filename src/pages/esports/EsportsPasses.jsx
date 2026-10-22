import { useState } from 'react';
import { Zap, Shield, Crown, Ticket, Sparkles, CheckCircle2, IndianRupee, ShieldCheck, Loader2 } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useAdmin } from '../../context/AdminContext';
import './EsportsPasses.css';

// Pass definitions — amounts must match server/app.py VALID_PASSES exactly
const PASSES = [
  {
    id: 1,
    title: 'CLASH SQUAD TICKET PACK',
    subtitle: '5x CS Tournament Tickets',
    inrPrice: 39,
    grantCs: 5,
    grantBr: 0,
    grantCoins: 100,
    ticketImage: '/tokens/cs-ticket.png',
    ticketType: 'CS',
    icon: <Zap size={36} className="pass-icon solo-icon" />,
    features: [
      '5x CS Tournament Registration Tickets',
      '+100 Bonus XO Coins',
      'Entry to Master Tier 4v4 Cups',
      'Priority Slot Confirmation in Scrims',
      'Instant Auto-Approval in Custom Rooms',
    ],
    color: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    accentColor: '#10b981',
  },
  {
    id: 2,
    title: 'BATTLE ROYALE TICKET PACK',
    subtitle: '5x BR Tournament Tickets',
    inrPrice: 59,
    grantCs: 0,
    grantBr: 5,
    grantCoins: 150,
    ticketImage: '/tokens/br-ticket.png',
    ticketType: 'BR',
    icon: <Shield size={36} className="pass-icon squad-icon" />,
    features: [
      '5x BR Tournament Registration Tickets',
      '+150 Bonus XO Coins',
      'Entry to Invitational & Lone Wolf Cups',
      'Squad Slot Reservation in Bermuda Scrims',
      'Live Stream Shoutout during Finals',
    ],
    color: 'linear-gradient(135deg, #94a3b8 0%, #475569 100%)',
    accentColor: '#94a3b8',
    popular: true,
  },
  {
    id: 3,
    title: 'HAARSH XO ALL-STAR COMBO',
    subtitle: '5x CS Tickets + 5x BR Tickets',
    inrPrice: 99,
    grantCs: 5,
    grantBr: 5,
    grantCoins: 300,
    ticketImage: '/tokens/mascot-logo.png',
    ticketType: 'COMBO',
    icon: <Crown size={36} className="pass-icon pro-icon" />,
    features: [
      '10 Total Tournament Tickets (5 CS + 5 BR)',
      '+300 Bonus XO Coins',
      'Unlimited Entry into Weekly Practice Scrims',
      'Verified Competitor Role in Discord',
      'Eligible for Cash Prize Pools & Diamonds',
    ],
    color: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
    accentColor: '#f59e0b',
    bestValue: true,
  },
];

// Dynamically load Razorpay checkout.js once
const loadRazorpay = () =>
  new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

const BACKEND = import.meta.env.VITE_BACKEND_URL || '';

// Map ticketType to icon for passes coming from AdminContext (which store no JSX)
const getPassIcon = (pass) => {
  if (pass.icon) return pass.icon;
  if (pass.ticketType === 'CS') return <Zap size={36} className="pass-icon solo-icon" />;
  if (pass.ticketType === 'BR') return <Shield size={36} className="pass-icon squad-icon" />;
  return <Crown size={36} className="pass-icon pro-icon" />;
};

const EsportsPasses = () => {
  const { coins, csTickets, brTickets, addTickets, showNotification, user } = useGame();
  const { passes: adminPasses, recordPayment } = useAdmin();
  const [processingId, setProcessingId] = useState(null);
  const [purchasedId, setPurchasedId] = useState(null);

  const activePasses = (adminPasses && adminPasses.length > 0) 
    ? adminPasses.filter(p => p.active !== false) 
    : PASSES;

  const handleBuyPass = async (pass) => {
    setProcessingId(pass.id);

    try {
      // ── Step 1: Load Razorpay script ──────────────────────────────────────
      const loaded = await loadRazorpay();
      if (!loaded) {
        showNotification('Payment Error', 'warning', 'Could not load Razorpay. Check your internet connection.');
        setProcessingId(null);
        return;
      }

      // ── Step 2: Create order on our Flask backend ─────────────────────────
      const orderRes = await fetch(`${BACKEND}/api/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pass_id: pass.id }),
      });

      if (!orderRes.ok) {
        const err = await orderRes.json();
        throw new Error(err.error || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // ── Step 3: Open Razorpay Checkout popup ──────────────────────────────
      const options = {
        key:         orderData.key_id,
        amount:      orderData.amount,
        currency:    orderData.currency,
        order_id:    orderData.order_id,
        name:        'HAARSH XO ESPORTS',
        description: pass.title,
        image:       '/tokens/harsh-avatar.png',
        prefill: {
          name:    user?.inGameName || '',
          email:   '',
          contact: '',
        },
        theme: { color: pass.accentColor || '#ef4444' },

        // ── Step 4: On success → verify on backend before granting tickets & coins ──
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${BACKEND}/api/verify-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
                pass_id:             pass.id,
                user_uid:            user?.uid || '849204812',
                user_ign:            user?.inGameName || 'Player',
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              const coinsGranted = Number(verifyData.grant_coins ?? pass.grantCoins ?? 0);

              // Grant tickets and coins only after backend confirms valid signature
              addTickets(verifyData.grant_cs, verifyData.grant_br, coinsGranted);
              
              // Record payment in Admin ledger
              if (recordPayment) {
                recordPayment({
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  passId: pass.id,
                  passTitle: pass.title,
                  amount: pass.inrPrice,
                  currency: 'INR',
                  userUid: user?.uid || '849204812',
                  userIgn: user?.inGameName || 'Player'
                });
              }

              setPurchasedId(pass.id);
              const rewardsParts = [];
              if (verifyData.grant_cs > 0) rewardsParts.push(`+${verifyData.grant_cs} CS Tickets`);
              if (verifyData.grant_br > 0) rewardsParts.push(`+${verifyData.grant_br} BR Tickets`);
              if (coinsGranted > 0) rewardsParts.push(`+${coinsGranted} XO Coins`);

              showNotification(
                '🎉 Payment Verified!',
                'success',
                `${pass.title} activated! ${rewardsParts.join(' & ')} added to your balance.`
              );
              setTimeout(() => setPurchasedId(null), 4500);
            } else {
              showNotification('Verification Failed', 'warning', verifyData.error || 'Payment could not be verified.');
            }
          } catch {
            showNotification('Verification Error', 'warning', 'Could not reach server to verify payment.');
          }
          setProcessingId(null);
        },

        modal: {
          ondismiss: () => setProcessingId(null),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        showNotification('Payment Failed', 'warning', resp.error?.description || 'Transaction declined. Please try again.');
        setProcessingId(null);
      });
      rzp.open();

    } catch (err) {
      showNotification('Error', 'warning', err.message || 'Could not initiate payment. Please try again.');
      setProcessingId(null);
    }
  };

  return (
    <div className="esports-passes fade-in">
      <div className="passes-header">
        <h1 className="passes-title">TOURNAMENT TICKET PASSES</h1>
        <p className="passes-subtitle">
          Purchase official CS and BR Tournament Registration Tickets with a secure one-time INR payment via Razorpay.
        </p>

        {/* Active Ticket & Coin Balance */}
        <div className="passes-balance-card glass-panel">
          <div className="user-tickets-badge">
            <span className="balance-lbl">Your Active Balance:</span>
            <div className="ticket-counts-group">
              <span className="count-pill coins">
                <img src="/tokens/xo-coin.png" alt="XO Coin" className="coin-pill-img" />
                {coins} XO Coins
              </span>
              <span className="count-pill cs">
                <img src="/tokens/cs-ticket.png" alt="CS" className="ticket-tiny" />
                {csTickets} CS Tickets
              </span>
              <span className="count-pill br">
                <img src="/tokens/br-ticket.png" alt="BR" className="ticket-tiny" />
                {brTickets} BR Tickets
              </span>
            </div>
          </div>

          <div className="secure-badge">
            <ShieldCheck size={15} className="shield-icon" />
            <span>Payments secured by Razorpay</span>
          </div>
        </div>
      </div>

      <div className="passes-grid">
        {activePasses.map((pass) => {
          const isProcessing = processingId === pass.id;
          const isPurchased  = purchasedId  === pass.id;

          return (
            <div
              key={pass.id}
              className={`pass-card ${pass.popular ? 'popular' : ''} ${pass.bestValue ? 'best-value' : ''}`}
            >
              {pass.popular   && <div className="popular-badge">RECOMMENDED</div>}
              {pass.bestValue && <div className="popular-badge best-value-badge">BEST VALUE</div>}

              {/* Coloured Header */}
              <div className="pass-card-header" style={{ background: pass.color }}>
                <div className="pass-icon-container">{getPassIcon(pass)}</div>
                <h2 className="pass-name">{pass.title}</h2>
                <p className="pass-sub">{pass.subtitle}</p>

                {/* INR Price */}
                <div className="pass-price-tag">
                  <span className="price-lbl">One-time payment:</span>
                  <div className="price-num inr-price">
                    <IndianRupee size={18} strokeWidth={2.5} />
                    <span>{pass.inrPrice}</span>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="pass-card-body glass-panel">
                {/* Ticket / Image Preview */}
                <div className="pass-ticket-preview">
                  <img
                    src={pass.ticketImage}
                    alt={pass.title}
                    className={`pass-ticket-img ${pass.ticketType === 'COMBO' ? 'pass-ticket-cover' : ''}`}
                  />
                </div>

                {/* Rewards Highlights */}
                <div className="pass-rewards-chips">
                  {pass.grantCs > 0 && (
                    <span className="reward-chip cs">
                      <img src="/tokens/cs-ticket.png" alt="CS" className="chip-img" />
                      +{pass.grantCs} CS Tickets
                    </span>
                  )}
                  {pass.grantBr > 0 && (
                    <span className="reward-chip br">
                      <img src="/tokens/br-ticket.png" alt="BR" className="chip-img" />
                      +{pass.grantBr} BR Tickets
                    </span>
                  )}
                  {pass.grantCoins > 0 && (
                    <span className="reward-chip coins">
                      <img src="/tokens/xo-coin.png" alt="XO Coin" className="chip-coin-img" />
                      +{pass.grantCoins} XO Coins
                    </span>
                  )}
                </div>

                <ul className="pass-features">
                  {pass.features.map((f, i) => {
                    const isCoinFeature = f.toLowerCase().includes('xo coins') || f.toLowerCase().includes('coins');
                    return (
                      <li key={i}>
                        {isCoinFeature ? (
                          <img src="/tokens/xo-coin.png" alt="XO Coin" className="feature-coin-bullet" />
                        ) : (
                          <Sparkles size={16} className="feature-bullet" />
                        )}
                        <span>{f.replace('🪙', '').trim()}</span>
                      </li>
                    );
                  })}
                </ul>

                <button
                  className={`purchase-btn ${isPurchased ? 'purchased-glow' : ''} ${isProcessing ? 'processing' : ''}`}
                  onClick={() => handleBuyPass(pass)}
                  disabled={isProcessing || isPurchased}
                  style={{ background: isPurchased ? 'rgba(16,185,129,0.25)' : pass.color }}
                >
                  {isPurchased ? (
                    <><CheckCircle2 size={20} /> REWARDS ACTIVATED!</>
                  ) : isProcessing ? (
                    <><Loader2 size={20} className="spin-icon" /> OPENING PAYMENT...</>
                  ) : (
                    <><Ticket size={20} /> BUY NOW — ₹{pass.inrPrice}</>
                  )}
                </button>

                <p className="razorpay-note">
                  <ShieldCheck size={12} /> UPI · Cards · Net Banking · Wallets via Razorpay
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EsportsPasses;
