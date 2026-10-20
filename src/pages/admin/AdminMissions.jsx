import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { DEFAULT_MISSIONS } from '../../utils/defaultMissions';
import {
  Edit3, RotateCcw, Save, X, Plus, Trash2,
  CheckCircle2, AlertCircle, Clock, Zap, AlertTriangle
} from 'lucide-react';
import './AdminMissions.css';

const FREQ_LABELS = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };
const FREQ_COLORS = { daily: '#a78bfa', weekly: '#34d399', monthly: '#fb923c' };

export default function AdminMissions() {
  const { missions, createMission, updateMission, deleteMission, resetMissions } = useAdmin();

  const [activeFreq, setActiveFreq] = useState('daily');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [deletingMission, setDeletingMission] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [toastMsg, setToastMsg] = useState('');

  // Form for creating a new mission
  const [newMissionForm, setNewMissionForm] = useState({
    frequency: 'daily',
    category: 'Live Watch Missions',
    title: '',
    description: '',
    type: 'live',
    target: 30,
    unit: 'Minutes',
    displayTarget: '',
    coins: 20,
    csTickets: 0,
    brTickets: 0,
    active: true,
  });

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  const byFreq = (missions || DEFAULT_MISSIONS).filter(m => m.frequency === activeFreq);

  // Edit mission handlers
  const openEdit = (mission) => {
    setEditingId(mission.id);
    setEditForm({
      title: mission.title,
      description: mission.description,
      target: mission.target,
      displayTarget: mission.displayTarget || '',
      coins: mission.reward?.coins ?? 0,
      csTickets: mission.reward?.csTickets ?? 0,
      brTickets: mission.reward?.brTickets ?? 0,
      active: mission.active !== false,
    });
  };

  const closeEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleSave = (missionId) => {
    updateMission(missionId, {
      title: editForm.title,
      description: editForm.description,
      target: Number(editForm.target),
      displayTarget: editForm.displayTarget || undefined,
      reward: {
        coins: Number(editForm.coins),
        csTickets: Number(editForm.csTickets),
        brTickets: Number(editForm.brTickets),
      },
      active: editForm.active,
    });
    setSavedId(missionId);
    setTimeout(() => setSavedId(null), 2000);
    showToast('Mission updated successfully!');
    closeEdit();
  };

  const handleFieldChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  // Create mission handlers
  const openCreateModal = () => {
    setNewMissionForm({
      frequency: activeFreq,
      category: activeFreq === 'daily' ? 'Live Watch Missions' : activeFreq === 'weekly' ? 'Weekly Live Grinder' : 'Monthly Champions',
      title: '',
      description: '',
      type: activeFreq === 'daily' ? 'live' : 'totalLive',
      target: activeFreq === 'daily' ? 30 : activeFreq === 'weekly' ? 300 : 2700,
      unit: activeFreq === 'daily' ? 'Minutes' : 'Hours',
      displayTarget: '',
      coins: 25,
      csTickets: 0,
      brTickets: 0,
      active: true,
    });
    setShowCreateModal(true);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newMissionForm.title.trim()) {
      alert('Please enter a mission title');
      return;
    }

    const created = createMission({
      frequency: newMissionForm.frequency,
      category: newMissionForm.category || (newMissionForm.frequency === 'daily' ? 'Live Watch Missions' : 'Weekly Live Grinder'),
      title: newMissionForm.title.trim(),
      description: newMissionForm.description.trim(),
      type: newMissionForm.type,
      target: Number(newMissionForm.target) || 15,
      unit: newMissionForm.unit,
      displayTarget: newMissionForm.displayTarget.trim() || undefined,
      reward: {
        coins: Number(newMissionForm.coins) || 0,
        csTickets: Number(newMissionForm.csTickets) || 0,
        brTickets: Number(newMissionForm.brTickets) || 0,
      },
      active: newMissionForm.active,
    });

    setActiveFreq(newMissionForm.frequency);
    setShowCreateModal(false);
    showToast(`Created mission "${created.title}"!`);
  };

  // Delete mission handlers
  const confirmDelete = () => {
    if (!deletingMission) return;
    deleteMission(deletingMission.id);
    showToast(`Deleted mission "${deletingMission.title}"`);
    setDeletingMission(null);
  };

  return (
    <div className="adm-missions">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="adm-missions__toast">
          <CheckCircle2 size={16} />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="adm-missions__header">
        <div>
          <h2 className="adm-missions__title">
            <Zap size={22} /> Missions Control
          </h2>
          <p className="adm-missions__subtitle">
            Create, edit, or delete missions and manually configure coin & ticket reward payouts.
          </p>
        </div>
        <div className="adm-missions__header-actions">
          <button
            className="adm-missions__create-btn"
            onClick={openCreateModal}
          >
            <Plus size={16} /> Add New Mission
          </button>
          <button
            className="adm-missions__reset-btn"
            onClick={() => setShowResetConfirm(true)}
          >
            <RotateCcw size={15} /> Reset to Defaults
          </button>
        </div>
      </div>

      {/* Frequency Tabs */}
      <div className="adm-missions__tabs">
        {['daily', 'weekly', 'monthly'].map(freq => (
          <button
            key={freq}
            className={`adm-missions__tab ${activeFreq === freq ? 'active' : ''}`}
            style={activeFreq === freq ? { borderColor: FREQ_COLORS[freq], color: FREQ_COLORS[freq] } : {}}
            onClick={() => setActiveFreq(freq)}
          >
            {FREQ_LABELS[freq]} Missions ({(missions || DEFAULT_MISSIONS).filter(m => m.frequency === freq).length})
          </button>
        ))}
      </div>

      {/* Mission Cards */}
      <div className="adm-missions__list">
        {byFreq.length === 0 ? (
          <div className="adm-missions__empty">
            <AlertCircle size={32} />
            <p>No {FREQ_LABELS[activeFreq]} missions found.</p>
            <button className="adm-missions__create-btn" onClick={openCreateModal}>
              <Plus size={15} /> Create First {FREQ_LABELS[activeFreq]} Mission
            </button>
          </div>
        ) : (
          byFreq.map(mission => {
            const isEditing = editingId === mission.id;
            const isSaved = savedId === mission.id;
            const defaultM = DEFAULT_MISSIONS.find(d => d.id === mission.id);
            const isModified = defaultM && JSON.stringify(mission) !== JSON.stringify(defaultM);
            const isCustom = !defaultM;

            return (
              <div
                key={mission.id}
                className={`adm-mission-card ${isEditing ? 'editing' : ''} ${mission.active === false ? 'disabled' : ''}`}
              >
                <div className="adm-mission-card__top">
                  <div className="adm-mission-card__meta">
                    <span className="adm-mission-card__freq-badge" style={{ background: FREQ_COLORS[mission.frequency] + '22', color: FREQ_COLORS[mission.frequency] }}>
                      {FREQ_LABELS[mission.frequency]}
                    </span>
                    {isCustom && (
                      <span className="adm-mission-card__custom-badge">Custom</span>
                    )}
                    {isModified && (
                      <span className="adm-mission-card__modified-badge">Modified</span>
                    )}
                    {isSaved && (
                      <span className="adm-mission-card__saved-badge">
                        <CheckCircle2 size={12} /> Saved!
                      </span>
                    )}
                  </div>

                  {!isEditing ? (
                    <div className="adm-mission-card__view">
                      <div className="adm-mission-card__info">
                        <h3 className={`adm-mission-card__name ${mission.active === false ? 'inactive' : ''}`}>
                          {mission.active === false && <AlertCircle size={14} className="adm-mission-card__inactive-icon" />}
                          {mission.title}
                        </h3>
                        <p className="adm-mission-card__desc">{mission.description}</p>
                        <div className="adm-mission-card__target-row">
                          <Clock size={13} />
                          <span>Target: <strong>{mission.displayTarget || `${mission.target} ${mission.unit || ''}`}</strong></span>
                          <span className="adm-mission-card__type-tag">({mission.type})</span>
                        </div>
                      </div>

                      <div className="adm-mission-card__right">
                        <div className="adm-mission-card__rewards">
                          {mission.reward?.coins > 0 && (
                            <span className="adm-mission-card__reward-chip coin">
                              <img src="/tokens/xo-coin.png" alt="XO Coin" />
                              {mission.reward.coins}
                            </span>
                          )}
                          {mission.reward?.csTickets > 0 && (
                            <span className="adm-mission-card__reward-chip cs">
                              <img src="/tokens/cs-ticket.png" alt="CS" />
                              {mission.reward.csTickets}
                            </span>
                          )}
                          {mission.reward?.brTickets > 0 && (
                            <span className="adm-mission-card__reward-chip br">
                              <img src="/tokens/br-ticket.png" alt="BR" />
                              {mission.reward.brTickets}
                            </span>
                          )}
                        </div>
                        <div className="adm-mission-card__actions-group">
                          <button className="adm-mission-card__edit-btn" onClick={() => openEdit(mission)} title="Edit Mission">
                            <Edit3 size={14} /> Edit
                          </button>
                          <button
                            className="adm-mission-card__delete-btn"
                            onClick={() => setDeletingMission(mission)}
                            title="Delete Mission"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="adm-mission-card__form">
                      <div className="adm-mf-row">
                        <label>Title</label>
                        <input
                          type="text"
                          value={editForm.title}
                          onChange={e => handleFieldChange('title', e.target.value)}
                          className="adm-mf-input"
                          placeholder="Mission title..."
                        />
                      </div>

                      <div className="adm-mf-row">
                        <label>Description</label>
                        <textarea
                          value={editForm.description}
                          onChange={e => handleFieldChange('description', e.target.value)}
                          className="adm-mf-input adm-mf-textarea"
                          placeholder="Short description shown to users..."
                          rows={2}
                        />
                      </div>

                      <div className="adm-mf-grid-2">
                        <div className="adm-mf-row">
                          <label>Target (minutes)</label>
                          <input
                            type="number"
                            min={1}
                            value={editForm.target}
                            onChange={e => handleFieldChange('target', e.target.value)}
                            className="adm-mf-input"
                          />
                        </div>
                        <div className="adm-mf-row">
                          <label>Display Label <span className="adm-mf-hint">(optional)</span></label>
                          <input
                            type="text"
                            value={editForm.displayTarget}
                            onChange={e => handleFieldChange('displayTarget', e.target.value)}
                            className="adm-mf-input"
                            placeholder="e.g. 10 Hours (600m)"
                          />
                        </div>
                      </div>

                      <div className="adm-mf-rewards-section">
                        <p className="adm-mf-rewards-label">Reward Payout</p>
                        <div className="adm-mf-rewards-grid">
                          <div className="adm-mf-reward-item">
                            <img src="/tokens/xo-coin.png" alt="XO Coin" className="adm-mf-token-img" />
                            <label>XO Coins</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.coins}
                              onChange={e => handleFieldChange('coins', e.target.value)}
                              className="adm-mf-input adm-mf-reward-input"
                            />
                          </div>
                          <div className="adm-mf-reward-item">
                            <img src="/tokens/cs-ticket.png" alt="CS Ticket" className="adm-mf-token-img" />
                            <label>CS Tickets</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.csTickets}
                              onChange={e => handleFieldChange('csTickets', e.target.value)}
                              className="adm-mf-input adm-mf-reward-input"
                            />
                          </div>
                          <div className="adm-mf-reward-item">
                            <img src="/tokens/br-ticket.png" alt="BR Ticket" className="adm-mf-token-img" />
                            <label>BR Tickets</label>
                            <input
                              type="number"
                              min={0}
                              value={editForm.brTickets}
                              onChange={e => handleFieldChange('brTickets', e.target.value)}
                              className="adm-mf-input adm-mf-reward-input"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="adm-mf-row adm-mf-toggle-row">
                        <label>Mission Active</label>
                        <label className="adm-mf-toggle">
                          <input
                            type="checkbox"
                            checked={editForm.active}
                            onChange={e => handleFieldChange('active', e.target.checked)}
                          />
                          <span className="adm-mf-toggle-slider" />
                        </label>
                      </div>

                      <div className="adm-mf-actions">
                        <button className="adm-mf-btn cancel" onClick={closeEdit}>
                          <X size={14} /> Cancel
                        </button>
                        <button
                          className="adm-mf-btn save"
                          onClick={() => handleSave(mission.id)}
                        >
                          <Save size={14} /> Save Mission
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Create New Mission Modal ────────────────────────────────────────── */}
      {showCreateModal && (
        <div className="adm-missions__overlay" onClick={() => setShowCreateModal(false)}>
          <div className="adm-missions__create-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-missions__modal-header">
              <div className="adm-missions__modal-title">
                <Plus size={20} className="text-cyan" />
                <h3>Create New Mission</h3>
              </div>
              <button className="adm-missions__modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="adm-missions__create-form">
              <div className="adm-mf-grid-2">
                <div className="adm-mf-row">
                  <label>Frequency Tab *</label>
                  <select
                    value={newMissionForm.frequency}
                    onChange={e => {
                      const f = e.target.value;
                      setNewMissionForm(prev => ({
                        ...prev,
                        frequency: f,
                        unit: f === 'daily' ? 'Minutes' : 'Hours',
                        type: f === 'daily' ? 'live' : 'totalLive',
                        category: f === 'daily' ? 'Live Watch Missions' : f === 'weekly' ? 'Weekly Live Grinder' : 'Monthly Champions',
                      }));
                    }}
                    className="adm-mf-input"
                  >
                    <option value="daily">Daily Mission</option>
                    <option value="weekly">Weekly Mission</option>
                    <option value="monthly">Monthly Mission</option>
                  </select>
                </div>

                <div className="adm-mf-row">
                  <label>Watch Stream Type *</label>
                  <select
                    value={newMissionForm.type}
                    onChange={e => setNewMissionForm(prev => ({ ...prev, type: e.target.value }))}
                    className="adm-mf-input"
                  >
                    <option value="live">Live Stream (Live Session)</option>
                    <option value="video">Uploaded Video (Highlights)</option>
                    <option value="totalLive">Cumulative Live (Weekly / Monthly Total)</option>
                  </select>
                </div>
              </div>

              <div className="adm-mf-row">
                <label>Mission Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Watch Live for 45 Minutes"
                  value={newMissionForm.title}
                  onChange={e => setNewMissionForm(prev => ({ ...prev, title: e.target.value }))}
                  className="adm-mf-input"
                />
              </div>

              <div className="adm-mf-row">
                <label>Description</label>
                <textarea
                  placeholder="e.g. Tune in to Haarsh XO stream and enjoy competitive gameplay."
                  value={newMissionForm.description}
                  onChange={e => setNewMissionForm(prev => ({ ...prev, description: e.target.value }))}
                  className="adm-mf-input adm-mf-textarea"
                  rows={2}
                />
              </div>

              <div className="adm-mf-grid-2">
                <div className="adm-mf-row">
                  <label>Target (in minutes) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newMissionForm.target}
                    onChange={e => setNewMissionForm(prev => ({ ...prev, target: e.target.value }))}
                    className="adm-mf-input"
                  />
                </div>

                <div className="adm-mf-row">
                  <label>Display Target Label <span className="adm-mf-hint">(optional)</span></label>
                  <input
                    type="text"
                    placeholder="e.g. 45 Minutes or 5 Hours (300m)"
                    value={newMissionForm.displayTarget}
                    onChange={e => setNewMissionForm(prev => ({ ...prev, displayTarget: e.target.value }))}
                    className="adm-mf-input"
                  />
                </div>
              </div>

              <div className="adm-mf-rewards-section">
                <p className="adm-mf-rewards-label">Set Manual Reward Payout</p>
                <div className="adm-mf-rewards-grid">
                  <div className="adm-mf-reward-item">
                    <img src="/tokens/xo-coin.png" alt="XO Coin" className="adm-mf-token-img" />
                    <label>XO Coins</label>
                    <input
                      type="number"
                      min={0}
                      value={newMissionForm.coins}
                      onChange={e => setNewMissionForm(prev => ({ ...prev, coins: e.target.value }))}
                      className="adm-mf-input adm-mf-reward-input"
                    />
                  </div>
                  <div className="adm-mf-reward-item">
                    <img src="/tokens/cs-ticket.png" alt="CS Ticket" className="adm-mf-token-img" />
                    <label>CS Tickets</label>
                    <input
                      type="number"
                      min={0}
                      value={newMissionForm.csTickets}
                      onChange={e => setNewMissionForm(prev => ({ ...prev, csTickets: e.target.value }))}
                      className="adm-mf-input adm-mf-reward-input"
                    />
                  </div>
                  <div className="adm-mf-reward-item">
                    <img src="/tokens/br-ticket.png" alt="BR Ticket" className="adm-mf-token-img" />
                    <label>BR Tickets</label>
                    <input
                      type="number"
                      min={0}
                      value={newMissionForm.brTickets}
                      onChange={e => setNewMissionForm(prev => ({ ...prev, brTickets: e.target.value }))}
                      className="adm-mf-input adm-mf-reward-input"
                    />
                  </div>
                </div>
              </div>

              <div className="adm-mf-row adm-mf-toggle-row">
                <label>Mission Status (Active)</label>
                <label className="adm-mf-toggle">
                  <input
                    type="checkbox"
                    checked={newMissionForm.active}
                    onChange={e => setNewMissionForm(prev => ({ ...prev, active: e.target.checked }))}
                  />
                  <span className="adm-mf-toggle-slider" />
                </label>
              </div>

              <div className="adm-mf-actions">
                <button
                  type="button"
                  className="adm-mf-btn cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  <X size={14} /> Cancel
                </button>
                <button
                  type="submit"
                  className="adm-mf-btn save"
                >
                  <Plus size={14} /> Create Mission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── Delete Mission Confirmation Modal ──────────────────────────────── */}
      {deletingMission && (
        <div className="adm-missions__overlay" onClick={() => setDeletingMission(null)}>
          <div className="adm-missions__confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-missions__confirm-icon">
              <AlertTriangle size={28} />
            </div>
            <h3>Delete Mission?</h3>
            <p>
              Are you sure you want to delete <strong>"{deletingMission.title}"</strong> ({FREQ_LABELS[deletingMission.frequency]} Mission)?
              <br />
              This mission will be removed from the public website immediately.
            </p>
            <div className="adm-missions__confirm-actions">
              <button className="adm-missions__confirm-cancel" onClick={() => setDeletingMission(null)}>
                Cancel
              </button>
              <button
                className="adm-missions__confirm-reset"
                onClick={confirmDelete}
              >
                <Trash2 size={14} /> Yes, Delete Mission
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Reset Confirm Modal ────────────────────────────────────────────── */}
      {showResetConfirm && (
        <div className="adm-missions__overlay" onClick={() => setShowResetConfirm(false)}>
          <div className="adm-missions__confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="adm-missions__confirm-icon">
              <RotateCcw size={28} />
            </div>
            <h3>Reset All Missions?</h3>
            <p>
              This will restore all Daily, Weekly, and Monthly missions to their original default values.
              Any custom missions and edits will be permanently lost.
            </p>
            <div className="adm-missions__confirm-actions">
              <button className="adm-missions__confirm-cancel" onClick={() => setShowResetConfirm(false)}>
                Cancel
              </button>
              <button
                className="adm-missions__confirm-reset"
                onClick={() => {
                  resetMissions();
                  setShowResetConfirm(false);
                  showToast('All missions reset to default configuration');
                }}
              >
                <RotateCcw size={14} /> Yes, Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
