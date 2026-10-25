import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Youtube, Instagram, ShieldCheck, Heart } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div className="footer-container">
        {/* Top Section: Brand Info & Socials */}
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="footer-logo-accent">HAARSH</span> XO
            </div>
            <p className="footer-tagline">
              Official community platform by HaarshXO. Watch streams, participate in daily missions, compete in custom esports tournaments, and earn rewards.
            </p>
            <div className="footer-socials">
              <a
                href="https://www.youtube.com/@HaarshXO"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link yt"
                aria-label="YouTube Channel"
              >
                <Youtube size={18} />
                <span>YouTube</span>
              </a>
              <a
                href="https://www.instagram.com/haarshxo?stkn=dnJza2k1cHVoMzFw"
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social-link ig"
                aria-label="Instagram Profile"
              >
                <Instagram size={18} />
                <span>Instagram</span>
              </a>
              <a
                href="mailto:trmental6@gmail.com"
                className="footer-social-link mail"
                aria-label="Email Support"
              >
                <Mail size={18} />
                <span>trmental6@gmail.com</span>
              </a>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Platform</h4>
            <ul className="footer-links-list">
              <li><Link to="/">Watch & Earn</Link></li>
              <li><Link to="/tasks">Daily Missions</Link></li>
              <li><Link to="/esports">Esports Arena</Link></li>
              <li><Link to="/giveaways">Giveaways</Link></li>
              <li><Link to="/redeem">Reward Store</Link></li>
            </ul>
          </div>

          {/* Legal & Compliance Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Legal & Trust</h4>
            <ul className="footer-links-list">
              <li><Link to="/privacy-policy">Privacy Policy</Link></li>
              <li><Link to="/terms">Terms & Conditions</Link></li>
              <li><Link to="/cookies-policy">Cookies Policy</Link></li>
              <li><Link to="/refund-policy">Refund Policy</Link></li>
              <li><Link to="/contact">Contact & Support</Link></li>
            </ul>
          </div>

          {/* Community & Safety Column */}
          <div className="footer-links-col">
            <h4 className="footer-col-title">Fair Play & Safety</h4>
            <div className="footer-badge-box">
              <ShieldCheck size={20} className="footer-shield-icon" />
              <div>
                <div className="badge-box-title">13+ Age Restricted</div>
                <div className="badge-box-sub">Fair play verified. Anti-cheat and fair matchmaking enforced.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider" />

        {/* Bottom Section: Disclaimer & Copyright */}
        <div className="footer-bottom">
          <p className="footer-disclaimer">
            Disclaimer: HAARSH XO is an independent gaming & streaming community run by Harsh Vardhan Singh. It is not affiliated with, endorsed by, or sponsored by Garena Free Fire, 111dots Studio, or their respective affiliates. All game trademarks belong to their respective owners.
          </p>
          <div className="footer-copy-row">
            <span>© {new Date().getFullYear()} HAARSH XO. All rights reserved.</span>
            <span className="footer-creator-note">
              Made with <Heart size={13} className="heart-icon" /> for the Free Fire gaming community
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
