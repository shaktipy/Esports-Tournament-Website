import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Megaphone, Plus, Trash2, Power, Edit, 
  Sparkles, Trophy, Gift, AlertTriangle, X 
} from 'lucide-react';

const AdminAnnouncements = () => {
  const { announcements, createAnnouncement, updateAnnouncement, deleteAnnouncement, toggleAnnouncement } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [editingAnn, setEditingAnn] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'tournament',
    showMarquee: true,
  });

  const openCreateModal = () => {
    setEditingAnn(null);
    setFormData({
      title: '🚨 WEEKEND FLASH TOURNAMENT ANNOUNCED!',
      message: 'Registration starts tonight at 9:00 PM IST on HAARSH XO Arena.',
      type: 'tournament',
      showMarquee: true,
    });
    setShowModal(true);
  };

  const openEditModal = (ann) => {
    setEditingAnn(ann);
    setFormData({
      title: ann.title,
      message: ann.message || '',
      type: ann.type || 'tournament',
      showMarquee: ann.showMarquee !== false,
    });
    setShowModal(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    if (editingAnn) {
      updateAnnouncement(editingAnn.id, formData);
    } else {
      createAnnouncement(formData);
    }
    setShowModal(false);
  };

  return (
    <div className="admin-announcements-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>📢 Global Broadcast & Announcements</h2>
          <p className="subpage-desc">Publish real-time news, tournament countdowns, promo banners, and maintenance alerts across the entire site.</p>
        </div>
        <button className="admin-btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Broadcast New Announcement
        </button>
      </div>

      {/* Announcements List */}
      <div className="admin-ann-grid">
        {announcements.map(ann => (
          <div key={ann.id} className={`admin-ann-card glass-card ann-border-${ann.type}`}>
            <div className="ann-card-header">
              <span className={`ann-type-badge type-${ann.type}`}>
                {ann.type?.toUpperCase()}
              </span>
              <button 
                className={`status-pill clickable ${ann.active ? 'status-open' : 'status-closed'}`}
                onClick={() => toggleAnnouncement(ann.id)}
                title="Toggle Active Broadcast"
              >
                <Power size={11} /> {ann.active ? 'BROADCASTING' : 'OFFLINE'}
              </button>
            </div>

            <h3 className="ann-card-title">{ann.title}</h3>
            {ann.message && <p className="ann-card-message">{ann.message}</p>}

            <div className="ann-card-meta">
              <span>📅 {ann.createdAt}</span>
              <span>{ann.showMarquee ? '⚡ Displayed on Marquee' : 'Modal only'}</span>
            </div>

            <div className="ann-card-actions">
              <button 
                className="admin-btn btn-secondary btn-xs"
                onClick={() => openEditModal(ann)}
              >
                <Edit size={12} /> Edit
              </button>
              <button 
                className="btn-danger-icon"
                onClick={() => {
                  if (window.confirm(`Delete announcement "${ann.title}"?`)) {
                    deleteAnnouncement(ann.id);
                  }
                }}
                title="Delete announcement"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>{editingAnn ? '✏️ Edit Announcement' : '📢 Create New Announcement'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="modal-form">
              <div className="form-group">
                <label>Headline Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. 🔥 ₹50,000 Battle Royale Registration is LIVE!"
                />
              </div>

              <div className="form-group">
                <label>Detailed Message / Description</label>
                <textarea 
                  rows="3"
                  value={formData.message}
                  onChange={e => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Additional context or stream links..."
                ></textarea>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Announcement Type</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                  >
                    <option value="tournament">Tournament (Amber/Gold)</option>
                    <option value="reward">Promo / Rewards (Orange)</option>
                    <option value="giveaway">Giveaway (Emerald)</option>
                    <option value="urgent">Urgent / Critical (Red)</option>
                    <option value="system">System Notice (Blue)</option>
                  </select>
                </div>

                <div className="form-group checkbox-group-wrap">
                  <label className="checkbox-label">
                    <input 
                      type="checkbox" 
                      checked={formData.showMarquee}
                      onChange={e => setFormData({ ...formData, showMarquee: e.target.checked })}
                    />
                    <span>Show in Top Header Ticker Bar</span>
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingAnn ? 'Update Broadcast' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;
