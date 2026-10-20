import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Cookie, CheckCircle2, Shield, Settings, Info } from 'lucide-react';
import './LegalPage.css';

const CookiesPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-container">
      <div className="legal-header">
        <Link to="/" className="legal-back-link">
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
        <h1 className="legal-title">Cookies Policy</h1>
        <div className="legal-meta">
          <span className="legal-meta-item">
            <Cookie size={14} />
            <span>Privacy-First Cookie Practices</span>
          </span>
          <span className="legal-meta-item">
            <Shield size={14} />
            <span>Zero Tracking & Ad Cookies</span>
          </span>
        </div>
      </div>

      <div className="legal-content-card">
        <div className="legal-notice-box success">
          <strong>Privacy Commitment:</strong> HAARSH XO does not use third-party behavioral advertising cookies, affiliate trackers, or surveillance cookies. We use only strictly essential session identifiers.
        </div>

        <h2>1. What Are Cookies & Local Storage?</h2>
        <p>
          Cookies and HTML5 Local Storage are tiny text entries or data keys placed on your browser by websites you visit. They enable the website to remember your authentication state, interface preferences, and current session timers without asking you to log in repeatedly.
        </p>

        <h2>2. Cookies & Storage Technologies We Use</h2>
        <p>We use a strictly limited set of storage items categorized below:</p>

        <h3>A. Strictly Essential Authentication Cookies</h3>
        <p>
          Managed through Supabase Auth, these secure HTTP tokens maintain your login session so you can access your missions, view your XO Coins balance, and claim daily rewards securely.
        </p>

        <h3>B. Local Browser Storage (Functional State)</h3>
        <p>
          We use browser <code>localStorage</code> solely to remember:
        </p>
        <ul>
          <li><strong>Cookie Consent:</strong> Saves your acknowledgement so the consent banner is not shown on every visit.</li>
          <li><strong>Sound & Volume Preferences:</strong> Remembers your preferred audio volume for video previews.</li>
          <li><strong>Session Watch Timers:</strong> Temporarily keeps track of active seconds watched during a live session.</li>
          <li><strong>Contact Submissions:</strong> Keeps a local confirmation copy of your support requests.</li>
        </ul>

        <h3>C. Embedded Media (YouTube Cookies)</h3>
        <p>
          Because our platform embeds official YouTube videos and live streams, interacting with the video player connects you to YouTube's CDN, which may place functional Google/YouTube cookies for video playback quality and metrics as described in the Google Privacy Policy.
        </p>

        <h2>3. Third-Party Advertising Cookies</h2>
        <p>
          <strong>None.</strong> We do not host ad network scripts, Facebook tracking pixels, TikTok trackers, or cross-site data broker analytics.
        </p>

        <h2>4. How You Can Manage or Clear Cookies</h2>
        <p>
          You can modify your browser settings to refuse cookies or clear stored site data at any time. However, please note that clearing authentication cookies will log you out of HAARSH XO and require you to sign in again.
        </p>
        <ul>
          <li><strong>Chrome:</strong> Settings &gt; Privacy and security &gt; Cookies and other site data.</li>
          <li><strong>Firefox:</strong> Settings &gt; Privacy &amp; Security &gt; Cookies and Site Data.</li>
          <li><strong>Edge:</strong> Settings &gt; Cookies and site permissions.</li>
          <li><strong>Safari:</strong> Preferences &gt; Privacy &gt; Manage Website Data.</li>
        </ul>

        <div className="legal-contact-card">
          <div>
            <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Questions regarding storage or privacy?</h4>
            <p style={{ margin: 0, fontSize: '0.84rem' }}>Reach out to our privacy administrator anytime.</p>
          </div>
          <Link to="/contact" className="legal-contact-action">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiesPolicy;
