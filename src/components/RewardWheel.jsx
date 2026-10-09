import { useState, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';
import { Gift, X, Sparkles, Coins } from 'lucide-react';
import './RewardWheel.css';

const WHEEL_SEGMENTS = [
  { id: 1, label: '50 XO Coins',     emoji: '🪙',  color: '#6366f1', rewardCoins: 50,  type: 'coins' },
  { id: 2, label: '1 CS Ticket',     emoji: '🎫',  color: '#06b6d4', rewardCs: 1,      type: 'cs' },
  { id: 3, label: '100 XO Coins',    emoji: '💰',  color: '#a855f7', rewardCoins: 100, type: 'coins' },
  { id: 4, label: '1 BR Ticket',     emoji: '🎟️',  color: '#f59e0b', rewardBr: 1,      type: 'br' },
  { id: 5, label: '25 XO Coins',     emoji: '🪙',  color: '#10b981', rewardCoins: 25,  type: 'coins' },
  { id: 6, label: '200 XO Coins',    emoji: '💎',  color: '#ef4444', rewardCoins: 200, type: 'coins' },
  { id: 7, label: '2 CS Tickets',    emoji: '🎫',  color: '#8b5cf6', rewardCs: 2,      type: 'cs' },
  { id: 8, label: 'JACKPOT! 500 Coins + 1 CS + 1 BR', emoji: '🏆', color: '#f97316', rewardCoins: 500, rewardCs: 1, rewardBr: 1, type: 'jackpot' },
];

const NUM_SEGMENTS = WHEEL_SEGMENTS.length;
const SEGMENT_ANGLE = 360 / NUM_SEGMENTS;

const RewardWheel = ({ onClose }) => {
  const { coins, setCoins, setCsTickets, setBrTickets, recordWheelSpin, wheelSpinData, showNotification } = useGame();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState(null);
  const currentRotRef = useRef(0);

  const SPIN_COST = 100;
  const today = new Date().toDateString();
  const alreadySpunToday = wheelSpinData.lastSpinDate === today;

  const handleSpin = useCallback(() => {
    if (spinning) return;

    if (alreadySpunToday) {
      showNotification("Already Spun Today!", 'waiting', "Come back tomorrow for your next lucky daily spin!");
      return;
    }

    if (coins < SPIN_COST) {
      showNotification(`Need ${SPIN_COST} XO Coins to Spin!`, 'waiting', `You currently have ${coins} coins. Watch streams to earn more!`);
      return;
    }

    setSpinning(true);
    setWinner(null);

    // Deduct cost
    setCoins(prev => prev - SPIN_COST);

    // Pick random winner
    const rand = Math.random();
    let winnerIndex;
    if (rand < 0.08) {
      winnerIndex = 7; // jackpot
    } else {
      winnerIndex = Math.floor(Math.random() * (NUM_SEGMENTS - 1));
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

      // Give reward
      if (winningSegment.rewardCoins) setCoins(prev => prev + winningSegment.rewardCoins);
      if (winningSegment.rewardCs) setCsTickets(prev => prev + winningSegment.rewardCs);
      if (winningSegment.rewardBr) setBrTickets(prev => prev + winningSegment.rewardBr);

      recordWheelSpin(winningSegment.label);

      // Trigger 5-second sliding notification via global stack
      showNotification(
        winningSegment.type === 'jackpot' ? '🎉 GRAND JACKPOT WON!' : '🎊 Congratulations! You Won:',
        winningSegment.type === 'jackpot' ? 'jackpot' : 'spin',
        `${winningSegment.label} has been added to your inventory!`
      );
    }, 4200);
  }, [spinning, alreadySpunToday, coins, setCoins, setCsTickets, setBrTickets, recordWheelSpin]);

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
            Spin once per day! Win up to 500 XO Coins, CS & BR Tournament Tickets, and Grand Jackpots!
          </p>

          <div className="wheel-meta-bar">
            <div className="wheel-meta-item">
              <span className="wmi-lbl">Spin Cost:</span>
              <span className="wmi-val cost">{SPIN_COST} XO Coins</span>
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
                  return (
                    <g key={seg.id}>
                      <path
                        d={getSegmentPath(i)}
                        fill={seg.color}
                        stroke="#0f111a"
                        strokeWidth="2.5"
                      />
                      <text
                        x={x}
                        y={y - 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="20"
                        transform={`rotate(${rotate}, ${x}, ${y})`}
                      >
                        {seg.emoji}
                      </text>
                      <text
                        x={x}
                        y={y + 12}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={seg.type === 'jackpot' ? "6.5" : "8"}
                        fontWeight="900"
                        fill="#ffffff"
                        transform={`rotate(${rotate}, ${x}, ${y})`}
                      >
                        {seg.type === 'jackpot' ? 'JACKPOT!' : seg.label}
                      </text>
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
                <strong>{winner.type === 'jackpot' ? '🎉 GRAND JACKPOT!' : '🎊 You Won!'}</strong>
                <div className="wwc-reward-row">
                  <span className="wwc-reward-emoji">{winner.emoji}</span>
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
              disabled={spinning || coins < SPIN_COST}
            >
              {spinning ? (
                <span>🌀 SPINNING WHEEL...</span>
              ) : (
                <>
                  <Gift size={20} />
                  <span>SPIN FOR {SPIN_COST} XO COINS</span>
                </>
              )}
            </button>
          )}

          {/* Prizes Grid */}
          <div className="wheel-prizes-list">
            {WHEEL_SEGMENTS.map(seg => (
              <div key={seg.id} className={`wheel-prize-chip ${seg.type}`} style={{ '--seg-c': seg.color }}>
                <span>{seg.emoji}</span>
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
