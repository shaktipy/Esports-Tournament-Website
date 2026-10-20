import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText, AlertTriangle, Scale, ShieldAlert, Award } from 'lucide-react';
import './LegalPage.css';

const TermsConditions = () => {
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
        <h1 className="legal-title">Terms & Conditions</h1>
        <div className="legal-meta">
          <span className="legal-meta-item">
            <Scale size={14} />
            <span>Last Updated: October 2024</span>
          </span>
          <span className="legal-meta-item">
            <Award size={14} />
            <span>Community Gaming Guidelines</span>
          </span>
        </div>
      </div>

      <div className="legal-content-card">
        <div className="legal-notice-box">
          <strong>Important Notice:</strong> By accessing or using the HAARSH XO website, participating in esports tournaments, or earning XO Coins, you agree to comply with and be bound by these Terms & Conditions.
        </div>

        <h2>1. Eligibility & Age Restriction</h2>
        <p>
          You must be at least <strong>13 years old</strong> to register an account, participate in tournaments, or redeem items on HAARSH XO. If you are between 13 and 18 years old, you represent that your parent or legal guardian has reviewed and agreed to these terms on your behalf.
        </p>

        <h2>2. Virtual Currency (XO Coins) & Rewards</h2>
        <p>
          XO Coins and tournament tickets are promotional, non-monetary virtual points earned exclusively through community engagement (such as watching official videos, completing daily missions, or spinning the daily reward wheel).
        </p>
        <ul>
          <li><strong>No Monetary Value:</strong> XO Coins hold zero cash value, fiat equivalent, or legal tender status.</li>
          <li><strong>Non-Transferable:</strong> Coins, passes, and tickets cannot be transferred, sold, or bartered between accounts.</li>
          <li><strong>Discretionary Fulfillment:</strong> In-game reward distribution (such as Free Fire Diamonds or Google Play redeem codes) is promotional and subject to stock availability and anti-fraud verification.</li>
        </ul>

        <h2>3. Fair Play, Anti-Cheat & Conduct Rules</h2>
        <p>
          To ensure fairness and integrity across all community tournaments and reward systems, the following behaviors are strictly prohibited:
        </p>
        <ul>
          <li>Using cheats, aimbots, wallhacks, third-party APK modifications, or macros during custom tournaments.</li>
          <li>Exploiting bugs, auto-clickers, or automated headless scripts to falsely inflate watch time or mission progress.</li>
          <li>Creating multiple dummy accounts to game the referral or giveaway system.</li>
          <li>Harassment, abusive language, toxicity, or hate speech in official tournament rooms or Discord/social channels.</li>
        </ul>
        <div className="legal-notice-box danger">
          <strong>Enforcement:</strong> Any user found violating these fair play rules will face immediate permanent account banning, forfeiture of all accumulated XO Coins and tickets, and disqualification from tournament prize pools without appeal.
        </div>

        <h2>4. Tournament Rules & Registration</h2>
        <p>
          Custom Clash Squad (CS) and Battle Royale (BR) tournaments are held in private custom rooms on Garena Free Fire. Squad captains must provide accurate Free Fire UIDs. Room credentials will be released to verified ticket holders shortly before match commencement. Failure to join within the designated grace period forfeits entry without refund.
        </p>

        <h2>5. Intellectual Property & Trademarks</h2>
        <p>
          HAARSH XO is an independent enthusiast creator community operated by Harsh Vardhan. "Free Fire", related logos, character images, and trademarks are the exclusive property of Garena International and 111dots Studio. HAARSH XO makes no claim of ownership over Garena's intellectual property.
        </p>

        <h2>6. Limitation of Liability</h2>
        <p>
          The platform is provided on an "as is" and "as available" basis. While we strive for 100% uptime, HAARSH XO is not liable for stream delays, Free Fire server outages, internet connectivity drops during tournaments, or device incompatibilities.
        </p>

        <h2>7. Modifications to Service & Terms</h2>
        <p>
          We reserve the right to amend tournament schedules, mission rules, or these terms at any time. Continued use of the platform constitutes acceptance of revised terms.
        </p>

        <div className="legal-contact-card">
          <div>
            <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Disputes or Tournament Queries?</h4>
            <p style={{ margin: 0, fontSize: '0.84rem' }}>Submit your query directly to platform administrators.</p>
          </div>
          <Link to="/contact" className="legal-contact-action">
            Open Contact Form →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
