import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  IndianRupee, Search, Filter, CheckCircle2, 
  RotateCcw, XCircle, ArrowUpRight, ShieldCheck, X, FileText 
} from 'lucide-react';

const AdminPayments = () => {
  const { transactions, updatePaymentStatus } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [refundModalTx, setRefundModalTx] = useState(null);
  const [refundReason, setRefundReason] = useState('');

  // Filter strictly Razorpay payments (excluding any XO coin redemptions)
  const razorpayTx = (transactions || []).filter(t => 
    (t.currency === 'INR' || !t.currency) && 
    t.currency !== 'XO Coins' && 
    !String(t.id).startsWith('tx_store_')
  );

  const capturedTx = razorpayTx.filter(t => t.status === 'captured');
  const totalVolume = capturedTx.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalRefunded = razorpayTx
    .filter(t => t.status === 'refunded')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const filteredTransactions = razorpayTx.filter(t => {
    const matchesSearch = 
      (t.paymentId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.orderId || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.userUid || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.userIgn || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.passTitle || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const handleConfirmRefund = (e) => {
    e.preventDefault();
    if (!refundModalTx) return;
    updatePaymentStatus(refundModalTx.id, 'refunded', refundReason || 'Admin processed refund');
    setRefundModalTx(null);
    setRefundReason('');
  };

  return (
    <div className="admin-payments-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>💳 Razorpay Payments & Refunds Ledger</h2>
          <p className="subpage-desc">Track real-time Razorpay orders, verify HMAC webhook signatures, monitor gateway commissions, and process refunds.</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="admin-kpi-grid">
        <div className="kpi-card glass-card">
          <span className="kpi-title">TOTAL VOLUME CAPTURED</span>
          <div className="kpi-value text-gold">₹{totalVolume.toLocaleString('en-IN')}</div>
          <div className="kpi-meta positive"><CheckCircle2 size={13} /> {capturedTx.length} Successful Payments</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">TOTAL REFUNDED</span>
          <div className="kpi-value text-danger">₹{totalRefunded.toLocaleString('en-IN')}</div>
          <div className="kpi-meta"><RotateCcw size={13} /> Tracked Refunds</div>
        </div>

        <div className="kpi-card glass-card">
          <span className="kpi-title">AVG ORDER VALUE</span>
          <div className="kpi-value text-cyan">
            ₹{capturedTx.length > 0 ? Math.round(totalVolume / capturedTx.length) : 0}
          </div>
          <div className="kpi-meta info">Per Transaction</div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar glass-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search payment ID, order ID, UID, or pass..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <button 
            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            All ({razorpayTx.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'captured' ? 'active' : ''}`}
            onClick={() => setFilterStatus('captured')}
          >
            Captured ({capturedTx.length})
          </button>
          <button 
            className={`filter-tab ${filterStatus === 'refunded' ? 'active' : ''}`}
            onClick={() => setFilterStatus('refunded')}
          >
            Refunded ({razorpayTx.filter(t => t.status === 'refunded').length})
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-card glass-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Payment / Order ID</th>
                <th>Item Purchased</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '48px 24px', color: '#94a3b8' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <IndianRupee size={36} style={{ color: '#eab308', opacity: 0.6 }} />
                      <strong style={{ fontSize: '1.05rem', color: '#f1f5f9' }}>No Razorpay Payments Yet</strong>
                      <p style={{ margin: 0, fontSize: '0.875rem', maxWidth: '440px', lineHeight: '1.4' }}>
                        Real customer payments processed through the Razorpay payment gateway on the public Passes & Pricing portal will automatically be verified and tracked here in real-time.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map(tx => (
                  <tr key={tx.id}>
                    <td>
                      <div className="tx-ids">
                        <code className="pay-id">{tx.paymentId}</code>
                        <span className="order-id-sub">{tx.orderId}</span>
                      </div>
                    </td>
                    <td>
                      <strong>{tx.passTitle}</strong>
                    </td>
                    <td>
                      <div className="tx-customer">
                        <span className="customer-ign">{tx.userIgn || 'Player'}</span>
                        <code className="customer-uid">UID: {tx.userUid}</code>
                      </div>
                    </td>
                    <td>
                      <span className="tx-amount">₹{tx.amount}</span>
                    </td>
                    <td className="text-muted">{tx.createdAt}</td>
                    <td>
                      <span className={`status-pill status-${tx.status}`}>
                        {tx.status.toUpperCase()}
                      </span>
                      {tx.refundReason && <span className="refund-reason-sub">({tx.refundReason})</span>}
                    </td>
                    <td>
                      {tx.status === 'captured' ? (
                        <button 
                          className="admin-btn btn-secondary btn-xs"
                          onClick={() => {
                            setRefundModalTx(tx);
                            setRefundReason('');
                          }}
                          title="Mark payment as refunded"
                        >
                          <RotateCcw size={12} /> Mark Refund
                        </button>
                      ) : (
                        <span className="text-muted text-xs">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ─── Refund Modal ─────────────────────────────────────────────────── */}
      {refundModalTx && (
        <div className="admin-modal-overlay">
          <div className="admin-modal glass-card">
            <div className="modal-header">
              <h3>🔄 Process Payment Refund</h3>
              <button className="modal-close-btn" onClick={() => setRefundModalTx(null)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleConfirmRefund} className="modal-form">
              <div className="refund-summary-box">
                <p>Transaction: <code>{refundModalTx.paymentId}</code></p>
                <p>Amount: <strong>₹{refundModalTx.amount}</strong> for <strong>{refundModalTx.passTitle}</strong></p>
                <p>Customer: <strong>{refundModalTx.userIgn}</strong> (UID: {refundModalTx.userUid})</p>
              </div>

              <div className="form-group">
                <label>Refund Reason *</label>
                <textarea 
                  required
                  rows="3"
                  value={refundReason}
                  onChange={e => setRefundReason(e.target.value)}
                  placeholder="e.g. Customer duplicate charge or accidental purchase request..."
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="admin-btn btn-secondary" onClick={() => setRefundModalTx(null)}>
                  Cancel
                </button>
                <button type="submit" className="admin-btn btn-danger">
                  Confirm Refund
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
