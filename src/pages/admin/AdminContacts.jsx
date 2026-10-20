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
  Send
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

  const loadRequests = async () => {
    let localList = getStoredContactRequests();
    try {
      const res = await fetch('/api/contact-requests');
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.requests)) {
          // Merge backend with local (by id)
          const map = new Map();
          localList.forEach(item => map.set(item.id, item));
          data.requests.forEach(item => map.set(item.id, item));
          const merged = Array.from(map.values()).sort((a, b) => 
            new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
          );
          setRequests(merged);
          localStorage.setItem(CONTACT_STORAGE_KEY, JSON.stringify(merged));
          return;
        }
      }
    } catch (e) {
      // Backend offline, fallback to local storage
    }
    setRequests(localList);
  };

  useEffect(() => {
    loadRequests();

    // Listen to local custom event and storage events
    const handleUpdate = () => loadRequests();
    window.addEventListener('haarshxo_contact_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    // BroadcastChannel sync across tabs
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
      (r.message || '').toLowerCase().includes(term);

    const matchesCategory = filterCategory === 'all' || r.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || r.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const newCount = requests.filter(r => r.status === 'new').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;

  return (
    <div className="admin-section fade-in">
      <div className="section-header">
        <div>
          <h2 className="section-title">
            <MessageSquare size={22} className="text-cyan inline-icon" />
            Contact & Support Requests
          </h2>
          <p className="section-subtitle">
            User inquiries, tournament disputes, refund claims, and grievance submissions.
          </p>
        </div>

        <div className="header-stat-badges">
          <div className="stat-pill">
            <span className="pill-dot new"></span>
            <span>New: <strong>{newCount}</strong></span>
          </div>
          <div className="stat-pill">
            <span className="pill-dot resolved"></span>
            <span>Resolved: <strong>{resolvedCount}</strong></span>
          </div>
          <div className="stat-pill">
            <span>Total: <strong>{requests.length}</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="admin-toolbar glass-card">
        <div className="admin-search-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            placeholder="Search by name, email, UID, or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toolbar-filters">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="admin-select"
            >
              <option value="all">All Statuses</option>
              <option value="new">New / Unread</option>
              <option value="read">Read / In-Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div className="filter-group">
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
      </div>

      {/* Requests Table */}
      <div className="admin-table-container glass-card">
        {filteredRequests.length === 0 ? (
          <div className="admin-empty-state">
            <MessageSquare size={42} style={{ opacity: 0.35, margin: '0 auto 12px' }} />
            <h3>No Contact Requests Found</h3>
            <p>
              {requests.length === 0 
                ? 'No inquiries have been received yet through the Contact Us form.' 
                : 'No submissions match your active filter criteria.'}
            </p>
          </div>
        ) : (
          <table className="admin-data-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Sender</th>
                <th>Category</th>
                <th>Priority</th>
                <th>Message Snippet</th>
                <th>Submitted</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => (
                <tr key={req.id} className={req.status === 'new' ? 'highlight-row' : ''}>
                  <td>
                    <span className={`status-badge ${req.status || 'new'}`}>
                      {req.status === 'new' && '● New'}
                      {req.status === 'read' && '👁 Read'}
                      {req.status === 'resolved' && '✓ Resolved'}
                    </span>
                  </td>
                  <td>
                    <div className="table-user-cell">
                      <strong>{req.name}</strong>
                      <span className="sub-detail">{req.email}</span>
                      {req.uid && req.uid !== 'N/A' && (
                        <span className="badge-tag">UID: {req.uid}</span>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="category-tag">{req.category}</span>
                  </td>
                  <td>
                    <span className={`priority-tag ${String(req.priority || 'Normal').toLowerCase()}`}>
                      {req.priority || 'Normal'}
                    </span>
                  </td>
                  <td className="message-snippet-cell">
                    <p className="snippet-text">{req.message}</p>
                  </td>
                  <td className="date-cell">
                    {req.submittedAt ? new Date(req.submittedAt).toLocaleDateString() : 'Recent'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="action-buttons-group">
                      <button
                        className="btn-action-icon view"
                        title="View Full Details"
                        onClick={() => {
                          if (req.status === 'new') {
                            handleUpdateStatus(req.id, 'read');
                          }
                          setViewModalItem(req);
                        }}
                      >
                        <Eye size={15} />
                      </button>

                      <button
                        className="btn-action-icon delete"
                        title="Delete Request"
                        onClick={() => setDeleteConfirmId(req.id)}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* View Request Details Modal */}
      {viewModalItem && (
        <div className="modal-backdrop fade-in" onClick={() => setViewModalItem(null)}>
          <div className="admin-modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <h3>Contact Request #{viewModalItem.id.substring(4, 9)}</h3>
                <span className={`status-badge ${viewModalItem.status}`}>
                  {viewModalItem.status?.toUpperCase()}
                </span>
              </div>
              <button className="modal-close-btn" onClick={() => setViewModalItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-item">
                  <span className="detail-label">Name</span>
                  <span className="detail-val">{viewModalItem.name}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <a href={`mailto:${viewModalItem.email}`} className="detail-val text-cyan">
                    {viewModalItem.email}
                  </a>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Free Fire UID</span>
                  <span className="detail-val">{viewModalItem.uid || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-val">{viewModalItem.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Priority</span>
                  <span className="detail-val">{viewModalItem.priority || 'Normal'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Date Submitted</span>
                  <span className="detail-val">
                    {viewModalItem.submittedAt ? new Date(viewModalItem.submittedAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>

              <div className="modal-message-box">
                <span className="detail-label">Full Message</span>
                <div className="message-content-pre">
                  {viewModalItem.message}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <div className="status-change-buttons">
                {viewModalItem.status !== 'resolved' ? (
                  <button
                    className="btn-mark-resolved"
                    onClick={() => handleUpdateStatus(viewModalItem.id, 'resolved')}
                  >
                    <CheckCircle2 size={16} /> Mark as Resolved
                  </button>
                ) : (
                  <button
                    className="btn-mark-unread"
                    onClick={() => handleUpdateStatus(viewModalItem.id, 'new')}
                  >
                    <Clock size={16} /> Reopen as New
                  </button>
                )}
                <a
                  href={`mailto:${viewModalItem.email}?subject=Regarding your HAARSH XO inquiry (${viewModalItem.category})`}
                  className="btn-reply-email"
                >
                  <Send size={15} /> Reply via Email
                </a>
              </div>

              <button
                className="btn-delete-request"
                onClick={() => setDeleteConfirmId(viewModalItem.id)}
              >
                <Trash2 size={15} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="modal-backdrop fade-in" onClick={() => setDeleteConfirmId(null)}>
          <div className="admin-confirm-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon danger">
              <Trash2 size={24} />
            </div>
            <h3>Delete Contact Request?</h3>
            <p>
              This action cannot be undone. The request will be permanently removed from the system.
            </p>
            <div className="confirm-actions">
              <button 
                className="btn-cancel"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button 
                className="btn-confirm-delete"
                onClick={() => handleDelete(deleteConfirmId)}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContacts;
