import { useAdmin } from '../context/AdminContext';
import { Megaphone, X, Sparkles, Trophy, Gift, AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';
import './AnnouncementBar.css';

const AnnouncementBar = () => {
  const { announcements } = useAdmin();
  const [dismissed, setDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const activeAnnouncements = announcements?.filter(a => a.active && a.showMarquee) || [];

  // Auto-rotate through active announcements every 6 seconds if there are multiple
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % activeAnnouncements.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);

  if (dismissed || activeAnnouncements.length === 0) return null;

  const current = activeAnnouncements[currentIndex] || activeAnnouncements[0];

  const getIcon = (type) => {
    switch (type) {
      case 'tournament': return <Trophy size={15} className="ann-icon tourney" />;
      case 'giveaway': return <Gift size={15} className="ann-icon giveaway" />;
      case 'urgent': return <AlertTriangle size={15} className="ann-icon urgent" />;
      case 'reward': return <Sparkles size={15} className="ann-icon reward" />;
      default: return <Megaphone size={15} className="ann-icon general" />;
    }
  };

  return (
    <div className={`announcement-bar type-${current.type || 'tournament'}`}>
      <div className="ann-inner">
        <div className="ann-badge">
          {getIcon(current.type)}
          <span>{(current.type || 'ALERT').toUpperCase()}</span>
          {activeAnnouncements.length > 1 && (
            <span className="ann-count-pill">{currentIndex + 1}/{activeAnnouncements.length}</span>
          )}
        </div>
        <div className="ann-marquee-wrapper">
          <div className="ann-text" key={current.id || currentIndex}>
            <strong className="ann-title">{current.title}</strong>
            {current.message && <span className="ann-sub"> — {current.message}</span>}
          </div>
        </div>
        <button 
          className="ann-close-btn"
          onClick={() => setDismissed(true)}
          title="Dismiss notification bar"
          aria-label="Dismiss banner"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
};

export default AnnouncementBar;
