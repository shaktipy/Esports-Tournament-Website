import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Eye, 
  X, 
  Mail, 
  User, 
  Gamepad2, 
  AlertCircle,
  Filter,
  Check,
  Send,
  RotateCw,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { 
  CONTACT_STORAGE_KEY, 
  getStoredContactRequests, 
  saveContactRequests 
} from '../ContactUs';

const AdminContacts = () => {
  const [requests, setRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewModalItem, setViewModalItem] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadRequests = async () => {
    setIsRefreshing(true);
    let localList = getStoredContactRequests();
    try {
      const res = await fetch('/api/contact-requests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.requests)) {
          const map = new Map();
          localList.forEach(item => map.set(item.id, item));
          data.requests.forEach(item => map.set(item.id, item));
          const merged = Array.from(map.values()).sort((a, b) => 
            new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
          );
          setRequests(merged);
          localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(merged));
          setIsRefreshing(false);
          return;
        }
      }
    } catch (e) {
      // Backend offline, fallback to local storage
    }
    setRequests(localList);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadRequests();

    const handleUpdate = () => loadRequests();
    window.addEventListener('haarshxo_contact_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    let bc = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('haarshxo_admin_sync');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'CONTACT_REQUESTS_UPDATED') {
            loadRequests();
          }
        };
      } catch (err) {
        // ignore
      }
    }

    return () => {
      window.removeEventListener('haarshxo_contact_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      if (bc) bc.close();
    };
  }, []);

  const handleDelete = async (id) => {
    const updated = requests.filter(r => r.id !== id);
    saveContactRequests(updated);
    setRequests(updated);
    setDeleteConfirmId(null);
    if (viewModalItem?.id === id) {
      setViewModalItem(null);
    }
    try {
      await fetch(`/api/contact-requests/${encodeURIComponent(id)}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const updated = requests.map(r => r.id === id ? { ...r, status: newStatus } : r);
    saveContactRequests(updated);
    setRequests(updated);
    if (viewModalItem?.id === id) {
      setViewModalItem({ ...viewModalItem, status: newStatus });
    }
    try {
      await fetch(`/api/contact-requests/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (e) {}
  };

  const filteredRequests = requests.filter(r => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (r.name || '').toLowerCase().includes(term) ||
      (r.email || '').toLowerCase().includes(term) ||
      (r.uid || '').toLowerCase().includes(term) ||
      (r.message || '').toLowerCase().includes(term) ||
      (r.category || '').toLowerCase().includes(term);

    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const newCount = requests.filter(r => r.status === 'new').length;
  const readCount = requests.filter(r => r.status === 'read').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;

  return (
    <div className="admin-section fade-in">
      {/* ─── SECTION HEADER ──────────────────────────────────────────────── */}
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <MessageSquare size={22} className="text-cyan inline-icon" />
            Contact & Support Requests
          </h2>
          <p className="section-subtitle">
            Manage player inquiries, tournament disputes, reward issues, and refund requests.
          </p>
        </div>

        <button 
          className="admin-btn btn-secondary btn-sm"
          onClick={loadRequests}
          disabled={isRefreshing}
          title="Refresh requests from database"
        >
          <RotateCw size={14} className={isRefreshing ? 'spin-anim' : ''} />
          <span>{isRefreshing ? 'Refreshing...' : 'Refresh Requests'}</span>
        </button>
      </div>

      {/* ─── KPI METRICS GRID ────────────────────────────────────────────── */}
      <div className="admin-kpi-grid">
        <div className="kpi-card glass-card">
          <span className="kpi-title">TOTAL SUBMISSIONS</span>
          <div className="kpi-value text-gold">{requests.length}</div>
          <div className="kpi-meta"><Inbox size={13} /> All Time Requests</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">NEW / UNREAD</span>
          <div className="kpi-value text-cyan">{newCount}</div>
          <div className="kpi-meta info">● Pending Action</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">IN PROGRESS / READ</span>
          <div className="kpi-value" style={{ color: '#f59e0b' }}>{readCount}</div>
          <div className="kpi-meta warning"><Clock size={13} /> Under Review</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">RESOLVED TICKETS</span>
          <div className="kpi-value text-success">{resolvedCount}</div>
          <div className="kpi-meta positive"><CheckCircle2 size={13} /> Closed Tickets</div>
        </div>
      </div>

      {/* ─── TOOLBAR & FILTERS ───────────────────────────────────────────── */}
      <div className="admin-toolbar glass-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, Free Fire UID, category, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({requests.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'new' ? 'active' : ''}`}
            onClick={() => setFilterStatus('new')}
          >
            New ({newCount})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'read' ? 'active' : ''}`}
            onClick={() => setFilterStatus('read')}
          >
            Read ({readCount})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'resolved' ? 'active' : ''}`}
            onClick={() => setFilterStatus('resolved')}
          >
            Resolved ({resolvedCount})
          </button>
        </div>

        <div className="contact-category-filter">
          <select 
            value={filterCategory} 
            onChange={(e) => setFilterCategory(e.target.value)}
            className="admin-select"
          >
            <option value="all">All Categories</option>
            <option value="General Inquiry">General Inquiry</option>
            <option value="Tournament Issue">Tournament Issue</option>
            <option value="Reward / Redeem Code Issue">Reward Issue</option>
            <option value="Refund Request">Refund Request</option>
            <option value="Account Access / Security">Account Issue</option>
            <option value="DPDP Grievance / Data Erasure">DPDP Grievance</option>
          </select>
        </div>
      </div>

      {/* ─── DATA TABLE ──────────────────────────────────────────────────── */}
      <div className="admin-card glass-card contact-table-card">
        <div className="table-responsive">
          <table className="admin-table contact-admin-table">
            <thead>
              <tr>
                <th style={{ width: '110px' }}>Status</th>
                <th style={{ minWidth: '190px' }}>Sender & Account</th>
                <th style={{ minWidth: '150px' }}>Category</th>
                <th style={{ width: '100px' }}>Priority</th>
                <th style={{ minWidth: '240px' }}>Message Preview</th>
                <th style={{ width: '130px' }}>Received</th>
                <th style={{ width: '140px', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '56px 24px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                      <Inbox size={42} style={{ color: '#38bdf8', opacity: 0.5 }} />
                      <strong style={{ fontSize: '1.1rem', color: '#f1f5f9' }}>No Contact Requests Found</strong>
                      <p style={{ margin: 0, fontSize: '0.88rem', maxWidth: '440px', lineHeight: '1.5' }}>
                        {requests.length === 0 
                          ? 'Messages submitted by players via the public Contact Us page will automatically appear here with real-time updates.' 
                          : 'No submissions match your active search or filter selection.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr 
                    key={req.id} 
                    className={req.status === 'new' ? 'contact-new-row' : ''}
                  >
                    {/* Status */}
                    <td>
                      <span className={`status-pill ${
                        req.status === 'resolved' 
                          ? 'status-open' 
                          : req.status === 'read' 
                            ? 'status-ongoing' 
                            : 'status-new-pill'
                      }`}>
                        {req.status === 'new' && '● NEW'}
                        {req.status === 'read' && '👁 READ'}
                        {req.status === 'resolved' && '✓ RESOLVED'}
                      </span>
                    </td>

                    {/* Sender */}
                    <td>
                      <div className="contact-sender-cell">
                        <strong className="contact-sender-name">{req.name}</strong>
                        <a href={`mailto:${req.email}`} className="contact-sender-email" title="Click to email">
                          {req.email}
                        </a>
                        {req.uid && req.uid !== 'N/A' && (
                          <span className="contact-uid-badge">
                            <Gamepad2 size={11} /> UID: {req.uid}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      <span className="contact-category-pill">
                        {req.category || 'General Inquiry'}
                      </span>
                    </td>

                    {/* Priority */}
                    <td>
                      <span className={`contact-priority-pill ${String(req.priority || 'Normal').toLowerCase()}`}>
                        {req.priority || 'Normal'}
                      </span>
                    </td>

                    {/* Message Preview */}
                    <td>
                      <div 
                        className="contact-preview-wrap"
                        onClick={() => {
                          if (req.status === 'new') handleUpdateStatus(req.id, 'read');
                          setViewModalItem(req);
                        }}
                        title="Click to read full message"
                      >
                        <span className="contact-preview-text">{req.message}</span>
                        <span className="contact-preview-more">Read full →</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td>
                      <div className="contact-date-cell">
                        <span className="contact-date-main">
                          {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recent'}
                        </span>
                        <span className="contact-date-sub">
                          {req.submittedAt ? new Date(req.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }}>
                      <div className="contact-actions-row">
                        <button
                          className="contact-action-btn view"
                          title="View Details"
                          onClick={() => {
                            if (req.status === 'new') handleUpdateStatus(req.id, 'read');
                            setViewModalItem(req);
                          }}
                        >
                          <Eye size={15} />
                        </button>

                        {req.status !== 'resolved' ? (
                          <button
                            className="contact-action-btn resolve"
                            title="Mark as Resolved"
                            onClick={() => handleUpdateStatus(req.id, 'resolved')}
                          >
                            <CheckCircle2 size={15} />
                          </button>
                        ) : (
                          <button
                            className="contact-action-btn reopen"
                            title="Reopen Ticket"
                            onClick={() => handleUpdateStatus(req.id, 'read')}
                          >
                            <Clock size={15} />
                          </button>
                        )}

                        <button
                          className="contact-action-btn delete"
                          title="Delete Request"
                          onClick={() => setDeleteConfirmId(req.id)}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── MODAL: VIEW DETAILS & RESPOND ──────────────────────────────── */}
      {viewModalItem && (
        <div className="admin-modal-overlay fade-in" onClick={() => setViewModalItem(null)}>
          <div className="contact-modal-window glass-card" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="contact-modal-header">
              <div className="modal-title-left">
                <div className="modal-icon-badge">
                  <MessageSquare size={20} className="text-cyan" />
                </div>
                <div>
                  <h3 className="modal-header-heading">Contact Request Details</h3>
                  <span className="modal-header-id">ID: #{viewModalItem.id}</span>
                </div>
              </div>

              <div className="modal-header-right">
                <span className={`status-pill ${
                  viewModalItem.status === 'resolved' 
                    ? 'status-open' 
                    : viewModalItem.status === 'read' 
                      ? 'status-ongoing' 
                      : 'status-new-pill'
                }`}>
                  {viewModalItem.status?.toUpperCase()}
                </span>
                <button 
                  className="modal-close-icon-btn" 
                  onClick={() => setViewModalItem(null)}
                  title="Close modal"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content Body */}
            <div className="contact-modal-body">
              {/* Meta Grid */}
              <div className="contact-detail-grid">
                <div className="contact-detail-card">
                  <span className="detail-tag-label">Sender Name</span>
                  <div className="detail-tag-val sender-highlight">{viewModalItem.name}</div>
                </div>

                <div className="contact-detail-card">
                  <span className="detail-tag-label">Email Address</span>
                  <a href={`mailto:${viewModalItem.email}`} className="detail-tag-val email-highlight">
                    {viewModalItem.email}
                  </a>
                </div>

                <div className="contact-detail-card">
                  <span className="detail-tag-label">Free Fire UID</span>
                  <div className="detail-tag-val uid-highlight">
                    {viewModalItem.uid && viewModalItem.uid !== 'N/A' ? viewModalItem.uid : 'Not Provided'}
                  </div>
                </div>

                <div className="contact-detail-card">
                  <span className="detail-tag-label">Category</span>
                  <div className="detail-tag-val">{viewModalItem.category}</div>
                </div>

                <div className="contact-detail-card">
                  <span className="detail-tag-label">Priority Level</span>
                  <div className="detail-tag-val">
                    <span className={`contact-priority-pill ${String(viewModalItem.priority || 'Normal').toLowerCase()}`}>
                      {viewModalItem.priority || 'Normal'}
                    </span>
                  </div>
                </div>

                <div className="contact-detail-card">
                  <span className="detail-tag-label">Received At</span>
                  <div className="detail-tag-val">
                    {viewModalItem.submittedAt ? new Date(viewModalItem.submittedAt).toLocaleString() : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Full Message Container */}
              <div className="contact-full-message-container">
                <div className="message-container-header">
                  <span className="detail-tag-label">Full Inquiry Message</span>
                  <button 
                    className="copy-btn-sm"
                    onClick={() => navigator.clipboard.writeText(viewModalItem.message)}
                  >
                    Copy Message Text
                  </button>
                </div>
                <div className="contact-message-body-text">
                  {viewModalItem.message}
                </div>
              </div>
            </div>

            {/* Footer Controls */}
            <div className="contact-modal-footer">
              <div className="modal-footer-left">
                {viewModalItem.status !== 'resolved' ? (
                  <button
                    className="admin-btn btn-success btn-sm"
                    onClick={() => handleUpdateStatus(viewModalItem.id, 'resolved')}
                  >
                    <CheckCircle2 size={15} /> Mark as Resolved
                  </button>
                ) : (
                  <button
                    className="admin-btn btn-secondary btn-sm"
                    onClick={() => handleUpdateStatus(viewModalItem.id, 'read')}
                  >
                    <Clock size={15} /> Reopen Ticket
                  </button>
                )}

                <a
                  href={`mailto:${viewModalItem.email}?subject=Regarding your HAARSH XO inquiry (${viewModalItem.category})`}
                  className="admin-btn btn-primary btn-sm"
                >
                  <Send size={15} /> Reply to {viewModalItem.email}
                </a>
              </div>

              <button
                className="admin-btn btn-danger btn-sm"
                onClick={() => setDeleteConfirmId(viewModalItem.id)}
              >
                <Trash2 size={15} /> Delete Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── CONFIRM DELETE DIALOG ───────────────────────────────────────── */}
      {deleteConfirmId && (
        <div className="admin-modal-overlay fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="contact-confirm-modal glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-modal-icon">
              <AlertTriangle size={28} />
            </div>
            <h3 className="confirm-modal-title">Delete Contact Request?</h3>
            <p className="confirm-modal-desc">
              Are you sure you want to delete this submission? This will permanently remove the record from both the database and admin dashboard.
            </p>
            <div className="confirm-modal-buttons">
              <button 
                className="admin-btn btn-secondary btn-sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button 
                className="admin-btn btn-danger btn-sm"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes, Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
