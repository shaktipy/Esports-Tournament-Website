import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Menu, X, Gift, Gamepad2, Target, Trophy, Flame, Shield } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin, isAuthorizedAdminEmail } from '../context/AdminContext';
import NotificationCenter from './NotificationCenter';
import './Navbar.css';

const Navbar = ({ onLoginClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, coins, logout } = useGame();
  const { isAdminAuthenticated } = useAdmin();

  // Strict Admin Check: Only authorized admin emails or active admin session
  const isAdmin = isAdminAuthenticated || (user?.email && isAuthorizedAdminEmail(user.email));

  const handleLogout = () => {
    logout();
  };

  const navLinks = [
    { path: '/', label: 'HOME', icon: <Gamepad2 size={18} /> },
    { path: '/tasks', label: 'MISSIONS', icon: <Target size={18} /> },
    { path: '/giveaways', label: 'GIVEAWAYS', icon: <Flame size={18} /> },
    { path: '/redeem', label: 'REDEEM', icon: <Gift size={18} /> },
    { path: '/esports', label: 'ESPORTS ARENA', icon: <Trophy size={18} />, highlight: true },
  ];

  return (
    <nav className="navbar glass-panel">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <img src="/tokens/harsh-avatar.png" alt="HAARSH XO Logo" className="nav-avatar-logo" />
          <span className="navbar-logo-text text-gradient">HAARSH XO</span>
        </Link>
        
        <div className="navbar-links desktop-only">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`nav-link ${location.pathname === link.path ? 'active' : ''} ${link.highlight ? 'esports-link-highlight' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        <div className="navbar-actions">
          <div className="coin-balance-card" title="Your XO Coins">
            <img src="/tokens/xo-coin.png" alt="XO Coin" className="xo-coin-icon" />
            <span className="coin-amount-val">{coins}</span>
            <span className="coin-currency-tag">XO</span>
          </div>

          {/* Notification Bell Center (Visible to everyone) */}
          <NotificationCenter />
          
          {/* Admin Portal Button: STRICTLY visible only to authorized admins */}
          {isAdmin && (
            <Link to="/admin" className="admin-nav-portal-btn desktop-only" title="Master Admin Console">
              <Shield size={14} />
              <span>ADMIN</span>
            </Link>
          )}

          <div className="desktop-only auth-action-wrapper">
            {user ? (
              <div className="user-menu">
                <span className="user-name" title={`@${user.inGameName}`}>@{user.inGameName}</span>
                <button className="btn-secondary btn-sm" onClick={handleLogout}>LOGOUT</button>
              </div>
            ) : (
              <button className="btn-primary" onClick={onLoginClick}>
                <User size={16} />
                <span>LOGIN</span>
              </button>
            )}
          </div>

          <button 
            className="mobile-menu-btn" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-menu glass-panel">
          {navLinks.map((link) => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`mobile-nav-link ${location.pathname === link.path ? 'active' : ''}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}

          {/* Admin link strictly visible only if user is authorized admin */}
          {isAdmin && (
            <Link 
              to="/admin" 
              className="mobile-nav-link mobile-admin-nav-link"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Shield size={18} />
              <span>ADMIN PORTAL</span>
            </Link>
          )}

          <div className="mobile-auth">
            {user ? (
              <>
                <div className="user-info-mobile">
                  <User size={20} /> <span className="mobile-user-name">@{user.inGameName}</span>
                </div>
                <button className="btn-secondary w-full" onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}>LOGOUT</button>
              </>
            ) : (
              <button className="btn-primary w-full" onClick={() => { onLoginClick(); setIsMobileMenuOpen(false); }}>LOGIN / REGISTER</button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
