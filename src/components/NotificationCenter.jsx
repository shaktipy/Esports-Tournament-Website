import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Bell, CheckCheck, Trash2, X, Trophy, Gift, 
  Ticket, Flame, CheckCircle2, AlertTriangle, Info, Sparkles
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import './NotificationCenter.css';

const NotificationCenter = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [popoverStyle, setPopoverStyle] = useState({});
  const bellRef = useRef(null);
  const dropdownRef = useRef(null);
  const { 
    notificationInbox, 
    unreadNotificationCount, 
    markAllNotificationsAsRead, 
    clearAllNotifications,
    deleteNotification,
    markNotificationAsRead 
  } = useGame();

  // Recalculate position whenever popover opens
  const updatePosition = () => {
    if (!bellRef.current) return;
    const rect = bellRef.current.getBoundingClientRect();
    const popoverWidth = 400;
    const viewportWidth = window.innerWidth;
    
    let left = rect.right - popoverWidth;
    if (left < 8) left = 8;
    if (left + popoverWidth > viewportWidth - 8) left = viewportWidth - popoverWidth - 8;

    setPopoverStyle({
      position: 'fixed',
      top: rect.bottom + 12,
      left,
      width: Math.min(popoverWidth, viewportWidth - 16),
      zIndex: 99999,
    });
  };

  const toggleDropdown = () => {
    if (!isOpen) {
      updatePosition();
    }
    setIsOpen(prev => !prev);
  };

  // Close when clicked outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event) => {
      const isInsideBell = bellRef.current && bellRef.current.contains(event.target);
      const isInsideDropdown = dropdownRef.current && dropdownRef.current.contains(event.target);
      if (!isInsideBell && !isInsideDropdown) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => updatePosition();
    const handleResize = () => { updatePosition(); };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen]);

  const getNotifIcon = (type) => {
    switch (type) {
      case 'trophy':     return <Trophy size={16} className="notif-icon-trophy" />;
      case 'ticket':     return <Ticket size={16} className="notif-icon-ticket" />;
      case 'gift':       return <Gift size={16} className="notif-icon-gift" />;
      case 'flame':
      case 'giveaway':  return <Flame size={16} className="notif-icon-flame" />;
      case 'warning':
      case 'error':     return <AlertTriangle size={16} className="notif-icon-warning" />;
      case 'info':       return <Info size={16} className="notif-icon-info" />;
      case 'success':
      default:           return <CheckCircle2 size={16} className="notif-icon-success" />;
    }
  };

  const popover = isOpen ? createPortal(
    <div
      className="notif-popover notif-popover-portal"
      ref={dropdownRef}
      style={popoverStyle}
    >
      {/* Header */}
      <div className="notif-header">
        <div className="notif-header-title">
          <Bell size={16} style={{ color: '#66fcf1' }} />
          <span>NOTIFICATIONS</span>
          {unreadNotificationCount > 0 && (
            <span className="notif-unread-pill">{unreadNotificationCount} new</span>
          )}
        </div>

        <div className="notif-header-actions">
          {unreadNotificationCount > 0 && (
            <button
              className="notif-action-btn"
              onClick={markAllNotificationsAsRead}
              title="Mark all as read"
            >
              <CheckCheck size={14} />
              <span>Mark read</span>
            </button>
          )}
          {notificationInbox.length > 0 && (
            <button
              className="notif-action-btn notif-clear-btn"
              onClick={clearAllNotifications}
              title="Clear all"
            >
              <Trash2 size={14} />
            </button>
          )}
          <button
            className="notif-close-btn"
            onClick={() => setIsOpen(false)}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="notif-list">
        {notificationInbox.length === 0 ? (
          <div className="notif-empty-state">
            <div className="notif-empty-icon">
              <Sparkles size={26} />
            </div>
            <p className="notif-empty-title">All caught up!</p>
            <p className="notif-empty-sub">No new notifications at this time.</p>
          </div>
        ) : (
          notificationInbox.map((item) => (
            <div
              key={item.id}
              className={`notif-item ${item.read ? 'read' : 'unread'}`}
              onClick={() => markNotificationAsRead(item.id)}
            >
              <div className={`notif-icon-badge notif-type-${item.type || 'success'}`}>
                {getNotifIcon(item.type)}
              </div>
              <div className="notif-content">
                <div className="notif-message-row">
                  <p className="notif-message">{item.message}</p>
                  <div className="notif-item-actions">
                    {!item.read && <span className="notif-unread-dot" />}
                    <button
                      type="button"
                      className="notif-delete-single-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(item.id);
                      }}
                      title="Delete this notification"
                      aria-label="Delete this notification"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                {item.subtitle && (
                  <p className="notif-subtitle">{item.subtitle}</p>
                )}
                <span className="notif-time">{item.time || 'Recently'}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      {notificationInbox.length > 0 && (
        <div className="notif-footer">
          <span>Haarsh XO Tournament &amp; Activity Alerts</span>
        </div>
      )}
    </div>,
    document.body
  ) : null;

  return (
    <div className="notification-center-wrap">
      {/* Bell Trigger Button */}
      <button
        ref={bellRef}
        className={`notif-bell-btn ${isOpen ? 'active' : ''} ${unreadNotificationCount > 0 ? 'has-unread' : ''}`}
        onClick={toggleDropdown}
        title="View Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadNotificationCount > 0 && (
          <span className="notif-badge">
            {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
          </span>
        )}
      </button>

      {/* Portalled Popover */}
      {popover}
    </div>
  );
};

export default NotificationCenter;
