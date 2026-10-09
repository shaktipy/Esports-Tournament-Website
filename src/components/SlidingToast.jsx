import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Gift, Sparkles, X } from 'lucide-react';
import './SlidingToast.css';

const SlidingToast = ({ message, subtitle, type = 'success', duration = 5000, onClose }) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Start exit slide animation 450ms before duration ends
    const exitTimer = setTimeout(() => {
      setIsExiting(true);
    }, Math.max(duration - 450, 1000));

    // Fully close after duration
    const closeTimer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration, onClose]);

  const handleManualClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 400);
  };

  const getIcon = () => {
    if (type === 'spin' || type === 'jackpot') return <Sparkles size={24} className="toast-icon spin" />;
    if (type === 'waiting' || type === 'tomorrow') return <Clock size={24} className="toast-icon warning" />;
    if (type === 'special') return <Gift size={24} className="toast-icon special" />;
    return <CheckCircle2 size={24} className="toast-icon success" />;
  };

  return (
    <div className={`sliding-toast-container ${isExiting ? 'sliding-out' : 'sliding-in'} toast-${type}`}>
      <div className="toast-body">
        <div className="toast-icon-wrapper">
          {getIcon()}
        </div>
        <div className="toast-content">
          <strong className="toast-title">{message}</strong>
          {subtitle && <span className="toast-subtitle">{subtitle}</span>}
        </div>
        <button className="toast-close-btn" onClick={handleManualClose} aria-label="Close notification">
          <X size={16} />
        </button>
      </div>
      <div 
        className="toast-progress-bar" 
        style={{ animationDuration: `${duration}ms` }} 
      />
    </div>
  );
};

export default SlidingToast;
