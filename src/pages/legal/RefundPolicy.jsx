import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, XCircle, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import './LegalPage.css';

const RefundPolicy = () => {
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
        <h1 className="legal-title">Refund & Cancellation Policy</h1>
        <div className="legal-meta">
          <span className="legal-meta-item">
            <RefreshCw size={14} />
            <span>Clear Case-by-Case Rules</span>
          </span>
          <span className="legal-meta-item">
            <Clock size={14} />
            <span>48-Hour Claim Window</span>
          </span>
        </div>
      </div>

      <div className="legal-content-card">
        <div className="legal-notice-box">
          <strong>Fairness Notice:</strong> Because HAARSH XO offers digital services, promotional redemption codes, and esports tournament entries, all refunds are handled on a strict case-by-case basis as detailed below.
        </div>

        <h2>1. In-Game Diamonds & Delivered Memberships</h2>
        <div className="legal-notice-box danger">
          <strong>Strict Non-Refundable Policy:</strong> Once Free Fire Diamonds, Weekly Memberships, or Monthly Memberships have been successfully dispatched or credited directly to your Free Fire Player UID, <strong>NO REFUNDS OR CANCELLATIONS ARE POSSIBLE</strong> under any circumstances. Delivered in-game currency is an irreversible digital asset.
        </div>

        <h2>2. Digital Redeem Codes & Unclaimed Rewards</h2>
        <p>
          For digital voucher codes (such as Google Play redeem codes) or unclaimed reward tickets:
        </p>
        <ul>
          <li><strong>Eligible:</strong> If you requested a reward or purchase and the code has <strong>NOT been redeemed or viewed/unlocked</strong>, you may request a cancellation within 48 hours of order creation.</li>
          <li><strong>Verification:</strong> Our team will verify via provider logs that the code remains active and untouched before issuing any refund or crediting back your XO Coins.</li>
          <li><strong>Ineligible:</strong> If the code has been revealed, partially utilized, or redeemed, no refund will be issued.</li>
        </ul>

        <h2>3. Tournament Passes & Entry Tickets</h2>
        <p>
          For Clash Squad (CS) or Battle Royale (BR) Tournament Passes purchased on our platform:
        </p>
        <ul>
          <li><strong>Pre-Match Cancellation:</strong> You can request a pass cancellation up to <strong>4 hours before the scheduled match start time</strong>.</li>
          <li><strong>Ticket & Reward Return:</strong> All associated tournament tickets and promotional bundle items received with the pass will be revoked.</li>
          <li><strong>3% Processing Deduction:</strong> Approved pass refunds are subject to a <strong>3% processing fee cut</strong> to cover third-party payment gateway transaction costs.</li>
          <li><strong>After Match Start:</strong> Once tournament custom room ID and password have been generated and distributed, or once the tournament starts, passes are strictly non-refundable regardless of attendance.</li>
        </ul>

        <h2>4. How to Request a Refund</h2>
        <p>To submit a refund request, you must follow these steps within 48 hours of transaction:</p>
        <ul>
          <li>Go to our <Link to="/contact" style={{ color: '#ffaa00' }}>Contact Us Page</Link> and select <strong>"Refund / Transaction Issue"</strong> as the subject.</li>
          <li>Provide your registered account email, Free Fire UID, transaction / order ID, and clear reason for the request.</li>
          <li>Alternatively, write directly to <a href="mailto:trmental6@gmail.com" style={{ color: '#ffaa00' }}>trmental6@gmail.com</a> with the subject line <code>[REFUND REQUEST] - [Order ID]</code>.</li>
        </ul>
        <p>
          Legitimate claims are reviewed and processed within 2 to 4 business days. Refunds will be issued back via the original payment method or credited as XO Coins depending on transaction type.
        </p>

        <div className="legal-contact-card">
          <div>
            <h4 style={{ color: '#fff', margin: '0 0 4px', fontSize: '1rem' }}>Need assistance with a specific order?</h4>
            <p style={{ margin: 0, fontSize: '0.84rem' }}>Our administration team reviews all requests manually.</p>
          </div>
          <Link to="/contact" className="legal-contact-action">
            Submit Refund Request →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
