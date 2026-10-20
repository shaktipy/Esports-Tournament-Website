import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Eye, Calendar, UserCheck, AlertTriangle } from 'lucide-react';
import './LegalPage.css';

const PrivacyPolicy = () => {
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
        <h1 className="legal-title">Privacy Policy</h1>
        <div className="legal-meta">
          <span className="legal-meta-item">
            <Calendar size={14} />
            <span>Effective Date: October 2024</span>
          </span>
          <span className="legal-meta-item">
            <Shield size={14} />
            <span>DPDP Act 2023 Compliant</span>
          </span>
          <span className="legal-meta-item">
            <UserCheck size={14} />
            <span>Age Requirement: 13+</span>
          </span>
        </div>
      </div>

      <div className="legal-content-card">
        <div className="legal-notice-box">
          <strong>Summary:</strong> HAARSH XO collects only the minimal data strictly necessary to authenticate your account, track reward eligibility, and coordinate esports matches. We never sell your personal information or share it with third-party advertisers.
        </div>

        <h2>1. Controller & Operator Identity</h2>
        <p>
          This platform, <strong>HAARSH XO</strong>, is owned and operated by Harsh Vardhan Singh (individual content creator and streamer). For any privacy inquiries, data deletion requests, or concerns, contact our designated grievance email at{' '}
          <a href="mailto:trmental6@gmail.com" style={{ color: '#ffaa00' }}>trmental6@gmail.com</a>.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We believe in strict data minimization. We only collect information that you explicitly provide or that is directly necessary for platform functionality:</p>
        <ul>
          <li><strong>Account Information:</strong> Email address and password hash (securely handled via Supabase Auth).</li>
          <li><strong>Gaming Identifiers:</strong> In-Game Name (IGN) and Free Fire UID provided during registration or tournament sign-up to deliver rewards and room credentials.</li>
          <li><strong>Activity & Engagement:</strong> Video watch time duration (used exclusively to compute XO Coins and daily mission milestones).</li>
          <li><strong>Support Queries:</strong> Information submitted voluntarily via our Contact form (Name, Email, Message).</li>
        </ul>

        <h2>3. Purpose of Processing</h2>
        <p>Your data is processed strictly for the following purposes:</p>
        <ul>
          <li>To authenticate and maintain your session across devices.</li>
          <li>To calculate and award earned XO Coins, tournament tickets, and daily login bonuses.</li>
          <li>To prevent fraudulent claims, multiple-account exploits, and bot activity.</li>
          <li>To deliver tournament custom room ID and passwords to registered squad captains.</li>
          <li>To address technical issues and customer support inquiries.</li>
        </ul>

        <h2>4. Storage, Security & Retention</h2>
        <p>
          Authentication records and core profiles are stored in encrypted databases via Supabase. Temporary state (such as sound preference, local watch timers, and cookie consent status) is stored locally in your browser storage.
        </p>
        <p>
          We retain your profile data only as long as your account remains active. Inactive account records can be permanently deleted upon verified request.
        </p>

        <h2>5. Age Restriction & Child Safety (13+)</h2>
        <p>
          HAARSH XO is designed exclusively for users who are <strong>13 years of age or older</strong>. We do not knowingly solicit or collect personal data from children under 13. If you believe a child under 13 has registered on our website, please notify us at{' '}
          <a href="mailto:trmental6@gmail.com" style={{ color: '#ffaa00' }}>trmental6@gmail.com</a> and we will promptly terminate the account and erase all associated records.
        </p>

        <h2>6. Third-Party Embeds (YouTube)</h2>
        <p>
          Our platform integrates standard YouTube embedded players to stream official live streams and video content. When you interact with embedded YouTube players, YouTube/Google may collect technical data or set cookies governed by the{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#ffaa00' }}>
            Google Privacy Policy
          </a>.
        </p>

        <h2>7. Your Rights under DPDP Act 2023</h2>
        <p>Under India's Digital Personal Data Protection (DPDP) Act 2023 and global privacy standards, you have the following rights:</p>
        <ul>
          <li><strong>Right to Access:</strong> You can request a summary of the personal data we hold about you.</li>
          <li><strong>Right to Correction:</strong> You can request updates to inaccurate or outdated profile details (e.g., Free Fire UID).</li>
          <li><strong>Right to Erasure:</strong> You can ask us to permanently delete your account and all associated data.</li>
          <li><strong>Right of Grievance Redressal:</strong> Direct your privacy grievances to <a href="mailto:trmental6@gmail.com" style={{ color: '#ffaa00' }}>trmental6@gmail.com</a>. We respond within 48 to 72 business hours.</li>
        </ul>

        <div className="legal-contact-card">
          <div>
            <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Have a question or want your data erased?</h4>
            <p style={{ margin: 0, fontSize: '0.84rem' }}>Our support is directly handled by the platform creator.</p>
          </div>
          <Link to="/contact" className="legal-contact-action">
            Contact Support →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
