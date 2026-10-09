import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  Trophy, Gift, ShoppingBag, LogOut, Swords, 
  Ticket, Home, Shield, Menu, X, User 
} from 'lucide-react';
import { useGame } from '../context/GameContext';
import { useAdmin, isAuthorizedAdminEmail } from '../context/AdminContext';
import NotificationCenter from './NotificationCenter';
import './EsportsNavbar.css';

const EsportsNavbar = ({ onLoginClick, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, csTickets, brTickets } = useGame();
  const { isAdminAuthenticated } = useAdmin();

  // Strict Admin Check: Only authorized admin emails or active admin session
  const isAdmin = isAdminAuthenticated || (user?.email && isAuthorizedAdminEmail(user.email));

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024 && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [mobileMenuOpen]);

  const navItems = [
    { path: '/', label: 'HOME', icon: <Home size={16} />, isExternal: true },
    { path: '/esports', label: 'TOURNAMENTS', icon: <Trophy size={16} /> },
    { path: '/esports/passes', label: 'XO PASSES', icon: <Ticket size={16} /> },
    { path: '/esports/giveaways', label: 'GIVEAWAYS', icon: <Gift size={16} /> },
    { path: '/esports/redeem', label: 'ARENA STORE', icon: <ShoppingBag size={16} /> },
  ];

  return (
    <header className="esports-navbar-wrapper">
      <nav className="esports-navbar glass-panel">
        <div className="navbar-container">
          {/* Logo — leftmost */}
          <div className="navbar-logo" onClick={() => navigate('/esports')}>
            <div className="esports-logo-icon">
              <Swords className="logo-sword" size={20} />
            </div>
            <div className="esports-logo-text-group">
              <span className="logo-brand">HAARSH XO</span>
              <span className="logo-text">ESPORTS ARENA</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="navbar-links desktop-only">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              if (item.isExternal) {
                return (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className="nav-link nav-link-home"
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }
              return (
                <button
                  key={item.path}
                  className={`nav-link ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="navbar-actions">
            {/* Ticket count badges */}
            <div className="esports-tokens-display">
              <div className="token-badge cs-token" title={`${csTickets} CS Tournament Tickets`}>
                <img src="/tokens/cs-ticket.png" alt="CS Ticket" className="token-ticket-img" />
                <span className="token-qty">{csTickets}</span>
              </div>

              <div className="token-badge br-token" title={`${brTickets} BR Tournament Tickets`}>
                <img src="/tokens/br-ticket.png" alt="BR Ticket" className="token-ticket-img" />
                <span className="token-qty">{brTickets}</span>
              </div>
            </div>

            {/* Notification Bell Center */}
            <NotificationCenter />

            {/* Admin console button (Strictly visible only to authorized admins) */}
            {isAdmin && (
              <Link to="/admin" className="esports-admin-btn desktop-only" title="Master Admin Console">
                <Shield size={14} />
                <span>ADMIN</span>
              </Link>
            )}

            {/* Desktop Auth Section */}
            <div className="desktop-only auth-section">
              {user ? (
                <div className="user-menu">
                  <span className="username" title={`@${user.inGameName}`}>
                    @{user.inGameName}
                  </span>
                  <button className="logout-btn" onClick={onLogout} title="Logout">
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <button className="esports-login-btn" onClick={onLoginClick}>
                  LOGIN
                </button>
              )}
            </div>

            {/* Mobile Hamburger Toggle */}
            <button
              className="esports-mobile-menu-btn"
              onClick={() => setMobileMenuOpen(prev => !prev)}
              aria-label={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="esports-mobile-drawer glass-panel fade-in">
          <div className="mobile-drawer-inner">
            {/* Mobile Nav Links */}
            <div className="mobile-nav-links">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                if (item.isExternal) {
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className="mobile-nav-item home-item"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  );
                }
                return (
                  <button
                    key={item.path}
                    className={`mobile-nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Mobile Admin Link if authorized */}
            {isAdmin && (
              <Link
                to="/admin"
                className="mobile-admin-item"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Shield size={16} />
                <span>MASTER ADMIN CONSOLE</span>
              </Link>
            )}

            {/* Mobile User Profile / Auth */}
            <div className="mobile-auth-footer">
              {user ? (
                <div className="mobile-user-row">
                  <div className="mobile-user-info">
                    <User size={16} className="text-cyan" />
                    <span className="mobile-user-ign">@{user.inGameName}</span>
                  </div>
                  <button 
                    className="mobile-logout-btn" 
                    onClick={() => {
                      onLogout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    <LogOut size={15} />
                    <span>LOGOUT</span>
                  </button>
                </div>
              ) : (
                <button
                  className="mobile-login-btn"
                  onClick={() => {
                    onLoginClick();
                    setMobileMenuOpen(false);
                  }}
                >
                  <User size={16} />
                  <span>LOGIN TO ESPORTS</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default EsportsNavbar;
