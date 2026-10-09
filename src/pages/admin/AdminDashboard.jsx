import { useState, useEffect } from 'react';
import { useAdmin, isAuthorizedAdminEmail } from '../../context/AdminContext';
import { useGame } from '../../context/GameContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Trophy, Ticket, Gift, CreditCard, Users, 
  Megaphone, ShoppingBag, FileText, LayoutDashboard, 
  Lock, Unlock, ShieldAlert, Sparkles, LogOut, ExternalLink, 
  Menu, X, CheckCircle2, ChevronRight, Eye, EyeOff, Mail, KeyRound, ShieldCheck, Coins
} from 'lucide-react';

import AdminOverview from './AdminOverview';
import AdminTournaments from './AdminTournaments';
import AdminPasses from './AdminPasses';
import AdminRedeemCodes from './AdminRedeemCodes';
import AdminPayments from './AdminPayments';
import AdminRedemptions from './AdminRedemptions';
import AdminUsers from './AdminUsers';
import AdminAnnouncements from './AdminAnnouncements';
import AdminGiveawaysStore from './AdminGiveawaysStore';
import AdminAuditLogs from './AdminAuditLogs';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { 
    isAdminAuthenticated, 
    currentAdmin,
    loginAdmin, 
    logoutAdmin, 
    tournaments,
    transactions,
    redemptions,
    redeemCodes,
    usersList
  } = useAdmin();

  const { user } = useGame();

  const [activeTab, setActiveTab] = useState('overview');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Pre-fill email if user is already logged in on main site with authorized admin email
  useEffect(() => {
    if (user?.email && isAuthorizedAdminEmail(user.email) && !emailInput) {
      setEmailInput(user.email);
    }
  }, [user]);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setAuthError('');
    if (!emailInput.trim() || !passwordInput.trim()) {
      setAuthError('Please enter both Admin Email and Password.');
      return;
    }
    const res = loginAdmin(emailInput, passwordInput);
    if (!res.success) {
      setAuthError(res.error || 'Access Denied: Invalid Credentials.');
    }
  };

  // ─── STRICT ADMIN SECURITY GATE (When not authenticated) ─────────────────────
  if (!isAdminAuthenticated) {
    return (
      <div className="admin-auth-page fade-in">
        <div className="admin-auth-card glass-card">
          <div className="admin-lock-icon-wrap">
            <ShieldCheck size={36} className="lock-icon text-cyan" />
          </div>

          <h2 className="admin-auth-title">HAARSH XO Operations Control</h2>
          <p className="admin-auth-subtitle">
            Restricted Master Admin Console. Enter authorized administrator credentials to unlock tournament controls, passes, and ledgers.
          </p>

          <form onSubmit={handleLoginSubmit} className="admin-credentials-form">
            <div className="admin-field-group">
              <label className="admin-field-label">Admin Email Address</label>
              <div className="admin-input-wrap">
                <Mail size={16} className="admin-input-icon" />
                <input 
                  type="email" 
                  placeholder="admin@haarshxo.com"
                  value={emailInput}
                  onChange={e => {
                    setEmailInput(e.target.value);
                    setAuthError('');
                  }}
                  autoFocus
                  required
                />
              </div>
            </div>

            <div className="admin-field-group">
              <label className="admin-field-label">Admin Password</label>
              <div className="admin-input-wrap">
                <KeyRound size={16} className="admin-input-icon" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="Enter administrator password..."
                  value={passwordInput}
                  onChange={e => {
                    setPasswordInput(e.target.value);
                    setAuthError('');
                  }}
                  required
                />
                <button 
                  type="button" 
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(p => !p)}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="admin-error-banner">
                <ShieldAlert size={16} /> <span>{authError}</span>
              </div>
            )}

            <button type="submit" className="admin-submit-btn btn-primary">
              <Unlock size={16} /> <span>Authenticate & Enter Console</span>
            </button>
          </form>

          <div className="admin-auth-footer">
            <Link to="/" className="back-to-site-link">
              ← Return to HAARSH XO Public Portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── TABS DEFINITION ──────────────────────────────────────────────────────
  const navTabs = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { id: 'tournaments', label: 'Tournaments', icon: <Trophy size={18} />, badge: tournaments.filter(t => t.status === 'open').length },
    { id: 'passes', label: 'Passes & Pricing', icon: <Ticket size={18} /> },
    { id: 'codes', label: 'Redeem Codes', icon: <Gift size={18} />, badge: redeemCodes.filter(c => c.active).length },
    { 
      id: 'payments', 
      label: 'Razorpay Payments', 
      icon: <CreditCard size={18} />, 
      badge: (transactions || []).filter(t => (t.currency === 'INR' || !t.currency) && t.currency !== 'XO Coins' && !String(t.id).startsWith('tx_store_')).length 
    },
    { 
      id: 'redemptions', 
      label: 'Reward Redemptions', 
      icon: <Coins size={18} />, 
      badge: (redemptions || []).filter(r => r.status === 'pending').length || undefined 
    },
    { id: 'users', label: 'Player Management', icon: <Users size={18} /> },
    { id: 'announcements', label: 'Announcements', icon: <Megaphone size={18} /> },
    { id: 'store', label: 'Giveaways & Store', icon: <ShoppingBag size={18} /> },
    { id: 'logs', label: 'Audit Logs', icon: <FileText size={18} /> },
  ];

  return (
    <div className="admin-layout">
      {/* ─── SIDEBAR ──────────────────────────────────────────────────────── */}
      <aside className={`admin-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <div className="admin-brand">
            <span className="brand-logo-glow">XO</span>
            <div className="brand-text">
              <strong>HAARSH XO</strong>
              <span className="brand-sub">OPERATIONS CENTER</span>
            </div>
          </div>
          <button 
            className="mobile-close-btn"
            onClick={() => setMobileSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="admin-nav-menu">
          <div className="nav-section-title">CONTROL CENTER</div>
          {navTabs.map(tab => (
            <button
              key={tab.id}
              className={`admin-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setMobileSidebarOpen(false);
              }}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
              {typeof tab.badge !== 'undefined' && tab.badge > 0 && (
                <span className="nav-badge">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-operator-card">
            <div className="op-avatar">👑</div>
            <div className="op-info">
              <strong>{currentAdmin?.name || 'Administrator'}</strong>
              <span className="op-sub-email">{currentAdmin?.email || currentAdmin?.role || 'Verified Admin Session'}</span>
            </div>
          </div>
          <button className="admin-logout-btn" onClick={logoutAdmin}>
            <LogOut size={16} /> Lock Console
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ────────────────────────────────────────────── */}
      <div className="admin-main">
        {/* Top Header Bar */}
        <header className="admin-topbar">
          <div className="topbar-left">
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="breadcrumb">
              <span className="crumb-root">Admin</span>
              <ChevronRight size={14} className="crumb-arrow" />
              <span className="crumb-current">
                {navTabs.find(t => t.id === activeTab)?.label || 'Overview'}
              </span>
            </div>
          </div>

          <div className="topbar-right">
            <div className="server-status-pill">
              <span className="status-indicator-dot online"></span>
              <span>Backend Port: 5001</span>
            </div>

            <Link to="/" target="_blank" className="view-site-btn" title="Open live public website">
              <Eye size={15} /> <span>View Live Site</span>
            </Link>

            <button className="admin-icon-btn" onClick={logoutAdmin} title="Lock session">
              <LogOut size={16} />
            </button>
          </div>
        </header>

        {/* Tab Content Renderer */}
        <div className="admin-tab-viewport">
          {activeTab === 'overview' && <AdminOverview setActiveTab={setActiveTab} />}
          {activeTab === 'tournaments' && <AdminTournaments />}
          {activeTab === 'passes' && <AdminPasses />}
          {activeTab === 'codes' && <AdminRedeemCodes />}
          {activeTab === 'payments' && <AdminPayments />}
          {activeTab === 'redemptions' && <AdminRedemptions />}
          {activeTab === 'users' && <AdminUsers />}
          {activeTab === 'announcements' && <AdminAnnouncements />}
          {activeTab === 'store' && <AdminGiveawaysStore />}
          {activeTab === 'logs' && <AdminAuditLogs />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
