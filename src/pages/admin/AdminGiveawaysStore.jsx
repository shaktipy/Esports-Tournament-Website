import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import ImageUploadField from '../../components/ImageUploadField';
import { 
  Gift, ShoppingBag, Plus, Edit, Trash2, 
  Sparkles, Award, CheckCircle2, X, Dice5, Coins, Ticket,
  Globe, Swords, Users, Lock, AlertCircle
} from 'lucide-react';

const AdminGiveawaysStore = () => {
  const { 
    giveawaysList, 
    createGiveaway, 
    updateGiveaway, 
    deleteGiveaway, 
    toggleGiveawayStatus,
    drawGiveawayWinner,
    storeRewards,
    createReward,
    updateReward,
    deleteReward
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState('giveaways'); // 'giveaways' | 'store'
  const [giveawayFilter, setGiveawayFilter] = useState('all');   // 'all' | 'main' | 'esports'
  const [storeFilter, setStoreFilter] = useState('all');         // 'all' | 'main' | 'arena'

  // Partitioned data for Giveaways
  const mainGiveaways = giveawaysList.filter(g => (g.category || 'main') !== 'esports');
  const arenaGiveaways = giveawaysList.filter(g => g.category === 'esports');

  // Partitioned data for Store Rewards
  const mainRewards = storeRewards.filter(r => (r.storeType || 'main') !== 'arena');
  const arenaRewards = storeRewards.filter(r => r.storeType === 'arena');

  // Giveaways modal state
  const [showGiveawayModal, setShowGiveawayModal] = useState(false);
  const [editingGiveaway, setEditingGiveaway] = useState(null);
  const [viewingParticipantsGiveaway, setViewingParticipantsGiveaway] = useState(null);
  const [giveawayForm, setGiveawayForm] = useState({
    title: '',
    prize: '',
    category: 'main',
    daysLeft: 7,
    status: 'open',
    image: '',
  });

  // Store Rewards modal state
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [editingReward, setEditingReward] = useState(null);
  const [rewardForm, setRewardForm] = useState({
    title: '',
    storeType: 'main',
    cost: 1000,
    type: 'diamonds',
    description: '',
    image: '',
    tag: 'HOT',
    stock: 100,
    fulfillmentType: 'manual', // 'instant' | 'manual'
    instantCodesRaw: '',       // textarea: one code per line (unused codes only shown)
  });

  // Winner Celebration Banner
  const [justDrawnWinner, setJustDrawnWinner] = useState(null);

  // Giveaway Handlers
  const openCreateGiveaway = (defaultCategory = 'main') => {
    setEditingGiveaway(null);
    setGiveawayForm({
      title: defaultCategory === 'esports' 
        ? '10x CS TOURNAMENT TICKETS GIVEAWAY' 
        : 'Free Fire 5,000 Diamonds Stream Giveaway',
      prize: defaultCategory === 'esports' ? '10x Free CS Registration Tickets' : '5,000 FF Diamonds',
      category: defaultCategory,
      daysLeft: 5,
      status: 'open',
      image: defaultCategory === 'esports' 
        ? '/tokens/cs-ticket.png' 
        : 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop',
    });
    setShowGiveawayModal(true);
  };

  const openEditGiveaway = (g) => {
    setEditingGiveaway(g);
    setGiveawayForm({
      title: g.title,
      prize: g.prize,
      category: g.category || 'main',
      daysLeft: g.daysLeft || 7,
      status: g.status || (g.winner ? 'completed' : 'open'),
      image: g.image || '',
    });
    setShowGiveawayModal(true);
  };

  const handleSaveGiveaway = (e) => {
    e.preventDefault();
    if (!giveawayForm.title.trim()) return;

    if (editingGiveaway) {
      updateGiveaway(editingGiveaway.id, giveawayForm);
    } else {
      createGiveaway(giveawayForm);
    }
    setShowGiveawayModal(false);
  };

  const handleDrawWinner = (giveawayId) => {
    const res = drawGiveawayWinner(giveawayId);
    if (res && res.error === 'NO_PARTICIPANTS') {
      alert('⚠️ No real participants have entered this giveaway yet. Cannot draw a winner.');
      return;
    }
    setJustDrawnWinner(res);
  };

  // Reward Handlers
  const openCreateReward = (defaultStoreType = 'main') => {
    setEditingReward(null);
    setRewardForm({
      title: defaultStoreType === 'arena' 
        ? '2x CS Tournament Tickets Pack' 
        : '520 Free Fire Diamonds Top-Up',
      storeType: defaultStoreType,
      cost: defaultStoreType === 'arena' ? 1200 : 4500,
      type: defaultStoreType === 'arena' ? 'membership' : 'diamonds',
      description: defaultStoreType === 'arena' 
        ? 'Entry tickets pack for Clash Squad esports tournaments.' 
        : 'Direct top-up of 520 FF Diamonds to your connected UID.',
      image: defaultStoreType === 'arena' 
        ? '/tokens/cs-ticket.png' 
        : 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop',
      tag: 'NEW',
      stock: 50,
      fulfillmentType: 'manual',
      instantCodesRaw: '',
    });
    setShowRewardModal(true);
  };

  const openEditReward = (r) => {
    setEditingReward(r);
    // For instant rewards, only show UNUSED codes in textarea (used ones are audit trail)
    const unusedCodesText = (r.instantCodes || [])
      .filter(c => !c.used)
      .map(c => c.code)
      .join('\n');
    setRewardForm({
      title: r.title,
      storeType: r.storeType || 'main',
      cost: r.cost,
      type: r.type || 'diamonds',
      description: r.description || '',
      image: r.image || '',
      tag: r.tag || '',
      stock: r.stock || 0,
      fulfillmentType: r.fulfillmentType || 'manual',
      instantCodesRaw: unusedCodesText,
    });
    setShowRewardModal(true);
  };

  const handleSaveReward = (e) => {
    e.preventDefault();
    if (!rewardForm.title.trim()) return;

    let instantCodes = editingReward?.instantCodes || [];
    if (rewardForm.fulfillmentType === 'instant') {
      const newCodeStrings = rewardForm.instantCodesRaw
        .split('\n')
        .map(c => c.trim())
        .filter(Boolean);
      const usedCodes = instantCodes.filter(c => c.used);
      const usedSet = new Set(usedCodes.map(c => c.code));
      const newUnused = newCodeStrings
        .filter(code => !usedSet.has(code))
        .map(code => ({ code, used: false }));
      instantCodes = [...usedCodes, ...newUnused];
    }

    // Stock always manual — admin controls it
    const stockVal = Number(rewardForm.stock) || 0;
    const saveData = { ...rewardForm, instantCodes, stock: stockVal };

    if (editingReward) {
      updateReward(editingReward.id, saveData);
    } else {
      createReward(saveData);
    }
    setShowRewardModal(false);
  };

  // Render Giveaway Card Component
  const renderGiveawayCard = (g) => {
    const isArena = g.category === 'esports';
    const currentStatus = g.status || (g.winner ? 'completed' : 'open');
    const realParticipantsCount = (g.participantsList || []).length;

    return (
      <div key={g.id} className="admin-giveaway-card glass-card">
        <div className="ag-image-wrap">
          <img src={g.image} alt={g.title} />
          <span className={`ag-category-badge ${isArena ? 'ag-badge-arena' : 'ag-badge-main'}`}>
            {isArena ? '⚔️ ARENA ESPORTS' : '🌐 MAIN SITE'}
          </span>
          <span className={`status-pill status-${currentStatus}`} style={{ position: 'absolute', top: '10px', right: '10px', fontSize: '0.7rem', padding: '3px 8px' }}>
            {currentStatus === 'open' && '🟢 OPEN'}
            {(currentStatus === 'ongoing' || currentStatus === 'live') && '🔴 LIVE'}
            {currentStatus === 'closed' && '🔒 CLOSED'}
            {currentStatus === 'completed' && '🏆 CONCLUDED'}
          </span>
          {g.winner && <span className="winner-tag">WINNER DRAWN</span>}
        </div>

        <div className="ag-body">
          <h3 className="ag-title">{g.title}</h3>
          <div className="ag-prize-highlight">🏆 {g.prize}</div>
          <div className="ag-meta">
            <span>⏳ {g.daysLeft} days remaining</span>
            <span>👥 {realParticipantsCount} verified participant{realParticipantsCount === 1 ? '' : 's'}</span>
          </div>

          {/* Quick Status Toggle Row */}
          <div className="at-status-toggle-bar" style={{ margin: '12px 0 6px 0' }}>
            <span className="status-label">Status:</span>
            <div className="status-btn-group">
              <button 
                type="button"
                className={`status-toggle-btn ${currentStatus === 'open' ? 'selected open' : ''}`}
                onClick={() => toggleGiveawayStatus(g.id, 'open')}
                title="Open for Registration"
              >
                Open
              </button>
              <button 
                type="button"
                className={`status-toggle-btn ${(currentStatus === 'ongoing' || currentStatus === 'live') ? 'selected ongoing' : ''}`}
                onClick={() => toggleGiveawayStatus(g.id, 'ongoing')}
                title="Live Stream In Progress (Entries Locked)"
              >
                Live
              </button>
              <button 
                type="button"
                className={`status-toggle-btn ${currentStatus === 'closed' ? 'selected closed' : ''}`}
                onClick={() => toggleGiveawayStatus(g.id, 'closed')}
                title="Close Registrations"
              >
                Close
              </button>
              <button 
                type="button"
                className={`status-toggle-btn ${currentStatus === 'completed' ? 'selected completed' : ''}`}
                onClick={() => toggleGiveawayStatus(g.id, 'completed')}
                title="Concluded / Winner Declared"
              >
                Done
              </button>
            </div>
          </div>

          {g.winner && (
            <div className="ag-winner-box" style={{ marginTop: '8px' }}>
              <Award size={15} className="text-gold" />
              <span>Winner: <strong>{g.winner.ign}</strong> (UID: {g.winner.uid})</span>
            </div>
          )}
        </div>

        <div className="ag-actions">
          <button 
            type="button"
            className="admin-btn btn-secondary btn-xs"
            onClick={() => setViewingParticipantsGiveaway(g)}
            title="View real registered participants list"
          >
            <Users size={13} /> Entries ({realParticipantsCount})
          </button>
          <button 
            type="button"
            className="admin-btn btn-secondary btn-xs"
            onClick={() => handleDrawWinner(g.id)}
            disabled={realParticipantsCount === 0}
            title={realParticipantsCount === 0 ? "Cannot draw without real entries" : "Pick random winner from real participants"}
            style={realParticipantsCount === 0 ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
          >
            <Dice5 size={13} /> {g.winner ? 'Re-Draw' : 'Draw Winner'}
          </button>
          <button 
            type="button"
            className="admin-btn btn-primary btn-xs"
            onClick={() => openEditGiveaway(g)}
          >
            <Edit size={13} /> Edit
          </button>
          <button 
            type="button"
            className="btn-danger-icon"
            onClick={() => {
              if (window.confirm(`Delete giveaway "${g.title}"?`)) {
                deleteGiveaway(g.id);
              }
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  // Render Reward Card Component
  const renderRewardCard = (reward) => {
    const isArena = reward.storeType === 'arena';
    const isInstant = reward.fulfillmentType === 'instant';
    const totalCodes = (reward.instantCodes || []).length;
    const usedCodes = (reward.instantCodes || []).filter(c => c.used).length;
    const availableCodes = totalCodes - usedCodes;
    const isOutOfStock = reward.stock <= 0 || (isInstant && availableCodes <= 0);

    return (
      <div key={reward.id} className="admin-reward-card glass-card" style={{ opacity: isOutOfStock ? 0.7 : 1 }}>
        <div className="ar-image-wrap">
          <img 
            src={reward.image || 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop'} 
            alt={reward.title}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = 'https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf?q=80&w=2071&auto=format&fit=crop';
            }}
          />
          <span className={`ar-store-badge ${isArena ? 'ar-badge-arena' : 'ar-badge-main'}`}>
            {isArena ? '⚔️ ARENA STORE' : '🌐 MAIN STORE'}
          </span>
          {reward.tag && <span className="ar-tag-badge">{reward.tag}</span>}
          {isOutOfStock && (
            <span style={{
              position: 'absolute', bottom: '8px', left: '8px',
              background: 'rgba(239,68,68,0.9)', color: '#fff',
              fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.5px',
              padding: '3px 8px', borderRadius: '4px'
            }}>OUT OF STOCK</span>
          )}
        </div>

        <div className="ar-body">
          <h3 className="ar-title">{reward.title}</h3>
          <p className="ar-desc">{reward.description}</p>

          {/* Fulfillment type badge */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            <span style={{
              fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px',
              borderRadius: '4px',
              background: isInstant ? 'rgba(16,185,129,0.15)' : 'rgba(148,163,184,0.15)',
              color: isInstant ? '#10b981' : '#94a3b8',
              border: `1px solid ${isInstant ? 'rgba(16,185,129,0.3)' : 'rgba(148,163,184,0.2)'}`,
            }}>
              {isInstant ? '⚡ INSTANT DELIVERY' : '🔧 MANUAL FULFILLMENT'}
            </span>
            {isInstant && (
              <span style={{
                fontSize: '0.7rem', fontWeight: 600, padding: '2px 8px',
                borderRadius: '4px',
                background: availableCodes > 0 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                color: availableCodes > 0 ? '#fbbf24' : '#ef4444',
                border: `1px solid ${availableCodes > 0 ? 'rgba(251,191,36,0.25)' : 'rgba(239,68,68,0.25)'}`
              }}>
                🔑 {availableCodes}/{totalCodes} codes left
              </span>
            )}
          </div>

          <div className="ar-price-row">
            <div className="ar-cost font-bold text-gold">
              🪙 {reward.cost.toLocaleString()} XO Coins
            </div>
            <div className="ar-stock text-muted text-xs">
              Stock: {isInstant ? `${availableCodes} codes` : `${reward.stock} units`}
            </div>
          </div>
        </div>

        <div className="ar-actions">
          <button 
            className="admin-btn btn-primary btn-xs"
            onClick={() => openEditReward(reward)}
          >
            <Edit size={13} /> Edit Item & Price
          </button>
          <button 
            className="btn-danger-icon"
            onClick={() => {
              if (window.confirm(`Delete reward "${reward.title}"?`)) {
                deleteReward(reward.id);
              }
            }}
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="admin-giveaways-store-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>🎁 Giveaways & Rewards Store Operations</h2>
          <p className="subpage-desc">Host community giveaways, pick random winners, and configure items available in the Main & Arena Rewards Stores.</p>
        </div>
        <div className="sub-header-btns">
          {activeSubTab === 'giveaways' ? (
            <>
              <button className="admin-btn btn-secondary" onClick={() => openCreateGiveaway('main')}>
                <Plus size={15} /> Add Main Giveaway
              </button>
              <button className="admin-btn btn-primary" onClick={() => openCreateGiveaway('esports')}>
                <Plus size={15} /> Add Arena Giveaway
              </button>
            </>
          ) : (
            <>
              <button className="admin-btn btn-secondary" onClick={() => openCreateReward('main')}>
                <Plus size={15} /> Add Main Reward
              </button>
              <button className="admin-btn btn-primary" onClick={() => openCreateReward('arena')}>
                <Plus size={15} /> Add Arena Reward
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subtabs Switcher */}
      <div className="admin-subtabs-nav">
        <button 
          className={`subtab-btn ${activeSubTab === 'giveaways' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('giveaways')}
        >
          <Gift size={16} /> Community Giveaways ({giveawaysList.length})
        </button>
        <button 
          className={`subtab-btn ${activeSubTab === 'store' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('store')}
        >
          <ShoppingBag size={16} /> Rewards Store Catalog ({storeRewards.length})
        </button>
      </div>

      {/* Winner Celebration Toast */}
      {justDrawnWinner && (
        <div className="winner-announcement-banner glass-card">
          <div className="w-icon-wrap">
            <Award size={28} className="text-gold" />
          </div>
          <div className="w-info">
            <h4>🎉 Winner Randomly Selected!</h4>
            <p>Player: <strong>{justDrawnWinner.ign}</strong> (Free Fire UID: <code>{justDrawnWinner.uid}</code>) won <strong>{justDrawnWinner.prize}</strong>!</p>
          </div>
          <button className="modal-close-btn" onClick={() => setJustDrawnWinner(null)}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* ─── SECTION 1: Giveaways ─────────────────────────────────────────── */}
      {activeSubTab === 'giveaways' && (
        <div className="fade-in">
          {/* Filter Pills */}
          <div className="section-filter-bar">
            <button 
              className={`filter-chip ${giveawayFilter === 'all' ? 'active' : ''}`}
              onClick={() => setGiveawayFilter('all')}
            >
              🌟 All Giveaways ({giveawaysList.length})
            </button>
            <button 
              className={`filter-chip ${giveawayFilter === 'main' ? 'active' : ''}`}
              onClick={() => setGiveawayFilter('main')}
            >
              <Globe size={14} /> Main Site Giveaways ({mainGiveaways.length})
            </button>
            <button 
              className={`filter-chip ${giveawayFilter === 'esports' ? 'active' : ''}`}
              onClick={() => setGiveawayFilter('esports')}
            >
              <Swords size={14} /> Arena Mode Giveaways ({arenaGiveaways.length})
            </button>
          </div>

          {/* Group 1: Main Site Giveaways */}
          {(giveawayFilter === 'all' || giveawayFilter === 'main') && (
            <div className="category-group-section">
              <div className="category-group-header">
                <div className="cgh-left">
                  <div className="cgh-icon cgh-main">
                    <Globe size={19} />
                  </div>
                  <div>
                    <h3 className="cgh-title">🌐 Main Site Giveaways</h3>
                    <p className="cgh-sub">Giveaways shown on the primary public website (Diamonds, Passes, etc.)</p>
                  </div>
                  <span className="cgh-badge">{mainGiveaways.length} Active</span>
                </div>
                <button className="admin-btn btn-secondary btn-xs" onClick={() => openCreateGiveaway('main')}>
                  <Plus size={13} /> Add Main Giveaway
                </button>
              </div>

              {mainGiveaways.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No Main Site giveaways configured.</p>
                  <button className="admin-btn btn-secondary btn-xs" onClick={() => openCreateGiveaway('main')}>
                    + Create First Main Giveaway
                  </button>
                </div>
              ) : (
                <div className="giveaways-manager-grid">
                  {mainGiveaways.map(g => renderGiveawayCard(g))}
                </div>
              )}
            </div>
          )}

          {/* Group 2: Arena Esports Giveaways */}
          {(giveawayFilter === 'all' || giveawayFilter === 'esports') && (
            <div className="category-group-section">
              <div className="category-group-header">
                <div className="cgh-left">
                  <div className="cgh-icon cgh-arena">
                    <Swords size={19} />
                  </div>
                  <div>
                    <h3 className="cgh-title">⚔️ Arena Mode Giveaways</h3>
                    <p className="cgh-sub">Giveaways shown exclusively in the Esports Arena section (Free Tickets, Passes, etc.)</p>
                  </div>
                  <span className="cgh-badge cgh-badge-arena">{arenaGiveaways.length} Active</span>
                </div>
                <button className="admin-btn btn-primary btn-xs" onClick={() => openCreateGiveaway('esports')}>
                  <Plus size={13} /> Add Arena Giveaway
                </button>
              </div>

              {arenaGiveaways.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No Esports Arena giveaways configured.</p>
                  <button className="admin-btn btn-primary btn-xs" onClick={() => openCreateGiveaway('esports')}>
                    + Create First Arena Giveaway
                  </button>
                </div>
              ) : (
                <div className="giveaways-manager-grid">
                  {arenaGiveaways.map(g => renderGiveawayCard(g))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── SECTION 2: Store Rewards ─────────────────────────────────────── */}
      {activeSubTab === 'store' && (
        <div className="fade-in">
          {/* Filter Pills */}
          <div className="section-filter-bar">
            <button 
              className={`filter-chip ${storeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStoreFilter('all')}
            >
              🌟 All Rewards ({storeRewards.length})
            </button>
            <button 
              className={`filter-chip ${storeFilter === 'main' ? 'active' : ''}`}
              onClick={() => setStoreFilter('main')}
            >
              <Globe size={14} /> Main Site Store ({mainRewards.length})
            </button>
            <button 
              className={`filter-chip ${storeFilter === 'arena' ? 'active' : ''}`}
              onClick={() => setStoreFilter('arena')}
            >
              <Swords size={14} /> Arena Mode Store ({arenaRewards.length})
            </button>
          </div>

          {/* Group 1: Main Site Store */}
          {(storeFilter === 'all' || storeFilter === 'main') && (
            <div className="category-group-section">
              <div className="category-group-header">
                <div className="cgh-left">
                  <div className="cgh-icon cgh-main">
                    <Globe size={19} />
                  </div>
                  <div>
                    <h3 className="cgh-title">🌐 Main Site Store Rewards</h3>
                    <p className="cgh-sub">Items redeemable with XO Coins on the main site Redeem page</p>
                  </div>
                  <span className="cgh-badge">{mainRewards.length} Items</span>
                </div>
                <button className="admin-btn btn-secondary btn-xs" onClick={() => openCreateReward('main')}>
                  <Plus size={13} /> Add Main Reward
                </button>
              </div>

              {mainRewards.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No Main Site store items configured.</p>
                  <button className="admin-btn btn-secondary btn-xs" onClick={() => openCreateReward('main')}>
                    + Create First Main Reward
                  </button>
                </div>
              ) : (
                <div className="store-rewards-grid">
                  {mainRewards.map(reward => renderRewardCard(reward))}
                </div>
              )}
            </div>
          )}

          {/* Group 2: Arena Mode Store */}
          {(storeFilter === 'all' || storeFilter === 'arena') && (
            <div className="category-group-section">
              <div className="category-group-header">
                <div className="cgh-left">
                  <div className="cgh-icon cgh-arena">
                    <Swords size={19} />
                  </div>
                  <div>
                    <h3 className="cgh-title">⚔️ Arena Mode Store Rewards</h3>
                    <p className="cgh-sub">Exclusive tournament tickets &amp; perks redeemable in Esports Arena Shop</p>
                  </div>
                  <span className="cgh-badge cgh-badge-arena">{arenaRewards.length} Items</span>
                </div>
                <button className="admin-btn btn-primary btn-xs" onClick={() => openCreateReward('arena')}>
                  <Plus size={13} /> Add Arena Reward
                </button>
              </div>

              {arenaRewards.length === 0 ? (
                <div className="admin-empty-state">
                  <p>No Arena Store rewards configured.</p>
                  <button className="admin-btn btn-primary btn-xs" onClick={() => openCreateReward('arena')}>
                    + Create First Arena Reward
                  </button>
                </div>
              ) : (
                <div className="store-rewards-grid">
                  {arenaRewards.map(reward => renderRewardCard(reward))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: Create / Edit Giveaway ─────────────────────────────────── */}
      {showGiveawayModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>
                {editingGiveaway 
                  ? '✏️ Edit Giveaway' 
                  : (giveawayForm.category === 'esports' ? '⚔️ Create Arena Giveaway' : '🎁 Create Main Site Giveaway')}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowGiveawayModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveGiveaway} className="modal-form">
              <div className="form-group">
                <label>Giveaway Title *</label>
                <input 
                  type="text" 
                  required
                  value={giveawayForm.title}
                  onChange={e => setGiveawayForm({ ...giveawayForm, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Prize Description *</label>
                  <input 
                    type="text" 
                    required
                    value={giveawayForm.prize}
                    onChange={e => setGiveawayForm({ ...giveawayForm, prize: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Days Duration</label>
                  <input 
                    type="number" 
                    min="1"
                    value={giveawayForm.daysLeft}
                    onChange={e => setGiveawayForm({ ...giveawayForm, daysLeft: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Target Location / Section</label>
                  <select 
                    value={giveawayForm.category}
                    onChange={e => setGiveawayForm({ ...giveawayForm, category: e.target.value })}
                  >
                    <option value="main">🌐 Main Site Giveaways</option>
                    <option value="esports">⚔️ Esports Arena (Ticket Giveaways)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Giveaway Status</label>
                  <select 
                    value={giveawayForm.status || 'open'}
                    onChange={e => setGiveawayForm({ ...giveawayForm, status: e.target.value })}
                  >
                    <option value="open">🟢 Open for Registration</option>
                    <option value="ongoing">🔴 Live (Live Stream In Progress / Locked)</option>
                    <option value="closed">🔒 Registration Closed</option>
                    <option value="completed">🏆 Giveaway Concluded (Winner Declared)</option>
                  </select>
                </div>
              </div>

              <ImageUploadField
                label="Banner Image"
                value={giveawayForm.image}
                onChange={(val) => setGiveawayForm({ ...giveawayForm, image: val })}
              />

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowGiveawayModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingGiveaway ? 'Update Giveaway' : 'Create Giveaway'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Create / Edit Store Reward ─────────────────────────────── */}
      {showRewardModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>
                {editingReward 
                  ? '✏️ Edit Store Reward Item' 
                  : (rewardForm.storeType === 'arena' ? '⚔️ Add Arena Store Reward' : '🛍️ Add Main Store Reward')}
              </h3>
              <button className="modal-close-btn" onClick={() => setShowRewardModal(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveReward} className="modal-form">
              <div className="form-group">
                <label>Item Name *</label>
                <input 
                  type="text" 
                  required
                  value={rewardForm.title}
                  onChange={e => setRewardForm({ ...rewardForm, title: e.target.value })}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Store Placement</label>
                  <select 
                    value={rewardForm.storeType}
                    onChange={e => setRewardForm({ ...rewardForm, storeType: e.target.value })}
                  >
                    <option value="main">🌐 Main Site Store</option>
                    <option value="arena">⚔️ Arena Mode Store</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Fulfillment Type</label>
                  <select
                    value={rewardForm.fulfillmentType}
                    onChange={e => setRewardForm({ ...rewardForm, fulfillmentType: e.target.value })}
                    style={{
                      borderColor: rewardForm.fulfillmentType === 'instant' 
                        ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.15)'
                    }}
                  >
                    <option value="manual">🔧 Manual Fulfillment (Admin delivers)</option>
                    <option value="instant">⚡ Instant Auto-Delivery (Code pool)</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Cost (XO Coins) *</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    value={rewardForm.cost}
                    onChange={e => setRewardForm({ ...rewardForm, cost: e.target.value })}
                  />
                </div>
                {rewardForm.fulfillmentType !== 'instant' ? (
                  <div className="form-group">
                    <label>Inventory Stock</label>
                    <input 
                      type="number"
                      min="0"
                      value={rewardForm.stock}
                      onChange={e => setRewardForm({ ...rewardForm, stock: e.target.value })}
                    />
                  </div>
                ) : (
                  <div className="form-group">
                    <label>Inventory Stock (manual)</label>
                    <input 
                      type="number"
                      min="0"
                      value={rewardForm.stock}
                      onChange={e => setRewardForm({ ...rewardForm, stock: e.target.value })}
                    />
                    <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                      Note: when codes run out, reward auto-shows as out of stock regardless of this value.
                    </span>
                  </div>
                )}
              </div>

              {/* Instant Delivery Code Pool */}
              {rewardForm.fulfillmentType === 'instant' && (
                <div className="form-group" style={{
                  border: '1px solid rgba(16,185,129,0.25)',
                  borderRadius: '8px',
                  padding: '12px',
                  background: 'rgba(16,185,129,0.04)'
                }}>
                  <label style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                    🔑 Instant Delivery Code Pool
                  </label>
                  <textarea
                    rows={5}
                    value={rewardForm.instantCodesRaw}
                    onChange={e => setRewardForm({ ...rewardForm, instantCodesRaw: e.target.value })}
                    placeholder={'Enter one code per line:\nABC-DEF-1234\nXYZ-789-CODE\nHAARSH-XO-001\n\nEach code will be randomly assigned to one user.'}
                    style={{
                      width: '100%', resize: 'vertical', fontFamily: 'monospace',
                      fontSize: '0.85rem', letterSpacing: '0.5px',
                      background: 'rgba(0,0,0,0.3)', color: '#10b981',
                      border: '1px solid rgba(16,185,129,0.3)', borderRadius: '6px',
                      padding: '10px 12px'
                    }}
                  />
                  <div style={{ fontSize: '0.75rem', marginTop: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#10b981', fontWeight: 600 }}>
                      ✅ {rewardForm.instantCodesRaw.split('\n').filter(c => c.trim()).length} available codes entered
                    </span>
                    {editingReward && (
                      <span style={{ color: '#94a3b8' }}>
                        🔒 {(editingReward.instantCodes || []).filter(c => c.used).length} codes already delivered (preserved)
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px' }}>
                    When a user redeems this reward, a random unused code is auto-delivered instantly. Delivered codes are never reused.
                  </p>
                </div>
              )}

              <div className="form-row-2">
                <div className="form-group">
                  <label>Item Category</label>
                  <select 
                    value={rewardForm.type}
                    onChange={e => setRewardForm({ ...rewardForm, type: e.target.value })}
                  >
                    <option value="diamonds">Diamonds Top-Up</option>
                    <option value="giftcard">Google Play Gift Card</option>
                    <option value="membership">Membership Pass / Tickets</option>
                    <option value="merch">Exclusive Merch / Jersey</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Badge Tag</label>
                  <input 
                    type="text" 
                    value={rewardForm.tag}
                    onChange={e => setRewardForm({ ...rewardForm, tag: e.target.value })}
                    placeholder="e.g. HOT, BEST VALUE, LIMITED"
                  />
                </div>
              </div>

              <ImageUploadField
                label="Item Image"
                value={rewardForm.image}
                onChange={(val) => setRewardForm({ ...rewardForm, image: val })}
              />

              <div className="form-group">
                <label>Redeem Instructions / Description</label>
                <textarea 
                  rows="2"
                  value={rewardForm.description}
                  onChange={e => setRewardForm({ ...rewardForm, description: e.target.value })}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setShowRewardModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-primary">
                  {editingReward ? 'Update Item' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: Real Participants List ───────────────────────────────── */}
      {viewingParticipantsGiveaway && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <div>
                <h3>👥 Verified Participants ({viewingParticipantsGiveaway.participantsList?.length || 0})</h3>
                <p className="subpage-desc" style={{ marginTop: '3px' }}>
                  Real community members entered in <strong>{viewingParticipantsGiveaway.title}</strong>
                </p>
              </div>
              <button className="modal-close-btn" onClick={() => setViewingParticipantsGiveaway(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ maxHeight: '420px', overflowY: 'auto', padding: '16px 0' }}>
              {(!viewingParticipantsGiveaway.participantsList || viewingParticipantsGiveaway.participantsList.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px 15px', color: '#64748b' }}>
                  <Users size={36} style={{ opacity: 0.4, margin: '0 auto 10px' }} />
                  <p style={{ margin: 0, fontWeight: 600 }}>No real participants have entered yet.</p>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' }}>
                    When players complete verification tasks and click "Enter Giveaway", they will show up here.
                  </p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>In-Game Name (IGN)</th>
                      <th>Free Fire UID</th>
                      <th>Entry Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingParticipantsGiveaway.participantsList.map((p, idx) => (
                      <tr key={p.id || idx}>
                        <td style={{ color: '#64748b', fontWeight: 700 }}>{idx + 1}</td>
                        <td style={{ fontWeight: 700, color: '#f1f5f9' }}>{p.ign || 'Player'}</td>
                        <td>
                          <code style={{ background: 'rgba(255,255,255,0.06)', padding: '2px 6px', borderRadius: '4px', color: '#38bdf8' }}>
                            {p.uid}
                          </code>
                        </td>
                        <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{p.time || 'Recently'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-actions" style={{ justifyContent: 'flex-end', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button 
                type="button" 
                className="admin-btn btn-secondary" 
                onClick={() => setViewingParticipantsGiveaway(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminGiveawaysStore;
