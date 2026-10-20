import React from 'react';
import { ShieldAlert, AlertTriangle, X } from 'lucide-react';
import './BannedModal.css';

const BannedModal = ({ isOpen, status = 'banned', reason, onClose }) => {
  if (!isOpen) return null;

  const isSuspended = status === 'suspended';
  const title = isSuspended ? 'Account Suspended' : 'Account Banned';
  const displayReason = reason && reason.trim() ? reason : 'Violation of community guidelines & fair play policy.';

  return (
    <div className="banned-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="banned-modal-card">
        <div className="banned-icon-wrapper">
          <ShieldAlert size={36} />
        </div>

        <h2 className="banned-title">{title}</h2>
        <div className="banned-badge">
          <AlertTriangle size={13} />
          <span>Banned by Admin</span>
        </div>

        <div className="banned-reason-box">
          <div className="banned-reason-label">Reason Specified by Admin:</div>
          <div className="banned-reason-text">"{displayReason}"</div>
        </div>

        <p className="banned-notice">
          Your account is restricted from accessing tournaments, leaderboards, and interactive features.
          You have been logged out. If you believe this is an error, contact tournament administration.
        </p>

        <div className="banned-actions">
          <button type="button" className="banned-btn-close" onClick={onClose}>
            I Understand / Dismiss
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannedModal;
