import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, ShieldCheck, X } from 'lucide-react';
import './CookieConsent.css';

const COOKIE_CONSENT_KEY = 'haarshxo_cookie_consent';

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        // Small delay so page renders smoothly first
        const timer = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(timer);
      }
    } catch (e) {
      // Storage unavailable
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch (e) {}
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <aside className="cookie-consent-bar fade-in-up" role="region" aria-label="Cookie and Privacy Consent">
      <div className="cookie-consent-inner">
        <div className="cookie-icon-wrap">
          <Cookie size={24} className="cookie-icon" />
        </div>

        <div className="cookie-text-block">
          <div className="cookie-title">
            <ShieldCheck size={16} className="cookie-shield" />
            <span>Essential Cookies & Privacy</span>
          </div>
          <p className="cookie-desc">
            We use essential cookies and browser storage strictly for login authentication and reward tracking. We do <strong>not</strong> track you with third-party advertisers or sell your personal data.
          </p>
        </div>

        <div className="cookie-actions">
          <Link to="/cookies-policy" className="btn-cookie-learn">
            Learn More
          </Link>
          <button 
            type="button" 
            className="btn-cookie-accept"
            onClick={handleAccept}
          >
            Accept & Continue
          </button>
        </div>

        <button 
          type="button" 
          className="cookie-close-btn" 
          onClick={handleAccept}
          aria-label="Close cookie banner"
        >
          <X size={16} />
        </button>
      </div>
    </aside>
  );
};

export default CookieConsent;
