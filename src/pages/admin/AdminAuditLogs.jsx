import { useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { 
  FileText, Search, Trash2, Download, 
  Filter, Shield, Clock, CheckCircle2 
} from 'lucide-react';

const AdminAuditLogs = () => {
  const { auditLogs, clearAuditLogs } = useAdmin();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterCat, setFilterCat] = useState('all');

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.adminUser || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCat = filterCat === 'all' || log.category?.toLowerCase() === filterCat.toLowerCase();
    return matchesSearch && matchesCat;
  });

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `haarsh_xo_audit_logs_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="admin-logs-page fade-in">
      <div className="admin-subpage-header">
        <div>
          <h2>📜 System Security & Operational Audit Trail</h2>
          <p className="subpage-desc">Immutable chronological log of all administrative actions, tournament registrations, balance updates, and payment events.</p>
        </div>
        <div className="sub-header-btns">
          <button className="admin-btn btn-secondary" onClick={handleExportJSON}>
            <Download size={15} /> Export Audit Log
          </button>
          <button 
            className="admin-btn btn-danger" 
            onClick={() => {
              if (window.confirm('Clear all audit logs? This action cannot be undone.')) {
                clearAuditLogs();
              }
            }}
          >
            <Trash2 size={15} /> Clear Logs
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="admin-toolbar glass-card">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search action, details, or admin operator..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          {['all', 'tournaments', 'passes', 'codes', 'payments', 'users', 'giveaways', 'announcements'].map(cat => (
            <button 
              key={cat}
              className={`filter-tab ${filterCat === cat ? 'active' : ''}`}
              onClick={() => setFilterCat(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="admin-card glass-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Category</th>
                <th>Action</th>
                <th>Details</th>
                <th>Operator</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-6 text-muted">
                    No audit logs found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="text-muted text-xs whitespace-nowrap">
                      <Clock size={12} className="inline mr-1" />
                      {log.timestamp}
                    </td>
                    <td>
                      <span className={`cat-pill cat-${(log.category || 'system').toLowerCase()}`}>
                        {(log.category || 'SYSTEM').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <code className="action-code">{log.action}</code>
                    </td>
                    <td className="log-details-cell">
                      {log.details}
                    </td>
                    <td>
                      <span className="admin-user-tag">{log.adminUser || 'ADMIN'}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminAuditLogs;
