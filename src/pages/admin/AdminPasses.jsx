import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  Zap, Shield, Crown, Plus, Edit, Trash2, CheckCircle2, 
  IndianRupee, Ticket, X, Sparkles, AlertCircle 
} from 'lucide-react';

const AdminPasses = () => {
  const { passes, createPass, updatePass, deletePass } = useAdmin();

  const [showModal, setShowModal] = useState(false);
  const [editingPass, setEditingPass] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    inrPrice: 49,
    grantCs: 5,
    grantBr: 0,
    grantCoins: 100,
    ticketType: 'CS',
    featuresText: '',
    accentColor: '#10b981',
    badge: 'NEW',
    ticketImage: '/tokens/cs-ticket.png',
  });

  const openCreateModal = () => {
    setEditingPass(null);
    setFormData({
      title: 'WEEKEND WARRIOR PASS',
      subtitle: '8x CS Tournament Tickets + 100 Coins',
      inrPrice: 49,
      grantCs: 8,
      grantBr: 0,
      grantCoins: 100,
      ticketType: 'CS',
      featuresText: '8x CS Tournament Registration Tickets\n+100 Free XO Bonus Coins\nPriority Slot Confirmation in Scrims\nDirect Auto-Approval in Custom Rooms\nDiscord Verified Competitor Role',
      accentColor: '#6366f1',
      badge: 'SPECIAL',
      ticketImage: '/tokens/cs-ticket.png',
    });
    setShowModal(true);
  };

  const openEditModal = (pass) => {
    setEditingPass(pass);
    setFormData({
      title: pass.title,
      subtitle: pass.subtitle,
      inrPrice: pass.inrPrice,
      grantCs: pass.grantCs,
      grantBr: pass.grantBr,
      grantCoins: pass.grantCoins !== undefined ? pass.grantCoins : 0,
      ticketType: pass.ticketType || 'COMBO',
      featuresText: (pass.features || []).join('\n'),
      accentColor: pass.accentColor || '#10b981',
      badge: pass.badge || 'PRO',
      ticketImage: pass.ticketImage || '/tokens/cs-ticket.png',
    });
    setShowModal(true);
  };

  const handleSavePass = (e) => {
    e.preventDefault();
    const features = formData.featuresText
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const passPayload = {
      title: formData.title,
      subtitle: formData.subtitle,
      inrPrice: Number(formData.inrPrice),
      grantCs: Number(formData.grantCs),
      grantBr: Number(formData.grantBr),
      grantCoins: Number(formData.grantCoins) || 0,
      ticketType: formData.ticketType,
      features,
      accentColor: formData.accentColor,
      badge: formData.badge,
      ticketImage: formData.ticketImage,
    };

    if (editingPass) {
      updatePass(editingPass.id, passPayload);
    } else {
      createPass(passPayload);
    }
    setShowModal(false);
    setEditingPass(null);
  };

  return (
    <div className="admin-passes-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>🎫 Tournament Passes & Pricing Manager</h2>
          <p className="subpage-desc">Create custom tournament passes, modify INR pricing, adjust ticket reward benefits, and sync with Razorpay.</p>
        </div>
        <button className="admin-btn btn-primary" onClick={openCreateModal}>
          <Plus size={16} /> Create New Pass
        </button>
      </div>

      {/* Sync Notice */}
      <div className="admin-alert-banner">
        <Sparkles size={16} className="text-amber" />
        <span>Passes and INR prices configured here automatically synchronize with the public <strong>XO Passes</strong> page and the <strong>Razorpay Backend Gateway</strong>.</span>
      </div>

      {/* Passes Grid */}
      <div className="admin-passes-grid">
        {passes.map(pass => (
          <div key={pass.id} className="admin-pass-card glass-card" style={{ borderColor: `${pass.accentColor}44` }}>
            <div className="ap-card-top" style={{ background: pass.color || `linear-gradient(135deg, ${pass.accentColor}22 0%, rgba(15,23,42,0.9) 100%)` }}>
              <div className="ap-badge-wrap">
                <span className="ap-badge" style={{ backgroundColor: pass.accentColor }}>
                  {pass.badge || 'XO PASS'}
                </span>
                <span className={`status-pill ${pass.active !== false ? 'status-open' : 'status-closed'}`}>
                  {pass.active !== false ? 'ACTIVE' : 'DISABLED'}
                </span>
              </div>
              <h3 className="ap-title">{pass.title}</h3>
              <p className="ap-sub">{pass.subtitle}</p>
              
              <div className="ap-price-box">
                <span className="ap-curr">₹</span>
                <span className="ap-amount">{pass.inrPrice}</span>
                <span className="ap-per">/ one-time</span>
              </div>
            </div>

            <div className="ap-card-body">
              {/* Ticket & Coins Rewards Pill */}
              <div className="ap-rewards-pill">
                <Ticket size={16} />
                <span>
                  Rewards: <strong>+{pass.grantCs} CS</strong>, <strong>+{pass.grantBr} BR</strong>
                  {Number(pass.grantCoins) > 0 ? (
                    <> & <strong style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>+{pass.grantCoins} XO Coins <img src="/tokens/xo-coin.png" alt="XO Coin" style={{ width: 14, height: 14, objectFit: 'contain' }} /></strong></>
                  ) : null}
                </span>
              </div>

              {/* Features List */}
              <ul className="ap-features">
                {(pass.features || []).map((feat, i) => (
                  <li key={i}>
                    <CheckCircle2 size={14} style={{ color: pass.accentColor }} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="ap-card-actions">
              <button 
                className="admin-btn btn-secondary btn-sm"
                onClick={() => updatePass(pass.id, { active: pass.active === false ? true : false })}
              >
                {pass.active === false ? 'Enable Pass' : 'Disable Pass'}
              </button>
              <button 
                className="admin-btn btn-primary btn-sm"
                onClick={() => openEditModal(pass)}
              >
                <Edit size={14} /> Edit Benefits & Price
              </button>
              <button 
                className="btn-danger-icon"
                onClick={() => {
                  if (window.confirm(`Delete pass "${pass.title}"?`)) {
                    deletePass(pass.id);
                  }
                }}
                title="Delete pass"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create / Edit Pass Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>{editingPass ? '✏️ Edit Tournament Pass' : '🎫 Create New Tournament Pass'}</h3>
              <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSavePass} className="modal-form">
              <div className="form-group">
                <label>Pass Title *</label>
                <input 
                  type="text" 
                  required
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. MEGA SQUAD TOURNAMENT PASS"
                />
              </div>

              <div className="form-group">
                <label>Subtitle / Short Summary</label>
                <input 
                  type="text" 
                  value={formData.subtitle} 
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  placeholder="e.g. 5x CS Tickets + 5x BR Tickets"
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Price in INR (₹) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={formData.inrPrice} 
                    onChange={e => setFormData({ ...formData, inrPrice: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    Grant XO Coins 
                    <img src="/tokens/xo-coin.png" alt="XO Coin" style={{ width: 16, height: 16, objectFit: 'contain' }} />
                  </label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.grantCoins} 
                    onChange={e => setFormData({ ...formData, grantCoins: e.target.value })}
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Grant CS Tickets 🎫</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.grantCs} 
                    onChange={e => setFormData({ ...formData, grantCs: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Grant BR Tickets 🎫</label>
                  <input 
                    type="number" 
                    min="0"
                    value={formData.grantBr} 
                    onChange={e => setFormData({ ...formData, grantBr: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Badge Label</label>
                  <input 
                    type="text" 
                    value={formData.badge} 
                    onChange={e => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. POPULAR, BEST VALUE, SPECIAL"
                  />
                </div>
                <div className="form-group">
                  <label>Accent Glow Color</label>
                  <input 
                    type="color" 
                    value={formData.accentColor} 
                    onChange={e => setFormData({ ...formData, accentColor: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Perks & Features (One per line)</label>
                <textarea 
                  rows="4"
                  value={formData.featuresText} 
                  onChange={e => setFormData({ ...formData, featuresText: e.target.value })}
                  placeholder="5x CS Tournament Registration Tickets&#10;Entry to Master Tier 4v4 Cups&#10;Priority Slot Confirmation"
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingPass ? 'Update Pass & Sync' : 'Save & Publish Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPasses;
