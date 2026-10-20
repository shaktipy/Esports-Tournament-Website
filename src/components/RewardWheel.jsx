import { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Gift, X, Sparkles, Coins } from 'lucide-react';
import './RewardWheel.css';

const WHEEL_SEGMENTS = [
  { id: 1, label: 'Better luck next time', displayLabel: 'Better Luck', emoji: '🤞', image: null, color: '#1e293b', chance: 35, type: 'empty' },
  { id: 2, label: '10 XO Coins', displayLabel: '10 XO Coins', emoji: '🪙', image: '/tokens/xo-coin.png', color: '#4338ca', chance: 25, rewardCoins: 10, type: 'coins' },
  { id: 3, label: '1 CS Ticket', displayLabel: '1 CS Ticket', emoji: '🎫', image: '/tokens/cs-ticket.png', color: '#0891b2', chance: 4, rewardCs: 1, type: 'cs' },
  { id: 4, label: '20 XO Coins', displayLabel: '20 XO Coins', emoji: '🪙', image: '/tokens/xo-coin.png', color: '#059669', chance: 20, rewardCoins: 20, type: 'coins' },
  { id: 5, label: 'Better luck next time', displayLabel: 'Better Luck', emoji: '😢', image: null, color: '#334155', chance: 1, type: 'empty' },
  { id: 6, label: '50 XO Coins', displayLabel: '50 XO Coins', emoji: '💰', image: '/tokens/xo-coin.png', color: '#d97706', chance: 10, rewardCoins: 50, type: 'coins' },
  { id: 7, label: '1 BR Ticket', displayLabel: '1 BR Ticket', emoji: '🎟️', image: '/tokens/br-ticket.png', color: '#7c3aed', chance: 4, rewardBr: 1, type: 'br' },
  { id: 8, label: '100 Free Fire Diamonds', displayLabel: '100 Diamonds', emoji: '💎', image: null, color: '#db2777', chance: 1, rewardDiamonds: 100, type: 'diamonds' },
];

const NUM_SEGMENTS = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

const RewardWheel = ({ onClose }) => {
  const { coins, setCoins, setCsTickets, setBrTickets, recordWheelSpin, wheelSpinData, showNotification } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const currentRotRef = useRef(0);

  const SPIN_COST = 0; // 1 Free Spin Per Day as per configuration
  const today = new Date().toDateString();
  const alreadySpunToday = wheelSpinData.lastSpinDate === today;

  const handleSpin = useCallback(() => {
    if (spinning) return;

    if (alreadySpunToday) {
      showNotification("Already Spun Today!", 'waiting', "Come back tomorrow for your next lucky daily spin!");
      return;
    }

    setSpinning(true);
    setWinner(null);

    // Exact Probability-based Luck System (Weights summing to 100%):
    // 35% + 25% + 20% + 10% + 4% + 4% + 1% + 1% = 100%
    const rand = Math.random() * 100;
    let cumulative = 0;
    let winnerIndex = 0;

    for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
      cumulative += WHEEL_SEGMENTS[i].chance;
      if (rand < cumulative) {
        winnerIndex = i;
        break;
      }
    }
    const winningSegment = WHEEL_SEGMENTS[winnerIndex];

    const segmentCenterAngle = winnerIndex * SEGMENT_ANGLE + SEGMENT_ANGLE / 2;
    const extraSpins = 5 * 360 + (360 - segmentCenterAngle);
    const newRotation = currentRotRef.current + extraSpins;

    setRotation(newRotation);
    currentRotRef.current = newRotation;

    // After animation (4.2s), show result & sliding toast
    setTimeout(() => {
      setSpinning(false);
      setWinner(winningSegment);

      if (winningSegment.type === 'empty') {
        recordWheelSpin(winningSegment.label);
        showNotification(
          'Better Luck Next Time!',
          'waiting',
          'No reward this time, but come back tomorrow for another daily lucky spin!'
        );
      } else {
        // Give reward
        if (winningSegment.rewardCoins) setCoins(prev => prev + winningSegment.rewardCoins);
        if (winningSegment.rewardCs) setCsTickets(prev => prev + winningSegment.rewardCs);
        if (winningSegment.rewardBr) setBrTickets(prev => prev + winningSegment.rewardBr);

        recordWheelSpin(winningSegment.label);

        if (winningSegment.type === 'diamonds') {
          showNotification(
            '💎 JACKPOT! 100 Free Fire Diamonds Won!',
            'jackpot',
            'Take a screenshot and contact Admin or support to claim your 100 Diamonds voucher!'
          );
        } else {
          showNotification(
            '🎊 Congratulations! You Won:',
            'spin',
            `${winningSegment.label} has been added to your inventory!`
          );
        }
      }
    }, 4200);
  }, [spinning, alreadySpunToday, setCoins, setCsTickets, setBrTickets, recordWheelSpin, showNotification]);

  const handleAlreadySpunClick = () => {
    showNotification("Already Spun Today!", 'tomorrow', "Come back tomorrow for your next lucky spin.");
  };

  // SVG Wheel geometry
  const cx = 200, cy = 200, r = 185;

  const getSegmentPath = (index) => {
    const startAngle = index * SEGMENT_ANGLE - 90;
    const endAngle = startAngle + SEGMENT_ANGLE;
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2} Z`;
  };

  const getLabelPos = (index) => {
    const midAngle = index * SEGMENT_ANGLE + SEGMENT_ANGLE / 2 - 90;
    const rad = (midAngle * Math.PI) / 180;
    const textRadius = r * 0.65;
    return {
      x: cx + textRadius * Math.cos(rad),
      y: cy + textRadius * Math.sin(rad),
      rotate: midAngle + 90,
    };
  };

  return (
    <div className="wheel-overlay" onClick={onClose}>

      <div className="wheel-modal glass-panel" onClick={e => e.stopPropagation()}>
        {/* Top Close Cross Button */}
        <button className="wheel-close-x-btn" onClick={onClose} aria-label="Close Fortune Wheel modal">
          <X size={26} />
        </button>

        {/* Modal Header */}
        <div className="wheel-header">
          <div className="wheel-tag">
            <Sparkles size={14} />
            <span>DAILY LUCKY DRAW</span>
          </div>
          <h2 className="wheel-title text-gradient">FORTUNE REWARD WHEEL</h2>
          <p className="wheel-subtitle">
            Spin once per day! Win up to 50 XO Coins, Tournament Tickets, or 100 Free Fire Diamonds!
          </p>

          <div className="wheel-meta-bar">
            <div className="wheel-meta-item">
              <span className="wmi-lbl">Daily Spin:</span>
              <span className="wmi-val cost">1 Free / Day</span>
            </div>
            <div className="wheel-meta-item">
              <span className="wmi-lbl">Your Balance:</span>
              <span className="wmi-val coins"><Coins size={14} /> {coins} XO</span>
            </div>
            <div className="wheel-meta-item">
              <span className="wmi-lbl">Total Spins:</span>
              <span className="wmi-val">{wheelSpinData.totalSpins || 0}</span>
            </div>
          </div>
        </div>

        {/* Wheel Display Section */}
        <div className="wheel-body">
          <div className="wheel-stage">
            {/* Top Pointer */}
            <div className="wheel-pointer-pin">
              <div className="pin-triangle"></div>
            </div>

            {/* SVG Wheel */}
            <div className="wheel-svg-container">
              <svg
                viewBox="0 0 400 400"
                className="wheel-svg"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: spinning ? 'transform 4.2s cubic-bezier(0.17, 0.67, 0.12, 0.99)' : 'none',
                }}
              >
                <circle cx={cx} cy={cy} r={r + 10} fill="#141624" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="6" />

                {WHEEL_SEGMENTS.map((seg, i) => {
                  const { x, y, rotate } = getLabelPos(i);
                  const isCoin = seg.type === 'coins';

                  return (
                    <g key={seg.id}>
                      <path
                        d={getSegmentPath(i)}
                        fill={seg.color}
                        stroke="#090b14"
                        strokeWidth="3"
                      />
                      <g transform={`rotate(${rotate}, ${x}, ${y})`}>
                        {seg.image ? (
                          <image
                            href={seg.image}
                            x={x - (isCoin ? 15 : 18)}
                            y={y - 25}
                            width={isCoin ? 30 : 36}
                            height={isCoin ? 30 : 26}
                            preserveAspectRatio="xMidYMid meet"
                            style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.7))' }}
                          />
                        ) : (
                          <text
                            x={x}
                            y={y - 12}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fontSize="22"
                            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' }}
                          >
                            {seg.emoji}
                          </text>
                        )}
                        <text
                          x={x}
                          y={y + 13}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10.5"
                          fontWeight="900"
                          fill="#ffffff"
                          stroke="#000000"
                          strokeWidth="0.8"
                          paintOrder="stroke fill"
                          letterSpacing="0.2"
                          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}
                        >
                          {seg.displayLabel || seg.label}
                        </text>
                      </g>
                    </g>
                  );
                })}

                {/* Center Hub */}
                <circle cx={cx} cy={cy} r="32" fill="#0b0c14" stroke="rgba(255,255,255,0.25)" strokeWidth="4" />
                <circle cx={cx} cy={cy} r="24" fill="rgba(168, 85, 247, 0.2)" stroke="rgba(168, 85, 247, 0.8)" strokeWidth="2" />
                <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fontSize="13" fill="#a855f7" fontWeight="900">XO</text>
              </svg>
            </div>

            {/* Glowing ring while spinning */}
            <div className={`wheel-glow-ring ${spinning ? 'active' : ''}`} />
          </div>

          {/* Winner announcement if visible */}
          {winner && (
            <div className={`wheel-winner-card ${winner.type}`}>
              <div className="wwc-info">
                <strong>{winner.type === 'empty' ? 'Better Luck Next Time!' : (winner.type === 'diamonds' ? '💎 100 DIAMONDS JACKPOT!' : '🎊 You Won!')}</strong>
                <div className="wwc-reward-row">
                  {winner.image ? (
                    <img src={winner.image} alt={winner.label} className="wwc-token-img" />
                  ) : (
                    <span className="wwc-reward-emoji">{winner.emoji}</span>
                  )}
                  <span className="wwc-reward-label">{winner.label}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="wheel-footer">
          {alreadySpunToday ? (
            <button 
              className="wheel-action-btn done"
              onClick={handleAlreadySpunClick}
            >
              <span>✅ SPUN TODAY • COME BACK TOMORROW</span>
            </button>
          ) : (
            <button
              className={`wheel-action-btn primary ${spinning ? 'spinning' : ''}`}
              onClick={handleSpin}
              disabled={spinning}
            >
              {spinning ? (
                <span>🌀 SPINNING WHEEL...</span>
              ) : (
                <>
                  <Gift size={20} />
                  <span>SPIN THE WHEEL (DAILY FREE)</span>
                </>
              )}
            </button>
          )}

          {/* Prizes Grid */}
          <div className="wheel-prizes-list">
            {WHEEL_SEGMENTS.map(seg => (
              <div key={seg.id} className={`wheel-prize-chip ${seg.type}`} style={{ '--seg-c': seg.color }}>
                {seg.image ? (
                  <img src={seg.image} alt={seg.label} className="wheel-chip-img" />
                ) : (
                  <span>{seg.emoji}</span>
                )}
                <span>{seg.label}</span>
              </div>
            ))}
          </div>

          <button className="wheel-cancel-btn" onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
};

export default RewardWheel;
