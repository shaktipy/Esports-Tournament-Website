import { useAdmin } from '../../context/AdminContext';
import { 
  Trophy, IndianRupee, Users, Ticket, Gift, 
  CheckCircle, ArrowUpRight, TrendingUp, AlertCircle, ShieldAlert, Zap
} from 'lucide-react';

const AdminOverview = ({ setActiveTab }) => {
  const { 
    tournaments, 
    passes, 
    transactions, 
    usersList, 
    redeemCodes,
    auditLogs 
  } = useAdmin();

  // Metrics calculation
  const realRazorpayTx = (transactions || []).filter(t => 
    (t.currency === 'INR' || !t.currency) && 
    t.currency !== 'XO Coins' && 
    !String(t.id).startsWith('tx_store_')
  );

  const totalRevenue = realRazorpayTx
    .filter(t => t.status === 'captured')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const activeTournaments = tournaments.filter(t => t.status === 'open' || t.status === 'ongoing');
  const totalParticipants = tournaments.reduce((sum, t) => sum + (t.participants?.length || 0), 0);
  const activeCodes = redeemCodes.filter(c => c.active && new Date(c.expiryDate) >= new Date());
  const bannedUsers = usersList.filter(u => u.status === 'banned' || u.status === 'suspended');

  return (
    <div className="admin-overview fade-in">
      {/* Welcome Banner */}
      <div className="admin-hero-banner glass-card">
        <div className="admin-hero-content">
          <div className="admin-hero-tag">
            <span className="live-dot pulse"></span> MASTER CONTROL SYSTEM LIVE
          </div>
          <h1 className="admin-hero-title">HAARSH XO Operations Command</h1>
          <p className="admin-hero-desc">
            Manage live esports tournaments, pass sales, participant brackets, instant prize distributions, promo codes, and player accounts from one unified dashboard.
          </p>
        </div>
        <div className="admin-hero-actions">
          <button className="admin-btn btn-primary" onClick={() => setActiveTab('tournaments')}>
            <Trophy size={16} /> Create Tournament
          </button>
          <button className="admin-btn btn-secondary" onClick={() => setActiveTab('codes')}>
            <Gift size={16} /> Generate Code
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-kpi-grid">
        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">TOTAL REVENUE (INR)</span>
            <div className="kpi-icon-wrap inr">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="kpi-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="kpi-meta positive">
            <TrendingUp size={14} /> {realRazorpayTx.filter(t => t.status === 'captured').length} Razorpay orders
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">ACTIVE TOURNAMENTS</span>
            <div className="kpi-icon-wrap tourney">
              <Trophy size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeTournaments.length} <span className="kpi-sub">/ {tournaments.length} Total</span></div>
          <div className="kpi-meta info">
            <Ticket size={14} /> {totalParticipants} Registered Players
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">REGISTERED USERS</span>
            <div className="kpi-icon-wrap users">
              <Users size={20} />
            </div>
          </div>
          <div className="kpi-value">{usersList.length}</div>
          <div className="kpi-meta warning">
            <ShieldAlert size={14} /> {bannedUsers.length} Suspended / Banned
          </div>
        </div>

        <div className="kpi-card glass-card">
          <div className="kpi-header">
            <span className="kpi-title">ACTIVE REDEEM CODES</span>
            <div className="kpi-icon-wrap codes">
              <Gift size={20} />
            </div>
          </div>
          <div className="kpi-value">{activeCodes.length} <span className="kpi-sub">Active</span></div>
          <div className="kpi-meta positive">
            <CheckCircle size={14} /> {redeemCodes.reduce((s, c) => s + (c.usedCount || 0), 0)} Redemptions
          </div>
        </div>
      </div>

      {/* Two Column Layout: Quick Actions & Live Feed */}
      <div className="admin-grid-2col">
        {/* Active Tournaments Quick View */}
        <div className="admin-card glass-card">
          <div className="card-header-bar">
            <h3><Trophy size={18} className="text-amber" /> Live Tournaments Status</h3>
            <button className="text-link" onClick={() => setActiveTab('tournaments')}>
              View All ({tournaments.length}) <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="table-responsive">
            <table className="admin-mini-table">
              <thead>
                <tr>
                  <th>Tournament</th>
                  <th>Mode</th>
                  <th>Prize Pool</th>
                  <th>Slots</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.slice(0, 4).map(t => (
                  <tr key={t.id}>
                    <td>
                      <div className="t-cell-name">
                        <strong>{t.title}</strong>
                        <span className="t-cell-sub">{t.date}</span>
                      </div>
                    </td>
                    <td><span className="mode-pill">{t.mode}</span></td>
                    <td className="text-gold font-bold">{t.prize}</td>
                    <td>{t.slots}</td>
                    <td>
                      <span className={`status-pill status-${t.status}`}>
                        {t.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Audit Logs & Transactions */}
        <div className="admin-card glass-card">
          <div className="card-header-bar">
            <h3><Zap size={18} className="text-cyan" /> Recent System Audit Logs</h3>
            <button className="text-link" onClick={() => setActiveTab('logs')}>
              Full Logs <ArrowUpRight size={14} />
            </button>
          </div>
          <div className="audit-feed">
            {auditLogs.slice(0, 5).map(log => (
              <div key={log.id} className="audit-feed-item">
                <div className={`audit-badge-dot cat-${log.category.toLowerCase()}`}></div>
                <div className="audit-feed-info">
                  <div className="audit-feed-top">
                    <span className="audit-action">{log.action}</span>
                    <span className="audit-time">{log.timestamp}</span>
                  </div>
                  <p className="audit-desc">{log.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;
